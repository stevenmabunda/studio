
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Post } from '@/components/post';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePosts } from '@/contexts/post-context';
import { PostSkeleton } from '@/components/post-skeleton';
import { DiscoverHeadlines } from '@/components/discover-headlines';
import type { PostType, MatchType } from '@/lib/data';
import { CreatePost, type Media } from '@/components/create-post';
import { useToast } from '@/hooks/use-toast';
import { getLiveMatches, getUpcomingMatches } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoPost } from '@/components/video-post';

function MatchCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex justify-around items-center">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-12 mt-3 mx-auto" />
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { posts, loading: postsLoading, addPost } = usePosts();
  const { toast } = useToast();

  const [liveMatches, setLiveMatches] = useState<MatchType[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<MatchType[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  const videoPosts = useMemo(
    () => posts.filter(post => post.media?.some(m => m.type === 'video')),
    [posts]
  );

  useEffect(() => {
    const fetchMatches = async () => {
      setMatchesLoading(true);
      try {
        const [live, upcoming] = await Promise.all([
          getLiveMatches(),
          getUpcomingMatches(),
        ]);
        setLiveMatches(live);
        setUpcomingMatches(upcoming);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setMatchesLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handlePost = async (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null }) => {
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
      <Tabs defaultValue="foryou" className="w-full flex flex-col flex-1">
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
          <TabsContent value="foryou" className="h-full">
            <div className="hidden md:block">
              <CreatePost onPost={handlePost} />
            </div>
            <div className="divide-y divide-border">
              {postsLoading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : posts.length > 0 ? (
                posts.map((post) => <Post key={post.id} {...post} />)
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <h2 className="text-xl font-bold">No posts yet!</h2>
                  <p>Be the first one to kick-it!</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="discover" className="h-full">
            <DiscoverHeadlines />
          </TabsContent>
           <TabsContent value="video" className="h-full bg-black">
             <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-110px)]">
              {postsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <PostSkeleton />
                </div>
              ) : videoPosts.length > 0 ? (
                <div className="h-full w-full snap-y snap-mandatory overflow-y-auto no-scrollbar">
                  {videoPosts.map((post) => (
                    <div key={post.id} className="h-full w-full flex-shrink-0 snap-center">
                        <VideoPost post={post} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                  <h2 className="text-xl font-bold">No videos yet</h2>
                  <p>When users post videos, they'll appear here.</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="live" className="h-full">
            <div className="p-4 space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">Live Now</h2>
                {matchesLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                  </div>
                ) : liveMatches.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {liveMatches.map((match) => (
                      <Card
                        key={match.id}
                        className="hover:bg-accent cursor-pointer"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">
                              {match.league}
                            </CardTitle>
                            <Badge
                              variant="destructive"
                              className="bg-accent text-accent-foreground"
                            >
                              LIVE
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="flex justify-around items-center">
                            <span className="font-medium">
                              {match.team1.name}
                            </span>
                            <span className="text-2xl font-bold">
                              {match.score}
                            </span>
                            <span className="font-medium">
                              {match.team2.name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {match.time}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    No live matches right now.
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
                {matchesLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                  </div>
                ) : upcomingMatches.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {upcomingMatches.map((match) => (
                      <Card
                        key={match.id}
                        className="hover:bg-accent cursor-pointer"
                      >
                        <CardHeader>
                          <CardTitle className="text-base">
                            {match.league}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="flex justify-around items-center font-medium">
                            <span>{match.team1.name}</span>
                            <span className="text-lg font-bold">VS</span>
                            <span>{match.team2.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {match.time}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    No upcoming matches found.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
