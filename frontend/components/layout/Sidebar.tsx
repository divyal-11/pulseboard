'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, Server, Bell, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Services',  href: '/services',  icon: Server },
    { name: 'Alerts',    href: '/alerts',     icon: Bell },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] flex flex-col border-r border-border bg-sidebar transition-colors duration-300">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-500/20">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-base tracking-tight text-foreground">
          PulseBoard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 mt-2">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className={cn(
                'h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110',
                isActive && 'drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]'
              )} />
              {link.name}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>v1.0.0 — Live</span>
        </div>
      </div>
    </aside>
  );
}
