import { ArrowLeft, Bell, Volume2, Vibrate, MapPin, Clock, Shield, ChevronRight, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, SCALE_OPTIONS } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { useMyProfile } from '@/hooks/useContacts';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, isDisasterMode } = useAppStore();
  const { user, signOut } = useAuth();
  const { data: profile } = useMyProfile();
  const [copied, setCopied] = useState(false);

  const copyFriendCode = () => {
    if (!profile?.friend_code) return;
    navigator.clipboard.writeText(profile.friend_code);
    setCopied(true);
    toast.success('コピーしました');
    setTimeout(() => setCopied(false), 2000);
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
          <h1 className="text-base font-bold">設定</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-4 space-y-6">
        {/* Account */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">アカウント</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 p-3 border-b border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-[10px] text-muted-foreground">ログイン中</p>
              </div>
            </div>
            {profile?.friend_code && (
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground">あなたのフレンドコード</p>
                  <p className="text-sm font-bold font-mono tracking-wider">{profile.friend_code}</p>
                </div>
                <button
                  onClick={copyFriendCode}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'コピー済み' : 'コピー'}
                </button>
              </div>
            )}
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 p-3 text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">ログアウト</span>
            </button>
          </div>
        </section>

        {/* Disaster settings */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">被災モード設定</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-danger" />
                <div>
                  <p className="text-sm font-medium">自動被災モード震度</p>
                  <p className="text-[10px] text-muted-foreground">この震度以上で自動発動</p>
                </div>
              </div>
              <Select
                value={String(settings.disasterThreshold)}
                onValueChange={(v) => updateSettings({ disasterThreshold: Number(v) })}
              >
                <SelectTrigger className="w-24 rounded-lg h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCALE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">位置情報自動共有</p>
                  <p className="text-[10px] text-muted-foreground">被災モード時に自動で位置を共有</p>
                </div>
              </div>
              <Switch
                checked={settings.autoShareLocation}
                onCheckedChange={(v) => updateSettings({ autoShareLocation: v })}
              />
            </div>

            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">位置共有時間</p>
                  <p className="text-[10px] text-muted-foreground">被災モード中の共有持続時間</p>
                </div>
              </div>
              <Select
                value={String(settings.shareLocationDuration)}
                onValueChange={(v) => updateSettings({ shareLocationDuration: Number(v) })}
              >
                <SelectTrigger className="w-20 rounded-lg h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6時間</SelectItem>
                  <SelectItem value="12">12時間</SelectItem>
                  <SelectItem value="24">24時間</SelectItem>
                  <SelectItem value="48">48時間</SelectItem>
                  <SelectItem value="72">72時間</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Notification settings */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">通知設定</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-warning" />
                <p className="text-sm font-medium">プッシュ通知</p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(v) => updateSettings({ notificationsEnabled: v })}
              />
            </div>

            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">警報音</p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(v) => updateSettings({ soundEnabled: v })}
              />
            </div>

            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <Vibrate className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">バイブレーション</p>
              </div>
              <Switch
                checked={settings.vibrationEnabled}
                onCheckedChange={(v) => updateSettings({ vibrationEnabled: v })}
              />
            </div>
          </div>
        </section>

        {/* App info */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">アプリ情報</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            <div className="flex items-center justify-between p-3">
              <p className="text-sm font-medium">バージョン</p>
              <span className="text-xs text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-3">
              <p className="text-sm font-medium">利用規約</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-3">
              <p className="text-sm font-medium">プライバシーポリシー</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-3">
              <p className="text-sm font-medium">お問い合わせ</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
