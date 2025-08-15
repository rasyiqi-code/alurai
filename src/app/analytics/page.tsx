import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline">Analytics</h1>
        </div>
        <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                 <BarChart className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline">Coming Soon!</CardTitle>
                 <CardDescription>
                    We're working hard to bring you detailed analytics and submission insights.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Stay tuned for updates.</p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
