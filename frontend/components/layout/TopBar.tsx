'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Moon, Sun, Wifi, WifiOff } from 'lucide-react';
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

  const getTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/services')) return 'Services';
    if (pathname.startsWith('/alerts')) return 'Alerts';
    return 'PulseBoard';
  };

  const getSubtitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Real-time infrastructure overview';
    if (pathname.startsWith('/services')) return 'Monitor and manage services';
    if (pathname.startsWith('/alerts')) return 'Review and resolve incidents';
    return '';
  };

  const handleBellClick = () => {
    markAllRead();
    router.push('/alerts');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 transition-colors duration-300">
      {/* Left: Page Title */}
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{getTitle()}</h1>
        <span className="text-xs text-muted-foreground">{getSubtitle()}</span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        
        {/* Connection Status Pill */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
          isConnected 
            ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400' 
            : 'bg-red-500/10 text-red-500 dark:bg-red-500/10 dark:text-red-400'
        )}>
          {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          <div className={cn(
            'h-1.5 w-1.5 rounded-full',
            isConnected ? 'bg-emerald-500 animate-pulse-glow' : 'bg-red-500'
          )} />
          {isConnected ? 'Live' : 'Offline'}
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        {/* Alerts Bell */}
        <button
          onClick={handleBellClick}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/30 animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
