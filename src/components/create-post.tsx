'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function CreatePost() {
  return (
    <Card className="rounded-none border-x-0 border-t-0 sm:rounded-xl sm:border">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <Avatar>
            <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's happening in the football world?"
              className="w-full resize-none border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={3}
            />
            <div className="flex justify-end">
              <Button>Chatter</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
