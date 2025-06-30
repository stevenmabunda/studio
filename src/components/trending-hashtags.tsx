'use client';

import { useEffect, useState } from 'react';
import { getTrendingHashtags } from '@/app/(app)/home/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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
      <div className="flex overflow-x-auto space-x-2 no-scrollbar">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))
        ) : (
          hashtags.map((hashtag, index) => (
            <Badge key={index} variant="secondary" className="py-2 px-4 rounded-full cursor-pointer hover:bg-primary/20 whitespace-nowrap text-sm font-semibold">
              {hashtag}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
