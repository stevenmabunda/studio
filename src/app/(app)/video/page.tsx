
'use client';

import { Suspense } from 'react';
import { VideoFeed } from '@/components/video-feed';
import { Loader2 } from 'lucide-react';

function VideoFeedPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}>
      <VideoFeed />
    </Suspense>
  );
}

export default VideoFeedPage;
