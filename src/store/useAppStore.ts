import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  disasterThreshold: number; // Earthquake scale: 45=5弱, 50=5強, etc.
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoShareLocation: boolean;
  shareLocationDuration: number; // hours
  language: string;
  theme: 'light' | 'dark' | 'system';
}

interface AppState {
  isDisasterMode: boolean;
  isEvacuated: boolean;
  currentLocation: { lat: number; lng: number } | null;
  locationLoading: boolean;
  locationError: string | null;
  settings: Settings;

  toggleDisasterMode: () => void;
  setDisasterMode: (value: boolean) => void;
  setEvacuated: (value: boolean) => void;
  setCurrentLocation: (loc: { lat: number; lng: number } | null) => void;
  setLocationLoading: (v: boolean) => void;
  setLocationError: (message: string | null) => void;
  updateSettings: (partial: Partial<Settings>) => void;
}

export const SCALE_OPTIONS = [
  { value: 30, label: '震度3' },
  { value: 40, label: '震度4' },
  { value: 45, label: '震度5弱' },
  { value: 50, label: '震度5強' },
  { value: 55, label: '震度6弱' },
  { value: 60, label: '震度6強' },
  { value: 70, label: '震度7' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDisasterMode: false,
      isEvacuated: false,
      currentLocation: null,
      locationLoading: false,
      locationError: null,
      settings: {
        disasterThreshold: 45,
        notificationsEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        autoShareLocation: true,
        shareLocationDuration: 24,
        language: 'ja',
        theme: 'light' as const,
      },

      toggleDisasterMode: () =>
        set((state) => ({ isDisasterMode: !state.isDisasterMode, isEvacuated: false })),
      setDisasterMode: (value) => set({ isDisasterMode: value, isEvacuated: false }),
      setEvacuated: (value) => set({ isEvacuated: value }),
      setCurrentLocation: (loc) => set({ currentLocation: loc }),
      setLocationLoading: (v) => set({ locationLoading: v }),
      setLocationError: (message) => set({ locationError: message }),
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    {
      name: 'safelink-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
