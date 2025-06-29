'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrendingTopics } from '@/app/(app)/explore/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';

export function TrendingTopics() {
  const [topics, setTopics] = useState<string[]>([]);
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

  return (
    <Card className="border-none bg-secondary">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Trends for you</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-4 w-1/5" />
              </div>
            ))
          ) : (
            <>
              {topics.map((topic, index) => (
                <div key={index} className="group cursor-pointer">
                  <p className="text-sm text-muted-foreground">
                    Trending in Football
                  </p>
                  <p className="font-bold group-hover:underline">{topic}</p>
                  <p className="text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 20 + 5)}k posts
                  </p>
                </div>
              ))}
              <Button variant="link" className="p-0 text-primary">Show more</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
