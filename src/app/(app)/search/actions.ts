
'use server';

import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, limit, orderBy, type Timestamp } from 'firebase/firestore';
import type { Tribe } from '@/app/(app)/tribes/actions';
import type { PostType } from '@/lib/data';
import type { ProfileData } from '@/app/(app)/profile/actions';
import { formatTimestamp } from '@/lib/utils';

export type SearchResults = {
  users: ProfileData[];
  tribes: Tribe[];
  posts: PostType[];
};

// Firestore doesn't support case-insensitive or substring searches natively.
// This function simulates a "starts with" search, which is case-sensitive.
// For a real-world app, a dedicated search service like Algolia or Elasticsearch is recommended.
export async function searchEverything(searchText: string): Promise<SearchResults> {
  if (!db || !searchText) {
    return { users: [], tribes: [], posts: [] };
  }

  const normalizedQuery = searchText.toLowerCase();
  const endQuery = normalizedQuery + '\uf8ff';

  try {
    // Search Users by displayName (case-sensitive "starts with")
    const usersByNameQuery = query(
      collection(db, 'users'),
      where('displayName', '>=', searchText),
      where('displayName', '<=', searchText + '\uf8ff'),
      limit(5)
    );
    // Search Users by handle (case-sensitive "starts with")
    const usersByHandleQuery = query(
        collection(db, 'users'),
        where('handle', '>=', searchText),
        where('handle', '<=', searchText + '\uf8ff'),
        limit(5)
      );

    // Search Tribes by name (case-sensitive "starts with")
    const tribesQuery = query(
      collection(db, 'tribes'),
      where('name', '>=', searchText),
      where('name', '<=', searchText + '\uf8ff'),
      limit(5)
    );

    // For posts, a direct query is inefficient without a proper search index.
    // We will fetch all posts and filter them in memory.
    // This is not scalable but works for a demo.
    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    // Execute all queries in parallel
    const [userByNameSnap, userByHandleSnap, tribeSnap, postsSnap] = await Promise.all([
      getDocs(usersByNameQuery),
      getDocs(usersByHandleQuery),
      getDocs(tribesQuery),
      getDocs(postsQuery)
    ]);

    // Process and merge user results, ensuring no duplicates
    const usersMap = new Map<string, ProfileData>();
    userByNameSnap.docs.forEach(doc => {
        const data = doc.data();
        usersMap.set(doc.id, {
            uid: doc.id,
            displayName: data.displayName || 'User',
            handle: data.handle || 'user',
            photoURL: data.photoURL || 'https://placehold.co/128x128.png',
            bio: data.bio || '',
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0,
            // Add other fields with defaults
            bannerUrl: data.bannerUrl || 'https://placehold.co/1200x400.png',
            location: data.location || '',
            country: data.country || '',
            favouriteClub: data.favouriteClub || '',
            joined: data.joined ? new Date(data.joined).toLocaleDateString() : '',
        } as ProfileData);
    });
    userByHandleSnap.docs.forEach(doc => {
        if (!usersMap.has(doc.id)) {
            const data = doc.data();
            usersMap.set(doc.id, {
                uid: doc.id,
                displayName: data.displayName || 'User',
                handle: data.handle || 'user',
                photoURL: data.photoURL || 'https://placehold.co/128x128.png',
                bio: data.bio || '',
                followersCount: data.followersCount || 0,
                followingCount: data.followingCount || 0,
                bannerUrl: data.bannerUrl || 'https://placehold.co/1200x400.png',
                location: data.location || '',
                country: data.country || '',
                favouriteClub: data.favouriteClub || '',
                joined: data.joined ? new Date(data.joined).toLocaleDateString() : '',
            } as ProfileData);
        }
    });


    const tribes = tribeSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        bannerUrl: doc.data().bannerUrl,
        memberCount: doc.data().memberCount || 0,
    } as Tribe));

    // Filter posts in-memory
    const posts = postsSnap.docs.map(doc => {
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
        } as PostType;
    }).filter(post => post.content.toLowerCase().includes(normalizedQuery));


    return {
      users: Array.from(usersMap.values()),
      tribes,
      posts,
    };
  } catch (error) {
    console.error("Error during search:", error);
    return { users: [], tribes: [], posts: [] };
  }
}
