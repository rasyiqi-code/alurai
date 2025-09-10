'use server';

import { generateFormFlowFromDescription } from '@/ai/flows/form-generator';
import { suggestImprovementsToFormFlow } from '@/ai/flows/form-flow-optimization';
import { validateAnswer } from '@/ai/flows/answer-validator';
import { extractKeyValuePairs } from '@/ai/flows/extract-key-value-pairs';
import { FormFlowData, FormAnswers, FormField, ExtractedPair } from '@/lib/types';
import { toCamelCase } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, setDoc, addDoc, collection, getDocs, getDoc, Timestamp, orderBy, query, where, limit, collectionGroup,getCountFromServer } from 'firebase/firestore';
import { stackServerApp } from '@/stack';
import { SubscriptionService } from '@/lib/subscription-service';
import { generatePresignedUploadUrl } from '@/lib/minio';


export async function generateFormAction(description: string): Promise<string | { error: string }> {
  try {
    const result = await generateFormFlowFromDescription({ description });
    console.log('AI Generator result:', result);
    
    if (!result.formFlow) {
      return { error: 'AI generator returned empty result' };
    }
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(result.formFlow);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw formFlow:', result.formFlow);
      return { error: 'Invalid JSON format from AI generator' };
    }

    if (!parsedResult.title || !parsedResult.flow || !Array.isArray(parsedResult.flow)) {
      return { error: 'Invalid form structure from AI generator' };
    }

    // Add id and key to each field
    const flowWithIds = parsedResult.flow.map((field: any, index: number) => ({
      ...field,
      id: crypto.randomUUID(),
      key: toCamelCase(field.question) || `field${index + 1}`,
    }));

    const finalData: FormFlowData = {
      title: parsedResult.title,
      flow: flowWithIds,
      status: 'draft',
    }
    
    return JSON.stringify(finalData);
  } catch (error) {
    console.error('Form generation error:', error);
    return { error: 'Failed to generate form. Please try again.' };
  }
}

export async function optimizeFormAction(formFlowDefinition: string): Promise<string | { error: string }> {
  try {
    const result = await suggestImprovementsToFormFlow({ formFlowDefinition });
    return result.suggestions;
  } catch (error) {
    console.error(error);
    return { error: 'Failed to get optimization suggestions. Please try again.' };
  }
}

export async function parseDataForSuggestionsAction(inputData: string): Promise<ExtractedPair[] | { error: string }> {
  try {
    const result = await extractKeyValuePairs({ text: inputData });
    return result.pairs;
  } catch (error) {
    console.error('Error parsing data for suggestions:', error);
    return { error: 'Failed to extract information from the text. Please try again.' };
  }
}


export async function saveFormAction(formFlowData: FormFlowData): Promise<{ id: string } | { error: string }> {
  try {
    // Get current user
    const user = await stackServerApp.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const { id, submissionCount, ...dataToSave } = formFlowData;
    
    if (id) {
      // Update existing document - verify ownership first
      const formRef = doc(db, 'forms', id);
      const formDoc = await getDoc(formRef);
      
      if (!formDoc.exists()) {
        return { error: 'Form not found' };
      }
      
      const formData = formDoc.data();
      if (formData.userId !== user.id) {
        return { error: 'Unauthorized to update this form' };
      }
      
      const updateData = { ...dataToSave, updatedAt: new Date() };
      await setDoc(formRef, updateData, { merge: true });
      return { id };
    } else {
      // Check if user can create a new form
      const canCreate = await SubscriptionService.canPerformAction(user.id, 'create_form', 1);
      if (!canCreate.allowed) {
        return { error: canCreate.reason || 'Form limit exceeded' };
      }

      // Create new document with userId
      const createData = { 
        ...dataToSave, 
        createdAt: new Date(),
        userId: user.id
      };
      createData.slug = ''; // Initialize slug for new forms
      createData.status = 'draft';
      const docRef = await addDoc(collection(db, 'forms'), createData);
      
      // Track form creation usage
      await SubscriptionService.updateUsage(user.id, { formsCreated: 1 });
      
      return { id: docRef.id };
    }
  } catch (error) {
    console.error('Error saving form:', error);
    return { error: 'Failed to save the form. Please try again later.' };
  }
}

const toISOString = (date: any): string | undefined => {
  if (!date) return undefined;
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  if (date.toDate instanceof Function) return date.toDate().toISOString();
  return new Date(date).toISOString();
}

export async function getFormsAction(): Promise<FormFlowData[] | { error: string }> {
  try {
    // Get current user
    const user = await stackServerApp.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const formsCollection = collection(db, 'forms');
    const q = query(
      formsCollection, 
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );
    const formSnapshot = await getDocs(q);
    
    const formListPromises = formSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      
      // Get submission count for each form
      const submissionsCollection = collection(db, 'forms', doc.id, 'submissions');
      const snapshot = await getCountFromServer(submissionsCollection);
      const submissionCount = snapshot.data().count;

      return {
        id: doc.id,
        ...data,
        submissionCount, // Add submission count here
        createdAt: toISOString(data.createdAt),
        updatedAt: toISOString(data.updatedAt),
        publishStartTime: toISOString(data.publishStartTime),
        publishEndTime: toISOString(data.publishEndTime),
      } as FormFlowData;
    });

    const formList = await Promise.all(formListPromises);
    return formList;
  } catch (error) {
    console.error('Error fetching forms:', error);
    return { error: 'Failed to fetch forms. Please try again later.' };
  }
}

export async function getFormAction(id: string): Promise<FormFlowData | null | { error: string }> {
  try {
    // Get current user
    const user = await stackServerApp.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    const formRef = doc(db, 'forms', id);
    const formSnap = await getDoc(formRef);

    if (!formSnap.exists()) {
      return null;
    }

    const data = formSnap.data();
    
    // Verify ownership
    if (data.userId !== user.id) {
      return { error: 'Unauthorized to access this form' };
    }

    return {
      id: formSnap.id,
      ...data,
      createdAt: toISOString(data.createdAt),
      updatedAt: toISOString(data.updatedAt),
      publishStartTime: toISOString(data.publishStartTime),
      publishEndTime: toISOString(data.publishEndTime),
    } as FormFlowData;
  } catch (error) {
    console.error('Error fetching form:', error);
    return { error: 'Failed to fetch form. Please try again later.' };
  }
}

export async function getPublicFormAction(id: string): Promise<FormFlowData | null | { error: string }> {
  try {
    const formRef = doc(db, 'forms', id);
    const formSnap = await getDoc(formRef);

    if (!formSnap.exists()) {
      return null;
    }

    const data = formSnap.data();

    return {
      id: formSnap.id,
      ...data,
      createdAt: toISOString(data.createdAt),
      updatedAt: toISOString(data.updatedAt),
      publishStartTime: toISOString(data.publishStartTime),
      publishEndTime: toISOString(data.publishEndTime),
    } as FormFlowData;
  } catch (error) {
    console.error('Error getting public form:', error);
    return { error: 'Failed to get form' };
  }
}

export async function getFormBySlugAction(slug: string): Promise<FormFlowData | null | { error: string }> {
  try {
    const formsCollection = collection(db, 'forms');
    const q = query(formsCollection, where('slug', '==', slug), limit(1));
    const formSnapshot = await getDocs(q);

    if (formSnapshot.empty) {
      return null;
    }

    const formDoc = formSnapshot.docs[0];
    const data = formDoc.data();

    return {
      id: formDoc.id,
      ...data,
      createdAt: toISOString(data.createdAt),
      updatedAt: toISOString(data.updatedAt),
      publishStartTime: toISOString(data.publishStartTime),
      publishEndTime: toISOString(data.publishEndTime),
    } as FormFlowData;
  } catch (error) {
    console.error('Error fetching form by slug:', error);
    return { error: 'Failed to fetch form. Please try again later.' };
  }
}

export async function saveSubmissionAction(formId: string, answers: FormAnswers): Promise<{ id: string } | { error: string }> {
  try {
    // Get the form to find the owner
    const formRef = doc(db, 'forms', formId);
    const formDoc = await getDoc(formRef);
    
    if (!formDoc.exists()) {
      return { error: 'Form not found' };
    }
    
    const formData = formDoc.data();
    const formOwnerId = formData.userId;
    
    // Check if form owner can receive a response (with atomic check)
    const canReceive = await SubscriptionService.canPerformAction(formOwnerId, 'receive_response', 1);
    if (!canReceive.allowed) {
      return { error: canReceive.reason || 'Response limit exceeded' };
    }

    const sanitizedAnswers: Record<string, any> = {};
    
    // Process answers with proper file handling
    for (const key in answers) {
      const value = answers[key];
      
      if (value instanceof File) {
        // Upload file to MinIO and get the URL
        try {
          const { uploadUrl, fileKey } = await generatePresignedUploadUrl(
            value.name,
            value.type,
            formId
          );
          
          // Upload file to MinIO
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: value,
            headers: {
              'Content-Type': value.type,
            },
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload file');
          }
          
          // Store file metadata instead of placeholder
          sanitizedAnswers[key] = {
            fileName: value.name,
            fileSize: value.size,
            fileType: value.type,
            fileKey: fileKey,
            uploadedAt: new Date().toISOString()
          };
        } catch (fileError) {
          console.error('File upload error:', fileError);
          return { error: `Failed to upload file: ${value.name}. Please try again.` };
        }
        continue;
      }
      
      // Handle MinIO file data (JSON string from file uploads)
      if (typeof value === 'string' && value.startsWith('[') && value.includes('fileKey')) {
        try {
          const fileData = JSON.parse(value);
          sanitizedAnswers[key] = fileData;
          continue;
        } catch (parseError) {
          console.warn('Failed to parse file data:', parseError);
          sanitizedAnswers[key] = value;
          continue;
        }
      }
      
      if (value === null || value === undefined) {
        // Firestore doesn't like `undefined`, so we store `null` for empty fields.
        sanitizedAnswers[key] = null;
      } else {
        sanitizedAnswers[key] = value;
      }
    }

    const submissionData = {
      ...sanitizedAnswers,
      submittedAt: Timestamp.now(),
    };
    
    const submissionRef = await addDoc(collection(db, 'forms', formId, 'submissions'), submissionData);
    
    // Track response usage for the form owner
    await SubscriptionService.updateUsage(formOwnerId, { responsesReceived: 1 });
    
    return { id: submissionRef.id };

  } catch (error) {
    console.error('Error saving submission:', error);
    return { error: 'Failed to save the submission. Please try again later.' };
  }
}

export async function getSubmissionsAction(formId: string): Promise<any[] | { error: string }> {
    try {
        const submissionsCollection = collection(db, 'forms', formId, 'submissions');
        const q = query(submissionsCollection, orderBy('submittedAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const submissions = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                submittedAt: toISOString(data.submittedAt),
            }
        });

        return submissions;

    } catch (error) {
        console.error('Error fetching submissions:', error);
        return { error: 'Failed to fetch submissions for this form.' };
    }
}

export async function updateFormSlugAction(formId: string, slug: string): Promise<{ success: boolean } | { error: string }> {
  try {
    // Check if slug is already in use by another form
    const formsCollection = collection(db, 'forms');
    const q = query(formsCollection, where('slug', '==', slug));
    const formSnapshot = await getDocs(q);

    if (!formSnapshot.empty) {
      const existingForm = formSnapshot.docs[0];
      if (existingForm.id !== formId) {
        return { error: 'This URL slug is already in use. Please choose another one.' };
      }
    }

    // Update slug
    const formRef = doc(db, 'forms', formId);
    await setDoc(formRef, { slug, updatedAt: new Date() }, { merge: true });
    return { success: true };

  } catch (error) {
    console.error('Error updating slug:', error);
    return { error: 'Failed to update the slug. Please try again.' };
  }
}

export async function validateAnswerAction(
  field: FormField,
  answer: string
): Promise<{ isValid: boolean; feedback: string } | { error: string }> {
  try {
    // Basic client-side validation first
    if (!answer || answer.trim().length === 0) {
      return { isValid: false, feedback: 'Please provide an answer.' };
    }

    // Check field-specific validation rules
    if (field.inputType === 'email' && answer.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(answer.trim())) {
        return { isValid: false, feedback: 'Please enter a valid email address.' };
      }
    }

    if (field.inputType === 'number' && answer.trim()) {
      const num = parseFloat(answer.trim());
      if (isNaN(num)) {
        return { isValid: false, feedback: 'Please enter a valid number.' };
      }
    }

    // Call AI validation service
    const result = await validateAnswer({
      question: field.question,
      answer: answer,
      validationRules: field.validationRules,
    });
    
    return result;
  } catch (error) {
    console.error('Error validating answer:', error);
    
    // More conservative fallback - don't auto-approve
    return { 
      isValid: false, 
      feedback: 'Validation service is temporarily unavailable. Please check your answer and try again.' 
    };
  }
}

export async function getAnalyticsOverviewAction(): Promise<{
  totalForms: number;
  totalSubmissions: number;
  totalViews: number;
  totalCompletions: number;
  avgConversionRate: number;
  avgCompletionRate: number;
  avgBounceRate: number;
  mostSubmittedForm: { title: string; count: number; id: string; } | null;
  trends: {
    views: { current: number; previous: number; change: number };
    submissions: { current: number; previous: number; change: number };
    conversion: { current: number; previous: number; change: number };
  };
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  countryBreakdown: Record<string, number>;
  hourlyActivity: Record<string, number>;
} | { error: string }> {
  try {
    // Get current user
    const user = await stackServerApp.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Use the new AnalyticsService for real data
    const { AnalyticsService } = await import('@/lib/analytics-service');
    const overview = await AnalyticsService.getAnalyticsOverview(user.id, 30);
    
    if (!overview) {
      // Fallback to basic data if no analytics available
      const formsCollection = collection(db, 'forms');
      const q = query(formsCollection, where('userId', '==', user.id));
      const formsSnapshot = await getDocs(q);
      const totalForms = formsSnapshot.size;

      let totalSubmissions = 0;
      let mostSubmittedForm: { title: string; count: number; id: string } | null = null;
      let maxSubmissions = -1;

      for (const formDoc of formsSnapshot.docs) {
        const submissionsCollection = collection(db, 'forms', formDoc.id, 'submissions');
        const snapshot = await getCountFromServer(submissionsCollection);
        const submissionCount = snapshot.data().count;
        
        totalSubmissions += submissionCount;

        if (submissionCount > maxSubmissions) {
          maxSubmissions = submissionCount;
          mostSubmittedForm = { 
            id: formDoc.id,
            title: formDoc.data().title, 
            count: submissionCount 
          };
        }
      }

      return {
        totalForms,
        totalSubmissions,
        totalViews: 0,
        totalCompletions: 0,
        avgConversionRate: 0,
        avgCompletionRate: 0,
        avgBounceRate: 0,
        mostSubmittedForm,
        trends: {
          views: { current: 0, previous: 0, change: 0 },
          submissions: { current: 0, previous: 0, change: 0 },
          conversion: { current: 0, previous: 0, change: 0 }
        },
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
        countryBreakdown: {},
        hourlyActivity: {}
      };
    }

    return {
      totalForms: overview.totalForms,
      totalSubmissions: overview.totalSubmissions,
      totalViews: overview.totalViews,
      totalCompletions: overview.totalCompletions,
      avgConversionRate: overview.avgConversionRate,
      avgCompletionRate: overview.avgCompletionRate,
      avgBounceRate: overview.avgBounceRate,
      mostSubmittedForm: overview.mostPopularForm ? {
        id: overview.mostPopularForm.id,
        title: overview.mostPopularForm.title,
        count: overview.mostPopularForm.submissions
      } : null,
      trends: overview.trends,
      deviceBreakdown: overview.deviceBreakdown,
      countryBreakdown: overview.countryBreakdown,
      hourlyActivity: overview.hourlyActivity
    };

  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return { error: 'Failed to fetch analytics overview data.' };
  }
}

export async function getFormAnalyticsAction(formId: string, days: number = 30): Promise<{
  formId: string;
  totalViews: number;
  totalSubmissions: number;
  totalCompletions: number;
  conversionRate: number;
  completionRate: number;
  avgCompletionTime: number;
  avgFieldsCompleted: number;
  bounceRate: number;
  lastUpdated: Date;
  dailyData: Array<{
    id: string;
    formId: string;
    date: string;
    views: number;
    submissions: number;
    completions: number;
    abandonmentRate: number;
    avgCompletionTime: number;
    avgFieldsCompleted: number;
    deviceBreakdown: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
    countryBreakdown: Record<string, number>;
    hourlyBreakdown: Record<string, number>;
  }>;
} | { error: string }> {
  try {
    // Get current user
    const user = await stackServerApp.getUser();
    if (!user) {
      return { error: 'User not authenticated' };
    }

    // Verify form ownership
    const formRef = doc(db, 'forms', formId);
    const formDoc = await getDoc(formRef);
    
    if (!formDoc.exists()) {
      return { error: 'Form not found' };
    }
    
    const formData = formDoc.data();
    if (formData.userId !== user.id) {
      return { error: 'Unauthorized to view this form analytics' };
    }

    // Use the new AnalyticsService for real data
    const { AnalyticsService } = await import('@/lib/analytics-service');
    const formAnalytics = await AnalyticsService.getFormAnalytics(formId, days);
    
    // If AnalyticsService returns null, return empty data structure
    if (!formAnalytics) {
      return {
        formId,
        totalViews: 0,
        totalSubmissions: 0,
        totalCompletions: 0,
        conversionRate: 0,
        completionRate: 0,
        avgCompletionTime: 0,
        avgFieldsCompleted: 0,
        bounceRate: 0,
        lastUpdated: new Date(),
        dailyData: []
      };
    }
    
    return formAnalytics;

  } catch (error) {
    console.error('Error fetching form analytics:', error);
    return { error: 'Failed to fetch form analytics data.' };
  }
}
