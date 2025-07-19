
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
import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Mail } from 'lucide-react';

function MobileHomeHeader() {
  const { user } = useAuth();
  return (
    <div className="md:hidden sticky top-0 z-10 bg-black">
      <div className="flex h-14 items-center justify-between px-4">
        <SidebarTrigger asChild>
            <button className="h-8 w-8 rounded-full overflow-hidden">
                <Avatar className="h-full w-full">
                    <AvatarImage src={user?.photoURL || undefined} data-ai-hint="user avatar" />
                    <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
            </button>
        </SidebarTrigger>
        
        <Link href="/home" aria-label="Home">
            <span className="text-2xl font-bold text-white">BHOLO</span>
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
      <TabsList className="grid w-full grid-cols-4 bg-transparent p-0">
        <div className="flex justify-center">
            <TabsTrigger
            value="foryou"
            className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
            >
            For You
            </TabsTrigger>
        </div>
        <div className="flex justify-center">
            <TabsTrigger
            value="discover"
            className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
            >
            Discover
            </TabsTrigger>
        </div>
        <div className="flex justify-center">
            <TabsTrigger
            value="live"
            className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
            >
            Live
            </TabsTrigger>
        </div>
        <div className="flex justify-center">
            <TabsTrigger
            value="video"
            className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
            >
            Video
            </TabsTrigger>
        </div>
      </TabsList>
    </div>
  );
}


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

  // Fetch initial posts here instead of the context
  useEffect(() => {
    setLoadingForYou(true);
    getRecentPosts()
      .then(setForYouPosts)
      .finally(() => setLoadingForYou(false));
  }, [setLoadingForYou, setForYouPosts]);

  useEffect(() => {
    const handleScroll = () => {
      if (activeTab !== 'foryou') {
        setShowNotification(false);
        return;
      }
      const isScrolled = window.scrollY > 200;
      if (isScrolled) {
        setHasScrolledFromTop(true);
      } else {
        // If user scrolls back to top, hide notification
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
          // Manually add the new post to the top of the feed if we're at the top
          if (window.scrollY < 200) {
            setForYouPosts(prev => [newPost, ...prev]);
          }
        }
        toast({ description: "Your post has been published!" });
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        {/* Mobile Header */}
        <MobileHomeHeader />

        {/* Desktop Header */}
        <header className="hidden md:block sticky top-0 z-10 bg-black">
          <TabsList className="grid w-full grid-cols-4 bg-transparent">
             <div className="flex justify-center">
                <TabsTrigger
                value="foryou"
                className="shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
                >
                For You
                </TabsTrigger>
            </div>
             <div className="flex justify-center">
                <TabsTrigger
                value="discover"
                className="shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
                >
                Discover
                </TabsTrigger>
            </div>
             <div className="flex justify-center">
                <TabsTrigger
                value="live"
                className="shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
                >
                Live
                </TabsTrigger>
            </div>
             <div className="flex justify-center">
                <TabsTrigger
                value="video"
                className="shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4"
                >
                Video
                </TabsTrigger>
            </div>
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
