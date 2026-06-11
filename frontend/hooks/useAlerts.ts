import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { AlertsResponse, ApiResponse, Alert } from '@/types';

export function useAlerts(filters?: { severity?: string; status?: string }) {
  return useQuery<AlertsResponse>({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.severity) params.set('severity', filters.severity);
      if (filters?.status)   params.set('status', filters.status);
      const { data } = await axios.get(`/api/alerts?${params}`);
      return data;
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await axios.put<ApiResponse<Alert>>(`/api/alerts/${alertId}/resolve`);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch alerts
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
