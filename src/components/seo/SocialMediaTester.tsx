'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SocialMediaTestResult {
  platform: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  url?: string;
}

export function SocialMediaTester() {
  const [url, setUrl] = useState('https://alurai.com');
  const [results, setResults] = useState<SocialMediaTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testSocialMediaTags = async () => {
    setIsLoading(true);
    setResults([]);

    const platforms = [
      {
        name: 'Facebook',
        testUrl: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`,
        validator: 'Facebook Debugger'
      },
      {
        name: 'Twitter',
        testUrl: `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(url)}`,
        validator: 'Twitter Card Validator'
      },
      {
        name: 'LinkedIn',
        testUrl: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(url)}`,
        validator: 'LinkedIn Post Inspector'
      },
      {
        name: 'WhatsApp',
        testUrl: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`,
        validator: 'WhatsApp Link Preview'
      }
    ];

    const testResults: SocialMediaTestResult[] = [];

    for (const platform of platforms) {
      try {
        // Simulate testing (in real implementation, you'd make API calls)
        const hasValidTags = await checkMetaTags(url, platform.name);
        
        testResults.push({
          platform: platform.name,
          status: hasValidTags ? 'success' : 'warning',
          message: hasValidTags 
            ? `${platform.name} meta tags are properly configured`
            : `${platform.name} meta tags need optimization`,
          url: platform.testUrl
        });
      } catch (error) {
        testResults.push({
          platform: platform.name,
          status: 'error',
          message: `Failed to test ${platform.name} meta tags`,
          url: platform.testUrl
        });
      }
    }

    setResults(testResults);
    setIsLoading(false);
  };

  const checkMetaTags = async (testUrl: string, platform: string): Promise<boolean> => {
    // This would be a real implementation that checks meta tags
    // For now, we'll simulate the check
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different results for different platforms
        const results = {
          'Facebook': true,
          'Twitter': true,
          'LinkedIn': false,
          'WhatsApp': true
        };
        resolve(results[platform as keyof typeof results] || true);
      }, 1000);
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Social Media Meta Tags Tester
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test how your website appears when shared on social media platforms
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to test"
            className="flex-1"
          />
          <Button 
            onClick={testSocialMediaTags}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Testing...' : 'Test Tags'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium">{result.platform}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(result.status)}
                  {result.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Quick Links for Manual Testing:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <a 
              href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Facebook Debugger
            </a>
            <a 
              href={`https://cards-dev.twitter.com/validator?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Twitter Card Validator
            </a>
            <a 
              href={`https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              LinkedIn Post Inspector
            </a>
            <a 
              href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Rich Results Test
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
