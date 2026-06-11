import { create } from 'zustand';
import { ServiceMetrics, MetricDataPoint, MetricsHistory } from '@/types';

const MAX_HISTORY = 60; // 60 seconds of data points

interface MetricsStore {
  // Current snapshot — latest metrics per service
  currentMetrics: Record<string, ServiceMetrics>;

  // Rolling 60s history per service — for charts
  metricsHistory: MetricsHistory;

  // Aggregate stats for stat cards
  avgCpu: number;
  avgMemory: number;
  totalRequestsPerSec: number;
  totalErrorRate: number;

  // Actions
  updateMetrics: (metrics: ServiceMetrics[]) => void;
  resetMetrics: () => void;
}

export const useMetricsStore = create<MetricsStore>((set, get) => ({
  currentMetrics: {},
  metricsHistory: {},
  avgCpu: 0,
  avgMemory: 0,
  totalRequestsPerSec: 0,
  totalErrorRate: 0,

  updateMetrics: (metrics) => {
    const current = { ...get().currentMetrics };
    const history = { ...get().metricsHistory };

    metrics.forEach(m => {
      current[m.serviceId] = m;

      // Append to history, cap at MAX_HISTORY
      const existing = history[m.serviceId] ?? [];
      const point: MetricDataPoint = {
        timestamp: m.timestamp,
        cpu: m.cpu,
        memory: m.memory,
        requestsPerSec: m.requestsPerSec,
        errorRate: m.errorRate,
      };
      history[m.serviceId] = [...existing.slice(-(MAX_HISTORY - 1)), point];
    });

    // Recalculate aggregates
    const values = Object.values(current);
    const avgCpu = values.reduce((s, m) => s + m.cpu, 0) / values.length;
    const avgMemory = values.reduce((s, m) => s + m.memory, 0) / values.length;
    const totalRps = values.reduce((s, m) => s + m.requestsPerSec, 0);
    const avgError = values.reduce((s, m) => s + m.errorRate, 0) / values.length;

    set({
      currentMetrics: current,
      metricsHistory: history,
      avgCpu: Math.round(avgCpu * 10) / 10,
      avgMemory: Math.round(avgMemory * 10) / 10,
      totalRequestsPerSec: Math.round(totalRps),
      totalErrorRate: Math.round(avgError * 100) / 100,
    });
  },

  resetMetrics: () => set({ currentMetrics: {}, metricsHistory: {} }),
}));
