import { WebSocketServer, WebSocket } from 'ws';
import { generateMetrics, generateAlert } from './dataGenerator';
import { WSMessage } from './types';
import http from 'http';

// Global reference for broadcasting from REST API
let activeBroadcast: (<T>(message: WSMessage<T>) => void) | null = null;

export function broadcast<T>(message: WSMessage<T>) {
  if (activeBroadcast) {
    activeBroadcast(message);
  } else {
    console.warn('[WS] Broadcast attempted but WebSocket server is not running.');
  }
}

export function createWsServer(server: http.Server) {
  const wss = new WebSocketServer({ server });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`[WS] Client connected. Total: ${clients.size}`);

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[WS] Client disconnected. Total: ${clients.size}`);
    });

    ws.on('error', () => clients.delete(ws));
  });

  activeBroadcast = <T>(message: WSMessage<T>) => {
    const data = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  // Broadcast metrics every 1 second
  setInterval(async () => {
    broadcast({
      type: 'metrics_update',
      payload: await generateMetrics(),
      timestamp: Date.now(),
    });
  }, 1000);

  // Broadcast a new alert every 10 seconds
  setInterval(() => {
    const alert = generateAlert();
    broadcast({
      type: 'new_alert',
      payload: alert,
      timestamp: Date.now(),
    });
  }, 10000);

  console.log('[WS] WebSocket server attached to HTTP server');
  return wss;
}

