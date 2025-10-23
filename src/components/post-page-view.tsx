
'use client';

import { Post } from '@/components/post';
import { CreateComment, type ReplyMedia } from '@/components/create-comment';
import { useState, useEffect, useRef } from 'react';
import type { PostType } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/contexts/post-context';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, orderBy, type Timestamp } from 'firebase/firestore';
import { formatTimestamp, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PostSkeleton } from '@/components/post-skeleton';
import { Button } from '@/components/ui/button';
import { getPost } from '@/app/(app)/post/[id]/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';


function ReplyDialog({ post, onReply, open, onOpenChange }: { post: PostType, onReply: (data: { text: string; media: any[] }) => Promise<boolean | null>, open: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    const router = useRouter();

    const handleCreateReply = async (data: { text: string; media: any[] }) => {
        try {
            const success = await onReply(data);
            if (success) {
                onOpenChange(false);
                toast({
                    description: "Your reply was sent.",
                    action: (
                        <Button variant="outline" size="sm" onClick={() => {
                            router.push(`/post/${post.id}#comments`);
                        }}>
                            View
                        </Button>
                    ),
                });
                return true;
            }
             return null;
        } catch (error) {
            toast({ variant: 'destructive', description: "Failed to send reply." });
            return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0" onClick={(e) => e.stopPropagation()}>
                <DialogHeader className="p-4 border-b">
                     <DialogTitle className="sr-only">Reply to post</DialogTitle>
                     <DialogClose />
                </DialogHeader>
                <div className="p-4">
                    <div className="flex space-x-3">
                        <div className="flex flex-col items-center">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                                <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{post.authorName}</span>
                                <span className="text-sm text-muted-foreground">@{post.authorHandle}</span>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Replying to <span className="text-primary">@{post.authorHandle}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <CreateComment onComment={handleCreateReply} isDialog={true} />
            </DialogContent>
        </Dialog>
    );
}

export function PostPageView({ postId }: { postId: string }) {
  const { user } = useAuth();
  const { addComment } = usePosts();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [post, setPost] = useState<PostType | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [showFloatingReply, setShowFloatingReply] = useState(false);

  const mainCommentBoxRef = useRef<HTMLDivElement>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);
  
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  useEffect(() => {
    if (!db || !postId) {
        setLoadingPost(false);
        setLoadingComments(false);
        return;
    };
    
    const fetchPostData = async () => {
        setLoadingPost(true);
        const fetchedPost = await getPost(postId);
        if (fetchedPost) {
            setPost(fetchedPost);
        }
        setLoadingPost(false);
    };

    fetchPostData();

    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedComments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate();
        return {
            id: doc.id,
            authorId: data.authorId,
            authorName: data.authorName,
            authorHandle: data.authorHandle,
            authorAvatar: data.authorAvatar,
            content: data.content,
            timestamp: createdAt ? formatTimestamp(createdAt) : "now",
            media: data.media || [],
            comments: data.comments || 0,
            reposts: data.reposts || 0,
            likes: data.likes || 0,
        }
      }) as Comment[];
      setComments(fetchedComments);
      setLoadingComments(false);

      if (window.location.hash === '#comments' && commentSectionRef.current) {
        setTimeout(() => {
            commentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }, (error) => {
        console.error("Error fetching comments snapshot:", error);
        setLoadingComments(false);
    });

     return () => {
      unsubscribe();
    };
  }, [postId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
        ([entry]) => {
            // Set true if the comment box is NOT intersecting (i.e., scrolled out of view)
            setShowFloatingReply(!entry.isIntersecting);
        },
        { root: null, threshold: 0 } // threshold 0 means it triggers as soon as 1px is scrolled past
    );

    const currentRef = mainCommentBoxRef.current;
    if (currentRef) {
        observer.observe(currentRef);
    }

    return () => {
        if (currentRef) {
            observer.unobserve(currentRef);
        }
    };
  }, [loadingPost]); // Rerun when post is loaded to attach observer

  const handleCreateComment = async (data: { text: string, media: ReplyMedia[] }) => {
    if (!user || !postId) return null;
    try {
        await addComment(postId, data);
        return true; 
    } catch (error) {
        console.error("Failed to add comment:", error);
        return null;
    }
  }

  const Header = ({ onBack, onReplyClick, showReplyButton }: { onBack: () => void, onReplyClick: () => void, showReplyButton: boolean }) => (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/80 p-2 md:p-4 backdrop-blur-sm h-14">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={onBack}>
                <ArrowLeft />
            </Button>
            <div>
                <h1 className="text-xl font-bold">Post</h1>
            </div>
        </div>
        {!isMobile && showReplyButton && (
             <Button size="sm" className="rounded-full" onClick={onReplyClick}>Reply</Button>
        )}
    </header>
  );

  if (loadingPost) {
    return (
        <div>
            <Header onBack={handleBack} onReplyClick={() => {}} showReplyButton={false} />
            <PostSkeleton />
        </div>
    );
  }

  if (!post) {
      return (
          <div>
              <Header onBack={handleBack} onReplyClick={() => {}} showReplyButton={false} />
              <div className="p-8 text-center text-muted-foreground">
                <h2 className="text-xl font-bold">Post not found</h2>
                <p>This post may have been deleted.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="h-screen flex flex-col">
      <Header onBack={handleBack} onReplyClick={() => setIsReplyDialogOpen(true)} showReplyButton={showFloatingReply} />
      <div className="flex-1 overflow-y-auto">
        <Post {...post} isStandalone={true} />
        
        <div ref={commentSectionRef} id="comments">
          <div ref={mainCommentBoxRef}>
            <CreateComment onComment={handleCreateComment} />
          </div>
        </div>

        <div className="border-t">
            {loadingComments ? (
                Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="flex space-x-3 md:space-x-4 p-3 md:p-4 border-b">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/5" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                    </div>
                ))
            ) : comments.length > 0 ? (
                 comments.map((comment, index) => (
                    <div key={`comment-${comment.id}`} className={cn(
                        "border-b",
                        index % 2 !== 0 && "border-b-transparent"
                    )}>
                        <Post {...comment} isReplyView={true} parentPostId={post.id} />
                    </div>
                 ))
            ) : (
                 <div className="p-8 text-center text-muted-foreground">
                    <h2 className="text-xl font-bold">No comments yet</h2>
                    <p>Be the first to reply!</p>
                </div>
            )}
        </div>
      </div>
      <ReplyDialog 
        post={post}
        onReply={handleCreateComment}
        open={isReplyDialogOpen}
        onOpenChange={setIsReplyDialogOpen}
      />
    </div>
  );
}
