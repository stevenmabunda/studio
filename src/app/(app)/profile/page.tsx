import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Post } from "@/components/post";
import Image from "next/image";
import { MapPin, Link as LinkIcon, CalendarDays } from "lucide-react";

export default function ProfilePage() {
  return (
    <div>
      <div className="relative h-48 w-full bg-muted sm:h-64">
        <Image
          src="https://placehold.co/1200x400.png"
          alt="Profile banner"
          layout="fill"
          objectFit="cover"
          data-ai-hint="stadium lights"
        />
      </div>
      <div className="p-4">
        <div className="relative -mt-20 flex justify-between">
          <Avatar className="h-24 w-24 border-4 border-background sm:h-32 sm:w-32">
            <AvatarImage src="https://placehold.co/128x128.png" data-ai-hint="football player" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Button variant="outline" className="mt-24">
            Edit profile
          </Button>
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">Your Name</h1>
          <p className="text-muted-foreground">@yourhandle</p>
        </div>
        <div className="mt-4">
          <p>
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
            <span>Joined June 2023</span>
          </div>
        </div>
        <div className="mt-4 flex gap-4">
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
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="replies">Replies</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <div className="divide-y divide-border">
            <Post
              authorName="Your Name"
              authorHandle="yourhandle"
              authorAvatar="https://placehold.co/40x40.png"
              content="This is a sample post on my profile! #GoalChatter"
              timestamp="1d"
              comments={10}
              reposts={2}
              likes={45}
            />
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
