'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrendingTopics } from '@/app/(app)/explore/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trends for you</CardTitle>
        <Button variant="ghost" size="icon" onClick={fetchTopics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            ))
          ) : (
            topics.map((topic, index) => (
              <div key={index} className="group cursor-pointer">
                <p className="text-sm text-muted-foreground">
                  {index + 1} · Trending
                </p>
                <p className="font-bold group-hover:underline">#{topic.replace(/\s+/g, '')}</p>
                <p className="text-sm text-muted-foreground">
                    {Math.floor(Math.random() * 20 + 5)}k posts
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
