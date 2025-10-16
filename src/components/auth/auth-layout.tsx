
import type { ReactNode } from 'react';
import Image from 'next/image';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col items-center justify-center bg-background p-10 text-white lg:flex">
         <Image
            src="https://picsum.photos/seed/bholo-auth/1200/1800"
            alt="BHOLO background image"
            fill
            className="absolute inset-0 object-cover opacity-20"
            data-ai-hint="football fans stadium"
            priority
          />
          <div className="relative z-20 w-full max-w-md space-y-4">
              <Link href="/home" aria-label="Home" className="block w-32">
                <Image src="/bholo_logo.png" alt="BHOLO Logo" width={150} height={60} priority />
             </Link>
             <h1 className="text-3xl font-bold">Welcome to the football banter app.</h1>
             <p className="text-lg text-muted-foreground">Opinions wanted, feelings optional.</p>
          </div>
      </div>
      <div className="flex items-center justify-center p-4">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {children}
        </div>
      </div>
    </div>
  );
}
