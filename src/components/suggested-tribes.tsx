
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getTribes, type Tribe } from "@/app/(app)/tribes/actions";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";

function TribeSkeleton() {
    return (
        <div className="flex items-center justify-between gap-2 p-2">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
        </div>
    );
}

export function SuggestedTribes() {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTribes = async () => {
      setLoading(true);
      try {
        const fetchedTribes = await getTribes();
        setTribes(fetchedTribes.slice(0, 3)); // Show top 3
      } catch (error) {
        console.error("Failed to fetch tribes for suggestions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTribes();
  }, []);

  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold text-primary">Suggested Tribes</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-4">
          {loading ? (
            <>
                <TribeSkeleton />
                <TribeSkeleton />
                <TribeSkeleton />
            </>
          ) : tribes.length > 0 ? (
            tribes.map((tribe) => (
              <Link key={tribe.id} href={`/tribes/${tribe.id}`} className="flex items-center justify-between gap-2 group">
                <div className="flex items-center gap-3">
                    <Image
                      src={tribe.bannerUrl}
                      alt={`${tribe.name} banner`}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                      data-ai-hint="stadium crowd"
                    />
                  <div className="grid">
                    <p className="font-semibold leading-none group-hover:underline">{tribe.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{tribe.memberCount.toLocaleString()} {tribe.memberCount === 1 ? 'member' : 'members'}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 rounded-full">View</Button>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">No tribes found.</p>
          )}
           <Button variant="link" className="p-0 text-primary w-fit text-sm" asChild>
            <Link href="/tribes">Show more</Link>
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
