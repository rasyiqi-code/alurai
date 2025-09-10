'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Globe, 
  Smartphone,
  Zap,
  Search,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { getSEOMonitor, SEOMetric, PerformanceMetrics, SearchConsoleData } from '@/lib/seo-monitor';

export function SEOMonitor() {
  const [metrics, setMetrics] = useState<SEOMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics | null>(null);
  const [searchConsoleData, setSearchConsoleData] = useState<SearchConsoleData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Helper function to get performance status class
  const getPerformanceStatusClass = (value: number, threshold: number) => {
    return value <= threshold ? 'text-green-600' : 'text-red-600';
  };

  useEffect(() => {
    const initializeMonitoring = async () => {
      setIsLoading(true);
      
      try {
        const seoMonitor = getSEOMonitor();
        
        // Get initial metrics
        const initialMetrics = seoMonitor.getMetrics();
        setMetrics(initialMetrics);
        setOverallScore(seoMonitor.getOverallScore());
        
        // Get performance data
        const perfData = seoMonitor.getPerformanceData();
        setPerformanceData(perfData);
        
        // Fetch search console data
        const searchData = await seoMonitor.fetchSearchConsoleData();
        setSearchConsoleData(searchData);
        
        // Set up real-time updates
        const updateInterval = setInterval(() => {
          const updatedMetrics = seoMonitor.getMetrics();
          const updatedScore = seoMonitor.getOverallScore();
          const updatedPerfData = seoMonitor.getPerformanceData();
          
          setMetrics(updatedMetrics);
          setOverallScore(updatedScore);
          setPerformanceData(updatedPerfData);
          setLastUpdated(new Date());
        }, 5000); // Update every 5 seconds
        
        setIsLoading(false);
        
        return () => clearInterval(updateInterval);
      } catch (error) {
        console.error('Error initializing SEO monitoring:', error);
        setIsLoading(false);
      }
    };

    const cleanup = initializeMonitoring();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  const handleRefresh = () => {
    const seoMonitor = getSEOMonitor();
    seoMonitor.refreshMetrics();
    
    const updatedMetrics = seoMonitor.getMetrics();
    const updatedScore = seoMonitor.getOverallScore();
    const updatedPerfData = seoMonitor.getPerformanceData();
    
    setMetrics(updatedMetrics);
    setOverallScore(updatedScore);
    setPerformanceData(updatedPerfData);
    setLastUpdated(new Date());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, score: number) => {
    if (score >= 90) {
      return <Badge className="bg-green-500">Excellent</Badge>;
    } else if (score >= 70) {
      return <Badge className="bg-yellow-500">Good</Badge>;
    } else {
      return <Badge variant="destructive">Needs Improvement</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Analyzing SEO metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              SEO Performance Overview
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
              <span className="text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(overallScore)} mb-2`}>
              {overallScore}/100
            </div>
            <div className="text-2xl font-semibold mb-4">
              {overallScore >= 90 ? 'Excellent' : overallScore >= 70 ? 'Good' : 'Needs Improvement'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ${
                  overallScore >= 90 ? 'bg-green-500' : 
                  overallScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${overallScore}%` }}
              ></div>
            </div>
            <p className="text-muted-foreground">
              Your website is performing excellently across all SEO metrics
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Performance Data */}
      {performanceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Real-time Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(performanceData.lcp)}ms
                </div>
                <div className="text-sm text-muted-foreground">LCP</div>
                <div className={`text-xs ${getPerformanceStatusClass(performanceData.lcp, 2500)}`}>
                  {performanceData.lcp <= 2500 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(performanceData.fid)}ms
                </div>
                <div className="text-sm text-muted-foreground">FID</div>
                <div className={`text-xs ${getPerformanceStatusClass(performanceData.fid, 100)}`}>
                  {performanceData.fid <= 100 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceData.cls.toFixed(3)}
                </div>
                <div className="text-sm text-muted-foreground">CLS</div>
                <div className={`text-xs ${getPerformanceStatusClass(performanceData.cls, 0.1)}`}>
                  {performanceData.cls <= 0.1 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(performanceData.loadTime)}ms
                </div>
                <div className="text-sm text-muted-foreground">Load Time</div>
                <div className={`text-xs ${getPerformanceStatusClass(performanceData.loadTime, 3000)}`}>
                  {performanceData.loadTime <= 3000 ? 'Fast' : 'Slow'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Console Data */}
      {searchConsoleData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Console Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {searchConsoleData.clicks.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Clicks</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {searchConsoleData.impressions.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Impressions</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {searchConsoleData.ctr.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">CTR</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {searchConsoleData.position.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Position</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Top Performing Queries</h4>
              <div className="space-y-2">
                {searchConsoleData.topQueries.map((query, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{query.query}</span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{query.clicks} clicks</span>
                      <span>Pos: {query.position.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="font-medium">{metric.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}/100
                  </span>
                  {getStatusBadge(metric.status, metric.score)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {metric.message}
              </p>
              {metric.recommendation && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 {metric.recommendation}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick SEO Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                <span className="font-medium">Google Search Console</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Monitor search performance and indexing
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4" />
                <span className="font-medium">PageSpeed Insights</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Test page speed and Core Web Vitals
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">Rich Results Test</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Validate structured data markup
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
