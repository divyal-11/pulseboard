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
  error: unknown;
}

export function AlertsTable({ data, isLoading, error }: AlertsTableProps) {
  
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
    return <div className="text-destructive p-4">Error loading alerts.</div>;
  }

  if (data.data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center transition-colors duration-300">
        <h3 className="text-lg font-medium text-foreground mb-1">No alerts found</h3>
        <p className="text-muted-foreground text-sm">Try adjusting your filters to see more results.</p>
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
    <div className="rounded-lg border border-border bg-card overflow-hidden transition-colors duration-300">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium h-12 w-[100px]">Severity</TableHead>
            <TableHead className="text-muted-foreground font-medium h-12 w-[150px]">Service</TableHead>
            <TableHead className="text-muted-foreground font-medium h-12">Issue</TableHead>
            <TableHead className="text-muted-foreground font-medium h-12 w-[120px]">Time</TableHead>
            <TableHead className="text-muted-foreground font-medium h-12 w-[100px]">Status</TableHead>
            <TableHead className="text-muted-foreground font-medium h-12 w-[120px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((alert) => (
            <TableRow 
              key={alert.id}
              className="border-border hover:bg-accent/50 transition-colors"
            >
              <TableCell>
                <AlertBadge severity={alert.severity} />
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {alert.serviceName}
              </TableCell>
              <TableCell>
                <div className="font-medium text-foreground mb-0.5">{alert.title}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[400px]" title={alert.description}>
                  {alert.description.length > 60 ? alert.description.substring(0, 60) + '...' : alert.description}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {getTimeAgo(alert.triggeredAt)}
              </TableCell>
              <TableCell>
                {alert.status === 'active' ? (
                  <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/5 hover:bg-transparent pointer-events-none">Active</Badge>
                ) : (
                  <Badge variant="outline" className="border-muted text-muted-foreground bg-muted/50 hover:bg-transparent pointer-events-none">Resolved</Badge>
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
