
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { updateTribe, type Tribe } from '@/app/(app)/tribes/actions';
import { Loader2, Camera } from 'lucide-react';
import Image from 'next/image';

interface EditTribeDialogProps {
  children: React.ReactNode;
  tribe: Tribe;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTribeUpdated: () => void;
}

export function EditTribeDialog({
  children,
  tribe,
  isOpen,
  onOpenChange,
  onTribeUpdated,
}: EditTribeDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>(tribe.bannerUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setBannerPreview(tribe.bannerUrl);
    if (formRef.current) {
        const nameInput = formRef.current.elements.namedItem('name') as HTMLInputElement;
        const descriptionInput = formRef.current.elements.namedItem('description') as HTMLTextAreaElement;
        if(nameInput) nameInput.value = tribe.name;
        if(descriptionInput) descriptionInput.value = tribe.description;
    }
  }, [tribe, isOpen]);

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

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }

    try {
      const result = await updateTribe(tribe.id, user.uid, formData);
      if (result.success) {
        toast({ description: 'Tribe updated successfully!' });
        onTribeUpdated();
        onOpenChange(false);
      } else {
        toast({ variant: 'destructive', description: result.error || 'Failed to update tribe.' });
      }
    } catch (error) {
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
          <DialogTitle>Edit Tribe</DialogTitle>
           <DialogDescription>
            Make changes to your tribe's profile. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tribe Banner</Label>
            <div
              className="relative h-32 w-full bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80"
              onClick={() => fileInputRef.current?.click()}
            >
              {bannerPreview ? (
                <Image src={bannerPreview} alt="Tribe banner preview" layout="fill" objectFit="cover" className="rounded-md" />
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
            <Input id="name" name="name" defaultValue={tribe.name} required minLength={3} maxLength={50} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">About</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={tribe.description}
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
