'use client';

import { CreatePost, type Media } from '@/components/create-post';
import { Post } from '@/components/post';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { initialPosts, type PostType } from '@/lib/data';

export default function HomePage() {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);

  const handleCreatePost = ({
    text,
    media,
  }: {
    text: string;
    media: Media | null;
  }) => {
    const newPost: PostType = {
      id: `post-${Date.now()}`,
      authorName: 'Your Name',
      authorHandle: 'yourhandle',
      authorAvatar: 'https://placehold.co/40x40.png',
      content: text,
      timestamp: 'Just now',
      comments: 0,
      reposts: 0,
      likes: 0,
      mediaUrl: media?.url,
      mediaType: media?.type,
      mediaHint: media?.type === 'image' ? 'user uploaded content' : undefined,
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Tabs defaultValue="foryou" className="w-full">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
            <TabsTrigger
              value="foryou"
              className="data-[state=active]:border-primary data-[state=active]:shadow-none h-auto rounded-none py-4 text-base font-bold data-[state=active]:border-b-2"
            >
              For You
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="data-[state=active]:border-primary data-[state=active]:shadow-none h-auto rounded-none py-4 text-base font-bold data-[state=active]:border-b-2"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </header>
        <main className="flex-1">
          <TabsContent value="foryou">
            <CreatePost onPost={handleCreatePost} />
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <Post key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="following">
            <div className="p-8 text-center text-muted-foreground">
              <h2 className="text-xl font-bold">
                You aren&apos;t following anyone yet
              </h2>
              <p>Once you follow people, you&apos;ll see their posts here.</p>
            </div>
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
