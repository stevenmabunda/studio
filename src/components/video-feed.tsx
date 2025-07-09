'use client';

import * as React from 'react';
import useEmblaCarousel, { type EmblaCarouselType } from 'embla-carousel-react';
import { PostType } from '@/lib/data';
import { VideoPost } from './video-post';
import { useIsMobile } from '@/hooks/use-mobile';

export function VideoFeed({ posts }: { posts: PostType[] }) {
  const isMobile = useIsMobile();
  
  // Embla Carousel setup for mobile
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    loop: false,
    containScroll: false,
    active: isMobile === true, // Only enable carousel on mobile
  });
  const [emblaActiveIndex, setEmblaActiveIndex] = React.useState(0);

  // IntersectionObserver setup for desktop
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [desktopActiveIndex, setDesktopActiveIndex] = React.useState(0);

  // Shared state
  const [isMuted, setIsMuted] = React.useState(true);

  // Effect for Embla (mobile)
  React.useEffect(() => {
    if (!emblaApi || !isMobile) return;

    const onSelect = (api: EmblaCarouselType) => {
      setEmblaActiveIndex(api.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect(emblaApi);
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, isMobile]);

  // Effect for IntersectionObserver (desktop)
  React.useEffect(() => {
    if (isMobile !== false || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let maxVisibleEntry: IntersectionObserverEntry | null = null;
        let maxVisibility = -1;

        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
            maxVisibility = entry.intersectionRatio;
            maxVisibleEntry = entry;
          }
        });
        
        if (maxVisibleEntry) {
          const index = parseInt(maxVisibleEntry.target.getAttribute('data-index') || '0', 10);
          setDesktopActiveIndex(index);
        }
      },
      {
        root: null, // observe intersections in the viewport
        threshold: Array.from(Array(101).keys(), i => i / 100), // check visibility at every percentage point
      }
    );

    const elements = containerRef.current.querySelectorAll('[data-index]');
    elements.forEach(el => observer.observe(el));

    return () => {
        elements.forEach(el => observer.unobserve(el));
    };
  }, [isMobile, posts]);

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
  
  // Avoid SSR mismatch by rendering nothing until the client has determined the device type
  if (isMobile === undefined) {
    return null; 
  }

  const activeIndex = isMobile ? emblaActiveIndex : desktopActiveIndex;

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
      <div ref={containerRef} className="h-full w-full overflow-y-auto snap-y snap-mandatory">
         {posts.map((post, index) => (
            <div key={post.id} data-index={index} className="h-full w-full flex-shrink-0 snap-start">
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
