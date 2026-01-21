DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  role text DEFAULT 'CLIENT_ADMIN' CHECK (role IN ('PROVIDER_ADMIN', 'CLIENT_ADMIN')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'CLIENT_ADMIN');
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, service_role;
GRANT SELECT ON TABLE public.profiles TO anon, authenticated;
