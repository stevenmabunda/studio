
'use server';

import { db } from '@/lib/firebase/config';
import type { PostType } from '@/lib/data';
import { collection, query, orderBy, getDocs, type Timestamp, where } from 'firebase/firestore';
import { formatTimestamp } from '@/lib/utils';

export async function getMostViewedPosts(): Promise<PostType[]> {
  if (!db) {
    console.error("Firestore not initialized, returning empty posts.");
    return [];
  }
  
  try {
    // 1. Get the timestamp for 24 hours ago.
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 2. Query for posts created in the last 24 hours.
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('createdAt', '>=', twentyFourHoursAgo));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    // 3. Map documents to PostType objects and filter for posts with images.
    let imagePosts = querySnapshot.docs
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
        } as PostType;
      })
      .filter(p => p.media && p.media.length > 0 && p.media.some(m => m.type === 'image'));

    if (imagePosts.length === 0) {
        return [];
    }
    
    // 4. Sort all recent image posts by views in descending order.
    imagePosts.sort((a, b) => (b.views || 0) - (a.views || 0));

    // 5. Take the top 15 posts.
    const topPosts = imagePosts.slice(0, 15);

    if (topPosts.length === 0) {
      return [];
    }

    // 6. Randomly select one to be the hero from the top 5. We already know they all have images.
    const heroCandidates = topPosts.slice(0, 5);
    
    const heroIndex = Math.floor(Math.random() * heroCandidates.length);
    const heroPost = heroCandidates[heroIndex];

    // 7. Create the final list, hero first, then the rest of the top posts.
    const remainingPosts = topPosts.filter(p => p.id !== heroPost.id);

    return [heroPost, ...remainingPosts];

  } catch (error) {
    console.error("Error fetching most viewed posts:", error);
    return [];
  }
}
