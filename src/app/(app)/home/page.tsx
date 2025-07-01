
'use client';

import { Post } from '@/components/post';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePosts } from '@/contexts/post-context';
import { StoryReel } from '@/components/story-reel';
import { PostSkeleton } from '@/components/post-skeleton';
import { DiscoverFeed } from '@/components/discover-feed';
import { CreatePost, type Media } from '@/components/create-post';
import { useToast } from '@/hooks/use-toast';
import type { PostType } from '@/lib/data';

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

export default function HomePage() {
  const { posts, addPost, loading } = usePosts();
  const { toast } = useToast();

  const videoPosts = posts.filter(post => post.media?.some(m => m.type === 'video'));

  const handlePost = async (data: { text: string; media: Media[], poll?: PostType['poll'] }) => {
    try {
        await addPost(data);
        toast({ description: "Your post has been published!" });
    } catch (error) {
        console.error("Failed to create post:", error);
        toast({ variant: 'destructive', description: "Something went wrong. Please try again." });
    }
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Tabs defaultValue="foryou" className="w-full">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <TabsList className="flex w-full overflow-x-auto bg-transparent p-0 no-scrollbar sm:grid sm:grid-cols-4">
            <TabsTrigger
              value="foryou"
              className="h-auto shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
            >
              For You
            </TabsTrigger>
            <TabsTrigger
              value="discover"
              className="h-auto shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
            >
              Discover
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="h-auto shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
            >
              Video
            </TabsTrigger>
             <TabsTrigger
              value="live"
              className="h-auto shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
            >
              Live
            </TabsTrigger>
          </TabsList>
        </header>
        <main className="flex-1">
          <TabsContent value="foryou">
            <StoryReel />
            <div className="divide-y divide-border">
              {loading ? (
                <>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                    <Post key={post.id} {...post} />
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                    <h2 className="text-xl font-bold">No posts yet!</h2>
                    <p>Be the first one to kick-it!</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="discover">
            {loading ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : (
              <DiscoverFeed posts={posts} />
            )}
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
                    <div className="grid gap-4 sm:grid-cols-2">
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
                    <div className="grid gap-4 sm:grid-cols-2">
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
        </main>
      </Tabs>
    </div>
  );
}
