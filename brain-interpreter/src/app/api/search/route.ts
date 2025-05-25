// app/api/search/route.js
import Exa from "exa-js";
import { NextRequest } from "next/server";

const exa = new Exa(process.env.EXA_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { query, numResults = 50 } = await request.json();
    
    if (!query) {
      return Response.json(
        { error: "Query is required" }, 
        { status: 400 }
      );
    }

    console.log(`Searching for: "${query}" with ${numResults} results`);

    // Use searchAndContents to get both search results and their text content
    const results = await exa.searchAndContents(query, {
      text: { 
        maxCharacters: 5000, // Get more substantial content for analysis
        includeHtmlTags: false // Clean text only
      },
      numResults: numResults * 2, // Get more results to filter from
      startPublishedDate: "2020-01-01", // Focus on recent content
      type: "neural", // Use neural search for better semantic matching
      includeDomains: [
        // Academic sources
        "arxiv.org",
        "researchgate.net", 
        "pubmed.ncbi.nlm.nih.gov",
        "ieee.org",
        "acm.org",
        "springer.com",
        "sciencedirect.com",
        "wiley.com",
        "nature.com",
        "science.org",
        "cell.com",
        "pnas.org",
        // News and analysis
        "medium.com",
        "substack.com", 
        "*.gov",
        "scientificamerican.com",
        "newscientist.com",
        "wired.com",
        "arstechnica.com",
        "techcrunch.com",
        "theverge.com",
        "vox.com",
        "theatlantic.com",
        "newyorker.com",
        "washingtonpost.com",
        "nytimes.com",
        "economist.com",
        "guardian.com",
        "bbc.com",
        "cnn.com",
        "npr.org"
      ]
    });

    // Filter and transform results for our cognitive analysis
    const filteredArticles = results.results
      .filter(result => {
        // Filter out articles with insufficient content
        const hasSubstantialContent = result.text && result.text.length > 500;
        
        // Filter out obvious abstract-only pages but keep full papers
        const isNotJustAbstract = !(result.title?.toLowerCase().includes('abstract') && result.text.length < 1000) &&
                                 !result.url.includes('/abstract?') && // Query param abstracts
                                 !(result.url.includes('arxiv.org') && result.text.length < 500); // Short arxiv pages
        
        // Filter out social media and forum posts
        const isNotSocial = !result.url.includes('reddit.com') &&
                           !result.url.includes('twitter.com') &&
                           !result.url.includes('facebook.com') &&
                           !result.url.includes('linkedin.com');
        
        // Ensure it's substantive content (more lenient for academic papers)
        const hasGoodContent = result.text && 
                              result.text.split(' ').length > 50 && // At least 50 words (papers can be dense)
                              result.text.split('. ').length > 3;   // At least 3 sentences
        
        return hasSubstantialContent && isNotJustAbstract && isNotSocial && hasGoodContent;
      })
      .slice(0, numResults) // Take only the requested number after filtering
      .map((result, index) => ({
        id: `article_${index}`,
        title: result.title,
        url: result.url,
        content: result.text || "",
        publishedDate: result.publishedDate,
        author: result.author || "Unknown",
        score: result.score || 0,
        wordCount: result.text ? result.text.split(' ').length : 0
      }));

    console.log(`Found ${filteredArticles.length} high-quality articles after filtering from ${results.results.length} total results`);
    
    return Response.json({
      success: true,
      query: query,
      totalResults: filteredArticles.length,
      articles: filteredArticles,
      debug: {
        originalResults: results.results.length,
        filteredResults: filteredArticles.length,
        averageWordCount: filteredArticles.length > 0 
          ? Math.round(filteredArticles.reduce((sum, a) => sum + a.wordCount, 0) / filteredArticles.length)
          : 0
      }
    });

  } catch (error) {
    console.error("Exa search error:", error);
    
    return Response.json(
      { 
        error: "Failed to search articles",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}

// Optional: Add GET method for simple testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return Response.json(
      { error: "Query parameter 'q' is required" }, 
      { status: 400 }
    );
  }

  // Redirect to POST method logic
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ query }),
    headers: { 'Content-Type': 'application/json' }
  }));
}