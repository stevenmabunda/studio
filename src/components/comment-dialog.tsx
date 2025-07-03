
'use client';

import { Post } from '@/components/post';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { CreateComment } from '@/components/create-comment';
import { useState, useEffect } from 'react';
import type { PostType } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/contexts/post-context';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, orderBy, type Timestamp } from 'firebase/firestore';
import { formatTimestamp } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';


type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: Timestamp;
};

export function CommentDialogContent({ post }: { post: PostType }) {
  const { user } = useAuth();
  const { addComment } = usePosts();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    if (!db) {
        setLoadingComments(false);
        return;
    };
    const commentsRef = collection(db, 'posts', post.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedComments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(fetchedComments);
      setLoadingComments(false);
    }, (error) => {
        console.error("Error fetching comments snapshot:", error);
        setLoadingComments(false); // Stop loading on error
    });

    return () => unsubscribe();
  }, [post.id]);

  const handleCreateComment = async (text: string) => {
    if (!user) return;
    try {
        await addComment(post.id, text);
    } catch (error) {
        console.error("Failed to add comment:", error);
    }
  }

  return (
    <ScrollArea className="h-full max-h-[80vh]">
        <Post {...post} isStandalone={true} />
        <CreateComment onComment={handleCreateComment} />
        <div className="divide-y divide-border">
            {loadingComments ? (
                Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="flex space-x-3 md:space-x-4 p-3 md:p-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/5" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                    </div>
                ))
            ) : comments.length > 0 ? (
                 comments.map((comment) => (
                    <div key={comment.id} className="p-3 md:p-4">
                        <div className="flex space-x-3 md:space-x-4">
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
                                    <span className="text-muted-foreground">{formatTimestamp(comment.createdAt.toDate())}</span>
                                </div>
                                <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                 <div className="p-8 text-center text-muted-foreground">
                    <h2 className="text-xl font-bold">No comments yet</h2>
                    <p>Be the first to reply!</p>
                </div>
            )}
        </div>
    </ScrollArea>
  );
}
