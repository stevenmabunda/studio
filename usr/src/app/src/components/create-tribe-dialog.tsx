
'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createTribe } from '@/app/(app)/tribes/actions';
import { Loader2, Camera } from 'lucide-react';
import Image from 'next/image';

interface CreateTribeDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTribeCreated?: () => void;
}

export function CreateTribeDialog({
  children,
  isOpen,
  onOpenChange,
  onTribeCreated,
}: CreateTribeDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', description: 'You must be logged in.' });
      return;
    }
    if (!bannerFile) {
      toast({ variant: 'destructive', description: 'Please select a banner image for the tribe.' });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.append('banner', bannerFile);

    try {
      const result = await createTribe(user.uid, formData);
      if (result.success) {
        toast({ description: 'Tribe created successfully!' });
        onOpenChange(false);
        onTribeCreated?.(); // Callback to refresh the list
        // Reset form state
        setBannerFile(null);
        setBannerPreview(null);
        formRef.current?.reset();
      } else {
        toast({ variant: 'destructive', description: result.error || 'Failed to create tribe.' });
      }
    } catch (error) {
      console.error("Dialog submission error:", error)
      toast({ variant: 'destructive', description: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Tribe</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tribe Picture</Label>
            <div
              className="relative h-32 w-full bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80"
              onClick={() => fileInputRef.current?.click()}
            >
              {bannerPreview ? (
                <div className="relative w-full h-full">
                    <Image src={bannerPreview} alt="Tribe preview" layout="fill" objectFit="cover" className="rounded-md" />
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Camera className="h-8 w-8 mx-auto" />
                  <p>Upload Banner</p>
                </div>
              )}
               <input
                type="file"
                name="banner"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Tribe Name</Label>
            <Input id="name" name="name" placeholder="e.g., The Kop End" required minLength={3} maxLength={50} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">About</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What is your tribe about?"
              required
              minLength={10}
              maxLength={280}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tribe
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
