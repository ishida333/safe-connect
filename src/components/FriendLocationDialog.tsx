import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const friendIcon = new L.DivIcon({
  html: `<div style="width:16px;height:16px;background:#e74c3c;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  lat: number;
  lng: number;
}

const FriendLocationDialog = ({ open, onOpenChange, name, lat, lng }: Props) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-sm">{name} の現在地</DialogTitle>
        </DialogHeader>
        <div className="h-64 w-full">
          {open && (
            <MapContainer
              center={[lat, lng]}
              zoom={15}
              className="h-full w-full"
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[lat, lng]} icon={friendIcon}>
                <Popup>{name}</Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
        <div className="p-4">
          <Button asChild variant="outline" className="w-full gap-2 rounded-xl">
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Google Maps で開く
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendLocationDialog;
