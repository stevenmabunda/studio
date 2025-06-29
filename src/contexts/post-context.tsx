
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { initialPosts, type PostType } from '@/lib/data';
import type { Media } from '@/components/create-post';
import { useAuth } from '@/hooks/use-auth';

type PostContextType = {
  posts: PostType[];
  addPost: (data: { text: string; media: Media[] }) => void;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const { user } = useAuth();

  const addPost = ({ text, media }: { text: string; media: Media[] }) => {
    if (!user) {
        console.error("Cannot add post: user not logged in.");
        // Optionally, show a toast notification to the user
        return;
    }

    const newPost: PostType = {
      id: `post-${Date.now()}`,
      authorName: user.displayName || 'Anonymous User',
      authorHandle: user.email?.split('@')[0] || 'user',
      authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
      content: text,
      timestamp: 'Just now',
      comments: 0,
      reposts: 0,
      likes: 0,
      media: media.map(m => ({ ...m, hint: 'user uploaded content' })),
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <PostContext.Provider value={{ posts, addPost }}>
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
