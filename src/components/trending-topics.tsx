'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrendingTopics } from '@/app/(app)/explore/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';

type Headline = {
  headline: string;
  source: string;
};

export function TrendingTopics() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHeadlines = async () => {
    setLoading(true);
    try {
      const result = await getTrendingTopics({ numberOfTopics: 5 });
      setHeadlines(result.headlines);
    } catch (error) {
      console.error("Failed to fetch news headlines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadlines();
  }, []);

  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold">News Feed</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-5 w-3/5" />
              </div>
            ))
          ) : (
            <>
              {headlines.map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <p className="font-bold text-sm">{item.source}</p>
                  <p className="text-sm text-muted-foreground group-hover:underline">{item.headline}</p>
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
