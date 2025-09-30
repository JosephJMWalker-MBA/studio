'use server';

/**
 * @fileOverview A flow that generates two personalized decision options based on a user's question.
 *
 * - generateDecisionOptions - A function that generates the decision options.
 * - GenerateDecisionOptionsInput - The input type for the generateDecisionOptions function.
 * - GenerateDecisionOptionsOutput - The return type for the generateDecisionOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDecisionOptionsInputSchema = z.object({
  question: z.string().describe('The user provided question.'),
  apiKey: z.string().describe('The user-provided Gemini API key.'),
});

export type GenerateDecisionOptionsInput = z.infer<
  typeof GenerateDecisionOptionsInputSchema
>;

const GenerateDecisionOptionsOutputSchema = z.object({
  heads: z.string().describe('The option if the coin flip lands on heads.'),
  tails: z.string().describe('The option if the coin flip lands on tails.'),
});

export type GenerateDecisionOptionsOutput = z.infer<
  typeof GenerateDecisionOptionsOutputSchema
>;

// Define the prompt using the global AI instance.
const decisionOptionsPrompt = ai.definePrompt({
  name: 'generateDecisionOptionsPrompt',
  input: {schema: z.object({question: z.string()})},
  output: {schema: GenerateDecisionOptionsOutputSchema},
  model: 'gemini-1.5-flash-latest',
  prompt: `You are a helpful assistant that provides fun and personalized decision options based on a user's question.

Question: {{{question}}}

Generate two distinct options, one for "heads" and one for "tails", tailored to the question. Be creative and engaging.
`,
});

export async function generateDecisionOptions(
  input: GenerateDecisionOptionsInput
): Promise<GenerateDecisionOptionsOutput> {
  // Call the pre-defined prompt, passing the API key in the `auth` context.
  const {output} = await decisionOptionsPrompt(
    {question: input.question},
    {auth: {apiKey: input.apiKey}}
  );
  return output!;
}
