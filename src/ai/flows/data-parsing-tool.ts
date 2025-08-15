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
  prompt: `You are an intelligent data parsing tool. Given the following input data and a Zod schema representing a form, parse the input data and return a JSON object conforming to the schema.

Form Schema (Zod):
{{formDataSchema}}

Input Data:
{{inputData}}

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
