
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  friend_code TEXT NOT NULL DEFAULT '',
  is_in_disaster_zone BOOLEAN NOT NULL DEFAULT false,
  is_evacuated BOOLEAN NOT NULL DEFAULT false,
  last_lat DOUBLE PRECISION,
  last_lng DOUBLE PRECISION,
  status_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT '友達',
  is_in_disaster_zone BOOLEAN NOT NULL DEFAULT false,
  is_evacuated BOOLEAN NOT NULL DEFAULT false,
  last_lat DOUBLE PRECISION,
  last_lng DOUBLE PRECISION,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles (for friend search), update own
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Contacts: users can CRUD own contacts
CREATE POLICY "Users can read own contacts" ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON public.contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for profiles (for contact status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Friend code generator function
CREATE OR REPLACE FUNCTION public.generate_friend_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'SL-';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, friend_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    public.generate_friend_code()
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add friend function (bi-directional)
CREATE OR REPLACE FUNCTION public.add_friend(
  _requester_id UUID,
  _target_user_id UUID,
  _relationship TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_name TEXT;
  requester_name TEXT;
BEGIN
  SELECT display_name INTO target_name FROM profiles WHERE user_id = _target_user_id;
  SELECT display_name INTO requester_name FROM profiles WHERE user_id = _requester_id;

  -- Add contact for requester
  INSERT INTO contacts (user_id, contact_user_id, name, relationship)
  VALUES (_requester_id, _target_user_id, COALESCE(NULLIF(target_name, ''), '名前未設定'), _relationship)
  ON CONFLICT DO NOTHING;

  -- Add reverse contact for target
  INSERT INTO contacts (user_id, contact_user_id, name, relationship)
  VALUES (_target_user_id, _requester_id, COALESCE(NULLIF(requester_name, ''), '名前未設定'), _relationship)
  ON CONFLICT DO NOTHING;
END;
$$;
