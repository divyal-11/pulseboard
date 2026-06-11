import { Service, ServiceMetrics, Alert, AlertSeverity, MetricDataPoint } from './types';
import { SERVICES, alerts, metricsHistory } from './store';
import { v4 as uuidv4 } from 'uuid';
import si from 'systeminformation';

const MAX_HISTORY = 60;

// Simulate realistic metric drift — each value walks randomly within bounds
const metricState: Record<string, { cpu: number; memory: number; rps: number; errorRate: number; latency: number }> = {};

SERVICES.forEach(s => {
  metricState[s.id] = {
    cpu: 20 + Math.random() * 40,
    memory: 30 + Math.random() * 40,
    rps: s.requestsPerSec,
    errorRate: s.errorRate,
    latency: s.latency,
  };
});

// Walk a value randomly within [min, max] by at most `step`
function walk(value: number, step: number, min: number, max: number): number {
  const delta = (Math.random() - 0.5) * 2 * step;
  return Math.max(min, Math.min(max, value + delta));
}

let lastFetchTime = 0;
let cachedMetrics = { cpu: 0, memory: 0 };

export async function getRealMetrics(): Promise<{ cpu: number; memory: number }> {
  const now = Date.now();
  if (now - lastFetchTime < 1000) {
    return cachedMetrics;
  }

  try {
    const [load, memory] = await Promise.all([
      si.currentLoad(),
      si.mem()
    ]);

    const cpu = Math.round(load.currentLoad * 10) / 10;
    const memPct = Math.round(((memory.total - memory.available) / memory.total) * 1000) / 10;

    cachedMetrics = {
      cpu: Math.max(0, Math.min(100, cpu)),
      memory: Math.max(0, Math.min(100, memPct))
    };
    lastFetchTime = now;
  } catch (err) {
    console.error('[Si] Error fetching host metrics:', err);
  }
  return cachedMetrics;
}

export async function generateMetrics(): Promise<ServiceMetrics[]> {
  const realMetrics = await getRealMetrics();

  return SERVICES.map(service => {
    // For Host Machine, use real system stats
    if (service.id === 'host-machine') {
      const point: MetricDataPoint = {
        timestamp: Date.now(),
        cpu: realMetrics.cpu,
        memory: realMetrics.memory,
        requestsPerSec: 0,
        errorRate: 0
      };
      const existing = metricsHistory[service.id] ?? [];
      metricsHistory[service.id] = [...existing.slice(-(MAX_HISTORY - 1)), point];

      service.requestsPerSec = 0;
      service.errorRate = 0;
      service.latency = 0;

      return {
        serviceId: service.id,
        cpu: realMetrics.cpu,
        memory: realMetrics.memory,
        requestsPerSec: 0,
        errorRate: 0,
        timestamp: Date.now(),
      };
    }

    const state = metricState[service.id];

    // Down services have pegged metrics
    if (service.status === 'down') {

      const point: MetricDataPoint = { timestamp: Date.now(), cpu: 0, memory: 0, requestsPerSec: 0, errorRate: 100 };
      const existing = metricsHistory[service.id] ?? [];
      metricsHistory[service.id] = [...existing.slice(-(MAX_HISTORY - 1)), point];
      
      // Update in-memory service object for REST calls
      service.requestsPerSec = 0;
      service.errorRate = 100;
      service.latency = 999;
      
      return { serviceId: service.id, cpu: 0, memory: 0, requestsPerSec: 0, errorRate: 100, timestamp: Date.now() };
    }

    // Degraded services have errorRate multiplied by 3 and latency multiplied by 5
    const errorMultiplier = service.status === 'degraded' ? 3 : 1;
    const latencyMultiplier = service.status === 'degraded' ? 5 : 1;

    state.cpu       = walk(state.cpu,       3,  5,  95);
    state.memory    = walk(state.memory,    2,  20, 90);
    state.rps       = walk(state.rps,       20, 0,  5000);
    state.errorRate = walk(state.errorRate, 0.5, 0, 15);
    state.latency   = walk(state.latency,   2,  5,  150);

    metricState[service.id] = state;

    const finalErrorRate = Math.round(state.errorRate * errorMultiplier * 100) / 100;
    const finalLatency = Math.round(state.latency * latencyMultiplier);

    const metrics: ServiceMetrics = {
      serviceId: service.id,
      cpu: Math.round(state.cpu * 10) / 10,
      memory: Math.round(state.memory * 10) / 10,
      requestsPerSec: Math.round(state.rps),
      errorRate: Math.min(100, finalErrorRate),
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

    // Update in-memory service object for REST API sync
    service.requestsPerSec = metrics.requestsPerSec;
    service.errorRate = metrics.errorRate;
    service.latency = finalLatency;

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

export function generateAlertForService(
  serviceId: string,
  severity: AlertSeverity,
  title: string,
  description: string
): Alert {
  const service = SERVICES.find(s => s.id === serviceId);
  const serviceName = service ? service.name : 'Unknown Service';

  const alert: Alert = {
    id: uuidv4(),
    serviceId,
    serviceName,
    severity,
    status: 'active',
    title,
    description,
    triggeredAt: new Date().toISOString(),
    resolvedAt: null,
  };

  alerts.unshift(alert);
  if (alerts.length > 200) alerts.pop();

  return alert;
}

