
'use server';

import { db } from '@/lib/firebase/config';
import { getUserProfile } from '@/app/(app)/profile/actions';
import { getDoc, doc } from 'firebase/firestore';

export async function applyForCreatorProgram(userId: string, tierName: string): Promise<{ mailto: string } | { error: string }> {
    if (!userId) {
        return { error: "You must be logged in to apply." };
    }

    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
        return { error: "Could not retrieve user profile." };
    }
    
    // The user object from `getUserProfile` might not contain the email.
    // Let's fetch the full user doc to be sure.
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userEmail = userDoc.data()?.email;

    if (!userEmail) {
        return { error: "Could not retrieve user email." };
    }


    const recipient = 'mabunda.stevenn@gmail.com';
    const subject = `Creator Program Application: ${tierName} - ${userProfile.displayName}`;
    const body = `A new user has applied for the ${tierName} tier in the BHOLO Creator Program.

User Details:
- Name: ${userProfile.displayName}
- Handle: @${userProfile.handle}
- User ID: ${userProfile.uid}
- Email: ${userEmail}

Please review their account and follow up within 24 hours.
`;

    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return { mailto };
}
