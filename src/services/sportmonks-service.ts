
// IMPORTANT: This file should not be marked with 'use server'
// as it is a pure data-fetching utility and doesn't need to be
// directly callable from the client. It will be used by server actions.

import type { MatchType } from "@/lib/data";

// Generic API Response Structure
interface SportMonksApiResponse<T> {
    data: T;
    subscription?: any[];
    rate_limit?: any;
    timezone?: string;
}

// Type for a single Fixture/Match from SportMonks
interface SportMonksFixture {
    id: number;
    name: string;
    starting_at: string;
    result_info: string;
    state: string; // e.g., 'LIVE', 'NS' (Not Started), 'FT' (Full Time)
    league: {
        id: number;
        name: string;
        image_path: string;
    };
    participants: [
        { id: number; name: string; image_path: string; meta: { location: 'home' | 'away' } },
        { id: number; name: string; image_path: string; meta: { location: 'home' | 'away' } }
    ];
    scores: {
        participant_id: number;
        score: {
            goals: number;
        };
        description: string;
    }[];
    periods: {
        minutes: number | null;
        // Add other properties if available in the API response for periods
    }[];
}

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// Helper function to map SportMonks fixture data to our app's MatchType
function mapSportMonksToMatchType(fixtures: SportMonksFixture[]): MatchType[] {
    if (!fixtures || fixtures.length === 0) return [];
    
    return fixtures.map(fixture => {
        const homeTeam = fixture.participants.find(p => p.meta.location === 'home');
        const awayTeam = fixture.participants.find(p => p.meta.location === 'away');

        const homeScore = fixture.scores.find(s => s.participant_id === homeTeam?.id)?.score.goals;
        const awayScore = fixture.scores.find(s => s.participant_id === awayTeam?.id)?.score.goals;

        const isLive = fixture.state === 'LIVE';
        const isUpcoming = fixture.state === 'NS';
        
        let timeDisplay: string;
        if (isLive) {
            // Find current period's minutes
            const liveMinutes = fixture.periods?.find(p => p.minutes !== null)?.minutes;
            timeDisplay = liveMinutes ? `${liveMinutes}'` : 'Live';
        } else if (isUpcoming) {
            const startTime = new Date(fixture.starting_at);
            timeDisplay = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        } else {
            timeDisplay = 'FT';
        }

        return {
            id: fixture.id,
            team1: { name: homeTeam?.name || 'TBD', logo: homeTeam?.image_path },
            team2: { name: awayTeam?.name || 'TBD', logo: awayTeam?.image_path },
            score: (homeScore !== undefined && awayScore !== undefined) ? `${homeScore} - ${awayScore}` : '0 - 0',
            time: timeDisplay,
            league: fixture.league.name,
            isLive: isLive,
            isUpcoming: isUpcoming,
        };
    });
}


// Reusable fetch function for the SportMonks API
async function fetchFromSportMonksApi<T>(endpoint: string, params?: URLSearchParams): Promise<SportMonksApiResponse<T> | null> {
  const apiKey = process.env.SPORTMONKS_API_KEY;

  if (!apiKey) {
      console.error("SportMonks API key is missing. Please add SPORTMONKS_API_KEY to your .env file.");
      throw new Error("API key for SportMonks is not configured.");
  }
  
  let url = `https://api.sportmonks.com/v3/football/${endpoint}?api_token=${apiKey}`;
  if (params) {
      url += `&${params.toString()}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      // Cache results for 60 seconds to balance between real-time data and API usage
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SportMonks API Error Response:", errorText);
      throw new Error(`SportMonks API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from SportMonks API:`, error);
    return null;
  }
}

// Service function to get fixtures for a given date from SportMonks
export async function getFixturesByDateFromApi(): Promise<MatchType[]> {
  const today = getTodayDateString();
  const params = new URLSearchParams({
    include: 'league;participants;scores;periods',
  });
  const apiData = await fetchFromSportMonksApi<SportMonksFixture[]>(`fixtures/date/${today}`, params);
  return apiData ? mapSportMonksToMatchType(apiData.data) : [];
}

interface SportMonksCountry {
    id: number;
    continent_id: number;
    name: string;
    official_name: string;
    fifa_name: string;
    iso2: string;
    iso3: string;
    latitude: string;
    longitude: string;
    borders: string[];
    image_path: string;
}

// Example service function to get a country by its ID
export async function getCountryById(countryId: number): Promise<SportMonksCountry | null> {
  const apiData = await fetchFromSportMonksApi<SportMonksCountry>(`countries/${countryId}`);
  return apiData ? apiData.data : null;
}
