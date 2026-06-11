'use client';

import { useState } from 'react';
import { useResolveAlert } from '@/hooks/useAlerts';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Alert } from '@/types';
import { useAlertStore } from '@/store/useAlertStore';

export function ResolveButton({ alert }: { alert: Alert }) {
  const { mutate, isPending } = useResolveAlert();
  const resolveLocalAlert = useAlertStore(s => s.resolveAlert);
  const [resolvedOptimistically, setResolvedOptimistically] = useState(false);

  const isResolved = alert.status === 'resolved' || resolvedOptimistically;

  const handleResolve = () => {
    resolveLocalAlert(alert.id);
    setResolvedOptimistically(true);
    mutate(alert.id, {
      onError: () => { setResolvedOptimistically(false); }
    });
  };

  if (isResolved) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium px-3 py-1.5">
        <CheckCircle2 className="h-4 w-4" />
        Resolved
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleResolve}
      disabled={isPending}
      className="bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-accent h-8"
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Resolve
    </Button>
  );
}
