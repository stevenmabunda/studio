// IMPORTANT: This file should not be marked with 'use server'
// as it is a pure data-fetching utility and doesn't need to be
// directly callable from the client. It will be used by server actions.

import type { MatchType } from '@/lib/data';

interface ApiFixture {
    fixture: {
        id: number;
        status: {
            short: string;
            elapsed: number | null;
        };
        date: string;
    };
    league: {
        id: number;
        name: string;
        logo: string;
    };
    teams: {
        home: { id: number; name: string; logo: string; };
        away: { id: number; name: string; logo: string; };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
}

interface ApiResponse {
    response: ApiFixture[];
}

// A helper function to map the API response to our app's MatchType
function mapApiDataToMatchType(fixtures: ApiFixture[]): MatchType[] {
    if (!fixtures) return [];
    
    return fixtures.map(f => {
        const isLive = ['1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(f.fixture.status.short);
        const isUpcoming = f.fixture.status.short === 'NS'; // Not Started
        
        const formatTime = () => {
            if (isLive) {
                return f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : 'Live';
            }
            if (isUpcoming) {
                 const date = new Date(f.fixture.date);
                // Show date if it's not today
                const today = new Date();
                if (date.toDateString() !== today.toDateString()) {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                // Show time if it's today
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            }
            return f.fixture.status.short; // FT, AET, etc.
        }

        return {
            id: f.fixture.id,
            team1: { name: f.teams.home.name, logo: f.teams.home.logo },
            team2: { name: f.teams.away.name, logo: f.teams.away.logo },
            score: isLive ? `${f.goals.home || 0} - ${f.goals.away || 0}` : undefined,
            time: formatTime(),
            league: f.league.name,
            isLive: isLive,
            isUpcoming: isUpcoming,
        }
    });
}

// Reusable fetch function
async function fetchFromApi(endpoint: string, params: URLSearchParams): Promise<ApiResponse> {
  const url = `https://v3.football.api-sports.io/${endpoint}?${params.toString()}`;
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
      console.error("Football API key is missing. Please add it to your .env file.");
      throw new Error("API key is not configured.");
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': apiKey
      },
      // Use Next.js revalidation to cache results for 60 seconds
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from Football API:`, error);
    throw error; // Re-throw to be handled by the caller
  }
}

// Service function to get live matches
export async function getLiveMatchesFromApi(): Promise<MatchType[]> {
  const params = new URLSearchParams({ live: 'all' });
  const apiData = await fetchFromApi('fixtures', params);
  return mapApiDataToMatchType(apiData.response);
}

// Service function to get upcoming matches
export async function getUpcomingMatchesFromApi(): Promise<MatchType[]> {
    const params = new URLSearchParams({ 
        status: 'NS', // Not Started
        next: '20' // Get the next 20 fixtures
    });
    const apiData = await fetchFromApi('fixtures', params);
    return mapApiDataToMatchType(apiData.response);
}
