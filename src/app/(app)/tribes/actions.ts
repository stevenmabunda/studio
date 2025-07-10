
'use server';

import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, type Timestamp, doc, runTransaction, increment, collectionGroup, getDoc, where, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { z } from 'zod';
import type { PostType } from '@/lib/data';
import { formatTimestamp } from '@/lib/utils';


const CreateTribeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.').max(50, 'Name must be 50 characters or less.'),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(280, 'Description must be 280 characters or less.'),
});

export type Tribe = {
  id: string;
  name: string;
  description: string;
  bannerUrl: string;
  memberCount: number;
};

export type TribeMember = {
    uid: string;
    displayName: string;
    handle: string;
    photoURL: string;
}

export async function createTribe(
  userId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  if (!db || !storage || !userId) {
    return { success: false, error: 'Service not available.' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const profilePic = formData.get('profilePic') as File;

  const validation = CreateTribeSchema.safeParse({ name, description });
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }

  let imageUrl = 'https://placehold.co/600x200.png';

  try {
    if (profilePic && profilePic.size > 0) {
      const tribePicRef = ref(storage, `tribes/${Date.now()}_${profilePic.name}`);
      await uploadBytes(tribePicRef, profilePic);
      imageUrl = await getDownloadURL(tribePicRef);
    }

    const tribeDocRef = await addDoc(collection(db, 'tribes'), {
      name,
      description,
      bannerUrl: imageUrl,
      creatorId: userId,
      createdAt: serverTimestamp(),
      memberCount: 1, // Start with the creator as a member
    });
    
    // Automatically add the creator to the members subcollection
    const memberRef = doc(db, 'tribes', tribeDocRef.id, 'members', userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    await setDoc(memberRef, { 
      joinedAt: serverTimestamp(),
      displayName: userData?.displayName || 'User',
      handle: userData?.handle || 'user',
      photoURL: userData?.photoURL || 'https://placehold.co/40x40.png'
    });


    return { success: true };
  } catch (error) {
    console.error('Error creating tribe:', error);
    return { success: false, error: 'Failed to create tribe.' };
  }
}

export async function getTribes(): Promise<Tribe[]> {
    if (!db) {
        console.error("Firestore not initialized.");
        return [];
    }

    try {
        const tribesRef = collection(db, 'tribes');
        const q = query(tribesRef, orderBy('createdAt', 'desc'));
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
            } as Tribe;
        });

    } catch (error) {
        console.error("Error fetching tribes:", error);
        return [];
    }
}

export async function getJoinedTribeIds(userId: string): Promise<string[]> {
  if (!db || !userId) {
    return [];
  }
  // Query the entire 'members' collection group.
  const membersQuery = query(collectionGroup(db, 'members'));
  const snapshot = await getDocs(membersQuery);
  
  const tribeIds = new Set<string>();
  snapshot.forEach(doc => {
      // The document ID of a member doc is the userId.
      if (doc.id === userId && doc.ref.parent.parent?.path.startsWith('tribes/')) {
        // The parent of a member doc is the tribe doc.
        const tribeId = doc.ref.parent.parent?.id;
        if (tribeId) {
            tribeIds.add(tribeId);
        }
      }
  });

  return Array.from(tribeIds);
}


export async function toggleTribeMembership(
  userId: string,
  tribeId: string,
  isMember: boolean
): Promise<{ success: boolean; newMemberCount?: number }> {
  if (!db || !userId) {
    return { success: false };
  }

  const tribeRef = doc(db, 'tribes', tribeId);
  const memberRef = doc(db, 'tribes', tribeId, 'members', userId);

  try {
    let newMemberCount = 0;
    await runTransaction(db, async (transaction) => {
        const tribeDoc = await transaction.get(tribeRef);
        if (!tribeDoc.exists()) {
            throw new Error("Tribe not found!");
        }

        const currentMemberCount = tribeDoc.data().memberCount || 0;

        if (isMember) {
            // Leave tribe
            newMemberCount = Math.max(0, currentMemberCount - 1);
            transaction.update(tribeRef, { memberCount: increment(-1) });
            transaction.delete(memberRef);
        } else {
            // Join tribe
            newMemberCount = currentMemberCount + 1;
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();
            transaction.update(tribeRef, { memberCount: increment(1) });
            transaction.set(memberRef, { 
                joinedAt: serverTimestamp(),
                displayName: userData?.displayName || 'User',
                handle: userData?.handle || 'user',
                photoURL: userData?.photoURL || 'https://placehold.co/40x40.png'
            });
        }
    });
    return { success: true, newMemberCount };
  } catch (error) {
    console.error("Error toggling tribe membership:", error);
    return { success: false };
  }
}

export async function getTribeDetails(tribeId: string): Promise<Tribe | null> {
    if (!db) return null;
    const tribeRef = doc(db, 'tribes', tribeId);
    const docSnap = await getDoc(tribeRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            description: data.description,
            bannerUrl: data.bannerUrl,
            memberCount: data.memberCount,
        } as Tribe;
    } else {
        return null;
    }
}

export async function getTribePosts(tribeId: string): Promise<PostType[]> {
    if (!db) return [];
    
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('tribeId', '==', tribeId));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt as Timestamp | undefined;
        return {
            id: doc.id,
            authorId: data.authorId,
            authorName: data.authorName,
            authorHandle: data.authorHandle,
            authorAvatar: data.authorAvatar,
            content: data.content,
            comments: data.comments,
            reposts: data.reposts,
            likes: data.likes,
            media: data.media,
            poll: data.poll,
            timestamp: 'now', // Placeholder, sorting happens on client
            createdAt: createdAt?.toDate().toISOString(), // Convert to ISO string
        } as PostType;
    });
}

export async function getTribeMembers(tribeId: string): Promise<TribeMember[]> {
    if (!db) return [];

    const membersRef = collection(db, 'tribes', tribeId, 'members');
    const q = query(membersRef, orderBy('joinedAt', 'desc'));
    const memberSnapshots = await getDocs(q);

    if (memberSnapshots.empty) {
        return [];
    }

    // Now, the member documents themselves contain the user data we need.
    return memberSnapshots.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id, // The document ID is the user's UID
            displayName: data.displayName || 'Unknown User',
            handle: data.handle || 'user',
            photoURL: data.photoURL || 'https://placehold.co/40x40.png',
        };
    });
}
