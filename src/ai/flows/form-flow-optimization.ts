// form-flow-optimization.ts
'use server';

/**
 * @fileOverview A form flow optimization AI agent.
 *
 * - suggestImprovementsToFormFlow - A function that suggests improvements to a given form flow.
 * - SuggestImprovementsToFormFlowInput - The input type for the suggestImprovementsToFormFlow function.
 * - SuggestImprovementsToFormFlowOutput - The return type for the suggestImprovementsToFormFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestImprovementsToFormFlowInputSchema = z.object({
  formFlowDefinition: z.string().describe('The definition of the form flow to be optimized.'),
});
export type SuggestImprovementsToFormFlowInput = z.infer<typeof SuggestImprovementsToFormFlowInputSchema>;

const SuggestImprovementsToFormFlowOutputSchema = z.object({
  suggestions: z.string().describe('Suggestions for improving the form flow.'),
});
export type SuggestImprovementsToFormFlowOutput = z.infer<typeof SuggestImprovementsToFormFlowOutputSchema>;

export async function suggestImprovementsToFormFlow(input: SuggestImprovementsToFormFlowInput): Promise<SuggestImprovementsToFormFlowOutput> {
  return suggestImprovementsToFormFlowFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementsToFormFlowPrompt',
  input: {schema: SuggestImprovementsToFormFlowInputSchema},
  output: {schema: SuggestImprovementsToFormFlowOutputSchema},
  prompt: `You are an expert in designing conversational form flows. Given the following form flow definition, provide suggestions for improving it to enhance user experience and completion rates.\n\nForm Flow Definition:\n{{{formFlowDefinition}}}\n\nSuggestions:`,
});

const suggestImprovementsToFormFlowFlow = ai.defineFlow(
  {
    name: 'suggestImprovementsToFormFlowFlow',
    inputSchema: SuggestImprovementsToFormFlowInputSchema,
    outputSchema: SuggestImprovementsToFormFlowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
