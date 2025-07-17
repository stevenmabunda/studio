// IMPORTANT: This file should not be marked with 'use server'
// as it is a pure data-fetching utility and doesn't need to be
// directly callable from the client. It will be used by server actions.

import type { MatchType } from '@/lib/data';

// This is the structure we expect from the Ergast F1 API
interface F1RaceResult {
    number: string;
    position: string;
    points: string;
    Driver: {
        driverId: string;
        code: string;
        givenName: string;
        familyName: string;
    };
    Constructor: {
        constructorId: string;
        name: string;
    };
    laps: string;
    status: string;
}

interface F1Race {
    season: string;
    round: string;
    raceName: string;
    Circuit: {
        circuitName: string;
    };
    date: string;
    Results: F1RaceResult[];
}

interface F1ApiResponse {
    MRData: {
        RaceTable: {
            Races: F1Race[];
        };
    };
}


// A helper function to map the API response to our app's MatchType
function mapApiDataToMatchType(apiData: F1ApiResponse): MatchType[] {
    if (!apiData.MRData?.RaceTable?.Races?.[0]?.Results) {
        return [];
    }
    
    // We'll treat each driver's result as a "match" for this test
    const race = apiData.MRData.RaceTable.Races[0];
    const results = race.Results;

    // For "upcoming" we'll just show the top 5 from the results
    const upcoming = results.slice(0, 5).map(result => ({
        id: parseInt(result.position, 10),
        team1: { name: result.Driver.givenName, logo: 'https://placehold.co/40x40.png' },
        team2: { name: result.Driver.familyName, logo: 'https://placehold.co/40x40.png' },
        time: `Pos: ${result.position}`,
        league: race.raceName,
        isLive: false,
        isUpcoming: true,
    }));
    
    // For "live" we'll show a sample matchup from the results
    if (results.length >= 2) {
        const liveMatch: MatchType = {
            id: 999, // Static ID for the single live match
            team1: { name: results[0].Driver.code, logo: 'https://placehold.co/40x40.png' },
            team2: { name: results[1].Driver.code, logo: 'https://placehold.co/40x40.png' },
            score: `${results[0].laps} Laps`,
            time: 'Finished',
            league: `${race.season} ${race.raceName}`,
            isLive: true,
            isUpcoming: false,
        };
        return [liveMatch, ...upcoming];
    }

    return upcoming;
}

// Reusable fetch function
async function fetchFromApi(): Promise<F1ApiResponse> {
  const url = `https://ergast.com/api/f1/current/last/results.json`;

  try {
    const response = await fetch(url, {
      method: 'GET',
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
    console.error(`Failed to fetch from Ergast F1 API:`, error);
    throw error; // Re-throw to be handled by the caller
  }
}

// Service function to get live matches
export async function getLiveMatchesFromApi(): Promise<MatchType[]> {
  const apiData = await fetchFromApi();
  const allMatches = mapApiDataToMatchType(apiData);
  return allMatches.filter(match => match.isLive);
}

// Service function to get upcoming matches
export async function getUpcomingMatchesFromApi(): Promise<MatchType[]> {
  const apiData = await fetchFromApi();
  const allMatches = mapApiDataToMatchType(apiData);
  return allMatches.filter(match => match.isUpcoming);
}
