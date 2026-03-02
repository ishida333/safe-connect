
-- Add disaster/location status fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_in_disaster_zone BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_evacuated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS last_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE;

-- Enable realtime for profiles so contacts can see live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
