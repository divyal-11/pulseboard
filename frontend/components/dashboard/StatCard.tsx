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
  const data = sparklineData.map((val, i) => ({ value: val, index: i }));

  return (
    <Card className="relative overflow-hidden bg-card border-border card-hover transition-colors duration-300">
      <CardContent className="p-5 flex flex-col justify-between h-full relative">
        {/* Subtle gradient overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${sparklineColor}, transparent)` }}
        />

        <div className="z-10 relative">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {title}
          </p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {value}
              <span className="text-base text-muted-foreground font-sans ml-1">{unit}</span>
            </h3>
            
            {trend === 'up' && (
              <div className="flex items-center gap-1 text-red-400 mb-1 text-xs font-medium">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            )}
            {trend === 'down' && (
              <div className="flex items-center gap-1 text-emerald-400 mb-1 text-xs font-medium">
                <ArrowDownRight className="h-4 w-4" />
              </div>
            )}
            {trend === 'neutral' && (
              <div className="flex items-center text-muted-foreground mb-1">
                <Minus className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Sparkline */}
        {data.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-25 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={sparklineColor}
                  strokeWidth={2}
                  fill={`url(#grad-${title.replace(/\s/g, '')})`}
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
