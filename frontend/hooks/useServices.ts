import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { ServicesResponse, Service, ApiResponse } from '@/types';

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

export function useServiceChaos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId, mode }: { serviceId: string; mode: 'down' | 'degraded' | 'healthy' }) => {
      const { data } = await axios.post<ApiResponse<Service>>(`/api/services/${serviceId}/chaos`, { mode });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

