/**
 * @fileOverview Service for fetching match data from a third-party football API.
 *
 * NOTE: This is a sample implementation based on a common provider (API-Football).
 * You may need to replace the API endpoint and adjust the data mapping to match
 * your specific API provider if it's different.
 */

import type { MatchType } from '@/lib/data';

const API_KEY = process.env.FOOTBALL_API_KEY;
// IMPORTANT: Replace this with the actual base URL from your API provider if different.
const API_BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';
// IMPORTANT: Replace this with the actual host from your API provider if different.
const API_HOST = 'api-football-v1.p.rapidapi.com';

// This is a placeholder type for the raw API response from API-Football.
// You MUST adjust this to match the structure of your API provider's response.
type ApiFixture = {
  fixture: {
    id: number;
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
    date: string;
  };
  league: {
    name: string;
    logo: string;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

type ApiResponse = {
  response: ApiFixture[];
};

async function fetchFromApi(endpoint: string): Promise<ApiResponse> {
  if (!API_KEY) {
    console.error('Football API key is not configured in .env file.');
    return { response: [] };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    });

    if (!response.ok) {
      console.error(
        `API request failed with status ${
          response.status
        }: ${await response.text()}`
      );
      return { response: [] };
    }

    return (await response.json()) as ApiResponse;
  } catch (error) {
    console.error('Error fetching from football API:', error);
    return { response: [] };
  }
}

function transformFixtureToMatchType(fixture: ApiFixture): MatchType {
  const { fixture: f, league, teams, goals } = fixture;
  const isLive = [
    '1H',
    'HT',
    '2H',
    'ET',
    'P',
    'LIVE',
    'IN_PLAY',
  ].includes(f.status.short.toUpperCase());

  let time = '';
  if (isLive) {
    time = f.status.elapsed ? `${f.status.elapsed}'` : f.status.short;
  } else {
    const date = new Date(f.date);
    time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return {
    id: f.id,
    team1: { name: teams.home.name, logo: teams.home.logo },
    team2: { name: teams.away.name, logo: teams.away.logo },
    score: isLive ? `${goals.home ?? 0} - ${goals.away ?? 0}` : undefined,
    time: time,
    league: league.name,
    isLive: isLive,
  };
}

export async function fetchLiveMatches(): Promise<MatchType[]> {
  // This endpoint is for API-Football. Adjust as needed for your provider.
  const data = await fetchFromApi('fixtures?live=all');
  if (!data || !data.response) return [];
  return data.response.map(transformFixtureToMatchType);
}

export async function fetchUpcomingMatches(): Promise<MatchType[]> {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // This endpoint is for API-Football to get matches for today that are not finished. Adjust as needed.
  const data = await fetchFromApi(`fixtures?date=${formatDate(today)}&status=NS`);
  if (!data || !data.response) return [];
  return data.response.map(transformFixtureToMatchType).slice(0, 5); // Limit to 5 upcoming
}
