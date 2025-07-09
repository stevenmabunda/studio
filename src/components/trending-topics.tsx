
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrendingTopics } from '@/app/(app)/explore/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';
import Image from 'next/image';
import type { GenerateTrendingTopicsOutput } from '@/ai/flows/generate-trending-topics';

type TrendingTopic = GenerateTrendingTopicsOutput['topics'][number];

export function TrendingTopics() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const result = await getTrendingTopics({ numberOfTopics: 5 });
      setTopics(result.topics);
    } catch (error) {
      console.error("Failed to fetch trending topics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const [firstTopic, ...otherTopics] = topics;

  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold text-primary">Join the conversation</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) =>
              i === 0 ? (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-2/5" />
                  </div>
                  <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
                </div>
              ) : (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-2/5" />
                </div>
              )
            )
          ) : (
            <>
              {firstTopic && (
                <div className="group cursor-pointer flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{firstTopic.category}</p>
                    <p className="font-bold text-base group-hover:underline">{firstTopic.topic}</p>
                    <p className="text-sm text-muted-foreground">{firstTopic.postCount}</p>
                  </div>
                  <Image
                    src="https://placehold.co/80x80.png"
                    alt={firstTopic.topic}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover aspect-square shrink-0"
                    data-ai-hint={firstTopic.imageHint || 'football action'}
                  />
                </div>
              )}
              {otherTopics.map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <p className="font-bold text-base group-hover:underline">{item.topic}</p>
                  <p className="text-sm text-muted-foreground">{item.postCount}</p>
                </div>
              ))}
              <Button variant="link" className="p-0 text-primary text-sm">Show more</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
