import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Crosshair, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDisasterInfo } from '@/hooks/useDisasterInfo';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const userIcon = new L.DivIcon({
  html: `<div style="width:16px;height:16px;background:#339999;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const shelterIcon = new L.DivIcon({
  html: `<div style="width:12px;height:12px;background:#2ecc71;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.2)"></div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const earthquakeIcon = new L.DivIcon({
  html: `<div style="width:14px;height:14px;background:#e74c3c;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Mock nearby shelters (in real app, fetch from an API based on location)
const generateNearbyShelters = (lat: number, lng: number) => [
  { id: 1, name: '指定避難所 A', type: '指定避難所', lat: lat + 0.003, lng: lng + 0.004, capacity: '800人' },
  { id: 2, name: '広域避難場所 B', type: '広域避難場所', lat: lat - 0.005, lng: lng + 0.002, capacity: '5,000人' },
  { id: 3, name: '指定避難所 C', type: '指定避難所', lat: lat + 0.002, lng: lng - 0.006, capacity: '1,200人' },
  { id: 4, name: '公園避難場所 D', type: '広域避難場所', lat: lat - 0.003, lng: lng - 0.004, capacity: '3,000人' },
  { id: 5, name: '学校避難所 E', type: '指定避難所', lat: lat + 0.006, lng: lng + 0.001, capacity: '1,000人' },
];

function getDistanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

const RecenterButton = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo([lat, lng], 15, { duration: 0.5 })}
      className="absolute bottom-4 right-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-lg border border-border"
    >
      <Crosshair className="h-5 w-5 text-primary" />
    </button>
  );
};

const ShelterMap = () => {
  const navigate = useNavigate();
  const isDisasterMode = useAppStore((s) => s.isDisasterMode);
  const { currentLocation, locationLoading, locationError, requestLocation } = useGeolocation({ autoRequest: false });
  const { data: disasterData } = useDisasterInfo();

  const shelters = useMemo(() => {
    if (!currentLocation) return [];
    return generateNearbyShelters(currentLocation.lat, currentLocation.lng)
      .map((s) => ({
        ...s,
        distance: getDistanceM(currentLocation.lat, currentLocation.lng, s.lat, s.lng),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [currentLocation]);

  const recentEarthquakes = useMemo(() => {
    if (!disasterData?.earthquakes) return [];
    return disasterData.earthquakes
      .filter((eq) => eq.lat && eq.lng)
      .slice(0, 5);
  }, [disasterData]);

  if (locationLoading) {
    return (
      <div className="min-h-screen pb-24">
        <header className={`sticky top-0 z-40 px-4 py-3 transition-colors duration-500 ${
          isDisasterMode ? 'bg-danger text-danger-foreground' : 'bg-primary text-primary-foreground'
        }`}>
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <button onClick={() => navigate('/')}>
              <Navigation className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold">避難所マップ</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">現在地を取得中...</p>
          <p className="mt-1 text-xs text-muted-foreground/60">位置情報の許可をお願いします</p>
        </div>
      </div>
    );
  }

  if (!currentLocation) {
    return (
      <div className="min-h-screen pb-24">
        <header className={`sticky top-0 z-40 px-4 py-3 transition-colors duration-500 ${
          isDisasterMode ? 'bg-danger text-danger-foreground' : 'bg-primary text-primary-foreground'
        }`}>
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <button onClick={() => navigate('/')}>
              <Navigation className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold">避難所マップ</h1>
          </div>
        </header>

        <div className="mx-auto mt-8 max-w-lg px-4">
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold">現在地を取得できませんでした</p>
            <p className="mt-2 text-xs text-muted-foreground">{locationError ?? '位置情報が無効の可能性があります。設定を確認して再試行してください。'}</p>
            <button
              onClick={requestLocation}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className={`sticky top-0 z-40 px-4 py-3 transition-colors duration-500 ${
        isDisasterMode ? 'bg-danger text-danger-foreground' : 'bg-primary text-primary-foreground'
      }`}>
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button onClick={() => navigate('/')}>
            <Navigation className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold">避難所マップ</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg">
        {/* Map */}
        <div className="relative mx-4 mt-4 h-64 rounded-2xl overflow-hidden border border-border">
          <MapContainer
            center={[currentLocation.lat, currentLocation.lng]}
            zoom={15}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location */}
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
              <Popup>📍 現在地</Popup>
            </Marker>

            {/* Shelters */}
            {shelters.map((s) => (
              <Marker key={s.id} position={[s.lat, s.lng]} icon={shelterIcon}>
                <Popup>
                  <strong>{s.name}</strong><br />
                  {s.type} / 収容: {s.capacity}<br />
                  距離: {formatDistance(s.distance)}
                </Popup>
              </Marker>
            ))}

            {/* Earthquake epicenters */}
            {recentEarthquakes.map((eq) => (
              <Marker key={eq.id} position={[eq.lat!, eq.lng!]} icon={earthquakeIcon}>
                <Popup>
                  <strong>{eq.title}</strong><br />
                  {eq.detail}<br />
                  M{eq.magnitude}
                </Popup>
              </Marker>
            ))}

            {isDisasterMode && (
              <Circle
                center={[currentLocation.lat, currentLocation.lng]}
                radius={2000}
                pathOptions={{ color: 'hsl(4, 80%, 55%)', fillOpacity: 0.08, weight: 1 }}
              />
            )}

            <RecenterButton lat={currentLocation.lat} lng={currentLocation.lng} />
          </MapContainer>
        </div>

        {/* Shelter list */}
        <div className="mx-4 mt-4">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            近くの避難場所
          </h2>

          <div className="space-y-2">
            {shelters.map((shelter) => (
              <div
                key={shelter.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{shelter.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full">
                      {shelter.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      収容: {shelter.capacity}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{formatDistance(shelter.distance)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelterMap;
