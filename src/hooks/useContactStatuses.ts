import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Contact } from '@/hooks/useContacts';

export interface ContactStatus {
  is_in_disaster_zone: boolean;
  is_evacuated: boolean;
  last_lat: number | null;
  last_lng: number | null;
  status_updated_at: string | null;
}

/**
 * Subscribes to realtime profile changes for all linked contacts.
 * Returns a map of contact_user_id -> live status.
 */
export const useContactStatuses = (contacts: Contact[]) => {
  const [statuses, setStatuses] = useState<Record<string, ContactStatus>>({});

  const linkedIds = contacts
    .map((c) => c.contact_user_id)
    .filter((id): id is string => !!id);

  // Initial fetch
  useEffect(() => {
    if (linkedIds.length === 0) return;

    supabase
      .from('profiles')
      .select('user_id, is_in_disaster_zone, is_evacuated, last_lat, last_lng, status_updated_at')
      .in('user_id', linkedIds)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, ContactStatus> = {};
        for (const row of data) {
          map[row.user_id] = {
            is_in_disaster_zone: row.is_in_disaster_zone,
            is_evacuated: row.is_evacuated,
            last_lat: row.last_lat,
            last_lng: row.last_lng,
            status_updated_at: row.status_updated_at,
          };
        }
        setStatuses(map);
      });
  }, [linkedIds.join(',')]);

  // Realtime subscription
  useEffect(() => {
    if (linkedIds.length === 0) return;

    const channel = supabase
      .channel('contact-statuses')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const row = payload.new as any;
          if (linkedIds.includes(row.user_id)) {
            setStatuses((prev) => ({
              ...prev,
              [row.user_id]: {
                is_in_disaster_zone: row.is_in_disaster_zone,
                is_evacuated: row.is_evacuated,
                last_lat: row.last_lat,
                last_lng: row.last_lng,
                status_updated_at: row.status_updated_at,
              },
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [linkedIds.join(',')]);

  return statuses;
};
