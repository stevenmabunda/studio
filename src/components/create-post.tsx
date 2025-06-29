'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, X, Film } from "lucide-react";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type Media = {
  url: string;
  type: 'image' | 'video';
};

export function CreatePost({ onPost }: { onPost: (data: { text: string; media: Media[] }) => void }) {
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handlePost = () => {
    if (!isPostable) return;
    
    onPost({ text, media });
    
    setText("");
    setMedia([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const isPostable = text.trim().length > 0 || media.length > 0;
  const hasVideo = media.length > 0 && media[0].type === 'video';
  const hasImages = media.length > 0 && media[0].type === 'image';
  const maxImagesReached = media.length >= 4;


  const gridClasses = {
    1: 'grid-cols-1 grid-rows-1',
    2: 'grid-cols-2 grid-rows-1',
    3: 'grid-cols-2 grid-rows-2',
    4: 'grid-cols-2 grid-rows-2',
  }[media.length] || '';

  return (
    <div className="p-4 border-b">
      <div className="flex space-x-4">
        <Avatar>
          <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea
            placeholder="What is happening?!"
            className="w-full resize-none border-0 bg-transparent px-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {media.length > 0 && (
            <div className={cn("grid gap-2", gridClasses)}>
              {media.map((item, index) => (
                <div key={index} className={cn("relative", media.length === 3 && index === 0 && 'row-span-2')}>
                  {item.type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={`Preview ${index + 1}`}
                      width={500}
                      height={500}
                      className="rounded-2xl w-full h-full object-cover aspect-square"
                    />
                  ) : (
                    <video
                      src={item.url}
                      controls
                      className="rounded-2xl max-h-[400px] w-full"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-white"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center">
            <div>
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
               <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="ghost" size="icon" onClick={handleImageClick} disabled={hasVideo || maxImagesReached}>
                <ImageIcon className="h-5 w-5 text-primary" />
              </Button>
               <Button variant="ghost" size="icon" onClick={handleVideoClick} disabled={hasImages}>
                <Film className="h-5 w-5 text-primary" />
              </Button>
            </div>
            <Button disabled={!isPostable} onClick={handlePost}>Chatter</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
