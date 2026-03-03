import { useMemo } from 'react';
import { Navigation, MapPin, Crosshair, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDisasterInfo } from '@/hooks/useDisasterInfo';
import { useShelters, formatDistance } from '@/hooks/useShelters';

const ShelterMap = () => {
  const navigate = useNavigate();
  const isDisasterMode = useAppStore((s) => s.isDisasterMode);
  const { currentLocation, locationLoading, locationError, requestLocation } = useGeolocation({ autoRequest: false });
  const { data: disasterData } = useDisasterInfo();
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
          <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            近くの避難場所
          </h2>

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
                </div>
              ))}
            </div>
          )}
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
