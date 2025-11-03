-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create game_states table to store player game data
CREATE TABLE public.game_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  money DECIMAL NOT NULL DEFAULT 1000000,
  reputation INTEGER NOT NULL DEFAULT 50,
  fleet JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_flights INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL NOT NULL DEFAULT 0,
  UNIQUE(user_id)
);

-- Enable RLS on game_states
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

-- Game states policies
CREATE POLICY "Users can view own game state"
  ON public.game_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game state"
  ON public.game_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game state"
  ON public.game_states FOR UPDATE
  USING (auth.uid() = user_id);

-- Create active_flights table for real-time multiplayer view
CREATE TABLE public.active_flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  aircraft_model TEXT NOT NULL,
  from_airport TEXT NOT NULL,
  to_airport TEXT NOT NULL,
  progress DECIMAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estimated_arrival TIMESTAMPTZ,
  CONSTRAINT progress_range CHECK (progress >= 0 AND progress <= 100)
);

-- Enable RLS on active_flights
ALTER TABLE public.active_flights ENABLE ROW LEVEL SECURITY;

-- Active flights policies (everyone can see all flights)
CREATE POLICY "Active flights are viewable by everyone"
  ON public.active_flights FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own flights"
  ON public.active_flights FOR ALL
  USING (auth.uid() = user_id);

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.username,
  p.avatar_url,
  gs.total_revenue,
  gs.total_flights,
  gs.money,
  gs.reputation,
  JSONB_ARRAY_LENGTH(gs.fleet) as fleet_size,
  gs.last_updated
FROM public.game_states gs
JOIN public.profiles p ON gs.user_id = p.id
ORDER BY gs.total_revenue DESC
LIMIT 100;

-- Enable realtime for active_flights
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_flights;

-- Function to update profile timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for game_states
CREATE TRIGGER update_game_states_updated_at
  BEFORE UPDATE ON public.game_states
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || SUBSTRING(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();