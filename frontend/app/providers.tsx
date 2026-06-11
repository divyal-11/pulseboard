'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useUIStore } from '@/store/useUIStore';

function ThemeApplier() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  useWebSocket();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeApplier />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
