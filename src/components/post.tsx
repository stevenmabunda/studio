'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Repeat, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type PostProps = {
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  comments: number;
  reposts: number;
  likes: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaHint?: string;
};

export function Post({
  authorName,
  authorHandle,
  authorAvatar,
  content,
  timestamp,
  comments,
  reposts: initialReposts,
  likes: initialLikes,
  mediaUrl,
  mediaType,
  mediaHint,
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

  return (
    <div className="p-4">
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
          {mediaUrl && (
            <div className="mt-3 mr-4 rounded-2xl overflow-hidden border">
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full h-auto"
                />
              ) : (
                <Image
                  src={mediaUrl}
                  alt="Post image"
                  width={500}
                  height={300}
                  className="w-full h-auto object-cover"
                  data-ai-hint={mediaHint}
                />
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
    </div>
  );
}
