
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { PostType } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Heart, MessageCircle, MoreHorizontal, Music, Play, Repeat, Share2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface VideoPostProps {
    post: PostType;
    isMuted: boolean;
    onToggleMute: () => void;
    isPlaying: boolean;
    onVisibilityChange: (id: string, isVisible: boolean) => void;
    activeVideoId?: string | null;
}

export function VideoPost({ post, isMuted, onToggleMute, isPlaying, onVisibilityChange, activeVideoId }: VideoPostProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(!isPlaying);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                onVisibilityChange(post.id, entry.isIntersecting);
            },
            { threshold: 0.5 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [post.id, onVisibilityChange]);

    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(error => {
                    console.error("Video play failed:", error);
                    setIsPaused(true);
                });
                setIsPaused(false);
            } else {
                videoRef.current.pause();
                setIsPaused(true);
            }
        }
    }, [isPlaying]);

    const handleVideoClick = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPaused(false);
            } else {
                videoRef.current.pause();
                setIsPaused(true);
            }
        }
    };
    
    if (!post.media || post.media.length === 0 || post.media[0].type !== 'video') {
        return null; // Or some fallback UI
    }

    return (
        <div ref={containerRef} className="relative h-full w-full bg-black flex items-center justify-center snap-start" onClick={handleVideoClick}>
            <video
                ref={videoRef}
                src={post.media[0].url}
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-contain"
            />
            {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="h-16 w-16 text-white/70" fill="currentColor" />
                </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/50 to-transparent">
                <div className='flex justify-between items-end'>
                    <div className='flex-1 min-w-0'>
                        <div className="flex items-center gap-2">
                             <Link href={`/profile/${post.authorId}`} onClick={e => e.stopPropagation()}>
                                <Avatar className="h-10 w-10 border-2 border-white">
                                    <AvatarImage src={post.authorAvatar} />
                                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <Link href={`/profile/${post.authorId}`} onClick={e => e.stopPropagation()}>
                                <p className="font-bold text-lg">@{post.authorHandle}</p>
                            </Link>
                        </div>
                        <p className="mt-2 text-sm line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm">
                            <Music className="h-4 w-4" />
                            <div className="w-40 overflow-hidden whitespace-nowrap">
                                <span className="animate-marquee inline-block pr-4">Original sound - {post.authorName}</span>
                                <span className="animate-marquee-2 inline-block pr-4">Original sound - {post.authorName}</span>
                            </div>
                        </div>
                    </div>
                     <div className="flex flex-col items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-white h-12 w-12 flex-col gap-1">
                            <Heart className="h-7 w-7" />
                            <span className="text-xs font-bold">{post.likes}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white h-12 w-12 flex-col gap-1">
                            <MessageCircle className="h-7 w-7" />
                            <span className="text-xs font-bold">{post.comments}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white h-12 w-12 flex-col gap-1">
                            <Repeat className="h-7 w-7" />
                             <span className="text-xs font-bold">{post.reposts}</span>
                        </Button>
                         <Button variant="ghost" size="icon" className="text-white h-12 w-12">
                            <Share2 className="h-7 w-7" />
                        </Button>
                    </div>
                </div>
            </div>
             <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" className="text-white bg-black/30" onClick={(e) => { e.stopPropagation(); onToggleMute();}}>
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    );
}
