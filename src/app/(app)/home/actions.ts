'use server';

import {
  generateTrendingHashtags,
  type GenerateTrendingHashtagsInput,
  type GenerateTrendingHashtagsOutput,
} from '@/ai/flows/generate-trending-hashtags';

export async function getTrendingHashtags(
  input: GenerateTrendingHashtagsInput
): Promise<GenerateTrendingHashtagsOutput> {
  return await generateTrendingHashtags(input);
}
