
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getTribeDetails, getTribePosts, type Tribe } from '../actions';
import type { PostType } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/contexts/post-context';
import { CreatePost, type Media } from '@/components/create-post';
import { Post } from '@/components/post';
import { PostSkeleton } from '@/components/post-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Settings } from 'lucide-react';
import { TribeMembersDialog } from '@/components/tribe-members-dialog';
import { EditTribeDialog } from '@/components/edit-tribe-dialog';

export default function TribePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { addPost } = usePosts();
    const params = useParams();
    const router = useRouter();
    const tribeId = params.id as string;

    const [tribe, setTribe] = useState<Tribe | null>(null);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const isCreator = user?.uid === tribe?.creatorId;

    const fetchTribeData = useCallback(async () => {
        if (!tribeId) return;
        setLoading(true);
        setPostsLoading(true);
        try {
            const details = await getTribeDetails(tribeId);
            if (details) {
                setTribe(details);
                const tribePosts = await getTribePosts(tribeId);
                const sortedPosts = tribePosts.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });
                setPosts(sortedPosts);
            } else {
                toast({ variant: 'destructive', description: "Tribe not found." });
                router.push('/tribes');
            }
        } catch (error) {
            console.error("Error fetching tribe data:", error);
            toast({ variant: 'destructive', description: "Could not fetch tribe data." });
        } finally {
            setLoading(false);
            setPostsLoading(false);
        }
    }, [tribeId, toast, router]);

    useEffect(() => {
        fetchTribeData();
    }, [fetchTribeData]);
    
    const handlePost = async (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null }) => {
        if (!tribeId) return;
        try {
            const newPost = await addPost({ ...data, tribeId });
            if (newPost) {
                setPosts(prevPosts => [newPost, ...prevPosts]);
                toast({ description: "Your post has been published in the tribe!" });
            } else {
                 toast({ variant: 'destructive', description: "Something went wrong. Please try again." });
            }
        } catch (error) {
            console.error("Failed to create tribe post:", error);
            toast({ variant: 'destructive', description: "Something went wrong. Please try again." });
        }
    };

    if (loading) {
        return (
            <div>
                <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-2 backdrop-blur-sm">
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <Skeleton className="h-6 w-40" />
                </header>
                <div className="relative h-40 w-full bg-muted">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="border-t">
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            </div>
        );
    }

    if (!tribe) {
        return null;
    }

    return (
        <div>
            <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-2 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{tribe.name}</h1>
                    </div>
                </div>
                 {isCreator && (
                     <EditTribeDialog
                        tribe={tribe}
                        isOpen={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        onTribeUpdated={fetchTribeData}
                    >
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </EditTribeDialog>
                )}
            </header>
            <div className="relative h-40 w-full bg-muted">
                <Image
                    src={tribe.bannerUrl}
                    alt={`${tribe.name} banner`}
                    fill
                    objectFit="cover"
                    data-ai-hint="stadium lights"
                />
            </div>
            <div className="p-4 border-b">
                 <h2 className="text-2xl font-bold">{tribe.name}</h2>
                 <p className="text-muted-foreground mt-1">{tribe.description}</p>
                 <TribeMembersDialog tribeId={tribeId} isCreator={isCreator}>
                     <div className="flex items-center text-sm text-muted-foreground mt-2 cursor-pointer hover:underline">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{tribe.memberCount.toLocaleString()} {tribe.memberCount === 1 ? 'member' : 'members'}</span>
                     </div>
                 </TribeMembersDialog>
            </div>

            <CreatePost onPost={handlePost} tribeId={tribeId} />

            <div className="divide-y divide-border">
                {postsLoading ? (
                     <div className="border-t">
                        <PostSkeleton />
                        <PostSkeleton />
                    </div>
                ) : posts.length > 0 ? (
                    posts.map((post) => <Post key={post.id} {...post} />)
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <h2 className="text-xl font-bold">No posts in this tribe yet.</h2>
                        <p>Be the first to post!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
