import { Shield, MapPin, Users, ChevronRight, CheckCircle2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { useContactStatuses } from '@/hooks/useContactStatuses';
import StatusBanner from '@/components/StatusBanner';
import ContactCard from '@/components/ContactCard';
import DisasterWarning from '@/components/DisasterWarning';

const Index = () => {
  const navigate = useNavigate();
  const { isDisasterMode, isEvacuated, toggleDisasterMode, setEvacuated } = useAppStore();
  const { signOut } = useAuth();
  const { data: contacts = [], isLoading } = useContacts();
  const statuses = useContactStatuses(contacts);

  return (
    <div className="min-h-screen pb-24">
      <header className={`sticky top-0 z-40 px-4 py-3 transition-colors duration-500 ${
        isDisasterMode ? 'bg-danger text-danger-foreground' : 'bg-primary text-primary-foreground'
      }`}>
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h1 className="text-base font-bold tracking-tight">セーフリンク</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium opacity-80">
              {isDisasterMode ? '⚠ 被災モード' : '✓ 通常モード'}
            </span>
            <button onClick={signOut} className="opacity-70 hover:opacity-100 transition-opacity">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg">
        {/* Big disaster warning when in disaster mode */}
        <DisasterWarning />

        {/* Status banner (safe / evacuated only) */}
        {(!isDisasterMode || isEvacuated) && <StatusBanner />}

        <div className="mx-4 mt-4 space-y-3">
          {isDisasterMode && !isEvacuated && (
            <button
              onClick={() => setEvacuated(true)}
              className="slide-up flex w-full items-center justify-center gap-2 rounded-2xl bg-safe p-4 text-safe-foreground font-bold shadow-lg transition-transform active:scale-[0.98]"
            >
              <CheckCircle2 className="h-5 w-5" />
              避難完了を報告する
            </button>
          )}

          <button
            onClick={toggleDisasterMode}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl p-3 text-sm font-medium transition-all active:scale-[0.98] ${
              isDisasterMode
                ? 'bg-muted text-muted-foreground'
                : 'bg-danger/10 text-danger border border-danger/20'
            }`}
          >
            {isDisasterMode ? '通常モードに戻す（デモ）' : '被災モードをテスト（デモ）'}
          </button>
        </div>

        <div className="mx-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              登録者の状況
            </h2>
            <button
              onClick={() => navigate('/contacts')}
              className="flex items-center gap-0.5 text-xs text-primary font-medium"
            >
              すべて見る
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">まだ連絡先がありません</p>
              <button onClick={() => navigate('/contacts')} className="mt-2 text-xs text-primary font-medium">
                追加する →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.slice(0, 3).map((contact) => (
                <ContactCard key={contact.id} contact={contact} liveStatus={contact.contact_user_id ? statuses[contact.contact_user_id] : undefined} />
              ))}
            </div>
          )}
        </div>

        <div className="mx-4 mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/map')}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-all active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <MapPin className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xs font-medium">避難所マップ</span>
          </button>
          <button
            onClick={() => navigate('/alerts')}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-all active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <Shield className="h-5 w-5 text-warning" />
            </div>
            <span className="text-xs font-medium">災害情報</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
