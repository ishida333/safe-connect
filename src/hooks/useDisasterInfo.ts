import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EarthquakeInfo {
  id: string;
  type: 'earthquake';
  title: string;
  detail: string;
  magnitude?: number;
  maxScale?: number;
  time: string;
  points: { prefecture: string; name: string; scale: number }[];
}

export interface TsunamiInfo {
  id: string;
  type: 'tsunami';
  title: string;
  detail: string;
  cancelled: boolean;
  time: string;
  areas: any[];
}

export const useDisasterInfo = () => {
  return useQuery({
    queryKey: ['disaster-info'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-disaster-info');
      if (error) throw error;
      return data as { earthquakes: EarthquakeInfo[]; tsunamis: TsunamiInfo[] };
    },
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000,
  });
};
