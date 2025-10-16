
'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      <div className="relative hidden lg:flex">
         <Image
            src="/welcome2.jpg"
            alt="BHOLO welcome banner"
            fill
            className="absolute inset-0 object-cover"
            priority
          />
      </div>
      <div className="flex items-center justify-center p-4">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {children}
        </div>
      </div>
    </div>
  );
}
