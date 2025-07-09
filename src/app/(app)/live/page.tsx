
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MatchType } from '@/lib/data';
import { useEffect, useState } from 'react';
import { getLiveMatches, getUpcomingMatches } from '../home/actions';
import { Skeleton } from '@/components/ui/skeleton';

function MatchCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex justify-around items-center">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-12 mt-3 mx-auto" />
      </CardContent>
    </Card>
  );
}

export default function LivePage() {
  const [liveMatches, setLiveMatches] = useState<MatchType[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<MatchType[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setMatchesLoading(true);
      try {
        const [live, upcoming] = await Promise.all([
          getLiveMatches(),
          getUpcomingMatches(),
        ]);
        setLiveMatches(live);
        setUpcomingMatches(upcoming);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setMatchesLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="flex h-full min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
            <h1 className="text-xl font-bold">Live</h1>
        </header>
        <main className="flex-1">
        <div className="p-4 space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">Live Now</h2>
                {matchesLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                  </div>
                ) : liveMatches.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {liveMatches.map((match) => (
                      <Card
                        key={match.id}
                        className="hover:bg-accent cursor-pointer"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">
                              {match.league}
                            </CardTitle>
                            <Badge
                              variant="destructive"
                              className="bg-accent text-accent-foreground"
                            >
                              LIVE
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="flex justify-around items-center">
                            <span className="font-medium">
                              {match.team1.name}
                            </span>
                            <span className="text-2xl font-bold">
                              {match.score}
                            </span>
                            <span className="font-medium">
                              {match.team2.name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {match.time}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    No live matches right now.
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
                {matchesLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                  </div>
                ) : upcomingMatches.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {upcomingMatches.map((match) => (
                      <Card
                        key={match.id}
                        className="hover:bg-accent cursor-pointer"
                      >
                        <CardHeader>
                          <CardTitle className="text-base">
                            {match.league}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="flex justify-around items-center font-medium">
                            <span>{match.team1.name}</span>
                            <span className="text-lg font-bold">VS</span>
                            <span>{match.team2.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {match.time}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    No upcoming matches found.
                  </p>
                )}
              </div>
            </div>
        </main>
    </div>
  );
}
