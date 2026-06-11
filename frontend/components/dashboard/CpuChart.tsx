'use client';

import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMetricsStore } from '@/store/useMetricsStore';
import { Cpu } from 'lucide-react';

export function CpuChart() {
  const history = useMetricsStore(s => s.metricsHistory);

  const data = useMemo(() => {
    const timestamps = new Set<number>();
    Object.values(history).forEach(serviceHistory => {
      serviceHistory.forEach(point => timestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);

    return sortedTimestamps.map(ts => {
      let totalCpu = 0;
      let count = 0;
      Object.values(history).forEach(serviceHistory => {
        const point = serviceHistory.find(p => p.timestamp === ts);
        if (point) { totalCpu += point.cpu; count++; }
      });
      return {
        timestamp: ts,
        timeLabel: `-${Math.round((Date.now() - ts) / 1000)}s`,
        cpu: count > 0 ? Math.round((totalCpu / count) * 10) / 10 : 0
      };
    });
  }, [history]);

  return (
    <Card className="bg-card border-border shadow-sm transition-colors duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Cpu className="h-4 w-4 text-blue-500" />
          CPU Usage (60s)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-2">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="timeLabel" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                  itemStyle={{ color: '#3B82F6' }} labelStyle={{ color: 'var(--muted-foreground)' }}
                  formatter={(value) => [`${value}%`, 'Avg CPU']}
                  labelFormatter={(label) => `Time: ${label}`}
                  isAnimationActive={false}
                />
                <Area type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Waiting for data...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
