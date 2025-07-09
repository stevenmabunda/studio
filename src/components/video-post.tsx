
'use client';

import { PostType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share2, Music4, Play, Volume2, VolumeX, Eye } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface VideoPostProps {
  post: PostType;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isDesktop?: boolean;
}

export function VideoPost({ post, isActive, isMuted, onToggleMute, isDesktop = false }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      setIsPlaying(false);
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(error => {
          setIsPlaying(false);
          console.warn("Autoplay was prevented for video:", post.id, error);
        });
      }
    } else {
      videoElement.pause();
      videoElement.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive, post.id]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = videoRef.current;
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        videoElement.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMute();
  }

  const videoUrl = post.media?.[0]?.url;
  if (!videoUrl || post.media?.[0]?.type !== 'video') {
    return null;
  }

  return (
    <div className="relative h-full w-full bg-black" onClick={togglePlay}>
      {/* Video Player */}
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted={isMuted}
        playsInline
        className="h-full w-full object-cover"
      />

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play className="h-20 w-20 text-white/70" />
        </div>
      )}

      {/* Top Left Controls */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
          onClick={handleToggleMute}
        >
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </Button>
      </div>

      {/* Bottom Left Info */}
      <div className="absolute bottom-4 left-4 z-10 text-white space-y-2 max-w-[calc(100%-6rem)]">
         <Link href={`/profile/${post.authorId}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 group">
          <div>
            <p className="font-bold group-hover:underline">{post.authorName}</p>
            <p className="text-sm">@{post.authorHandle}</p>
          </div>
        </Link>
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        <div className="flex items-center gap-2">
          <Music4 className="h-4 w-4" />
          <p className="text-sm font-medium">Original sound - {post.authorName}</p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute bottom-4 right-2 z-10 flex flex-col items-center space-y-4">
        <Link href={`/profile/${post.authorId}`} onClick={e => e.stopPropagation()}>
            <Avatar className="h-12 w-12 border-2 border-white/80">
                <AvatarImage src={post.authorAvatar} data-ai-hint="user avatar" />
                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
        </Link>
        
        <div className="flex flex-col items-center space-y-1 text-center">
            <Button variant="ghost" className="h-12 w-12 rounded-full bg-black/30 p-0 text-white hover:bg-black/50 hover:text-white">
                <Heart className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.likes}</span>
        </div>
        <div className="flex flex-col items-center space-y-1 text-center">
            <Button variant="ghost" className="h-12 w-12 rounded-full bg-black/30 p-0 text-white hover:bg-black/50 hover:text-white">
                <MessageCircle className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.comments}</span>
        </div>
         <div className="flex flex-col items-center space-y-1 text-center">
            <Button variant="ghost" className="h-12 w-12 rounded-full bg-black/30 p-0 text-white hover:bg-black/50 hover:text-white">
                <Eye className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.views || 0}</span>
        </div>
        <div className="flex flex-col items-center space-y-1 text-center">
            <Button variant="ghost" className="h-12 w-12 rounded-full bg-black/30 p-0 text-white hover:bg-black/50 hover:text-white">
                <Share2 className="h-7 w-7" />
            </Button>
             <span className="text-sm font-bold">Share</span>
        </div>
      </div>
    </div>
  );
}
