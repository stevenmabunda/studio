'use server';

import {
  generateTrendingHashtags,
  type GenerateTrendingHashtagsInput,
  type GenerateTrendingHashtagsOutput,
} from '@/ai/flows/generate-trending-hashtags';
import type { MatchType } from '@/lib/data';
import { getUpcomingMatchesFromApi } from '@/services/live-scores-service';
import { getLiveMatchesFromSportMonks } from '@/services/sportmonks-service';

export async function getTrendingHashtags(
  input: GenerateTrendingHashtagsInput
): Promise<GenerateTrendingHashtagsOutput> {
  return await generateTrendingHashtags(input);
}


export async function getLiveMatches(): Promise<MatchType[]> {
  try {
    return await getLiveMatchesFromSportMonks();
  } catch (error) {
    console.error("Failed to get live matches, returning empty array.", error);
    // In a real app, you might want a more sophisticated error state.
    return [];
  }
}

export async function getUpcomingMatches(): Promise<MatchType[]> {
  try {
    return await getUpcomingMatchesFromApi();
  } catch (error) {
    console.error("Failed to get upcoming matches, returning empty array.", error);
    return [];
  }
}
