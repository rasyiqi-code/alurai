'use server';

import { generateFormFlowFromDescription } from '@/ai/flows/form-generator';
import { suggestImprovementsToFormFlow } from '@/ai/flows/form-flow-optimization';
import { intelligentlyParseDataToFillForm } from '@/ai/flows/data-parsing-tool';
import { FormFlow, FormFlowData } from '@/lib/types';
import { toCamelCase } from '@/lib/utils';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';


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

    const finalData = {
      title: parsedResult.title,
      flow: flowWithIds,
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

function generateZodSchemaString(formFlow: FormFlow): string {
  const schemaFields = formFlow.map(field => {
    let zodType;
    switch (field.inputType) {
      case 'number':
        zodType = 'z.number()';
        break;
      case 'email':
        zodType = 'z.string().email()';
        break;
      case 'date':
        zodType = 'z.string().pipe(z.coerce.date())';
        break;
      case 'file':
        return `${field.key}: z.string().optional().describe('Path or name of the uploaded file')`;
      default:
        zodType = 'z.string()';
    }

    if (field.validationRules.includes('required')) {
      zodType += '.min(1, "This field is required")';
    }
    
    return `${field.key}: ${zodType}.describe('${field.question}')`;
  });

  return `z.object({ ${schemaFields.join(', ')} })`;
}

export async function parseDataAction(formFlow: FormFlow, inputData: string): Promise<Record<string, any> | { error: string }> {
  const formDataSchema = generateZodSchemaString(formFlow);
  try {
    const result = await intelligentlyParseDataToFillForm({ formDataSchema, inputData });
    return result;
  } catch (error) {
    console.error(error);
    return { error: 'Failed to parse data. Please check the input and try again.' };
  }
}

export async function saveFormAction(formFlowData: FormFlowData): Promise<{ id: string } | { error: string }> {
  try {
    if (formFlowData.id) {
      // Update existing document
      const formRef = doc(db, 'forms', formFlowData.id);
      await setDoc(formRef, { ...formFlowData, updatedAt: new Date() }, { merge: true });
      return { id: formFlowData.id };
    } else {
      // Create new document
      const docRef = await addDoc(collection(db, 'forms'), { ...formFlowData, createdAt: new Date() });
      return { id: docRef.id };
    }
  } catch (error) {
    console.error('Error saving form:', error);
    return { error: 'Failed to save the form. Please try again later.' };
  }
}
