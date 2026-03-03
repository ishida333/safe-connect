import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useDisasterInfo } from '@/hooks/useDisasterInfo';
import { toast } from 'sonner';

<<<<<<< HEAD
=======
/**
 * Checks if user's current location is near any earthquake observation points
 * that meet/exceed the configured threshold.
 */
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
export const useDisasterDetection = () => {
  const { currentLocation, settings, isDisasterMode, setDisasterMode } = useAppStore();
  const { data } = useDisasterInfo();

  useEffect(() => {
    if (!currentLocation || !data?.earthquakes?.length) return;

    const threshold = settings.disasterThreshold;
<<<<<<< HEAD
=======

    // Check recent earthquakes (last 6 hours only)
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

    for (const eq of data.earthquakes) {
      const eqTime = new Date(eq.time.replace(/\//g, '-')).getTime();
      if (eqTime < sixHoursAgo) continue;
      if ((eq.maxScale ?? 0) < threshold) continue;

<<<<<<< HEAD
=======
      // Check if user is within ~100km of the earthquake epicenter
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
      if (eq.lat && eq.lng) {
        const dist = getDistanceKm(currentLocation.lat, currentLocation.lng, eq.lat, eq.lng);
        if (dist < 100 && !isDisasterMode) {
          setDisasterMode(true);
<<<<<<< HEAD
          toast.error(`⚠ 被災モードが自動的に有効になりました（${eq.detail}）`, { duration: 10000 });
=======
          if (settings.soundEnabled || settings.vibrationEnabled) {
            toast.error(`⚠ 被災モードが自動的に有効になりました（${eq.detail}）`, {
              duration: 10000,
            });
          }
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
          return;
        }
      }

<<<<<<< HEAD
      for (const point of eq.points || []) {
        if (point.scale >= threshold) {
=======
      // Also check observation points
      for (const point of eq.points || []) {
        if (point.scale >= threshold) {
          // If we have a match on scale, check if user is in the same prefecture area
          // (simplified: we can't get exact coords for points, so we use epicenter proximity)
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
          if (eq.lat && eq.lng) {
            const dist = getDistanceKm(currentLocation.lat, currentLocation.lng, eq.lat, eq.lng);
            if (dist < 150 && !isDisasterMode) {
              setDisasterMode(true);
<<<<<<< HEAD
              toast.error(`⚠ 被災モード自動発動（${point.name} 震度${formatScale(point.scale)}）`, { duration: 10000 });
=======
              toast.error(`⚠ 被災モード自動発動（${point.name} 震度${formatScale(point.scale)}）`, {
                duration: 10000,
              });
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
              return;
            }
          }
        }
      }
    }
  }, [currentLocation, data, settings.disasterThreshold, isDisasterMode, setDisasterMode, settings.soundEnabled, settings.vibrationEnabled]);
};

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
<<<<<<< HEAD
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
=======
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatScale(scale: number): string {
<<<<<<< HEAD
  const map: Record<number, string> = { 10: '1', 20: '2', 30: '3', 40: '4', 45: '5弱', 50: '5強', 55: '6弱', 60: '6強', 70: '7' };
=======
  const map: Record<number, string> = {
    10: '1', 20: '2', 30: '3', 40: '4',
    45: '5弱', 50: '5強', 55: '6弱', 60: '6強', 70: '7',
  };
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
  return map[scale] || String(scale);
}
