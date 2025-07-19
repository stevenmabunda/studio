
'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarNav } from '@/components/sidebar-nav';
import { RightSidebar } from '@/components/right-sidebar';
import { MobileTopBar } from '@/components/mobile-top-bar';
import { PublicLayout } from '@/components/public-layout';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

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

  // Hide the generic mobile top bar on pages that have their own custom header, like the post detail page.
  const isPostPage = pathname.startsWith('/post/');
  const isCreatorPage = pathname === '/creators';
  const isHomePage = pathname === '/home';
  const showMobileTopBar = !isPostPage;


  if (isCreatorPage) {
    return (
      <div className="flex w-full justify-center">
        <main className="w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center">
      <header className="w-[275px] shrink-0 hidden md:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </header>
      <main className="w-full max-w-[624px] md:border-x pb-16 md:pb-0">
        {showMobileTopBar && <MobileTopBar />}
        {children}
      </main>
      <aside className="w-[350px] shrink-0 hidden lg:block">
        <div className="sticky top-0 h-screen">
          <RightSidebar />
        </div>
      </aside>

      {/* Mobile-only elements */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
