
'use client';

import { PostType } from '@/lib/data';
import Link from 'next/link';
import { useRef } from 'react';

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
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        autoPlay
        muted
        playsInline
        className="h-full w-full object-contain"
      />
      
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-white">
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
    </div>
  );
}
