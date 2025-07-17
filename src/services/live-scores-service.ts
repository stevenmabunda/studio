// IMPORTANT: This file should not be marked with 'use server'
// as it is a pure data-fetching utility and doesn't need to be
// directly callable from the client. It will be used by server actions.

import type { MatchType } from '@/lib/data';

// This is the structure we expect from the API-Football 'fixtures' endpoint
interface ApiFootballResponse {
  response: {
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
    };
    teams: {
      home: { name: string; logo: string; };
      away: { name: string; logo: string; };
    };
    goals: {
      home: number | null;
      away: number | null;
    };
  }[];
}


// A helper function to map the API response to our app's MatchType
function mapApiDataToMatchType(apiData: ApiFootballResponse): MatchType[] {
  if (!apiData || !apiData.response) {
    return [];
  }

  return apiData.response.map(item => {
    const fixture = item.fixture;
    const isLive = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT'].includes(fixture.status.short);
    
    let timeOrStatus: string;
    if (isLive) {
      timeOrStatus = fixture.status.elapsed ? `${fixture.status.elapsed}'` : fixture.status.short;
    } else {
      const date = new Date(fixture.date);
      timeOrStatus = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    return {
      id: fixture.id,
      team1: {
        name: item.teams.home.name,
        logo: item.teams.home.logo,
      },
      team2: {
        name: item.teams.away.name,
        logo: item.teams.away.logo,
      },
      score: isLive ? `${item.goals.home ?? 0} - ${item.goals.away ?? 0}` : undefined,
      time: timeOrStatus,
      league: item.league.name,
      isLive: isLive,
    };
  });
}

// Reusable fetch function
async function fetchFromApi(endpoint: string, params: URLSearchParams): Promise<ApiFootballResponse> {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    throw new Error('API key for football data is not configured.');
  }
  
  const url = `https://v3.football.api-sports.io/${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': apiKey,
      },
      // Use Next.js revalidation to cache results for 60 seconds
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
}

// Service function to get live matches
export async function getLiveMatchesFromApi(): Promise<MatchType[]> {
  const params = new URLSearchParams({ live: 'all' });
  const apiData = await fetchFromApi('fixtures', params);
  return mapApiDataToMatchType(apiData);
}

// Service function to get upcoming matches
export async function getUpcomingMatchesFromApi(): Promise<MatchType[]> {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const params = new URLSearchParams({
    date: formatDate(today),
  });
  
  const apiData = await fetchFromApi('fixtures', params);

  // Filter out matches that are live or finished
  const upcomingData = {
    ...apiData,
    response: apiData.response.filter(item => 
      ['NS', 'TBD', 'PST'].includes(item.fixture.status.short)
    ),
  };

  return mapApiDataToMatchType(upcomingData);
}
