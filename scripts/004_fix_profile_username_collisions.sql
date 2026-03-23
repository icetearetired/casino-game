CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_username TEXT;
  base_username TEXT;
  fallback_suffix TEXT;
  max_base_length INTEGER;
  profile_username TEXT;
BEGIN
  requested_username := NULLIF(trim(NEW.raw_user_meta_data ->> 'username'), '');
  fallback_suffix := substring(replace(NEW.id::text, '-', ''), 1, 8);

  base_username := COALESCE(
    requested_username,
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Guest_' || substring(replace(NEW.id::text, '-', ''), 1, 12)
  );

  profile_username := left(base_username, 30);

  IF EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE username = profile_username
      AND id <> NEW.id
  ) THEN
    max_base_length := GREATEST(30 - length(fallback_suffix) - 1, 1);
    profile_username := left(base_username, max_base_length) || '_' || fallback_suffix;
  END IF;

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
