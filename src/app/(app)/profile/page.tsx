
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Post } from "@/components/post";
import Image from "next/image";
import { MapPin, Link as LinkIcon, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePosts } from "@/contexts/post-context";

export default function ProfilePage() {
  const { user } = useAuth();
  const { posts } = usePosts();

  // This page is protected by the layout, so user should always exist.
  if (!user) return null;
  
  const userHandle = user.email?.split('@')[0] || 'user';
  // In a real app, you would fetch posts for this specific user from a database
  const userPosts = posts.filter(post => post.authorHandle === userHandle);

  return (
    <div>
      <div className="relative h-36 w-full bg-muted sm:h-48">
        <Image
          src="https://placehold.co/1200x400.png"
          alt="Profile banner"
          layout="fill"
          objectFit="cover"
          data-ai-hint="stadium lights"
        />
      </div>
      <div className="p-4">
        <div className="relative -mt-16 flex justify-between sm:-mt-20">
          <Avatar className="h-24 w-24 border-4 border-background sm:h-32 sm:w-32">
            <AvatarImage src={user.photoURL || "https://placehold.co/128x128.png"} data-ai-hint="football player" />
            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <Button variant="outline" className="mt-20 sm:mt-24">
            Edit profile
          </Button>
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{user.displayName || 'Your Name'}</h1>
          <p className="text-muted-foreground">@{userHandle}</p>
        </div>
        <div className="mt-4">
          <p data-ai-hint="user bio">
            Passionate football fan. Favorite team: FC Barcelona. Discussing all things football. ⚽
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>London, UK</span>
          </div>
          <div className="flex items-center gap-1">
            <LinkIcon className="h-4 w-4" />
            <a href="#" className="text-primary hover:underline">
              yourwebsite.com
            </a>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Joined {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <span className="font-bold">142</span>
            <span className="text-muted-foreground"> Following</span>
          </div>
          <div>
            <span className="font-bold">1,205</span>
            <span className="text-muted-foreground"> Followers</span>
          </div>
        </div>
      </div>
      <Tabs defaultValue="posts" className="w-full border-t">
        <TabsList className="flex w-full justify-around rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="posts" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Posts</TabsTrigger>
          <TabsTrigger value="replies" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Replies</TabsTrigger>
          <TabsTrigger value="media" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Media</TabsTrigger>
          <TabsTrigger value="likes" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Likes</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <div className="divide-y divide-border">
            {userPosts.length > 0 ? (
                userPosts.map(post => <Post key={post.id} {...post} />)
            ) : (
                <div className="p-8 text-center text-muted-foreground">No posts yet.</div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="replies">
            <div className="p-8 text-center text-muted-foreground">No replies yet.</div>
        </TabsContent>
        <TabsContent value="media">
            <div className="p-8 text-center text-muted-foreground">No media yet.</div>
        </TabsContent>
        <TabsContent value="likes">
            <div className="p-8 text-center text-muted-foreground">No liked posts yet.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
