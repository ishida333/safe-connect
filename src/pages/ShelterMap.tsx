import { MapPin, Navigation, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

const shelters = [
  { id: 1, name: '東京都立第一避難所', type: '広域避難場所', distance: '350m', capacity: '5,000人' },
  { id: 2, name: '中央区立小学校', type: '指定避難所', distance: '500m', capacity: '800人' },
  { id: 3, name: '日比谷公園', type: '広域避難場所', distance: '1.2km', capacity: '20,000人' },
  { id: 4, name: '区民センター', type: '指定避難所', distance: '1.5km', capacity: '1,200人' },
  { id: 5, name: '港区立中学校', type: '指定避難所', distance: '2.0km', capacity: '1,000人' },
];

const ShelterMap = () => {
  const navigate = useNavigate();
  const isDisasterMode = useAppStore((s) => s.isDisasterMode);

  return (
    <div className="min-h-screen pb-24">
      <header className={`sticky top-0 z-40 px-4 py-3 transition-colors duration-500 ${
        isDisasterMode ? 'bg-danger text-danger-foreground' : 'bg-primary text-primary-foreground'
      }`}>
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold">避難所マップ</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg">
        {/* Map placeholder */}
        <div className="relative mx-4 mt-4 h-48 rounded-2xl bg-accent/50 border border-border overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <MapPin className="h-8 w-8 mb-2 text-primary" />
            <p className="text-xs font-medium">マップ表示エリア</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Cloud接続後に利用可能</p>
          </div>
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Shelter list */}
        <div className="mx-4 mt-6">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <Navigation className="h-4 w-4 text-primary" />
            近くの避難場所
          </h2>

          <div className="space-y-2">
            {shelters.map((shelter) => (
              <div
                key={shelter.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all active:scale-[0.99]"
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
                  <p className="text-sm font-bold text-primary">{shelter.distance}</p>
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
