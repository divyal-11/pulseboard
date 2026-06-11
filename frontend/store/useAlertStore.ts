import { create } from 'zustand';
import { Alert } from '@/types';

interface AlertStore {
  liveAlerts: Alert[];         // alerts received via WebSocket
  unreadCount: number;         // badge on bell icon
  addAlert: (alert: Alert) => void;
  markAllRead: () => void;
  resolveAlert: (id: string) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  liveAlerts: [],
  unreadCount: 0,

  addAlert: (alert) => set(state => ({
    liveAlerts: [alert, ...state.liveAlerts].slice(0, 50),
    unreadCount: state.unreadCount + 1,
  })),

  markAllRead: () => set({ unreadCount: 0 }),

  resolveAlert: (id) => set(state => ({
    liveAlerts: state.liveAlerts.map(a =>
      a.id === id ? { ...a, status: 'resolved' as const, resolvedAt: new Date().toISOString() } : a
    ),
  })),
}));
