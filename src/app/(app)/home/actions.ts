'use server';

import {
  generateTrendingHashtags,
  type GenerateTrendingHashtagsInput,
  type GenerateTrendingHashtagsOutput,
} from '@/ai/flows/generate-trending-hashtags';
import type { MatchType } from '@/lib/data';

export async function getTrendingHashtags(
  input: GenerateTrendingHashtagsInput
): Promise<GenerateTrendingHashtagsOutput> {
  return await generateTrendingHashtags(input);
}

// Mock data to replace API calls
const mockLiveMatches: MatchType[] = [
  {
    id: 1,
    team1: { name: 'Man City' },
    team2: { name: 'Arsenal' },
    score: '1 - 1',
    time: "75'",
    league: 'Premier League',
    isLive: true,
  },
];

const mockUpcomingMatches: MatchType[] = [
  {
    id: 2,
    team1: { name: 'Real Madrid' },
    team2: { name: 'FC Barcelona' },
    time: '20:00',
    league: 'La Liga',
    isLive: false,
  },
   {
    id: 3,
    team1: { name: 'Juventus' },
    team2: { name: 'AC Milan' },
    time: '21:45',
    league: 'Serie A',
    isLive: false,
  },
];


export async function getLiveMatches(): Promise<MatchType[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockLiveMatches;
}

export async function getUpcomingMatches(): Promise<MatchType[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUpcomingMatches;
}
