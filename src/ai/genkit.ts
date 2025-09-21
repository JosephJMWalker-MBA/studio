import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This instance is now only used for development or server-side-only flows
// if you choose to add them later. User-facing flows will be initialized
// with the user's key.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
