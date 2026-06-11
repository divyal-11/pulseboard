'use client';

import { useServices } from '@/hooks/useServices';
import { useUIStore } from '@/store/useUIStore';
import { StatusBadge } from './StatusBadge';
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function ServicesTable() {
  const { data, isLoading, error } = useServices();
  const openDrawer = useUIStore(s => s.openServiceDrawer);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-destructive p-4">Error loading services.</div>;
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden transition-colors duration-300">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium h-12">Service</TableHead>
            <TableHead className="text-muted-foreground font-medium h-12">Status</TableHead>
            <TableHead className="text-muted-foreground font-medium h-12">Latency</TableHead>
            <TableHead className="text-muted-foreground font-medium h-12">Requests/sec</TableHead>
            <TableHead className="text-muted-foreground font-medium h-12">Error Rate</TableHead>
            <TableHead className="text-muted-foreground font-medium h-12">Region</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((service) => (
            <TableRow 
              key={service.id}
              onClick={() => openDrawer(service.id)}
              className="border-border hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <TableCell className="font-medium text-foreground">{service.name}</TableCell>
              <TableCell>
                <StatusBadge status={service.status} />
              </TableCell>
              <TableCell className={cn("font-mono", service.latency > 200 ? "text-red-500" : "text-muted-foreground")}>
                {service.status === 'down' ? '---' : `${service.latency}ms`}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {service.requestsPerSec.toLocaleString()}/s
              </TableCell>
              <TableCell className={cn("font-mono", service.errorRate > 5 ? "text-red-500" : "text-muted-foreground")}>
                {service.errorRate}%
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {service.region}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
