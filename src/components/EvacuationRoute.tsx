import { Navigation, Clock, MapPin, ArrowRight, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDistance, type EvacuationRoute as RouteType, type RouteStep } from '@/hooks/useEvacuationRoute';

interface EvacuationRouteProps {
  route: RouteType;
  onClose?: () => void;
}

const getStepIcon = (icon: RouteStep['icon']) => {
  switch (icon) {
    case 'right':
      return <ArrowUpRight className="h-4 w-4" />;
    case 'left':
      return <ArrowDownLeft className="h-4 w-4" />;
    case 'arrive':
      return <CheckCircle2 className="h-4 w-4 text-safe" />;
    default:
      return <ArrowRight className="h-4 w-4" />;
  }
};

export const EvacuationRoute = ({ route, onClose }: EvacuationRouteProps) => {
  return (
    <Card className="overflow-hidden border-primary/20">
      <div className="bg-primary/5 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-bold text-sm">{route.shelter.name}</h3>
            <p className="text-xs text-muted-foreground">{route.shelter.type}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            閉じる
          </button>
        )}
      </div>

      <div className="px-4 py-3 bg-card space-y-3">
        {/* サマリー */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{formatDistance(route.totalDistance)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">約{route.estimatedTime}分</span>
          </div>
        </div>

        {/* ルート詳細 */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-1">避難経路</div>
          {route.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3 py-2 border-l-2 border-primary/20 pl-3"
            >
              <div className="flex-shrink-0 mt-0.5 text-primary">
                {getStepIcon(step.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{step.instruction}</p>
                {step.distance > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistance(step.distance)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 注意事項 */}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            ⚠️ この経路は目安です。実際の道路状況、障害物、危険箇所を確認しながら安全に避難してください。
          </p>
        </div>
      </div>
    </Card>
  );
};
