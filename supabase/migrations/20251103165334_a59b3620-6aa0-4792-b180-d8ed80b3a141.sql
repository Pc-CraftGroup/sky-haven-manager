-- Fix security issues from previous migration

-- Drop and recreate the leaderboard view without security definer
DROP VIEW IF EXISTS public.leaderboard;

CREATE OR REPLACE VIEW public.leaderboard 
WITH (security_invoker=true)
AS
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

-- Fix search_path for handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;