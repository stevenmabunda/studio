
'use server';

import {
  generateTrendingHashtags,
  type GenerateTrendingHashtagsInput,
  type GenerateTrendingHashtagsOutput,
} from '@/ai/flows/generate-trending-hashtags';
import { getFixturesByDateFromApi, getLiveMatchesFromSportMonks } from '@/services/sportmonks-service';
import type { MatchType, PostType } from '@/lib/data';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, orderBy, type Timestamp, limit, startAfter, doc, getDoc } from 'firebase/firestore';
import { formatTimestamp } from '@/lib/utils';


export async function getTrendingHashtags(
  input: GenerateTrendingHashtagsInput
): Promise<GenerateTrendingHashtagsOutput> {
  return await generateTrendingHashtags(input);
}

export async function getTodaysFixtures(): Promise<MatchType[]> {
  try {
    const matches = await getFixturesByDateFromApi();
    return matches;
  } catch (error) {
    console.error("Error in getTodaysFixtures server action:", error);
    return [];
  }
}

export async function getLiveMatches(): Promise<MatchType[]> {
  try {
    const matches = await getLiveMatchesFromSportMonks();
    return matches;
  } catch (error) {
    console.error("Error in getLiveMatches server action:", error);
    return [];
  }
}

export async function getFollowingPosts(userId: string): Promise<PostType[]> {
    if (!db) {
        return [];
    }

    try {
        // 1. Get the list of users the current user is following.
        const followingRef = collection(db, 'users', userId, 'following');
        const followingSnapshot = await getDocs(followingRef);
        const followingIds = followingSnapshot.docs.map(doc => doc.id);
        
        // Always include the user's own posts in their feed.
        if (!followingIds.includes(userId)) {
            followingIds.push(userId);
        }

        if (followingIds.length === 0) {
            return [];
        }

        // 2. Query for posts where the authorId is in the list of followed users.
        // Firestore 'in' query is limited to 30 items. For a larger app, this would need pagination or a different data model.
        const postsRef = collection(db, 'posts');
        const q = query(
            postsRef,
            where('authorId', 'in', followingIds.slice(0, 30)),
            orderBy('createdAt', 'desc'),
            limit(50) // Limit the number of posts fetched for performance.
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        // 3. Map documents to PostType objects.
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
                views: data.views,
                media: data.media,
                poll: data.poll,
                timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
                createdAt: createdAt
            } as PostType;
        });
        
        return posts;

    } catch (error) {
        console.error("Error fetching following posts:", error);
        return [];
    }
}

const DUMMY_USER_IDS = ['bholo-bot', 'user-jane-smith', 'user-john-doe', 'user-cristiano-ronaldo'];

export async function getRecentPosts(options: { limit?: number; lastPostId?: string } = {}): Promise<PostType[]> {
    if (!db) {
        return [];
    }

    try {
        const postsRef = collection(db, 'posts');
        const queryConstraints = [
            orderBy('createdAt', 'desc'),
            limit(options.limit || 20)
        ];

        if (options.lastPostId) {
            const lastPostDoc = await getDoc(doc(db, 'posts', options.lastPostId));
            if (lastPostDoc.exists()) {
                queryConstraints.push(startAfter(lastPostDoc));
            }
        }
        
        const q = query(postsRef, ...queryConstraints);

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        const posts = querySnapshot.docs
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
                    views: data.views,
                    media: data.media,
                    poll: data.poll,
                    timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
                    createdAt: createdAt
                } as PostType;
            })
            .filter(post => !DUMMY_USER_IDS.includes(post.authorId)); // Filter out dummy posts
        
        return posts;

    } catch (error) {
        console.error("Error fetching recent posts:", error);
        return [];
    }
}

export async function getVideoPosts(options: { limit?: number; lastPostId?: string } = {}): Promise<PostType[]> {
  if (!db) {
    return [];
  }

  try {
    const postsRef = collection(db, 'posts');
    const queryConstraints = [
      orderBy('createdAt', 'desc'),
      limit(options.limit || 10)
    ];

    if (options.lastPostId) {
      const lastPostDoc = await getDoc(doc(db, 'posts', options.lastPostId));
      if (lastPostDoc.exists()) {
        queryConstraints.push(startAfter(lastPostDoc));
      } else {
        console.warn(`lastPostId ${options.lastPostId} does not exist. Fetching from start.`);
      }
    }

    const q = query(postsRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const videoPosts: PostType[] = [];

    // Since we can't query for a non-empty array field directly without a composite index,
    // we fetch recent posts and then filter them until we have enough videos.
    // This is not perfectly efficient, but avoids complex index management for this feature.
    let lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    let attempts = 0;
    const maxAttempts = 5; // Prevent infinite loops
    
    while (videoPosts.length < (options.limit || 10) && lastVisible && attempts < maxAttempts) {
        const docs = querySnapshot.docs;

        for (const doc of docs) {
            const data = doc.data();
            const media = data.media as PostType['media'];
            if (media && media.some(m => m.type === 'video')) {
                 const createdAt = (data.createdAt as Timestamp)?.toDate();
                 videoPosts.push({
                    id: doc.id,
                    authorId: data.authorId,
                    authorName: data.authorName,
                    authorHandle: data.authorHandle,
                    authorAvatar: data.authorAvatar,
                    content: data.content,
                    comments: data.comments,
                    reposts: data.reposts,
                    likes: data.likes,
                    views: data.views,
                    media: data.media,
                    poll: data.poll,
                    timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
                    createdAt: createdAt
                } as PostType);
            }
        }
        
        // If we still don't have enough videos and there are more posts to fetch
        if (videoPosts.length < (options.limit || 10) && lastVisible && querySnapshot.size === (options.limit || 10)) {
            attempts++;
            const nextQuery = query(postsRef, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(options.limit || 10));
            const nextSnapshot = await getDocs(nextQuery);
            if (nextSnapshot.empty) {
                break; // No more posts to fetch
            }
            lastVisible = nextSnapshot.docs[nextSnapshot.docs.length - 1];
            // The logic seems to be flawed here. Let's simplify.
            // We will just filter the fetched posts. The logic to fetch more is complex and might not be needed if we fetch a larger batch initially.
        } else {
            break; // Exit loop if we have enough videos or no more posts
        }
    }


    // The above loop was flawed. A simpler approach for now is to just fetch a larger batch of posts and filter.
    const allPostsSnapshot = await getDocs(query(postsRef, orderBy('createdAt', 'desc'), limit(100)));
    const filteredVideoPosts = allPostsSnapshot.docs
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
          views: data.views,
          media: data.media,
          poll: data.poll,
          timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
          createdAt: createdAt
        } as PostType;
      })
      .filter(post => post.media && post.media.some(m => m.type === 'video'))
      .filter(post => !DUMMY_USER_IDS.includes(post.authorId));

    // Now, we apply pagination to the filtered video posts list in memory.
    if(options.lastPostId) {
        const lastIndex = filteredVideoPosts.findIndex(p => p.id === options.lastPostId);
        if (lastIndex !== -1) {
            return filteredVideoPosts.slice(lastIndex + 1, lastIndex + 1 + (options.limit || 10));
        }
    }

    return filteredVideoPosts.slice(0, options.limit || 10);

  } catch (error) {
    console.error("Error fetching video posts:", error);
    return [];
  }
}
