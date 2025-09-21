
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrendingKeywords, type TrendingKeyword } from '@/app/(app)/explore/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export function TrendingTopics() {
  const [topics, setTopics] = useState<TrendingKeyword[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
      const result = await getTrendingKeywords({ numberOfTopics: 5 });
      setTopics(result);
    } catch (error) {
      console.error("Failed to fetch trending topics:", error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchTopics(true);

    // Then, set up an interval to fetch every hour
    const intervalId = setInterval(() => {
      fetchTopics(false); // Subsequent fetches are not initial loads
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-xl font-bold">What's happening</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1 py-1">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-2/5" />
                </div>
              )
            )
          ) : (
            <>
              {topics.map((item, index) => (
                <Link href={`/search?q=${encodeURIComponent(item.topic)}`} key={index} className="group cursor-pointer block p-2 -m-2 rounded-md hover:bg-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <p className="font-bold text-base">{item.topic}</p>
                      <p className="text-sm text-muted-foreground">{item.postCount}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>
                </Link>
              ))}
              <div className="pt-2">
                <Button variant="link" className="p-0 text-primary text-sm">Show more</Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
