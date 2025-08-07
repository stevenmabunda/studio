import {config} from 'dotenv';
config();

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      api: 'vertex',
      location: 'us-central1',
    }),
  ],
  model: 'googleai/gemini-2.0-flash-001',
});
