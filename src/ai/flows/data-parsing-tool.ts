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
  prompt: `You are an intelligent data parsing tool. Your task is to extract relevant information from unstructured input data and map it to a structured form based on a given Zod schema. The input data may not follow the order of the form fields. You must analyze the semantic meaning of the input data and match it to the field descriptions in the schema.

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

Your goal is to populate a JSON object that strictly conforms to the Zod schema. Extract the values from the Input Data and assign them to the correct keys in the JSON output. If you cannot find a value for a specific field, leave it out of the JSON object. Do not invent data.

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
      if (!output) {
        throw new Error('Failed to parse data: No output returned from prompt.');
      }
      return output;
    } catch (e: any) {
      console.error('Error during data parsing:', e);
      throw new Error(`Data parsing failed: ${e.message}`);
    }
  }
);
