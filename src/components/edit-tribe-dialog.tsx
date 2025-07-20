
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { updateTribe, deleteTribe, type Tribe } from '@/app/(app)/tribes/actions';
import { Loader2, Camera, Trash2 } from 'lucide-react';
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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDeleteTribe = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const result = await deleteTribe(tribe.id, user.uid);
      if (result.success) {
        toast({ description: "Tribe deleted successfully." });
        onOpenChange(false);
        router.push('/tribes'); // Redirect to tribes list after deletion
        router.refresh();
      } else {
        toast({ variant: 'destructive', description: result.error || "Could not delete tribe." });
      }
    } catch (error) {
       toast({ variant: 'destructive', description: "An unexpected error occurred." });
    } finally {
        setIsDeleting(false);
    }
  }

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
          <DialogFooter className="sm:justify-between pt-2">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Tribe
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your tribe, all of its posts, and remove all members.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTribe}
                            disabled={isDeleting}
                            className={buttonVariants({ variant: "destructive" })}
                        >
                             {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2 justify-end">
                <DialogClose asChild>
                <Button type="button" variant="outline">
                    Cancel
                </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
                </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
