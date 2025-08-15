'use server';

/**
 * @fileOverview Validates a user's answer to a form question using AI.
 *
 * - validateAnswer - A function that validates a single form answer.
 * - ValidateAnswerInput - The input type for the validateAnswer function.
 * - ValidateAnswerOutput - The return type for the validateAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateAnswerInputSchema = z.object({
  question: z.string().describe('The form question being asked.'),
  answer: z.string().describe("The user's provided answer."),
  validationRules: z.array(z.string()).describe('An array of validation rules, e.g., ["required", "email"].'),
});
export type ValidateAnswerInput = z.infer<typeof ValidateAnswerInputSchema>;

const ValidateAnswerOutputSchema = z.object({
    isValid: z.boolean().describe('Whether the answer is valid for the given question.'),
    feedback: z.string().describe('Constructive feedback for the user if the answer is invalid, or a confirmation message if it is valid.'),
});
export type ValidateAnswerOutput = z.infer<typeof ValidateAnswerOutputSchema>;


export async function validateAnswer(input: ValidateAnswerInput): Promise<ValidateAnswerOutput> {
  return validateAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateAnswerPrompt',
  input: {schema: ValidateAnswerInputSchema},
  output: {schema: ValidateAnswerOutputSchema},
  prompt: `You are an AI assistant helping a user fill out a form. Your task is to validate their answer for a specific question.

Question:
"{{question}}"

User's Answer:
"{{answer}}"

Validation Rules:
{{#if validationRules}}
{{#each validationRules}}
- {{this}}
{{/each}}
{{else}}
- None
{{/if}}

Please evaluate the user's answer based on the question and validation rules.
- The answer must be plausible and directly address the question.
- If the answer is valid, set isValid to true and provide a brief, encouraging feedback message (e.g., "Great, thank you!").
- If the answer is invalid or doesn't make sense, set isValid to false and provide clear, concise, and friendly feedback to help the user correct their answer. For example, if the question is "What is your email?" and the user types "hello", a good feedback would be "That doesn't look like a valid email address. Please enter a valid email."
- Do not be overly strict. If an answer is plausible, accept it.
- If the answer is empty and the field is not required, consider it valid. If it is required, it's invalid.
`,  
});

const validateAnswerFlow = ai.defineFlow(
  {
    name: 'validateAnswerFlow',
    inputSchema: ValidateAnswerInputSchema,
    outputSchema: ValidateAnswerOutputSchema,
  },
  async (input) => {
    // A simple pre-check for the 'required' rule.
    if (input.validationRules.includes('required') && !input.answer.trim()) {
        return {
            isValid: false,
            feedback: "This field is required. Please provide an answer."
        };
    }
    
    const {output} = await prompt(input);
    return output!;
  }
);
