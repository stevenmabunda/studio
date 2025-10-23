
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

type Comment = PostType;

export function PostPageView({ postId }: { postId: string }) {
  const { user } = useAuth();
  const { addComment } = usePosts();
  const router = useRouter();

  const [post, setPost] = useState<PostType | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
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

  const Header = ({ onBack }: { onBack: () => void }) => (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-4 backdrop-blur-sm h-14">
        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={onBack}>
            <ArrowLeft />
        </Button>
        <div>
            <h1 className="text-xl font-bold">Post</h1>
        </div>
    </header>
  );

  if (loadingPost) {
    return (
        <div>
            <Header onBack={handleBack} />
            <PostSkeleton />
        </div>
    );
  }

  if (!post) {
      return (
          <div>
              <Header onBack={handleBack} />
              <div className="p-8 text-center text-muted-foreground">
                <h2 className="text-xl font-bold">Post not found</h2>
                <p>This post may have been deleted.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="h-screen flex flex-col">
      <Header onBack={handleBack} />
      <div className="flex-1 overflow-y-auto">
        <Post {...post} isStandalone={true} />
        
        <div ref={commentSectionRef} id="comments">
          <CreateComment onComment={handleCreateComment} />
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
    </div>
  );
}
