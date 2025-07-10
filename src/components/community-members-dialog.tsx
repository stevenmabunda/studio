
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getCommunityMembers, type CommunityMember } from '@/app/(app)/communities/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface CommunityMembersDialogProps {
  communityId: string;
  children: React.ReactNode;
}

function MemberSkeleton() {
    return (
        <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    )
}

export function CommunityMembersDialog({ communityId, children }: CommunityMembersDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchMembers = async () => {
        setLoading(true);
        try {
          const fetchedMembers = await getCommunityMembers(communityId);
          setMembers(fetchedMembers);
        } catch (error) {
          console.error("Failed to fetch community members:", error);
          toast({ variant: 'destructive', description: "Could not load members." });
        } finally {
          setLoading(false);
        }
      };
      fetchMembers();
    }
  }, [isOpen, communityId, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Community Members</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
            <div className="space-y-4 py-4">
            {loading ? (
                Array.from({length: 3}).map((_, i) => <MemberSkeleton key={i} />)
            ) : members.length > 0 ? (
                members.map((member) => (
                <Link key={member.uid} href={`/profile/${member.uid}`} className="flex items-center gap-4 group" onClick={() => setIsOpen(false)}>
                    <Avatar className="h-10 w-10">
                    <AvatarImage src={member.photoURL} data-ai-hint="user avatar" />
                    <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                    <p className="font-semibold group-hover:underline">{member.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{member.handle}</p>
                    </div>
                </Link>
                ))
            ) : (
                <p className="text-center text-muted-foreground">No members found.</p>
            )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
