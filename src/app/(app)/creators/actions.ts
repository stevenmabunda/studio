'use server';

import { auth } from '@/lib/firebase/config';
import { getUserProfile } from '@/app/(app)/profile/actions';

export async function applyForCreatorProgram(tierName: string): Promise<{ mailto: string } | { error: string }> {
    const user = auth.currentUser;
    if (!user) {
        return { error: "You must be logged in to apply." };
    }

    const userProfile = await getUserProfile(user.uid);
    if (!userProfile) {
        return { error: "Could not retrieve user profile." };
    }

    const recipient = 'mabunda.stevenn@gmail.com';
    const subject = `Creator Program Application: ${tierName} - ${userProfile.displayName}`;
    const body = `A new user has applied for the ${tierName} tier in the BHOLO Creator Program.

User Details:
- Name: ${userProfile.displayName}
- Handle: @${userProfile.handle}
- User ID: ${userProfile.uid}
- Email: ${user.email}

Please review their account and follow up within 24 hours.
`;

    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return { mailto };
}
