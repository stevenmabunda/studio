'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { FantasyPlayer } from '@/lib/dummy-players';
import { dummyPlayers } from '@/lib/dummy-players';

// Helper to map player IDs to full player objects
const mapIdsToPlayers = (playerIds: number[]): FantasyPlayer[] => {
    const playerMap = new Map(dummyPlayers.map(p => [p.id, p]));
    return playerIds.map(id => playerMap.get(id)).filter(p => p !== undefined) as FantasyPlayer[];
};

/**
 * Saves the user's fantasy squad to Firestore.
 * @param userId The ID of the current user.
 * @param squad The array of FantasyPlayer objects.
 */
export async function saveFantasySquad(userId: string, squad: FantasyPlayer[]): Promise<{ success: boolean }> {
    if (!db || !userId) {
        return { success: false };
    }

    const squadDocRef = doc(db, 'users', userId, 'fantasy', 'squad');
    const playerIds = squad.map(p => p.id);

    try {
        await setDoc(squadDocRef, { playerIds, updatedAt: new Date() });
        return { success: true };
    } catch (error) {
        console.error("Error saving fantasy squad:", error);
        return { success: false };
    }
}

/**
 * Retrieves the user's fantasy squad from Firestore.
 * @param userId The ID of the current user.
 * @returns A promise that resolves to an array of FantasyPlayer objects.
 */
export async function getFantasySquad(userId: string): Promise<FantasyPlayer[]> {
    if (!db || !userId) {
        return [];
    }
    
    const squadDocRef = doc(db, 'users', userId, 'fantasy', 'squad');

    try {
        const docSnap = await getDoc(squadDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const playerIds = data.playerIds as number[] || [];
            return mapIdsToPlayers(playerIds);
        }
        return [];
    } catch (error) {
        console.error("Error fetching fantasy squad:", error);
        return [];
    }
}
