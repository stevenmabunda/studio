'use server';

import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, getDoc, type Timestamp } from 'firebase/firestore';
import type { PostType } from '@/lib/data';
import { formatTimestamp } from '@/lib/utils';

export async function getBookmarkedPosts(userId: string): Promise<PostType[]> {
  if (!db || !userId) {
    return [];
  }

  const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
  
  try {
    const bookmarksSnapshot = await getDocs(bookmarksRef);
    
    if (bookmarksSnapshot.empty) {
      return [];
    }

    // Create a map of postId -> creation date for sorting later.
    const bookmarkTimestamps = new Map<string, Date>();
    bookmarksSnapshot.docs.forEach(doc => {
        const createdAt = (doc.data().createdAt as Timestamp)?.toDate();
        // Only add bookmarks that have a valid timestamp.
        if (createdAt) {
            bookmarkTimestamps.set(doc.id, createdAt);
        }
    });

    const postIds = Array.from(bookmarkTimestamps.keys());

    if (postIds.length === 0) {
        return [];
    }

    // Fetch all the post documents in parallel.
    const postPromises = postIds.map(postId => getDoc(doc(db, 'posts', postId)));
    const postDocs = await Promise.all(postPromises);

    // Map Firestore documents to PostType objects, filtering out any that don't exist.
    let bookmarkedPosts = postDocs
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

    // Sort the final list of posts based on when they were bookmarked (most recent first).
    bookmarkedPosts.sort((a, b) => {
        const timeA = bookmarkTimestamps.get(a.id)?.getTime() || 0;
        const timeB = bookmarkTimestamps.get(b.id)?.getTime() || 0;
        return timeB - timeA;
    });

    return bookmarkedPosts;
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error);
    return [];
  }
}
