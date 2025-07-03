
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { StoryType } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { X, PlusCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { addStory } from "@/app/(app)/stories/actions";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

// A component to render the story view inside the dialog
function StoryViewer({ story, onComplete }: { story: StoryType; onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Using a timeout to ensure this runs only on the client after mount, preventing hydration issues.
    const startTimer = setTimeout(() => {
        const timer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(timer);
              onComplete();
              return 100;
            }
            return prev + 2; // ~5 seconds story duration (100 / 2 = 50 intervals * 100ms = 5000ms)
          });
        }, 100);
    
        // Cleanup function for the interval
        return () => clearInterval(timer);
    }, 10); // Small delay

    // Cleanup for the timeout
    return () => clearTimeout(startTimer);
  }, [onComplete]);

  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
        <Image
            src={story.storyImageUrl}
            alt={`Story by ${story.username}`}
            layout="fill"
            objectFit="cover"
            className="-z-10"
            data-ai-hint="football stadium"
        />
        <div className="absolute top-0 left-0 right-0 p-4">
             <Progress value={progress} className="h-1" />
             <div className="flex items-center gap-2 mt-2">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={story.avatar} />
                    <AvatarFallback>{story.username.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="font-bold text-white text-sm">{story.username}</span>
             </div>
        </div>
        <DialogClose className="absolute right-4 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50">
            <X className="h-6 w-6 text-white" />
            <span className="sr-only">Close</span>
        </DialogClose>
    </div>
  );
}

function AddStoryDialog({ onStoryAdded }: { onStoryAdded: (newStory: StoryType) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handlePostStory = async () => {
    if (!file || !user) return;
    setIsPosting(true);

    try {
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

        const newStory = await addStory(base64Data);
        onStoryAdded(newStory);
        toast({ description: "Your story has been posted!" });
        setFile(null);
        setPreview(null);
        setIsOpen(false);
    } catch (error) {
        console.error("Error posting story:", error);
        toast({ variant: "destructive", description: "Failed to post story." });
    } finally {
        setIsPosting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            setFile(null);
            setPreview(null);
        }
    }}>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer">
          <div className="relative">
            <Avatar className="w-14 h-14 md:w-16 md:h-16">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <PlusCircle className="absolute bottom-0 right-0 h-5 w-5 md:h-6 md:w-6 bg-primary text-primary-foreground rounded-full border-2 border-background" />
          </div>
          <p className="text-xs font-medium w-14 md:w-16 truncate text-center">Add Story</p>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to your story</DialogTitle>
        </DialogHeader>
        <div className="py-4 overflow-y-auto max-h-[60vh]">
          {preview ? (
            <div className="relative aspect-[9/16] w-full rounded-lg overflow-hidden">
              <Image src={preview} alt="Story preview" layout="fill" objectFit="cover" />
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white" onClick={() => { setFile(null); setPreview(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center aspect-[9/16] w-full rounded-lg border-2 border-dashed border-muted-foreground/50 cursor-pointer hover:bg-accent"
              onClick={() => inputRef.current?.click()}
            >
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Upload a photo</p>
              <Input type="file" accept="image/*" ref={inputRef} onChange={handleFileChange} className="hidden" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handlePostStory} disabled={!file || isPosting} className="w-full">
            {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StoryReel() {
    const [openStory, setOpenStory] = useState<StoryType | null>(null);
    const [stories, setStories] = useState<StoryType[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStories = async () => {
            if (!db) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const storiesRef = collection(db, 'stories');
                const q = query(
                    storiesRef, 
                    where("createdAt", ">=", Timestamp.fromDate(twentyFourHoursAgo)), 
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                const fetchedStories = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as StoryType[];

                // Group stories by user, showing only the latest one per user in the reel
                const latestStoriesByUser = new Map<string, StoryType>();
                fetchedStories.forEach(story => {
                    if (!latestStoriesByUser.has(story.userId)) {
                        latestStoriesByUser.set(story.userId, story);
                    }
                });

                setStories(Array.from(latestStoriesByUser.values()));

            } catch (error) {
                console.error("Error fetching stories:", error);
                toast({
                    variant: 'destructive',
                    title: 'Could not load stories',
                    description: 'There was a problem fetching recent stories. Please try again later.',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, [toast]);

    const handleStoryAdded = (newStory: StoryType) => {
      // Optimistically add the new story to the start of the list
      setStories(prevStories => {
          // Remove any existing story from the same user to avoid duplicates in the reel
          const filtered = prevStories.filter(s => s.userId !== newStory.userId);
          return [newStory, ...filtered];
      });
    };

    return (
        <div className="p-4 border-b">
        <div className="flex items-center justify-center gap-4 overflow-x-auto no-scrollbar">
            <AddStoryDialog onStoryAdded={handleStoryAdded} />

            {loading ? (
                 Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className={cn("flex flex-col items-center gap-2 flex-shrink-0", index >= 3 && "hidden md:flex")}>
                         <Skeleton className="w-14 h-14 md:w-16 md:h-16 rounded-full" />
                         <Skeleton className="h-3 w-12" />
                    </div>
                ))
            ) : (
                stories.slice(0, 5).map((story, index) => (
                <Dialog key={story.id} open={openStory?.id === story.id} onOpenChange={(isOpen) => { if(!isOpen) setOpenStory(null)}}>
                    <DialogTrigger asChild onClick={() => setOpenStory(story)}>
                        <div className={cn(
                            "flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer",
                            index >= 3 && "hidden md:flex"
                        )}>
                            <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-primary to-purple-500">
                            <div className="p-0.5 bg-background rounded-full">
                                <Avatar className="w-14 h-14 md:w-16 md:h-16">
                                <AvatarImage src={story.avatar} />
                                <AvatarFallback>{story.username.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                            </div>
                            </div>
                            <p className="text-xs font-medium w-14 md:w-16 truncate text-center">{story.username}</p>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="p-0 border-0 bg-transparent max-w-full h-full sm:max-w-md sm:h-[90vh] sm:rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 !ring-0 !ring-offset-0">
                        {/* Render the viewer only if this story is the one that's open */}
                        {openStory?.id === story.id && (
                            <StoryViewer story={openStory} onComplete={() => setOpenStory(null)} />
                        )}
                    </DialogContent>
                </Dialog>
                ))
            )}
        </div>
        </div>
    );
}
