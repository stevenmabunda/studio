'use server';

import { db } from '@/lib/firebase/config';
import {
  doc,
  getDoc,
  runTransaction,
  collection,
  addDoc,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';

export type ProfileData = {
  uid: string;
  displayName: string;
  handle: string;
  photoURL: string;
  bannerUrl: string;
  bio: string;
  location: string;
  website: string;
  joined: string;
  followersCount: number;
  followingCount: number;
};

export async function getUserProfile(
  profileId: string
): Promise<ProfileData | null> {
  if (!db) return null;
  const userDocRef = doc(db, 'users', profileId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    // This could be a seed user that doesn't have a full profile
    // Return a default structure
    if (profileId === 'bholo-bot') {
       return {
        uid: 'bholo-bot',
        displayName: 'BHOLO Bot',
        photoURL: 'https://placehold.co/128x128.png',
        handle: 'bholobot',
        joined: 'A while ago',
        bio: 'The official bot of BHOLO.',
        location: 'The Internet',
        website: '',
        bannerUrl: 'https://placehold.co/1200x400.png',
        followersCount: 999,
        followingCount: 1,
      };
    }
    return null;
  }

  const data = userDocSnap.data();
  return {
    uid: data.uid,
    displayName: data.displayName || 'User',
    photoURL: data.photoURL || 'https://placehold.co/128x128.png',
    handle: data.handle || 'user',
    joined: data.joined
      ? new Date(data.joined).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
      : 'recently',
    bio: data.bio || '',
    location: data.location || '',
    website: data.website || '',
    bannerUrl: data.bannerUrl || 'https://placehold.co/1200x400.png',
    followersCount: data.followersCount || 0,
    followingCount: data.followingCount || 0,
  };
}

export async function getIsFollowing(
  currentUserId: string,
  profileId: string
): Promise<boolean> {
  if (!db || currentUserId === profileId) return false;
  const followDocRef = doc(
    db,
    'users',
    currentUserId,
    'following',
    profileId
  );
  const followDocSnap = await getDoc(followDocRef);
  return followDocSnap.exists();
}

export async function toggleFollow(
  currentUserId: string,
  profileId: string,
  isCurrentlyFollowing: boolean
): Promise<{ success: boolean }> {
  if (!db || currentUserId === profileId) {
    return { success: false };
  }

  const currentUserFollowingRef = doc(
    db,
    'users',
    currentUserId,
    'following',
    profileId
  );
  const profileUserFollowersRef = doc(
    db,
    'users',
    profileId,
    'followers',
    currentUserId
  );
  const currentUserDocRef = doc(db, 'users', currentUserId);
  const profileUserDocRef = doc(db, 'users', profileId);

  try {
    await runTransaction(db, async (transaction) => {
      if (isCurrentlyFollowing) {
        // Unfollow
        transaction.delete(currentUserFollowingRef);
        transaction.delete(profileUserFollowersRef);
        transaction.update(currentUserDocRef, {
          followingCount: increment(-1),
        });
        transaction.update(profileUserDocRef, {
          followersCount: increment(-1),
        });
      } else {
        // Follow
        transaction.set(currentUserFollowingRef, {
          timestamp: serverTimestamp(),
        });
        transaction.set(profileUserFollowersRef, {
          timestamp: serverTimestamp(),
        });
        transaction.update(currentUserDocRef, {
          followingCount: increment(1),
        });
        transaction.update(profileUserDocRef, {
          followersCount: increment(1),
        });
      }
    });

    // Create notification only on follow
    if (!isCurrentlyFollowing) {
      const currentUserSnap = await getDoc(currentUserDocRef);
      const currentUserData = currentUserSnap.data();

      // Make sure the user being followed exists and is not a bot before sending a notification
      const profileUserSnap = await getDoc(profileUserDocRef);
      if (currentUserData && profileUserSnap.exists()) {
        const notificationRef = collection(db, 'users', profileId, 'notifications');
        await addDoc(notificationRef, {
          type: 'follow',
          fromUserId: currentUserId,
          fromUserName: currentUserData.displayName || 'User',
          fromUserAvatar:
            currentUserData.photoURL || 'https://placehold.co/40x40.png',
          createdAt: serverTimestamp(),
          read: false,
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Toggle follow transaction failed: ', error);
    return { success: false };
  }
}
