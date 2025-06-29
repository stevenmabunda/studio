
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { PostType } from '@/lib/data';
import type { Media } from '@/components/create-post';
import { useAuth } from '@/hooks/use-auth';
import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, type Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatDistanceToNow } from 'date-fns';

type PostContextType = {
  posts: PostType[];
  addPost: (data: { text: string; media: Media[] }) => Promise<void>;
  loading: boolean;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate();
            return {
                id: doc.id,
                authorName: data.authorName,
                authorHandle: data.authorHandle,
                authorAvatar: data.authorAvatar,
                content: data.content,
                comments: data.comments,
                reposts: data.reposts,
                likes: data.likes,
                media: data.media,
                timestamp: createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'Just now',
            } as PostType;
        });
        setPosts(postsData);
        setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPost = async ({ text, media }: { text: string; media: Media[] }) => {
    if (!user || !db || !storage) {
        throw new Error("Cannot add post: user not logged in or Firebase not configured.");
    }

    const mediaUrls = await Promise.all(
        media.map(async (m) => {
            const fileName = crypto.randomUUID();
            const mediaRef = ref(storage, `posts/${user.uid}/${fileName}`);
            const response = await fetch(m.url);
            const blob = await response.blob();

            // Explicitly set content type for robustness.
            await uploadBytes(mediaRef, blob, { contentType: blob.type });
            const downloadURL = await getDownloadURL(mediaRef);
            return { url: downloadURL, type: m.type, hint: 'user uploaded content' };
        })
    );

    await addDoc(collection(db, "posts"), {
      authorName: user.displayName || 'Anonymous User',
      authorHandle: user.email?.split('@')[0] || 'user',
      authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
      content: text,
      createdAt: serverTimestamp(),
      comments: 0,
      reposts: 0,
      likes: 0,
      media: mediaUrls,
    });
  };

  return (
    <PostContext.Provider value={{ posts, addPost, loading }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}
