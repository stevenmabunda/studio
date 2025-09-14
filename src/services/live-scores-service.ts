// IMPORTANT: This file should not be marked with 'use server'
// as it is a pure data-fetching utility and doesn't need to be
// directly callable from the client. It will be used by server actions.

import type { MatchType } from '@/lib/data';
import { getLiveMatchesFromSportMonks } from './sportmonks-service';


// Service function to get live matches.
// This now acts as a wrapper around the SportMonks service.
export async function getLiveMatchesFromApi(): Promise<MatchType[]> {
  // Directly call the function from the SportMonks service.
  // This simplifies the logic and ensures we use the correctly configured API.
  return getLiveMatchesFromSportMonks();
}
