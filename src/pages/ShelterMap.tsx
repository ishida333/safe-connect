import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Crosshair, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDisasterInfo } from '@/hooks/useDisasterInfo';
import { useEvacuationRoute, type Shelter } from '@/hooks/useEvacuationRoute';
import { useNearestShelter } from '@/hooks/useNearestShelter';
import { EvacuationRoute } from '@/components/EvacuationRoute';
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
  const setDisasterMode = useAppStore((s) => s.setDisasterMode);
  const addZone = useAppStore((s) => s.addDangerZone);
  const removeZone = useAppStore((s) => s.removeDangerZone);

  const [demoQuakeActive, setDemoQuakeActive] = useState(false);
  const [demoQuake, setDemoQuake] = useState<{lat:number,lng:number}|null>(null);
  const [demoTsunami, setDemoTsunami] = useState<{lat:number,lng:number}|null>(null);
  const [demoTsunamiZoneId, setDemoTsunamiZoneId] = useState<number | null>(null);

  const { currentLocation, locationLoading, locationError, requestLocation } = useGeolocation({ autoRequest: false });
  const { data: disasterData } = useDisasterInfo();
  const { selectedShelter, calculateRoute, selectShelter, clearRoute } = useEvacuationRoute();
  
  // Overpass APIから避難所を取得
  const {
    shelters: shelterData,
    loading: shelterLoading,
    error: shelterError,
    refetch: refetchShelter,
  } = useNearestShelter(
    currentLocation?.lat ?? null,
    currentLocation?.lng ?? null,
    !!currentLocation // 現在地が取得できている場合のみ検索
  );

  // 避難所リスト（公式避難所を優先表示、候補も含める）
  // official: 上位10件、candidate: 上位5件、合計最大15件
  const shelters = useMemo(() => {
    const officialTop10 = shelterData.official.slice(0, 10);
    const candidateTop5 = shelterData.candidate.slice(0, 5);
    return [...officialTop10, ...candidateTop5];
  }, [shelterData]);

  const currentRoute = useMemo(() => {
    if (!selectedShelter || !currentLocation) return null;
    return calculateRoute(currentLocation.lat, currentLocation.lng, selectedShelter);
  }, [selectedShelter, currentLocation, calculateRoute]);

  const recentEarthquakes = useMemo(() => {
    if (!disasterData?.earthquakes) return [];
    return disasterData.earthquakes
      .filter((eq) => eq.lat && eq.lng)
      .slice(0, 5);
  }, [disasterData]);

  const handleShelterClick = (shelter: Shelter) => {
    selectShelter(shelter);
  };

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
        {/* demo controls - always visible */}
        <div className="mx-4 mt-2 flex gap-2">
          <button
            onClick={() => {
              if (!currentLocation) {
                toast('位置情報が必要です');
                return;
              }
              if (demoQuake === null) {
                // start quake demo
                setDisasterMode(true);
                setDemoQuake({lat: currentLocation.lat, lng: currentLocation.lng});
                setDemoQuakeActive(true);
                toast.error('🔔 デモ地震を開始しました');
              } else {
                // stop quake demo
                setDemoQuake(null);
                setDemoQuakeActive(false);
                setDisasterMode(false);
                toast('✅ デモ地震を停止しました');
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium bg-accent text-accent-foreground border-accent"
          >
            {demoQuake ? 'デモ地震停止' : 'デモ地震開始'}
          </button>
          <button
            onClick={() => {
              if (!currentLocation) {
                toast('位置情報が必要です');
                return;
              }
              if (demoTsunami === null) {
                // start tsunami demo
                setDisasterMode(true);
                const id = Date.now();
                setDemoTsunami({lat:35.54,lng:139.73});
                addZone({
                  id,
                  lat: 35.54,
                  lng: 139.73,
                  radius: 3000,
                  label: '津波警報：大田区蒲田',
                });
                setDemoTsunamiZoneId(id);
                toast.error('🌊 大田区蒲田に津波が到達');
              } else {
                // stop tsunami demo
                setDemoTsunami(null);
                if (demoTsunamiZoneId !== null) removeZone(demoTsunamiZoneId);
                setDemoTsunamiZoneId(null);
                setDisasterMode(false);
                toast('✅ 津波デモを停止しました');
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium bg-accent text-accent-foreground border-accent"
          >
            {demoTsunami ? '津波デモ停止' : '津波デモ（蒲田）'}
          </button>
        </div>

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

            {/* demo circles */}

            {demoQuake && (
              <Circle
                center={[demoQuake.lat, demoQuake.lng]}
                radius={50000}
                pathOptions={{ color: 'red', fillOpacity: 0.1, weight: 1 }}
              />
            )}

            {demoTsunami && (
              <Circle
                center={[demoTsunami.lat, demoTsunami.lng]}
                radius={3000}
                pathOptions={{ color: 'blue', fillOpacity: 0.1, weight: 1 }}
              />
            )}

            {/* always-show green circle around user */}
            <Circle
              center={[currentLocation.lat, currentLocation.lng]}
              radius={2000}
              pathOptions={{ color: 'green', fillOpacity: 0.08, weight: 1 }}
            />

            <RecenterButton lat={currentLocation.lat} lng={currentLocation.lng} />
          </MapContainer>
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
        <div className="mx-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              近くの避難場所
              {shelters.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({shelterData.official.length}箇所 + 候補{shelterData.candidate.length}箇所)
                </span>
              )}
            </h2>
            {!shelterLoading && shelters.length > 0 && (
              <button
                onClick={refetchShelter}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                再検索
              </button>
            )}
          </div>

          {/* 避難所検索中 */}
          {shelterLoading && (
            <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-border bg-card/50">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">避難所を検索中...</p>
              <p className="text-xs text-muted-foreground/60 mt-1">段階的に検索しています</p>
            </div>
          )}

          {/* 避難所検索エラー */}
          {!shelterLoading && shelterError && (
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <AlertTriangle className="mx-auto h-5 w-5 text-warning mb-2" />
              <p className="text-sm font-medium text-muted-foreground">{shelterError}</p>
              <button
                onClick={refetchShelter}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary/80"
              >
                <RefreshCw className="h-3 w-3" />
                再試行
              </button>
            </div>
          )}

          {/* Route info card */}
          {currentRoute && (
            <div className="mb-4">
              <EvacuationRoute route={currentRoute} onClose={clearRoute} />
            </div>
          )}

          {/* 避難所リスト */}
          {!shelterLoading && !shelterError && shelters.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">近くに避難所が見つかりませんでした</p>
              <button
                onClick={refetchShelter}
                className="mt-2 text-xs text-primary font-medium"
              >
                再検索 →
              </button>
            </div>
          )}

          <div className="space-y-2">
            {shelters.map((shelter) => (
              <button
                key={shelter.id}
                onClick={() => handleShelterClick(shelter)}
                className={`flex items-center gap-3 rounded-xl border p-3 w-full text-left transition-all ${
                  selectedShelter?.id === shelter.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  shelter.category === 'official' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <MapPin className={`h-5 w-5 ${
                    shelter.category === 'official' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{shelter.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      shelter.category === 'official'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-accent text-accent-foreground'
                    }`}>
                      {shelter.type}
                    </span>
                    {shelter.capacity && (
                      <span className="text-[10px] text-muted-foreground">
                        収容: {shelter.capacity}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{formatDistance(shelter.distance)}</p>
                  {selectedShelter?.id === shelter.id && (
                    <p className="text-[10px] text-primary font-medium mt-0.5">ルート表示中</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

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
    </div>
  );
};

export default ShelterMap;
