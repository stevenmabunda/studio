'use server';

import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import type { PostType } from '@/lib/data';
import { formatTimestamp } from '@/lib/utils';
import type { Timestamp } from 'firebase/firestore';

export async function getBookmarkedPosts(userId: string): Promise<PostType[]> {
  if (!db || !userId) {
    return [];
  }

  const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
  const q = query(bookmarksRef, orderBy('createdAt', 'desc'));
  
  try {
    const bookmarksSnapshot = await getDocs(q);
    const postIds = bookmarksSnapshot.docs.map(doc => doc.id);

    if (postIds.length === 0) {
        return [];
    }

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

    return bookmarkedPosts;
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error);
    return [];
  }
}
