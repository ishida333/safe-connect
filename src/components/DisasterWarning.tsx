import { AlertTriangle, MapPin, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';

const DisasterWarning = () => {
  const { isDisasterMode, isEvacuated } = useAppStore();
  const navigate = useNavigate();

  if (!isDisasterMode || isEvacuated) return null;

  return (
    <div className="mx-4 mt-4 slide-up">
      <div className="relative overflow-hidden rounded-2xl border-2 border-danger bg-danger/10 disaster-glow">
        {/* Animated danger stripes background */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(4 80% 55%) 10px, hsl(4 80% 55%) 20px)',
          }} />
        </div>
        
        <div className="relative p-5">
          {/* Main warning */}
          <div className="flex items-center gap-3 mb-3">
            <div className="disaster-shake flex h-14 w-14 items-center justify-center rounded-full bg-danger shrink-0">
              <AlertTriangle className="h-8 w-8 text-danger-foreground" />
            </div>
            <div>
              <p className="text-2xl font-black text-danger tracking-tight leading-tight">
                ⚠ 今すぐ避難して！
              </p>
              <p className="text-xs text-danger/80 font-semibold mt-0.5">
                あなたの地域で災害が発生しています
              </p>
            </div>
          </div>

          {/* Guidance */}
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2 rounded-xl bg-danger/10 p-3 border border-danger/20">
              <span className="text-lg leading-none mt-0.5">🏃</span>
              <div>
                <p className="text-sm font-bold text-danger">最寄りの避難所へ向かってください</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  建物の中にいる場合は頭を保護し、揺れが収まってから避難
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-danger/10 p-3 border border-danger/20">
              <span className="text-lg leading-none mt-0.5">📱</span>
              <div>
                <p className="text-sm font-bold text-foreground">あなたの位置情報は登録者に共有されています</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  避難完了後は下のボタンで報告してください
                </p>
              </div>
            </div>
          </div>

          {/* Quick action to shelter map */}
          <button
            onClick={() => navigate('/map')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-danger p-3 text-danger-foreground font-bold text-sm transition-transform active:scale-[0.98] disaster-pulse"
          >
            <MapPin className="h-5 w-5" />
            避難所マップを開く
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisasterWarning;
