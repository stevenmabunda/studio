'use server';

import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, getDoc, type Timestamp } from 'firebase/firestore';
import type { PostType } from '@/lib/data';
import { formatTimestamp } from '@/lib/utils';

export async function getBookmarkedPosts(userId: string): Promise<PostType[]> {
  if (!db || !userId) {
    return [];
  }

  // Path to the user's bookmarks collection
  const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
  
  try {
    // Fetch all bookmark documents without server-side ordering to avoid index issues.
    const bookmarksSnapshot = await getDocs(bookmarksRef);
    
    // Create an array of bookmarks with their creation timestamps.
    const bookmarksWithTimestamp = bookmarksSnapshot.docs.map(doc => ({
        id: doc.id,
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(0) // Fallback date
    }));

    // Sort the bookmarks by timestamp in descending order on the server.
    bookmarksWithTimestamp.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const postIds = bookmarksWithTimestamp.map(bookmark => bookmark.id);

    if (postIds.length === 0) {
        return [];
    }

    // Fetch the actual post documents.
    const postPromises = postIds.map(postId => getDoc(doc(db, 'posts', postId)));
    const postDocs = await Promise.all(postPromises);

    const bookmarkedPosts = postDocs
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

    // The order of postDocs from Promise.all matches the order of postIds,
    // so we don't need to re-sort here.
    return bookmarkedPosts;
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error);
    return [];
  }
}
