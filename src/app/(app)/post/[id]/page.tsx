
'use client';

import { Post } from '@/components/post';
import { notFound, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateComment } from '@/components/create-comment';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { PostType } from '@/lib/data';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { PostSkeleton } from '@/components/post-skeleton';

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

export default function PostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentType[]>(initialComments);

  useEffect(() => {
    if (!db || !params.id) {
        setLoading(false);
        return;
    };

    const fetchPost = async () => {
        setLoading(true);
        try {
            const postRef = doc(db, 'posts', params.id);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const data = postSnap.data();
                const createdAt = (data.createdAt as Timestamp)?.toDate();
                setPost({
                    id: postSnap.id,
                    authorName: data.authorName,
                    authorHandle: data.authorHandle,
                    authorAvatar: data.authorAvatar,
                    content: data.content,
                    comments: data.comments,
                    reposts: data.reposts,
                    likes: data.likes,
                    media: data.media,
                    timestamp: createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'Just now',
                } as PostType);
            } else {
                setPost(null);
            }
        } catch (error) {
            console.error("Error fetching post:", error);
            setPost(null);
        } finally {
            setLoading(false);
        }
    };

    fetchPost();
  }, [params.id]);

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

  if (loading) {
    return (
        <div className="flex h-full min-h-screen flex-col">
            <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-4 backdrop-blur-sm">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-accent">
                <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-bold">Post</h1>
            </header>
            <main>
                <PostSkeleton />
            </main>
        </div>
    )
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-4 backdrop-blur-sm">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Post</h1>
      </header>
      <main>
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
      </main>
    </div>
  );
}
