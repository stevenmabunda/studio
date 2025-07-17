
'use server';

import {
  generateTrendingHashtags,
  type GenerateTrendingHashtagsInput,
  type GenerateTrendingHashtagsOutput,
} from '@/ai/flows/generate-trending-hashtags';
import { getLiveMatchesFromApi } from '@/services/live-scores-service';
import type { MatchType } from '@/lib/data';


export async function getTrendingHashtags(
  input: GenerateTrendingHashtagsInput
): Promise<GenerateTrendingHashtagsOutput> {
  return await generateTrendingHashtags(input);
}

export async function getLiveMatches(): Promise<MatchType[]> {
  try {
    const matches = await getLiveMatchesFromApi();
    return matches;
  } catch (error) {
    console.error("Error in getLiveMatches server action:", error);
    // Depending on requirements, you might want to return an empty array
    // or re-throw the error to be handled by the UI.
    return [];
  }
}
