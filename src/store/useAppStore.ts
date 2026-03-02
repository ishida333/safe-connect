import { create } from 'zustand';

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  avatar?: string;
  isInDisasterZone: boolean;
  isEvacuated: boolean;
  lastLocation?: { lat: number; lng: number };
  lastUpdated?: Date;
}

interface DisasterInfo {
  type: 'earthquake' | 'tsunami';
  intensity?: number;
  area?: string;
  timestamp: Date;
}

interface AppState {
  isDisasterMode: boolean;
  isEvacuated: boolean;
  contacts: Contact[];
  currentDisaster: DisasterInfo | null;
  currentLocation: { lat: number; lng: number } | null;
  
  toggleDisasterMode: () => void;
  setEvacuated: (value: boolean) => void;
  addContact: (contact: Omit<Contact, 'id' | 'isInDisasterZone' | 'isEvacuated'>) => void;
  removeContact: (id: string) => void;
  setCurrentLocation: (location: { lat: number; lng: number }) => void;
  setCurrentDisaster: (disaster: DisasterInfo | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isDisasterMode: false,
  isEvacuated: false,
  contacts: [
    {
      id: '1',
      name: 'お母さん',
      relationship: '家族',
      isInDisasterZone: true,
      isEvacuated: false,
      lastLocation: { lat: 35.6812, lng: 139.7671 },
      lastUpdated: new Date(),
    },
    {
      id: '2',
      name: '田中太郎',
      relationship: '友達',
      isInDisasterZone: false,
      isEvacuated: false,
    },
    {
      id: '3',
      name: 'お父さん',
      relationship: '家族',
      isInDisasterZone: true,
      isEvacuated: true,
      lastLocation: { lat: 35.6895, lng: 139.6917 },
      lastUpdated: new Date(),
    },
  ],
  currentDisaster: null,
  currentLocation: null,

  toggleDisasterMode: () =>
    set((state) => ({ isDisasterMode: !state.isDisasterMode, isEvacuated: false })),
  setEvacuated: (value) => set({ isEvacuated: value }),
  addContact: (contact) =>
    set((state) => ({
      contacts: [
        ...state.contacts,
        { ...contact, id: crypto.randomUUID(), isInDisasterZone: false, isEvacuated: false },
      ],
    })),
  removeContact: (id) =>
    set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setCurrentDisaster: (disaster) => set({ currentDisaster: disaster }),
}));
