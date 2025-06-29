'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Repeat, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type PostProps = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  comments: number;
  reposts: number;
  likes: number;
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    hint?: string;
  }>;
};

export function Post({
  id,
  authorName,
  authorHandle,
  authorAvatar,
  content,
  timestamp,
  comments,
  reposts: initialReposts,
  likes: initialLikes,
  media
}: PostProps) {
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [repostCount, setRepostCount] = useState(initialReposts);
  const [isReposted, setIsReposted] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReposted(!isReposted);
    setRepostCount(isReposted ? repostCount - 1 : repostCount + 1);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing(!isFollowing);
  }
  
  const isOwnPost = authorHandle === 'yourhandle';

  const mediaExists = media && media.length > 0;
  const isVideo = mediaExists && media[0].type === 'video';
  const imageCount = mediaExists && !isVideo ? media.length : 0;

  const gridClasses = {
    1: 'grid-cols-1 grid-rows-1',
    2: 'grid-cols-2 grid-rows-1',
    3: 'grid-cols-2 grid-rows-2',
    4: 'grid-cols-2 grid-rows-2',
  }[imageCount] || '';


  return (
    <Link href={`/post/${id}`} className="block p-4 cursor-pointer hover:bg-accent/20">
      <div className="flex space-x-4">
        <Avatar>
          <AvatarImage src={authorAvatar} alt={authorName} data-ai-hint="user avatar"/>
          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/profile" className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                {authorName}
              </Link>
              <span className="text-muted-foreground">@{authorHandle}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{timestamp}</span>
            </div>
            {!isOwnPost && (
              <Button 
                variant={isFollowing ? 'outline' : 'default'}
                size="sm" 
                className={cn("rounded-full h-8 px-4 font-bold", !isFollowing && "bg-foreground text-background hover:bg-foreground/90")}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
          <p className="mt-2 whitespace-pre-wrap">{content}</p>
          {mediaExists && (
            <div className="mt-3 mr-4 rounded-2xl overflow-hidden border max-h-[500px]">
              {isVideo ? (
                <video
                  src={media[0].url}
                  controls
                  className="w-full h-auto"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className={cn("grid gap-0.5", gridClasses)}>
                  {media.map((item, index) => (
                     <div key={index} className={cn("relative", imageCount === 3 && index === 0 && "row-span-2")}>
                      <Image
                        src={item.url}
                        alt={item.hint || `Post image ${index + 1}`}
                        width={500}
                        height={500}
                        className="w-full h-full object-cover"
                        data-ai-hint={item.hint}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="mt-4 flex justify-between text-muted-foreground max-w-xs">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-primary" onClick={(e) => e.stopPropagation()}>
              <MessageCircle className="h-5 w-5" />
              <span>{comments}</span>
            </Button>
            <Button variant="ghost" size="sm" className={cn("flex items-center gap-2", isReposted ? 'text-green-500' : 'hover:text-green-500')} onClick={handleRepost}>
              <Repeat className="h-5 w-5" />
              <span>{repostCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className={cn("flex items-center gap-2", isLiked ? 'text-red-500' : 'hover:text-red-500')} onClick={handleLike}>
              <Heart className={cn("h-5 w-5", isLiked && 'fill-current')} />
              <span>{likeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-primary" onClick={(e) => e.stopPropagation()}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
