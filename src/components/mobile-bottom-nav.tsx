
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Hash, Users, Bell, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/explore', icon: Hash, label: 'Explore' },
  { href: '/communities', icon: Users, label: 'Communities' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/messages', icon: Mail, label: 'Messages' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-t border-border z-40">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== '/home' || pathname === '/home');
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex justify-center items-center h-full">
              <item.icon
                className={cn(
                  'h-7 w-7 text-muted-foreground transition-colors',
                  isActive && 'text-primary'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
