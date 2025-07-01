
'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail, Bell } from "lucide-react";
import { Button } from "./ui/button";

export function MobileTopBar() {
    const { user } = useAuth();
    return (
        <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
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
