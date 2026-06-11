import { Service, Alert } from './types';

// Initial services — fake but realistic
export const SERVICES: Service[] = [
  { id: 'auth-service',     name: 'Auth Service',      status: 'healthy',  uptime: 99.97, latency: 34,  requestsPerSec: 420,  errorRate: 0.1,  region: 'us-east-1',  lastChecked: new Date().toISOString() },
  { id: 'api-gateway',      name: 'API Gateway',       status: 'healthy',  uptime: 99.91, latency: 12,  requestsPerSec: 1240, errorRate: 0.2,  region: 'us-east-1',  lastChecked: new Date().toISOString() },
  { id: 'user-service',     name: 'User Service',      status: 'degraded', uptime: 97.40, latency: 210, requestsPerSec: 88,   errorRate: 3.4,  region: 'eu-west-1',  lastChecked: new Date().toISOString() },
  { id: 'payment-service',  name: 'Payment Service',   status: 'healthy',  uptime: 99.99, latency: 67,  requestsPerSec: 55,   errorRate: 0.0,  region: 'us-east-1',  lastChecked: new Date().toISOString() },
  { id: 'notification-svc', name: 'Notification Svc',  status: 'healthy',  uptime: 98.80, latency: 89,  requestsPerSec: 320,  errorRate: 0.8,  region: 'ap-south-1', lastChecked: new Date().toISOString() },
  { id: 'db-primary',       name: 'DB Primary',        status: 'healthy',  uptime: 99.99, latency: 4,   requestsPerSec: 2100, errorRate: 0.0,  region: 'us-east-1',  lastChecked: new Date().toISOString() },
  { id: 'cache-service',    name: 'Cache Service',     status: 'down',     uptime: 91.20, latency: 999, requestsPerSec: 0,    errorRate: 100,  region: 'us-east-1',  lastChecked: new Date().toISOString() },
  { id: 'search-service',   name: 'Search Service',    status: 'healthy',  uptime: 99.50, latency: 45,  requestsPerSec: 670,  errorRate: 0.3,  region: 'eu-west-1',  lastChecked: new Date().toISOString() },
];

// Seed alerts
export let alerts: Alert[] = [
  { id: 'a1', serviceId: 'cache-service',  serviceName: 'Cache Service', severity: 'critical', status: 'active',   title: 'Service Down',        description: 'Cache service is not responding to health checks.',    triggeredAt: new Date(Date.now() - 300000).toISOString(),  resolvedAt: null },
  { id: 'a2', serviceId: 'user-service',   serviceName: 'User Service',  severity: 'warning',  status: 'active',   title: 'High Latency',        description: 'P99 latency exceeded 200ms for more than 5 minutes.', triggeredAt: new Date(Date.now() - 600000).toISOString(),  resolvedAt: null },
  { id: 'a3', serviceId: 'api-gateway',    serviceName: 'API Gateway',   severity: 'info',     status: 'resolved', title: 'Deployment Complete', description: 'v2.4.1 deployed successfully to us-east-1.',          triggeredAt: new Date(Date.now() - 1800000).toISOString(), resolvedAt: new Date(Date.now() - 1700000).toISOString() },
];

// In-memory metrics history store (last 60 data points per service)
import { MetricDataPoint } from './types';
export const metricsHistory: Record<string, MetricDataPoint[]> = {};
