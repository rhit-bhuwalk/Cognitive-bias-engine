# Cognitive Bias Detection System

## Overview

The Cognitive Blindspot Engine now includes a sophisticated bias detection system that processes articles through Claude's introspective system prompt to identify and map cognitive bias patterns.

## How It Works

### 1. Topic Transformation
- User enters a topic of interest
- Claude transforms the topic into a comprehensive search query
- The query is designed to capture multiple perspectives and viewpoints

### 2. Article Search
- Uses Exa API to search for relevant articles across the web
- Retrieves up to 10 high-quality articles with substantial content
- Filters out articles with insufficient content (< 100 characters)

### 3. Cognitive Bias Analysis
- Each article is processed through Claude with the introspective system prompt
- Claude analyzes the content and tags text spans with cognitive biases
- Cognitive biases represent different patterns like:
  - `confirmation_bias`: Seeking/interpreting info to confirm existing beliefs
  - `anchoring_bias`: Over-relying on first piece of information encountered
  - `availability_heuristic`: Judging likelihood by easily recalled examples
  - `survivorship_bias`: Focusing on successes while ignoring failures
  - `sunk_cost_fallacy`: Continuing poor decisions due to past investment
  - `halo_effect`: Letting one positive trait influence overall judgment
  - `false_consensus`: Assuming others share your opinions more than they do
  - `planning_fallacy`: Underestimating time/costs/risks of future actions
  - `attribution_error`: Blaming others' behavior on character vs. circumstances
  - `recency_bias`: Giving more weight to recent events
  - `selection_bias`: Drawing conclusions from non-representative samples

### 4. Pattern Mapping
- Each cognitive bias is assigned a weight indicating its prominence
- Weights are aggregated across all articles to create an overall bias landscape
- Individual article analyses show dominant bias patterns per source

### 5. Visualization
- Interactive bar charts show the overall bias distribution
- Article-by-article breakdown with dominant bias patterns
- Color-coded icons for each cognitive bias type
- Clickable links to original sources

## API Structure

### `/api/analyze` (POST)
**Input:**
```json
{
  "topic": "artificial intelligence ethics"
}
```

**Output:**
```json
{
  "success": true,
  "originalTopic": "artificial intelligence ethics",
  "transformedQuery": "AI ethics moral frameworks algorithmic bias...",
  "searchResults": { ... },
  "thoughtClusterAnalysis": {
    "articleAnalyses": [
      {
        "articleId": "article_0",
        "title": "The Ethics of AI Development",
        "url": "https://example.com/article",
        "spans": [
          {
            "text": "AI systems must be designed with fairness in mind",
            "clusters": [
              { "cluster": "confirmation_bias", "weight": 0.8 },
              { "cluster": "halo_effect", "weight": 0.2 }
            ]
          }
        ],
        "clusterSummary": {
          "confirmation_bias": 2.4,
          "halo_effect": 1.8,
          "anchoring_bias": 1.2
        }
      }
    ],
    "overallClusterSummary": {
      "confirmation_bias": 15.6,
      "halo_effect": 12.3,
      "anchoring_bias": 8.7
    },
    "totalArticlesAnalyzed": 8
  }
}
```

## Frontend Components

### `BiasDetectionVisualization`
A React component that renders:
- **Cognitive Bias Detection Overview**: Bar chart of all detected biases with percentages
- **Bias Analysis by Article**: Individual article breakdowns with top bias patterns
- **Bias Detection Insights**: Summary statistics and key findings

### Integration
The visualization automatically appears below the text response when bias detection analysis data is available.

## Configuration

### Required Environment Variables
```bash
# Anthropic API Key for Claude analysis
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Exa API Key for web search
EXA_API_KEY=your_exa_api_key_here

# Application URL for internal API calls
NEXTAUTH_URL=http://localhost:3000
```

### System Prompt
The system uses the introspective prompt from `prompts/system_prompts.md` to guide Claude's bias detection analysis of each article.

## Usage Example

1. Enter a topic: "climate change adaptation"
2. System transforms to: "climate change adaptation strategies resilience planning urban infrastructure..."
3. Searches and finds 10 relevant articles
4. Analyzes each article for cognitive bias patterns
5. Displays results showing dominant biases like:
   - `confirmation_bias` (40%) - seeking evidence that supports pre-existing climate views
   - `availability_heuristic` (25%) - recent extreme weather events influencing perception
   - `planning_fallacy` (20%) - underestimating adaptation timeline and costs
   - `survivorship_bias` (15%) - focusing on successful adaptation cases while ignoring failures

## Benefits

- **Bias Awareness**: Understand cognitive biases present in topic discussions
- **Critical Thinking**: Identify potential blind spots in reasoning
- **Pattern Recognition**: See recurring bias patterns across multiple sources
- **Research Quality**: Discover potential biases affecting information interpretation

## Technical Details

- **Rate Limiting**: 500ms delay between article analyses to avoid API limits
- **Content Filtering**: Articles with < 100 characters are skipped
- **Content Truncation**: Article content limited to 1500 characters for analysis
- **Error Handling**: Individual article failures don't stop the overall analysis
- **Responsive Design**: Visualization adapts to different screen sizes 