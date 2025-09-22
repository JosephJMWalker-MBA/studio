'use server';

/**
 * @fileOverview A flow that generates two personalized decision options based on a user's question.
 *
 * - generateDecisionOptions - A function that generates the decision options.
 * - GenerateDecisionOptionsInput - The input type for the generateDecisionOptions function.
 * - GenerateDecisionOptionsOutput - The return type for the generateDecisionOptions function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
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

export async function generateDecisionOptions(
  input: GenerateDecisionOptionsInput
): Promise<GenerateDecisionOptionsOutput> {
  // Initialize a new Genkit AI instance with the user's API key for this request.
  const ai = genkit({
    plugins: [googleAI({apiKey: input.apiKey})],
  });

  const prompt = ai.definePrompt({
    name: 'generateDecisionOptionsPrompt',
    model: 'gemini-pro',
    input: {schema: z.object({question: z.string()})},
    output: {schema: GenerateDecisionOptionsOutputSchema},
    prompt: `You are a helpful assistant that provides fun and personalized decision options based on a user's question.

  Question: {{{question}}}

  Generate two distinct options, one for "heads" and one for "tails", tailored to the question. Be creative and engaging.
  `,
  });

  const {output} = await prompt({question: input.question});
  return output!;
}
