
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCommunityDetails, getCommunityPosts, type Community } from '../actions';
import type { PostType } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/contexts/post-context';
import { CreatePost, type Media } from '@/components/create-post';
import { Post } from '@/components/post';
import { PostSkeleton } from '@/components/post-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { CommunityMembersDialog } from '@/components/community-members-dialog';

export default function CommunityPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { addPost } = usePosts();
    const params = useParams();
    const router = useRouter();
    const communityId = params.id as string;

    const [community, setCommunity] = useState<Community | null>(null);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);

    const fetchCommunityData = useCallback(async () => {
        if (!communityId) return;
        setLoading(true);
        setPostsLoading(true);
        try {
            const details = await getCommunityDetails(communityId);
            if (details) {
                setCommunity(details);
                const communityPosts = await getCommunityPosts(communityId);
                const sortedPosts = communityPosts.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });
                setPosts(sortedPosts);
            } else {
                toast({ variant: 'destructive', description: "Community not found." });
                router.push('/communities');
            }
        } catch (error) {
            console.error("Error fetching community data:", error);
            toast({ variant: 'destructive', description: "Could not fetch community data." });
        } finally {
            setLoading(false);
            setPostsLoading(false);
        }
    }, [communityId, toast, router]);

    useEffect(() => {
        fetchCommunityData();
    }, [fetchCommunityData]);
    
    const handlePost = async (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null }) => {
        if (!communityId) return;
        try {
            const newPost = await addPost({ ...data, communityId });
            if (newPost) {
                setPosts(prevPosts => [newPost, ...prevPosts]);
                toast({ description: "Your post has been published in the community!" });
            } else {
                 toast({ variant: 'destructive', description: "Something went wrong. Please try again." });
            }
        } catch (error) {
            console.error("Failed to create community post:", error);
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

    if (!community) {
        return null;
    }

    return (
        <div>
            <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-2 backdrop-blur-sm">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="text-xl font-bold">{community.name}</h1>
                </div>
            </header>
            <div className="relative h-40 w-full bg-muted">
                <Image
                    src={community.bannerUrl}
                    alt={`${community.name} banner`}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="stadium lights"
                />
            </div>
            <div className="p-4 border-b">
                 <h2 className="text-2xl font-bold">{community.name}</h2>
                 <p className="text-muted-foreground mt-1">{community.description}</p>
                 <CommunityMembersDialog communityId={communityId}>
                     <div className="flex items-center text-sm text-muted-foreground mt-2 cursor-pointer hover:underline">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'member' : 'members'}</span>
                     </div>
                 </CommunityMembersDialog>
            </div>

            <CreatePost onPost={handlePost} communityId={communityId} />

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
                        <h2 className="text-xl font-bold">No posts in this community yet.</h2>
                        <p>Be the first to post!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
