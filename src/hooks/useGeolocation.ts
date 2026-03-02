import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

export const useGeolocation = () => {
  const { currentLocation, locationLoading, setCurrentLocation, setLocationLoading } = useAppStore();

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setCurrentLocation, setLocationLoading]);

  useEffect(() => {
    requestLocation();

    // Watch position for updates
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [requestLocation, setCurrentLocation]);

  return { currentLocation, locationLoading, requestLocation };
};
