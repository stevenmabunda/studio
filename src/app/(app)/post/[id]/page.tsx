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


type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: Timestamp;
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    hint?: string;
  }>;
};

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
    const savedScrollY = sessionStorage.getItem('scroll-position');
    router.push('/home'); // Or whatever the feed page is
    if (savedScrollY) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollY, 10));
        sessionStorage.removeItem('scroll-position');
      }, 50); // Delay to allow navigation
    }
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
        setLoadingPost(false);
    };

    fetchPost();

    const commentsRef = collection(db, 'posts', postId, 'comments');
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
        setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleCreateComment = async (data: { text: string, media: ReplyMedia[] }) => {
    if (!user || !postId) return;
    try {
        await addComment(postId, data);
    } catch (error) {
        console.error("Failed to add comment:", error);
    }
  }

  const Header = () => (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-4 backdrop-blur-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={handleBack}>
            <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">Post</h1>
    </header>
  )

  if (loadingPost) {
    return (
        <div>
            <Header />
            <PostSkeleton />
        </div>
    );
  }

  if (!post) {
      return (
          <div>
              <Header />
              <div className="p-8 text-center text-muted-foreground">
                <h2 className="text-xl font-bold">Post not found</h2>
                <p>This post may have been deleted.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="h-full min-h-screen">
        <Header />
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
                 comments.map((comment) => {
                    const hasMedia = comment.media && comment.media.length > 0;
                    const isVideo = hasMedia && comment.media![0].type === 'video';
                    return (
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
                                    {hasMedia && (
                                      <div className={cn("mt-3 rounded-2xl overflow-hidden border max-h-[400px]")}>
                                        {isVideo ? (
                                          <video
                                            src={comment.media![0].url}
                                            controls
                                            className="w-full h-auto max-h-96 object-contain bg-black"
                                          />
                                        ) : (
                                          <Image
                                            src={comment.media![0].url}
                                            alt={`Comment image`}
                                            width={500}
                                            height={500}
                                            className="w-full h-auto max-h-[400px] object-contain"
                                            data-ai-hint={comment.media![0].hint}
                                          />
                                        )}
                                      </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                 })
            ) : (
                 <div className="p-8 text-center text-muted-foreground">
                    <h2 className="text-xl font-bold">No comments yet</h2>
                    <p>Be the first to reply!</p>
                </div>
            )}
        </div>
    </div>
  );
}
