'use client';

import { PostType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share2, Music4, Play, Pause } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface VideoPostProps {
  post: PostType;
  isActive: boolean;
}

export function VideoPost({ post, isActive }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      videoElement.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.warn("Autoplay was prevented for video:", post.id, error);
        setIsPlaying(false);
      });
    } else {
      videoElement.pause();
      videoElement.currentTime = 0; // Rewind video when it's not active
      setIsPlaying(false);
    }
  }, [isActive, post.id]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = videoRef.current;
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        setIsPlaying(true);
      } else {
        videoElement.pause();
        setIsPlaying(false);
      }
    }
  };

  const videoUrl = post.media?.[0]?.url;
  if (!videoUrl || post.media?.[0]?.type !== 'video') {
    return null; // Should not happen if data is filtered correctly
  }

  return (
    <div className="relative h-full w-full snap-start bg-black" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted // Muted is often required for autoplay to work
        className="h-full w-full object-contain"
        playsInline // Important for iOS
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <Play className="h-16 w-16 text-white/70" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 text-white bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
        <div className="flex items-end justify-between">
            <div className="flex-1 space-y-2 pr-4">
                <Link href={`/profile/${post.authorId}`} className="flex items-center gap-2 pointer-events-auto" onClick={e => e.stopPropagation()}>
                    <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage src={post.authorAvatar} data-ai-hint="user avatar" />
                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                    <p className="font-bold text-base hover:underline">{post.authorName}</p>
                    <p className="text-sm">@{post.authorHandle}</p>
                    </div>
                </Link>
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                 <div className="flex items-center gap-2">
                    <Music4 className="h-4 w-4" />
                    <p className="text-xs">Original sound - {post.authorName}</p>
                </div>
            </div>

            <div className="flex flex-col items-center space-y-4 pointer-events-auto">
                <Button variant="ghost" size="icon" className="h-auto flex-col p-2 text-white hover:bg-white/20" onClick={e => e.stopPropagation()}>
                    <Heart className="h-7 w-7" />
                    <span className="text-xs font-bold">{post.likes}</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-auto flex-col p-2 text-white hover:bg-white/20" onClick={e => e.stopPropagation()}>
                    <MessageCircle className="h-7 w-7" />
                    <span className="text-xs font-bold">{post.comments}</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-auto flex-col p-2 text-white hover:bg-white/20" onClick={e => e.stopPropagation()}>
                    <Share2 className="h-7 w-7" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
