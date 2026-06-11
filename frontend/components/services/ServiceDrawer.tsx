'use client';

import { useMemo } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useServices } from '@/hooks/useServices';
import { useMetricsStore } from '@/store/useMetricsStore';
import { StatusBadge } from './StatusBadge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X, Activity, Server, Clock, Globe } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

export function ServiceDrawer() {
  const { drawerOpen, closeDrawer, selectedServiceId } = useUIStore();
  const { data: servicesData } = useServices();
  const history = useMetricsStore(s => s.metricsHistory);

  const service = useMemo(() => {
    if (!servicesData || !selectedServiceId) return null;
    return servicesData.data.find(s => s.id === selectedServiceId);
  }, [servicesData, selectedServiceId]);

  const chartData = useMemo(() => {
    if (!selectedServiceId || !history[selectedServiceId]) return [];
    
    return history[selectedServiceId].map(pt => ({
      ...pt,
      timeLabel: `-${Math.round((Date.now() - pt.timestamp) / 1000)}s`
    }));
  }, [history, selectedServiceId]);

  if (!service) return null;

  return (
    <Drawer open={drawerOpen} onOpenChange={(open) => !open && closeDrawer()} direction="right">
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[400px] sm:w-[540px] rounded-none bg-[#0A0F1E] border-l border-[#1F2937]">
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
          
          <DrawerHeader className="border-b border-[#1F2937] px-6 py-4 flex flex-row items-center justify-between sticky top-0 bg-[#0A0F1E] z-10">
            <div className="flex flex-col gap-1 text-left">
              <DrawerTitle className="text-xl font-bold text-white flex items-center gap-3">
                {service.name}
                <StatusBadge status={service.status} />
              </DrawerTitle>
              <span className="text-xs text-gray-400 font-mono">{service.id}</span>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-[#1F2937]">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="p-6 space-y-8 flex-1">
            
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs uppercase font-semibold">Region</span>
                </div>
                <div className="text-lg font-medium text-white">{service.region}</div>
              </div>
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs uppercase font-semibold">Uptime</span>
                </div>
                <div className="text-lg font-medium text-white font-mono">{service.uptime}%</div>
              </div>
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Server className="h-4 w-4" />
                  <span className="text-xs uppercase font-semibold">Latency</span>
                </div>
                <div className="text-lg font-medium text-white font-mono">{service.status === 'down' ? '---' : `${service.latency}ms`}</div>
              </div>
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs uppercase font-semibold">Last Checked</span>
                </div>
                <div className="text-sm font-medium text-white truncate" title={service.lastChecked}>
                  {new Date(service.lastChecked).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="space-y-6">
              
              {/* CPU Chart */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-4">CPU Usage (60s)</h4>
                <div className="h-[200px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="serviceCpu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                        <XAxis dataKey="timeLabel" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} minTickGap={20} />
                        <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB', borderRadius: '6px' }}
                          itemStyle={{ color: '#3B82F6' }} labelStyle={{ color: '#9CA3AF' }}
                          formatter={(v) => [`${v}%`, 'CPU']}
                          isAnimationActive={false}
                        />
                        <Area type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#serviceCpu)" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data yet</div>
                  )}
                </div>
              </div>

              {/* Memory Chart */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-4">Memory Usage (60s)</h4>
                <div className="h-[200px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="serviceMem" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                        <XAxis dataKey="timeLabel" stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} minTickGap={20} />
                        <YAxis stroke="#4B5563" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB', borderRadius: '6px' }}
                          itemStyle={{ color: '#8B5CF6' }} labelStyle={{ color: '#9CA3AF' }}
                          formatter={(v) => [`${v}%`, 'Memory']}
                          isAnimationActive={false}
                        />
                        <Area type="monotone" dataKey="memory" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#serviceMem)" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data yet</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
