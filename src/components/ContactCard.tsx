import type { Contact } from '@/hooks/useContacts';
import type { ContactStatus } from '@/hooks/useContactStatuses';
import { MapPin, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  liveStatus?: ContactStatus;
}

const ContactCard = ({ contact, liveStatus }: ContactCardProps) => {
  // Use live status from realtime if available, fall back to static contact fields
  const inDisasterZone = liveStatus?.is_in_disaster_zone ?? contact.is_in_disaster_zone;
  const evacuated = liveStatus?.is_evacuated ?? contact.is_evacuated;
  const hasLocation = liveStatus?.last_lat != null || contact.last_lat != null;

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 ${
      inDisasterZone
        ? evacuated
          ? 'border-safe/30 bg-safe/5'
          : 'border-danger/30 bg-danger/5'
        : 'border-border bg-card'
    }`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
        inDisasterZone
          ? evacuated
            ? 'bg-safe text-safe-foreground'
            : 'bg-danger text-danger-foreground'
          : 'bg-secondary text-secondary-foreground'
      }`}>
        {contact.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{contact.name}</p>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
            {contact.relationship}
          </span>
        </div>

        {inDisasterZone ? (
          <div className="flex items-center gap-1 mt-0.5">
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
            {hasLocation && (
              <span className="text-[10px] text-muted-foreground ml-1 flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" />
                位置情報共有中
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">平常時 — 位置情報非公開</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
