
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import { PostProvider } from '@/contexts/post-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TabProvider } from '@/contexts/tab-context';
import { ScrollProvider } from '@/contexts/scroll-context';

export const metadata: Metadata = {
  title: 'BHOLO',
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <PostProvider>
            <SidebarProvider>
              <TabProvider>
                <ScrollProvider>
                  {children}
                </ScrollProvider>
              </TabProvider>
            </SidebarProvider>
          </PostProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
