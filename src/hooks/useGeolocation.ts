import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

const getGeolocationErrorMessage = (err: GeolocationPositionError | null) => {
  if (!err) return '位置情報の取得に失敗しました';
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return '位置情報の利用が許可されていません。ブラウザ設定で許可してください。';
    case err.POSITION_UNAVAILABLE:
      return '位置情報を特定できませんでした。電波状況の良い場所で再試行してください。';
    case err.TIMEOUT:
      return '位置情報の取得がタイムアウトしました。再試行してください。';
    default:
      return '位置情報の取得に失敗しました';
  }
};

export const useGeolocation = ({ autoRequest = true }: { autoRequest?: boolean } = {}) => {
  const {
    currentLocation,
    locationLoading,
    locationError,
    setCurrentLocation,
    setLocationLoading,
    setLocationError,
  } = useAppStore();

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('この端末では位置情報機能が利用できません。');
      setLocationLoading(false);
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
        setLocationLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationError(getGeolocationErrorMessage(err));
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [setCurrentLocation, setLocationError, setLocationLoading]);

  useEffect(() => {
    if (!autoRequest) return;
    requestLocation();

    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
      },
      (err) => {
        console.error('Geolocation watch error:', err);
        setLocationError(getGeolocationErrorMessage(err));
      },
      { enableHighAccuracy: true, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [autoRequest, requestLocation, setCurrentLocation, setLocationError]);

  return { currentLocation, locationLoading, locationError, requestLocation };
};
