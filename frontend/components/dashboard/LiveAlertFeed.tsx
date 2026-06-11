'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlertStore } from '@/store/useAlertStore';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LiveAlertFeed() {
  const alerts = useAlertStore((s) => s.liveAlerts);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new alerts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // The newest is at the top (unshifted)
    }
  }, [alerts]);

  // Format timestamp nicely
  const getTimeAgo = (isoString: string) => {
    const diffSeconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  return (
    <Card className="bg-[#111827] border-[#1F2937] flex flex-col h-[320px]">
      <CardHeader className="pb-3 border-b border-[#1F2937]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-300">Live Alerts</CardTitle>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs text-gray-400">Streaming</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div 
          ref={scrollRef}
          className="overflow-y-auto h-full p-4 space-y-3 custom-scrollbar"
        >
          {alerts.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">
              No active alerts.
            </div>
          ) : (
            alerts.slice(0, 10).map((alert) => (
              <div 
                key={alert.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-[#1F2937]/50 border border-[#374151]/50 hover:bg-[#1F2937] transition-colors"
              >
                <div className="mt-0.5">
                  {alert.severity === 'critical' && <AlertCircle className="h-5 w-5 text-red-500" />}
                  {alert.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                  {alert.severity === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-white truncate">
                      {alert.serviceName}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {getTimeAgo(alert.triggeredAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium">
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
