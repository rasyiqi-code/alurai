'use server';

/**
 * @fileOverview Extracts key-value pairs from unstructured text.
 *
 * - extractKeyValuePairs - A function that handles the extraction process.
 * - ExtractKeyValuePairsInput - The input type for the extractKeyValuePairs function.
 * - ExtractKeyValuePairsOutput - The return type for the extractKeyValuePairs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractKeyValuePairsInputSchema = z.object({
  text: z.string().describe('The unstructured text to extract key-value pairs from.'),
});
export type ExtractKeyValuePairsInput = z.infer<typeof ExtractKeyValuePairsInputSchema>;

const ExtractedPairSchema = z.object({
    key: z.string().describe('The identified label or key, e.g., "Name", "Email Address".'),
    value: z.string().describe('The corresponding value for the key, e.g., "John Doe", "john.doe@email.com".'),
});

const ExtractKeyValuePairsOutputSchema = z.object({
  pairs: z.array(ExtractedPairSchema).describe('An array of key-value pairs found in the text.'),
});
export type ExtractKeyValuePairsOutput = z.infer<typeof ExtractKeyValuePairsOutputSchema>;

export async function extractKeyValuePairs(input: ExtractKeyValuePairsInput): Promise<ExtractKeyValuePairsOutput> {
  return extractKeyValuePairsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractKeyValuePairsPrompt',
  input: {schema: ExtractKeyValuePairsInputSchema},
  output: {schema: ExtractKeyValuePairsOutputSchema},
  prompt: `You are an AI assistant that extracts information from text into key-value pairs. Analyze the following text and identify any labels and their corresponding values.

For example, if the text is "Nama: John Doe, Email: john@email.com", the output should be:
[
  { "key": "Nama", "value": "John Doe" },
  { "key": "Email", "value": "john@email.com" }
]

For checkboxes or multiple selections, group them under a single representative key. For example, "☑ Saya suka kerja dari rumah, ☑ Saya suka kerja di kantor" could be extracted as:
{ "key": "Keahlian", "value": "Saya suka kerja dari rumah, Saya suka kerja di kantor" }


Text to analyze:
\`\`\`
{{text}}
\`\`\`

Extract the key-value pairs. If no pairs are found, return an empty array.`,
});

const extractKeyValuePairsFlow = ai.defineFlow(
  {
    name: 'extractKeyValuePairsFlow',
    inputSchema: ExtractKeyValuePairsInputSchema,
    outputSchema: ExtractKeyValuePairsOutputSchema,
  },
  async (input) => {
    try {
        const {output} = await prompt(input);
        return output || { pairs: [] };
    } catch (e) {
        console.error("Error in extractKeyValuePairsFlow", e);
        return { pairs: [] };
    }
  }
);
