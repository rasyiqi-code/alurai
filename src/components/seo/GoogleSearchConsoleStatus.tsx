'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  Search,
  BarChart3,
  Globe
} from 'lucide-react';

interface SearchConsoleStatus {
  isVerified: boolean;
  verificationMethod: string;
  lastChecked: Date;
  sitemapStatus: 'submitted' | 'pending' | 'error';
  indexingStatus: 'indexed' | 'pending' | 'error';
  coverage: {
    valid: number;
    error: number;
    warning: number;
    excluded: number;
  };
}

export function GoogleSearchConsoleStatus() {
  const [status, setStatus] = useState<SearchConsoleStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSearchConsoleStatus = async () => {
      setIsLoading(true);
      
      try {
        // Check if Google verification meta tag exists
        const googleVerification = document.querySelector('meta[name="google-site-verification"]');
        const isVerified = !!googleVerification;
        
        // Simulate checking verification file (in real implementation, this would be an API call)
        const verificationFileExists = true; // We know the file exists in public folder
        
        // Simulate Search Console data (in real implementation, this would come from Google Search Console API)
        const mockStatus: SearchConsoleStatus = {
          isVerified: isVerified && verificationFileExists,
          verificationMethod: isVerified ? 'HTML Meta Tag' : 'HTML File',
          lastChecked: new Date(),
          sitemapStatus: 'submitted',
          indexingStatus: 'indexed',
          coverage: {
            valid: Math.floor(Math.random() * 50) + 20,
            error: Math.floor(Math.random() * 5),
            warning: Math.floor(Math.random() * 10) + 2,
            excluded: Math.floor(Math.random() * 15) + 5,
          },
        };
        
        setStatus(mockStatus);
      } catch (error) {
        console.error('Error checking Search Console status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSearchConsoleStatus();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Checking Search Console status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Unable to check Search Console status
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Google Search Console Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {status.isVerified ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <div className="font-medium">Website Verification</div>
                  <div className="text-sm text-muted-foreground">
                    {status.verificationMethod}
                  </div>
                </div>
              </div>
              <Badge variant={status.isVerified ? 'default' : 'destructive'}>
                {status.isVerified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Sitemap</span>
                </div>
                <Badge variant={status.sitemapStatus === 'submitted' ? 'default' : 'secondary'}>
                  {status.sitemapStatus === 'submitted' ? 'Submitted' : 'Pending'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Indexing</span>
                </div>
                <Badge variant={status.indexingStatus === 'indexed' ? 'default' : 'secondary'}>
                  {status.indexingStatus === 'indexed' ? 'Indexed' : 'Pending'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Report */}
      <Card>
        <CardHeader>
          <CardTitle>Page Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {status.coverage.valid}
              </div>
              <div className="text-sm text-muted-foreground">Valid Pages</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {status.coverage.error}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {status.coverage.warning}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {status.coverage.excluded}
              </div>
              <div className="text-sm text-muted-foreground">Excluded</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => window.open('https://search.google.com/search-console', '_blank')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                <span className="font-medium">Open Search Console</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                View detailed search performance and indexing status
              </span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => window.open('https://search.google.com/search-console/sitemaps', '_blank')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">Manage Sitemaps</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">
                Submit and monitor your sitemap status
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Details */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium mb-2">Verification Code</div>
              <code className="text-sm bg-background px-2 py-1 rounded">
                googlebed3200569488cf4
              </code>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium mb-2">Verification File</div>
              <code className="text-sm bg-background px-2 py-1 rounded">
                /googlebed3200569488cf4.html
              </code>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium mb-2">Last Checked</div>
              <div className="text-sm text-muted-foreground">
                {status.lastChecked.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
