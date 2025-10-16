
'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Card } from '../ui/card';

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
      <div className="flex items-center justify-center p-4 lg:border-l">
        <Card className="w-full max-w-sm p-8 border-border">
            {children}
        </Card>
      </div>
    </div>
  );
}
