'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrendingHashtags } from '@/app/(app)/home/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';

export function TrendingHashtags() {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHashtags = async () => {
    setLoading(true);
    try {
      const result = await getTrendingHashtags({ numberOfHashtags: 5 });
      setHashtags(result.hashtags);
    } catch (error) {
      console.error("Failed to fetch trending hashtags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHashtags();
  }, []);

  return (
    <div className="p-4 border-b">
        <Card className="bg-transparent border-0 shadow-none">
            <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold">Trending</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                        <Skeleton className="h-5 w-3/5" />
                    </div>
                    ))
                ) : (
                    <>
                    {hashtags.map((hashtag, index) => (
                        <div key={index} className="group cursor-pointer">
                            <p className="font-bold text-sm text-primary group-hover:underline">{hashtag}</p>
                        </div>
                    ))}
                    </>
                )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
