'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { Goal } from "lucide-react";

export function MobileTopBar() {
    return (
        <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
            <SidebarTrigger className="h-8 w-8" />
            
            <Link href="/" aria-label="Home">
                <Goal className="h-8 w-8 text-primary" />
            </Link>

            {/* Dummy element for spacing */}
            <div className="w-8 h-8"></div>
        </header>
    );
}
