'use client';

import * as React from 'react';
import useEmblaCarousel, { type EmblaCarouselType } from 'embla-carousel-react';
import { PostType } from '@/lib/data';
import { VideoPost } from './video-post';

export function VideoFeed({ posts }: { posts: PostType[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    loop: false,
    containScroll: false,
  });
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(true); // Shared mute state

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = (api: EmblaCarouselType) => {
      setActiveIndex(api.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    // Set initial active index
    onSelect(emblaApi);
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

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
}
