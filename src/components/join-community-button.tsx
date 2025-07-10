
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { toggleCommunityMembership } from '@/app/(app)/communities/actions';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JoinCommunityButtonProps {
  communityId: string;
  isMember: boolean;
  onToggleMembership: (communityId: string, isNowMember: boolean) => void;
}

export function JoinCommunityButton({
  communityId,
  isMember,
  onToggleMembership,
}: JoinCommunityButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!user) {
      toast({ variant: 'destructive', description: 'You must be logged in to join a community.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleCommunityMembership(user.uid, communityId, isMember);
      if (result.success) {
        onToggleMembership(communityId, !isMember);
      } else {
        toast({ variant: 'destructive', description: 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', description: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full mt-4"
      variant={isMember ? 'outline' : 'default'}
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isMember ? (
        'Joined'
      ) : (
        'Join Community'
      )}
    </Button>
  );
}
