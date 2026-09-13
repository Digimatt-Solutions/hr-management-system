CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_first text;
  v_last text;
  v_role public.user_role;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('peoplehub_first_super_admin'));

  v_full_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1));
  v_first := split_part(v_full_name, ' ', 1);
  v_last := NULLIF(trim(substr(v_full_name, length(v_first) + 1)), '');

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, v_full_name)
  ON CONFLICT (id) DO NOTHING;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    v_role := 'staff';
  ELSE
    v_role := 'admin';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.employees (profile_id, employee_code, first_name, last_name, work_email, status)
  VALUES (NEW.id, 'EMP-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 6)), v_first, COALESCE(v_last, ''), NEW.email, 'active')
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.admin_exists() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;