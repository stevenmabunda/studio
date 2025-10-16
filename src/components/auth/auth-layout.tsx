'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      <div className="relative hidden lg:flex items-center justify-center p-8">
         <Image
            src="/welcome2.jpg"
            alt="BHOLO welcome banner"
            fill
            className="absolute inset-0 object-contain"
            priority
          />
      </div>
      <div className="flex flex-col items-center justify-center p-4 lg:border-l">
        <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <Image src="/bholo_logo.png" alt="BHOLO Logo" width={120} height={48} priority />
            <p className="mt-2 text-lg text-foreground">Welcome to the football banter app.</p>
        </div>
        <div className="w-full max-w-sm">
            {children}
        </div>
      </div>
    </div>
  );
}
