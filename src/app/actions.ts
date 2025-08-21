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


export async function generateFormAction(description: string): Promise<string | { error: string }> {
  try {
    const result = await generateFormFlowFromDescription({ description });
    const parsedResult = JSON.parse(result.formFlow);

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
    console.error(error);
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
      // Create new document with userId
      const createData = { 
        ...dataToSave, 
        createdAt: new Date(),
        userId: user.id
      };
      createData.slug = ''; // Initialize slug for new forms
      createData.status = 'draft';
      const docRef = await addDoc(collection(db, 'forms'), createData);
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
    const sanitizedAnswers: Record<string, any> = {};
    for (const key in answers) {
      const value = answers[key];
      
      if (value instanceof File) {
        // In a real app, you would upload the file to a storage service (like Firebase Storage)
        // and save the URL. For now, we'll just save the file name as a placeholder.
        sanitizedAnswers[key] = `placeholder/for/${value.name}`;
        continue;
      }
      
      if (value === null) {
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
    const result = await validateAnswer({
      question: field.question,
      answer: answer,
      validationRules: field.validationRules,
    });
    return result;
  } catch (error) {
    console.error('Error validating answer:', error);
    // Fallback to prevent blocking the user
    return { isValid: true, feedback: 'Thank you!' };
  }
}

export async function getAnalyticsOverviewAction(): Promise<{
  totalForms: number;
  totalSubmissions: number;
  mostSubmittedForm: { title: string; count: number; id: string; } | null;
} | { error: string }> {
  try {
    // 1. Get all forms
    const formsCollection = collection(db, 'forms');
    const formsSnapshot = await getDocs(formsCollection);
    const totalForms = formsSnapshot.size;

    // 2. Iterate and sum up submissions
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
      mostSubmittedForm,
    };

  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return { error: 'Failed to fetch analytics overview data.' };
  }
}
