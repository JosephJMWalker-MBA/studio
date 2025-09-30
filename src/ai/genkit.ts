import {genkit} from 'genkit';

// This global instance is now only used to define prompts and flows.
// It does not contain any plugins that require configuration, preventing
// startup errors and allowing for per-request configuration in flows.
export const ai = genkit();
