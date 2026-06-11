'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { StatCard } from '@/components/dashboard/StatCard';
import { CpuChart } from '@/components/dashboard/CpuChart';
import { MemoryChart } from '@/components/dashboard/MemoryChart';
import { LiveAlertFeed } from '@/components/dashboard/LiveAlertFeed';
import { useMetricsStore } from '@/store/useMetricsStore';
import { useAlertStore } from '@/store/useAlertStore';

export default function DashboardPage() {
  const { avgCpu, avgMemory, totalRequestsPerSec, metricsHistory } = useMetricsStore();
  const alertsCount = useAlertStore(s => s.liveAlerts.length);

  // Derive sparkline data (last 10 points) for the stat cards by aggregating across services
  // CPU Sparkline
  const cpuSparkline: number[] = [];
  const memSparkline: number[] = [];
  const rpsSparkline: number[] = [];
  
  // Quick aggregation for sparklines
  const timestamps = new Set<number>();
  Object.values(metricsHistory).forEach(h => h.forEach(p => timestamps.add(p.timestamp)));
  const sortedTs = Array.from(timestamps).sort((a, b) => a - b).slice(-15); // take last 15 for sparklines

  sortedTs.forEach(ts => {
    let cpu = 0, mem = 0, rps = 0, count = 0;
    Object.values(metricsHistory).forEach(h => {
      const pt = h.find(p => p.timestamp === ts);
      if (pt) {
        cpu += pt.cpu;
        mem += pt.memory;
        rps += pt.requestsPerSec;
        count++;
      }
    });
    if (count > 0) {
      cpuSparkline.push(cpu / count);
      memSparkline.push(mem / count);
      rpsSparkline.push(rps);
    }
  });

  return (
    <PageWrapper>
      <div className="space-y-6">
        
        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Avg CPU" 
            value={avgCpu > 0 ? avgCpu : '--'} 
            unit="%" 
            trend={avgCpu > 80 ? 'up' : avgCpu < 20 ? 'down' : 'neutral'}
            sparklineData={cpuSparkline}
            sparklineColor="#3B82F6"
          />
          <StatCard 
            title="Avg Memory" 
            value={avgMemory > 0 ? avgMemory : '--'} 
            unit="%" 
            trend={avgMemory > 80 ? 'up' : 'neutral'}
            sparklineData={memSparkline}
            sparklineColor="#8B5CF6"
          />
          <StatCard 
            title="Total RPS" 
            value={totalRequestsPerSec > 0 ? totalRequestsPerSec.toLocaleString() : '--'} 
            unit="/s" 
            trend="up"
            sparklineData={rpsSparkline}
            sparklineColor="#10B981"
          />
          <StatCard 
            title="Active Alerts" 
            value={alertsCount} 
            unit="" 
            trend={alertsCount > 5 ? 'up' : 'neutral'}
            // No sparkline for alerts
          />
        </div>

        {/* Charts & Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CpuChart />
            <MemoryChart />
          </div>
          <div className="lg:col-span-1">
            <LiveAlertFeed />
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
