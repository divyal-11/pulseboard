import { Service, ServiceMetrics, Alert, AlertSeverity, MetricDataPoint } from './types';
import { SERVICES, alerts, metricsHistory } from './store';
import { v4 as uuidv4 } from 'uuid';

const MAX_HISTORY = 60;

// Simulate realistic metric drift — each value walks randomly within bounds
const metricState: Record<string, { cpu: number; memory: number; rps: number; errorRate: number }> = {};

SERVICES.forEach(s => {
  metricState[s.id] = {
    cpu: 20 + Math.random() * 40,
    memory: 30 + Math.random() * 40,
    rps: s.requestsPerSec,
    errorRate: s.errorRate,
  };
});

// Walk a value randomly within [min, max] by at most `step`
function walk(value: number, step: number, min: number, max: number): number {
  const delta = (Math.random() - 0.5) * 2 * step;
  return Math.max(min, Math.min(max, value + delta));
}

export function generateMetrics(): ServiceMetrics[] {
  return SERVICES.map(service => {
    const state = metricState[service.id];

    // Down services have pegged metrics
    if (service.status === 'down') {
      const point: MetricDataPoint = { timestamp: Date.now(), cpu: 0, memory: 0, requestsPerSec: 0, errorRate: 100 };
      const existing = metricsHistory[service.id] ?? [];
      metricsHistory[service.id] = [...existing.slice(-(MAX_HISTORY - 1)), point];
      return { serviceId: service.id, cpu: 0, memory: 0, requestsPerSec: 0, errorRate: 100, timestamp: Date.now() };
    }

    // Degraded services have elevated latency/error rate
    const multiplier = service.status === 'degraded' ? 2 : 1;

    state.cpu       = walk(state.cpu,       3,  5,  95);
    state.memory    = walk(state.memory,    2,  20, 90);
    state.rps       = walk(state.rps,       20, 0,  5000);
    state.errorRate = walk(state.errorRate * multiplier, 0.5, 0, 15);

    metricState[service.id] = state;

    const metrics: ServiceMetrics = {
      serviceId: service.id,
      cpu: Math.round(state.cpu * 10) / 10,
      memory: Math.round(state.memory * 10) / 10,
      requestsPerSec: Math.round(state.rps),
      errorRate: Math.round(state.errorRate * 100) / 100,
      timestamp: Date.now(),
    };

    // Store in history
    const point: MetricDataPoint = {
      timestamp: metrics.timestamp,
      cpu: metrics.cpu,
      memory: metrics.memory,
      requestsPerSec: metrics.requestsPerSec,
      errorRate: metrics.errorRate,
    };
    const existing = metricsHistory[service.id] ?? [];
    metricsHistory[service.id] = [...existing.slice(-(MAX_HISTORY - 1)), point];

    return metrics;
  });
}

const ALERT_TEMPLATES = [
  { title: 'CPU Spike Detected',     description: 'CPU usage exceeded 85% threshold.',             severity: 'warning'  as AlertSeverity },
  { title: 'Memory Pressure',        description: 'Available memory dropped below 15%.',            severity: 'warning'  as AlertSeverity },
  { title: 'Error Rate Elevated',    description: 'Error rate exceeded 5% over 2-minute window.',   severity: 'critical' as AlertSeverity },
  { title: 'Slow Response Times',    description: 'P95 latency exceeded 500ms.',                    severity: 'warning'  as AlertSeverity },
  { title: 'Health Check Failed',    description: 'Service failed 3 consecutive health checks.',    severity: 'critical' as AlertSeverity },
  { title: 'Scheduled Maintenance',  description: 'Planned maintenance window starting in 1 hour.', severity: 'info'     as AlertSeverity },
  { title: 'Auto-scaling Triggered', description: 'New instance provisioned due to high load.',     severity: 'info'     as AlertSeverity },
];

export function generateAlert(): Alert {
  const template = ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)];
  const service  = SERVICES[Math.floor(Math.random() * SERVICES.length)];

  const alert: Alert = {
    id: uuidv4(),
    serviceId: service.id,
    serviceName: service.name,
    severity: template.severity,
    status: 'active',
    title: template.title,
    description: template.description,
    triggeredAt: new Date().toISOString(),
    resolvedAt: null,
  };

  alerts.unshift(alert);            // add to front of in-memory store
  if (alerts.length > 200) alerts.pop(); // cap at 200

  return alert;
}
