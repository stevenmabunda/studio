
'use client';

import { PostType } from '@/lib/data';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Heart, MessageCircle, Repeat, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface VideoPostProps {
  post: PostType;
  isMuted: boolean;
  onToggleMute: () => void;
  isActive: boolean;
}

export function VideoPost({ post, isMuted, onToggleMute, isActive }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoUrl = post.media?.[0]?.url;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      // Autoplay when the slide is active
      videoElement.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error("Autoplay failed:", error);
        // Autoplay was prevented. Show a play button or handle it.
        setIsPlaying(false);
      });
    } else {
      // Pause when the slide is not active
      videoElement.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play();
      setIsPlaying(true);
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMute();
  };

  if (!videoUrl || post.media?.[0]?.type !== 'video') {
    return null;
  }

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center snap-center" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted={isMuted}
        playsInline
        className="h-full w-auto max-w-full object-contain"
      />
      
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white"
        onClick={handleToggleMute}
      >
        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
      </Button>

      <div className="absolute bottom-6 px-4 left-0 right-16 z-10 text-white pointer-events-none">
        <div className="flex items-center gap-3">
            <Link href={`/profile/${post.authorId}`} onClick={(e) => e.stopPropagation()} className="pointer-events-auto">
                <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage src={post.authorAvatar} data-ai-hint="user avatar" />
                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
            <div>
                <Link
                    href={`/profile/${post.authorId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block group pointer-events-auto"
                >
                    <p className="font-bold text-lg group-hover:underline">@{post.authorHandle}</p>
                </Link>
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
            </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white">
                <Heart className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.likes}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white">
                <MessageCircle className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.comments}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white">
                <Repeat className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.reposts}</span>
        </div>
      </div>
    </div>
  );
}
