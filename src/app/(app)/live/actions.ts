'use server';

import { getStandingsBySeasonId, type SportMonksStanding } from "@/services/sportmonks-service";

export async function getStandings(): Promise<SportMonksStanding[]> {
    return getStandingsBySeasonId();
}
