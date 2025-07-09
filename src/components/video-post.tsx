'use client';

import { PostType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share2, Music4, Play, Volume2, VolumeX, Eye } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { FollowButton } from './follow-button';

interface VideoPostProps {
  post: PostType;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isDesktop?: boolean;
}

export function VideoPost({ post, isActive, isMuted, onToggleMute, isDesktop = false }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const { user } = useAuth();
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      // Optimistically set playing state
      setIsPlaying(true);
      videoElement.play().catch(error => {
        console.warn("Autoplay was prevented for video:", post.id, error);
        // If play fails, correct the state
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

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMute();
  }

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
        muted={isMuted}
        className="h-full w-full object-contain"
        playsInline // Important for iOS
      />
      
      <div className="absolute top-4 left-4 z-10 pointer-events-auto">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white" onClick={handleToggleMute}>
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </Button>
      </div>

      {user && user.uid !== post.authorId && (
        <div className="absolute top-4 right-4 z-10 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <FollowButton profileId={post.authorId} />
        </div>
      )}
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <Play className="h-16 w-16 text-white/70" />
        </div>
      )}

      {isDesktop ? (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 text-white bg-gradient-to-t from-black/60 to-transparent pointer-events-auto">
              <div className="flex items-start gap-3">
                  <Link href={`/profile/${post.authorId}`} onClick={e => e.stopPropagation()} className="shrink-0">
                      <Avatar className="h-10 w-10">
                          <AvatarImage src={post.authorAvatar} data-ai-hint="user avatar" />
                          <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                  </Link>
                  <div className="space-y-1 text-sm">
                      <Link href={`/profile/${post.authorId}`} onClick={e => e.stopPropagation()}>
                          <p className="font-bold hover:underline">{post.authorName}</p>
                      </Link>
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      <div className="flex items-center gap-2 pt-1">
                          <Music4 className="h-4 w-4" />
                          <p className="text-xs">Original sound - {post.authorName}</p>
                      </div>
                  </div>
              </div>
          </div>
      ) : (
        <div className={cn(
            "absolute bottom-0 left-0 right-0 z-10 p-4 text-white bg-gradient-to-t from-black/60 to-transparent pointer-events-none transition-opacity duration-300",
            isPlaying ? "opacity-0" : "opacity-100"
        )}>
            {/* Bottom Info: Description and sound */}
            <div className="space-y-3 pr-12">
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                 <div className="flex items-center gap-2">
                    <Music4 className="h-4 w-4" />
                    <p className="text-xs">Original sound - {post.authorName}</p>
                </div>
            </div>
        </div>
      )}

        {/* Right side: Actions */}
        <div className="absolute bottom-16 right-2 z-10 flex flex-col items-center space-y-6 pointer-events-auto">
            {!isDesktop && (
                <Link href={`/profile/${post.authorId}`} onClick={e => e.stopPropagation()}>
                    <Avatar className="h-12 w-12 border-2 border-white/80">
                        <AvatarImage src={post.authorAvatar} data-ai-hint="user avatar" />
                        <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
            )}
             <Button variant="ghost" size="icon" className="h-auto flex-col p-0 text-white hover:bg-transparent hover:text-white" onClick={e => e.stopPropagation()}>
                <Eye className="h-8 w-8" />
                <span className="text-sm font-bold">{post.views || 0}</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-auto flex-col p-0 text-white hover:bg-transparent hover:text-white" onClick={e => e.stopPropagation()}>
                <Heart className="h-8 w-8" />
                <span className="text-sm font-bold">{post.likes}</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-auto flex-col p-0 text-white hover:bg-transparent hover:text-white" onClick={e => e.stopPropagation()}>
                <MessageCircle className="h-8 w-8" />
                <span className="text-sm font-bold">{post.comments}</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-auto flex-col p-0 text-white hover:bg-transparent hover:text-white" onClick={e => e.stopPropagation()}>
                <Share2 className="h-8 w-8" />
            </Button>
        </div>
    </div>
  );
}
