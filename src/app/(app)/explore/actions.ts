'use server';

import {
  generateTrendingTopics,
  type GenerateTrendingTopicsInput,
  type GenerateTrendingTopicsOutput,
} from '@/ai/flows/generate-trending-topics';

export async function getTrendingTopics(
  input: GenerateTrendingTopicsInput
): Promise<GenerateTrendingTopicsOutput> {
  return await generateTrendingTopics(input);
}
