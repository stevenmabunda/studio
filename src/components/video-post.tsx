
'use client';

import type { PostType } from '@/lib/data';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Heart, MessageCircle, Repeat, Share2, Volume2, VolumeX, Link as LinkIcon, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { usePosts } from '@/contexts/post-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useToast } from '@/hooks/use-toast';

interface VideoPostProps {
  post: PostType;
  isMuted: boolean;
  onToggleMute: () => void;
  isPlaying: boolean;
  onVisibilityChange: (id: string, isVisible: boolean) => void;
}

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 2.8 3.2 3 5.2-1.4 1.1-3.5 2.2-6 2.2-2.3 0-4.6-1.1-6.8-2.2C5.3 14.3 4.1 12.3 3 10c1.8 1.4 3.9 2.4 6.3 2.5.1 0 .2 0 .3 0 2.3 0 4.2-1.1 5.7-2.2-.1-.1-.2-.2-.2-.3-.1-.3-.2-.5-.3-.8-.3-.9-.6-1.8-1-2.7-.4-.9-.9-1.8-1.4-2.6-1.1-1.4-2.6-2.3-4.2-2.3-1.4 0-2.8.7-3.9 1.8" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);


export function VideoPost({ post, isMuted, onToggleMute, isPlaying, onVisibilityChange }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { likePost, repostPost } = usePosts();
  const { toast } = useToast();

  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [repostCount, setRepostCount] = useState(post.reposts);
  const [isReposted, setIsReposted] = useState(false);
  const [isShareSheetOpen, setShareSheetOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const videoUrl = post.media?.[0]?.url;
  
  const isLongDescription = post.content.length > 80;
  const displayContent = isLongDescription && !isExpanded ? `${post.content.substring(0, 80)}... ` : post.content;


  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
        if (isPlaying) {
            videoElement.play().catch(error => {
                console.error("Video play failed:", error);
            });
        } else {
            videoElement.pause();
        }
    }
  }, [isPlaying]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        onVisibilityChange(post.id, entry.isIntersecting);
      },
      {
        root: null, 
        rootMargin: '0px',
        threshold: 0.5,
      }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [post.id, onVisibilityChange]);

  const togglePlay = () => {
    onVisibilityChange(post.id, !isPlaying);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMute();
  };
  
  const navigateToPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/post/${post.id}`);
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;
    
    setIsLiked(newLikedState);
    setLikeCount(newLikeCount);
    likePost(post.id, !newLikedState);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newRepostedState = !isReposted;
    const newRepostCount = newRepostedState ? repostCount + 1 : repostCount - 1;

    setIsReposted(newRepostedState);
    setRepostCount(newRepostCount);
    repostPost(post.id, !newRepostedState);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareSheetOpen(true);
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({ description: "Link copied to clipboard!" });
  };
  
  const getShareUrl = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const postUrl = encodeURIComponent(`${window.location.origin}/post/${post.id}`);
    const text = encodeURIComponent(post.content);

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${postUrl}&text=${text}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${postUrl}`;
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${text}%20${postUrl}`;
    }
  };


  if (!videoUrl || post.media?.[0]?.type !== 'video') {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-black flex items-center justify-center cursor-pointer"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted={isMuted}
        playsInline
        className="max-h-full max-w-full object-contain"
      />

      <div
        className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none transition-opacity",
            isPlaying ? "opacity-0" : "opacity-100"
        )}
      >
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white"
        onClick={handleToggleMute}
      >
        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
      </Button>
      
      <div className="absolute bottom-6 px-4 left-0 right-20 z-10 text-white pointer-events-auto">
        <div className="min-w-0">
          <Link
            href={`/profile/${post.authorId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block group pointer-events-auto"
          >
            <p className="font-bold text-lg group-hover:underline">@{post.authorHandle}</p>
          </Link>
          <p className="text-sm whitespace-pre-wrap">
            {displayContent}
            {isLongDescription && !isExpanded && (
              <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} className="font-bold ml-1 text-white/90 hover:text-white">
                more
              </button>
            )}
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white pointer-events-auto" onClick={handleLike}>
                <Heart className={cn("h-7 w-7", isLiked && "fill-current text-red-500")} />
            </Button>
            <span className="text-sm font-bold">
              {likeCount > 0 ? likeCount : <span className="hidden md:inline"></span>}
            </span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white pointer-events-auto" onClick={navigateToPost}>
                <MessageCircle className="h-7 w-7" />
            </Button>
            <span className="text-sm font-bold">{post.comments}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white pointer-events-auto" onClick={handleRepost}>
                <Repeat className={cn("h-7 w-7", isReposted && "text-green-500")} />
            </Button>
            <span className="text-sm font-bold">{repostCount > 0 ? repostCount : ""}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-white">
          <Sheet open={isShareSheetOpen} onOpenChange={setShareSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white pointer-events-auto" onClick={handleShareClick}>
                    <Share2 className="h-7 w-7" />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-lg">
              <SheetHeader>
                <SheetTitle>Share Post</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-4 py-4">
                 <a href={getShareUrl('twitter')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-center group">
                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent">
                        <TwitterIcon className="h-7 w-7" />
                    </div>
                    <span className="text-xs">Twitter</span>
                </a>
                <a href={getShareUrl('facebook')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-center group">
                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent">
                        <FacebookIcon className="h-7 w-7" />
                    </div>
                    <span className="text-xs">Facebook</span>
                </a>
                <a href={getShareUrl('whatsapp')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-center group">
                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent">
                        <WhatsAppIcon className="h-7 w-7" />
                    </div>
                    <span className="text-xs">WhatsApp</span>
                </a>
                 <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 text-center group">
                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent">
                        <Copy className="h-7 w-7" />
                    </div>
                    <span className="text-xs">Copy Link</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

    

    