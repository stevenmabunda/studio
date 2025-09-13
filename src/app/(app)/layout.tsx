
'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarNav } from '@/components/sidebar-nav';
import { RightSidebar } from '@/components/right-sidebar';
import { PublicLayout } from '@/components/public-layout';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { FloatingCreatePostButton } from '@/components/floating-create-post-button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return null; // The global loader in AuthProvider handles this.
  }

  // If the user is not logged in, show the public-facing layout.
  if (!user) {
    return (
        <PublicLayout>
            {children}
        </PublicLayout>
    );
  }

  const isCreatorPage = pathname === '/creators';
  if (isCreatorPage) {
    return (
      <div className="flex w-full justify-center">
        <main className="w-full">
          {children}
        </main>
      </div>
    );
  }

  // Use a different layout for the mobile post page
  const isPostPage = pathname.startsWith('/post/');
  if (isPostPage) {
      return (
           <div className="md:hidden w-full h-screen">
               {children}
           </div>
      )
  }

  return (
    <>
      {/* Desktop Layout: Centered wrapper with sticky sidebars and a single scrollable main area */}
      <div className="hidden md:flex justify-center h-screen overflow-hidden">
        <div className="flex max-w-7xl mx-auto w-full relative">
          <header className="w-[275px] shrink-0 h-screen">
              <SidebarNav />
          </header>

          <main className="w-full max-w-[624px] border-x">
             <ScrollArea className="h-screen">
                {children}
             </ScrollArea>
          </main>

          <aside className="hidden xl:block w-[350px] shrink-0 h-screen">
            <ScrollArea className="h-full">
                <RightSidebar />
            </ScrollArea>
          </aside>
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden w-full">
            <main className="w-full pb-16">
              {children}
            </main>
          <MobileBottomNav />
      </div>
    </>
  );
}
