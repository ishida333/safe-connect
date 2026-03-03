import { ArrowLeft, AlertTriangle, Waves, Activity, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useDisasterInfo } from '@/hooks/useDisasterInfo';

const Alerts = () => {
  const navigate = useNavigate();
  const isDisasterMode = useAppStore((s) => s.isDisasterMode);
  const { data, isLoading, refetch, dataUpdatedAt } = useDisasterInfo();

  const allAlerts = [
    ...(data?.earthquakes || []),
    ...(data?.tsunamis || []),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const formatTime = (time: string) => {
    try {
      const d = new Date(time);
      if (isNaN(d.getTime())) return time;
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'たった今';
      if (diffMin < 60) return `${diffMin}分前`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return `${diffH}時間前`;
      return `${Math.floor(diffH / 24)}日前`;
    } catch {
      return time;
    }
  };

  const getSeverity = (alert: any): 'high' | 'medium' | 'low' => {
    if (alert.type === 'tsunami') return alert.cancelled ? 'low' : 'high';
    if (alert.maxScale >= 45) return 'high';
    if (alert.maxScale >= 30) return 'medium';
    return 'low';
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
          <button onClick={() => refetch()} className="ml-auto opacity-70 hover:opacity-100">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-4">
        <div className="rounded-2xl border border-border bg-accent/30 p-3 mb-4">
          <p className="text-xs text-muted-foreground text-center">
<<<<<<< HEAD
            🔔 P2P地震情報APIからリアルタイム取得中（60秒ごとに自動更新）
=======
            🔔 気象庁の地震・津波情報をリアルタイム取得中（60秒ごとに自動更新）
>>>>>>> 255b74762e59902324faeec9fddaac636d7a38ee
          </p>
          {dataUpdatedAt > 0 && (
            <p className="text-[10px] text-muted-foreground/60 text-center mt-1">
              最終更新: {new Date(dataUpdatedAt).toLocaleTimeString('ja-JP')}
            </p>
          )}
        </div>

        <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          最新の災害情報
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : allAlerts.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            現在、災害情報はありません
          </div>
        ) : (
          <div className="space-y-2">
            {allAlerts.map((alert) => {
              const severity = getSeverity(alert);
              const Icon = alert.type === 'tsunami' ? Waves : Activity;
              return (
                <div key={alert.id} className={`flex items-center gap-3 rounded-xl border p-3 ${severityStyles[severity]}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    severity === 'high' ? 'bg-danger/15' : severity === 'medium' ? 'bg-warning/15' : 'bg-muted'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      severity === 'high' ? 'text-danger' : severity === 'medium' ? 'text-warning' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${severityDot[severity]}`} />
                      <p className="text-sm font-semibold">{alert.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(alert.time)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
