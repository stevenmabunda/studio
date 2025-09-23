
'use server';

import { getRoundWithOdds, type OddsFixture } from "@/services/sportmonks-service";

const PREMIER_LEAGUE_CURRENT_ROUND_ID = 372199; // This should be dynamically updated

export async function getBettingOdds(): Promise<OddsFixture[]> {
    try {
        const round = await getRoundWithOdds(PREMIER_LEAGUE_CURRENT_ROUND_ID);
        if (!round) {
            return [];
        }
        return round.fixtures;
    } catch (error) {
        console.error("Error in getBettingOdds server action:", error);
        return [];
    }
}
