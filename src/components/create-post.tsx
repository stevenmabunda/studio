
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, X, Film, ListOrdered, Smile, MapPin, Loader2, Trash2, Link2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "./ui/input";
import type { PostType } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { extractLinkMetadata, type ExtractLinkMetadataOutput } from "@/ai/flows/extract-link-metadata";
import { Skeleton } from "./ui/skeleton";

export type Media = {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
};

const EMOJIS = [
    '😀', '😂', '😍', '🤔', '😭', '🙏', '❤️', '🔥', '👍', '⚽️', '🥅', '🏆', '🎉', '👏', '🚀', '💯'
];

function LinkPreviewSkeleton() {
    return (
        <div className="mt-3 rounded-2xl border flex flex-col md:flex-row gap-0 md:gap-4 overflow-hidden">
            <Skeleton className="h-32 w-full md:w-32 flex-shrink-0" />
            <div className="p-4 flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    )
}

export function CreatePost({ onPost, tribeId, communityId }: { onPost: (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null, tribeId?: string, communityId?: string, linkPreview?: ExtractLinkMetadataOutput | null }) => Promise<void>, tribeId?: string, communityId?: string }) {
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

  const [linkPreview, setLinkPreview] = useState<ExtractLinkMetadataOutput | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);

  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = text.match(urlRegex);
    const newUrl = match ? match[0] : null;

    if (newUrl && newUrl !== detectedUrl) {
      setDetectedUrl(newUrl);
      setIsFetchingPreview(true);
      setLinkPreview(null);
      setMedia([]); // Can't have media and a link preview
      setShowPoll(false); // Can't have poll and link preview

      extractLinkMetadata({ url: newUrl })
        .then(data => {
          if (data) {
            setLinkPreview(data);
          } else {
            setDetectedUrl(null); // Reset if metadata fails
          }
        })
        .catch(() => setDetectedUrl(null)) // Reset on error
        .finally(() => setIsFetchingPreview(false));

    } else if (!newUrl) {
      setDetectedUrl(null);
      setLinkPreview(null);
    }
  }, [text, detectedUrl]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLinkPreview(null);
    setDetectedUrl(null);
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const fileType = files[0].type.startsWith('image/') ? 'image' : 'video';

    // Clear existing media before adding new ones
    media.forEach(m => URL.revokeObjectURL(m.previewUrl));

    if (fileType === 'video') {
        if (files.length > 1) {
            toast({ variant: 'destructive', description: "You can only upload one video per post." });
            return;
        }
        const file = files[0];
        setMedia([{ file, previewUrl: URL.createObjectURL(file), type: 'video' }]);
    } else { // Images
        if (files.length > 4) {
            toast({ variant: 'destructive', description: "You can only upload up to 4 images." });
            return;
        }
        
        const newMedia = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            type: 'image' as const
        }));
        
        setMedia(newMedia);
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  }

  const removeMedia = (index: number) => {
    setMedia(prevMedia => {
        const newMedia = [...prevMedia];
        const removed = newMedia.splice(index, 1);
        if (removed[0]) {
            URL.revokeObjectURL(removed[0].previewUrl);
        }
        return newMedia;
    });
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
        await onPost({ text, media, poll: pollData, location, tribeId, communityId, linkPreview });
        
        // Clean up object URLs after successful post
        media.forEach(m => URL.revokeObjectURL(m.previewUrl));

        setText("");
        setMedia([]);
        setShowPoll(false);
        setPollChoices(['', '']);
        setLocation(null);
        setLinkPreview(null);
        setDetectedUrl(null);
        setIsFetchingPreview(false);
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (error) {
        console.error("Failed to create post:", error);
        toast({ variant: 'destructive', description: "Failed to create post. Please try again." });
    } finally {
        posting && setPosting(false);
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
        media.forEach(m => URL.revokeObjectURL(m.previewUrl));
        setMedia([]);
        setLinkPreview(null);
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

  const isPostable = text.trim().length > 0 || media.length > 0 || (showPoll && pollChoices.some(c => c.trim())) || linkPreview;
  const hasVideo = media.length > 0 && media[0].type === 'video';
  const hasImages = media.length > 0 && media[0].type === 'image';
  const maxImagesReached = media.length >= 4;
  const hasContent = showPoll || hasVideo || hasImages || linkPreview;

  const singleImage = hasImages && media.length === 1;

  const gridClasses = {
    2: 'grid-cols-2 grid-rows-1',
    3: 'grid-cols-2 grid-rows-2',
    4: 'grid-cols-2 grid-rows-2',
  }[media.length] || '';

  return (
    <div className="p-3 md:p-4 border-b">
      <div className="flex space-x-3 md:space-x-4">
        <div className="hidden md:block">
            <Avatar>
            <AvatarImage src={user?.photoURL || "https://placehold.co/40x40.png"} alt={user?.displayName || "User"} data-ai-hint="user avatar" />
            <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
        </div>
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="What is happening?! Paste a link to see the magic."
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

          {isFetchingPreview && <LinkPreviewSkeleton />}

          {linkPreview && (
              <div className="relative mt-3 rounded-2xl border overflow-hidden">
                {linkPreview.imageUrl && (
                    <Image src={linkPreview.imageUrl} alt={linkPreview.title} width={500} height={250} className="w-full h-auto max-h-64 object-cover" />
                )}
                <div className="p-4">
                    <p className="text-xs text-muted-foreground uppercase">{linkPreview.domain}</p>
                    <h3 className="font-bold line-clamp-2">{linkPreview.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mt-1">{linkPreview.description}</p>
                </div>
                 <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-white" onClick={() => { setLinkPreview(null); setDetectedUrl(null); }}>
                    <X className="h-4 w-4" />
                </Button>
              </div>
          )}

          {media.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden border max-h-[50vh] overflow-y-auto">
                {hasVideo ? (
                    <div className="relative">
                        <video src={media[0].previewUrl} controls className="w-full h-auto max-h-96 object-contain" />
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-white" onClick={() => removeMedia(0)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : singleImage ? (
                    <div className="relative">
                        <Image src={media[0].previewUrl} alt="Preview 1" width={500} height={500} className="w-full h-auto object-contain bg-black" />
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-white" onClick={() => removeMedia(0)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className={cn("grid aspect-video gap-0.5", gridClasses)}>
                        {media.map((item, index) => (
                            <div key={index} className={cn("relative", media.length === 3 && index === 0 && 'row-span-2')}>
                                <Image src={item.previewUrl} alt={`Preview ${index + 1}`} fill className="object-cover" />
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
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center -ml-2">
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
              <Button variant="ghost" size="icon" onClick={handleImageClick} disabled={!!hasContent || posting}>
                <ImageIcon className="h-5 w-5 text-primary" />
              </Button>
               <Button variant="ghost" size="icon" onClick={handleVideoClick} disabled={!!hasContent || posting}>
                <Film className="h-5 w-5 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" onClick={togglePoll} disabled={!!hasContent || posting}>
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
            <Button size="sm" className="rounded-full" disabled={!isPostable || posting} onClick={handlePost}>
                {posting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {posting ? 'Posting...' : 'Kick-It!'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
