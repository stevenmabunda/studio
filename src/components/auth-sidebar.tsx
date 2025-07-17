
'use client';

import Link from 'next/link';
import { Button } from './ui/button';

export function AuthSidebar() {
    return (
        <aside className="sticky top-0 h-screen w-full flex-shrink-0 p-4 flex flex-col gap-6">
            <div className="flex h-14 items-center justify-start">
                <Link href="/home" className="font-bold text-white text-3xl" aria-label="BHOLO">
                    BHOLO
                </Link>
            </div>
            <div className="space-y-4 mt-4">
                <h2 className="text-3xl font-bold">Join the conversation</h2>
                <div className="space-y-2 flex flex-col items-start">
                    <Button asChild className="w-full max-w-[200px] text-lg h-12 rounded-full">
                        <Link href="/signup">Create account</Link>
                    </Button>
                    <p className="px-4 py-2">or</p>
                    <Button asChild variant="secondary" className="w-full max-w-[200px] text-lg h-12 rounded-full">
                         <Link href="/login">Sign in</Link>
                    </Button>
                </div>
            </div>
             <div className="mt-auto text-sm text-muted-foreground">
                <Link href="#" className="hover:underline">Privacy</Link>
                <span className="mx-1">·</span>
                <Link href="#" className="hover:underline">Terms</Link>
                 <span className="mx-1">·</span>
                <Link href="#" className="hover:underline">Help</Link>
            </div>
        </aside>
    );
}
