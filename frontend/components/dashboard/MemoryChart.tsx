'use client';

import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMetricsStore } from '@/store/useMetricsStore';

export function MemoryChart() {
  const history = useMetricsStore(s => s.metricsHistory);

  // Aggregate average memory across all services per timestamp
  const data = useMemo(() => {
    // Collect all unique timestamps
    const timestamps = new Set<number>();
    Object.values(history).forEach(serviceHistory => {
      serviceHistory.forEach(point => timestamps.add(point.timestamp));
    });

    // Sort ascending
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);

    // Calculate average for each timestamp
    return sortedTimestamps.map(ts => {
      let totalMemory = 0;
      let count = 0;

      Object.values(history).forEach(serviceHistory => {
        const point = serviceHistory.find(p => p.timestamp === ts);
        if (point) {
          totalMemory += point.memory;
          count++;
        }
      });

      return {
        timestamp: ts,
        timeLabel: `-${Math.round((Date.now() - ts) / 1000)}s`,
        memory: count > 0 ? Math.round((totalMemory / count) * 10) / 10 : 0
      };
    });
  }, [history]);

  return (
    <Card className="bg-[#111827] border-[#1F2937] col-span-1 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-300">Memory Usage (60s)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-2">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                <XAxis 
                  dataKey="timeLabel" 
                  stroke="#4B5563" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis 
                  stroke="#4B5563" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB', borderRadius: '6px' }}
                  itemStyle={{ color: '#8B5CF6' }}
                  labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                  formatter={(value) => [`${value}%`, 'Avg Memory']}
                  labelFormatter={(label) => `Time: ${label}`}
                  isAnimationActive={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorMemory)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Waiting for data...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
