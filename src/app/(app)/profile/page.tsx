
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Post } from "@/components/post";
import Image from "next/image";
import { MapPin, Link as LinkIcon, CalendarDays, Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePosts } from "@/contexts/post-context";
import { PostSkeleton } from "@/components/post-skeleton";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db, storage } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type UserProfile = {
    bio: string;
    location: string;
    website: string;
    bannerUrl: string;
    photoURL: string;
    displayName: string;
    handle: string;
    joined: string;
};

const profileFormSchema = z.object({
    displayName: z.string().min(2, "Name must be at least 2 characters."),
    bio: z.string().max(160, "Bio must not exceed 160 characters.").optional(),
    location: z.string().max(30, "Location must not exceed 30 characters.").optional(),
    website: z.string().url("Please enter a valid URL.").or(z.literal("")).optional(),
});


export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { posts, loading: postsLoading } = usePosts();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user || !db) return;
    setProfileLoading(true);
    try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setProfile({
                displayName: data.displayName || user.displayName || 'User',
                photoURL: data.photoURL || user.photoURL || 'https://placehold.co/128x128.png',
                handle: data.handle || user.email?.split('@')[0] || 'user',
                joined: user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently',
                bio: data.bio || '',
                location: data.location || '',
                website: data.website || '',
                bannerUrl: data.bannerUrl || 'https://placehold.co/1200x400.png',
            });
        } else {
            // If profile doesn't exist, create it and then set state.
            // This can happen for users who signed up before the 'users' collection was implemented.
            const newProfileData = {
                uid: user.uid,
                displayName: user.displayName || 'User',
                handle: user.email?.split('@')[0] || 'user',
                photoURL: user.photoURL || 'https://placehold.co/128x128.png',
                email: user.email,
                joined: user.metadata.creationTime || new Date().toISOString(),
                bio: 'Passionate football fan.',
                location: '',
                website: '',
                bannerUrl: 'https://placehold.co/1200x400.png',
            };
            await setDoc(userDocRef, newProfileData, { merge: true });
            
            setProfile({
                ...newProfileData,
                joined: user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently',
            });
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not fetch profile." });
    } finally {
        setProfileLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) {
        fetchProfile();
    }
  }, [authLoading, fetchProfile]);

  if (authLoading || profileLoading || !profile) {
      // You can return a more detailed skeleton here
      return <PostSkeleton />;
  }
  
  const userPosts = posts.filter(post => post.authorHandle === profile.handle);

  return (
    <div>
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
          <Button variant="outline" className="mt-20 sm:mt-24" onClick={() => setIsEditDialogOpen(true)}>
            Edit profile
          </Button>
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
          {profile.website && (
            <div className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {profile.website.replace(/https?:\/\//, '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Joined {profile.joined}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <span className="font-bold">142</span>
            <span className="text-muted-foreground"> Following</span>
          </div>
          <div>
            <span className="font-bold">1,205</span>
            <span className="text-muted-foreground"> Followers</span>
          </div>
        </div>
      </div>
      <EditProfileDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        profile={profile}
        onProfileUpdate={fetchProfile}
      />
      <Tabs defaultValue="posts" className="w-full border-t">
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
            <div className="p-8 text-center text-muted-foreground">No media yet.</div>
        </TabsContent>
        <TabsContent value="likes">
            <div className="p-8 text-center text-muted-foreground">No liked posts yet.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Edit Profile Dialog Component
function EditProfileDialog({ isOpen, onOpenChange, profile, onProfileUpdate }: { isOpen: boolean, onOpenChange: (open: boolean) => void, profile: UserProfile, onProfileUpdate: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

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
            website: profile.website || '',
        },
    });
    
    useEffect(() => {
        form.reset({
            displayName: profile.displayName || '',
            bio: profile.bio || '',
            location: profile.location || '',
            website: profile.website || '',
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
                website: data.website,
                bannerUrl: newBannerUrl,
            }, { merge: true });

            toast({ title: "Success", description: "Profile updated successfully!" });
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

                    <Controller name="website" control={form.control} render={({ field }) => <Input placeholder="Website" {...field} />} />
                     {form.formState.errors.website && <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>}

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
