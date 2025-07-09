
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getUpcomingMatches,
} from '@/app/(app)/home/actions';
import type { MatchType } from '@/lib/data';
import { Skeleton } from './ui/skeleton';

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

export function UpcomingMatches() {
  const [upcomingMatches, setUpcomingMatches] = useState<MatchType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const upcoming = await getUpcomingMatches();
        setUpcomingMatches(upcoming.slice(0, 2));
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
        <CardTitle className="text-lg font-bold text-primary">Upcoming Matches</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
            Upcoming
          </h3>
          {loading ? (
            <>
              <MatchSkeleton />
              <MatchSkeleton />
            </>
          ) : upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <div
                key={match.id}
                className="space-y-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer"
              >
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{match.league}</span>
                  <span>{match.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold">
                    <span>{match.team1.name}</span>
                    <span>vs</span>
                    <span>{match.team2.name}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Bell className="h-3 w-3 mr-1" />
                  Set reminder
                </Button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground p-2">
              No upcoming matches.
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
