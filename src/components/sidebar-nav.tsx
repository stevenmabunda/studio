
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
import { Home, Hash, Users, Bell, User, MessageSquare, LogOut, Bookmark, MoreHorizontal, Star, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { CreatePost, type Media } from './create-post';
import { usePosts } from '@/contexts/post-context';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import type { PostType } from '@/lib/data';
import Image from 'next/image';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { SidebarBadge } from './ui/sidebar-badge';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Hash },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/live', label: 'Match Centre', icon: ShieldCheck },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/creators', label: 'Become a Creator', icon: Star },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { addPost } = usePosts();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (user && db) {
      const notificationsRef = collection(db, 'users', user.uid, 'notifications');
      const q = query(notificationsRef, where('read', '==', false));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadNotifications(snapshot.size);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handlePost = async (data: { text: string; media: Media[], poll?: PostType['poll'], location?: string | null }) => {
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
      return;
    }
    await signOut(auth);
    // Force a full page reload to ensure all state is cleared.
    window.location.href = '/login';
  };

  const userHandle = user?.email?.split('@')[0] || 'user';

  return (
    <div className="h-full flex-col sticky top-0 flex w-full">
      <Sidebar className="h-screen overflow-y-auto">
        <SidebarHeader>
          <div className="flex h-14 items-center justify-start px-4">
              <Link href="/home" className="group-data-[collapsible=icon]:hidden w-24" aria-label="BHOLO">
                  <Image src="/officialogo.png" alt="BHOLO Logo" width={100} height={40} priority />
              </Link>
              <Link href="/home" className="hidden group-data-[collapsible=icon]:block w-8 h-8" aria-label="BHOLO">
                   <Image src="/officialogo.png" alt="BHOLO Icon" width={32} height={32} priority />
              </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href !== '/profile' || pathname === '/profile' || pathname.startsWith('/profile/'))}
                  className="text-lg h-14"
                >
                  <Link href={item.href === '/profile' && user ? `/profile/${user.uid}` : item.href} className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <item.icon className="h-7 w-7" />
                        <span className={pathname.startsWith(item.href) ? 'font-bold' : 'font-normal'}>{item.label}</span>
                    </div>
                     {item.href === '/notifications' && unreadNotifications > 0 && (
                        <SidebarBadge count={unreadNotifications} />
                     )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="px-2 mt-4 md:block hidden">
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
         <SidebarFooter className="mt-auto">
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
                                  <MoreHorizontal className="h-5 w-5 ml-auto" />
                              </div>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 mb-2" side="top" align="start">
                          <DropdownMenuItem onSelect={() => router.push(`/profile/${user.uid}`)}>
                              <User className="mr-2 h-4 w-4" />
                              <span>My Account</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout}>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Log out</span>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
           )}
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
