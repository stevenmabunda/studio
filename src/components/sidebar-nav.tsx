'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Hash, CalendarClock, Bell, User, Goal, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Hash },
  { href: '/threads', label: 'Match Threads', icon: CalendarClock },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-12 w-12 shrink-0" asChild>
            <Link href="/">
              <Goal className="h-8 w-8 text-primary" />
              <span className="sr-only">Goal Chatter</span>
            </Link>
          </Button>
        </div>
        <Link href="/profile" className="block w-full rounded-xl p-3 bg-sidebar-accent/50 hover:bg-sidebar-accent/75 transition-colors">
            <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <div>
                        <p className="truncate font-bold">Your Name</p>
                        <p className="truncate text-sm text-muted-foreground">@yourhandle</p>
                    </div>
                    <div className="mt-4 flex gap-4 text-sm">
                        <div>
                            <span className="font-bold">142</span>
                            <span className="text-muted-foreground"> Following</span>
                        </div>
                        <div>
                            <span className="font-bold">1,205</span>
                            <span className="text-muted-foreground"> Followers</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className="text-lg h-14"
                >
                  <item.icon className="h-7 w-7" />
                  <span className={pathname === item.href ? 'font-bold' : 'font-normal'}>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className="px-2 mt-4">
            <Button className="w-full h-14 text-lg rounded-full">Kick-It!</Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
