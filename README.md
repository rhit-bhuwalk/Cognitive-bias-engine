# Cognitive Bias Engine

A sophisticated AI-powered system that analyzes cognitive biases and thought patterns in online content. This engine transforms any topic into a comprehensive research query, searches across the web for relevant articles, and provides deep analysis of the cognitive biases and thinking patterns present in the discourse.

## 🎯 What It Does

The Cognitive Bias Engine helps you understand the **cognitive landscape** around any topic by:

1. **Intelligent Query Transformation**: Uses Claude 3.5 Sonnet to transform your topic into optimized search queries that capture multiple perspectives
2. **Web-Scale Research**: Searches across the web using Exa API to find high-quality, relevant articles
3. **Cognitive Bias Detection**: Analyzes each article to identify and quantify 11 different cognitive bias patterns
4. **Pattern Visualization**: Creates interactive visualizations showing bias distributions and thought patterns
5. **Report Management**: Save and reload complete analysis reports for future reference

## 🧠 Detected Cognitive Biases

The system identifies and analyzes these cognitive bias patterns:

- **Confirmation Bias**: Seeking information that confirms existing beliefs
- **Anchoring Bias**: Over-relying on first information encountered
- **Availability Heuristic**: Judging likelihood by easily recalled examples
- **Survivorship Bias**: Focusing on successes while ignoring failures
- **Sunk Cost Fallacy**: Continuing poor decisions due to past investment
- **Halo Effect**: Letting one positive trait influence overall judgment
- **False Consensus**: Assuming others share your opinions more than they do
- **Planning Fallacy**: Underestimating time/costs/risks of future actions
- **Attribution Error**: Blaming others' behavior on character vs. circumstances
- **Recency Bias**: Giving more weight to recent events
- **Selection Bias**: Drawing conclusions from non-representative samples

## ⚡ Key Features

### Real-Time Analysis Pipeline
- **Multi-step Processing**: Visual progress tracking through transformation, search, and analysis phases
- **Live Updates**: Real-time status updates as articles are processed
- **Error Resilience**: Individual article failures don't stop the overall analysis

### Interactive Visualizations
- **Bias Distribution Charts**: Bar charts showing overall bias patterns with percentages
- **Article-by-Article Breakdown**: Detailed analysis of each source with dominant bias patterns
- **Clickable Sources**: Direct links to original articles for verification

### Report Management System
- **Save Analysis Reports**: Store complete analyses with custom names and descriptions
- **Tag Organization**: Organize reports with custom tags
- **Quick Reload**: Instantly load previous analyses without re-running the pipeline

### Responsive Design
- **Mobile-Friendly**: Optimized for all screen sizes
- **Dark/Light Themes**: Adaptive UI based on system preferences
- **Accessible**: Screen reader compatible with proper ARIA labels

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Anthropic API key (for Claude 3.5 Sonnet)
- Exa API key (for web search)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/rhit-bhuwalk/Cognitive-bias-engine.git
cd Cognitive-bias-engine
```

2. **Navigate to the brain-interpreter directory**:
```bash
cd brain-interpreter
```

3. **Install dependencies**:
```bash
npm install
```

4. **Set up environment variables**:
Create a `.env.local` file:
```bash
# Anthropic API Key for Claude 3.5 Sonnet
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Exa API Key for web search
EXA_API_KEY=your_exa_api_key_here

# Next.js URL (for internal API calls)
NEXTAUTH_URL=http://localhost:3000
```

5. **Run the development server**:
```bash
npm run dev
```

6. **Open the application**:
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 How It Works

### 1. Topic Input & Transformation
- Enter any topic you want to analyze
- Claude 3.5 Sonnet transforms it into a comprehensive search query
- The transformation captures multiple perspectives and reduces search bias

### 2. Web Search & Article Collection
- Exa API searches across the web for relevant, high-quality articles
- Filters out low-quality content (articles with < 100 characters)
- Retrieves up to 10 substantial articles for analysis

### 3. Cognitive Bias Analysis
- Each article is processed through Claude with specialized prompts
- Text spans are analyzed and tagged with cognitive bias patterns
- Bias weights are calculated based on prominence and context

### 4. Pattern Aggregation & Visualization
- Individual article analyses are aggregated into overall patterns
- Interactive charts show bias distribution across all sources
- Article-by-article breakdowns reveal source-specific patterns

## 📊 Example Analysis

**Topic**: "artificial intelligence ethics"

**Transformed Query**: "AI ethics moral frameworks algorithmic bias fairness transparency accountability machine learning"

**Results**: 
- **Confirmation Bias** (35%): Sources seeking evidence for pre-existing AI views
- **Halo Effect** (22%): Positive AI applications influencing overall judgment
- **Availability Heuristic** (18%): Recent AI incidents affecting perception
- **Planning Fallacy** (15%): Underestimating AI development timelines
- **Other Biases** (10%): Various other cognitive patterns

## 🛠 Technical Architecture

### Frontend (Next.js 14)
- **React Components**: Modular UI components with TypeScript
- **Tailwind CSS**: Responsive, utility-first styling
- **Chart.js**: Interactive data visualizations
- **Lucide Icons**: Consistent iconography

### Backend APIs
- **`/api/analyze`**: Main analysis pipeline endpoint
- **`/api/search`**: Direct search functionality
- **Rate Limiting**: 500ms delays between article analyses

### External Services
- **Anthropic Claude 3.5 Sonnet**: Query transformation and bias analysis
- **Exa API**: Web search and article retrieval
- **Local Storage**: Report persistence and management

## 📝 Project Structure

```
cognitive-bias-engine/
├── brain-interpreter/          # Next.js application
│   ├── src/
│   │   ├── app/               # App router pages and API routes
│   │   ├── components/        # React components
│   │   └── lib/              # Utilities and data processing
│   ├── public/               # Static assets
│   └── package.json          # Dependencies and scripts
├── prompts/                  # System prompts for AI analysis
├── label_thoughts.py         # Python utility for thought labeling
└── README.md                # This file
```

## 🎓 Cognitive Functions Reference

The system also includes a comprehensive mapping of cognitive functions to brain regions:

1. **Working Memory** (Dorsolateral Prefrontal Cortex)
2. **Semantic Retrieval** (Left Temporal Lobe)
3. **Logical Reasoning** (Left Prefrontal Cortex)
4. **Pattern Recognition** (Parietal Cortex)
5. **Analogical Reasoning** (Right Hemisphere + Angular Gyrus)
6. **Error Monitoring** (Anterior Cingulate Cortex)
7. **Planning/Sequencing** (Frontal Cortex)
8. **Evaluation/Judgment** (Orbitofrontal Cortex)
9. **Creative Synthesis** (Right Hemisphere Networks)
10. **Attention Control** (Parietal + Frontal Networks)

## 🚧 Future Development

- [ ] Brain region visualization and mapping
- [ ] Real-time streaming of cognitive processes
- [ ] Enhanced clustering algorithms
- [ ] Export functionality for reports
- [ ] API rate limiting optimization
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Repository**: https://github.com/rhit-bhuwalk/Cognitive-bias-engine
- **Documentation**: See `THOUGHT_CLUSTER_ANALYSIS.md` for detailed technical documentation
- **Issues**: Report bugs or request features in the GitHub Issues section

---

**Built with** ❤️ using Next.js, Claude 3.5 Sonnet, and modern web technologies.