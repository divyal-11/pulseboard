import { AlertSeverity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AlertBadge({ severity }: { severity: AlertSeverity }) {
  if (severity === 'critical') {
    return (
      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 px-2.5 py-0.5 pointer-events-none">
        Critical
      </Badge>
    );
  }
  
  if (severity === 'warning') {
    return (
      <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 px-2.5 py-0.5 pointer-events-none">
        Warning
      </Badge>
    );
  }

  return (
    <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 px-2.5 py-0.5 pointer-events-none">
      Info
    </Badge>
  );
}
