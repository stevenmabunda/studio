
'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function MobileTopBar() {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

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

    return (
        <header className={cn(
            "md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm transition-transform duration-300 ease-in-out",
            !isVisible && "-translate-y-full"
        )}>
            <SidebarTrigger asChild>
                <button className="h-8 w-8 rounded-full overflow-hidden">
                    <Avatar className="h-full w-full">
                        <AvatarImage src={user?.photoURL || undefined} data-ai-hint="user avatar" />
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                </button>
            </SidebarTrigger>
            
            <Link href="/home" aria-label="Home">
                <span className="text-2xl font-bold text-white">BHOLO</span>
            </Link>

            <div className="flex items-center gap-1">
                <Link href="/notifications" passHref>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                </Link>
                <Link href="/messages" passHref>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="h-5 w-5" />
                        <span className="sr-only">Messages</span>
                    </Button>
                </Link>
            </div>
        </header>
    );
}
