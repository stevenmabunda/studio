'use server';

import { getStandingsBySeasonId, type SportMonksStanding } from "@/services/sportmonks-service";

export interface Standing {
    position: number;
    team: {
        name: string;
        logo: string;
    };
    played: number;
    goalDifference: number;
    points: number;
}

// Helper function to extract a specific detail value from the details array
const getDetailValue = (details: SportMonksStanding['details'], typeId: number): number => {
    const detail = details.find(d => d.type_id === typeId);
    return detail ? detail.value : 0;
};


export async function getLeagueStandings(seasonId?: number): Promise<Standing[]> {
    try {
        const standingsData = await getStandingsBySeasonId(seasonId);

        if (!standingsData) {
            return [];
        }

        const mappedStandings: Standing[] = standingsData.map(standing => {
            const played = getDetailValue(standing.details, 13); // 13 is games played
            const goalsFor = getDetailValue(standing.details, 23); // 23 is goals for
            const goalsAgainst = getDetailValue(standing.details, 24); // 24 is goals against
            const goalDifference = goalsFor - goalsAgainst;

            return {
                position: standing.position,
                team: {
                    name: standing.participant.name,
                    logo: standing.participant.image_path,
                },
                played: played,
                goalDifference: goalDifference,
                points: standing.points,
            };
        });

        return mappedStandings;
    } catch (error) {
        console.error("Error in getLeagueStandings server action:", error);
        return [];
    }
}
