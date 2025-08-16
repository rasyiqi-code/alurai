'use server';

import { generateFormFlowFromDescription } from '@/ai/flows/form-generator';
import { suggestImprovementsToFormFlow } from '@/ai/flows/form-flow-optimization';
import { intelligentlyParseDataToFillForm } from '@/ai/flows/data-parsing-tool';
import { validateAnswer } from '@/ai/flows/answer-validator';
import { extractKeyValuePairs } from '@/ai/flows/extract-key-value-pairs';
import { FormFlow, FormFlowData, FormAnswers, FormField, ExtractedPair } from '@/lib/types';
import { toCamelCase } from '@/lib/utils';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc, addDoc, collection, getDocs, getDoc, Timestamp, orderBy, query, where, limit, collectionGroup } from 'firebase/firestore';


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
    const dataToSave: Omit<FormFlowData, 'id'> & { createdAt?: any, updatedAt?: any } = { ...formFlowData };
    delete dataToSave.id;

    if (formFlowData.id) {
      // Update existing document
      const formRef = doc(db, 'forms', formFlowData.id);
      dataToSave.updatedAt = new Date();
      await setDoc(formRef, dataToSave, { merge: true });
      return { id: formFlowData.id };
    } else {
      // Create new document
      dataToSave.createdAt = new Date();
      dataToSave.slug = ''; // Initialize slug for new forms
      dataToSave.status = 'draft';
      const docRef = await addDoc(collection(db, 'forms'), dataToSave);
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
    const formsCollection = collection(db, 'forms');
    const q = query(formsCollection, orderBy('createdAt', 'desc'));
    const formSnapshot = await getDocs(q);
    
    const formList = formSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toISOString(data.createdAt),
        updatedAt: toISOString(data.updatedAt),
        publishStartTime: toISOString(data.publishStartTime),
        publishEndTime: toISOString(data.publishEndTime),
      } as FormFlowData;
    });

    return formList;
  } catch (error) {
    console.error('Error fetching forms:', error);
    return { error: 'Failed to fetch forms. Please try again later.' };
  }
}

export async function getFormAction(id: string): Promise<FormFlowData | null | { error: string }> {
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
  } catch (error)
 {
    console.error('Error fetching form:', error);
    return { error: 'Failed to fetch form. Please try again later.' };
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
    // We can't store File objects in Firestore, so we'll just store the name for now.
    const sanitizedAnswers: Record<string, any> = {};
    for (const key in answers) {
      const value = answers[key];
      if (value instanceof File) {
        sanitizedAnswers[key] = value.name;
      } else {
        sanitizedAnswers[key] = value;
      }
    }

    const submissionData = {
      ...sanitizedAnswers,
      submittedAt: new Date(),
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
    return { error: 'Failed to validate answer. Please try again.' };
  }
}
