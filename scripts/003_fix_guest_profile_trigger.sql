CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_username TEXT;
BEGIN
  profile_username := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'username', ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Guest_' || substring(NEW.id::text, 1, 8)
  );

  INSERT INTO public.profiles (id, username, balance)
  VALUES (
    NEW.id,
    profile_username,
    1000
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
