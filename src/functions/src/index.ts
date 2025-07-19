'use server';
/**
 * @fileOverview A cloud function for generating Farsi translations.
 *
 * - generateFarsi - A function that handles Farsi translation.
 * - GenerateFarsiInput - The input type for the generateFarsi function.
 * - GenerateFarsiOutput - The return type for the generateFarsi function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit/zod';
import {onCall} from 'firebase-functions/v2/https';

const GenerateFarsiInputSchema = z.object({
  english: z.string().describe('The English text to translate.'),
  finglish: z.string().describe('The Finglish transliteration.'),
});
export type GenerateFarsiInput = z.infer<typeof GenerateFarsiInputSchema>;

const GenerateFarsiOutputSchema = z.object({
  farsi: z.string().describe('The Farsi translation.'),
});
export type GenerateFarsiOutput = z.infer<typeof GenerateFarsiOutputSchema>;

const farsiPrompt = ai.definePrompt({
    name: 'farsiPrompt',
    input: { schema: GenerateFarsiInputSchema },
    output: { schema: GenerateFarsiOutputSchema },
    prompt: `Translate the following English text and Finglish transliteration into Farsi script. Provide only the Farsi translation.

English: {{{english}}}
Finglish: {{{finglish}}}

Farsi:`,
});


const generateFarsiFlow = ai.defineFlow(
  {
    name: 'generateFarsiFlow',
    inputSchema: GenerateFarsiInputSchema,
    outputSchema: GenerateFarsiOutputSchema,
  },
  async (input) => {
    const llmResponse = await farsiPrompt(input);
    const output = llmResponse.output;

    if (!output) {
        throw new Error("Failed to generate Farsi translation.");
    }

    return output;
  }
);

export const generateFarsi = onCall(async (request) => {
    const input = GenerateFarsiInputSchema.parse(request.data);
    return await generateFarsiFlow(input);
});
