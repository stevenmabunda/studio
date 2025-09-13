
'use client';

import { Post } from '@/components/post';
import { CreateComment, type ReplyMedia } from '@/components/create-comment';
import { useState, useEffect } from 'react';
import type { PostType } from '@/lib/data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/contexts/post-context';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, orderBy, type Timestamp, doc, getDoc } from 'firebase/firestore';
import { formatTimestamp } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { PostSkeleton } from '@/components/post-skeleton';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';


type Comment = PostType;

export default function PostPage() {
  const { user } = useAuth();
  const { addComment } = usePosts();
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<PostType | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  
  const handleBack = () => {
    // We simply go back in history. The home page's useEffect will handle scroll restoration.
    router.back();
  };

  useEffect(() => {
    if (!db || !postId) {
        setLoadingPost(false);
        setLoadingComments(false);
        return;
    };
    
    const fetchPost = async () => {
        setLoadingPost(true);
        const postRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(postRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const createdAt = (data.createdAt as Timestamp)?.toDate();
            const fetchedPost = {
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
            } as PostType;
            setPost(fetchedPost);
            document.title = `Post by @${fetchedPost.authorHandle} | BHOLO`;
        }
        setLoadingPost(false);
    };

    fetchPost();

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
            // Fill in missing post fields for type compatibility
            comments: 0,
            reposts: 0,
            likes: 0,
        }
      }) as Comment[];
      setComments(fetchedComments);
      setLoadingComments(false);
    }, (error) => {
        console.error("Error fetching comments snapshot:", error);
        setLoadingComments(false);
    });

     return () => {
      unsubscribe();
      document.title = 'BHOLO'; // Reset title on unmount
    };
  }, [postId]);

  const handleCreateComment = async (data: { text: string, media: ReplyMedia[] }) => {
    if (!user || !postId) return null;
    try {
        return await addComment(postId, data);
    } catch (error) {
        console.error("Failed to add comment:", error);
        return null;
    }
  }

  const handleCommentCreated = (newComment: PostType) => {
    setComments(prev => [newComment as Comment, ...prev]);
  }

  const Header = ({ post, onBack }: { post: PostType | null, onBack: () => void }) => (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-4 backdrop-blur-sm h-14">
        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={onBack}>
            <ArrowLeft />
        </Button>
        <div>
            <h1 className="text-xl font-bold">Post</h1>
             {post && (
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    by @{post.authorHandle}
                </p>
            )}
        </div>
    </header>
  );

  if (loadingPost) {
    return (
        <div>
            <Header post={null} onBack={handleBack} />
            <PostSkeleton />
        </div>
    );
  }

  if (!post) {
      return (
          <div>
              <Header post={null} onBack={handleBack} />
              <div className="p-8 text-center text-muted-foreground">
                <h2 className="text-xl font-bold">Post not found</h2>
                <p>This post may have been deleted.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="h-screen flex flex-col">
      <Header post={post} onBack={handleBack} />
      <div className="flex-1 overflow-y-auto">
        <Post {...post} isStandalone={true} />
        <CreateComment onComment={handleCreateComment} onCommentCreated={handleCommentCreated} />
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
                    <Post key={`comment-${comment.id}`} {...comment} />
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

    