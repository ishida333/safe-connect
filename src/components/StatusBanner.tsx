import { Shield, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const StatusBanner = () => {
  const { isDisasterMode, isEvacuated } = useAppStore();

  if (!isDisasterMode) {
    return (
      <div className="safe-breathe mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-primary/10 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-primary">安全です</p>
          <p className="text-xs text-muted-foreground">現在、あなたの地域に災害情報はありません</p>
        </div>
      </div>
    );
  }

  if (isEvacuated) {
    return (
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-safe/10 p-4 border border-safe/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-safe">
          <Shield className="h-6 w-6 text-safe-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-safe">避難完了</p>
          <p className="text-xs text-muted-foreground">あなたの避難状況は登録者に共有されています</p>
        </div>
      </div>
    );
  }

  return (
    <div className="disaster-pulse mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-danger/10 p-4 border border-danger/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger">
        <AlertTriangle className="h-6 w-6 text-danger-foreground" />
      </div>
      <div>
        <p className="text-sm font-bold text-danger">被災モード</p>
        <p className="text-xs text-muted-foreground">あなたの現在地が登録者に共有されています</p>
      </div>
    </div>
  );
};

export default StatusBanner;
