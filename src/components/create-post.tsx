'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, X, Film } from "lucide-react";
import React, { useState, useRef } from "react";
import Image from "next/image";

export type Media = {
  url: string;
  type: 'image' | 'video';
};

export function CreatePost({ onPost }: { onPost: (data: { text: string; media: Media | null }) => void }) {
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        setMedia({
            url: reader.result as string,
            type: fileType,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const removeMedia = () => {
    setMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handlePost = () => {
    if (!isPostable) return;
    
    onPost({ text, media });
    
    setText("");
    setMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isPostable = text.trim().length > 0 || media;

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
          {media && (
            <div className="relative">
              {media.type === 'image' ? (
                <Image
                  src={media.url}
                  alt="Preview"
                  width={500}
                  height={300}
                  className="rounded-2xl max-h-[400px] w-auto object-cover"
                />
              ) : (
                <video
                  src={media.url}
                  controls
                  className="rounded-2xl max-h-[400px] w-full"
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-white"
                onClick={removeMedia}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex justify-between items-center">
            <div>
              <input
                type="file"
                accept="image/*,video/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="ghost" size="icon" onClick={handleIconClick}>
                <ImageIcon className="h-5 w-5 text-primary" />
              </Button>
               <Button variant="ghost" size="icon" onClick={handleIconClick}>
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
