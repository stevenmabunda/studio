import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { RightSidebar } from '@/components/right-sidebar';

export const metadata: Metadata = {
  title: 'Goal Chatter',
  description: 'A football-focused social media app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
            <div className="flex w-full justify-center">
              <div className="flex w-full max-w-[1275px]">
                <header className="w-[275px] shrink-0">
                  <div className="sticky top-0 h-screen">
                    <SidebarNav />
                  </div>
                </header>
                <main className="w-full max-w-[624px] border-x">{children}</main>
                <aside className="w-[350px] shrink-0 hidden lg:block">
                  <div className="sticky top-0 h-screen">
                    <RightSidebar />
                  </div>
                </aside>
              </div>
            </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
