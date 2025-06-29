'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stories } from "@/lib/data";

export function StoryReel() {
  return (
    <div className="p-4 border-b">
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer">
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
        ))}
      </div>
    </div>
  );
}
