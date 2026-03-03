import { useQuery } from '@tanstack/react-query';

export interface Shelter {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  operator?: string;
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Fetch real evacuation shelters from OpenStreetMap via Overpass API.
 * Queries for nodes/ways tagged as emergency shelters or designated
 * evacuation sites within a bounding box around the user's location.
 */
const fetchShelters = async (lat: number, lng: number): Promise<Shelter[]> => {
  // ~5km bounding box
  const delta = 0.05;
  const bbox = `${lat - delta},${lng - delta},${lat + delta},${lng + delta}`;

  const query = `
    [out:json][timeout:15];
    (
      node["emergency"="assembly_point"](${bbox});
      node["amenity"="shelter"](${bbox});
      node["building"="civic"]["shelter"="yes"](${bbox});
      node["social_facility"="shelter"](${bbox});
      node["refuge:type"](${bbox});
      node["disaster"="yes"](${bbox});
      way["emergency"="assembly_point"](${bbox});
      way["amenity"="shelter"](${bbox});
    );
    out center body;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error('Overpass API error');

  const data = await res.json();

  const shelters: Shelter[] = data.elements
    .map((el: any, idx: number) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (!elLat || !elLng) return null;

      const tags = el.tags ?? {};
      const name =
        tags['name:ja'] ||
        tags.name ||
        tags['name:en'] ||
        tags.description ||
        tags.operator ||
        tags['addr:full'] ||
        (tags['addr:street'] ? `${tags['addr:street']}付近の避難所` : null) ||
        `避難所 ${el.id}`;

      const type =
        tags['emergency'] === 'assembly_point'
          ? '指定避難所'
          : tags['amenity'] === 'shelter'
            ? '避難施設'
            : '避難場所';

      return {
        id: el.id,
        name,
        lat: elLat,
        lng: elLng,
        type,
        address: tags['addr:full'] || tags['addr:street'] || undefined,
        operator: tags.operator || undefined,
      } as Shelter;
    })
    .filter(Boolean) as Shelter[];

  return shelters;
};

function getDistanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export type ShelterWithDistance = Shelter & { distance: number };

export const useShelters = (lat: number | undefined, lng: number | undefined) => {
  return useQuery({
    queryKey: ['shelters', lat, lng],
    queryFn: () => fetchShelters(lat!, lng!),
    enabled: lat != null && lng != null,
    staleTime: 5 * 60 * 1000,
    select: (shelters) => {
      if (lat == null || lng == null) return { all: [], nearby: [] };

      const withDistance: ShelterWithDistance[] = shelters
        .map((s) => ({ ...s, distance: getDistanceM(lat, lng, s.lat, s.lng) }))
        .sort((a, b) => a.distance - b.distance);

      return {
        all: withDistance,
        nearby: withDistance.slice(0, 5),
      };
    },
  });
};
