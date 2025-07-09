
'use client';

import { Post } from '@/components/post';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePosts } from '@/contexts/post-context';
import { PostSkeleton } from '@/components/post-skeleton';
import { DiscoverHeadlines } from '@/components/discover-headlines';
import type { PostType } from '@/lib/data';
import { VideoFeed } from '@/components/video-feed';
import { CreatePost, type Media } from '@/components/create-post';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const { posts, loading: postsLoading, addPost } = usePosts();
  const { toast } = useToast();

  const videoPosts = posts.filter((post) =>
    post.media?.some((m) => m.type === 'video')
  );

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
          <TabsList className="flex w-full overflow-x-auto bg-transparent p-0 no-scrollbar sm:grid sm:grid-cols-3">
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
          <TabsContent value="video" className="h-[calc(100vh-8.5rem)] md:h-[calc(100vh-4rem)] p-0 m-0">
             <VideoFeed posts={videoPosts} />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
