'use client';

import { Post } from '@/components/post';
import { initialPosts, users } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreateComment } from '@/components/create-comment';
import { useState } from 'react';

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
  // In a real app, you would fetch the post and its comments
  // For now, we'll find the post in our static data.
  // Note: This means newly created posts on the home page won't be found here.
  const post = initialPosts.find((p) => p.id === params.id);
  const [comments, setComments] = useState<CommentType[]>(initialComments);

  const handleCreateComment = (text: string) => {
    const newComment: CommentType = {
        id: `comment-${Date.now()}`,
        authorName: users.yourhandle.name,
        authorHandle: users.yourhandle.handle,
        authorAvatar: users.yourhandle.avatar,
        content: text,
        timestamp: 'Just now',
    };
    setComments([newComment, ...comments]);
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
        <Post {...post} />
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
