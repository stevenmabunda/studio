
'use client';

import type { ReactNode } from 'react';
import { AuthSidebar } from '@/components/auth-sidebar';
import { RightSidebar } from '@/components/right-sidebar';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import Link from 'next/link';

export function PublicLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    const isDiscover = pathname.startsWith('/explore') || pathname === '/home' || pathname === '/';

    return (
        <div className="flex w-full justify-center">
            <header className="w-[275px] shrink-0 hidden md:block">
                <div className="sticky top-0 h-screen">
                    <AuthSidebar />
                </div>
            </header>
            <main className="w-full max-w-[624px] md:border-x min-h-screen">
                 <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
                    <div className="flex w-full overflow-x-auto bg-transparent p-0 no-scrollbar sm:grid sm:grid-cols-2">
                        <Button variant="ghost" asChild className="h-auto shrink-0 rounded-none border-b-2 py-4 text-base font-bold data-[active]:border-primary data-[active]:shadow-none px-4 data-[active]:text-primary" data-active={isDiscover}>
                            <Link href="/explore">Discover</Link>
                        </Button>
                        <Button variant="ghost" className="h-auto shrink-0 rounded-none border-b-2 border-transparent py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:shadow-none px-4 cursor-not-allowed opacity-50">
                           Feeds ✨
                        </Button>
                    </div>
                </header>
                {children}
            </main>
            <aside className="w-[350px] shrink-0 hidden lg:block">
                <div className="sticky top-0 h-screen">
                    <RightSidebar />
                </div>
            </aside>
             {/* Bottom bar for mobile */}
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
    );
}
