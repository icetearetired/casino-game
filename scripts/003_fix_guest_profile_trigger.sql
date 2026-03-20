-- Ensure new profiles get a unique fallback username during signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_username TEXT;
  profile_username TEXT;
  username_suffix INTEGER := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  requested_username := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data ->> 'username'), ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Guest_' || substring(NEW.id::text, 1, 8)
  );

  profile_username := requested_username;

  LOOP
    BEGIN
      INSERT INTO public.profiles (id, username, balance)
      VALUES (
        NEW.id,
        profile_username,
        1000
      );
      EXIT;
    EXCEPTION
      WHEN unique_violation THEN
        username_suffix := username_suffix + 1;
        profile_username := requested_username || '_' || username_suffix::text;
    END;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
