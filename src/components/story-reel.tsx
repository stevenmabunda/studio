'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stories, type StoryType } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { X } from "lucide-react";

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
            src="https://placehold.co/540x960.png"
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
                    <AvatarImage src={story.avatar} data-ai-hint={story.hint} />
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


export function StoryReel() {
    const [openStory, setOpenStory] = useState<StoryType | null>(null);

    return (
        <div className="p-4 border-b">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {stories.map((story) => (
            <Dialog key={story.id} open={openStory?.id === story.id} onOpenChange={(isOpen) => { if(!isOpen) setOpenStory(null)}}>
                <DialogTrigger asChild onClick={() => setOpenStory(story)}>
                    <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer">
                        <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                        <div className="p-0.5 bg-background rounded-full">
                            <Avatar className="w-16 h-16">
                            <AvatarImage src={story.avatar} data-ai-hint={story.hint} />
                            <AvatarFallback>{story.username.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                        </div>
                        </div>
                        <p className="text-xs font-medium w-16 truncate text-center">{story.username}</p>
                    </div>
                </DialogTrigger>
                <DialogContent className="p-0 border-0 bg-transparent max-w-full h-full sm:max-w-md sm:h-[90vh] sm:rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 !ring-0 !ring-offset-0">
                    {/* Render the viewer only if this story is the one that's open */}
                    {openStory?.id === story.id && (
                        <StoryViewer story={openStory} onComplete={() => setOpenStory(null)} />
                    )}
                </DialogContent>
            </Dialog>
            ))}
        </div>
        </div>
    );
}
