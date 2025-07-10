
'use client';

import { PostType } from '@/lib/data';
import Link from 'next/link';
import { useRef } from 'react';
import { Button } from './ui/button';
import { Heart, MessageCircle, Repeat, Share2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPostProps {
  post: PostType;
}

export function VideoPost({ post }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const videoUrl = post.media?.[0]?.url;

  if (!videoUrl || post.media?.[0]?.type !== 'video') {
    return null;
  }

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center snap-center">
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        autoPlay
        muted
        playsInline
        className="h-full w-auto max-w-full object-contain"
        onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}
      />
      
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white">
        <div className="flex-1 space-y-2 min-w-0">
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

      <div className="absolute bottom-24 right-4 z-10 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50">
                <Heart className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.likes}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50">
                <MessageCircle className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.comments}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50">
                <Repeat className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.reposts}</span>
        </div>
         <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50">
                <Bookmark className="h-7 w-7" />
            </Button>
        </div>
      </div>
    </div>
  );
}
