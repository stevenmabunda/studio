
'use client';

import type { PostType } from '@/lib/data';
import { VideoCard } from './video-card';

export function VideoGrid({ posts }: { posts: PostType[] }) {
  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
      {posts.map(post => (
        <VideoCard key={post.id} post={post} />
      ))}
    </div>
  );
}
