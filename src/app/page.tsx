'use client';

import { CreatePost, type Media } from '@/components/create-post';
import { Post } from '@/components/post';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { initialPosts, type PostType } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const liveMatches = [
    {
        team1: 'Manchester City',
        team2: 'Arsenal',
        score: '1 - 1',
        time: "78'",
        league: 'Premier League',
        isLive: true,
    },
    {
        team1: 'Real Madrid',
        team2: 'FC Barcelona',
        score: '0 - 0',
        time: "25'",
        league: 'La Liga',
        isLive: true,
    },
];

const upcomingMatches = [
    {
        team1: 'Liverpool',
        team2: 'Chelsea',
        time: 'Tomorrow, 8:00 PM',
        league: 'Premier League',
    },
    {
        team1: 'Bayern Munich',
        team2: 'Borussia Dortmund',
        time: 'Saturday, 3:30 PM',
        league: 'Bundesliga',
    }
];

const officialHandles = ['TheAthletic', 'FabrizioRomano'];


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
  const teamPosts = posts.filter(post => officialHandles.includes(post.authorHandle));

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Tabs defaultValue="foryou" className="w-full">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <TabsList className="grid w-full grid-cols-5 bg-transparent p-0">
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
             <TabsTrigger
              value="live"
              className="data-[state=active]:border-primary data-[state=active]:shadow-none h-auto rounded-none py-4 text-base font-bold data-[state=active]:border-b-2"
            >
              Live
            </TabsTrigger>
             <TabsTrigger
              value="teams"
              className="data-[state=active]:border-primary data-[state=active]:shadow-none h-auto rounded-none py-4 text-base font-bold data-[state=active]:border-b-2"
            >
              Teams
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
          <TabsContent value="live">
            <div className="p-4 space-y-8">
                <div>
                    <h2 className="text-lg font-semibold mb-4">Live Now</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {liveMatches.map((match, index) => (
                            <Card key={index} className="hover:bg-accent cursor-pointer">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base">{match.league}</CardTitle>
                                        <Badge variant="destructive" className="bg-accent text-accent-foreground">LIVE</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="flex justify-around items-center">
                                        <span className="font-medium">{match.team1}</span>
                                        <span className="text-2xl font-bold">{match.score}</span>
                                        <span className="font-medium">{match.team2}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">{match.time}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {upcomingMatches.map((match, index) => (
                            <Card key={index} className="hover:bg-accent cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-base">{match.league}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="flex justify-around items-center font-medium">
                                        <span>{match.team1}</span>
                                        <span className="text-lg font-bold">VS</span>
                                        <span>{match.team2}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">{match.time}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
          </TabsContent>
          <TabsContent value="teams">
            {teamPosts.length > 0 ? (
                <div className="divide-y divide-border">
                    {teamPosts.map((post) => (
                        <Post key={post.id} {...post} />
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    <h2 className="text-xl font-bold">No posts from teams yet</h2>
                    <p>Posts from official accounts will appear here.</p>
                </div>
            )}
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
