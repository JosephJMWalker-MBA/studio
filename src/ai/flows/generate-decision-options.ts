'use server';

/**
 * @fileOverview A flow that generates two personalized decision options based on a user's question.
 *
 * - generateDecisionOptions - A function that generates the decision options.
 * - GenerateDecisionOptionsInput - The input type for the generateDecisionOptions function.
 * - GenerateDecisionOptionsOutput - The return type for the generateDecisionOptions function.
 */

import {ai as globalAi} from '@/ai/genkit';
import {z} from 'genkit';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

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

// Define the prompt structure using the global AI instance.
const decisionOptionsPrompt = globalAi.definePrompt({
  name: 'generateDecisionOptionsPrompt',
  input: {schema: z.object({question: z.string()})},
  output: {schema: GenerateDecisionOptionsOutputSchema},
  prompt: `You are a helpful assistant that provides fun and personalized decision options based on a user's question.

Question: {{{question}}}

Generate two distinct options, one for "heads" and one for "tails", tailored to the question.
`,
});

export async function generateDecisionOptions(
  input: GenerateDecisionOptionsInput
): Promise<GenerateDecisionOptionsOutput> {
  // Create a temporary, request-specific Genkit instance configured
  // with the user's API key. This is the correct pattern for BYOK.
  const ai = genkit({
    plugins: [googleAI({apiKey: input.apiKey})],
  });

  // Execute the prompt using the temporary, configured instance.
  const {output} = await ai.generate({
    prompt: decisionOptionsPrompt,
    input: {question: input.question},
    model: 'gemini-1.5-flash-latest',
  });
  return output!;
}
