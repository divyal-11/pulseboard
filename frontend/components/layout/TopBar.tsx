'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Moon, Sun } from 'lucide-react';
import { useAlertStore } from '@/store/useAlertStore';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const unreadCount = useAlertStore((s) => s.unreadCount);
  const markAllRead = useAlertStore((s) => s.markAllRead);
  
  const isConnected = useUIStore((s) => s.isConnected);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  // Simple title generator based on route
  const getTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/services')) return 'Services';
    if (pathname.startsWith('/alerts')) return 'Alerts';
    return 'PulseBoard';
  };

  const handleBellClick = () => {
    markAllRead();
    router.push('/alerts');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1F2937] bg-[#0A0F1E] px-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold tracking-tight text-white">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
            )}
          />
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>

        <div className="h-4 w-px bg-[#1F2937]" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-gray-400 transition-colors hover:bg-[#1F2937] hover:text-white focus:outline-none"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Alerts Bell */}
        <button
          onClick={handleBellClick}
          className="relative rounded-md p-2 text-gray-400 transition-colors hover:bg-[#1F2937] hover:text-white focus:outline-none"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
