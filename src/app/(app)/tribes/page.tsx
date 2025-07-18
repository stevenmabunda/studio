
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Users } from "lucide-react";
import Image from "next/image";
import { CreateTribeDialog } from "@/components/create-tribe-dialog";
import { useState, useEffect } from "react";
import { getTribes, type Tribe, getJoinedTribeIds } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { JoinTribeButton } from "@/components/join-tribe-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

function TribeCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="h-28 w-full" />
            <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full mt-2" />
            </CardContent>
        </Card>
    );
}

export default function TribesPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [joinedTribeIds, setJoinedTribeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchTribes = async () => {
    setLoading(true);
    try {
      const fetchedTribes = await getTribes();
      setTribes(fetchedTribes);
      if (user) {
        const ids = await getJoinedTribeIds(user.uid);
        setJoinedTribeIds(new Set(ids));
      }
    } catch (error) {
      console.error("Failed to fetch tribes data", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTribes();
  }, [user]);

  const onTribeCreated = () => {
     fetchTribes();
  }
  
  const handleMembershipChange = (tribeId: string, isMember: boolean) => {
    setJoinedTribeIds(prev => {
      const newSet = new Set(prev);
      if (isMember) {
        newSet.add(tribeId);
      } else {
        newSet.delete(tribeId);
      }
      return newSet;
    });

    setTribes(prev => prev.map(c => {
        if (c.id === tribeId) {
            return { ...c, memberCount: isMember ? c.memberCount + 1 : c.memberCount - 1 };
        }
        return c;
    }));
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm flex justify-between items-center">
        <h1 className="text-xl font-bold">Tribes</h1>
        <CreateTribeDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onTribeCreated={onTribeCreated}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Tribe
          </Button>
        </CreateTribeDialog>
      </header>
      <main className="flex-1 p-4">
        {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <TribeCardSkeleton />
                <TribeCardSkeleton />
                <TribeCardSkeleton />
            </div>
        ) : tribes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tribes.map((tribe) => (
              <Link key={tribe.id} href={`/tribes/${tribe.id}`} className="block">
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <div className="relative h-28 w-full">
                      <Image
                      src={tribe.bannerUrl}
                      alt={`${tribe.name} banner`}
                      fill
                      className="object-cover"
                      data-ai-hint="stadium crowd"
                      />
                  </div>
                  <CardContent className="p-4 flex flex-col flex-grow">
                      <h2 className="text-lg font-bold truncate">{tribe.name}</h2>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{tribe.memberCount.toLocaleString()} {tribe.memberCount === 1 ? 'member' : 'members'}</span>
                      </div>
                      <div className="mt-auto pt-4">
                        <JoinTribeButton
                            tribeId={tribe.id}
                            isMember={joinedTribeIds.has(tribe.id)}
                            onToggleMembership={handleMembershipChange}
                        />
                      </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            </div>
        ) : (
             <div className="p-8 text-center text-muted-foreground">
                <h2 className="text-xl font-bold">No tribes yet</h2>
                <p>Be the first to create one!</p>
            </div>
        )}
      </main>
    </div>
  );
}
