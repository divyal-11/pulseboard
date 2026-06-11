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
  
  // Local optimistic state
  const [resolvedOptimistically, setResolvedOptimistically] = useState(false);

  const isResolved = alert.status === 'resolved' || resolvedOptimistically;

  const handleResolve = () => {
    // Optimistic UI update for the Zustand live feed immediately
    resolveLocalAlert(alert.id);
    setResolvedOptimistically(true);
    
    // Fire the actual API mutation
    mutate(alert.id, {
      onError: () => {
        // Simple rollback if needed
        setResolvedOptimistically(false);
      }
    });
  };

  if (isResolved) {
    return (
      <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium px-3 py-1.5">
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
      className="bg-transparent border-[#374151] text-gray-300 hover:text-white hover:bg-[#1F2937] h-8"
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Resolve
    </Button>
  );
}
