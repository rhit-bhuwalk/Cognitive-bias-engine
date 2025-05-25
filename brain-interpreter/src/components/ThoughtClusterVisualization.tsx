import React, { useState } from 'react';
import { BookOpen, Lightbulb, AlertTriangle, Target, Clock, TrendingUp, Zap, Star, MessageCircle, Calendar, UserX, RotateCcw, Filter, Eye, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';

interface BiasCluster {
  cluster: string;
  weight: number;
}

interface AnalyzedSpan {
  text: string;
  clusters: BiasCluster[];
}

interface ArticleAnalysis {
  articleId: string;
  title: string;
  url: string;
  spans: AnalyzedSpan[];
  clusterSummary: Record<string, number>;
  biasSummary: string; // AI-generated summary of biases found
}

interface BiasAnalysis {
  articleAnalyses: ArticleAnalysis[];
  overallClusterSummary: Record<string, number>;
  totalArticlesAnalyzed: number;
}

interface SearchResultArticle {
  id: string;
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
  author: string;
  score: number;
}

interface BiasDetectionVisualizationProps {
  analysis: BiasAnalysis;
  searchResults?: {
    success: boolean;
    query: string;
    totalResults: number;
    articles: SearchResultArticle[];
  };
}

// Icons for each bias type
const biasIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  confirmation_bias: Target,
  anchoring_bias: Zap,
  availability_heuristic: Eye,
  survivorship_bias: TrendingUp,
  sunk_cost_fallacy: Clock,
  halo_effect: Star,
  false_consensus: MessageCircle,
  planning_fallacy: Calendar,
  attribution_error: UserX,
  recency_bias: RotateCcw,
  selection_bias: Filter,
  uncertain: Lightbulb
};

// Colors for each bias type
const biasColors: Record<string, string> = {
  confirmation_bias: '#ef4444',
  anchoring_bias: '#f97316',
  availability_heuristic: '#f59e0b',
  survivorship_bias: '#84cc16',
  sunk_cost_fallacy: '#06b6d4',
  halo_effect: '#8b5cf6',
  false_consensus: '#ec4899',
  planning_fallacy: '#10b981',
  attribution_error: '#6366f1',
  recency_bias: '#14b8a6',
  selection_bias: '#64748b',
  uncertain: '#6b7280'
};

const formatBiasName = (bias: string) => {
  return bias.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const calculateBiasCoverage = (article: ArticleAnalysis, originalContent?: string): { 
  biasedCharacters: number;
  totalCharacters: number;
  coveragePercentage: number;
  biasedSpansCount: number;
  totalSpansCount: number;
} => {
  const biasedSpans = article.spans.filter(span => span.clusters.length > 0);
  const biasedCharacters = biasedSpans.reduce((total, span) => total + span.text.length, 0);
  const totalCharacters = originalContent?.length || article.spans.reduce((total, span) => total + span.text.length, 0);
  
  return {
    biasedCharacters,
    totalCharacters,
    coveragePercentage: totalCharacters > 0 ? (biasedCharacters / totalCharacters) * 100 : 0,
    biasedSpansCount: biasedSpans.length,
    totalSpansCount: article.spans.length
  };
};

export const BiasDetectionVisualization: React.FC<BiasDetectionVisualizationProps> = ({ analysis, searchResults }) => {
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [showAllArticles, setShowAllArticles] = useState(false);

  const toggleArticleExpansion = (articleId: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  // Filter out uncertain bias from overall summary
  const filteredOverallSummary = Object.fromEntries(
    Object.entries(analysis.overallClusterSummary).filter(([bias]) => bias !== 'uncertain')
  );
  
  const totalWeight = Object.values(filteredOverallSummary).reduce((a, b) => a + b, 0);
  const sortedBiases = Object.entries(filteredOverallSummary)
    .sort(([,a], [,b]) => b - a);

  const maxWeight = Math.max(...Object.values(filteredOverallSummary));

  // Calculate overall bias coverage across all articles
  const overallBiasCoverage = analysis.articleAnalyses.reduce((acc, article) => {
    const originalArticle = searchResults?.articles.find(a => 
      a.title === article.title || a.url === article.url
    );
    const coverage = calculateBiasCoverage(article, originalArticle?.content);
    
    return {
      totalBiasedCharacters: acc.totalBiasedCharacters + coverage.biasedCharacters,
      totalCharacters: acc.totalCharacters + coverage.totalCharacters,
      totalBiasedSpans: acc.totalBiasedSpans + coverage.biasedSpansCount,
      totalSpans: acc.totalSpans + coverage.totalSpansCount
    };
  }, { totalBiasedCharacters: 0, totalCharacters: 0, totalBiasedSpans: 0, totalSpans: 0 });

  const overallCoveragePercentage = overallBiasCoverage.totalCharacters > 0 
    ? (overallBiasCoverage.totalBiasedCharacters / overallBiasCoverage.totalCharacters) * 100 
    : 0;

  const articlesToShow = showAllArticles ? analysis.articleAnalyses : analysis.articleAnalyses.slice(0, 6);

  return (
    <div className="w-full space-y-6">
      {/* Overall Cognitive Bias Landscape Bar Chart */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Cognitive Bias Detection Overview
        </h3>
        
        {/* Overall Bias Coverage Stats */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overall Bias Coverage
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Text with Biases</p>
              <p className="font-bold text-lg text-red-600">{overallCoveragePercentage.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-600">Biased Characters</p>
              <p className="font-bold">{overallBiasCoverage.totalBiasedCharacters.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Characters</p>
              <p className="font-bold">{overallBiasCoverage.totalCharacters.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Biased Spans</p>
              <p className="font-bold">{overallBiasCoverage.totalBiasedSpans} / {overallBiasCoverage.totalSpans}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sortedBiases.map(([bias, weight]) => {
            const Icon = biasIcons[bias] || Lightbulb;
            const percentage = (weight / totalWeight) * 100;
            const barWidth = (weight / maxWeight) * 100;
            
            return (
              <div key={bias} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-48">
                  <Icon 
                    className="h-4 w-4 flex-shrink-0" 
                    style={{ color: biasColors[bias] }}
                  />
                  <span className="text-sm font-medium truncate">
                    {formatBiasName(bias)}
                  </span>
                </div>
                
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className="h-6 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${barWidth}%`, 
                      backgroundColor: biasColors[bias] 
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">
                    {weight.toFixed(2)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Article Analysis Grid */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Detailed Bias Analysis by Article ({analysis.totalArticlesAnalyzed} articles)
          </h3>
          {analysis.articleAnalyses.length > 6 && (
            <button
              onClick={() => setShowAllArticles(!showAllArticles)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showAllArticles ? 'Show Less' : 'Show All Articles'}
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {articlesToShow.map((article, index) => {
            const isExpanded = expandedArticles.has(article.articleId);
            const originalArticle = searchResults?.articles.find(a => 
              a.title === article.title || a.url === article.url
            );
            const biasCoverage = calculateBiasCoverage(article, originalArticle?.content);
            
            // Filter out uncertain bias from article summary
            const filteredClusterSummary = Object.fromEntries(
              Object.entries(article.clusterSummary).filter(([bias]) => bias !== 'uncertain')
            );
            
            const allBiases = Object.entries(filteredClusterSummary)
              .sort(([,a], [,b]) => b - a);
            
            return (
              <div key={article.articleId} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleArticleExpansion(article.articleId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="truncate">
                          {index + 1}. {article.title}
                        </span>
                      </h4>
                      
                      {/* Bias Coverage for this article */}
                      <div className="flex items-center gap-4 mb-2 text-xs text-gray-600">
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                          {biasCoverage.coveragePercentage.toFixed(1)}% biased text
                        </span>
                        <span>{biasCoverage.biasedSpansCount}/{biasCoverage.totalSpansCount} spans with bias</span>
                        <span>{allBiases.length} bias types detected</span>
                      </div>
                      
                      {!isExpanded && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {allBiases.slice(0, 3).map(([bias, weight]) => {
                            const Icon = biasIcons[bias] || Lightbulb;
                            return (
                              <span 
                                key={bias}
                                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                <Icon 
                                  className="h-3 w-3" 
                                  style={{ color: biasColors[bias] }}
                                />
                                {formatBiasName(bias)} ({weight.toFixed(2)})
                              </span>
                            );
                          })}
                          {allBiases.length > 3 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{allBiases.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Bias Summary Preview (collapsed view) */}
                      {!isExpanded && article.biasSummary && (
                        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                          <p className="text-amber-800 italic">
                            <strong>Bias Summary:</strong> {article.biasSummary.length > 120 ? `${article.biasSummary.substring(0, 120)}...` : article.biasSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read article →
                  </a>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    {/* Bias Summary (expanded view) */}
                    {article.biasSummary && (
                      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded">
                        <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-600" />
                          Claude&apos;s Bias Analysis Summary
                        </h5>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          {article.biasSummary}
                        </p>
                      </div>
                    )}

                    {/* All Detected Biases */}
                    <div className="mb-6">
                      <h5 className="font-medium text-sm mb-3">All Detected Cognitive Biases ({allBiases.length})</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {allBiases.map(([bias, weight]) => {
                          const Icon = biasIcons[bias] || Lightbulb;
                          return (
                            <div key={bias} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex items-center gap-2">
                                <Icon 
                                  className="h-3 w-3" 
                                  style={{ color: biasColors[bias] }}
                                />
                                <span className="text-xs font-medium">
                                  {formatBiasName(bias)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-600 font-mono">
                                {weight.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Individual Spans */}
                    <div>
                      <h5 className="font-medium text-sm mb-3">
                        Text Spans Analysis ({article.spans.length} spans, {biasCoverage.biasedSpansCount} with biases)
                      </h5>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {article.spans.map((span, spanIndex) => (
                          <div 
                            key={spanIndex} 
                            className={`p-3 rounded border text-xs ${
                              span.clusters.length > 0 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <p className="text-gray-800 mb-2 leading-relaxed">
                              &ldquo;{span.text}&rdquo;
                            </p>
                            {span.clusters.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {span.clusters.map((cluster, clusterIndex) => {
                                  const Icon = biasIcons[cluster.cluster] || Lightbulb;
                                  return (
                                    <span 
                                      key={clusterIndex}
                                      className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded"
                                    >
                                      <Icon 
                                        className="h-3 w-3" 
                                        style={{ color: biasColors[cluster.cluster] }}
                                      />
                                      {formatBiasName(cluster.cluster)} ({cluster.weight.toFixed(2)})
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            {span.clusters.length === 0 && (
                              <p className="text-gray-500 italic">No biases detected in this span</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bias Detection Insights */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Bias Detection Insights
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Most prevalent bias:</strong> {formatBiasName(sortedBiases[0]?.[0] || 'unknown')} 
            ({((sortedBiases[0]?.[1] || 0) / totalWeight * 100).toFixed(1)}% of all detected biases)
          </p>
          <p>
            <strong>Bias variety:</strong> {sortedBiases.length} different cognitive biases detected
          </p>
          <p>
            <strong>Overall bias coverage:</strong> {overallCoveragePercentage.toFixed(1)}% of analyzed text contains cognitive biases
          </p>
          <p>
            <strong>Analysis coverage:</strong> {overallBiasCoverage.totalSpans} text spans analyzed ({overallBiasCoverage.totalBiasedSpans} with detected biases)
          </p>
        </div>
      </div>
    </div>
  );
}; 