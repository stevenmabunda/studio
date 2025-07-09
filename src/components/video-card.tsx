
'use client';

import type { PostType } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye } from 'lucide-react';

// Function to format large numbers (e.g., 1200 -> 1.2K)
const formatViews = (views: number) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views;
};

export function VideoCard({ post }: { post: PostType }) {
  // We need a thumbnail. Since we can't generate one, we'll use a placeholder.
  const thumbnailUrl = 'https://placehold.co/600x400.png';
  
  // Use post content as title, truncate if necessary
  const title = post.content.length > 60 ? `${post.content.substring(0, 57)}...` : post.content;

  return (
    <Link href={`/post/${post.id}`} className="group space-y-3 cursor-pointer">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg">
        <Image
          src={thumbnailUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="video highlight"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-2 right-2 rounded-sm bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">
          {/* Mock duration */}
          1:23 
        </span>
      </div>
      <div className="flex items-start gap-3">
        <Link href={`/profile/${post.authorId}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <Avatar>
            <AvatarImage src={post.authorAvatar} data-ai-hint="user avatar" />
            <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h3 className="font-bold leading-tight group-hover:underline">{title}</h3>
          <p className="text-sm text-muted-foreground">{post.authorName}</p>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{formatViews(post.views || 0)} views</span>
            <span aria-hidden="true">·</span>
            <span>{post.timestamp}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
