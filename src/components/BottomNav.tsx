import { Home, Users, Map, AlertTriangle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

const tabs = [
  { path: '/', icon: Home, label: 'ホーム' },
  { path: '/contacts', icon: Users, label: '連絡先' },
  { path: '/map', icon: Map, label: 'マップ' },
  { path: '/alerts', icon: AlertTriangle, label: '災害情報' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDisasterMode = useAppStore((s) => s.isDisasterMode);

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t transition-colors duration-500 ${
      isDisasterMode ? 'border-danger/30 bg-card' : 'border-border bg-card'
    }`}>
      <div className="mx-auto flex max-w-lg items-center justify-around py-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive
                  ? isDisasterMode
                    ? 'text-danger'
                    : 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
