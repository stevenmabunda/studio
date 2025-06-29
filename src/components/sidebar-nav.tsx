
'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Home, Hash, Users, Bell, User, MessageSquare, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { CreatePost, type Media } from './create-post';
import { usePosts } from '@/contexts/post-context';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';


const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Hash },
  { href: '/communities', label: 'Communities', icon: Users },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { addPost } = usePosts();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePost = async (data: { text: string; media: Media[] }) => {
    try {
        await addPost(data);
        setIsDialogOpen(false);
        toast({ description: "Your post has been published!" });
    } catch (error) {
        console.error("Failed to create post from dialog:", error);
        toast({ variant: 'destructive', description: "Something went wrong. Please try again." });
    }
  };

  const handleLogout = async () => {
    if (!auth) {
      console.error('Firebase not configured, cannot log out.');
      // Optionally, show a toast to the user.
      return;
    }
    await signOut(auth);
    router.push('/login');
    router.refresh();
  };

  const userHandle = user?.email?.split('@')[0] || 'user';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-14 items-center justify-start px-4">
            <Link href="/home" className="font-bold text-white text-2xl group-data-[collapsible=icon]:hidden" aria-label="BHOLO">
                BHOLO
            </Link>
            <Link href="/home" className="hidden font-bold text-white text-3xl group-data-[collapsible=icon]:block" aria-label="BHOLO">
                B
            </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href === '/home' && pathname === '/')}
                className="text-lg h-14"
              >
                <Link href={item.href}>
                  <item.icon className="h-7 w-7" />
                  <span className={pathname === item.href ? 'font-bold' : 'font-normal'}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className="px-2 mt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-14 text-lg rounded-full">Kick-It!</Button>
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
        </div>
      </SidebarContent>
       <SidebarFooter>
         {user && (
            <div className="w-full p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start p-3 h-auto rounded-xl bg-sidebar-accent/50 hover:bg-sidebar-accent/75 transition-colors">
                            <div className="flex items-center gap-3 w-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.photoURL || 'https://placehold.co/40x40.png'} alt="User Avatar" data-ai-hint="user avatar" />
                                    <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden text-left">
                                    <p className="truncate font-bold">{user.displayName || 'User'}</p>
                                    <p className="truncate text-sm text-muted-foreground">@{userHandle}</p>
                                </div>
                                <LogOut className="h-5 w-5 ml-auto" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 mb-2" side="top" align="start">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            Log out @{userHandle}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
         )}
      </SidebarFooter>
    </Sidebar>
  );
}
