'use server';

/**
 * @fileOverview Implements the data parsing flow to intelligently fill form fields.
 *
 * - intelligentlyParseDataToFillForm - A function that handles the data parsing process.
 * - DataParsingInput - The input type for the intelligentlyParseDataToFillForm function.
 * - DataParsingOutput - The return type for the intelligentlyParseDataToFillForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataParsingInputSchema = z.object({
  formDataSchema: z.string().describe('The Zod schema representing the target form data.'),
  inputData: z.string().describe('The input data to parse, either pasted text or file content.'),
});
export type DataParsingInput = z.infer<typeof DataParsingInputSchema>;

const DataParsingOutputSchema = z.record(z.string(), z.any())
  .describe('A record representing the parsed form fields and their values.');
export type DataParsingOutput = z.infer<typeof DataParsingOutputSchema>;

export async function intelligentlyParseDataToFillForm(input: DataParsingInput): Promise<DataParsingOutput> {
  return dataParsingFlow(input);
}

const dataParsingPrompt = ai.definePrompt({
  name: 'dataParsingPrompt',
  input: {schema: DataParsingInputSchema},
  output: {schema: DataParsingOutputSchema},
  prompt: `You are an intelligent data parsing tool. Your task is to extract relevant information from unstructured input data and map it to a structured form based on a given Zod schema.

Form Schema (Zod):
Each field in the Zod schema has a description (using .describe()) which corresponds to the question in the form. Use these descriptions to understand what data is expected for each field.
\`\`\`
{{formDataSchema}}
\`\`\`

Input Data:
The following is the unstructured text provided by the user.
\`\`\`
{{inputData}}
\`\`\`

Your goal is to populate a JSON object that strictly conforms to the Zod schema. Extract the values from the Input Data and assign them to the correct keys in the JSON output. 
- If you cannot find a value for a specific field, leave it out of the JSON object. 
- Do not invent data.
- If no data can be extracted from the input, return an empty JSON object like {}.

Parsed Data (JSON):
`,  
});

const dataParsingFlow = ai.defineFlow(
  {
    name: 'dataParsingFlow',
    inputSchema: DataParsingInputSchema,
    outputSchema: DataParsingOutputSchema,
  },
  async input => {
    try {
      const {output} = await dataParsingPrompt(input);
      // The model might return null/undefined if it can't parse anything.
      // In that case, we'll return an empty object.
      return output ?? {};
    } catch (e: any) {
      console.error('Error during data parsing:', e);
      // It's possible the model returns a non-JSON string.
      // Instead of throwing an error, we'll return an empty object
      // so the user experience isn't blocked.
      if (e.message.includes('Failed to parse JSON')) {
        return {};
      }
      throw new Error(`Data parsing failed: ${e.message}`);
    }
  }
);
