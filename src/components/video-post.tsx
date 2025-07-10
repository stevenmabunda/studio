
'use client';

import type { PostType } from '@/lib/data';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Heart, MessageCircle, Repeat, Share2, Volume2, VolumeX, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from 'next/navigation';

interface VideoPostProps {
  post: PostType;
  isMuted: boolean;
  onToggleMute: () => void;
  isPlaying: boolean;
  onVisibilityChange: (id: string, isVisible: boolean) => void;
}

export function VideoPost({ post, isMuted, onToggleMute, isPlaying, onVisibilityChange }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const videoUrl = post.media?.[0]?.url;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
        if (isPlaying) {
            videoElement.play().catch(error => {
                console.error("Video play failed:", error);
            });
        } else {
            videoElement.pause();
        }
    }
  }, [isPlaying]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // isIntersecting is true when the element is at least 50% visible
        onVisibilityChange(post.id, entry.isIntersecting);
      },
      {
        root: null, // observes intersections relative to the viewport
        rootMargin: '0px',
        threshold: 0.5, // 50% of the item must be visible to trigger
      }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [post.id, onVisibilityChange]);

  const togglePlay = () => {
    onVisibilityChange(post.id, !isPlaying);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMute();
  };
  
  const navigateToPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/post/${post.id}`);
  }

  if (!videoUrl || post.media?.[0]?.type !== 'video') {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-black flex items-center justify-center cursor-pointer snap-start"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted={isMuted}
        playsInline
        className="max-h-full max-w-full object-contain"
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <Play className="h-20 w-20 text-white/70" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white"
        onClick={handleToggleMute}
      >
        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
      </Button>
      
      <div className={cn(
        "absolute bottom-6 px-4 left-0 right-20 z-10 text-white pointer-events-none transition-opacity duration-300",
        isPlaying ? "opacity-0" : "opacity-100"
      )}>
        <div className="flex items-start gap-3">
          <Link
            href={`/profile/${post.authorId}`}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto hidden md:block flex-shrink-0"
          >
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={post.authorAvatar} data-ai-hint="user avatar" />
              <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <Link
              href={`/profile/${post.authorId}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-block group pointer-events-auto hidden md:inline-block"
            >
              <p className="font-bold text-lg group-hover:underline">@{post.authorHandle}</p>
            </Link>
            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white pointer-events-auto" onClick={(e) => e.stopPropagation() /* TODO: wire up like action */}>
                <Heart className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">
              {post.likes > 0 ? post.likes : <span className="hidden md:inline"></span>}
            </span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white pointer-events-auto" onClick={navigateToPost}>
                <MessageCircle className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.comments}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white pointer-events-auto" onClick={(e) => e.stopPropagation() /* TODO: wire up repost action */}>
                <Repeat className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.reposts}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white pointer-events-auto" onClick={(e) => e.stopPropagation() /* TODO: wire up share action */}>
                <Share2 className="h-7 w-7" />
            </Button>
        </div>
      </div>
    </div>
  );
}
