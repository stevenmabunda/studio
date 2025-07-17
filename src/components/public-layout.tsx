
'use client';

import type { ReactNode } from 'react';
import { AuthSidebar } from '@/components/auth-sidebar';
import { RightSidebar } from '@/components/right-sidebar';
import { Button } from './ui/button';
import Link from 'next/link';

export function PublicLayout({ children }: { children: ReactNode }) {

    return (
        <div className="flex w-full justify-center">
            <header className="w-[275px] shrink-0 hidden md:block">
                <div className="sticky top-0 h-screen">
                    <AuthSidebar />
                </div>
            </header>
            <main className="w-full max-w-[624px] md:border-x min-h-screen">
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
