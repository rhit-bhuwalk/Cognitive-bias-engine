import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Read the system prompt for thought-cluster analysis
const getSystemPrompt = () => {
  try {
    const promptPath = path.join(process.cwd(), '..', 'prompts', 'system_prompts.md');
    return fs.readFileSync(promptPath, 'utf8');
  } catch (error) {
    console.error('Error reading system prompt:', error);
    throw new Error('Failed to load system prompt');
  }
};

// Interface for thought cluster analysis
interface ThoughtCluster {
  cluster: string;
  weight: number;
}

interface AnalyzedSpan {
  text: string;
  clusters: ThoughtCluster[];
}

interface ArticleAnalysis {
  articleId: string;
  title: string;
  url: string;
  spans: AnalyzedSpan[];
  clusterSummary: Record<string, number>; // Total weights per cluster across the article
  biasSummary: string; // AI-generated summary of biases found
}

// Parse Claude's response to extract thought clusters
const parseThoughtClusters = (responseText: string): AnalyzedSpan[] => {
  const spans: AnalyzedSpan[] = [];
  
  console.log('=== PARSING CLAUDE RESPONSE ===');
  console.log('Response text length:', responseText.length);
  console.log('Looking for pattern: text<cluster:weight,cluster:weight>');
  
  // Regex to match text followed by cluster tags
  const spanRegex = /([^<]+)<([^>]+)>/g;
  let match;
  let matchCount = 0;
  
  while ((match = spanRegex.exec(responseText)) !== null) {
    matchCount++;
    const text = match[1].trim();
    const clustersStr = match[2];
    
    console.log(`Match ${matchCount}:`);
    console.log(`  Text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
    console.log(`  Clusters string: "${clustersStr}"`);
    
    // Parse cluster:weight pairs
    const clusters: ThoughtCluster[] = [];
    const clusterPairs = clustersStr.split(',').map(s => s.trim());
    
    for (const pair of clusterPairs) {
      const [cluster, weightStr] = pair.split(':').map(s => s.trim());
      const weight = parseFloat(weightStr);
      
      if (cluster && !isNaN(weight)) {
        clusters.push({ cluster, weight });
        console.log(`    Parsed cluster: ${cluster} (weight: ${weight})`);
      } else {
        console.log(`    Failed to parse: "${pair}" -> cluster: "${cluster}", weight: "${weightStr}"`);
      }
    }
    
    if (text && clusters.length > 0) {
      spans.push({ text, clusters });
      console.log(`    Added span with ${clusters.length} clusters`);
    } else {
      console.log(`    Skipped span (text: ${!!text}, clusters: ${clusters.length})`);
    }
  }
  
  console.log(`=== PARSING COMPLETE: ${matchCount} matches found, ${spans.length} spans created ===`);
  
  return spans;
};

// Calculate cluster summary for an article
const calculateClusterSummary = (spans: AnalyzedSpan[]): Record<string, number> => {
  const summary: Record<string, number> = {};
  
  for (const span of spans) {
    for (const cluster of span.clusters) {
      summary[cluster.cluster] = (summary[cluster.cluster] || 0) + cluster.weight;
    }
  }
  
  return summary;
};

// Generate bias summary for an article
const generateBiasSummary = async (articleTitle: string, spans: AnalyzedSpan[], clusterSummary: Record<string, number>): Promise<string> => {
  try {
    if (spans.length === 0 || Object.keys(clusterSummary).length === 0) {
      return "No significant cognitive biases detected in this article.";
    }

    // Create a structured summary of biases found
    const biasDetails = spans.map(span => {
      const clustersStr = span.clusters.map(c => `${c.cluster} (${c.weight})`).join(', ');
      return `"${span.text.substring(0, 100)}${span.text.length > 100 ? '...' : ''}" - ${clustersStr}`;
    }).join('\n');

    const summaryPrompt = `Based on the cognitive bias analysis below, provide a concise summary (2-3 sentences) of the main biases found in this article titled "${articleTitle}".

Focus on:
- The most prevalent biases (by weight)
- How these biases might affect the credibility or interpretation of the article
- Be specific but concise

Bias Analysis:
${Object.entries(clusterSummary)
  .sort(([,a], [,b]) => b - a)
  .map(([bias, weight]) => `${bias}: ${weight.toFixed(2)}`)
  .join('\n')}

Detailed spans:
${biasDetails}

Provide only the summary, no additional commentary.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      temperature: 0.3,
      system: "You are an expert in cognitive bias analysis. Provide clear, concise summaries of bias patterns found in articles.",
      messages: [
        {
          role: "user",
          content: summaryPrompt
        }
      ]
    });

    return message.content[0]?.type === 'text' ? message.content[0].text.trim() : "Unable to generate bias summary.";
  } catch (error) {
    console.error('Error generating bias summary:', error);
    return "Error generating bias summary for this article.";
  }
};

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();
    
    if (!topic) {
      return Response.json(
        { error: "Topic is required" }, 
        { status: 400 }
      );
    }

    console.log(`Analyzing topic: "${topic}"`);

    // Transform the user's topic using LLM
    const transformationPrompt = `You are a research assistant specializing in cognitive landscape analysis. 
Transform the following user topic into a comprehensive search query that will help gather diverse perspectives and in-depth information for cognitive analysis.

The search query should:
- Capture multiple angles and perspectives on the topic
- Include relevant academic, practical, and theoretical viewpoints
- Be specific enough to find high-quality sources
- Consider both current developments and foundational concepts

User topic: "${topic}"

Return only the transformed search query, nothing else.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      temperature: 0.7,
      system: "You are a research assistant that transforms user topics into comprehensive search queries for cognitive analysis.",
      messages: [
        {
          role: "user",
          content: transformationPrompt
        }
      ]
    });

    const transformedQuery = message.content[0]?.type === 'text' ? message.content[0].text.trim() : '';
    
    if (!transformedQuery) {
      throw new Error("Failed to transform query");
    }

    console.log(`Transformed query: "${transformedQuery}"`);

    // Call the search API with the transformed query
    const searchResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: transformedQuery,
        numResults: 20 // Reduced for thought-cluster analysis
      })
    });

    if (!searchResponse.ok) {
      throw new Error(`Search API failed: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    
    // Get the system prompt for thought-cluster analysis
    const systemPrompt = getSystemPrompt();
    
    // Log the system prompt being used
    console.log('\n=== SYSTEM PROMPT FOR CLAUDE ANALYSIS ===');
    console.log(systemPrompt);
    console.log('=== END SYSTEM PROMPT ===\n');
    
    // Analyze each article for thought clusters
    const articleAnalyses: ArticleAnalysis[] = [];
    
    console.log(`Starting thought-cluster analysis for ${searchData.articles?.length || 0} articles`);
    
    for (const article of searchData.articles || []) {
      try {
        // Skip articles with very little content
        if (!article.content || article.content.length < 100) {
          console.log(`Skipping article "${article.title}" - insufficient content`);
          continue;
        }
        
        console.log(`Analyzing article: "${article.title}"`);
        
        // Send article content to Claude with introspective system prompt
        const stream = anthropic.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 64000,
          temperature: 0.3,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: `Please analyze the following article and provide introspective thought-cluster tags according to your system prompt:\n\n"${article.title}"\n\n${article.content}` // Limit content length
            }
          ]
        });
        
        let analysisText = '';
        stream.on('text', (text) => {
          analysisText += text;
        });
        
        await stream.finalMessage();
        
        // Add detailed logging of Claude's output
        console.log(`\n=== CLAUDE OUTPUT FOR "${article.title}" ===`);
        console.log('Raw Claude Response:');
        console.log(analysisText);
        console.log('=== END RAW RESPONSE ===\n');
        
        if (analysisText) {
          const spans = parseThoughtClusters(analysisText);
          const clusterSummary = calculateClusterSummary(spans);
          
          // Log parsed results
          console.log(`Parsed ${spans.length} spans from Claude's response:`);
          spans.forEach((span, index) => {
            console.log(`  Span ${index + 1}: "${span.text.substring(0, 100)}${span.text.length > 100 ? '...' : ''}"`);
            console.log(`    Clusters: ${JSON.stringify(span.clusters)}`);
          });
          console.log(`Cluster summary: ${JSON.stringify(clusterSummary)}`);
          console.log('---\n');
          
          const biasSummary = await generateBiasSummary(article.title, spans, clusterSummary);
          
          articleAnalyses.push({
            articleId: article.id,
            title: article.title,
            url: article.url,
            spans,
            clusterSummary,
            biasSummary
          });
          
          console.log(`Completed analysis for "${article.title}" - found ${spans.length} spans`);
        } else {
          console.log(`No analysis text received for "${article.title}"`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error analyzing article "${article.title}":`, error);
        // Continue with other articles
      }
    }

    // Calculate overall thought-cluster distribution across all articles
    const overallClusterSummary: Record<string, number> = {};
    for (const analysis of articleAnalyses) {
      for (const [cluster, weight] of Object.entries(analysis.clusterSummary)) {
        overallClusterSummary[cluster] = (overallClusterSummary[cluster] || 0) + weight;
      }
    }

    console.log(`Thought-cluster analysis complete for ${articleAnalyses.length} articles`);

    // Return the results with thought-cluster analysis
    return Response.json({
      success: true,
      originalTopic: topic,
      transformedQuery: transformedQuery,
      searchResults: searchData,
      thoughtClusterAnalysis: {
        articleAnalyses,
        overallClusterSummary,
        totalArticlesAnalyzed: articleAnalyses.length
      }
    });

  } catch (error) {
    console.error("Analysis error:", error);
    
    return Response.json(
      { 
        error: "Failed to analyze topic",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
} 