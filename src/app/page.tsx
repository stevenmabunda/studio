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
    media: Media[];
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
      media: media.map(m => ({ ...m, hint: 'user uploaded content' })),
    };
    setPosts([newPost, ...posts]);
  };

  const videoPosts = posts.filter(post => post.media?.some(m => m.type === 'video'));

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Tabs defaultValue="foryou" className="w-full">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
            <TabsTrigger
              value="foryou"
              className="data-[state=active]:border-primary data-[state=active]:shadow-none h-auto rounded-none py-4 text-base font-bold data-[state=active]:border-b-2"
            >
              For You
            </TabsTrigger>
            <TabsTrigger
              value="discover"
              className="data-[state=active]:border-primary data-[state=active]:shadow-none h-auto rounded-none py-4 text-base font-bold data-[state=active]:border-b-2"
            >
              Discover
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:border-primary data-[state=active]:shadow-none h-auto rounded-none py-4 text-base font-bold data-[state=active]:border-b-2"
            >
              Video
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
          <TabsContent value="discover">
            <div className="p-8 text-center text-muted-foreground">
              <h2 className="text-xl font-bold">
                Find your next favorite creator
              </h2>
              <p>Trending posts and accounts will appear here.</p>
            </div>
          </TabsContent>
          <TabsContent value="video">
             {videoPosts.length > 0 ? (
                <div className="divide-y divide-border">
                {videoPosts.map((post) => (
                    <Post key={post.id} {...post} />
                ))}
                </div>
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                <h2 className="text-xl font-bold">No videos yet</h2>
                <p>When users post videos, they'll appear here.</p>
                </div>
            )}
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
