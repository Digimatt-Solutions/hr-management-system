CREATE TABLE public.module_visibility (module_key text PRIMARY KEY CHECK (module_key IN ('dashboard','clients','employees','departments','leave','attendance','onboarding','performance','payroll','announcements','profile','sms')), enabled boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.module_visibility TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.module_visibility TO authenticated;
GRANT ALL ON public.module_visibility TO service_role;
ALTER TABLE public.module_visibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in users read module visibility" ON public.module_visibility FOR SELECT TO authenticated USING (true);
CREATE POLICY "Administrators manage module visibility" ON public.module_visibility FOR ALL TO authenticated USING (public.is_hr_admin(auth.uid())) WITH CHECK (public.is_hr_admin(auth.uid()));
COMMENT ON TABLE public.module_visibility IS 'Global presentation visibility only; existing role and record access policies remain authoritative. Settings stays accessible for recovery.';