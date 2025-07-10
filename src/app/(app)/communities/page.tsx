'use client';

import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Users } from "lucide-react";
import Image from "next/image";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { useState, useEffect } from "react";
import { getCommunities, type Community, getJoinedCommunityIds } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { JoinCommunityButton } from "@/components/join-community-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

function CommunityCardSkeleton() {
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

export default function CommunitiesPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const fetchedCommunities = await getCommunities();
      setCommunities(fetchedCommunities);
      if (user) {
        const ids = await getJoinedCommunityIds(user.uid);
        setJoinedCommunityIds(new Set(ids));
      }
    } catch (error) {
      console.error("Failed to fetch communities data", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  const onCommunityCreated = () => {
     fetchCommunities();
  }
  
  const handleMembershipChange = (communityId: string, isMember: boolean) => {
    setJoinedCommunityIds(prev => {
      const newSet = new Set(prev);
      if (isMember) {
        newSet.add(communityId);
      } else {
        newSet.delete(communityId);
      }
      return newSet;
    });

    setCommunities(prev => prev.map(c => {
        if (c.id === communityId) {
            return { ...c, memberCount: isMember ? c.memberCount + 1 : c.memberCount - 1 };
        }
        return c;
    }));
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm flex justify-between items-center">
        <h1 className="text-xl font-bold">Communities</h1>
        <CreateCommunityDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onCommunityCreated={onCommunityCreated}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Community
          </Button>
        </CreateCommunityDialog>
      </header>
      <main className="flex-1 p-4">
        {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <CommunityCardSkeleton />
                <CommunityCardSkeleton />
                <CommunityCardSkeleton />
            </div>
        ) : communities.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => (
              <Link key={community.id} href={`/communities/${community.id}`} className="block">
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <div className="relative h-28 w-full">
                      <Image
                      src={community.bannerUrl}
                      alt={`${community.name} banner`}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="stadium crowd"
                      />
                  </div>
                  <CardContent className="p-4 flex flex-col flex-grow">
                      <h2 className="text-lg font-bold truncate">{community.name}</h2>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'member' : 'members'}</span>
                      </div>
                      <div className="mt-auto pt-4">
                        <JoinCommunityButton
                            communityId={community.id}
                            isMember={joinedCommunityIds.has(community.id)}
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
                <h2 className="text-xl font-bold">No communities yet</h2>
                <p>Be the first to create one!</p>
            </div>
        )}
      </main>
    </div>
  );
}
