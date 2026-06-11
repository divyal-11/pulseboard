'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, Server, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Services', href: '/services', icon: Server },
    { name: 'Alerts', href: '/alerts', icon: Bell },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] flex-col border-r border-[#1F2937] bg-[#111827] flex">
      <div className="flex h-14 items-center gap-2 border-b border-[#1F2937] px-6">
        <Activity className="h-6 w-6 text-blue-500" />
        <span className="font-bold text-lg tracking-tight text-white">PulseBoard</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
