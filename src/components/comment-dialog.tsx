
'use client';

import { Post } from '@/components/post';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { CreateComment } from '@/components/create-comment';
import { useState } from 'react';
import type { PostType } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';

type CommentType = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
};

const initialComments: CommentType[] = [
  {
    id: 'comment-1',
    authorName: 'Leo Messi',
    authorHandle: 'leomessi',
    authorAvatar: 'https://placehold.co/40x40.png',
    content: 'What a moment! History made.',
    timestamp: '1h',
  },
  {
    id: 'comment-2',
    authorName: 'CR7',
    authorHandle: 'cristiano',
    authorAvatar: 'https://placehold.co/40x40.png',
    content: 'Incredible signing for Madrid.',
    timestamp: '45m',
  }
];

export function CommentDialogContent({ post }: { post: PostType }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>(initialComments);

  const handleCreateComment = (text: string) => {
    if (!user) return;

    const newComment: CommentType = {
        id: `comment-${Date.now()}`,
        authorName: user.displayName || 'User',
        authorHandle: user.email?.split('@')[0] || 'user',
        authorAvatar: user.photoURL || 'https://placehold.co/40x40.png',
        content: text,
        timestamp: 'Just now',
    };
    setComments([newComment, ...comments]);
  }

  return (
    <ScrollArea className="h-full max-h-[80vh]">
        <Post {...post} isStandalone={true} />
        <CreateComment onComment={handleCreateComment} />
        <div className="divide-y divide-border">
            {comments.map((comment) => (
                <div key={comment.id} className="p-4">
                    <div className="flex space-x-4">
                        <Avatar>
                        <AvatarImage src={comment.authorAvatar} alt={comment.authorName} data-ai-hint="user avatar" />
                        <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm">
                                <Link href="#" className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                                    {comment.authorName}
                                </Link>
                                <span className="text-muted-foreground">@{comment.authorHandle}</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-muted-foreground">{comment.timestamp}</span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </ScrollArea>
  );
}
