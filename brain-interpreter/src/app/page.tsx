"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Send, User, Bot, Loader2, Search, Lightbulb, BookOpen } from 'lucide-react';
import { BiasDetectionVisualization } from '@/components/ThoughtClusterVisualization';
import { ReportsManager, SaveReportButton } from '@/components/ReportsManager';

// Chat message type
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  originalTopic?: string;
  transformedQuery?: string;
  searchResults?: {
    success: boolean;
    query: string;
    totalResults: number;
    articles: Array<{
      id: string;
      title: string;
      url: string;
      content: string;
      publishedDate?: string;
      author: string;
      score: number;
    }>;
  };
  thoughtClusterAnalysis?: {
    articleAnalyses: Array<{
      articleId: string;
      title: string;
      url: string;
      spans: Array<{
        text: string;
        clusters: Array<{
          cluster: string;
          weight: number;
        }>;
      }>;
      clusterSummary: Record<string, number>;
      biasSummary: string;
    }>;
    overallClusterSummary: Record<string, number>;
    totalArticlesAnalyzed: number;
  };
  isThinking?: boolean;
  analysisSteps?: AnalysisStep[];
}

interface AnalysisStep {
  id: string;
  step: string;
  status: 'pending' | 'in-progress' | 'completed';
  details?: string;
  icon: string;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysisSteps, setCurrentAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [reportSaveNotification, setReportSaveNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAnalysisSteps]);

  useEffect(() => {
    if (reportSaveNotification) {
      const timer = setTimeout(() => {
        setReportSaveNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [reportSaveNotification]);

  const updateAnalysisStep = (stepId: string, status: 'pending' | 'in-progress' | 'completed', details?: string) => {
    setCurrentAnalysisSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, status, details: details || step.details }
          : step
      )
    );
  };

  const handleLoadReport = (report: {
    id: string;
    name: string;
    description?: string;
    originalTopic: string;
    transformedQuery: string;
    searchResults: ChatMessage['searchResults'];
    thoughtClusterAnalysis: ChatMessage['thoughtClusterAnalysis'];
    createdAt: Date | string;
    tags?: string[];
  }) => {
    // Clear existing messages and add the loaded report as a new assistant message
    const loadedMessage: ChatMessage = {
      id: `loaded-${Date.now()}`,
      role: 'assistant',
      content: `# 📁 Loaded Report: ${report.name}

**Original Topic:** "${report.originalTopic}"

## 🤔 AI Thinking Process
The AI transformed your topic into a more comprehensive search query to gather diverse perspectives:

**Transformed Query:** "${report.transformedQuery}"

## 📚 Knowledge Discovery
Found **${report.searchResults?.totalResults || 0}** relevant articles from across the web.
Successfully analyzed **${report.thoughtClusterAnalysis?.totalArticlesAnalyzed || 0}** articles for cognitive patterns.

## 🧩 Thought-Cluster Analysis

${report.thoughtClusterAnalysis ? `
### Overall Cognitive Landscape:
${Object.entries(report.thoughtClusterAnalysis!.overallClusterSummary)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .map(([cluster, weight]) => 
    `**${cluster.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}**: ${(weight as number).toFixed(2)} (${((weight as number / (Object.values(report.thoughtClusterAnalysis!.overallClusterSummary) as number[]).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`
  ).join('\n')}

### Article-by-Article Analysis:
${report.thoughtClusterAnalysis!.articleAnalyses.slice(0, 5).map((analysis: {
  title: string;
  url: string;
  clusterSummary: Record<string, number>;
}, index: number) => `
**${index + 1}. ${analysis.title}**
*Dominant thought patterns:*
${Object.entries(analysis.clusterSummary)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 3)
  .map(([cluster, weight]) => 
    `• ${cluster.replace(/_/g, ' ')}: ${(weight as number).toFixed(2)}`
  ).join('\n')}
[🔗 Read more](${analysis.url})
`).join('\n')}

${report.thoughtClusterAnalysis!.articleAnalyses.length > 5 ? `\n*... and ${report.thoughtClusterAnalysis!.articleAnalyses.length - 5} more articles analyzed*` : ''}
` : 'No thought-cluster analysis available.'}

## 💡 Cognitive Insights
*This is a loaded report from ${new Date(report.createdAt).toLocaleDateString()}*

The analysis reveals the dominant cognitive patterns in how this topic is discussed across multiple sources. This gives us insight into the mental frameworks and thinking patterns associated with "${report.originalTopic}".

${report.description ? `\n**Report Notes:** ${report.description}` : ''}`,
      timestamp: new Date(),
      originalTopic: report.originalTopic,
      transformedQuery: report.transformedQuery,
      searchResults: report.searchResults,
      thoughtClusterAnalysis: report.thoughtClusterAnalysis
    };

    setMessages([loadedMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentTopic = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Initialize analysis steps
    const analysisSteps: AnalysisStep[] = [
      { id: '1', step: 'Understanding your topic', status: 'pending', icon: 'brain' },
      { id: '2', step: 'AI is thinking and transforming query', status: 'pending', icon: 'lightbulb' },
      { id: '3', step: 'Searching for relevant articles', status: 'pending', icon: 'search' },
      { id: '4', step: 'Analyzing thought clusters in articles', status: 'pending', icon: 'book' },
      { id: '5', step: 'Building cognitive landscape map', status: 'pending', icon: 'brain' }
    ];

    setCurrentAnalysisSteps(analysisSteps);

    // Add thinking message
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isThinking: true,
      analysisSteps
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Step 1: Understanding topic
      updateAnalysisStep('1', 'in-progress');
      await new Promise(resolve => setTimeout(resolve, 800));
      updateAnalysisStep('1', 'completed', `Analyzing: "${currentTopic}"`);

      // Step 2: AI transformation
      updateAnalysisStep('2', 'in-progress');
      
      // Call the analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: currentTopic })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      updateAnalysisStep('2', 'completed', `Query transformed: "${data.transformedQuery}"`);
      
      // Step 3: Searching
      updateAnalysisStep('3', 'in-progress');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateAnalysisStep('3', 'completed', `Found ${data.searchResults?.totalResults || 0} articles`);
      
      // Step 4: Analysis
      updateAnalysisStep('4', 'in-progress');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateAnalysisStep('4', 'completed', `Analyzed ${data.thoughtClusterAnalysis?.totalArticlesAnalyzed || 0} articles for thought patterns`);
      
      // Step 5: Building cognitive map
      updateAnalysisStep('5', 'in-progress');
      await new Promise(resolve => setTimeout(resolve, 800));
      updateAnalysisStep('5', 'completed', 'Cognitive landscape map generated');

      // Remove thinking message and add final result
      setMessages(prev => prev.filter(msg => !msg.isThinking));
      setCurrentAnalysisSteps([]);

      // Create detailed assistant response with thought-cluster analysis
      const thoughtClusterAnalysis = data.thoughtClusterAnalysis;
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `# Cognitive Analysis Complete! 🧠

**Original Topic:** "${data.originalTopic}"

## 🤔 AI Thinking Process
The AI transformed your topic into a more comprehensive search query to gather diverse perspectives:

**Transformed Query:** "${data.transformedQuery}"

## 📚 Knowledge Discovery
Found **${data.searchResults?.totalResults || 0}** relevant articles from across the web.
Successfully analyzed **${thoughtClusterAnalysis?.totalArticlesAnalyzed || 0}** articles for cognitive patterns.

## 🧩 Thought-Cluster Analysis

${thoughtClusterAnalysis ? `
### Overall Cognitive Landscape:
${Object.entries(thoughtClusterAnalysis.overallClusterSummary)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .map(([cluster, weight]) => 
    `**${cluster.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}**: ${(weight as number).toFixed(2)} (${((weight as number / (Object.values(thoughtClusterAnalysis.overallClusterSummary) as number[]).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`
  ).join('\n')}

### Article-by-Article Analysis:
${thoughtClusterAnalysis.articleAnalyses.slice(0, 5).map((analysis: typeof thoughtClusterAnalysis.articleAnalyses[0], index: number) => `
**${index + 1}. ${analysis.title}**
*Dominant thought patterns:*
${Object.entries(analysis.clusterSummary)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 3)
  .map(([cluster, weight]) => 
    `• ${cluster.replace(/_/g, ' ')}: ${(weight as number).toFixed(2)}`
  ).join('\n')}
[🔗 Read more](${analysis.url})
`).join('\n')}

${thoughtClusterAnalysis.articleAnalyses.length > 5 ? `\n*... and ${thoughtClusterAnalysis.articleAnalyses.length - 5} more articles analyzed*` : ''}
` : 'No thought-cluster analysis available.'}

## 💡 Cognitive Insights
The analysis reveals the dominant cognitive patterns in how this topic is discussed across multiple sources. This gives us insight into the mental frameworks and thinking patterns associated with "${currentTopic}".

Would you like me to dive deeper into any specific cognitive pattern or explore related topics?`,
        timestamp: new Date(),
        originalTopic: data.originalTopic,
        transformedQuery: data.transformedQuery,
        searchResults: data.searchResults,
        thoughtClusterAnalysis: data.thoughtClusterAnalysis
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Remove thinking message and add error
      setMessages(prev => prev.filter(msg => !msg.isThinking));
      setCurrentAnalysisSteps([]);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `# ❌ Analysis Error

Sorry, I encountered an error while analyzing the topic **"${currentTopic}"**. 

**Error Details:** ${error instanceof Error ? error.message : 'Unknown error occurred'}

Please try again or rephrase your topic. The system might be temporarily unavailable.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (iconName: string, className: string = "h-4 w-4") => {
    switch (iconName) {
      case 'brain': return <Brain className={className} />;
      case 'lightbulb': return <Lightbulb className={className} />;
      case 'search': return <Search className={className} />;
      case 'book': return <BookOpen className={className} />;
      default: return <Brain className={className} />;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Cognitive Blindspot Engine
              </h1>
            </div>
            
            {/* Reports Manager */}
            <div className="flex items-center gap-3">
              <ReportsManager onLoadReport={handleLoadReport} />
            </div>
          </div>
        </div>
      </div>

      {/* Report Save Notification */}
      {reportSaveNotification && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 text-center">
          {reportSaveNotification}
        </div>
      )}

      {/* Chat Interface - Full Width */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 max-w-6xl mx-auto w-full">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center max-w-md">
                <Brain className="h-16 w-16 mx-auto mb-6 text-purple-600" />
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Welcome to Cognitive Blindspot Engine
                </h2>
                <p className="text-lg mb-4">An engine designed to analyse the cognitive landscape of a given topic</p>
                <p className="text-sm">
                  Please type in a topic you&apos;d like to explore
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-5xl mx-auto">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.isThinking ? (
                    // Thinking/Analysis Progress Display
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                            AI Analysis in Progress...
                          </h3>
                          <div className="space-y-3">
                            {currentAnalysisSteps.map((step) => (
                              <div key={step.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  step.status === 'completed' ? 'bg-green-100 text-green-600' :
                                  step.status === 'in-progress' ? 'bg-purple-100 text-purple-600' :
                                  'bg-gray-100 text-gray-400'
                                }`}>
                                  {step.status === 'completed' ? (
                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                  ) : step.status === 'in-progress' ? (
                                    renderIcon(step.icon, "h-4 w-4")
                                  ) : (
                                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium ${
                                    step.status === 'completed' ? 'text-green-700 dark:text-green-400' :
                                    step.status === 'in-progress' ? 'text-purple-700 dark:text-purple-400' :
                                    'text-gray-500'
                                  }`}>
                                    {step.step}
                                  </p>
                                  {step.details && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {step.details}
                                    </p>
                                  )}
                                </div>
                                {step.status === 'in-progress' && (
                                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Regular Message Display
                    <div
                      className={`flex items-start gap-4 ${
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-600 text-white'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </div>
                      <div className={`flex-1 max-w-[90%] ${
                        message.role === 'user' ? 'text-right' : ''
                      }`}>
                        <div className={`inline-block p-4 rounded-xl ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}>
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            {message.content.split('\n').map((line, index) => {
                              if (line.startsWith('# ')) {
                                return <h1 key={index} className="text-xl font-bold mb-3 text-current">{line.substring(2)}</h1>;
                              } else if (line.startsWith('## ')) {
                                return <h2 key={index} className="text-lg font-semibold mb-2 mt-4 text-current">{line.substring(3)}</h2>;
                              } else if (line.startsWith('### ')) {
                                return <h3 key={index} className="text-base font-medium mb-2 mt-3 text-current">{line.substring(4)}</h3>;
                              } else if (line.includes('**') && line.split('**').length > 1) {
                                // Handle bold text within lines
                                const parts = line.split('**');
                                return (
                                  <p key={index} className="mb-1 text-current leading-relaxed">
                                    {parts.map((part, partIndex) => 
                                      partIndex % 2 === 1 ? 
                                        <strong key={partIndex}>{part}</strong> : 
                                        part
                                    )}
                                  </p>
                                );
                              } else if (line.trim() === '') {
                                return <br key={index} />;
                              } else {
                                return <p key={index} className="mb-1 text-current leading-relaxed">{line}</p>;
                              }
                            })}
                          </div>
                        </div>
                        
                        {/* Show thought cluster visualization if available */}
                        {message.thoughtClusterAnalysis && (
                          <div className="mt-4">
                            <BiasDetectionVisualization 
                              analysis={message.thoughtClusterAnalysis} 
                              searchResults={message.searchResults}
                            />
                          </div>
                        )}

                        {/* Save to Report Button for assistant messages with analysis */}
                        {message.role === 'assistant' && 
                         message.originalTopic && 
                         message.transformedQuery && 
                         message.searchResults && 
                         message.thoughtClusterAnalysis && (
                          <div className="mt-3 flex justify-end">
                            <SaveReportButton
                              originalTopic={message.originalTopic}
                              transformedQuery={message.transformedQuery}
                              searchResults={message.searchResults}
                              thoughtClusterAnalysis={message.thoughtClusterAnalysis}
                              onSaveComplete={() => setReportSaveNotification('Report saved successfully!')}
                            />
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="border-t bg-white dark:bg-gray-800 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a topic to analyze..."
                  className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={1}
                  style={{ minHeight: '52px', maxHeight: '200px' }}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="lg"
                className="h-[52px] px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Enter a topic to begin cognitive analysis • Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
