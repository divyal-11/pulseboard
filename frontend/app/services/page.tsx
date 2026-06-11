'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { ServicesTable } from '@/components/services/ServicesTable';
import { ServiceDrawer } from '@/components/services/ServiceDrawer';
import { useServices } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServicesPage() {
  const { data, isLoading } = useServices();

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header / Summary */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Services Inventory</h2>
          
          {isLoading ? (
            <Skeleton className="h-6 w-64 bg-[#1F2937]" />
          ) : data ? (
            <div className="flex items-center gap-4 text-sm">
              <span className="font-semibold text-gray-300">{data.data.length} Total Services</span>
              <div className="h-4 w-px bg-[#374151]" />
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {data.healthy} Healthy
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  {data.degraded} Degraded
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  {data.down} Down
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Table */}
        <ServicesTable />

        {/* Drawer overlay */}
        <ServiceDrawer />
        
      </div>
    </PageWrapper>
  );
}
