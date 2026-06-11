import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,       // data fresh for 5s
      refetchInterval: 5 * 1000, // background refetch every 5s
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
