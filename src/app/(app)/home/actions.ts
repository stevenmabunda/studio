'use server';

import {
  generateTrendingHashtags,
  type GenerateTrendingHashtagsInput,
  type GenerateTrendingHashtagsOutput,
} from '@/ai/flows/generate-trending-hashtags';
import {
  fetchLiveMatches,
  fetchUpcomingMatches,
} from '@/services/match-service';
import type { MatchType } from '@/lib/data';

export async function getTrendingHashtags(
  input: GenerateTrendingHashtagsInput
): Promise<GenerateTrendingHashtagsOutput> {
  return await generateTrendingHashtags(input);
}

export async function getLiveMatches(): Promise<MatchType[]> {
  try {
    return await fetchLiveMatches();
  } catch (error) {
    console.error('Error in getLiveMatches server action:', error);
    return [];
  }
}

export async function getUpcomingMatches(): Promise<MatchType[]> {
  try {
    return await fetchUpcomingMatches();
  } catch (error) {
    console.error('Error in getUpcomingMatches server action:', error);
    return [];
  }
}
