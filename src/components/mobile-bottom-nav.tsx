
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, Search, Users, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CreatePost, type Media } from '@/components/create-post';
import { usePosts } from '@/contexts/post-context';
import { useToast } from '@/hooks/use-toast';
import type { PostType } from '@/lib/data';
import { useTabContext } from '@/contexts/tab-context';
import { ScrollArea } from './ui/scroll-area';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/explore', icon: Search, label: 'Explore' },
  { href: 'POST_ACTION', icon: Plus, label: 'Post' },
  { href: '/tribes', icon: Users, label: 'Tribes' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { addPost } = usePosts();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { activeTab } = useTabContext();
  
  const isVideoTabActive = activeTab === 'video' && pathname === '/home';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide nav if scrolling down
      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setIsVisible(false);
      } else {
        // Show nav if scrolling up or at the top of the page
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  return (
    <nav className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-t border-border z-40 transition-transform duration-300 ease-in-out",
        (!isVisible || isVideoTabActive) && "translate-y-full"
    )}>
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          if (item.href === 'POST_ACTION') {
            return (
              <Sheet key={item.label} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <SheetTrigger asChild>
                  <button className="flex-1 flex justify-center items-center h-full">
                    <item.icon className='h-7 w-7 text-muted-foreground' strokeWidth={2.5} />
                  </button>
                </SheetTrigger>
                <SheetContent 
                    side="bottom" 
                    className="rounded-t-lg p-0 h-[90vh]"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <SheetHeader className="p-3 md:p-4 pb-0">
                      <SheetTitle>Create a new post</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-full">
                        <div className="p-3 md:p-4 pt-0">
                            <CreatePost onPost={handlePost} />
                        </div>
                    </ScrollArea>
                </SheetContent>
              </Sheet>
            );
          }
          
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href + item.label} href={item.href} className="flex-1 flex justify-center items-center h-full">
              <item.icon
                className={cn(
                  'h-6 w-6 text-muted-foreground transition-colors',
                  isActive && 'text-primary'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
