'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getIsFollowing, toggleFollow } from '@/app/(app)/profile/actions';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FollowButton({ profileId, onFollowToggle }: { profileId: string, onFollowToggle?: (isFollowing: boolean) => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && user.uid !== profileId) {
            setIsLoading(true);
            getIsFollowing(user.uid, profileId).then(status => {
                setIsFollowing(status);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [user, profileId]);

    const handleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (!user) {
            toast({ variant: 'destructive', description: "You must be logged in to follow users." });
            return;
        }

        setIsLoading(true);
        const result = await toggleFollow(user.uid, profileId, isFollowing);
        if (result.success) {
            const newFollowState = !isFollowing;
            setIsFollowing(newFollowState);
            onFollowToggle?.(newFollowState);
        } else {
             toast({ variant: 'destructive', description: "Something went wrong. Please try again." });
        }
        setIsLoading(false);
    };

    if (!user || user.uid === profileId) {
        return null;
    }

    return (
        <Button
            variant={isFollowing ? 'outline' : 'default'}
            size="sm"
            className={cn("shrink-0 rounded-full font-bold h-8 px-4", !isFollowing && "bg-foreground text-background hover:bg-foreground/90")}
            onClick={handleFollow}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isFollowing ? 'Following' : 'Follow')}
        </Button>
    );
}
