<<<<<<< HEAD
import { useMemo } from 'react';
=======
import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
import { Navigation, MapPin, Crosshair, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDisasterInfo } from '@/hooks/useDisasterInfo';
import { useShelters, formatDistance } from '@/hooks/useShelters';
<<<<<<< HEAD
=======
import type { ShelterWithDistance } from '@/hooks/useShelters';
import ShelterDetailSheet from '@/components/ShelterDetailSheet';
import 'leaflet/dist/leaflet.css';

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

// Regular shelter (small, subtle)
const shelterIcon = new L.DivIcon({
  html: `<div style="width:8px;height:8px;background:#2ecc71;border:1.5px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.2);opacity:0.7"></div>`,
  className: '',
  iconSize: [8, 8],
  iconAnchor: [4, 4],
});

// Nearby shelter (larger, highlighted)
const nearbyShelterIcon = new L.DivIcon({
  html: `<div style="width:14px;height:14px;background:#27ae60;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(39,174,96,0.4)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const earthquakeIcon = new L.DivIcon({
  html: `<div style="width:14px;height:14px;background:#e74c3c;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

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
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee

const ShelterMap = () => {
  const navigate = useNavigate();
  const isDisasterMode = useAppStore((s) => s.isDisasterMode);
  const { currentLocation, locationLoading, locationError, requestLocation } = useGeolocation({ autoRequest: false });
  const { data: disasterData } = useDisasterInfo();
<<<<<<< HEAD
  const { data: shelterData } = useShelters(currentLocation?.lat, currentLocation?.lng);

  const shelters = shelterData?.nearby ?? [];

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
=======
  const { data: shelterData, isLoading: sheltersLoading } = useShelters(currentLocation?.lat, currentLocation?.lng);

  const [selectedShelter, setSelectedShelter] = useState<ShelterWithDistance | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const nearbyIds = useMemo(() => {
    if (!shelterData?.nearby) return new Set<number>();
    return new Set(shelterData.nearby.map((s) => s.id));
  }, [shelterData?.nearby]);

  const recentEarthquakes = useMemo(() => {
    if (!disasterData?.earthquakes) return [];
    return disasterData.earthquakes.filter((eq) => eq.lat && eq.lng).slice(0, 5);
  }, [disasterData]);

  const handleShelterClick = (shelter: ShelterWithDistance) => {
    setSelectedShelter(shelter);
    setDetailOpen(true);
  };

  // Loading state
  if (locationLoading) {
    return (
      <div className="min-h-screen pb-24">
        <Header isDisasterMode={isDisasterMode} onBack={() => navigate('/')} />
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">現在地を取得中...</p>
          <p className="mt-1 text-xs text-muted-foreground/60">位置情報の許可をお願いします</p>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
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
=======
  // No location
  if (!currentLocation) {
    return (
      <div className="min-h-screen pb-24">
        <Header isDisasterMode={isDisasterMode} onBack={() => navigate('/')} />
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
        <div className="mx-auto mt-8 max-w-lg px-4">
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-primary" />
            <p className="text-sm font-semibold">現在地を取得できませんでした</p>
<<<<<<< HEAD
            <p className="mt-2 text-xs text-muted-foreground">{locationError ?? '位置情報が無効の可能性があります。設定を確認して再試行してください。'}</p>
=======
            <p className="mt-2 text-xs text-muted-foreground">{locationError ?? '位置情報が無効の可能性があります。'}</p>
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
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

<<<<<<< HEAD
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
        {/* Map placeholder - OpenStreetMap embed */}
        <div className="relative mx-4 mt-4 h-64 rounded-2xl overflow-hidden border border-border bg-muted">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.lng - 0.02},${currentLocation.lat - 0.015},${currentLocation.lng + 0.02},${currentLocation.lat + 0.015}&layer=mapnik&marker=${currentLocation.lat},${currentLocation.lng}`}
            title="避難所マップ"
          />
          <button
            onClick={requestLocation}
            className="absolute bottom-4 right-4 z-[10] flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-lg border border-border"
          >
            <Crosshair className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* Shelter list */}
=======
  const allShelters = shelterData?.all ?? [];
  const nearbyShelters = shelterData?.nearby ?? [];

  return (
    <div className="min-h-screen pb-24">
      <Header isDisasterMode={isDisasterMode} onBack={() => navigate('/')} />

      <div className="mx-auto max-w-lg">
        {/* Map */}
        <div className="relative mx-4 mt-4 h-72 rounded-2xl overflow-hidden border border-border">
          <MapContainer
            center={[currentLocation.lat, currentLocation.lng]}
            zoom={14}
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

            {/* All shelters */}
            {allShelters.map((s) => (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={nearbyIds.has(s.id) ? nearbyShelterIcon : shelterIcon}
                eventHandlers={{ click: () => handleShelterClick(s) }}
              >
                <Popup>
                  <strong>{s.name}</strong><br />
                  {s.type} — {formatDistance(s.distance)}
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

          {sheltersLoading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/50">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Shelter count */}
        {allShelters.length > 0 && (
          <p className="mx-4 mt-2 text-[10px] text-muted-foreground">
            周辺 {allShelters.length} 件の避難所を表示中
          </p>
        )}

        {/* Nearby shelter list */}
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
        <div className="mx-4 mt-4">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            近くの避難場所
          </h2>

<<<<<<< HEAD
          {shelters.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-primary" />
              避難所を検索中...
            </div>
          ) : (
            <div className="space-y-2">
              {shelters.map((shelter) => (
                <div
                  key={shelter.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
=======
          {nearbyShelters.length === 0 && !sheltersLoading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">周辺に避難所が見つかりませんでした</p>
          ) : (
            <div className="space-y-2">
              {nearbyShelters.map((shelter) => (
                <button
                  key={shelter.id}
                  onClick={() => handleShelterClick(shelter)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{shelter.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full">
                        {shelter.type}
                      </span>
                      {shelter.address && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {shelter.address}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">{formatDistance(shelter.distance)}</p>
                  </div>
<<<<<<< HEAD
                </div>
=======
                </button>
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
              ))}
            </div>
          )}
        </div>
<<<<<<< HEAD

        {/* Recent earthquakes */}
        {recentEarthquakes.length > 0 && (
          <div className="mx-4 mt-6">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-danger" />
              直近の地震震源地
            </h2>
            <div className="space-y-2">
              {recentEarthquakes.map((eq) => (
                <div key={eq.id} className="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/15">
                    <AlertTriangle className="h-4 w-4 text-danger" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{eq.title}</p>
                    <p className="text-[10px] text-muted-foreground">{eq.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
=======
      </div>

      <ShelterDetailSheet
        shelter={selectedShelter}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
    </div>
  );
};

<<<<<<< HEAD
=======
const Header = ({ isDisasterMode, onBack }: { isDisasterMode: boolean; onBack: () => void }) => (
  <header className={`sticky top-0 z-40 px-4 py-3 transition-colors duration-500 ${
    isDisasterMode ? 'bg-danger text-danger-foreground' : 'bg-primary text-primary-foreground'
  }`}>
    <div className="mx-auto flex max-w-lg items-center gap-3">
      <button onClick={onBack}>
        <Navigation className="h-5 w-5" />
      </button>
      <h1 className="text-base font-bold">避難所マップ</h1>
    </div>
  </header>
);

>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
export default ShelterMap;
