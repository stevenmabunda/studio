
'use client';

import { PostType } from '@/lib/data';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Heart, MessageCircle, Repeat, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface VideoPostProps {
  post: PostType;
}

export function VideoPost({ post }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  const videoUrl = post.media?.[0]?.url;

  if (!videoUrl || post.media?.[0]?.type !== 'video') {
    return null;
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center snap-center">
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        autoPlay
        muted={isMuted}
        playsInline
        className="h-full w-auto max-w-full object-contain"
        onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}
      />
      
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
      </Button>

      <div className="absolute bottom-6 left-4 right-4 z-10 text-white">
        <div className="flex items-center gap-3">
            <Link href={`/profile/${post.authorId}`} onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
            <div>
                <Link
                    href={`/profile/${post.authorId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block group"
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
