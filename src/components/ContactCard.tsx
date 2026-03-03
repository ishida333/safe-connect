import { useState } from 'react';
import type { Contact } from '@/hooks/useContacts';
import type { ContactStatus } from '@/hooks/useContactStatuses';
import { MapPin, CheckCircle2, AlertTriangle, Clock, Navigation2 } from 'lucide-react';
import FriendLocationDialog from '@/components/FriendLocationDialog';
import ContactProfileDialog from '@/components/ContactProfileDialog';

interface ContactCardProps {
  contact: Contact;
  liveStatus?: ContactStatus;
}

const ContactCard = ({ contact, liveStatus }: ContactCardProps) => {
  const [showLocation, setShowLocation] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const inDisasterZone = liveStatus?.is_in_disaster_zone ?? contact.is_in_disaster_zone;
  const evacuated = liveStatus?.is_evacuated ?? contact.is_evacuated;
  const friendLat = liveStatus?.last_lat ?? contact.last_lat;
  const friendLng = liveStatus?.last_lng ?? contact.last_lng;
  const hasLocation = friendLat != null && friendLng != null;

  return (
    <>
      <div className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 ${
        inDisasterZone
          ? evacuated
            ? 'border-safe/30 bg-safe/5'
            : 'border-danger/30 bg-danger/5'
          : 'border-border bg-card'
      }`}>
        <button
          onClick={() => setShowProfile(true)}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shrink-0 transition-transform active:scale-90 ${
            inDisasterZone
              ? evacuated
                ? 'bg-safe text-safe-foreground'
                : 'bg-danger text-danger-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {contact.name.charAt(0)}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate">{contact.name}</p>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
              {contact.relationship}
            </span>
          </div>

          {inDisasterZone ? (
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {evacuated ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-safe" />
                  <span className="text-xs text-safe font-medium">避難完了</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 text-danger" />
                  <span className="text-xs text-danger font-medium">被災エリア内</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">平常時 — 位置情報非公開</span>
            </div>
          )}
        </div>

        {inDisasterZone && hasLocation && (
          <button
            onClick={() => setShowLocation(true)}
            className="shrink-0 flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition-all active:scale-95"
          >
            <Navigation2 className="h-3.5 w-3.5" />
            位置を確認
          </button>
        )}
        {inDisasterZone && !hasLocation && (
          <span className="shrink-0 text-[10px] text-muted-foreground flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            位置不明
          </span>
        )}
      </div>

      {hasLocation && (
        <FriendLocationDialog
          open={showLocation}
          onOpenChange={setShowLocation}
          name={contact.name}
          lat={friendLat!}
          lng={friendLng!}
        />
      )}

      <ContactProfileDialog
        open={showProfile}
        onOpenChange={setShowProfile}
        contact={contact}
        liveStatus={liveStatus}
      />
    </>
  );
};

export default ContactCard;
