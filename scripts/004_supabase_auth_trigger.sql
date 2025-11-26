-- Create a trigger to automatically create a user profile when a new user signs up via Supabase Auth
-- This runs after a user is inserted into auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    username,
    password_hash,
    balance,
    level,
    xp,
    total_wagered,
    total_won,
    total_winnings,
    games_played,
    is_admin,
    role,
    referral_code,
    has_infinite_funds,
    is_tester,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    '', -- No password hash needed, Supabase handles auth
    1000, -- Starting balance
    1, -- Starting level
    0, -- Starting XP
    0, -- Total wagered
    0, -- Total won
    0, -- Total winnings
    0, -- Games played
    false, -- Not admin by default
    'user', -- Default role
    substr(md5(random()::text), 1, 8), -- Random referral code
    false, -- No infinite funds
    false, -- Not a tester
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
