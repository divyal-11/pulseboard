'use client';

import { useServices } from '@/hooks/useServices';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AlertFiltersProps {
  severity: string;
  setSeverity: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  serviceId: string;
  setServiceId: (val: string) => void;
}

export function AlertFilters({
  severity, setSeverity,
  status, setStatus,
  serviceId, setServiceId
}: AlertFiltersProps) {
  const { data: servicesData } = useServices();

  return (
    <div className="flex flex-wrap gap-4 items-center bg-card border border-border p-4 rounded-lg mb-6 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Severity</span>
        <Select value={severity} onValueChange={(val) => val && setSeverity(val)}>
          <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Status</span>
        <Select value={status} onValueChange={(val) => val && setStatus(val)}>
          <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Service</span>
        <Select value={serviceId} onValueChange={(val) => val && setServiceId(val)}>
          <SelectTrigger className="w-[200px] bg-background border-border text-foreground">
            <SelectValue placeholder="All Services" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="all">All Services</SelectItem>
            {servicesData?.data.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
