// IMPORTANT: This file should not be marked with 'use server'
// as it is a pure data-fetching utility and doesn't need to be
// directly callable from the client. It will be used by server actions.

import type { MatchType } from '@/lib/data';

// This is the structure we expect from the MLB Stats API 'schedule' endpoint
interface MlbApiGame {
    gamePk: number;
    gameDate: string;
    status: {
        abstractGameState: 'Live' | 'Final' | 'Preview';
        detailedState: string;
    };
    teams: {
        away: {
            score: number;
            team: { id: number; name: string };
            isWinner: boolean;
        };
        home: {
            score: number;
            team: { id: number; name: string };
            isWinner: boolean;
        };
    };
    linescore?: {
        currentInning?: number;
        inningState?: 'Top' | 'Bottom' | 'Middle' | 'End';
    };
    venue: { name: string };
}

interface MlbApiResponse {
  dates: {
    date: string;
    games: MlbApiGame[];
  }[];
}


// A helper function to map the API response to our app's MatchType
function mapApiDataToMatchType(apiData: MlbApiResponse): MatchType[] {
  if (!apiData || !apiData.dates || apiData.dates.length === 0) {
    return [];
  }

  const allGames = apiData.dates.flatMap(date => date.games);

  return allGames.map(game => {
    const isLive = game.status.abstractGameState === 'Live';
    const isUpcoming = game.status.abstractGameState === 'Preview';

    let timeOrStatus: string;
    if (isLive && game.linescore?.currentInning) {
        const inningState = game.linescore.inningState === 'Bottom' ? 'Bot' : 'Top';
        timeOrStatus = `${inningState} ${game.linescore.currentInning}`;
    } else if (isUpcoming) {
        const gameDate = new Date(game.gameDate);
        timeOrStatus = gameDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } else {
        timeOrStatus = game.status.detailedState;
    }
    
    return {
      id: game.gamePk,
      team1: {
        name: game.teams.home.team.name,
        // MLB API doesn't provide easy-to-access logos in this endpoint, so we use placeholders
        logo: `https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`,
      },
      team2: {
        name: game.teams.away.team.name,
        logo: `https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`,
      },
      score: !isUpcoming ? `${game.teams.home.score} - ${game.teams.away.score}` : undefined,
      time: timeOrStatus,
      league: 'MLB', // The API is MLB-specific
      isLive: isLive,
      isUpcoming: isUpcoming,
    };
  });
}

// Reusable fetch function
async function fetchFromApi(): Promise<MlbApiResponse> {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
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
    console.error(`Failed to fetch from MLB API:`, error);
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