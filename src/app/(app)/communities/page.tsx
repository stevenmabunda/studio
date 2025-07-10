'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Users } from "lucide-react";
import Image from "next/image";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { useState, useEffect } from "react";
import { getCommunities, type Community } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
        setLoading(true);
        const fetchedCommunities = await getCommunities();
        setCommunities(fetchedCommunities);
        setLoading(false);
    }
    fetchCommunities();
  }, []);

  // When a community is created, we can re-fetch the list.
  const onCommunityCreated = async () => {
     setLoading(true);
     const fetchedCommunities = await getCommunities();
     setCommunities(fetchedCommunities);
     setLoading(false);
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
                <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-28 w-full">
                    <Image
                    src={community.bannerUrl}
                    alt={`${community.name} banner`}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="stadium crowd"
                    />
                </div>
                <CardContent className="p-4">
                    <h2 className="text-lg font-bold truncate">{community.name}</h2>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'member' : 'members'}</span>
                    </div>
                    <Button className="w-full mt-4">Join Community</Button>
                </CardContent>
                </Card>
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
