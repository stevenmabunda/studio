
'use server';

import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, type Timestamp, doc, runTransaction, increment, collectionGroup, getDoc, where, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { z } from 'zod';
import type { PostType } from '@/lib/data';
import { formatTimestamp } from '@/lib/utils';


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

export type CommunityMember = {
    uid: string;
    displayName: string;
    handle: string;
    photoURL: string;
}

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

    const communityDocRef = await addDoc(collection(db, 'communities'), {
      name,
      description,
      bannerUrl: imageUrl,
      creatorId: userId,
      createdAt: serverTimestamp(),
      memberCount: 1, // Start with the creator as a member
    });
    
    // Automatically add the creator to the members subcollection
    const memberRef = doc(db, 'communities', communityDocRef.id, 'members', userId);
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

export async function getJoinedCommunityIds(userId: string): Promise<string[]> {
  if (!db || !userId) {
    return [];
  }
  // Query the entire 'members' collection group.
  const membersQuery = query(collectionGroup(db, 'members'));
  const snapshot = await getDocs(membersQuery);
  
  const communityIds = new Set<string>();
  snapshot.forEach(doc => {
      // The document ID of a member doc is the userId.
      if (doc.id === userId) {
        // The parent of a member doc is the community doc.
        const communityId = doc.ref.parent.parent?.id;
        if (communityId) {
            communityIds.add(communityId);
        }
      }
  });

  return Array.from(communityIds);
}


export async function toggleCommunityMembership(
  userId: string,
  communityId: string,
  isMember: boolean
): Promise<{ success: boolean; newMemberCount?: number }> {
  if (!db || !userId) {
    return { success: false };
  }

  const communityRef = doc(db, 'communities', communityId);
  const memberRef = doc(db, 'communities', communityId, 'members', userId);

  try {
    let newMemberCount = 0;
    await runTransaction(db, async (transaction) => {
        const communityDoc = await transaction.get(communityRef);
        if (!communityDoc.exists()) {
            throw new Error("Community not found!");
        }

        const currentMemberCount = communityDoc.data().memberCount || 0;

        if (isMember) {
            // Leave community
            newMemberCount = Math.max(0, currentMemberCount - 1);
            transaction.update(communityRef, { memberCount: increment(-1) });
            transaction.delete(memberRef);
        } else {
            // Join community
            newMemberCount = currentMemberCount + 1;
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();
            transaction.update(communityRef, { memberCount: increment(1) });
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
    console.error("Error toggling community membership:", error);
    return { success: false };
  }
}

export async function getCommunityDetails(communityId: string): Promise<Community | null> {
    if (!db) return null;
    const communityRef = doc(db, 'communities', communityId);
    const docSnap = await getDoc(communityRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            description: data.description,
            bannerUrl: data.bannerUrl,
            memberCount: data.memberCount,
        } as Community;
    } else {
        return null;
    }
}

export async function getCommunityPosts(communityId: string): Promise<PostType[]> {
    if (!db) return [];
    
    const postsRef = collection(db, 'posts');
    // Remove orderBy to avoid needing a composite index. Sorting is handled client-side.
    const q = query(postsRef, where('communityId', '==', communityId));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
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
            createdAt: data.createdAt as Timestamp,
        } as PostType;
    });
}

export async function getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    if (!db) return [];

    const membersRef = collection(db, 'communities', communityId, 'members');
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
