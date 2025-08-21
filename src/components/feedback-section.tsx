import { getFeedbackSubmissionsAction, FeedbackSubmission } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';



function truncateText(text: string, maxLength: number = 120): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

interface FeedbackCardProps {
  submission: FeedbackSubmission;
}

function FeedbackCard({ submission }: FeedbackCardProps) {
  const feedback = submission.pleaseShareYourConstructiveFeedbackToHelpUsImproveAluraiYourSuggestionsWhetherPositiveOrCriticalWillGuideUsInMakingThisPlatformEvenBetter;
  const name = submission.whatIsYourName;
  const job = submission.whatIsYourJob;
  
  if (!feedback) return null;

  return (
    <div className="bg-card p-6 rounded-lg border">
      <p className="text-muted-foreground mb-4">
        "{truncateText(feedback)}"
      </p>
      <div>
        <p className="font-medium">{name || 'Anonymous'}</p>
        <p className="text-sm text-muted-foreground">{job || 'User'}</p>
      </div>
    </div>
  );
}

export async function FeedbackSection() {
  const feedbackResult = await getFeedbackSubmissionsAction();
  
  // Fallback data if there's no feedback or error
  const fallbackFeedback = [
    {
      id: 'fallback-1',
      pleaseShareYourConstructiveFeedbackToHelpUsImproveAluraiYourSuggestionsWhetherPositiveOrCriticalWillGuideUsInMakingThisPlatformEvenBetter: 'AlurAI is very helpful for creating forms quickly. The interface is easy to understand.',
      whatIsYourName: 'Ahmad H.',
      whatIsYourJob: 'Developer',
      submittedAt: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      pleaseShareYourConstructiveFeedbackToHelpUsImproveAluraiYourSuggestionsWhetherPositiveOrCriticalWillGuideUsInMakingThisPlatformEvenBetter: 'The AI features really help save time. Recommended!',
      whatIsYourName: 'Sari R.',
      whatIsYourJob: 'Product Manager',
      submittedAt: new Date().toISOString()
    }
  ];

  const feedbackData = 'error' in feedbackResult || feedbackResult.length === 0 
    ? fallbackFeedback 
    : feedbackResult;

  // Get maximum 4 feedback to display
  const displayFeedback = feedbackData.slice(0, 4);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Share Your Experience
          </h2>
          <p className="text-muted-foreground mb-8">
            Help us improve by sharing your feedback about AlurAI
          </p>
          
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <Link href="/form/k6prNaRrS2pOSVMtcgIR" target="_blank">
              <MessageSquare className="mr-2 h-5 w-5" />
              Give Feedback
            </Link>
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-center mb-8">Recent User Feedback</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayFeedback.map((submission) => (
              <FeedbackCard key={submission.id} submission={submission} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/feedback" className="text-blue-600 hover:text-blue-700 font-medium">
              View all feedback submissions →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}