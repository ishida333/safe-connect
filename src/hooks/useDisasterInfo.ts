import { useQuery } from '@tanstack/react-query';
<<<<<<< HEAD
=======
import { supabase } from '@/integrations/supabase/client';
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee

export interface EarthquakeInfo {
  id: string;
  type: 'earthquake';
  title: string;
  detail: string;
  magnitude?: number;
  maxScale?: number;
  lat?: number;
  lng?: number;
  depth?: number;
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
<<<<<<< HEAD
      // Fetch from P2P earthquake API directly (no edge function needed for public API)
      try {
        const res = await fetch('https://api.p2pquake.net/v2/history?codes=551&limit=10');
        if (!res.ok) throw new Error('API error');
        const raw = await res.json();
        
        const earthquakes: EarthquakeInfo[] = raw.map((item: any, idx: number) => ({
          id: item.id || `eq-${idx}`,
          type: 'earthquake' as const,
          title: item.earthquake?.hypocenter?.name 
            ? `${item.earthquake.hypocenter.name}で地震` 
            : '地震情報',
          detail: `最大震度${formatScale(item.earthquake?.maxScale ?? 0)} M${item.earthquake?.hypocenter?.magnitude ?? '不明'}`,
          magnitude: item.earthquake?.hypocenter?.magnitude,
          maxScale: item.earthquake?.maxScale,
          lat: item.earthquake?.hypocenter?.latitude,
          lng: item.earthquake?.hypocenter?.longitude,
          depth: item.earthquake?.hypocenter?.depth,
          time: item.earthquake?.time || item.time || new Date().toISOString(),
          points: (item.points || []).map((p: any) => ({
            prefecture: p.pref,
            name: p.addr,
            scale: p.scale,
          })),
        }));

        return { earthquakes, tsunamis: [] as TsunamiInfo[] };
      } catch {
        return { earthquakes: [] as EarthquakeInfo[], tsunamis: [] as TsunamiInfo[] };
      }
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
};

function formatScale(scale: number): string {
  const map: Record<number, string> = {
    10: '1', 20: '2', 30: '3', 40: '4',
    45: '5弱', 50: '5強', 55: '6弱', 60: '6強', 70: '7',
  };
  return map[scale] || String(scale);
}
=======
      const { data, error } = await supabase.functions.invoke('fetch-disaster-info');
      if (error) throw error;
      return data as { earthquakes: EarthquakeInfo[]; tsunamis: TsunamiInfo[] };
    },
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000,
  });
};
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
