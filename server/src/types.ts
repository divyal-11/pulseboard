// ─── Service ────────────────────────────────────────────────────────────────

export type ServiceStatus = 'healthy' | 'degraded' | 'down';

export interface Service {
  id: string;                    // e.g. "auth-service"
  name: string;                  // e.g. "Auth Service"
  status: ServiceStatus;
  uptime: number;                // percentage, e.g. 99.7
  latency: number;               // ms, e.g. 42
  requestsPerSec: number;        // e.g. 340
  errorRate: number;             // percentage, e.g. 0.4
  region: string;                // e.g. "us-east-1"
  lastChecked: string;           // ISO timestamp
}

// ─── Metrics ────────────────────────────────────────────────────────────────

export interface ServiceMetrics {
  serviceId: string;
  cpu: number;                   // 0–100
  memory: number;                // 0–100
  requestsPerSec: number;
  errorRate: number;
  timestamp: number;             // Date.now()
}

export interface MetricDataPoint {
  timestamp: number;
  cpu: number;
  memory: number;
  requestsPerSec: number;
  errorRate: number;
}

// History: last 60 data points per service (60 seconds of data)
export type MetricsHistory = Record<string, MetricDataPoint[]>;

// ─── Alerts ─────────────────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'resolved';

export interface Alert {
  id: string;                    // uuid
  serviceId: string;
  serviceName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;                 // e.g. "High CPU Usage"
  description: string;           // e.g. "CPU exceeded 90% for 3 minutes"
  triggeredAt: string;           // ISO timestamp
  resolvedAt: string | null;
}

// ─── WebSocket Message Types ─────────────────────────────────────────────────

export type WSMessageType = 'metrics_update' | 'new_alert' | 'service_update' | 'ping';

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload: T;
  timestamp: number;
}

// Specific broadcast types
export type MetricsBroadcast = WSMessage<ServiceMetrics[]>;   // every 1s
export type AlertBroadcast = WSMessage<Alert>;                // every 10s
export type ServiceBroadcast = WSMessage<Service[]>;          // every 30s

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface AlertsResponse extends ApiResponse<Alert[]> {
  total: number;
  active: number;
  resolved: number;
}

export interface ServicesResponse extends ApiResponse<Service[]> {
  healthy: number;
  degraded: number;
  down: number;
}
