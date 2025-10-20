
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { getVideoPosts } from '@/app/(app)/home/actions';
import type { PostType } from '@/lib/data';
import { Loader2, Play, Pause, Volume2, VolumeX, MessageCircle, Heart, Share2, MoreHorizontal, Music } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import Link from 'next/link';

function VideoPlayer({ post, isActive }: { post: PostType, isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(e => {
        if (e.name !== 'AbortError') console.error('Video play failed:', e);
      });
    } else {
      videoRef.current?.pause();
      if(videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  return (
    <div className="relative h-full w-full bg-black" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={post.media![0].url}
        className="w-full h-full object-contain"
        loop
        playsInline
        muted={isMuted}
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play className="h-16 w-16 text-white/50" fill="currentColor" />
        </div>
      )}
      <div className="absolute bottom-[80px] left-3 text-white z-10 w-3/4">
        <Link href={`/profile/${post.authorId}`} className="font-bold">@{post.authorHandle}</Link>
        <p className="mt-1 text-sm line-clamp-2">{post.content}</p>
        <div className="flex items-center gap-2 mt-2 text-xs">
            <Music className="h-4 w-4" />
            <span>Original Audio - {post.authorName}</span>
        </div>
      </div>
      <div className="absolute bottom-[80px] right-2 flex flex-col items-center gap-4 text-white z-10">
        <button className="flex flex-col items-center">
            <Heart className="h-8 w-8" />
            <span className="text-xs font-bold">{post.likes}</span>
        </button>
        <button className="flex flex-col items-center">
            <MessageCircle className="h-8 w-8" />
            <span className="text-xs font-bold">{post.comments}</span>
        </button>
        <button className="flex flex-col items-center">
            <Share2 className="h-8 w-8" />
            <span className="text-xs font-bold">Share</span>
        </button>
         <button onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m);}} className="flex flex-col items-center">
            {isMuted ? <VolumeX className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
        </button>
      </div>
    </div>
  );
}

export function VideoFeed() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const startPostId = searchParams.get('postId');

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    loop: false,
  });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const videoPosts = await getVideoPosts();
        
        if (startPostId) {
            const startIndex = videoPosts.findIndex(p => p.id === startPostId);
            if (startIndex > -1) {
                // Move the starting post to the beginning of the array
                const startPost = videoPosts.splice(startIndex, 1)[0];
                videoPosts.unshift(startPost);
            }
        }
        setPosts(videoPosts);

      } catch (error) {
        console.error("Failed to fetch video posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [startPostId]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);
  
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-black"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }
  
  return (
    <div className="h-screen w-screen bg-black embla" ref={emblaRef}>
      <div className="embla__container">
        {posts.map((post, index) => (
          <div key={post.id} className="embla__slide relative">
            <VideoPlayer post={post} isActive={index === activeIndex} />
          </div>
        ))}
      </div>
    </div>
  );
}

