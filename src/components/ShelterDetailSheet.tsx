import type { ShelterWithDistance } from '@/hooks/useShelters';
import { formatDistance } from '@/hooks/useShelters';
import { MapPin, ExternalLink, Navigation2 } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface Props {
  shelter: ShelterWithDistance | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const ShelterDetailSheet = ({ shelter, open, onOpenChange }: Props) => {
  if (!shelter) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${shelter.lat},${shelter.lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-left">
            <MapPin className="h-5 w-5 text-primary shrink-0" />
            {shelter.name}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
              {shelter.type}
            </span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              {formatDistance(shelter.distance)}
            </span>
          </div>

          {shelter.address && (
            <p className="text-sm text-muted-foreground">📍 {shelter.address}</p>
          )}
          {shelter.operator && (
            <p className="text-sm text-muted-foreground">🏢 管理: {shelter.operator}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button asChild className="flex-1 gap-2 rounded-xl">
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation2 className="h-4 w-4" />
                経路を表示
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1 gap-2 rounded-xl">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Google Maps
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShelterDetailSheet;
