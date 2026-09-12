-- ENUMS
CREATE TYPE public.employment_type AS ENUM ('full_time','part_time','contract','intern','temporary');
CREATE TYPE public.employee_status AS ENUM ('active','probation','on_leave','suspended','terminated');
CREATE TYPE public.leave_status AS ENUM ('pending','approved','rejected','cancelled');
CREATE TYPE public.attendance_status AS ENUM ('present','absent','late','on_leave','half_day','holiday','remote');
CREATE TYPE public.payroll_status AS ENUM ('draft','processing','finalized');
CREATE TYPE public.review_cycle_status AS ENUM ('planning','active','closed');
CREATE TYPE public.review_status AS ENUM ('draft','submitted','acknowledged');

-- DEPARTMENTS
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  head_employee_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- POSITIONS
CREATE TABLE public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  level text,
  min_salary numeric,
  max_salary numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.positions TO authenticated;
GRANT ALL ON public.positions TO service_role;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- EMPLOYEES
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_code text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  work_email text,
  phone text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  position_id uuid REFERENCES public.positions(id) ON DELETE SET NULL,
  manager_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  hire_date date NOT NULL DEFAULT CURRENT_DATE,
  employment_type public.employment_type NOT NULL DEFAULT 'full_time',
  status public.employee_status NOT NULL DEFAULT 'active',
  salary numeric,
  date_of_birth date,
  gender text,
  address text,
  city text,
  country text,
  emergency_contact_name text,
  emergency_contact_phone text,
  avatar_url text,
  termination_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.departments
  ADD CONSTRAINT departments_head_employee_id_fkey
  FOREIGN KEY (head_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- DEPARTMENT ACCESS
CREATE TABLE public.user_department_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, department_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_department_access TO authenticated;
GRANT ALL ON public.user_department_access TO service_role;
ALTER TABLE public.user_department_access ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_hr_admin(check_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = check_user_id AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_people_manager(check_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = check_user_id AND role IN ('admin','manager'));
$$;

CREATE OR REPLACE FUNCTION public.current_employee_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.employees WHERE profile_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_departments(check_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT department_id FROM public.user_department_access WHERE user_id = check_user_id
  UNION
  SELECT department_id FROM public.employees WHERE profile_id = check_user_id AND department_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_employee(check_employee_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_hr_admin(auth.uid())
    OR (public.is_people_manager(auth.uid()) AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = check_employee_id
        AND (e.manager_id = public.current_employee_id()
             OR e.department_id IN (SELECT public.get_user_departments(auth.uid())))
    ));
$$;

CREATE OR REPLACE FUNCTION public.can_view_employee(check_employee_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT check_employee_id = public.current_employee_id() OR public.can_manage_employee(check_employee_id);
$$;

-- POLICIES for core tables
CREATE POLICY "Everyone can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "HR admins manage departments" ON public.departments FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins update departments" ON public.departments FOR UPDATE TO authenticated USING (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins delete departments" ON public.departments FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

CREATE POLICY "Everyone can view positions" ON public.positions FOR SELECT TO authenticated USING (true);
CREATE POLICY "HR admins insert positions" ON public.positions FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins update positions" ON public.positions FOR UPDATE TO authenticated USING (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins delete positions" ON public.positions FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

CREATE POLICY "Everyone can view directory" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "HR admins insert employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "Managers and self update employees" ON public.employees FOR UPDATE TO authenticated
  USING (public.can_view_employee(id)) WITH CHECK (public.can_view_employee(id));
CREATE POLICY "HR admins delete employees" ON public.employees FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

CREATE POLICY "Users view own department access" ON public.user_department_access FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins insert department access" ON public.user_department_access FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins delete department access" ON public.user_department_access FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

-- EMPLOYMENT HISTORY
CREATE TABLE public.employment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  change_type text NOT NULL,
  previous_value text,
  new_value text,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employment_history TO authenticated;
GRANT ALL ON public.employment_history TO service_role;
ALTER TABLE public.employment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View employment history" ON public.employment_history FOR SELECT TO authenticated USING (public.can_view_employee(employee_id));
CREATE POLICY "HR admins insert employment history" ON public.employment_history FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins update employment history" ON public.employment_history FOR UPDATE TO authenticated USING (public.is_hr_admin(auth.uid()));

-- LEAVE TYPES
CREATE TABLE public.leave_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  days_per_year numeric NOT NULL DEFAULT 0,
  is_paid boolean NOT NULL DEFAULT true,
  requires_approval boolean NOT NULL DEFAULT true,
  color text NOT NULL DEFAULT 'primary',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_types TO authenticated;
GRANT ALL ON public.leave_types TO service_role;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone views leave types" ON public.leave_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "HR admins insert leave types" ON public.leave_types FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins update leave types" ON public.leave_types FOR UPDATE TO authenticated USING (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins delete leave types" ON public.leave_types FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

-- LEAVE BALANCES
CREATE TABLE public.leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  entitled_days numeric NOT NULL DEFAULT 0,
  used_days numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, leave_type_id, year)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_balances TO authenticated;
GRANT ALL ON public.leave_balances TO service_role;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View leave balances" ON public.leave_balances FOR SELECT TO authenticated USING (public.can_view_employee(employee_id));
CREATE POLICY "HR admins insert leave balances" ON public.leave_balances FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins update leave balances" ON public.leave_balances FOR UPDATE TO authenticated USING (public.is_hr_admin(auth.uid()));

-- LEAVE REQUESTS
CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id uuid NOT NULL REFERENCES public.leave_types(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days numeric NOT NULL DEFAULT 1,
  reason text,
  status public.leave_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leave_requests TO authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View leave requests" ON public.leave_requests FOR SELECT TO authenticated USING (public.can_view_employee(employee_id));
CREATE POLICY "Employees create own leave requests" ON public.leave_requests FOR INSERT TO authenticated
  WITH CHECK (employee_id = public.current_employee_id() OR public.can_manage_employee(employee_id));
CREATE POLICY "Owners and approvers update leave requests" ON public.leave_requests FOR UPDATE TO authenticated
  USING (employee_id = public.current_employee_id() OR public.can_manage_employee(employee_id))
  WITH CHECK (employee_id = public.current_employee_id() OR public.can_manage_employee(employee_id));
CREATE POLICY "HR admins delete leave requests" ON public.leave_requests FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

-- validate dates + keep balances in sync
CREATE OR REPLACE FUNCTION public.validate_leave_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'End date cannot be before start date';
  END IF;
  IF NEW.days IS NULL OR NEW.days <= 0 THEN
    NEW.days := (NEW.end_date - NEW.start_date) + 1;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER validate_leave_request_trg BEFORE INSERT OR UPDATE ON public.leave_requests
FOR EACH ROW EXECUTE FUNCTION public.validate_leave_request();

CREATE OR REPLACE FUNCTION public.sync_leave_balance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.leave_balances (employee_id, leave_type_id, year, entitled_days, used_days)
    VALUES (NEW.employee_id, NEW.leave_type_id, EXTRACT(YEAR FROM NEW.start_date)::int,
            COALESCE((SELECT days_per_year FROM public.leave_types WHERE id = NEW.leave_type_id), 0), NEW.days)
    ON CONFLICT (employee_id, leave_type_id, year)
    DO UPDATE SET used_days = public.leave_balances.used_days + NEW.days, updated_at = now();
  ELSIF OLD.status = 'approved' AND NEW.status IS DISTINCT FROM 'approved' THEN
    UPDATE public.leave_balances
      SET used_days = GREATEST(used_days - OLD.days, 0), updated_at = now()
      WHERE employee_id = OLD.employee_id AND leave_type_id = OLD.leave_type_id
        AND year = EXTRACT(YEAR FROM OLD.start_date)::int;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'pending' THEN
    NEW.reviewed_at := COALESCE(NEW.reviewed_at, now());
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER sync_leave_balance_trg BEFORE UPDATE ON public.leave_requests
FOR EACH ROW EXECUTE FUNCTION public.sync_leave_balance();

-- ATTENDANCE
CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in timestamptz,
  clock_out timestamptz,
  hours_worked numeric,
  status public.attendance_status NOT NULL DEFAULT 'present',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, work_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_records TO authenticated;
GRANT ALL ON public.attendance_records TO service_role;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View attendance" ON public.attendance_records FOR SELECT TO authenticated USING (public.can_view_employee(employee_id));
CREATE POLICY "Insert own attendance" ON public.attendance_records FOR INSERT TO authenticated
  WITH CHECK (employee_id = public.current_employee_id() OR public.can_manage_employee(employee_id));
CREATE POLICY "Update own attendance" ON public.attendance_records FOR UPDATE TO authenticated
  USING (employee_id = public.current_employee_id() OR public.can_manage_employee(employee_id))
  WITH CHECK (employee_id = public.current_employee_id() OR public.can_manage_employee(employee_id));
CREATE POLICY "HR admins delete attendance" ON public.attendance_records FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.compute_hours_worked()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.clock_in IS NOT NULL AND NEW.clock_out IS NOT NULL THEN
    NEW.hours_worked := ROUND(EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0, 2);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER compute_hours_worked_trg BEFORE INSERT OR UPDATE ON public.attendance_records
FOR EACH ROW EXECUTE FUNCTION public.compute_hours_worked();

-- HOLIDAYS
CREATE TABLE public.holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  holiday_date date NOT NULL,
  is_recurring boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.holidays TO authenticated;
GRANT ALL ON public.holidays TO service_role;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone views holidays" ON public.holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "HR admins insert holidays" ON public.holidays FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins update holidays" ON public.holidays FOR UPDATE TO authenticated USING (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins delete holidays" ON public.holidays FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

-- PAYROLL
CREATE TABLE public.payroll_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  pay_date date,
  status public.payroll_status NOT NULL DEFAULT 'draft',
  finalized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_periods TO authenticated;
GRANT ALL ON public.payroll_periods TO service_role;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "HR admins view payroll periods" ON public.payroll_periods FOR SELECT TO authenticated USING (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins insert payroll periods" ON public.payroll_periods FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins update payroll periods" ON public.payroll_periods FOR UPDATE TO authenticated USING (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins delete payroll periods" ON public.payroll_periods FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

CREATE TABLE public.payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id uuid NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  gross_pay numeric NOT NULL DEFAULT 0,
  allowances numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  deductions numeric NOT NULL DEFAULT 0,
  net_pay numeric NOT NULL DEFAULT 0,
  days_worked numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period_id, employee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payslips TO authenticated;
GRANT ALL ON public.payslips TO service_role;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own or managed payslips" ON public.payslips FOR SELECT TO authenticated
  USING (employee_id = public.current_employee_id() OR public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins insert payslips" ON public.payslips FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins update payslips" ON public.payslips FOR UPDATE TO authenticated USING (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins delete payslips" ON public.payslips FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

-- PERFORMANCE
CREATE TABLE public.review_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status public.review_cycle_status NOT NULL DEFAULT 'planning',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_cycles TO authenticated;
GRANT ALL ON public.review_cycles TO service_role;
ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone views review cycles" ON public.review_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "HR admins insert review cycles" ON public.review_cycles FOR INSERT TO authenticated WITH CHECK (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins update review cycles" ON public.review_cycles FOR UPDATE TO authenticated USING (public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admins delete review cycles" ON public.review_cycles FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

CREATE TABLE public.performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.review_cycles(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  overall_rating integer,
  strengths text,
  improvements text,
  comments text,
  employee_comments text,
  status public.review_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cycle_id, employee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.performance_reviews TO authenticated;
GRANT ALL ON public.performance_reviews TO service_role;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View reviews" ON public.performance_reviews FOR SELECT TO authenticated
  USING (public.can_view_employee(employee_id) OR reviewer_id = public.current_employee_id());
CREATE POLICY "Managers insert reviews" ON public.performance_reviews FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_employee(employee_id));
CREATE POLICY "Reviewers and employees update reviews" ON public.performance_reviews FOR UPDATE TO authenticated
  USING (public.can_manage_employee(employee_id) OR reviewer_id = public.current_employee_id() OR employee_id = public.current_employee_id())
  WITH CHECK (public.can_manage_employee(employee_id) OR reviewer_id = public.current_employee_id() OR employee_id = public.current_employee_id());
CREATE POLICY "HR admins delete reviews" ON public.performance_reviews FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

CREATE TABLE public.review_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_date date,
  progress integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_goals TO authenticated;
GRANT ALL ON public.review_goals TO service_role;
ALTER TABLE public.review_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View review goals" ON public.review_goals FOR SELECT TO authenticated
  USING (review_id IN (SELECT id FROM public.performance_reviews r WHERE public.can_view_employee(r.employee_id) OR r.reviewer_id = public.current_employee_id()));
CREATE POLICY "Manage review goals insert" ON public.review_goals FOR INSERT TO authenticated
  WITH CHECK (review_id IN (SELECT id FROM public.performance_reviews r WHERE public.can_manage_employee(r.employee_id) OR r.reviewer_id = public.current_employee_id()));
CREATE POLICY "Manage review goals update" ON public.review_goals FOR UPDATE TO authenticated
  USING (review_id IN (SELECT id FROM public.performance_reviews r WHERE public.can_manage_employee(r.employee_id) OR r.reviewer_id = public.current_employee_id() OR r.employee_id = public.current_employee_id()));
CREATE POLICY "HR admins delete review goals" ON public.review_goals FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE,
  priority text NOT NULL DEFAULT 'normal',
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone views announcements" ON public.announcements FOR SELECT TO authenticated
  USING (department_id IS NULL OR department_id IN (SELECT public.get_user_departments(auth.uid())) OR public.is_hr_admin(auth.uid()));
CREATE POLICY "Managers post announcements" ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (public.is_people_manager(auth.uid()) AND author_id = auth.uid());
CREATE POLICY "Authors update announcements" ON public.announcements FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_hr_admin(auth.uid()));
CREATE POLICY "Authors delete announcements" ON public.announcements FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_hr_admin(auth.uid()));

-- ONBOARDING
CREATE TABLE public.onboarding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_tasks TO authenticated;
GRANT ALL ON public.onboarding_tasks TO service_role;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View onboarding tasks" ON public.onboarding_tasks FOR SELECT TO authenticated USING (public.can_view_employee(employee_id));
CREATE POLICY "Managers insert onboarding tasks" ON public.onboarding_tasks FOR INSERT TO authenticated WITH CHECK (public.can_manage_employee(employee_id));
CREATE POLICY "Update onboarding tasks" ON public.onboarding_tasks FOR UPDATE TO authenticated
  USING (public.can_view_employee(employee_id)) WITH CHECK (public.can_view_employee(employee_id));
CREATE POLICY "HR admins delete onboarding tasks" ON public.onboarding_tasks FOR DELETE TO authenticated USING (public.is_hr_admin(auth.uid()));

-- DOCUMENTS
CREATE TABLE public.employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  name text NOT NULL,
  doc_type text NOT NULL DEFAULT 'other',
  file_path text,
  expires_at date,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_documents TO authenticated;
GRANT ALL ON public.employee_documents TO service_role;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View employee documents" ON public.employee_documents FOR SELECT TO authenticated USING (public.can_view_employee(employee_id));
CREATE POLICY "Insert employee documents" ON public.employee_documents FOR INSERT TO authenticated
  WITH CHECK (public.can_view_employee(employee_id) AND uploaded_by = auth.uid());
CREATE POLICY "Update employee documents" ON public.employee_documents FOR UPDATE TO authenticated USING (public.can_manage_employee(employee_id));
CREATE POLICY "Delete employee documents" ON public.employee_documents FOR DELETE TO authenticated USING (public.can_manage_employee(employee_id));

-- updated_at triggers
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON public.leave_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON public.leave_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_periods_updated_at BEFORE UPDATE ON public.payroll_periods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON public.payslips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_review_cycles_updated_at BEFORE UPDATE ON public.review_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON public.performance_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_review_goals_updated_at BEFORE UPDATE ON public.review_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_onboarding_tasks_updated_at BEFORE UPDATE ON public.onboarding_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_documents_updated_at BEFORE UPDATE ON public.employee_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- new user: profile + default role + employee record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_full_name text;
  v_first text;
  v_last text;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_first := split_part(v_full_name, ' ', 1);
  v_last := NULLIF(trim(substr(v_full_name, length(v_first) + 1)), '');

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, v_full_name)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.employees (profile_id, employee_code, first_name, last_name, work_email, status)
  VALUES (NEW.id, 'EMP-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 6)), v_first, COALESCE(v_last, ''), NEW.email, 'active')
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- allow HR admins to read all profiles for directory joins
CREATE POLICY "HR admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_hr_admin(auth.uid()));