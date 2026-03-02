import { create } from 'zustand';

interface AppState {
  isDisasterMode: boolean;
  isEvacuated: boolean;
  toggleDisasterMode: () => void;
  setEvacuated: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isDisasterMode: false,
  isEvacuated: false,
  toggleDisasterMode: () =>
    set((state) => ({ isDisasterMode: !state.isDisasterMode, isEvacuated: false })),
  setEvacuated: (value) => set({ isEvacuated: value }),
}));
