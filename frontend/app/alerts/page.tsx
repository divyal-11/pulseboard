'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AlertFilters } from '@/components/alerts/AlertFilters';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import { useAlerts } from '@/hooks/useAlerts';
import { Skeleton } from '@/components/ui/skeleton';

export default function AlertsPage() {
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [serviceId, setServiceId] = useState('all');

  const { data, isLoading, error } = useAlerts({
    severity: severity === 'all' ? undefined : severity,
    status: status === 'all' ? undefined : status,
  });

  const filteredData = data ? {
    ...data,
    data: serviceId === 'all' ? data.data : data.data.filter(a => a.serviceId === serviceId)
  } : undefined;

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Alerts</h2>
              {data && data.active > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {data.active}
                </span>
              )}
            </div>
            
            {isLoading ? (
              <Skeleton className="h-5 w-64" />
            ) : data ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{data.total} Total</span>
                <span>•</span>
                <span className="text-red-500 font-medium">{data.active} Active</span>
                <span>•</span>
                <span className="text-emerald-500 font-medium">{data.resolved} Resolved</span>
              </div>
            ) : null}
          </div>
        </div>

        <AlertFilters 
          severity={severity} setSeverity={setSeverity}
          status={status} setStatus={setStatus}
          serviceId={serviceId} setServiceId={setServiceId}
        />

        <AlertsTable 
          data={filteredData} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
    </PageWrapper>
  );
}
