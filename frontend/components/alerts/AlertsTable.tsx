'use client';

import { AlertsResponse } from '@/types';
import { AlertBadge } from './AlertBadge';
import { ResolveButton } from './ResolveButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface AlertsTableProps {
  data: AlertsResponse | undefined;
  isLoading: boolean;
  error: any;
}

export function AlertsTable({ data, isLoading, error }: AlertsTableProps) {
  
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
    return <div className="text-red-400 p-4">Error loading alerts.</div>;
  }

  if (data.data.length === 0) {
    return (
      <div className="bg-[#111827] border border-[#1F2937] rounded-md p-12 text-center">
        <h3 className="text-lg font-medium text-white mb-1">No alerts found</h3>
        <p className="text-gray-400 text-sm">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  const getTimeAgo = (isoString: string) => {
    const diffMins = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (diffMins < 1) return '< 1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="rounded-md border border-[#1F2937] bg-[#111827] overflow-hidden">
      <Table>
        <TableHeader className="bg-[#0A0F1E]">
          <TableRow className="border-[#1F2937] hover:bg-transparent">
            <TableHead className="text-gray-400 font-medium h-12 w-[100px]">Severity</TableHead>
            <TableHead className="text-gray-400 font-medium h-12 w-[150px]">Service</TableHead>
            <TableHead className="text-gray-400 font-medium h-12">Issue</TableHead>
            <TableHead className="text-gray-400 font-medium h-12 w-[120px]">Time</TableHead>
            <TableHead className="text-gray-400 font-medium h-12 w-[100px]">Status</TableHead>
            <TableHead className="text-gray-400 font-medium h-12 w-[120px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((alert) => (
            <TableRow 
              key={alert.id}
              className="border-[#1F2937] hover:bg-[#1F2937]/50 transition-colors"
            >
              <TableCell>
                <AlertBadge severity={alert.severity} />
              </TableCell>
              <TableCell className="font-medium text-white">
                {alert.serviceName}
              </TableCell>
              <TableCell>
                <div className="font-medium text-white mb-0.5">{alert.title}</div>
                <div className="text-xs text-gray-400 truncate max-w-[400px]" title={alert.description}>
                  {alert.description.length > 60 ? alert.description.substring(0, 60) + '...' : alert.description}
                </div>
              </TableCell>
              <TableCell className="text-gray-300 text-sm">
                {getTimeAgo(alert.triggeredAt)}
              </TableCell>
              <TableCell>
                {alert.status === 'active' ? (
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-transparent pointer-events-none">Active</Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-600 text-gray-400 bg-gray-800/50 hover:bg-transparent pointer-events-none">Resolved</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <ResolveButton alert={alert} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
