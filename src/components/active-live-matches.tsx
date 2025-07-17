'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getLiveMatches } from '@/app/(app)/home/actions';
import type { MatchType } from '@/lib/data';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';

function MatchSkeleton() {
  return (
    <div className="space-y-2 p-2">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-10" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-10" />
      </div>
      <Skeleton className="h-6 w-28" />
    </div>
  );
}

export function ActiveLiveMatches() {
  const [liveMatches, setLiveMatches] = useState<MatchType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const live = await getLiveMatches();
        setLiveMatches(live.slice(0, 1));
      } catch (error) {
        console.error('Failed to fetch sidebar matches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold text-primary">Live matches</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div>
          {loading ? (
            <MatchSkeleton />
          ) : liveMatches.length > 0 ? (
            liveMatches.map((match) => (
              <div
                key={match.id}
                className="space-y-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer"
              >
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{match.league}</span>
                  <span>{match.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <div className="flex items-center gap-1">
                      {match.team1.logo && <Image src={match.team1.logo} alt={match.team1.name} width={16} height={16} />}
                      <span>{match.team1.name}</span>
                    </div>
                    <span>{match.score}</span>
                     <div className="flex items-center gap-1">
                      {match.team2.logo && <Image src={match.team2.logo} alt={match.team2.name} width={16} height={16} />}
                      <span>{match.team2.name}</span>
                    </div>
                  </div>
                  <Badge
                    variant="destructive"
                    className="bg-accent text-accent-foreground"
                  >
                    LIVE
                  </Badge>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-primary"
                >
                  Join discussion
                </Button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground p-2">
              No live matches.
            </p>
          )}
        </div>
        <Button variant="link" className="p-0 text-primary w-fit text-sm">
          Show more
        </Button>
      </CardContent>
    </Card>
  );
}
