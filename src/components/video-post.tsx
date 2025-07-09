
'use client';

import { PostType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share2, Music4, Play, Volume2, VolumeX } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface VideoPostProps {
  post: PostType;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function VideoPost({ post, isActive, isMuted, onToggleMute }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Effect to control video playback based on `isActive` prop
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      videoElement.currentTime = 0; // Reset video on becoming active
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false)); // Autoplay might be blocked
      }
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  }, [isActive]);
  
  // Toggles play/pause on user click
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
    e.stopPropagation(); // Prevent toggling play/pause when clicking mute
    onToggleMute();
  };

  const videoUrl = post.media?.[0]?.url;
  if (!videoUrl || post.media?.[0]?.type !== 'video') {
    // Should not happen if filtered correctly, but a good guard clause
    return null; 
  }

  return (
    // Main container: full height, black background, flexbox for centering
    <div className="relative h-full w-full bg-black flex items-center justify-center" onClick={togglePlay}>
      
      {/* The video element itself, contained within the parent */}
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted={isMuted}
        playsInline
        className="max-h-full max-w-full object-contain"
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />


      {/* Play/Pause icon shown in the center when paused */}
      {!isPlaying && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play className="h-20 w-20 text-white/50" fill="currentColor" />
        </div>
      )}

      {/* Mute/Unmute Button (Top Right) */}
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

      {/* Content Overlay (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-white flex items-end gap-4">
        
        {/* Left Side: Post Info */}
        <div className="flex-1 space-y-2 min-w-0">
          <Link
            href={`/profile/${post.authorId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block group"
          >
            <p className="font-bold text-lg group-hover:underline">@{post.authorHandle}</p>
          </Link>
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center gap-2">
            <Music4 className="h-4 w-4" />
            <p className="text-sm font-medium truncate">Original sound - {post.authorName}</p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col items-center space-y-4">
          <Link
            href={`/profile/${post.authorId}`}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            <Avatar className="h-12 w-12 border-2 border-white/80">
                <AvatarImage src={post.authorAvatar} data-ai-hint="user avatar" />
                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
            
          <div className="flex flex-col items-center space-y-1">
              <Button variant="ghost" size="icon" className="h-12 w-12 text-white hover:text-white" onClick={e => e.stopPropagation()}>
                  <Heart className="h-8 w-8" />
              </Button>
              <span className="text-sm font-bold">{post.likes}</span>
          </div>
            
          <div className="flex flex-col items-center space-y-1">
              <Button variant="ghost" size="icon" className="h-12 w-12 text-white hover:text-white" onClick={e => e.stopPropagation()}>
                  <MessageCircle className="h-8 w-8" />
              </Button>
              <span className="text-sm font-bold">{post.comments}</span>
          </div>

          <div className="flex flex-col items-center space-y-1">
              <Button variant="ghost" size="icon" className="h-12 w-12 text-white hover:text-white" onClick={e => e.stopPropagation()}>
                  <Share2 className="h-8 w-8" />
              </Button>
              <span className="text-sm font-bold">Share</span>
          </div>
        </div>
      </div>
    </div>
  );
}
