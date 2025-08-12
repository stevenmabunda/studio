
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
import { useTabContext } from '@/contexts/tab-context';
import { NewPostsNotification } from '@/components/new-posts-notification';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingTopics } from '@/components/trending-topics';
import { getVideoPosts } from './actions';


function VideoFeed() {
  const [videoPosts, setVideoPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMoreVideos = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const lastPostId = videoPosts.length > 0 ? videoPosts[videoPosts.length - 1].id : undefined;
      const newVideos = await getVideoPosts({ limit: 10, lastPostId });
      if (newVideos.length === 0) {
        setHasMore(false);
      } else {
        setVideoPosts(prev => [...prev, ...newVideos]);
      }
    } catch (err) {
      console.error("Failed to load more video posts:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, videoPosts]);

  const lastVideoElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreVideos();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, loadMoreVideos]);


  useEffect(() => {
    setLoading(true);
    getVideoPosts({ limit: 10 })
      .then((initialVideos) => {
        setVideoPosts(initialVideos);
        if (initialVideos.length < 10) {
            setHasMore(false);
        }
      })
      .catch(err => console.error("Failed to fetch video posts:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading && videoPosts.length === 0) {
    return (
      <>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </>
    );
  }

  if (videoPosts.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <h2 className="text-xl font-bold">No videos yet</h2>
        <p>When users post videos, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {videoPosts.map((post, index) => {
        if (videoPosts.length === index + 1) {
          return <div ref={lastVideoElementRef} key={post.id}><Post {...post} /></div>;
        }
        return <Post key={post.id} {...post} />;
      })}
      {loadingMore && <PostSkeleton />}
      {!hasMore && (
        <p className="py-8 text-center text-muted-foreground">You've reached the end!</p>
      )}
    </div>
  );
}


export default function HomePage() {
  const { 
    forYouPosts,
    newForYouPosts,
    showNewForYouPosts,
    loadingForYou,
    addPost,
    fetchForYouPosts
  } = usePosts();

  const { toast } = useToast();
  const { activeTab, setActiveTab } = useTabContext();
  const { user } = useAuth();
  
  const [showNotification, setShowNotification] = useState(false);
  const [hasScrolledFromTop, setHasScrolledFromTop] = useState(false);
  
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  
  useEffect(() => {
    // This effect runs only when the component mounts and the posts are loaded.
    // It's responsible for restoring the scroll position.
    if (!loadingForYou && forYouPosts.length > 0) {
      const postId = sessionStorage.getItem('scrollPostId');
      const scrollY = sessionStorage.getItem('scrollY');

      if (postId) {
        setTimeout(() => {
          const postElement = document.querySelector(`[data-post-id="${postId}"]`);
          if (postElement) {
            postElement.scrollIntoView({ behavior: 'auto', block: 'center' });
          } else if (scrollY) {
            // Fallback to scrollY if post not found (e.g., it's on a page that hasn't been loaded yet)
            window.scrollTo(0, parseInt(scrollY, 10));
          }
          // Clean up session storage after use
          sessionStorage.removeItem('scrollPostId');
          sessionStorage.removeItem('scrollY');
        }, 50); // A small delay helps ensure the content is rendered before scrolling.
      }
    }
  }, [loadingForYou, forYouPosts]);


  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMorePosts) return;

    setLoadingMore(true);
    const currentLastPostId = forYouPosts[forYouPosts.length - 1]?.id;
    try {
        const morePosts = await fetchForYouPosts({ limit: 20, lastPostId: currentLastPostId });
        if (morePosts.length === 0) {
            setHasMorePosts(false);
        }
    } catch (error) {
        console.error("Failed to load more posts:", error);
        toast({ variant: 'destructive', description: "Could not load more posts." });
    } finally {
        setLoadingMore(false);
    }
  }, [loadingMore, hasMorePosts, fetchForYouPosts, toast, forYouPosts]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMorePosts) {
        loadMorePosts();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMorePosts, loadMorePosts]);

  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        // Header hide/show logic
        if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setIsHeaderHidden(true); // Scrolling down
        } else {
            setIsHeaderHidden(false); // Scrolling up
        }
        lastScrollY.current = currentScrollY;

        // New posts notification logic
        if (activeTab !== 'foryou') {
            setShowNotification(false);
            return;
        }
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
  
  const handlePost = async (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null }) => {
    try {
        await addPost(data);
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
      <Tabs defaultValue="foryou" value={activeTab} className="w-full flex flex-col flex-1" onValueChange={setActiveTab}>
        <header className={cn(
            "fixed md:sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-in-out md:translate-y-0",
            isHeaderHidden && 'hide-header'
        )}>
            {/* Mobile Header */}
            <div className="md:hidden">
                <div className="flex h-14 items-center justify-between px-4">
                     <SidebarTrigger asChild>
                        <button className="h-8 w-8 rounded-full overflow-hidden">
                            <Avatar className="h-full w-full">
                                <AvatarImage src={user?.photoURL || undefined} data-ai-hint="user avatar" />
                                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        </button>
                    </SidebarTrigger>
                     <Link href="/home" aria-label="Home" className="flex items-center justify-center h-10">
                         <Image src="/logo_64x64.png" alt="BHOLO Logo" width="64" height="64" className="h-full w-auto" />
                    </Link>
                     <div className="flex items-center gap-1">
                        <Link href="/notifications" passHref>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Bell className="h-5 w-5" />
                                <span className="sr-only">Notifications</span>
                            </Button>
                        </Link>
                        <Link href="/messages" passHref>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Mail className="h-5 w-5" />
                                <span className="sr-only">Messages</span>
                            </Button>
                        </Link>
                    </div>
                </div>
                 <TabsList className="flex w-full justify-evenly border-b bg-transparent p-0 overflow-x-auto no-scrollbar">
                    <TabsTrigger value="foryou" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">For You</TabsTrigger>
                    <TabsTrigger value="discover" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">Discover</TabsTrigger>
                    <TabsTrigger value="trending" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">Trending</TabsTrigger>
                    <TabsTrigger value="video" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">Video</TabsTrigger>
                </TabsList>
            </div>
            {/* Desktop Header */}
            <div className="hidden md:block">
                 <TabsList className="flex w-full justify-evenly border-b bg-transparent p-0 overflow-x-auto no-scrollbar">
                    <TabsTrigger value="foryou" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">For You</TabsTrigger>
                    <TabsTrigger value="discover" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">Discover</TabsTrigger>
                    <TabsTrigger value="trending" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">Trending</TabsTrigger>
                    <TabsTrigger value="video" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">Video</TabsTrigger>
                </TabsList>
            </div>
        </header>

        <main className="flex-1 md:pt-0 pt-[112px]">
          <TabsContent value="foryou" className="h-full">
            <div className="hidden md:block border-b">
              <CreatePost onPost={handlePost} />
            </div>
            <div className="divide-y divide-border">
              {loadingForYou && forYouPosts.length === 0 ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
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
                <div ref={loadMoreTriggerRef} className="py-8 text-center">
                    {loadingMore && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
                </div>
            )}
             {!hasMorePosts && !loadingForYou && forYouPosts.length > 0 && (
                <p className="py-8 text-center text-muted-foreground">You've reached the end!</p>
            )}
          </TabsContent>
          <TabsContent value="discover" className="h-full">
            <DiscoverFeed />
          </TabsContent>
           <TabsContent value="trending" className="h-full p-4">
             <TrendingTopics />
          </TabsContent>
          <TabsContent value="video" className="h-full">
            <VideoFeed />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
