
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, X, Film, ListOrdered, Smile, MapPin, Loader2, Trash2 } from "lucide-react";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "./ui/input";
import type { PostType } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export type Media = {
  url: string;
  type: 'image' | 'video';
};

const EMOJIS = [
    '😀', '😂', '😍', '🤔', '😭', '🙏', '❤️', '🔥', '👍', '⚽️', '🥅', '🏆', '🎉', '👏', '🚀', '💯'
];

export function CreatePost({ onPost }: { onPost: (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null }) => Promise<void> }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [posting, setPosting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [showPoll, setShowPoll] = useState(false);
  const [pollChoices, setPollChoices] = useState<string[]>(['', '']);
  const [location, setLocation] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const fileType = files[0].type.startsWith('image/') ? 'image' : 'video';

    if (fileType === 'video') {
        if (files.length > 1) {
            toast({ variant: 'destructive', description: "You can only upload one video per post." });
            return;
        }
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setMedia([{ url: reader.result as string, type: 'video' }]);
        };
        reader.readAsDataURL(file);
    } else { // Images
        if (media.length + files.length > 4) {
            toast({ variant: 'destructive', description: "You can only upload up to 4 images." });
            return;
        }
        
        const newMediaPromises = files.map(file => {
            return new Promise<Media>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({ url: reader.result as string, type: 'image' });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newMediaPromises).then(newMedia => {
            setMedia(prevMedia => [...prevMedia, ...newMedia]);
        });
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  }

  const removeMedia = (index: number) => {
    setMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  const handlePost = async () => {
    if (!isPostable || posting) return;
    setPosting(true);
    
    let pollData: PostType['poll'] | undefined = undefined;
    if (showPoll) {
        const validChoices = pollChoices.map(c => c.trim()).filter(Boolean);
        if (validChoices.length < 2) {
            toast({ variant: 'destructive', description: "A poll must have at least 2 choices." });
            setPosting(false);
            return;
        }
        pollData = {
            choices: validChoices.map(choiceText => ({ text: choiceText, votes: 0 }))
        };
    }

    try {
        await onPost({ text, media, poll: pollData, location });
        setText("");
        setMedia([]);
        setShowPoll(false);
        setPollChoices(['', '']);
        setLocation(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (error) {
        console.error("Failed to create post:", error);
        toast({ variant: 'destructive', description: "Failed to create post. Please try again." });
    } finally {
        setPosting(false);
    }
  };
  
  const handlePollChoiceChange = (index: number, value: string) => {
    const newChoices = [...pollChoices];
    newChoices[index] = value;
    setPollChoices(newChoices);
  };

  const addPollChoice = () => {
    if (pollChoices.length < 3) {
      setPollChoices([...pollChoices, '']);
    }
  };

  const removePollChoice = (index: number) => {
    if (pollChoices.length > 2) {
      setPollChoices(pollChoices.filter((_, i) => i !== index));
    }
  };

  const togglePoll = () => {
    if (!showPoll) {
        setMedia([]);
    }
    setShowPoll(!showPoll);
  };

  const handleLocationClick = () => {
    if (location) {
        setLocation(null);
        toast({ description: "Location removed." });
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const locationString = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
                setLocation(locationString);
                toast({ description: "Location added!" });
            },
            () => {
                toast({
                    variant: "destructive",
                    description: "Could not get location. Please enable browser permissions.",
                });
            }
        );
    } else {
        toast({
            variant: "destructive",
            description: "Geolocation is not supported by your browser.",
        });
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setText(prevText => prevText + emoji);
  };

  const isPostable = text.trim().length > 0 || media.length > 0 || (showPoll && pollChoices.some(c => c.trim()));
  const hasVideo = media.length > 0 && media[0].type === 'video';
  const hasImages = media.length > 0 && media[0].type === 'image';
  const maxImagesReached = media.length >= 4;

  const singleImage = hasImages && media.length === 1;

  const gridClasses = {
    2: 'grid-cols-2 grid-rows-1',
    3: 'grid-cols-2 grid-rows-2',
    4: 'grid-cols-2 grid-rows-2',
  }[media.length] || '';

  return (
    <div className="p-3 md:p-4 border-b">
      <div className="flex space-x-3 md:space-x-4">
        <Avatar>
          <AvatarImage src={user?.photoURL || "https://placehold.co/40x40.png"} alt={user?.displayName || "User"} data-ai-hint="user avatar" />
          <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="What is happening?!"
            className="w-full resize-none border-0 bg-transparent px-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {showPoll && (
            <div className="space-y-2 border p-4 rounded-lg">
                <div className="space-y-3">
                    {pollChoices.map((choice, index) => (
                        <div key={index} className="flex items-center gap-2">
                             <Input 
                                placeholder={`Choice ${index + 1}`} 
                                value={choice} 
                                onChange={(e) => handlePollChoiceChange(index, e.target.value)}
                                maxLength={25}
                             />
                             {index > 1 && (
                                <Button variant="ghost" size="icon" onClick={() => removePollChoice(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                             )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-2">
                    <Button variant="outline" size="sm" onClick={addPollChoice} disabled={pollChoices.length >= 3}>Add choice</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowPoll(false)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove poll
                    </Button>
                </div>
            </div>
          )}

          {media.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden border max-h-[50vh] overflow-y-auto">
                {hasVideo ? (
                    <div className="relative">
                        <video src={media[0].url} controls className="w-full h-auto max-h-96" />
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-white" onClick={() => removeMedia(0)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : singleImage ? (
                    <div className="relative">
                        <Image src={media[0].url} alt="Preview 1" width={500} height={500} className="w-full h-auto object-contain bg-black" />
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-white" onClick={() => removeMedia(0)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className={cn("grid aspect-video gap-0.5", gridClasses)}>
                        {media.map((item, index) => (
                            <div key={index} className={cn("relative", media.length === 3 && index === 0 && 'row-span-2')}>
                                <Image src={item.url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-white" onClick={() => removeMedia(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{location}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto -mr-2" onClick={() => setLocation(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex justify-between items-center pt-1">
            <div>
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                disabled={posting}
              />
               <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={posting}
              />
              <Button variant="ghost" size="icon" onClick={handleImageClick} disabled={showPoll || hasVideo || maxImagesReached || posting}>
                <ImageIcon className="h-5 w-5 text-primary" />
              </Button>
               <Button variant="ghost" size="icon" onClick={handleVideoClick} disabled={showPoll || hasImages || posting}>
                <Film className="h-5 w-5 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" onClick={togglePoll} disabled={posting}>
                <ListOrdered className="h-5 w-5 text-primary" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={posting}>
                        <Smile className="h-5 w-5 text-primary" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 border-none bg-background/80 backdrop-blur-sm shadow-lg">
                    <div className="grid grid-cols-6 gap-1">
                        {EMOJIS.map((emoji) => (
                            <Button
                                key={emoji}
                                variant="ghost"
                                className="text-xl rounded-full p-2 hover:bg-accent"
                                onClick={() => handleEmojiClick(emoji)}
                            >
                                {emoji}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" onClick={handleLocationClick} disabled={posting}>
                <MapPin className={cn("h-5 w-5 text-primary", location && "fill-current text-primary")} />
              </Button>
            </div>
            <Button disabled={!isPostable || posting} onClick={handlePost}>
                {posting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {posting ? 'Posting...' : 'Kick-It!'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
