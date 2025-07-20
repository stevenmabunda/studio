
'use server';

import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, type Timestamp, doc, runTransaction, increment, collectionGroup, getDoc, where, setDoc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { z } from 'zod';
import type { PostType } from '@/lib/data';

const CreateTribeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.').max(50, 'Name must be 50 characters or less.'),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(280, 'Description must be 280 characters or less.'),
});

const UpdateTribeSchema = CreateTribeSchema;

export type Tribe = {
  id: string;
  name: string;
  description: string;
  bannerUrl: string;
  creatorId: string;
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
  const bannerFile = formData.get('banner') as File | null;

  const validation = CreateTribeSchema.safeParse({ name, description });
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  if (!bannerFile || bannerFile.size === 0) {
    return { success: false, error: 'A tribe banner image is required.' };
  }

  try {
    // 1. Create a document reference first to get a unique ID.
    const tribeDocRef = doc(collection(db, 'tribes'));
    const tribeId = tribeDocRef.id;

    // 2. Upload the banner image using the new tribe ID for the path.
    const bannerRef = ref(storage, `tribes/${tribeId}/banner`);
    await uploadBytes(bannerRef, bannerFile);
    const imageUrl = await getDownloadURL(bannerRef);
    
    // 3. Now, create the document in Firestore with all the data.
    await setDoc(tribeDocRef, {
      name,
      description,
      bannerUrl: imageUrl,
      creatorId: userId,
      createdAt: serverTimestamp(),
      memberCount: 1, // Start with the creator as a member
    });
    
    // 4. Automatically add the creator to the members subcollection.
    const memberRef = doc(db, 'tribes', tribeId, 'members', userId);
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
    if (error instanceof Error) {
        return { success: false, error: `Failed to create tribe: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred while creating the tribe.' };
  }
}

export async function updateTribe(
  tribeId: string,
  userId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  if (!db || !storage || !userId) {
    return { success: false, error: 'Service not available.' };
  }

  const tribeRef = doc(db, 'tribes', tribeId);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const newBannerFile = formData.get('banner') as File | null;
  
  const validation = UpdateTribeSchema.safeParse({ name, description });
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const tribeDoc = await getDoc(tribeRef);
    if (!tribeDoc.exists() || tribeDoc.data().creatorId !== userId) {
      return { success: false, error: "You don't have permission to edit this tribe." };
    }
    
    const updateData: { name: string; description: string; bannerUrl?: string } = { name, description };
    
    if (newBannerFile && newBannerFile.size > 0) {
      const bannerRef = ref(storage, `tribes/${tribeId}/banner`);
      await uploadBytes(bannerRef, newBannerFile);
      updateData.bannerUrl = await getDownloadURL(bannerRef);
    }

    await updateDoc(tribeRef, updateData);
    return { success: true };

  } catch (error) {
    console.error("Error updating tribe:", error);
    return { success: false, error: 'Failed to update tribe.' };
  }
}

export async function deleteTribe(
  tribeId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!db || !storage || !userId) {
    return { success: false, error: 'Service not available.' };
  }

  const tribeRef = doc(db, 'tribes', tribeId);

  try {
    const tribeDoc = await getDoc(tribeRef);
    if (!tribeDoc.exists()) {
      return { success: false, error: "Tribe not found." };
    }
    if (tribeDoc.data().creatorId !== userId) {
      return { success: false, error: "You don't have permission to delete this tribe." };
    }

    const batch = writeBatch(db);

    // 1. Delete all posts in the tribe
    const postsQuery = query(collection(db, 'posts'), where('tribeId', '==', tribeId));
    const postsSnapshot = await getDocs(postsQuery);
    postsSnapshot.forEach(doc => batch.delete(doc.ref));

    // 2. Delete all members in the tribe
    const membersQuery = query(collection(db, 'tribes', tribeId, 'members'));
    const membersSnapshot = await getDocs(membersQuery);
    membersSnapshot.forEach(doc => batch.delete(doc.ref));
    
    // 3. Delete the tribe document itself
    batch.delete(tribeRef);

    // Commit all Firestore deletions
    await batch.commit();

    // 4. Delete the banner image from storage
    try {
      const bannerRef = ref(storage, `tribes/${tribeId}/banner`);
      await deleteObject(bannerRef);
    } catch (storageError: any) {
        // If the image doesn't exist, that's okay. We still want to proceed.
        if (storageError.code !== 'storage/object-not-found') {
            console.error("Error deleting tribe banner from storage:", storageError);
            // Non-critical error, so we don't return failure, but we log it.
        }
    }
    
    return { success: true };

  } catch (error) {
    console.error("Error deleting tribe:", error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
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
                creatorId: data.creatorId,
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
      const parentDoc = doc.ref.parent.parent;
      if (doc.id === userId && parentDoc && parentDoc.path.startsWith('tribes/')) {
        // The parent of a member doc is the tribe doc.
        const tribeId = parentDoc.id;
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
            creatorId: data.creatorId,
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
