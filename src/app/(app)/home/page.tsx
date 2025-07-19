
'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Post } from '@/components/post';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePosts } from '@/contexts/post-context';
import { PostSkeleton } from '@/components/post-skeleton';
import { DiscoverFeed } from '@/components/discover-feed';
import type { PostType } from '@/lib/data';
import { CreatePost, type Media } from '@/components/create-post';
import { useToast } from '@/hooks/use-toast';
import { VideoPost } from '@/components/video-post';
import { useTabContext } from '@/contexts/tab-context';
import { LiveMatches } from '@/components/live-matches';
import { NewPostsNotification } from '@/components/new-posts-notification';
import { getRecentPosts } from './actions';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function HomePage() {
  const { 
    forYouPosts,
    setForYouPosts,
    discoverPosts,
    newForYouPosts,
    showNewForYouPosts,
    loadingForYou,
    setLoadingForYou,
    loadingDiscover,
    addPost 
  } = usePosts();

  const { toast } = useToast();
  const { activeTab, setActiveTab } = useTabContext();
  const { user } = useAuth();
  
  const [showNotification, setShowNotification] = useState(false);
  const [hasScrolledFromTop, setHasScrolledFromTop] = useState(false);
  
  const [lastPostId, setLastPostId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);


  const fetchInitialPosts = useCallback(() => {
    setLoadingForYou(true);
    getRecentPosts({ limit: 20 })
      .then(initialPosts => {
        setForYouPosts(initialPosts);
        if (initialPosts.length < 20) {
            setHasMorePosts(false);
        } else {
            setLastPostId(initialPosts[initialPosts.length - 1]?.id);
            setHasMorePosts(true);
        }
      })
      .finally(() => setLoadingForYou(false));
  }, [setLoadingForYou, setForYouPosts]);

  useEffect(() => {
    fetchInitialPosts();
  }, [fetchInitialPosts]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMorePosts || !lastPostId) return;

    setLoadingMore(true);
    try {
        const morePosts = await getRecentPosts({ limit: 20, lastPostId });
        if (morePosts.length > 0) {
            setForYouPosts(prev => [...prev, ...morePosts]);
            setLastPostId(morePosts[morePosts.length - 1].id);
        }
        if (morePosts.length < 20) {
            setHasMorePosts(false);
        }
    } catch (error) {
        console.error("Failed to load more posts:", error);
        toast({ variant: 'destructive', description: "Could not load more posts." });
    } finally {
        setLoadingMore(false);
    }
  }, [loadingMore, hasMorePosts, lastPostId, toast, setForYouPosts]);

  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (activeTab !== 'foryou') {
            setShowNotification(false);
            return;
        }

        if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
            setIsNavVisible(false);
        } else {
            setIsNavVisible(true);
        }
        lastScrollY.current = currentScrollY;

        const isScrolledPastThreshold = window.scrollY > 200;
        if (isScrolledPastThreshold) {
            setHasScrolledFromTop(true);
        } else {
            setShowNotification(false);
            setHasScrolledFromTop(false);
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  useEffect(() => {
    if (newForYouPosts.length > 0 && hasScrolledFromTop && activeTab === 'foryou') {
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [newForYouPosts, hasScrolledFromTop, activeTab]);


  const handleShowNewPosts = () => {
    showNewForYouPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowNotification(false);
  }

  const [isMuted, setIsMuted] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const videoPosts = useMemo(
    () => discoverPosts.filter(post => post.media?.some(m => m.type === 'video')),
    [discoverPosts]
  );
  
  const handleVisibilityChange = useCallback((id: string, isVisible: boolean) => {
    if (isVisible) {
      setPlayingVideoId(id);
    } else {
      if (playingVideoId === id) {
        setPlayingVideoId(null);
      }
    }
  }, [playingVideoId]);
  
  const handlePost = async (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null }) => {
    try {
        await addPost(data);
        // Let the real-time listener handle adding the post to the feed
        toast({ description: "Your post has been published!" });
        // Scroll to top only if the user is already near the top
        if (window.scrollY < 200) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error("Failed to create post:", error);
        toast({ variant: 'destructive', description: "Something went wrong. Please try again." });
    }
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
       <NewPostsNotification 
            show={showNotification}
            avatars={newForYouPosts.map(p => p.authorAvatar)}
            onClick={handleShowNewPosts}
        />
      <Tabs defaultValue="foryou" className="w-full flex flex-col flex-1" onValueChange={setActiveTab}>
         <header className={cn(
            "sticky top-0 z-10 bg-black transition-transform duration-300 ease-in-out",
            !isNavVisible && "-translate-y-full"
            )}>
              <div className="flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm md:hidden">
                <Link href="/home" aria-label="Home">
                  <span className="text-2xl font-bold text-white">BHOLO</span>
                </Link>
              </div>
            <TabsList className="flex w-full justify-evenly bg-transparent p-0 overflow-x-auto no-scrollbar">
                <TabsTrigger
                    value="foryou"
                    className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4"
                >
                    For You
                </TabsTrigger>
                <TabsTrigger
                    value="discover"
                    className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4"
                >
                    Discover
                </TabsTrigger>
                <TabsTrigger
                    value="live"
                    className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4"
                >
                    Live
                </TabsTrigger>
                <TabsTrigger
                    value="video"
                    className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4"
                >
                    Video
                </TabsTrigger>
            </TabsList>
        </header>
        <main className="flex-1">
          <TabsContent value="foryou" className="h-full">
            <div className="hidden md:block border-b">
              <CreatePost onPost={handlePost} />
            </div>
            <div className="divide-y divide-border">
              {loadingForYou ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : forYouPosts.length > 0 ? (
                forYouPosts.map((post) => <Post key={post.id} {...post} />)
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <h2 className="text-xl font-bold">Your feed is empty</h2>
                  <p>Follow some accounts or check out the Discover tab!</p>
                </div>
              )}
            </div>
            {hasMorePosts && !loadingForYou && (
                <div className="py-8 text-center">
                    <Button onClick={loadMorePosts} disabled={loadingMore}>
                        {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Load More'}
                    </Button>
                </div>
            )}
             {!hasMorePosts && !loadingForYou && forYouPosts.length > 0 && (
                <p className="py-8 text-center text-muted-foreground">You've reached the end!</p>
            )}
          </TabsContent>
          <TabsContent value="discover" className="h-full">
            <DiscoverFeed />
          </TabsContent>
           <TabsContent value="live" className="h-full">
            <LiveMatches isPage />
          </TabsContent>
          <TabsContent value="video" className="h-full bg-black">
             <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-110px)] overflow-y-auto snap-y snap-mandatory">
              {loadingDiscover ? (
                <div className="flex items-center justify-center h-full">
                  <PostSkeleton />
                </div>
              ) : videoPosts.length > 0 ? (
                <div className="h-full w-full">
                  {videoPosts.map((post) => (
                    <div key={post.id} className="h-full w-full snap-start flex items-center justify-center">
                       <VideoPost
                        post={post}
                        isMuted={isMuted}
                        onToggleMute={() => setIsMuted(prev => !prev)}
                        isPlaying={playingVideoId === post.id}
                        onVisibilityChange={handleVisibilityChange}
                        activeVideoId={playingVideoId}
                      />
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
        </main>
      </Tabs>
    </div>
  );
}
