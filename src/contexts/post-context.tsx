
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { PostType } from '@/lib/data';
import type { Media } from '@/components/create-post';
import { useAuth } from '@/hooks/use-auth';
import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, type Timestamp } from 'firebase/firestore';
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

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'posts'));
            const querySnapshot = await getDocs(q);

            const docsWithData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            
            docsWithData.sort((a, b) => {
                const aDate = (a.createdAt as Timestamp)?.toDate() || new Date(0);
                const bDate = (b.createdAt as Timestamp)?.toDate() || new Date(0);
                return bDate.getTime() - aDate.getTime();
            });
    
            const postsData = docsWithData.map(data => {
                const createdAt = (data.createdAt as Timestamp)?.toDate();
                return {
                    id: data.id,
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
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchPosts();
  }, [user]);

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

            await uploadBytes(mediaRef, blob, { contentType: blob.type });
            const downloadURL = await getDownloadURL(mediaRef);
            return { url: downloadURL, type: m.type, hint: 'user uploaded content' };
        })
    );

    const postData = {
      authorName: user.displayName || 'Anonymous User',
      authorHandle: user.email?.split('@')[0] || 'user',
      authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
      content: text,
      createdAt: serverTimestamp(),
      comments: 0,
      reposts: 0,
      likes: 0,
      media: mediaUrls,
    };

    const docRef = await addDoc(collection(db, "posts"), postData);

    const newPost: PostType = {
        id: docRef.id,
        authorName: postData.authorName,
        authorHandle: postData.authorHandle,
        authorAvatar: postData.authorAvatar,
        content: postData.content,
        timestamp: 'Just now',
        comments: postData.comments,
        reposts: postData.reposts,
        likes: postData.likes,
        media: postData.media,
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);
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
