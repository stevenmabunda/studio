
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowButton } from "./follow-button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUsersToFollow, type ProfileData } from "@/app/(app)/profile/actions";
import { Skeleton } from "./ui/skeleton";


function UserSkeleton() {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
        </div>
    );
}

export function WhoToFollow() {
  const { user } = useAuth();
  const [usersToFollow, setUsersToFollow] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        setLoading(true);
        getUsersToFollow(user.uid)
            .then(setUsersToFollow)
            .catch(err => console.error("Failed to fetch users to follow", err))
            .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user]);

  if (!user) {
    return null; // Don't show this component to guests
  }

  return (
    <Card className="bg-secondary">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-bold text-primary">Who to follow</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col gap-4">
          {loading ? (
            <>
                <UserSkeleton />
                <UserSkeleton />
                <UserSkeleton />
            </>
          ) : usersToFollow.length > 0 ? (
            usersToFollow.map((userToFollow) => (
                <div key={userToFollow.uid} className="flex items-center justify-between gap-2">
                <Link href={`/profile/${userToFollow.uid}`} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                    <AvatarImage src={userToFollow.photoURL} data-ai-hint="user avatar" />
                    <AvatarFallback>{userToFollow.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid">
                    <p className="font-semibold leading-none hover:underline">{userToFollow.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{userToFollow.handle}</p>
                    </div>
                </Link>
                <FollowButton profileId={userToFollow.uid} />
                </div>
            ))
          ) : (
             <p className="text-sm text-muted-foreground text-center py-4">No new suggestions right now.</p>
          )}

          {usersToFollow.length > 0 && (
            <Button variant="link" className="p-0 text-primary w-fit text-sm">Show more</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
