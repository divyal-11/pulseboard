import { ServiceStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusBadge({ status }: { status: ServiceStatus }) {
  if (status === 'healthy') {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 gap-1.5 px-2.5 py-0.5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Healthy
      </Badge>
    );
  }
  
  if (status === 'degraded') {
    return (
      <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 gap-1.5 px-2.5 py-0.5">
        <AlertCircle className="h-3.5 w-3.5" />
        Degraded
      </Badge>
    );
  }

  return (
    <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 gap-1.5 px-2.5 py-0.5">
      <XCircle className="h-3.5 w-3.5" />
      Down
    </Badge>
  );
}
