'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlertStore } from '@/store/useAlertStore';
import { AlertCircle, Info, AlertTriangle, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LiveAlertFeed() {
  const alerts = useAlertStore((s) => s.liveAlerts);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [alerts]);

  const getTimeAgo = (isoString: string) => {
    const diffSeconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  return (
    <Card className="bg-card border-border flex flex-col h-full min-h-[320px] transition-colors duration-300">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Live Alerts</CardTitle>
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-blue-500/10">
            <Radio className="h-3 w-3 text-blue-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Streaming</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div 
          ref={scrollRef}
          className="overflow-y-auto h-full p-3 space-y-2 custom-scrollbar"
        >
          {alerts.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No active alerts — all quiet ✓
            </div>
          ) : (
            alerts.slice(0, 10).map((alert, i) => (
              <div 
                key={alert.id} 
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-all duration-300',
                  'bg-accent/30 border-border hover:bg-accent/50',
                  i === 0 && 'animate-in slide-in-from-top-2 duration-300'
                )}
              >
                <div className="mt-0.5">
                  {alert.severity === 'critical' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {alert.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  {alert.severity === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {alert.serviceName}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                      {getTimeAgo(alert.triggeredAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {alert.title}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
