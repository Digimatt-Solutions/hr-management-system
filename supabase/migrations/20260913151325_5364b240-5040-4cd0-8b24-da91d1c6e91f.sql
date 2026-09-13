CREATE TABLE public.app_setup_state (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  admin_exists boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.app_setup_state TO anon, authenticated;
GRANT ALL ON public.app_setup_state TO service_role;
ALTER TABLE public.app_setup_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read setup availability"
ON public.app_setup_state
FOR SELECT
TO anon, authenticated
USING (singleton = true);

INSERT INTO public.app_setup_state (singleton, admin_exists)
VALUES (true, EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'));

CREATE OR REPLACE FUNCTION public.sync_app_setup_state()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.app_setup_state
  SET admin_exists = EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  WHERE singleton = true;
  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.sync_app_setup_state() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER sync_app_setup_state_after_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH STATEMENT
EXECUTE FUNCTION public.sync_app_setup_state();

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT admin_exists FROM public.app_setup_state WHERE singleton = true), true);
$$;

REVOKE ALL ON FUNCTION public.admin_exists() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;