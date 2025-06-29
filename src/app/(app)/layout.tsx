
'use client';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarNav } from '@/components/sidebar-nav';
import { RightSidebar } from '@/components/right-sidebar';
import { MobileTopBar } from '@/components/mobile-top-bar';
import { useEffect } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // The global loader in AuthProvider handles loading, and we wait for redirect if no user.
  }

  return (
    <>
      <header className="w-[275px] shrink-0 hidden md:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </header>
      <main className="w-full max-w-[624px] md:border-x">
        <MobileTopBar />
        {children}
      </main>
      <aside className="w-[350px] shrink-0 hidden lg:block">
        <div className="sticky top-0 h-screen">
          <RightSidebar />
        </div>
      </aside>
    </>
  );
}
