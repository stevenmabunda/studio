
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreatePost, type Media } from './create-post';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { PostType } from '@/lib/data';

export function FloatingCreatePostButton({ onPost }: { onPost: (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null }) => Promise<void> }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePost = async (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null }) => {
    await onPost(data);
    setIsDialogOpen(false); // Close dialog on successful post
  };
  
  return (
     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
            <Button size="icon" className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40">
                <Plus className="h-7 w-7" />
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create a new post</DialogTitle>
            </DialogHeader>
            <div className='-mx-6'>
                <CreatePost onPost={handlePost} />
            </div>
        </DialogContent>
    </Dialog>
  );
}
