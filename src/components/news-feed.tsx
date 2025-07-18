'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNewsHeadlines } from '@/app/(app)/explore/actions';
import type { NewsArticle } from '@/services/news-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';
import { formatTimestamp } from '@/lib/utils';
import Image from 'next/image';

function NewsSkeleton() {
    return (
        <div className="space-y-1">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
        </div>
    );
}

export function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const headlines = await getNewsHeadlines();
        setArticles(headlines);
      } catch (error) {
        console.error("Failed to fetch news headlines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold text-primary">Latest News</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <NewsSkeleton key={i} />)
          ) : articles.length > 0 ? (
            articles.map((article, index) => (
              <Link
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="flex items-start gap-3">
                    {article.urlToImage && (
                        <div className="w-16 h-16 shrink-0">
                             <Image 
                                src={article.urlToImage}
                                alt={article.title}
                                width={64}
                                height={64}
                                className="rounded-md object-cover w-full h-full"
                             />
                        </div>
                    )}
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{article.source.name} · {formatTimestamp(new Date(article.publishedAt))}</p>
                        <p className="font-semibold text-sm leading-snug group-hover:underline">
                            {article.title}
                        </p>
                    </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Could not load news at the moment.</p>
          )}

          {articles.length > 0 && (
             <Button variant="link" className="p-0 text-primary w-fit text-sm">Show more</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
