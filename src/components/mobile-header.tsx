
'use client';

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useTabContext } from "@/contexts/tab-context";
import { SidebarTrigger } from "./ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function MobileHeader() {
    const [isHidden, setIsHidden] = useState(false);
    const lastScrollY = useRef(0);
    const { activeTab, setActiveTab } = useTabContext();
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                // Scrolling down
                setIsHidden(true);
            } else {
                // Scrolling up
                setIsHidden(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div 
            id="top-container" 
            className={cn(
                "fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-in-out",
                isHidden && 'hide-header'
            )}
        >
            <div id="logo" className="flex h-12 items-center justify-between px-4">
                <SidebarTrigger asChild>
                    <button className="h-8 w-8 rounded-full overflow-hidden">
                        <Avatar className="h-full w-full">
                            <AvatarImage src={user?.photoURL || undefined} data-ai-hint="user avatar" />
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    </button>
                </SidebarTrigger>

                <Link href="/home" aria-label="Home" className="h-8">
                     <Image src="/officialogo.png" alt="BHOLO Logo" width={80} height={32} className="h-full w-auto" />
                </Link>

                {/* Placeholder for right-side icons if needed */}
                <div className="h-8 w-8"></div>
            </div>
            <div id="top-nav">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex w-full justify-evenly border-b bg-transparent p-0 overflow-x-auto no-scrollbar">
                        <TabsTrigger
                            value="foryou"
                            className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4"
                        >
                            For You
                        </TabsTrigger>
                        <TabsTrigger
                            value="discover"
                            className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4"
                        >
                            Discover
                        </TabsTrigger>
                        <TabsTrigger
                            value="live"
                            className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4"
                        >
                            Live
                        </TabsTrigger>
                        <TabsTrigger
                            value="video"
                            className="flex-1 shrink-0 rounded-none border-b-2 border-transparent py-3 text-base font-bold text-muted-foreground data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:shadow-none px-4"
                        >
                            Video
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
}
