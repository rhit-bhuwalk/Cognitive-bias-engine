import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Save, 
  Trash2, 
  Eye, 
  Download, 
  Calendar, 
  Brain, 
  Search,
  FolderOpen
} from 'lucide-react';

interface SearchResults {
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
}

interface ThoughtClusterAnalysis {
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
}

interface SavedReport {
  id: string;
  name: string;
  description?: string;
  originalTopic: string;
  transformedQuery: string;
  searchResults: SearchResults;
  thoughtClusterAnalysis: ThoughtClusterAnalysis;
  createdAt: Date;
  tags?: string[];
}

interface ReportsManagerProps {
  onLoadReport: (report: SavedReport) => void;
}

interface SaveReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, tags: string[]) => void;
  defaultName?: string;
}

const SaveReportDialog: React.FC<SaveReportDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultName = ''
}) => {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setDescription('');
      setTagsInput('');
    }
  }, [isOpen, defaultName]);

  const handleSave = () => {
    if (!name.trim()) return;
    
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    onSave(name.trim(), description.trim(), tags);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Search to Report
          </DialogTitle>
          <DialogDescription>
            Save this analysis for future reference and comparison.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Report Name *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Climate Change Analysis"
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this analysis..."
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags (optional)
            </label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="research, climate, bias (comma-separated)"
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ReportsManager: React.FC<ReportsManagerProps> = ({ onLoadReport }) => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isReportsDialogOpen, setIsReportsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    try {
      const savedReports = localStorage.getItem('cognitive-reports');
      if (savedReports) {
        const parsed = JSON.parse(savedReports);
        const reportsWithDates = parsed.map((report: SavedReport & { createdAt: string }) => ({
          ...report,
          createdAt: new Date(report.createdAt)
        }));
        setReports(reportsWithDates);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const deleteReport = (reportId: string) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    setReports(updatedReports);
    localStorage.setItem('cognitive-reports', JSON.stringify(updatedReports));
  };

  const exportReport = (report: SavedReport) => {
    const reportData = {
      ...report,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.originalTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Dialog open={isReportsDialogOpen} onOpenChange={setIsReportsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            My Reports ({reports.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Saved Reports
            </DialogTitle>
            <DialogDescription>
              View, load, or manage your saved cognitive analysis reports.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-2 py-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reports by name, topic, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid gap-3 max-h-[400px] overflow-y-auto">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {reports.length === 0 ? (
                  <div>
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No reports saved yet</p>
                    <p className="text-sm">Start analyzing topics and save your findings as reports.</p>
                  </div>
                ) : (
                  <div>
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No reports match your search criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="border border-gray-200 hover:border-purple-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-medium text-gray-900">
                          {report.name}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {report.originalTopic}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onLoadReport(report)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportReport(report)}
                          className="h-8 px-2"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReport(report.id)}
                          className="h-8 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {report.description && (
                      <p className="text-sm text-gray-700 mb-3">{report.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.createdAt.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {report.thoughtClusterAnalysis?.totalArticlesAnalyzed || 0} articles
                      </div>
                    </div>
                    
                    {report.tags && report.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {report.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const SaveReportButton: React.FC<{
  originalTopic: string;
  transformedQuery: string;
  searchResults: SearchResults;
  thoughtClusterAnalysis: ThoughtClusterAnalysis;
  onSaveComplete: () => void;
}> = ({ 
  originalTopic, 
  transformedQuery, 
  searchResults, 
  thoughtClusterAnalysis,
  onSaveComplete 
}) => {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const handleSave = (name: string, description: string, tags: string[]) => {
    const report: SavedReport = {
      id: Date.now().toString(),
      name,
      description,
      originalTopic,
      transformedQuery,
      searchResults,
      thoughtClusterAnalysis,
      createdAt: new Date(),
      tags
    };

    try {
      const existingReports = localStorage.getItem('cognitive-reports');
      const reports = existingReports ? JSON.parse(existingReports) : [];
      reports.unshift(report); // Add to beginning
      
      localStorage.setItem('cognitive-reports', JSON.stringify(reports));
      onSaveComplete();
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsSaveDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        Save to Report
      </Button>
      
      <SaveReportDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSave}
        defaultName={originalTopic}
      />
    </>
  );
}; 