

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
  getDocs,
  type Timestamp,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore';
import type { PostType } from '@/lib/data';
import { formatTimestamp } from '@/lib/utils';

export type ProfileData = {
  uid: string;
  displayName: string;
  handle: string;
  photoURL: string;
  bannerUrl: string;
  bannerPosition?: number;
  bio: string;
  location: string;
  country: string;
  favouriteClub: string;
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
        country: 'Digital Realm',
        favouriteClub: 'All of them',
        bannerUrl: 'https://placehold.co/1200x400.png',
        bannerPosition: 50,
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
    country: data.country || '',
    favouriteClub: data.favouriteClub || '',
    bannerUrl: data.bannerUrl || 'https://placehold.co/1200x400.png',
    bannerPosition: data.bannerPosition === undefined ? 50 : data.bannerPosition,
    followersCount: data.followersCount || 0,
    followingCount: data.followingCount || 0,
  };
}

export async function getUserPosts(userId: string): Promise<PostType[]> {
    if (!db) return [];

    const postsRef = collection(db, 'posts');
    // Removed orderBy to avoid needing a composite index. We will sort in code.
    const q = query(postsRef, where('authorId', '==', userId));

    const querySnapshot = await getDocs(q);

    const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate();
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
            timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
            createdAt: createdAt // Keep original timestamp for sorting
        } as PostType & { createdAt?: Date };
    });

    // Sort posts by creation date descending
    posts.sort((a, b) => {
        const timeA = a.createdAt?.getTime() || 0;
        const timeB = b.createdAt?.getTime() || 0;
        return timeB - timeA;
    });

    // Remove the temporary createdAt from the final returned object if desired, although it's fine to keep.
    return posts.map(({ createdAt, ...rest }) => rest);
}

export async function getIsFollowing(
  currentUserId: string,
  profileId: string
): Promise<boolean> {
  if (!db || !currentUserId || !profileId || currentUserId === profileId) {
    return false;
  }
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

export async function getLikedPosts(userId: string): Promise<PostType[]> {
  if (!db || !userId) {
    return [];
  }

  const likesRef = collection(db, 'users', userId, 'likes');
  const q = query(likesRef, orderBy('createdAt', 'desc'));
  
  try {
    const likesSnapshot = await getDocs(q);
    
    if (likesSnapshot.empty) {
      return [];
    }

    const postIds = likesSnapshot.docs.map(doc => doc.id);

    // Fetch all the post documents in parallel.
    const postPromises = postIds.map(postId => getDoc(doc(db, 'posts', postId)));
    const postDocs = await Promise.all(postPromises);

    // Map Firestore documents to PostType objects, filtering out any that don't exist.
    const likedPosts = postDocs
        .filter(docSnap => docSnap.exists())
        .map(docSnap => {
            const data = docSnap.data()!;
            const createdAt = (data.createdAt as Timestamp)?.toDate();
            return {
                id: docSnap.id,
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
                timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
            } as PostType;
        });

    // The posts are already sorted by the `likes` collection query, so we can just return them.
    return likedPosts;

  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
}

export async function getMediaPosts(userId?: string): Promise<PostType[]> {
  if (!db) {
    return [];
  }

  const postsRef = collection(db, 'posts');
  let q;
  
  if (userId) {
    // If a userId is provided, query for that user's media posts, but don't sort by 'createdAt' in the query.
    q = query(
      postsRef, 
      where('authorId', '==', userId)
    );
  } else {
    // If no userId, fetch all posts and sort by creation date.
    q = query(postsRef, orderBy('createdAt', 'desc'));
  }


  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    let mediaPosts = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate();
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
          timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
          createdAt: createdAt // Keep the Date object for sorting
        } as PostType & { createdAt?: Date };
      })
      .filter(post => post.media && post.media.length > 0); // Filter for posts that have media

    // Sort by creation date descending in-memory if we didn't sort in the query
    if (userId) {
        mediaPosts.sort((a, b) => {
            const timeA = a.createdAt?.getTime() || 0;
            const timeB = b.createdAt?.getTime() || 0;
            return timeB - timeA;
        });
    }

    return mediaPosts.map(({ createdAt, ...rest }) => rest);

  } catch (error) {
    console.error("Error fetching media posts:", error);
    return [];
  }
}


export async function updateUserPosts(userId: string): Promise<{success: boolean, updatedCount: number, error?: string}> {
  if (!db || !userId) {
    return { success: false, updatedCount: 0, error: 'Database not available or user not specified.' };
  }

  try {
    // 1. Get the user's current profile data.
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, updatedCount: 0, error: 'User profile not found.' };
    }
    const userData = userSnap.data();
    const newAuthorName = userData.displayName;
    const newAuthorAvatar = userData.photoURL;

    // 2. Find all posts by this user.
    const postsQuery = query(collection(db, 'posts'), where('authorId', '==', userId));
    const postsSnapshot = await getDocs(postsQuery);
    
    if (postsSnapshot.empty) {
      return { success: true, updatedCount: 0 };
    }

    // 3. Create a batch write to update all posts.
    const batch = writeBatch(db);
    postsSnapshot.forEach(postDoc => {
      batch.update(postDoc.ref, {
        authorName: newAuthorName,
        authorAvatar: newAuthorAvatar,
      });
    });

    // 4. Commit the batch.
    await batch.commit();
    
    return { success: true, updatedCount: postsSnapshot.size };

  } catch (error) {
    console.error("Error updating user's posts:", error);
    return { success: false, updatedCount: 0, error: 'An unexpected error occurred.' };
  }
}

async function getFollowList(
  profileId: string,
  type: 'followers' | 'following'
): Promise<ProfileData[]> {
  if (!db) return [];

  const listRef = collection(db, 'users', profileId, type);
  const listSnap = await getDocs(listRef);

  if (listSnap.empty) {
    return [];
  }

  const userIds = listSnap.docs.map((doc) => doc.id);

  // Fetch user profiles for each ID
  const userPromises = userIds.map((id) => getUserProfile(id));
  const userProfiles = await Promise.all(userPromises);

  return userProfiles.filter((p): p is ProfileData => p !== null);
}

export async function getFollowers(profileId: string): Promise<ProfileData[]> {
  return getFollowList(profileId, 'followers');
}

export async function getFollowing(profileId: string): Promise<ProfileData[]> {
  return getFollowList(profileId, 'following');
}

export async function getUsersToFollow(currentUserId: string): Promise<ProfileData[]> {
    if (!db || !currentUserId) return [];
    
    try {
        // 1. Get the list of users the current user is already following.
        const followingRef = collection(db, 'users', currentUserId, 'following');
        const followingSnapshot = await getDocs(followingRef);
        const followingIds = new Set(followingSnapshot.docs.map(doc => doc.id));
        followingIds.add(currentUserId); // Also exclude the user themselves.

        // 2. Fetch all users, sorted by followers.
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('followersCount', 'desc'), limit(20)); // Fetch more to have a pool for filtering.
        const querySnapshot = await getDocs(q);

        // 3. Filter out users the current user already follows.
        const usersToSuggest = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              uid: doc.id,
              displayName: data.displayName || 'User',
              handle: data.handle || 'user',
              photoURL: data.photoURL || 'https://placehold.co/40x40.png',
              // These fields are not needed for the suggestion list but are part of the type
              bannerUrl: '', bio: '', country: '', favouriteClub: '', joined: '', followersCount: 0, followingCount: 0, location: '', bannerPosition: 50
            } as ProfileData;
          })
          .filter(user => !followingIds.has(user.uid)); // Exclude already followed users.

        // 4. Return the top 3 from the filtered list.
        return usersToSuggest.slice(0, 3);
    } catch (error) {
        console.error("Error getting users to follow:", error);
        return [];
    }
}
    
