'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";

export function CreateComment({ onComment }: { onComment: (text: string) => void }) {
  const [text, setText] = useState("");

  const handleComment = () => {
    if (!text.trim()) return;
    onComment(text);
    setText("");
  };

  return (
    <div className="p-4 border-t">
      <div className="flex space-x-4">
        <Avatar>
          <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea
            placeholder="Post your reply"
            className="w-full resize-none border-0 bg-transparent px-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end items-center">
            <Button disabled={!text.trim()} onClick={handleComment}>Reply</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
