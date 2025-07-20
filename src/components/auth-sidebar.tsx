
'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { MessageCircle, Users, BarChart2, Newspaper } from 'lucide-react';
import Image from 'next/image';

export function AuthSidebar() {
    return (
        <aside className="sticky top-0 h-screen w-full flex-shrink-0 p-4 flex flex-col gap-6">
            <div className="flex flex-col h-14 justify-center">
                <Link href="/home" className="w-24" aria-label="BHOLO">
                    <Image src="/officialogo.png" alt="BHOLO Logo" width={100} height={40} />
                </Link>
                <p className="text-muted-foreground -mt-1">The Football Social Network</p>
            </div>
            <div className="space-y-4 mt-4">
                <h2 className="text-3xl font-bold">Kick It with other fans</h2>

                <ul className="space-y-3 text-lg text-foreground">
                    <li className="flex items-center gap-3">
                        <MessageCircle className="h-6 w-6 text-primary" />
                        <span>Post about your favourite teams & players</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary" />
                        <span>Follow and banter with like-minded or rival fans</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <BarChart2 className="h-6 w-6 text-primary" />
                        <span>React to live scores and play-by-play action</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Newspaper className="h-6 w-6 text-primary" />
                        <span>Get news, hot takes, and fan perspectives</span>
                    </li>
                </ul>

                <div className="space-y-2 flex flex-col items-start pt-4">
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
