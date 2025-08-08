import {config} from 'dotenv';
config();

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Force the API to use Vertex AI, which is correctly configured
      // for this project's API key.
      api: 'vertex',
      location: 'us-central1',
    }),
  ],
  // Set the default model to a Vertex AI compatible model.
  model: 'googleai/gemini-2.0-flash-001',
});
