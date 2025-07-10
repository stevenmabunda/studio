
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getCommunities, type Community } from "@/app/(app)/communities/actions";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";

function CommunitySkeleton() {
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

export function SuggestedCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const fetchedCommunities = await getCommunities();
        setCommunities(fetchedCommunities.slice(0, 3)); // Show top 3
      } catch (error) {
        console.error("Failed to fetch communities for suggestions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold text-primary">Suggested Communities</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-4">
          {loading ? (
            <>
                <CommunitySkeleton />
                <CommunitySkeleton />
                <CommunitySkeleton />
            </>
          ) : communities.length > 0 ? (
            communities.map((community) => (
              <Link key={community.id} href={`/communities/${community.id}`} className="flex items-center justify-between gap-2 group">
                <div className="flex items-center gap-3">
                    <Image
                      src={community.bannerUrl}
                      alt={`${community.name} banner`}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                      data-ai-hint="stadium crowd"
                    />
                  <div className="grid">
                    <p className="font-semibold leading-none group-hover:underline">{community.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'member' : 'members'}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 rounded-full">View</Button>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">No communities found.</p>
          )}
           <Button variant="link" className="p-0 text-primary w-fit text-sm" asChild>
            <Link href="/communities">Show more</Link>
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
