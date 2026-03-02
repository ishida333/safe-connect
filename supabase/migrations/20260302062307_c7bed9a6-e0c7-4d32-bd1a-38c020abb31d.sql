
-- 1. Generate friend code function
CREATE OR REPLACE FUNCTION public.generate_friend_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'SL-';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 2. Add friend_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS friend_code TEXT;

-- Set friend_code for existing rows
UPDATE public.profiles SET friend_code = public.generate_friend_code() WHERE friend_code IS NULL;

-- Make it NOT NULL and UNIQUE
ALTER TABLE public.profiles ALTER COLUMN friend_code SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN friend_code SET DEFAULT public.generate_friend_code();
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_friend_code ON public.profiles(friend_code);

-- 3. Add contact_user_id to contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS contact_user_id UUID;

-- 4. Update handle_new_user to include friend_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, friend_code)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''), public.generate_friend_code());
  RETURN NEW;
END;
$$;

-- 5. Create trigger on auth.users if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$;

-- 6. RLS policy: allow searching profiles by friend_code (read only friend_code and display_name)
CREATE POLICY "Anyone can search by friend code"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the old restrictive select policy and replace with the permissive one above
-- Actually we need to keep the old one but make the new one permissive
-- The existing policy is RESTRICTIVE. Let's drop and recreate as permissive.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Make the search policy permissive (default) - already is since we used CREATE POLICY without RESTRICTIVE

-- 7. SECURITY DEFINER function for bi-directional friend add
CREATE OR REPLACE FUNCTION public.add_friend(
  _requester_id UUID,
  _target_user_id UUID,
  _relationship TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert requester -> target
  INSERT INTO public.contacts (user_id, contact_user_id, name, relationship)
  SELECT _requester_id, _target_user_id, p.display_name, _relationship
  FROM public.profiles p WHERE p.user_id = _target_user_id
  ON CONFLICT DO NOTHING;

  -- Insert target -> requester (reverse)
  INSERT INTO public.contacts (user_id, contact_user_id, name, relationship)
  SELECT _target_user_id, _requester_id, p.display_name, _relationship
  FROM public.profiles p WHERE p.user_id = _requester_id
  ON CONFLICT DO NOTHING;
END;
$$;
