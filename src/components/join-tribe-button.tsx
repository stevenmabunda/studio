
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { toggleTribeMembership } from '@/app/(app)/tribes/actions';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JoinTribeButtonProps {
  tribeId: string;
  isMember: boolean;
  onToggleMembership: (tribeId: string, isNowMember: boolean) => void;
}

export function JoinTribeButton({
  tribeId,
  isMember,
  onToggleMembership,
}: JoinTribeButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!user) {
      toast({ variant: 'destructive', description: 'You must be logged in to join a tribe.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleTribeMembership(user.uid, tribeId, isMember);
      if (result.success) {
        onToggleMembership(tribeId, !isMember);
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
        'Join Tribe'
      )}
    </Button>
  );
}
