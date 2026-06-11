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
        <Skeleton className="h-10 w-full bg-[#1F2937]" />
        <Skeleton className="h-16 w-full bg-[#1F2937]" />
        <Skeleton className="h-16 w-full bg-[#1F2937]" />
        <Skeleton className="h-16 w-full bg-[#1F2937]" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-red-400 p-4">Error loading services.</div>;
  }

  return (
    <div className="rounded-md border border-[#1F2937] bg-[#111827] overflow-hidden">
      <Table>
        <TableHeader className="bg-[#0A0F1E]">
          <TableRow className="border-[#1F2937] hover:bg-transparent">
            <TableHead className="text-gray-400 font-medium h-12">Service</TableHead>
            <TableHead className="text-gray-400 font-medium h-12">Status</TableHead>
            <TableHead className="text-gray-400 font-medium h-12">Latency</TableHead>
            <TableHead className="text-gray-400 font-medium h-12">Requests/sec</TableHead>
            <TableHead className="text-gray-400 font-medium h-12">Error Rate</TableHead>
            <TableHead className="text-gray-400 font-medium h-12">Region</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((service) => (
            <TableRow 
              key={service.id}
              onClick={() => openDrawer(service.id)}
              className="border-[#1F2937] hover:bg-[#1F2937]/50 cursor-pointer transition-colors"
            >
              <TableCell className="font-medium text-white">{service.name}</TableCell>
              <TableCell>
                <StatusBadge status={service.status} />
              </TableCell>
              <TableCell className={cn("font-mono", service.latency > 200 ? "text-red-400" : "text-gray-300")}>
                {service.status === 'down' ? '---' : `${service.latency}ms`}
              </TableCell>
              <TableCell className="font-mono text-gray-300">
                {service.requestsPerSec.toLocaleString()}/s
              </TableCell>
              <TableCell className={cn("font-mono", service.errorRate > 5 ? "text-red-400" : "text-gray-300")}>
                {service.errorRate}%
              </TableCell>
              <TableCell className="text-gray-400 text-sm">
                {service.region}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
