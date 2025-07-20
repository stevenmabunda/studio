
'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarNav } from '@/components/sidebar-nav';
import { RightSidebar } from '@/components/right-sidebar';
import { PublicLayout } from '@/components/public-layout';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { MobileTopBar } from '@/components/mobile-top-bar';

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

  // Hide the generic mobile top bar on pages that have their own custom header, like the post detail page.
  const isPostPage = pathname.startsWith('/post/');
  const isHomePage = pathname === '/home';
  const showGenericMobileTopBar = !isPostPage && !isHomePage;

  return (
    <div className="md:flex md:justify-center">
        {/* Desktop Layout: Centered wrapper with fixed sidebars */}
        <div className="hidden md:flex md:max-w-7xl md:mx-auto md:w-full">
          <header className="w-[275px] shrink-0">
            <SidebarNav />
          </header>

          <div className="flex-1 min-w-0">
             <main className="w-full max-w-[624px] md:border-x h-screen overflow-y-auto">
                {children}
            </main>
          </div>

          <aside className="hidden xl:block w-[350px] shrink-0">
            <RightSidebar />
          </aside>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden w-full">
            {showGenericMobileTopBar && <MobileTopBar />}
             <main className="w-full pb-16">
                {children}
            </main>
            <MobileBottomNav />
        </div>
    </div>
  );
}
