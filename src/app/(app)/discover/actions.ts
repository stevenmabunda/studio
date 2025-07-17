
'use server';

import { db } from '@/lib/firebase/config';
import type { PostType } from '@/lib/data';
import { collection, query, orderBy, getDocs, type Timestamp, limit } from 'firebase/firestore';
import { formatTimestamp } from '@/lib/utils';

export async function getMostViewedPosts(): Promise<PostType[]> {
  if (!db) {
    console.error("Firestore not initialized, returning empty posts.");
    return [];
  }
  
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('views', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

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
      } as PostType;
    });
    
    return posts;

  } catch (error) {
    console.error("Error fetching most viewed posts:", error);
    return [];
  }
}
