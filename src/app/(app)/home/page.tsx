
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
import { Loader2, Bell, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingCreatePostButton } from '@/components/floating-create-post-button';


export default function HomePage() {
  const { 
    forYouPosts,
    setForYouPosts,
    discoverPosts,
    newForYouPosts,
    showNewForYouPosts,
    loadingForYou,
    loadingDiscover,
    addPost,
    fetchForYouPosts
  } = usePosts();

  const { toast } = useToast();
  const { activeTab, setActiveTab } = useTabContext();
  const { user } = useAuth();
  
  const [showNotification, setShowNotification] = useState(false);
  const [hasScrolledFromTop, setHasScrolledFromTop] = useState(false);
  
  const [lastPostId, setLastPostId] = useState<string | undefined>(undefined);
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
        const newPost = await addPost(data);
        if (newPost) {
           setForYouPosts(prev => [newPost, ...prev]);
        }
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
                         <Image src="/bholo_app_mobile_logo.png" alt="BHOLO Logo" width={95} height={95} className="h-full w-auto" />
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
                    <TabsTrigger value="live" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">Live</TabsTrigger>
                    <TabsTrigger value="video" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">Video</TabsTrigger>
                </TabsList>
            </div>
            {/* Desktop Header */}
            <div className="hidden md:block">
                 <TabsList className="flex w-full justify-evenly border-b bg-transparent p-0 overflow-x-auto no-scrollbar">
                    <TabsTrigger value="foryou" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">For You</TabsTrigger>
                    <TabsTrigger value="discover" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">Discover</TabsTrigger>
                    <TabsTrigger value="live" className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4">Live</TabsTrigger>
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
      <FloatingCreatePostButton onPost={handlePost} />
    </div>
  );
}
