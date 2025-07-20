
'use server';
/**
 * @fileOverview A flow that generates an ad (text and image) based on a decision.
 *
 * - generateAd - A function that generates ad content.
 * - GenerateAdInput - The input type for the generateAd function.
 * - GenerateAdOutput - The return type for the generateAd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdInputSchema = z.object({
  decisionText: z.string().describe('The text of the decision that was made.'),
});
export type GenerateAdInput = z.infer<typeof GenerateAdInputSchema>;

const GenerateAdOutputSchema = z.object({
  adText: z.string().describe('A short, catchy ad slogan related to the decision.'),
  adImagePrompt: z.string().describe('A prompt to generate an image for the ad.'),
  adImageUrl: z.string().describe("A data URI for the generated ad image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateAdOutput = z.infer<typeof GenerateAdOutputSchema>;

export async function generateAd(input: GenerateAdInput): Promise<GenerateAdOutput> {
  return generateAdFlow(input);
}

const adIdeaPrompt = ai.definePrompt({
  name: 'generateAdIdeaPrompt',
  input: {schema: GenerateAdInputSchema},
  output: {schema: z.object({
    adText: z.string().describe('A short, catchy ad slogan related to the decision. Max 10 words.'),
    adImagePrompt: z.string().describe('A concise prompt for an image generation model, visually representing the ad slogan and decision. Max 15 words.'),
  })},
  prompt: `
    You are an advertising expert. Based on the following decision:
    "{{{decisionText}}}"

    Generate:
    1. A short, catchy, and fun ad slogan (max 10 words).
    2. A concise image prompt (max 15 words) for a generative AI to create a visually appealing and relevant ad image. The image should be vibrant and engaging.
  `,
});

const generateAdFlow = ai.defineFlow(
  {
    name: 'generateAdFlow',
    inputSchema: GenerateAdInputSchema,
    outputSchema: GenerateAdOutputSchema,
  },
  async (input) => {
    const {output: adIdea} = await adIdeaPrompt(input);
    if (!adIdea) {
      throw new Error('Failed to generate ad ideas.');
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: adIdea.adImagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    const imageUrl = media.url;
    if (!imageUrl) {
      throw new Error('Failed to generate ad image.');
    }

    return {
      adText: adIdea.adText,
      adImagePrompt: adIdea.adImagePrompt,
      adImageUrl: imageUrl,
    };
  }
);
