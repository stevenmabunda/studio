
'use client';

import * as React from 'react';
import useEmblaCarousel, { type EmblaCarouselType } from 'embla-carousel-react';
import { PostType } from '@/lib/data';
import { VideoPost } from './video-post';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';

export function VideoFeed({ posts }: { posts: PostType[] }) {
  const isMobile = useIsMobile();
  
  // Embla Carousel setup for mobile
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    loop: true,
    active: isMobile === true,
  });
  
  // IntersectionObserver setup for desktop
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Shared state
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(true);

  // Effect for Embla (mobile)
  React.useEffect(() => {
    if (!emblaApi || !isMobile) return;

    const onSelect = (api: EmblaCarouselType) => {
      setActiveIndex(api.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect(emblaApi); // Set initial active index
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, isMobile]);

  // Effect for IntersectionObserver (desktop)
  React.useEffect(() => {
    if (isMobile !== false || !containerRef.current || posts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible
        const visibleEntry = entries.reduce((prev, curr) => {
            return prev.intersectionRatio > curr.intersectionRatio ? prev : curr;
        });

        if (visibleEntry?.isIntersecting) {
          const index = parseInt(visibleEntry.target.getAttribute('data-index') || '0', 10);
          setActiveIndex(index);
        }
      },
      {
        root: null, // viewport
        threshold: 0.5, // Trigger when 50% of the item is visible
      }
    );

    const elements = containerRef.current.querySelectorAll('[data-index]');
    elements.forEach(el => observer.observe(el));
    
    return () => {
        elements.forEach(el => observer.unobserve(el));
    };
  }, [isMobile, posts]);

  // Render a loading state until we know if it's mobile or not
  // to prevent server/client mismatch (hydration errors)
  if (isMobile === undefined) {
    return (
        <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (posts.length === 0) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
            <div>
                <h2 className="text-xl font-bold">No videos yet</h2>
                <p>When users post videos, they'll appear here.</p>
            </div>
        </div>
      );
  }

  if (isMobile) {
    return (
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container">
          {posts.map((post, index) => (
             <div className="embla__slide" key={post.id}>
                <VideoPost 
                  post={post} 
                  isActive={index === activeIndex} 
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(prev => !prev)}
                />
             </div>
          ))}
        </div>
      </div>
    );
  } else {
    // Desktop view with standard mouse-wheel scrolling
    return (
      <div ref={containerRef} className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar">
         {posts.map((post, index) => (
            <div key={post.id} data-index={index} className="h-full w-full flex-shrink-0 snap-center">
                <VideoPost 
                  post={post} 
                  isActive={index === activeIndex} 
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(prev => !prev)}
                />
            </div>
         ))}
      </div>
    );
  }
}
