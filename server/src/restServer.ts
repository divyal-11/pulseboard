import express from 'express';
import cors from 'cors';
import { SERVICES, alerts, metricsHistory } from './store';
import { generateAlertForService, getRealMetrics } from './dataGenerator';
import { broadcast } from './wsServer';



export function createRestServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // ─── Health Check ──────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // ─── Services ──────────────────────────────────────────────────────────────
  app.get('/api/services', (_req, res) => {
    const healthy  = SERVICES.filter(s => s.status === 'healthy').length;
    const degraded = SERVICES.filter(s => s.status === 'degraded').length;
    const down     = SERVICES.filter(s => s.status === 'down').length;

    res.json({
      data: SERVICES,
      success: true,
      healthy,
      degraded,
      down,
    });
  });

  app.get('/api/services/:id', (req, res) => {
    const service = SERVICES.find(s => s.id === req.params.id);
    if (!service) {
      res.status(404).json({ data: null, success: false, message: 'Service not found' });
      return;
    }
    res.json({ data: service, success: true });
  });

  app.post('/api/services/:id/chaos', (req, res) => {
    const { mode } = req.body as { mode: 'down' | 'degraded' | 'healthy' };
    const service = SERVICES.find(s => s.id === req.params.id);
    if (!service) {
      res.status(404).json({ data: null, success: false, message: 'Service not found' });
      return;
    }

    service.status = mode;

    if (mode === 'down' || mode === 'degraded') {
      const severity = mode === 'down' ? 'critical' : 'warning';
      const title = mode === 'down' ? 'Chaos Outage Triggered' : 'Chaos Performance Degradation';
      const description = mode === 'down'
        ? `Service ${service.name} was manually forced DOWN via Chaos Controls.`
        : `Service ${service.name} was forced into DEGRADED state via Chaos Controls.`;

      const alert = generateAlertForService(service.id, severity, title, description);

      broadcast({
        type: 'new_alert',
        payload: alert,
        timestamp: Date.now(),
      });
    }

    res.json({ data: service, success: true });
  });


  // ─── Alerts ────────────────────────────────────────────────────────────────
  app.get('/api/alerts', (req, res) => {
    let filtered = [...alerts];

    // Filter by severity
    const severity = req.query.severity as string | undefined;
    if (severity) {
      filtered = filtered.filter(a => a.severity === severity);
    }

    // Filter by status
    const status = req.query.status as string | undefined;
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    // Filter by serviceId
    const serviceId = req.query.serviceId as string | undefined;
    if (serviceId) {
      filtered = filtered.filter(a => a.serviceId === serviceId);
    }

    const total    = filtered.length;
    const active   = filtered.filter(a => a.status === 'active').length;
    const resolved = filtered.filter(a => a.status === 'resolved').length;

    // Pagination
    const limit  = parseInt(req.query.limit as string)  || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const paginated = filtered.slice(offset, offset + limit);

    res.json({
      data: paginated,
      success: true,
      total,
      active,
      resolved,
    });
  });

  app.put('/api/alerts/:id/resolve', (req, res) => {
    const alert = alerts.find(a => a.id === req.params.id);
    if (!alert) {
      res.status(404).json({ data: null, success: false, message: 'Alert not found' });
      return;
    }
    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    res.json({ data: alert, success: true, message: 'Alert resolved' });
  });

  // ─── Metrics History ───────────────────────────────────────────────────────
  app.get('/api/metrics/history/:serviceId', (req, res) => {
    const serviceId = req.params.serviceId;
    const history = metricsHistory[serviceId] ?? [];
    res.json({ data: history, success: true });
  });

  app.get('/api/host', async (_req, res) => {
    try {
      const stats = await getRealMetrics();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch host metrics' });
    }
  });

  return app;
}

