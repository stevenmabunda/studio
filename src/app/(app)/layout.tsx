'use client';
import type { ReactNode } from 'react';
import { MobileTopBar } from '@/components/mobile-top-bar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MobileTopBar />
      {children}
    </>
  );
}
