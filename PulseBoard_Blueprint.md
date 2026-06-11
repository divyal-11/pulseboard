# PulseBoard — Live Infrastructure Metrics Dashboard
## Complete Project Blueprint & Implementation Plan

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Folder Structure](#4-folder-structure)
5. [Data Schema & Types](#5-data-schema--types)
6. [WebSocket Server — Full Spec](#6-websocket-server--full-spec)
7. [API Routes](#7-api-routes)
8. [State Management — Zustand Stores](#8-state-management--zustand-stores)
9. [TanStack Query Setup](#9-tanstack-query-setup)
10. [Pages & Components](#10-pages--components)
11. [UI Design System](#11-ui-design-system)
12. [Docker & Deployment](#12-docker--deployment)
13. [Day-by-Day Implementation Plan](#13-day-by-day-implementation-plan)
14. [Resume Bullet Points](#14-resume-bullet-points)

---

## 1. Project Overview

**PulseBoard** is a real-time infrastructure monitoring dashboard that visualises live server health metrics — CPU usage, memory consumption, request throughput, error rates, and service status — streamed continuously via WebSocket. It mirrors the kind of internal tooling used by DevOps/SRE teams at companies like Infravox AI, Datadog, and Grafana.

### Core Value Proposition
- Engineers can monitor all services from a single pane of glass
- Alerts surface instantly without page refresh
- Historical trends visible via time-series charts
- Service drill-down for root cause investigation

### What makes it impressive on a resume
- Real-time WebSocket data pipeline, not static mock data
- TanStack Query for server-state + Zustand for client-state (both required by Infravox JD)
- Recharts with live-updating time-series charts
- Full Docker Compose setup with two services
- Deployed live with a real WebSocket server on Render

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14 (App Router) | Framework, SSR, routing |
| TypeScript | 5.x | Type safety across codebase |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | latest | Component library (cards, badges, tables, drawers, dialogs) |
| Recharts | 2.x | Line charts, area charts, bar charts |
| Zustand | 4.x | Global client state (alerts, selected service, sidebar) |
| TanStack Query | 5.x | Server state, caching, background refetching |
| Axios | 1.x | HTTP client for REST API calls |

### Backend (WebSocket Server)
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x | Runtime |
| ws | 8.x | WebSocket server |
| Express | 4.x | REST endpoints for alerts CRUD |
| cors | 2.x | Cross-origin requests |

### DevOps
| Technology | Purpose |
|---|---|
| Docker | Containerise both services |
| Docker Compose | Orchestrate frontend + ws-server |
| Vercel | Deploy frontend |
| Render | Deploy WebSocket server |

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                          │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │   Zustand   │  │ TanStack     │  │   Recharts            │  │
│  │   Store     │  │ Query Cache  │  │   (Live Charts)       │  │
│  │             │  │              │  │                       │  │
│  │ - alerts[]  │  │ - /alerts    │  │ - CPU area chart      │  │
│  │ - services[]│  │ - /services  │  │ - Memory line chart   │  │
│  │ - metrics{} │  │   (5s refetch│  │ - Request bar chart   │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────────────────┘  │
│         │                │                                        │
│         └────────────────┴──────────────────────────────────┐   │
│                                                               │   │
│  ┌────────────────────────────────────────────────────────┐  │   │
│  │              Next.js App Router (Port 3000)            │  │   │
│  │                                                        │  │   │
│  │  /dashboard     /services      /alerts     /settings  │  │   │
│  └────────────────────────────────────────────────────────┘  │   │
└──────────────────────────────┬────────────────────────────────┘
                                │
               ┌────────────────┴─────────────────┐
               │                                  │
               │ WebSocket (ws://)                │ HTTP REST (axios)
               │ Live metrics every 1s            │ Alerts CRUD
               │ Alerts every 10s                 │ Services list
               ▼                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                  Node.js Server (Port 4000)                   │
│                                                              │
│  ┌─────────────────────┐    ┌──────────────────────────────┐ │
│  │   WebSocket Server  │    │      Express REST API        │ │
│  │   (ws library)      │    │                              │ │
│  │                     │    │  GET  /api/alerts            │ │
│  │  Broadcasts every 1s│    │  GET  /api/services          │ │
│  │  - CPU per service  │    │  PUT  /api/alerts/:id/resolve│ │
│  │  - Memory           │    │  GET  /api/health            │ │
│  │  - Request rate     │    │                              │ │
│  │  - Error rate       │    └──────────────────────────────┘ │
│  │                     │                                      │
│  │  Broadcasts every 10s                                      │
│  │  - New random alert │                                      │
│  └─────────────────────┘                                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              In-Memory Data Store                    │   │
│  │  services[]  alerts[]  metricsHistory{}              │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow Explanation

1. Browser opens WebSocket connection to Node.js server on mount
2. Server broadcasts `MetricsBroadcast` every 1 second to all connected clients
3. Server broadcasts `AlertBroadcast` every 10 seconds (random new alert)
4. Zustand `useMetricsStore` receives WebSocket messages and updates global state
5. Recharts components subscribe to Zustand and re-render with new data points
6. TanStack Query polls `GET /api/alerts` every 5 seconds for alerts list
7. TanStack Query polls `GET /api/services` every 10 seconds for service health
8. User resolves an alert → `PUT /api/alerts/:id/resolve` → TanStack Query invalidates cache → UI updates

---

## 4. Folder Structure

```
pulseboard/
├── frontend/                          # Next.js 14 App
│   ├── app/
│   │   ├── layout.tsx                 # Root layout, providers, sidebar
│   │   ├── page.tsx                   # Redirect to /dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Overview dashboard
│   │   ├── services/
│   │   │   ├── page.tsx               # Services list page
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Service detail page (SSR)
│   │   ├── alerts/
│   │   │   └── page.tsx               # Alerts management page
│   │   └── settings/
│   │       └── page.tsx               # Settings page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   │   ├── TopBar.tsx             # Header with theme toggle + alert bell
│   │   │   └── PageWrapper.tsx        # Consistent page padding/layout
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx           # CPU/Memory/Uptime/Alert count cards
│   │   │   ├── CpuChart.tsx           # Live area chart — CPU over 60s
│   │   │   ├── MemoryChart.tsx        # Live line chart — Memory over 60s
│   │   │   ├── RequestRateChart.tsx   # Live bar chart — Requests/sec
│   │   │   └── LiveAlertFeed.tsx      # Scrolling live alert ticker
│   │   │
│   │   ├── services/
│   │   │   ├── ServicesTable.tsx      # Full services table with status
│   │   │   ├── ServiceRow.tsx         # Single row with status badge
│   │   │   ├── ServiceDrawer.tsx      # Slide-out detail panel (shadcn Drawer)
│   │   │   └── ServiceMetricsChart.tsx# Per-service metric charts in drawer
│   │   │
│   │   ├── alerts/
│   │   │   ├── AlertsTable.tsx        # Full alerts list with filters
│   │   │   ├── AlertFilters.tsx       # Severity + status filter bar
│   │   │   ├── AlertBadge.tsx         # Severity colour badge
│   │   │   └── ResolveButton.tsx      # Resolve action with optimistic update
│   │   │
│   │   └── ui/                        # shadcn/ui generated components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── drawer.tsx
│   │       ├── table.tsx
│   │       ├── select.tsx
│   │       └── skeleton.tsx
│   │
│   ├── hooks/
│   │   ├── useWebSocket.ts            # WebSocket connection hook
│   │   ├── useAlerts.ts               # TanStack Query — alerts
│   │   └── useServices.ts             # TanStack Query — services
│   │
│   ├── store/
│   │   ├── useMetricsStore.ts         # Zustand — live metrics + history
│   │   ├── useAlertStore.ts           # Zustand — active alerts, unread count
│   │   └── useUIStore.ts              # Zustand — sidebar open, theme, drawer
│   │
│   ├── lib/
│   │   ├── axios.ts                   # Axios instance with base URL
│   │   ├── queryClient.ts             # TanStack Query client config
│   │   └── utils.ts                   # cn() helper, formatters
│   │
│   ├── types/
│   │   └── index.ts                   # All shared TypeScript interfaces
│   │
│   ├── public/
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── server/                            # Node.js WebSocket + REST server
│   ├── src/
│   │   ├── index.ts                   # Entry point
│   │   ├── wsServer.ts                # WebSocket server logic
│   │   ├── restServer.ts              # Express REST API
│   │   ├── dataGenerator.ts           # Fake metrics + alerts generator
│   │   ├── store.ts                   # In-memory data store
│   │   └── types.ts                   # Shared types (mirrored from frontend)
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml                 # Orchestrates both services
└── README.md
```

---

## 5. Data Schema & Types

All types live in `frontend/types/index.ts` and are mirrored in `server/src/types.ts`.

```typescript
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
```

---

## 6. WebSocket Server — Full Spec

### `server/src/store.ts` — In-Memory Data Store

```typescript
import { Service, Alert, MetricDataPoint } from './types';

// Initial services — fake but realistic
export const SERVICES: Service[] = [
  { id: 'auth-service',     name: 'Auth Service',      status: 'healthy',  uptime: 99.97, latency: 34,  requestsPerSec: 420, errorRate: 0.1, region: 'us-east-1', lastChecked: new Date().toISOString() },
  { id: 'api-gateway',      name: 'API Gateway',       status: 'healthy',  uptime: 99.91, latency: 12,  requestsPerSec: 1240, errorRate: 0.2, region: 'us-east-1', lastChecked: new Date().toISOString() },
  { id: 'user-service',     name: 'User Service',      status: 'degraded', uptime: 97.40, latency: 210, requestsPerSec: 88,  errorRate: 3.4, region: 'eu-west-1', lastChecked: new Date().toISOString() },
  { id: 'payment-service',  name: 'Payment Service',   status: 'healthy',  uptime: 99.99, latency: 67,  requestsPerSec: 55,  errorRate: 0.0, region: 'us-east-1', lastChecked: new Date().toISOString() },
  { id: 'notification-svc', name: 'Notification Svc',  status: 'healthy',  uptime: 98.80, latency: 89,  requestsPerSec: 320, errorRate: 0.8, region: 'ap-south-1',lastChecked: new Date().toISOString() },
  { id: 'db-primary',       name: 'DB Primary',        status: 'healthy',  uptime: 99.99, latency: 4,   requestsPerSec: 2100, errorRate: 0.0, region: 'us-east-1', lastChecked: new Date().toISOString() },
  { id: 'cache-service',    name: 'Cache Service',     status: 'down',     uptime: 91.20, latency: 999, requestsPerSec: 0,   errorRate: 100, region: 'us-east-1', lastChecked: new Date().toISOString() },
  { id: 'search-service',   name: 'Search Service',    status: 'healthy',  uptime: 99.50, latency: 45,  requestsPerSec: 670, errorRate: 0.3, region: 'eu-west-1', lastChecked: new Date().toISOString() },
];

// Seed alerts
export let alerts: Alert[] = [
  { id: 'a1', serviceId: 'cache-service',    serviceName: 'Cache Service',   severity: 'critical', status: 'active',   title: 'Service Down',         description: 'Cache service is not responding to health checks.',      triggeredAt: new Date(Date.now() - 300000).toISOString(), resolvedAt: null },
  { id: 'a2', serviceId: 'user-service',     serviceName: 'User Service',    severity: 'warning',  status: 'active',   title: 'High Latency',         description: 'P99 latency exceeded 200ms for more than 5 minutes.',    triggeredAt: new Date(Date.now() - 600000).toISOString(), resolvedAt: null },
  { id: 'a3', serviceId: 'api-gateway',      serviceName: 'API Gateway',     severity: 'info',     status: 'resolved', title: 'Deployment Complete',  description: 'v2.4.1 deployed successfully to us-east-1.',             triggeredAt: new Date(Date.now() - 1800000).toISOString(), resolvedAt: new Date(Date.now() - 1700000).toISOString() },
];
```

### `server/src/dataGenerator.ts` — Fake Data Generator

```typescript
import { Service, ServiceMetrics, Alert, AlertSeverity } from './types';
import { SERVICES, alerts } from './store';
import { v4 as uuidv4 } from 'uuid';

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
      return { serviceId: service.id, cpu: 0, memory: 0, requestsPerSec: 0, errorRate: 100, timestamp: Date.now() };
    }

    // Degraded services have elevated latency/error rate
    const multiplier = service.status === 'degraded' ? 2 : 1;

    state.cpu       = walk(state.cpu,       3,  5,  95);
    state.memory    = walk(state.memory,    2,  20, 90);
    state.rps       = walk(state.rps,       20, 0,  5000);
    state.errorRate = walk(state.errorRate * multiplier, 0.5, 0, 15);

    metricState[service.id] = state;

    return {
      serviceId: service.id,
      cpu: Math.round(state.cpu * 10) / 10,
      memory: Math.round(state.memory * 10) / 10,
      requestsPerSec: Math.round(state.rps),
      errorRate: Math.round(state.errorRate * 100) / 100,
      timestamp: Date.now(),
    };
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
  const service   = SERVICES[Math.floor(Math.random() * SERVICES.length)];

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

  alerts.unshift(alert);          // add to front of in-memory store
  if (alerts.length > 200) alerts.pop(); // cap at 200

  return alert;
}
```

### `server/src/wsServer.ts` — WebSocket Broadcast Logic

```typescript
import { WebSocketServer, WebSocket } from 'ws';
import { generateMetrics, generateAlert } from './dataGenerator';
import { WSMessage } from './types';

export function createWsServer(port: number) {
  const wss = new WebSocketServer({ port });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`Client connected. Total: ${clients.size}`);

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`Client disconnected. Total: ${clients.size}`);
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

  console.log(`WebSocket server running on ws://localhost:${port}`);
  return wss;
}
```

---

## 7. API Routes

### REST API — `server/src/restServer.ts`

| Method | Route | Description | Response |
|---|---|---|---|
| GET | `/api/health` | Health check | `{ status: 'ok', uptime: number }` |
| GET | `/api/services` | All services with current status | `ServicesResponse` |
| GET | `/api/services/:id` | Single service detail | `ApiResponse<Service>` |
| GET | `/api/alerts` | All alerts, optional filters | `AlertsResponse` |
| GET | `/api/alerts?severity=critical` | Filtered alerts | `AlertsResponse` |
| GET | `/api/alerts?status=active` | Active alerts only | `AlertsResponse` |
| PUT | `/api/alerts/:id/resolve` | Mark alert as resolved | `ApiResponse<Alert>` |
| GET | `/api/metrics/history/:serviceId` | Last 60 data points for a service | `ApiResponse<MetricDataPoint[]>` |

### Query Parameters for `/api/alerts`

| Param | Values | Default |
|---|---|---|
| `severity` | `critical`, `warning`, `info` | all |
| `status` | `active`, `resolved` | all |
| `serviceId` | any service id | all |
| `limit` | number | 50 |
| `offset` | number | 0 |

---

## 8. State Management — Zustand Stores

### `store/useMetricsStore.ts` — Live Metrics

```typescript
import { create } from 'zustand';
import { ServiceMetrics, MetricDataPoint, MetricsHistory } from '@/types';

const MAX_HISTORY = 60; // 60 seconds of data points

interface MetricsStore {
  // Current snapshot — latest metrics per service
  currentMetrics: Record<string, ServiceMetrics>;

  // Rolling 60s history per service — for charts
  metricsHistory: MetricsHistory;

  // Aggregate stats for stat cards
  avgCpu: number;
  avgMemory: number;
  totalRequestsPerSec: number;
  totalErrorRate: number;

  // Actions
  updateMetrics: (metrics: ServiceMetrics[]) => void;
  resetMetrics: () => void;
}

export const useMetricsStore = create<MetricsStore>((set, get) => ({
  currentMetrics: {},
  metricsHistory: {},
  avgCpu: 0,
  avgMemory: 0,
  totalRequestsPerSec: 0,
  totalErrorRate: 0,

  updateMetrics: (metrics) => {
    const current = { ...get().currentMetrics };
    const history = { ...get().metricsHistory };

    metrics.forEach(m => {
      current[m.serviceId] = m;

      // Append to history, cap at MAX_HISTORY
      const existing = history[m.serviceId] ?? [];
      const point: MetricDataPoint = {
        timestamp: m.timestamp,
        cpu: m.cpu,
        memory: m.memory,
        requestsPerSec: m.requestsPerSec,
        errorRate: m.errorRate,
      };
      history[m.serviceId] = [...existing.slice(-(MAX_HISTORY - 1)), point];
    });

    // Recalculate aggregates
    const values = Object.values(current);
    const avgCpu = values.reduce((s, m) => s + m.cpu, 0) / values.length;
    const avgMemory = values.reduce((s, m) => s + m.memory, 0) / values.length;
    const totalRps = values.reduce((s, m) => s + m.requestsPerSec, 0);
    const avgError = values.reduce((s, m) => s + m.errorRate, 0) / values.length;

    set({
      currentMetrics: current,
      metricsHistory: history,
      avgCpu: Math.round(avgCpu * 10) / 10,
      avgMemory: Math.round(avgMemory * 10) / 10,
      totalRequestsPerSec: Math.round(totalRps),
      totalErrorRate: Math.round(avgError * 100) / 100,
    });
  },

  resetMetrics: () => set({ currentMetrics: {}, metricsHistory: {} }),
}));
```

### `store/useAlertStore.ts` — Alert State

```typescript
import { create } from 'zustand';
import { Alert } from '@/types';

interface AlertStore {
  liveAlerts: Alert[];         // alerts received via WebSocket
  unreadCount: number;         // badge on bell icon
  addAlert: (alert: Alert) => void;
  markAllRead: () => void;
  resolveAlert: (id: string) => void;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  liveAlerts: [],
  unreadCount: 0,

  addAlert: (alert) => set(state => ({
    liveAlerts: [alert, ...state.liveAlerts].slice(0, 50),
    unreadCount: state.unreadCount + 1,
  })),

  markAllRead: () => set({ unreadCount: 0 }),

  resolveAlert: (id) => set(state => ({
    liveAlerts: state.liveAlerts.map(a =>
      a.id === id ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() } : a
    ),
  })),
}));
```

### `store/useUIStore.ts` — UI State

```typescript
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  selectedServiceId: string | null;
  drawerOpen: boolean;
  theme: 'dark' | 'light';

  toggleSidebar: () => void;
  openServiceDrawer: (serviceId: string) => void;
  closeDrawer: () => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  selectedServiceId: null,
  drawerOpen: false,
  theme: 'dark',

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  openServiceDrawer: (serviceId) => set({ selectedServiceId: serviceId, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false, selectedServiceId: null }),
  toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
```

---

## 9. TanStack Query Setup

### `lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,       // data fresh for 5s
      refetchInterval: 5 * 1000, // background refetch every 5s
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});
```

### `hooks/useAlerts.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { AlertsResponse, ApiResponse, Alert } from '@/types';

export function useAlerts(filters?: { severity?: string; status?: string }) {
  return useQuery<AlertsResponse>({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.severity) params.set('severity', filters.severity);
      if (filters?.status)   params.set('status', filters.status);
      const { data } = await axios.get(`/api/alerts?${params}`);
      return data;
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await axios.put<ApiResponse<Alert>>(`/api/alerts/${alertId}/resolve`);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch alerts
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
```

### `hooks/useServices.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { ServicesResponse } from '@/types';

export function useServices() {
  return useQuery<ServicesResponse>({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await axios.get('/api/services');
      return data;
    },
    refetchInterval: 10 * 1000,
  });
}
```

### `hooks/useWebSocket.ts`

```typescript
'use client';
import { useEffect, useRef } from 'react';
import { useMetricsStore } from '@/store/useMetricsStore';
import { useAlertStore } from '@/store/useAlertStore';
import { WSMessage, ServiceMetrics, Alert } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000';

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const updateMetrics = useMetricsStore(s => s.updateMetrics);
  const addAlert = useAlertStore(s => s.addAlert);

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => console.log('[WS] Connected');

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
        setTimeout(connect, 3000);   // auto-reconnect
      };

      ws.current.onerror = (err) => {
        console.error('[WS] Error:', err);
        ws.current?.close();
      };
    }

    connect();
    return () => ws.current?.close();
  }, []);
}
```

---

## 10. Pages & Components

### Dashboard Page — `app/dashboard/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Overview                          Last updated: 2s ago  │
├──────────────┬──────────────┬──────────────┬────────────┤
│  Avg CPU     │  Avg Memory  │  Total RPS   │  Active    │
│  67.3%       │  52.1%       │  4,893/s     │  Alerts: 3 │
│  [sparkline] │  [sparkline] │  [sparkline] │  ⚠ 2 crit  │
├──────────────┴──────────────┴──────────────┴────────────┤
│                                                          │
│  CPU Usage (60s)              Memory Usage (60s)         │
│  [Area Chart — Recharts]      [Line Chart — Recharts]    │
│                                                          │
├──────────────────────────────┬──────────────────────────┤
│  Request Rate (60s)          │  Live Alert Feed         │
│  [Bar Chart — Recharts]      │  ● CRIT cache-service    │
│                              │    Service Down  2m ago  │
│                              │  ● WARN user-service     │
│                              │    High Latency  5m ago  │
└──────────────────────────────┴──────────────────────────┘
```

**Key components:**
- `StatCard` — displays a metric with a small 10-point sparkline (Recharts `AreaChart` without axes)
- `CpuChart` — full Recharts `AreaChart` with gradient fill, 60 data points, X-axis shows relative time (-60s to now)
- `LiveAlertFeed` — subscribes to `useAlertStore`, renders last 10 alerts with severity colour coding, auto-scrolls on new alert

### Services Page — `app/services/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Services (8)       ● 5 healthy  ⚠ 1 degraded  ✗ 1 down │
├────────────┬────────┬──────────┬────────┬───────────────┤
│  Service   │ Status │ Latency  │ RPS    │  Error Rate   │
├────────────┼────────┼──────────┼────────┼───────────────┤
│  Auth Svc  │ ● OK   │  34ms    │  420/s │  0.1%         │
│  API GW    │ ● OK   │  12ms    │ 1240/s │  0.2%         │
│  User Svc  │ ⚠ DEG  │ 210ms    │   88/s │  3.4%   ←red  │
│  Cache Svc │ ✗ DOWN │  ---     │    0/s │  100%   ←red  │
└────────────┴────────┴──────────┴────────┴───────────────┘
```

Click any row → `ServiceDrawer` slides in from right showing:
- Service metadata (region, last checked, uptime %)
- Per-service CPU + Memory charts (60s history from Zustand)
- Recent alerts for this service

### Alerts Page — `app/alerts/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Alerts                                                  │
│  Filter: [All Severity ▾]  [All Status ▾]  [Service ▾]  │
├─────┬─────────────┬──────────────┬───────────┬──────────┤
│ SEV │ Service     │ Title        │ Time      │ Action   │
├─────┼─────────────┼──────────────┼───────────┼──────────┤
│ 🔴  │ Cache Svc   │ Service Down │ 5m ago    │ Resolve  │
│ 🟡  │ User Svc    │ High Latency │ 10m ago   │ Resolve  │
│ 🟢  │ API GW      │ Deployment.. │ 30m ago   │ Resolved │
└─────┴─────────────┴──────────────┴───────────┴──────────┘
```

Resolve button → `useResolveAlert` mutation → optimistic update → TanStack Query invalidates cache.

---

## 11. UI Design System

### Colour Palette (Dark Mode Default)

```css
/* Background layers */
--bg-base:      #0A0F1E;   /* page background — deep navy */
--bg-surface:   #111827;   /* cards and panels */
--bg-elevated:  #1F2937;   /* table rows, inputs */
--bg-hover:     #374151;   /* hover states */

/* Accent */
--accent:       #3B82F6;   /* blue — primary actions */
--accent-glow:  rgba(59, 130, 246, 0.15);

/* Status colours */
--status-healthy:  #10B981;  /* green */
--status-degraded: #F59E0B;  /* amber */
--status-down:     #EF4444;  /* red */

/* Alert severity */
--severity-critical: #EF4444;
--severity-warning:  #F59E0B;
--severity-info:     #3B82F6;

/* Text */
--text-primary:   #F9FAFB;
--text-secondary: #9CA3AF;
--text-muted:     #4B5563;

/* Chart colours */
--chart-cpu:     #3B82F6;  /* blue */
--chart-memory:  #8B5CF6;  /* purple */
--chart-rps:     #10B981;  /* green */
--chart-error:   #EF4444;  /* red */
```

### Typography
- Font: `Inter` (Google Fonts)
- Headings: `font-semibold tracking-tight`
- Metric numbers: `font-mono text-2xl font-bold` — monospace so digits don't jump width
- Labels: `text-xs text-muted uppercase tracking-widest`

### Status Badge Component
```
● Healthy   → green dot + green text on dark green bg
⚠ Degraded  → amber dot + amber text on dark amber bg
✗ Down      → red dot + red text on dark red bg
```

### Chart Styling (Recharts)
- Background: transparent
- Grid: `--bg-elevated` dashed lines, very subtle
- Tooltip: custom dark tooltip matching `--bg-surface`
- No chart borders — let the data breathe
- Area charts: gradient fill from `--chart-cpu` at 40% opacity to 0%

---

## 12. Docker & Deployment

### `docker-compose.yml`

```yaml
version: '3.9'

services:
  server:
    build: ./server
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_WS_URL=ws://server:4000
      - NEXT_PUBLIC_API_URL=http://server:4000
    depends_on:
      - server
    restart: unless-stopped
```

### `server/Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

### `frontend/Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Deployment
- **Frontend** → Vercel (connect GitHub, auto-deploy on push)
- **WebSocket server** → Render (free tier, Docker deploy, set env vars)
- Set `NEXT_PUBLIC_WS_URL=wss://your-render-url` on Vercel

---

## 13. Day-by-Day Implementation Plan

### Day 1 — Foundation + WebSocket Server + Dashboard

**Morning (3–4 hours): Project setup**
```bash
# Create monorepo
mkdir pulseboard && cd pulseboard

# Frontend
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir=no
cd frontend
npx shadcn@latest init
npx shadcn@latest add card badge button drawer table select skeleton

# Install dependencies
npm install zustand @tanstack/react-query @tanstack/react-query-devtools
npm install recharts axios
npm install -D @types/node

cd ..

# Server
mkdir server && cd server
npm init -y
npm install ws express cors uuid
npm install -D typescript @types/ws @types/express @types/node @types/uuid ts-node nodemon
```

**Afternoon (4–5 hours): WebSocket server**
1. Set up TypeScript config in `server/`
2. Write `types.ts` — copy schema from Section 5
3. Write `store.ts` — seed services and alerts
4. Write `dataGenerator.ts` — metric walk function + alert generator
5. Write `wsServer.ts` — broadcast loop
6. Write `restServer.ts` — Express routes for alerts + services
7. Write `index.ts` — start both servers on port 4000
8. Test: `npx ts-node src/index.ts` → open `wscat -c ws://localhost:4000` and watch metrics stream

**Evening (3–4 hours): Dashboard skeleton**
1. Set up Zustand stores (`useMetricsStore`, `useAlertStore`, `useUIStore`)
2. Set up TanStack Query provider in `app/layout.tsx`
3. Build `useWebSocket` hook — connect and pipe to Zustand
4. Call `useWebSocket()` in root layout
5. Build `StatCard` component
6. Build Dashboard page with 4 stat cards — verify live updates working
7. Build `CpuChart` with Recharts `AreaChart` — data from `metricsHistory`

**End of Day 1 goal:** Browser shows dashboard with 4 live-updating stat cards and one CPU chart. Data flows WebSocket → Zustand → Recharts.

---

### Day 2 — Services Page + Alerts Page + Polish

**Morning (3–4 hours): Services page**
1. Build `useServices` TanStack Query hook
2. Build `ServicesTable` with shadcn `Table`
3. Build `ServiceRow` with status badge
4. Build `ServiceDrawer` with shadcn `Drawer`
5. Wire `useUIStore.openServiceDrawer` to row click
6. Inside drawer: show service metadata + per-service CPU/Memory charts from Zustand history
7. Add service status summary bar at top (5 healthy, 1 degraded, 1 down)

**Afternoon (3–4 hours): Alerts page**
1. Build `useAlerts` and `useResolveAlert` TanStack Query hooks
2. Build `AlertFilters` with shadcn `Select` for severity + status
3. Build `AlertsTable`
4. Build `AlertBadge` for severity colouring
5. Build `ResolveButton` with optimistic update — on click, immediately update UI, then fire mutation
6. Wire filters to query params

**Evening (2–3 hours): Navigation + TopBar**
1. Build `Sidebar` with nav links to all pages, active state
2. Build `TopBar` with:
   - Alert bell icon + unread badge from `useAlertStore`
   - Click bell → marks all read + opens alerts page
   - Dark/light mode toggle wired to `useUIStore`
3. Build `PageWrapper` for consistent padding
4. Connect all pages in root layout

**End of Day 2 goal:** All three main pages working. Services table with drawer. Alerts with filter and resolve. Navigation between pages.

---

### Day 3 — Docker + Deploy + README + Final polish

**Morning (2–3 hours): Docker setup**
1. Write `server/Dockerfile`
2. Write `frontend/Dockerfile`
3. Write `docker-compose.yml`
4. Test: `docker compose up --build` → verify both services communicate
5. Fix any env variable issues (`NEXT_PUBLIC_WS_URL` pointing to server container)

**Afternoon (2–3 hours): Deploy**
1. Push to GitHub
2. Deploy server to Render:
   - New Web Service → Docker → set `PORT=4000`
   - Note the deployed URL e.g. `wss://pulseboard-server.onrender.com`
3. Deploy frontend to Vercel:
   - Import repo → set `NEXT_PUBLIC_WS_URL=wss://pulseboard-server.onrender.com`
   - Set `NEXT_PUBLIC_API_URL=https://pulseboard-server.onrender.com`
4. Test deployed URL — verify WebSocket connects in production

**Evening (2 hours): README + Polish**

README must include:
- Project overview with one-line pitch
- Architecture diagram (copy ASCII from Section 3)
- Tech stack table
- Local setup instructions (both Docker and manual)
- Screenshots of all 3 pages
- Deployed URL at the top

Polish checklist:
- Loading skeletons while TanStack Query fetches (use shadcn `Skeleton`)
- Empty state when no alerts match filters
- Connection status indicator in TopBar (green dot = WS connected, red = disconnected)
- Responsive layout — sidebar collapses on mobile
- Favicon + page titles

---

## 14. Resume Bullet Points

Once built, replace the Agentic Chatbot project with:

```
\item \textbf{PulseBoard -- Real-Time Infrastructure Metrics Dashboard}
\hfill \textbf{[}\href{https://github.com/YOUR/pulseboard}{\textbf{\textcolor{blue}{GitHub}}}
\textbf{$|$}
\href{https://pulseboard.vercel.app}{\textbf{\textcolor{blue}{Live}}}\textbf{]}
\textit{June 2026} \\[2pt]
\textit{Next.js 14, TypeScript, Tailwind CSS, Recharts, shadcn/ui, Zustand, TanStack Query, WebSocket, Docker}
\begin{itemize}[leftmargin=0.2in, label={--}, itemsep=2pt, topsep=2pt, parsep=0pt]
  \item Built a live infrastructure monitoring dashboard with a Node.js WebSocket server broadcasting
        CPU, memory, and request metrics every second across 8 services; visualised with Recharts
        area and line charts updating in real time.
  \item Architected global state with Zustand (live metrics history, unread alert count) and
        TanStack Query for server-state caching with optimistic alert resolution and background
        refetching every 5 seconds.
  \item Deployed full stack with Docker Compose (Next.js 14 App Router + WebSocket server);
        frontend on Vercel, server on Render with auto-reconnect logic and dark/light mode theming.
\end{itemize}
```

---

*Blueprint complete. Every section maps directly to what Infravox AI's frontend team builds daily.*
