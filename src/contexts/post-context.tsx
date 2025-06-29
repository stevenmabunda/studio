'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { initialPosts, type PostType, users } from '@/lib/data';
import type { Media } from '@/components/create-post';

type PostContextType = {
  posts: PostType[];
  addPost: (data: { text: string; media: Media[] }) => void;
};

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);

  const addPost = ({ text, media }: { text: string; media: Media[] }) => {
    const newPost: PostType = {
      id: `post-${Date.now()}`,
      authorName: users.yourhandle.name,
      authorHandle: users.yourhandle.handle,
      authorAvatar: users.yourhandle.avatar,
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
