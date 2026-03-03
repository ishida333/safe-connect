import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, AlertTriangle, MapPin, Clock, User } from 'lucide-react';
import type { Contact } from '@/hooks/useContacts';
import type { ContactStatus } from '@/hooks/useContactStatuses';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contact: Contact;
  liveStatus?: ContactStatus;
}

const ContactProfileDialog = ({ open, onOpenChange, contact, liveStatus }: Props) => {
  const inDisasterZone = liveStatus?.is_in_disaster_zone ?? contact.is_in_disaster_zone;
  const evacuated = liveStatus?.is_evacuated ?? contact.is_evacuated;
  const hasLocation = (liveStatus?.last_lat ?? contact.last_lat) != null;
  const updatedAt = liveStatus?.status_updated_at;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">{contact.name} のプロフィール</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <Avatar className="h-20 w-20">
            <AvatarFallback className={`text-2xl font-bold ${
              inDisasterZone
                ? evacuated ? 'bg-safe text-safe-foreground' : 'bg-danger text-danger-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}>
              {contact.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h3 className="text-lg font-bold">{contact.name}</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {contact.relationship}
            </span>
          </div>

          <div className="w-full space-y-2 rounded-xl border border-border bg-card p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">ステータス</h4>

            {inDisasterZone ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {evacuated ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-safe" />
                      <span className="text-sm font-medium text-safe">避難完了</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-danger" />
                      <span className="text-sm font-medium text-danger">被災エリア内</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {hasLocation ? '位置情報共有中' : '位置情報なし'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">平常時</span>
              </div>
            )}

            {updatedAt && (
              <p className="text-[10px] text-muted-foreground/60 pt-1">
                最終更新: {new Date(updatedAt).toLocaleString('ja-JP')}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactProfileDialog;
