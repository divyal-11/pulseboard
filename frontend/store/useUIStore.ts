import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  selectedServiceId: string | null;
  drawerOpen: boolean;
  theme: 'dark' | 'light';
  isConnected: boolean;

  toggleSidebar: () => void;
  openServiceDrawer: (serviceId: string) => void;
  closeDrawer: () => void;
  toggleTheme: () => void;
  setConnected: (val: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  selectedServiceId: null,
  drawerOpen: false,
  theme: 'dark',
  isConnected: false,

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  openServiceDrawer: (serviceId) => set({ selectedServiceId: serviceId, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false, selectedServiceId: null }),
  toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setConnected: (val) => set({ isConnected: val }),
}));
