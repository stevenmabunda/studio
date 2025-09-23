
'use server';

import { getRoundWithOdds, type OddsFixture, getCurrentRoundForLeague } from "@/services/sportmonks-service";

const SCOTTISH_PREMIERSHIP_LEAGUE_ID = 501;

export async function getBettingOdds(): Promise<OddsFixture[]> {
    try {
        const currentRoundId = await getCurrentRoundForLeague(SCOTTISH_PREMIERSHIP_LEAGUE_ID);
        if (!currentRoundId) {
            console.warn(`Could not find a current round for league ID ${SCOTTISH_PREMIERSHIP_LEAGUE_ID}.`);
            return [];
        }

        const round = await getRoundWithOdds(currentRoundId);
        if (!round) {
            return [];
        }
        return round.fixtures;
    } catch (error) {
        console.error("Error in getBettingOdds server action:", error);
        return [];
    }
}
