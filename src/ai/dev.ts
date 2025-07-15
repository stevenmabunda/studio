import { config } from 'dotenv';
config();

import '@/ai/flows/generate-trending-topics.ts';
import '@/ai/flows/generate-trending-hashtags.ts';
import '@/ai/flows/extract-post-topics.ts';
import '@/ai/flows/generate-bot-post.ts';
