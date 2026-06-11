import { WebSocketServer, WebSocket } from 'ws';
import { generateMetrics, generateAlert } from './dataGenerator';
import { WSMessage } from './types';
import http from 'http';

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

  function broadcast<T>(message: WSMessage<T>) {
    const data = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Broadcast metrics every 1 second
  setInterval(() => {
    broadcast({
      type: 'metrics_update',
      payload: generateMetrics(),
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
