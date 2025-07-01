
'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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

            {/* Dummy element for spacing */}
            <div className="w-8 h-8"></div>
        </header>
    );
}
