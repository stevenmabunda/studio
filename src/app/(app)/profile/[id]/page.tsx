
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Post } from "@/components/post";
import Image from "next/image";
import { MapPin, Link as LinkIcon, CalendarDays, Camera, Loader2, ArrowLeft, Heart, Globe, RefreshCw, PlayCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePosts } from "@/contexts/post-context";
import { PostSkeleton } from "@/components/post-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db, storage } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams, useRouter } from "next/navigation";
import { getUserProfile, getIsFollowing, toggleFollow, type ProfileData, getLikedPosts, updateUserPosts, getMediaPosts } from "../actions";
import { FollowButton } from "@/components/follow-button";
import type { PostType } from "@/lib/data";
import { FollowListDialog } from "@/components/follow-list-dialog";
import { MessageButton } from "@/components/message-button";
import { cn } from "@/lib/utils";
import Link from 'next/link';


const profileFormSchema = z.object({
    displayName: z.string().min(2, "Name must be at least 2 characters."),
    bio: z.string().max(160, "Bio must not exceed 160 characters.").optional(),
    location: z.string().max(30, "Location must not exceed 30 characters.").optional(),
    country: z.string().max(50, "Country must not exceed 50 characters.").optional(),
    favouriteClub: z.string().max(50, "Club name must not exceed 50 characters.").optional(),
});


export default function ProfilePage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { posts, loading: postsLoading } = usePosts();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<PostType[]>([]);
  const [likedPostsLoading, setLikedPostsLoading] = useState(false);
  const [mediaPosts, setMediaPosts] = useState<PostType[]>([]);
  const [mediaPostsLoading, setMediaPostsLoading] = useState(false);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(true);
  
  const isMyProfile = currentUser?.uid === profileId;
  const hasFetchedLikedPosts = useRef(false);
  const hasFetchedMediaPosts = useRef(false);

  const fetchProfileAndFollowStatus = useCallback(async () => {
    if (!profileId) return;
    setProfileLoading(true);
    setFollowLoading(true);
    try {
        const fetchedProfile = await getUserProfile(profileId);
        if (fetchedProfile) {
            setProfile(fetchedProfile);
        } else {
           toast({ variant: 'destructive', title: "Error", description: "Profile not found." });
           router.push('/home'); // Redirect if profile doesn't exist
        }

        if (currentUser && currentUser.uid !== profileId) {
            const followStatus = await getIsFollowing(currentUser.uid, profileId);
            setIsFollowing(followStatus);
        }

    } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not fetch profile." });
    } finally {
        setProfileLoading(false);
        setFollowLoading(false);
    }
  }, [profileId, toast, router, currentUser]);


  const handleTabChange = async (value: string) => {
    if (value === 'likes' && !hasFetchedLikedPosts.current) {
        hasFetchedLikedPosts.current = true;
        setLikedPostsLoading(true);
        try {
            const fetchedLikedPosts = await getLikedPosts(profileId);
            setLikedPosts(fetchedLikedPosts);
        } catch (error) {
            console.error("Error fetching liked posts:", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not fetch liked posts." });
        } finally {
            setLikedPostsLoading(false);
        }
    } else if (value === 'media' && !hasFetchedMediaPosts.current) {
        hasFetchedMediaPosts.current = true;
        setMediaPostsLoading(true);
        try {
            const fetchedMediaPosts = await getMediaPosts(profileId);
            setMediaPosts(fetchedMediaPosts);
        } catch (error) {
            console.error("Error fetching media posts:", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not fetch media." });
        } finally {
            setMediaPostsLoading(false);
        }
    }
  }

  useEffect(() => {
    if (!authLoading) {
        fetchProfileAndFollowStatus();
    }
  }, [authLoading, fetchProfileAndFollowStatus]);

  if (authLoading || profileLoading || !profile || !currentUser) {
      return (
        <div>
            <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-4 backdrop-blur-sm">
                 <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold">Profile</h1>
            </header>
            <div className="relative h-36 w-full bg-muted sm:h-48">
                <Skeleton className="h-full w-full" />
            </div>
             <div className="p-4">
                <div className="relative -mt-16 sm:-mt-20">
                     <Skeleton className="h-24 w-24 rounded-full border-4 border-background sm:h-32 sm:w-32" />
                </div>
                 <div className="mt-4 space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-full max-w-lg" />
                 </div>
             </div>
        </div>
      );
  }
  
  const userPosts = posts.filter(post => post.authorId === profileId);

  return (
    <div>
       <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/80 p-4 backdrop-blur-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => router.back()}>
                <ArrowLeft />
            </Button>
            <div>
                <h1 className="text-xl font-bold">{profile.displayName}</h1>
                <p className="text-sm text-muted-foreground">{userPosts.length} posts</p>
            </div>
       </header>
      <div className="relative h-36 w-full bg-muted sm:h-48">
        <Image
          src={profile.bannerUrl}
          alt="Profile banner"
          layout="fill"
          objectFit="cover"
          data-ai-hint="stadium lights"
        />
      </div>
      <div className="p-4">
        <div className="relative -mt-16 flex justify-between sm:-mt-20">
          <Avatar className="h-24 w-24 border-4 border-background sm:h-32 sm:w-32">
            <AvatarImage src={profile.photoURL} data-ai-hint="football player" />
            <AvatarFallback>{profile.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
            {isMyProfile ? (
              <Button variant="outline" className="mt-20 sm:mt-24" onClick={() => setIsEditDialogOpen(true)}>
                Edit profile
              </Button>
            ) : (
                <div className="mt-20 sm:mt-24 flex items-center gap-2">
                    <MessageButton otherUserId={profile.uid} />
                    <FollowButton 
                        profileId={profile.uid} 
                        isFollowing={isFollowing}
                        isLoading={followLoading}
                        onToggleFollow={setIsFollowing}
                    />
                </div>
            )}
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
          <p className="text-muted-foreground">@{profile.handle}</p>
        </div>
        {profile.bio && <div className="mt-4"><p>{profile.bio}</p></div>}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.country && (
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>{profile.country}</span>
            </div>
          )}
          {profile.favouriteClub && (
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{profile.favouriteClub}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Joined {profile.joined}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
          <FollowListDialog profileId={profile.uid} type="following">
            <div className="cursor-pointer hover:underline">
              <span className="font-bold">{profile.followingCount}</span>
              <span className="text-muted-foreground"> Following</span>
            </div>
          </FollowListDialog>
          <FollowListDialog profileId={profile.uid} type="followers">
            <div className="cursor-pointer hover:underline">
              <span className="font-bold">{profile.followersCount}</span>
              <span className="text-muted-foreground"> Followers</span>
            </div>
          </FollowListDialog>
        </div>
      </div>
      {isMyProfile && (
        <EditProfileDialog 
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            profile={profile}
            onProfileUpdate={fetchProfileAndFollowStatus}
        />
      )}
      <Tabs defaultValue="posts" className="w-full border-t" onValueChange={handleTabChange}>
        <TabsList className="flex w-full justify-around rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="posts" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Posts</TabsTrigger>
          <TabsTrigger value="replies" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Replies</TabsTrigger>
          <TabsTrigger value="media" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Media</TabsTrigger>
          <TabsTrigger value="likes" className="flex-1 rounded-none py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Likes</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <div className="divide-y divide-border">
            {postsLoading ? (
                <>
                    <PostSkeleton />
                    <PostSkeleton />
                </>
            ) : userPosts.length > 0 ? (
                userPosts.map(post => <Post key={post.id} {...post} />)
            ) : (
                <div className="p-8 text-center text-muted-foreground">No posts yet.</div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="replies">
            <div className="p-8 text-center text-muted-foreground">No replies yet.</div>
        </TabsContent>
        <TabsContent value="media">
            {mediaPostsLoading ? (
                 <div className="grid grid-cols-3 gap-1 p-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square w-full" />
                    ))}
                 </div>
            ) : mediaPosts.length > 0 ? (
                 <div className="grid grid-cols-3 gap-1">
                    {mediaPosts.flatMap(post => post.media?.map((media, index) => (
                        <Link key={`${post.id}-${index}`} href={`/post/${post.id}`} className="relative aspect-square w-full block group">
                            <Image
                                src={media.url}
                                alt={`Media from post ${post.id}`}
                                layout="fill"
                                objectFit="cover"
                                className="transition-opacity group-hover:opacity-80"
                            />
                             {media.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle className="h-8 w-8 text-white drop-shadow-lg" />
                                </div>
                            )}
                        </Link>
                    )) ?? [])}
                </div>
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    <h2 className="text-xl font-bold">No media yet</h2>
                    <p>When {isMyProfile ? "you post" : `@${profile.handle} posts`} with images or videos, they'll appear here.</p>
                </div>
            )}
        </TabsContent>
        <TabsContent value="likes">
             <div className="divide-y divide-border">
                {likedPostsLoading ? (
                    <>
                        <PostSkeleton />
                        <PostSkeleton />
                        <PostSkeleton />
                    </>
                ) : likedPosts.length > 0 ? (
                    likedPosts.map(post => <Post key={post.id} {...post} />)
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <h2 className="text-xl font-bold">No liked posts yet</h2>
                        <p>When {isMyProfile ? "you like" : `@${profile.handle} likes`} posts, they'll appear here.</p>
                    </div>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Edit Profile Dialog Component
function EditProfileDialog({ isOpen, onOpenChange, profile, onProfileUpdate }: { isOpen: boolean, onOpenChange: (open: boolean) => void, profile: ProfileData, onProfileUpdate: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>(profile.photoURL);
    const [bannerPreview, setBannerPreview] = useState<string>(profile.bannerUrl);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    
    const form = useForm({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            displayName: profile.displayName || '',
            bio: profile.bio || '',
            location: profile.location || '',
            country: profile.country || '',
            favouriteClub: profile.favouriteClub || '',
        },
    });
    
    useEffect(() => {
        form.reset({
            displayName: profile.displayName || '',
            bio: profile.bio || '',
            location: profile.location || '',
            country: profile.country || '',
            favouriteClub: profile.favouriteClub || '',
        });
        setAvatarPreview(profile.photoURL);
        setBannerPreview(profile.bannerUrl);
    }, [profile, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (type === 'avatar') {
                setAvatarFile(file);
                setAvatarPreview(previewUrl);
            } else {
                setBannerFile(file);
                setBannerPreview(previewUrl);
            }
        }
    };

    const uploadImage = async (file: File, path: string): Promise<string> => {
        if (!storage) throw new Error("Storage not initialized");
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const handleSyncPosts = async () => {
        if (!user) return;
        setIsSyncing(true);
        try {
            const result = await updateUserPosts(user.uid);
            if (result.success) {
                toast({ title: "Success", description: `${result.updatedCount} posts have been updated with your new profile info!` });
            } else {
                 toast({ variant: 'destructive', title: "Error", description: result.error || "Could not sync posts." });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "An unexpected error occurred while syncing." });
        } finally {
            setIsSyncing(false);
        }
    }

    const onSubmit = async (data: z.infer<typeof profileFormSchema>) => {
        if (!user || !db) return;
        setIsSaving(true);
        try {
            let newAvatarUrl = profile.photoURL;
            if (avatarFile) {
                newAvatarUrl = await uploadImage(avatarFile, `avatars/${user.uid}`);
            }

            let newBannerUrl = profile.bannerUrl;
            if (bannerFile) {
                newBannerUrl = await uploadImage(bannerFile, `banners/${user.uid}`);
            }
            
            await updateProfile(user, {
                displayName: data.displayName,
                photoURL: newAvatarUrl,
            });

            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                displayName: data.displayName,
                photoURL: newAvatarUrl,
                bio: data.bio,
                location: data.location,
                country: data.country,
                favouriteClub: data.favouriteClub,
                bannerUrl: newBannerUrl,
            }, { merge: true });

            // Automatically sync posts after profile update
            await updateUserPosts(user.uid);

            toast({ title: "Success", description: "Profile updated and posts synced!" });
            onProfileUpdate();
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ variant: 'destructive', title: "Error", description: "Failed to update profile." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                     <DialogDescription>
                        Make changes to your profile here. Click save when you're done. Your posts will be automatically synced.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative h-32 w-full bg-muted sm:h-40">
                    <Image src={bannerPreview} alt="Banner preview" layout="fill" objectFit="cover" className="rounded-md" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                         <Button size="icon" variant="ghost" className="text-white hover:bg-black/50" onClick={() => bannerInputRef.current?.click()}>
                            <Camera className="h-6 w-6" />
                         </Button>
                         <input type="file" accept="image/*" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} className="hidden" />
                    </div>
                </div>

                <div className="relative -mt-12 ml-4 h-24 w-24">
                     <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback>{profile.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                         <Button size="icon" variant="ghost" className="text-white hover:bg-black/50" onClick={() => avatarInputRef.current?.click()}>
                            <Camera className="h-6 w-6" />
                         </Button>
                         <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" />
                    </div>
                </div>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <Controller name="displayName" control={form.control} render={({ field }) => <Input placeholder="Name" {...field} />} />
                    {form.formState.errors.displayName && <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>}

                    <Controller name="bio" control={form.control} render={({ field }) => <Textarea placeholder="Bio" {...field} />} />
                    {form.formState.errors.bio && <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>}

                    <Controller name="location" control={form.control} render={({ field }) => <Input placeholder="Location" {...field} />} />
                     {form.formState.errors.location && <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>}

                    <Controller name="country" control={form.control} render={({ field }) => <Input placeholder="Country" {...field} />} />
                    {form.formState.errors.country && <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>}

                    <Controller name="favouriteClub" control={form.control} render={({ field }) => <Input placeholder="Favourite Club" {...field} />} />
                    {form.formState.errors.favouriteClub && <p className="text-sm text-destructive">{form.formState.errors.favouriteClub.message}</p>}

                    <div className="border-t pt-4">
                        <Button type="button" variant="secondary" onClick={handleSyncPosts} disabled={isSyncing}>
                            {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                             Sync My Posts
                        </Button>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
