
'use client';

import { Suspense } from 'react';
import { VideoFeed } from '@/components/video-feed';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

function VideoFeedPage() {
  const router = useRouter();
  
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}>
       <div className="fixed top-4 left-4 z-20">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 text-white bg-black/30 hover:bg-black/50 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
      </div>
      <VideoFeed />
    </Suspense>
  );
}

export default VideoFeedPage;
