import { ArrowLeft, AlertTriangle, Waves, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

const mockAlerts = [
  {
    id: 1,
    type: 'earthquake' as const,
    title: '地震情報（デモ）',
    detail: '震度5強 / 東京都23区',
    time: '2分前',
    severity: 'high' as const,
  },
  {
    id: 2,
    type: 'tsunami' as const,
    title: '津波注意報（デモ）',
    detail: '予想高さ1m / 東京湾沿岸',
    time: '5分前',
    severity: 'medium' as const,
  },
  {
    id: 3,
    type: 'earthquake' as const,
    title: '地震情報（デモ）',
    detail: '震度3 / 千葉県北西部',
    time: '1時間前',
    severity: 'low' as const,
  },
];

const alertIcon = {
  earthquake: Activity,
  tsunami: Waves,
};

const severityStyles = {
  high: 'border-danger/30 bg-danger/5',
  medium: 'border-warning/30 bg-warning/5',
  low: 'border-border bg-card',
};

const severityDot = {
  high: 'bg-danger',
  medium: 'bg-warning',
  low: 'bg-muted-foreground/30',
};

const Alerts = () => {
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
          <h1 className="text-base font-bold">災害情報</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-4">
        <div className="rounded-2xl border border-border bg-accent/30 p-3 mb-4">
          <p className="text-xs text-muted-foreground text-center">
            🔔 Cloud接続後、リアルタイムで気象庁の地震・津波情報を取得できます
          </p>
        </div>

        <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          最新の災害情報（デモ）
        </h2>

        <div className="space-y-2">
          {mockAlerts.map((alert) => {
            const Icon = alertIcon[alert.type];
            return (
              <div
                key={alert.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${severityStyles[alert.severity]}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  alert.severity === 'high' ? 'bg-danger/15' : alert.severity === 'medium' ? 'bg-warning/15' : 'bg-muted'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    alert.severity === 'high' ? 'text-danger' : alert.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${severityDot[alert.severity]}`} />
                    <p className="text-sm font-semibold">{alert.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{alert.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
