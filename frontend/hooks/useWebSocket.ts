'use client';
import { useEffect, useRef } from 'react';
import { useMetricsStore } from '@/store/useMetricsStore';
import { useAlertStore } from '@/store/useAlertStore';
import { useUIStore } from '@/store/useUIStore';
import { WSMessage, ServiceMetrics, Alert } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000';

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const updateMetrics = useMetricsStore(s => s.updateMetrics);
  const addAlert = useAlertStore(s => s.addAlert);
  const setConnected = useUIStore(s => s.setConnected);

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('[WS] Connected');
        setConnected(true);
      };

      ws.current.onmessage = (event) => {
        const message: WSMessage = JSON.parse(event.data);
        if (message.type === 'metrics_update') {
          updateMetrics(message.payload as ServiceMetrics[]);
        } else if (message.type === 'new_alert') {
          addAlert(message.payload as Alert);
        }
      };

      ws.current.onclose = () => {
        console.log('[WS] Disconnected — reconnecting in 3s...');
        setConnected(false);
        setTimeout(connect, 3000);   // auto-reconnect
      };

      ws.current.onerror = (err) => {
        console.error('[WS] Error:', err);
        ws.current?.close();
      };
    }

    connect();
    return () => {
      ws.current?.close();
      setConnected(false);
    };
  }, [updateMetrics, addAlert, setConnected]);
}
