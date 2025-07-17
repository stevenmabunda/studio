'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from './follow-button';
import { useAuth } from '@/hooks/use-auth';

interface PostHeaderProps {
  authorId: string;
  authorAvatar: string;
  authorName: string;
  authorHandle: string;
  timestamp: string;
}

export function PostHeader({ authorId, authorAvatar, authorName, authorHandle, timestamp }: PostHeaderProps) {
    const { user } = useAuth();
    const isAuthor = user?.uid === authorId;

    return (
        <div className="flex items-start justify-between">
            <div className="flex min-w-0 items-start gap-3">
                <Link href={`/profile/${authorId}`} onClick={(e) => e.stopPropagation()}>
                    <Avatar className="h-10 w-10">
                    <AvatarImage src={authorAvatar} alt={authorName} data-ai-hint="user avatar" />
                    <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex flex-col min-w-0">
                    <Link href={`/profile/${authorId}`} className="truncate font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                        {authorName}
                    </Link>
                    <span className="truncate text-sm text-muted-foreground">@{authorHandle}</span>
                </div>
            </div>
            {!isAuthor && <FollowButton profileId={authorId} />}
        </div>
    );
}
