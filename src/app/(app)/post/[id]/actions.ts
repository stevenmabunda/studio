'use server';

import { db } from '@/lib/firebase/config';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import type { PostType } from '@/lib/data';
import { formatTimestamp } from '@/lib/utils';

export async function getPost(postId: string): Promise<PostType | null> {
    if (!db || !postId) return null;

    const postRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(postRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate();
        const post: PostType = {
            id: docSnap.id,
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
            createdAt: createdAt ? createdAt.toISOString() : undefined,
        };
        return post;
    } else {
        return null;
    }
}
