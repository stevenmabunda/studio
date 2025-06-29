
import type { ReactNode } from 'react';

export function AuthLayout({ children, title, description }: { children: ReactNode, title: string, description: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white">BHOLO</h1>
          <h2 className="pt-4 text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
