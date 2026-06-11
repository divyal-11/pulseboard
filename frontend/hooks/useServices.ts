import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { ServicesResponse } from '@/types';

export function useServices() {
  return useQuery<ServicesResponse>({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await axios.get('/api/services');
      return data;
    },
    refetchInterval: 10 * 1000,
  });
}
