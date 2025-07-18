
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Image as ImageIcon, Film, X, Loader2, Smile } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export type ReplyMedia = {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
};

const EMOJIS = [
    '😀', '😂', '😍', '🤔', '😭', '🙏', '❤️', '🔥', '👍', '⚽️', '🥅', '🏆', '🎉', '👏', '🚀', '💯'
];

export function CreateComment({ onComment }: { onComment: (data: { text: string; media: ReplyMedia[] }) => Promise<void> }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [media, setMedia] = useState<ReplyMedia[]>([]);
  const [posting, setPosting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const fileType = files[0].type.startsWith('image/') ? 'image' : 'video';
    const isVideo = fileType === 'video';

    if (media.length > 0) {
      toast({ variant: 'destructive', description: "You can only attach one media item to a reply." });
      return;
    }
    
    const newMedia = files.slice(0, 1).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: fileType as 'image' | 'video',
    }));

    setMedia(newMedia);
  };
  
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

  const handleComment = async () => {
    if (!isPostable || posting) return;
    setPosting(true);

    try {
      await onComment({ text, media });
      media.forEach(m => URL.revokeObjectURL(m.previewUrl));
      setText("");
      setMedia([]);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setText(prevText => prevText + emoji);
  };

  const isPostable = text.trim().length > 0 || media.length > 0;
  const hasMedia = media.length > 0;
  const hasVideo = hasMedia && media[0].type === 'video';

  return (
    <div className="p-3 md:p-4 border-t">
      <div className="flex space-x-3 md:space-x-4">
        <Avatar>
          <AvatarImage src={user?.photoURL || "https://placehold.co/40x40.png"} alt={user?.displayName || "User"} data-ai-hint="user avatar" />
          <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea
            placeholder="Post your reply"
            className="w-full resize-none border-0 bg-transparent px-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {hasMedia && (
             <div className="mt-3 rounded-2xl overflow-hidden border max-h-[300px] overflow-y-auto">
                <div className="relative">
                    {hasVideo ? (
                        <video src={media[0].previewUrl} controls className="w-full h-auto max-h-96 object-contain" />
                    ) : (
                         <Image src={media[0].previewUrl} alt="Preview 1" width={500} height={500} className="w-full h-auto object-contain bg-black" />
                    )}
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-white" onClick={() => removeMedia(0)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          )}

          <div className="flex justify-between items-center">
             <div className="flex items-center -ml-2">
                <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={posting || hasMedia}
                />
                <input
                    type="file"
                    accept="video/*"
                    ref={videoInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={posting || hasMedia}
                />
                <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} disabled={posting || hasMedia}>
                    <ImageIcon className="h-5 w-5 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()} disabled={posting || hasMedia}>
                    <Film className="h-5 w-5 text-primary" />
                </Button>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={posting}>
                            <Smile className="h-5 w-5 text-primary" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 border-none bg-background/80 backdrop-blur-sm shadow-lg">
                        <div className="grid grid-cols-8 gap-1">
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
            </div>
            <Button disabled={!isPostable || posting} onClick={handleComment}>
                {posting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
