
import { Goal } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthLayout({ children, title, description }: { children: ReactNode, title: string, description: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Goal className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
