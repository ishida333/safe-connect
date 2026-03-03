import { useState } from 'react';
import { UserPlus, Trash2, Users, ArrowLeft, Search, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useContacts, useAddContactByFriendCode, useDeleteContact, useSearchByFriendCode } from '@/hooks/useContacts';
import { useContactStatuses } from '@/hooks/useContactStatuses';
import ContactCard from '@/components/ContactCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const Contacts = () => {
  const navigate = useNavigate();
  const isDisasterMode = useAppStore((s) => s.isDisasterMode);
  const { data: contacts = [], isLoading } = useContacts();
  const statuses = useContactStatuses(contacts);
  const addContact = useAddContactByFriendCode();
  const deleteContact = useDeleteContact();
  const searchByCode = useSearchByFriendCode();

  const [friendCode, setFriendCode] = useState('');
  const [relationship, setRelationship] = useState('');
  const [open, setOpen] = useState(false);
  const [foundUser, setFoundUser] = useState<{ user_id: string; display_name: string } | null>(null);

  const handleSearch = () => {
    if (!friendCode.trim()) return;
    searchByCode.mutate(friendCode, {
      onSuccess: (data) => setFoundUser(data),
      onError: () => {
        setFoundUser(null);
        toast.error('ユーザーが見つかりません');
      },
    });
  };

  const handleAdd = () => {
    if (!friendCode || !relationship || !foundUser) return;
    addContact.mutate(
      { friendCode, relationship },
      {
        onSuccess: () => {
          setFriendCode('');
          setRelationship('');
          setFoundUser(null);
          setOpen(false);
          toast.success('友達を追加しました');
        },
        onError: (e) => toast.error(e.message || '追加に失敗しました'),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteContact.mutate(id, {
      onSuccess: () => toast.success('連絡先を削除しました'),
    });
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setFriendCode('');
      setRelationship('');
      setFoundUser(null);
      searchByCode.reset();
    }
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
          <h1 className="text-base font-bold">連絡先</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{contacts.length}人の登録者</p>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-full">
                <UserPlus className="h-4 w-4" />
                追加
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 rounded-2xl">
              <DialogHeader>
                <DialogTitle>フレンドコードで追加</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">フレンドコード</label>
                  <div className="flex gap-2">
                    <Input
                      value={friendCode}
                      onChange={(e) => {
                        setFriendCode(e.target.value.toUpperCase());
                        setFoundUser(null);
                      }}
                      placeholder="例: SL-A3X9K2"
                      className="rounded-xl font-mono tracking-wider"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSearch}
                      disabled={!friendCode.trim() || searchByCode.isPending}
                      className="shrink-0 rounded-xl"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {foundUser && (
                  <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{foundUser.display_name || '名前未設定'}</p>
                      <p className="text-[10px] text-muted-foreground">ユーザーが見つかりました</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">関係</label>
                  <Select value={relationship} onValueChange={setRelationship}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="家族">家族</SelectItem>
                      <SelectItem value="友達">友達</SelectItem>
                      <SelectItem value="同僚">同僚</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAdd}
                  className="w-full rounded-xl"
                  disabled={!foundUser || !relationship || addContact.isPending}
                >
                  追加する
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div key={contact.id} className="group relative">
                <ContactCard contact={contact} liveStatus={contact.contact_user_id ? statuses[contact.contact_user_id] : undefined} />
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="absolute right-2 top-2 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">まだ登録者がいません</p>
            <p className="text-xs text-muted-foreground/70 mt-1">フレンドコードで友達を追加しましょう</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
