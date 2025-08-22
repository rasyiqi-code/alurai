import { getFormsAction, getAnalyticsOverviewAction } from '@/app/actions';
import { Header } from '@/components/header';
import { SubmissionsMenu } from '@/components/submissions-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormFlowData } from '@/lib/types';
import Link from 'next/link';
import { generateMetadata as generateSEOMetadata, metaDescriptions, metaKeywords } from '@/lib/seo-utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Form Submissions',
  description: metaDescriptions.submissions,
  keywords: metaKeywords.submissions,
  path: '/submissions',
  ogImage: '/og-submissions.png',
  twitterImage: '/twitter-submissions.png',
});

export default async function SubmissionsPage() {
  const formsResult = await getFormsAction();
  const overviewResult = await getAnalyticsOverviewAction();

  if ('error' in formsResult || 'error' in overviewResult) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">
                {'error' in formsResult 
                  ? formsResult.error 
                  : 'error' in overviewResult 
                  ? overviewResult.error 
                  : 'An unknown error occurred'
                }
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const forms: FormFlowData[] = formsResult;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <SubmissionsMenu forms={forms} />
      </main>
    </div>
  );
}