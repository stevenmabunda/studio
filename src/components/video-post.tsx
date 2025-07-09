'use client';

import { PostType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share2, Music4, Play, Volume2, VolumeX, Eye } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface VideoPostProps {
  post: PostType;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isDesktop?: boolean;
}

export function VideoPost({ post, isActive, isMuted, onToggleMute }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      videoElement.currentTime = 0;
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play().then(() => setIsPlaying(true));
      } else {
        videoElement.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMute();
  };

  const videoUrl = post.media?.[0]?.url;
  if (!videoUrl || post.media?.[0]?.type !== 'video') {
    return null;
  }

  return (
    // The main container now centers its content.
    <div className="relative h-full w-full bg-black flex items-center justify-center" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted={isMuted}
        playsInline
        // The video will be contained within the parent, maintaining aspect ratio.
        className="max-h-full max-w-full object-contain"
      />
      
      {/* The overlays are still positioned relative to the full-screen container */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

      {/* Play/Pause Button */}
      {!isPlaying && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play className="h-20 w-20 text-white/50" />
        </div>
      )}

      {/* Mute/Unmute Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50"
          onClick={handleToggleMute}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>

      {/* Info and Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-white flex items-end">
        {/* Left Side: Info */}
        <div className="flex-1 space-y-2">
          <Link
            href={`/profile/${post.authorId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block"
          >
            <p className="font-bold hover:underline">@{post.authorHandle}</p>
          </Link>
          <p className="text-sm">{post.content}</p>
          <div className="flex items-center gap-2">
            <Music4 className="h-4 w-4" />
            <p className="text-sm font-medium">Original sound - {post.authorName}</p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col items-center space-y-4">
            <Link
                href={`/profile/${post.authorId}`}
                onClick={(e) => e.stopPropagation()}
            >
                <Avatar className="h-12 w-12 border-2 border-white/80">
                    <AvatarImage src={post.authorAvatar} data-ai-hint="user avatar" />
                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
            
            <div className="flex flex-col items-center space-y-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white"
                >
                    <Heart className="h-7 w-7" />
                </Button>
                <span className="text-sm font-bold">{post.likes}</span>
            </div>
            
            <div className="flex flex-col items-center space-y-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white"
                >
                    <MessageCircle className="h-7 w-7" />
                </Button>
                <span className="text-sm font-bold">{post.comments}</span>
            </div>

            <div className="flex flex-col items-center space-y-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white"
                >
                    <Eye className="h-7 w-7" />
                </Button>
                <span className="text-sm font-bold">{post.views || 0}</span>
            </div>

            <div className="flex flex-col items-center space-y-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-white"
                >
                    <Share2 className="h-7 w-7" />
                </Button>
                <span className="text-sm font-bold">Share</span>
            </div>
        </div>
      </div>
    </div>
  );
}
