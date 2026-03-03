import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

<<<<<<< HEAD
=======
/**
 * Syncs the current user's disaster mode, evacuation, and location
 * to their profile row so contacts can see it in realtime.
 */
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
export const useStatusSync = () => {
  const { user } = useAuth();
  const { isDisasterMode, isEvacuated, currentLocation, settings } = useAppStore();
  const prevRef = useRef<{ dm: boolean; ev: boolean; lat: number | null; lng: number | null }>({
    dm: false, ev: false, lat: null, lng: null,
  });

  useEffect(() => {
    if (!user) return;

    const prev = prevRef.current;
    const lat = isDisasterMode && settings.autoShareLocation ? currentLocation?.lat ?? null : null;
    const lng = isDisasterMode && settings.autoShareLocation ? currentLocation?.lng ?? null : null;

<<<<<<< HEAD
=======
    // Only update if something changed
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
    if (
      prev.dm === isDisasterMode &&
      prev.ev === isEvacuated &&
      prev.lat === lat &&
      prev.lng === lng
    ) return;

    prevRef.current = { dm: isDisasterMode, ev: isEvacuated, lat, lng };

    supabase
      .from('profiles')
      .update({
        is_in_disaster_zone: isDisasterMode,
        is_evacuated: isEvacuated,
        last_lat: lat,
        last_lng: lng,
        status_updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .then(({ error }) => {
        if (error) console.error('Status sync error:', error);
      });
  }, [user, isDisasterMode, isEvacuated, currentLocation, settings.autoShareLocation]);
};
