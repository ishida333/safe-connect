import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // P2P地震情報 API - free, no API key needed
    // codes=551: earthquake info, codes=552: tsunami info
    const earthquakeRes = await fetch(
      'https://api.p2pquake.net/v2/history?codes=551&limit=10'
    );
    const earthquakeData = await earthquakeRes.json();

    const tsunamiRes = await fetch(
      'https://api.p2pquake.net/v2/history?codes=552&limit=5'
    );
    const tsunamiData = await tsunamiRes.json();

    // Transform earthquake data
    const earthquakes = earthquakeData.map((item: any) => ({
      id: item.id,
      type: 'earthquake' as const,
      title: `地震情報`,
      detail: `最大震度${item.earthquake?.maxScale !== undefined ? formatScale(item.earthquake.maxScale) : '不明'} / ${item.earthquake?.hypocenter?.name || '不明'}`,
      magnitude: item.earthquake?.hypocenter?.magnitude,
      depth: item.earthquake?.hypocenter?.depth,
      lat: item.earthquake?.hypocenter?.latitude,
      lng: item.earthquake?.hypocenter?.longitude,
      maxScale: item.earthquake?.maxScale,
      time: item.earthquake?.time || item.time,
      points: item.points?.map((p: any) => ({
        prefecture: p.pref,
        name: p.addr,
        scale: p.scale,
      })) || [],
    }));

    // Transform tsunami data
    const tsunamis = tsunamiData.map((item: any) => ({
      id: item.id,
      type: 'tsunami' as const,
      title: '津波情報',
      detail: item.cancelled ? '解除' : (item.areas?.map((a: any) => a.name).join(', ') || '情報なし'),
      cancelled: item.cancelled,
      time: item.time,
      areas: item.areas || [],
    }));

    return new Response(JSON.stringify({ earthquakes, tsunamis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching disaster data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch disaster data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatScale(scale: number): string {
  const scaleMap: Record<number, string> = {
    10: '1', 20: '2', 30: '3', 40: '4',
    45: '5弱', 50: '5強', 55: '6弱', 60: '6強', 70: '7',
  };
  return scaleMap[scale] || String(scale);
}
