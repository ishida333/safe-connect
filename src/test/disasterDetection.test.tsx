import { describe, it, expect, vi } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import React from 'react';

// ensure store is reset between tests
import { useAppStore } from '../store/useAppStore';

// mock the hook that fetches disaster info
vi.mock('../hooks/useDisasterInfo', () => ({
  useDisasterInfo: () => ({
    data: {
      earthquakes: [
        {
          id: 'eq1',
          type: 'earthquake',
          title: 'Test quake',
          detail: 'テスト地震',
          magnitude: 5,
          maxScale: 50,
          lat: 35,
          lng: 139,
          depth: 10,
          time: new Date().toISOString(),
          points: [],
        },
      ],
      tsunamis: [],
    },
  }),
}));

import { useDisasterDetection } from '../hooks/useDisasterDetection';

// small component to mount the hook
function HookWrapper() {
  useDisasterDetection();
  return null;
}

describe('useDisasterDetection auto zone', () => {
  beforeEach(() => {
    // reset store
    useAppStore.setState({
      isDisasterMode: false,
      dangerZones: [],
      currentLocation: { lat: 35, lng: 139 },
      settings: { ...useAppStore.getState().settings, disasterThreshold: 0 },
    });
  });

  it('should add a danger zone automatically when earthquake is near', async () => {
    render(<HookWrapper />);

    await waitFor(() => {
      expect(useAppStore.getState().dangerZones.length).toBe(1);
      const zone = useAppStore.getState().dangerZones[0];
      expect(zone.label).toContain('自動危険域');
      expect(zone.radius).toBeGreaterThan(0);
      expect(useAppStore.getState().isDisasterMode).toBe(true);
      expect(useAppStore.getState().disasterType).toBe('quake');
    });
  });
});