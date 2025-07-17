'use client';

import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog';
import { CreateComment, type ReplyMedia } from '@/components/create-comment';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatTimestamp, linkify } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/contexts/post-context';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, orderBy, type Timestamp, doc, getDoc } from 'firebase/firestore';
import type { PostType } from '@/lib/data';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PostHeader } from './post-header';

type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: Timestamp;
  media?: Array<{ url: string; type: 'image' | 'video'; hint?: string }>;
};

type MediaItem = {
    url: string;
    type: 'image' | 'video';
    hint?: string;
    postId: string;
}

interface MediaViewerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem;
}

function CommentSkeleton() {
    return (
        <div className="flex space-x-3 md:space-x-4 p-3 md:p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
    );
}

export function MediaViewerDialog({ isOpen, onOpenChange, media }: MediaViewerDialogProps) {
  const { user } = useAuth();
  const { addComment } = usePosts();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !db) return;

    setLoading(true);
    setPost(null);
    setComments([]);
    
    const postRef = doc(db, 'posts', media.postId);
    
    const fetchPost = async () => {
        const docSnap = await getDoc(postRef);
        if (docSnap.exists()) {
             const data = docSnap.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate();
            setPost({
                id: docSnap.id,
                authorId: data.authorId,
                authorName: data.authorName,
                authorHandle: data.authorHandle,
                authorAvatar: data.authorAvatar,
                content: data.content,
                comments: data.comments,
                reposts: data.reposts,
                likes: data.likes,
                media: data.media,
                poll: data.poll,
                timestamp: createdAt ? formatTimestamp(createdAt) : 'now',
            } as PostType);
        }
        setLoading(false);
    };

    fetchPost();

    const commentsRef = collection(postRef, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Comment));
    });

    return () => unsubscribe();
  }, [isOpen, media.postId]);

  const handleCreateComment = async (data: { text: string, media: ReplyMedia[] }) => {
    if (!user) return;
    try {
        await addComment(media.postId, data);
    } catch (error) {
        console.error("Failed to add comment:", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-none w-[90vw] h-[90vh] p-0 gap-0 grid grid-cols-1 md:grid-cols-[2fr,1fr]"
        onInteractOutside={(e) => {
          if ((e.target as HTMLElement).hasAttribute('data-radix-collection-item')) {
            e.preventDefault();
          }
        }}
      >
        <DialogTitle className="sr-only">Media Viewer</DialogTitle>
        <div className="relative flex items-center justify-center bg-black/90">
            {media.type === 'video' ? (
                <video src={media.url} controls autoPlay className="max-w-full max-h-full object-contain" />
            ) : (
                <Image src={media.url} alt={media.hint || "Post media"} layout="fill" objectFit="contain" />
            )}
        </div>
        <div className="hidden md:flex flex-col bg-background h-full">
            {loading || !post ? (
                <div className="p-4 space-y-4 border-b">
                   <div className="p-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full mt-4" />
                        <Skeleton className="h-4 w-4/5 mt-2" />
                   </div>
                   <div className="divide-y divide-border">
                        <CommentSkeleton />
                        <CommentSkeleton />
                   </div>
                </div>
            ) : (
                <>
                    <ScrollArea className="flex-1">
                        <div className="p-4 border-b">
                            <PostHeader 
                                authorAvatar={post.authorAvatar}
                                authorId={post.authorId}
                                authorName={post.authorName}
                                authorHandle={post.authorHandle}
                                timestamp={post.timestamp}
                            />
                            <p className="mt-2 whitespace-pre-wrap text-sm">{linkify(post.content)}</p>
                        </div>
                        <div className="divide-y divide-border">
                            {comments.map((comment) => (
                                <div key={comment.id} className="p-3 md:p-4">
                                    <div className="flex space-x-3 md:space-x-4">
                                        <Avatar>
                                        <AvatarImage src={comment.authorAvatar} alt={comment.authorName} data-ai-hint="user avatar" />
                                        <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Link href={`/profile/${comment.authorId}`} className="font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
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
                            ))}
                        </div>
                    </ScrollArea>
                    <CreateComment onComment={handleCreateComment} />
                </>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
