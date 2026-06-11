'use client';

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  sparklineData?: number[];
  sparklineColor?: string;
}

export function StatCard({
  title,
  value,
  unit = '',
  trend = 'neutral',
  sparklineData = [],
  sparklineColor = '#3B82F6',
}: StatCardProps) {
  // Format data for Recharts
  const data = sparklineData.map((val, i) => ({ value: val, index: i }));

  return (
    <Card className="bg-[#111827] border-[#1F2937] overflow-hidden">
      <CardContent className="p-5 flex flex-col justify-between h-full relative">
        <div className="z-10 relative">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {title}
          </p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold font-mono tracking-tight text-white">
              {value}
              <span className="text-lg text-gray-500 font-sans ml-1">{unit}</span>
            </h3>
            
            {trend === 'up' && (
              <div className="flex items-center text-red-400 mb-1">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            )}
            {trend === 'down' && (
              <div className="flex items-center text-green-400 mb-1">
                <ArrowDownRight className="h-4 w-4" />
              </div>
            )}
            {trend === 'neutral' && (
              <div className="flex items-center text-gray-500 mb-1">
                <Minus className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Sparkline background */}
        {data.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={sparklineColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${title})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
