'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { useWebSocket } from '@/hooks/useWebSocket';

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize WebSocket connection on mount
  useWebSocket();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
