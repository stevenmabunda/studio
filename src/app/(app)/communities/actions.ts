'use server';

import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, type Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { z } from 'zod';

const CreateCommunitySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.').max(50, 'Name must be 50 characters or less.'),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(280, 'Description must be 280 characters or less.'),
});

export type Community = {
  id: string;
  name: string;
  description: string;
  bannerUrl: string;
  memberCount: number;
};

export async function createCommunity(
  userId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  if (!db || !storage || !userId) {
    return { success: false, error: 'Service not available.' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const profilePic = formData.get('profilePic') as File;

  const validation = CreateCommunitySchema.safeParse({ name, description });
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }

  let imageUrl = 'https://placehold.co/600x200.png';

  try {
    if (profilePic && profilePic.size > 0) {
      const communityPicRef = ref(storage, `communities/${Date.now()}_${profilePic.name}`);
      await uploadBytes(communityPicRef, profilePic);
      imageUrl = await getDownloadURL(communityPicRef);
    }

    await addDoc(collection(db, 'communities'), {
      name,
      description,
      bannerUrl: imageUrl,
      creatorId: userId,
      createdAt: serverTimestamp(),
      memberCount: 1,
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating community:', error);
    return { success: false, error: 'Failed to create community.' };
  }
}

export async function getCommunities(): Promise<Community[]> {
    if (!db) {
        console.error("Firestore not initialized.");
        return [];
    }

    try {
        const communitiesRef = collection(db, 'communities');
        const q = query(communitiesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                description: data.description,
                bannerUrl: data.bannerUrl,
                memberCount: data.memberCount,
            } as Community;
        });

    } catch (error) {
        console.error("Error fetching communities:", error);
        return [];
    }
}
