import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('ログインしました');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success('確認メールを送信しました。メールを確認してください。');
      }
    } catch (error: any) {
      toast.error(error.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">セーフリンク</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin ? 'アカウントにログイン' : '新規アカウント作成'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="表示名"
                className="rounded-xl pl-10"
                required={!isLogin}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              className="rounded-xl pl-10"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード（6文字以上）"
              className="rounded-xl pl-10"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? 'ログイン' : 'アカウント作成'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 font-semibold text-primary underline-offset-4 hover:underline"
          >
            {isLogin ? '新規登録' : 'ログイン'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
