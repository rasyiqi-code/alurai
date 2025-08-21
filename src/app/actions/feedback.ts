'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export interface FeedbackSubmission {
  id: string;
  pleaseShareYourConstructiveFeedbackToHelpUsImproveAluraiYourSuggestionsWhetherPositiveOrCriticalWillGuideUsInMakingThisPlatformEvenBetter?: string;
  whatIsYourName?: string;
  whatIsYourJob?: string;
  submittedAt: string;
}

export async function getFeedbackSubmissionsAction(): Promise<FeedbackSubmission[] | { error: string }> {
  try {
    const feedbackFormId = 'k6prNaRrS2pOSVMtcgIR';
    const submissionsCollection = collection(db, 'forms', feedbackFormId, 'submissions');
    const q = query(submissionsCollection, orderBy('submittedAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    
    const submissions: FeedbackSubmission[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        pleaseShareYourConstructiveFeedbackToHelpUsImproveAluraiYourSuggestionsWhetherPositiveOrCriticalWillGuideUsInMakingThisPlatformEvenBetter: data.pleaseShareYourConstructiveFeedbackToHelpUsImproveAluraiYourSuggestionsWhetherPositiveOrCriticalWillGuideUsInMakingThisPlatformEvenBetter || '',
        whatIsYourName: data.whatIsYourName || '',
        whatIsYourJob: data.whatIsYourJob || '',
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });

    return submissions;
  } catch (error) {
    console.error('Error fetching feedback submissions:', error);
    return { error: 'Failed to fetch feedback submissions.' };
  }
}