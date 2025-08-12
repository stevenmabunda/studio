
'use client';

import type { ReactNode } from 'react';
import { AuthSidebar } from '@/components/auth-sidebar';
import { RightSidebar } from '@/components/right-sidebar';
import { Button } from './ui/button';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

export function PublicLayout({ children }: { children: ReactNode }) {

    return (
        <>
            {/* Desktop Layout */}
            <div className="hidden md:flex justify-center h-screen overflow-hidden">
                <div className="flex max-w-7xl mx-auto w-full">
                    <header className="w-[275px] shrink-0 h-full">
                        <AuthSidebar />
                    </header>
                    <main className="w-full max-w-[624px] border-x">
                         <ScrollArea className="h-screen no-scrollbar">
                            {children}
                        </ScrollArea>
                    </main>
                    <aside className="hidden lg:block w-[350px] shrink-0 h-full">
                        <ScrollArea className="h-screen no-scrollbar">
                            <RightSidebar />
                        </ScrollArea>
                    </aside>
                </div>
            </div>

            {/* Mobile Layout */}
             <div className="md:hidden w-full">
                <main className="w-full pb-20">
                    {children}
                </main>
                <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-primary/95 backdrop-blur-sm p-4 z-40">
                    <div className="flex justify-around items-center h-full gap-4">
                        <Button asChild className="flex-1 rounded-full text-base font-bold" variant="secondary">
                        <Link href="/login">Sign in</Link>
                        </Button>
                        <Button asChild className="flex-1 rounded-full text-base font-bold text-white">
                            <Link href="/signup">Create account</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
