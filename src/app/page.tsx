'use client';

import { CreatePost, type Media } from '@/components/create-post';
import { Post } from '@/components/post';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

const initialPosts = [
  {
    authorName: 'The Athletic',
    authorHandle: 'TheAthletic',
    authorAvatar: 'https://placehold.co/40x40.png',
    content:
      'BREAKING: Kylian Mbappé to Real Madrid is a done deal. ¡Bienvenido a Madrid! ⚪️ #RealMadrid #Mbappe',
    timestamp: '2h',
    comments: 1200,
    reposts: 5400,
    likes: 22000,
    mediaUrl: 'https://placehold.co/600x400.png',
    mediaType: 'image',
    mediaHint: 'football player signing',
  },
  {
    authorName: 'Fabrizio Romano',
    authorHandle: 'FabrizioRomano',
    authorAvatar: 'https://placehold.co/40x40.png',
    content:
      'Cole Palmer was absolutely sensational today. What a signing for Chelsea. Here we go! 🔵 #CFC #Chelsea',
    timestamp: '4h',
    comments: 876,
    reposts: 2300,
    likes: 15000,
  },
  {
    authorName: 'Jane Doe',
    authorHandle: 'janedoe_footy',
    authorAvatar: 'https://placehold.co/40x40.png',
    content: 'Check out this amazing goal! What a strike! #goal #football',
    timestamp: '5h',
    comments: 302,
    reposts: 45,
    likes: 530,
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    mediaType: 'video',
  },
  {
    authorName: 'Football Fans',
    authorHandle: 'FootyHumor',
    authorAvatar: 'https://placehold.co/40x40.png',
    content: 'Who is the most underrated player in the Premier League right now? 🤔',
    timestamp: '8h',
    comments: 1500,
    reposts: 200,
    likes: 1800,
    mediaUrl: 'https://placehold.co/600x400.png',
    mediaType: 'image',
    mediaHint: 'premier league trophy',
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState(initialPosts);

  const handleCreatePost = ({
    text,
    media,
  }: {
    text: string;
    media: Media | null;
  }) => {
    const newPost = {
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
              {posts.map((post, index) => (
                <Post key={index} {...post} />
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
