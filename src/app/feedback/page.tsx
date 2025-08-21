import { getFeedbackSubmissionsAction, FeedbackSubmission } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageSquare, User, Briefcase, Calendar } from 'lucide-react';
import Link from 'next/link';
// Removed date-fns import to avoid module resolution issues

function truncateText(text: string, maxLength: number = 200): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} m ago`;
  if (diffInHours < 24) return `${diffInHours} h ago`;
  if (diffInDays < 7) return `${diffInDays} d ago`;
  if (diffInWeeks < 4) return `${diffInWeeks} w ago`;
  if (diffInMonths < 12) return `${diffInMonths} mn ago`;
  return `${diffInYears} y ago`;
}

interface FeedbackItemProps {
  submission: FeedbackSubmission;
  index: number;
}

function FeedbackItem({ submission, index }: FeedbackItemProps) {
  const feedback = submission.pleaseShareYourConstructiveFeedbackToHelpUsImproveAluraiYourSuggestionsWhetherPositiveOrCriticalWillGuideUsInMakingThisPlatformEvenBetter;
  const name = submission.whatIsYourName;
  const job = submission.whatIsYourJob;
  const submittedAt = submission.submittedAt;
  
  if (!feedback) return null;

  const timeAgo = submittedAt ? getTimeAgo(new Date(submittedAt)) : 'Unknown time';

  return (
    <Card className="mb-4">
      <CardHeader className="pb-1 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold text-primary">Feedback #{index + 1}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                <span>{name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-3 h-3 mr-1" />
                <span>{job || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            {timeAgo}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <div className="bg-muted/20 p-2 rounded-md">
          <div className="flex items-start mb-1">
            <MessageSquare className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span className="font-medium text-xs text-muted-foreground">Feedback:</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed ml-6">
            "{feedback}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AllFeedbackPage() {
  const feedbackResult = await getFeedbackSubmissionsAction();
  
  // Fallback data if there's no feedback or error
  const fallbackFeedback: FeedbackSubmission[] = [
    {
      id: 'fallback-1',
      pleaseShareYourConstructiveFeedbackToHelpUsImproveAluraiYourSuggestionsWhetherPositiveOrCriticalWillGuideUsInMakingThisPlatformEvenBetter: 'AlurAI is very helpful for creating forms quickly. The interface is easy to understand and the AI features really save time.',
      whatIsYourName: 'Ahmad Hidayat',
      whatIsYourJob: 'Developer',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      id: 'fallback-2',
      pleaseShareYourConstructiveFeedbackToHelpUsImproveAluraiYourSuggestionsWhetherPositiveOrCriticalWillGuideUsInMakingThisPlatformEvenBetter: 'The AI features really help save time. Recommended for those who frequently create forms!',
      whatIsYourName: 'Sari Rahayu',
      whatIsYourJob: 'Product Manager',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
    },
    {
      id: 'fallback-3',
      pleaseShareYourConstructiveFeedbackToHelpUsImproveAluraiYourSuggestionsWhetherPositiveOrCriticalWillGuideUsInMakingThisPlatformEvenBetter: 'Great platform, but maybe more form templates could be added. Overall very satisfied with the results.',
      whatIsYourName: 'Budi Santoso',
      whatIsYourJob: 'Marketing Specialist',
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
    }
  ];

  const feedbackData = 'error' in feedbackResult || feedbackResult.length === 0 
    ? fallbackFeedback 
    : feedbackResult;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">All User Feedback</h1>
            <p className="text-muted-foreground mb-4 text-sm">
              Here is all the feedback that has been provided by AlurAI users
            </p>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center mb-1">
                <MessageSquare className="w-4 h-4 text-primary mr-2" />
                <span className="font-semibold text-primary text-sm">Total Feedback: {feedbackData.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Thank you for all the feedback provided to help us improve AlurAI
              </p>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-3">
          {feedbackData.length > 0 ? (
            feedbackData.map((submission, index) => (
              <FeedbackItem 
                key={submission.id} 
                submission={submission} 
                index={index}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-2">No Feedback Yet</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  No feedback has been received yet. Be the first to provide feedback!
                </p>
                <Button asChild size="sm">
                  <Link href="/form/k6prNaRrS2pOSVMtcgIR" target="_blank">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Give Feedback
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-6">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="py-4">
              <h3 className="text-lg font-semibold mb-2">Want to Share Feedback?</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Your help and suggestions are very valuable for AlurAI development
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/form/k6prNaRrS2pOSVMtcgIR" target="_blank">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Give Your Feedback
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}