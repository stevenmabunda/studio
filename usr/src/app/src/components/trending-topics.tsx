
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTrendingKeywords, type TrendingKeyword } from '@/app/(app)/explore/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { generateTrendingTopics } from '@/app/(app)/explore/actions';
import type { GenerateTrendingTopicsOutput } from '@/ai/flows/generate-trending-topics';


function TopicSkeleton() {
    return <Skeleton className="h-24 w-full rounded-lg" />;
}

export function TrendingTopics() {
  const [topics, setTopics] = useState<GenerateTrendingTopicsOutput['topics']>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
      const rawTopics = await getTrendingKeywords({ numberOfTopics: 5 });
      if (rawTopics.length > 0) {
        const topicStrings = rawTopics.map(t => `${t.topic} (${t.postCount})`);
        const result = await generateTrendingTopics({ topics: topicStrings });
        setTopics(result.topics);
      } else {
        setTopics([]);
      }
    } catch (error) {
      console.error("Failed to fetch trending topics:", error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTopics(true);
    const intervalId = setInterval(() => fetchTopics(false), 60 * 60 * 1000); // 1 hour
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Trending Now</h2>
            <div className="space-y-2">
                <TopicSkeleton />
                <TopicSkeleton />
                <TopicSkeleton />
            </div>
        </div>
    );
  }

  if (topics.length === 0) {
    return (
        <div className="text-center p-4 rounded-lg bg-secondary">
            <h3 className="font-bold">No trends right now</h3>
            <p className="text-sm text-muted-foreground">Check back later for the latest conversations.</p>
        </div>
    )
  }

  const [heroTopic, ...otherTopics] = topics;

  return (
    <div className="space-y-4">
        <h2 className="text-xl font-bold">Trending Now</h2>
        <div className="space-y-2">
            {heroTopic && (
                <Link href={`/search?q=${encodeURIComponent(heroTopic.topic)}`} className="block relative w-full h-32 rounded-lg overflow-hidden group">
                     <Image
                        src="https://placehold.co/600x200.png"
                        alt={heroTopic.topic}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={heroTopic.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-3 text-white">
                        <p className="font-bold text-lg leading-tight">{heroTopic.topic}</p>
                        <p className="text-xs">{heroTopic.postCount}</p>
                    </div>
                </Link>
            )}

            <div className="grid grid-cols-2 gap-2">
                 {otherTopics.slice(0, 2).map((item, index) => (
                    <Link key={index} href={`/search?q=${encodeURIComponent(item.topic)}`} className="block relative w-full h-24 rounded-lg overflow-hidden group">
                        <Image
                            src="https://placehold.co/200x200.png"
                            alt={item.topic}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={item.imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-2 text-white">
                            <p className="font-bold text-sm leading-tight">{item.topic}</p>
                            <p className="text-xs">{item.postCount}</p>
                        </div>
                    </Link>
                ))}
            </div>

             <div className="space-y-2 pt-2">
                {otherTopics.slice(2).map((item, index) => (
                     <Link key={index} href={`/search?q=${encodeURIComponent(item.topic)}`} className="block p-2 rounded-lg hover:bg-secondary">
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <p className="font-bold">{item.topic}</p>
                        <p className="text-sm text-muted-foreground">{item.postCount}</p>
                     </Link>
                ))}
            </div>
        </div>
    </div>
  );
}
