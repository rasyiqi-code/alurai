'use server';

/**
 * @fileOverview Generates a conversational form flow from a natural language description.
 *
 * - generateFormFlowFromDescription - A function that generates the form flow.
 * - GenerateFormFlowInput - The input type for the generateFormFlowFromDescription function.
 * - GenerateFormFlowOutput - The return type for the generateFormFlowFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFormFlowInputSchema = z.object({
  description: z
    .string()
    .describe(
      'A natural language description of the desired conversational form flow.'
    ),
});
export type GenerateFormFlowInput = z.infer<typeof GenerateFormFlowInputSchema>;

const GenerateFormFlowOutputSchema = z.object({
  formFlow: z
    .string()
    .describe(
      'A JSON representation of the generated conversational form flow, including questions, input types, and validation rules.'
    ),
});
export type GenerateFormFlowOutput = z.infer<typeof GenerateFormFlowOutputSchema>;

export async function generateFormFlowFromDescription(
  input: GenerateFormFlowInput
): Promise<GenerateFormFlowOutput> {
  return generateFormFlowFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFormFlowPrompt',
  input: {schema: GenerateFormFlowInputSchema},
  output: {schema: GenerateFormFlowOutputSchema},
  prompt: `You are an expert in designing conversational form flows.  A user will provide a description of the form they want to create, and you will generate a JSON representation of the form flow.

The JSON should include a series of steps. Each step should have:
- A "question" field containing the question to ask the user.
- An "inputType" field describing the type of input expected from the user (e.g., "text", "number", "email", "file", "date", "select", "textarea").
- A "validationRules" field containing an array of validation rules to apply to the input (e.g., "required", "email", "minLength:3", "maxLength:100").
- If the "inputType" is "select", include an "options" field containing an array of possible values.

Description: {{{description}}}

JSON:
`,
});

const generateFormFlowFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateFormFlowFromDescriptionFlow',
    inputSchema: GenerateFormFlowInputSchema,
    outputSchema: GenerateFormFlowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
