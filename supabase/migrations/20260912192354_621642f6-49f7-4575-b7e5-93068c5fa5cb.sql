-- Trigger-only functions: not callable by clients at all
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_leave_request() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_leave_balance() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.compute_hours_worked() FROM PUBLIC, anon, authenticated;

-- Access-check helpers: used inside RLS policies, so signed-in users need EXECUTE, anon does not
REVOKE ALL ON FUNCTION public.is_hr_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_people_manager(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_employee_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_departments(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_manage_employee(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_view_employee(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_shops(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_has_shop_access(uuid, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_hr_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_people_manager(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_employee_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_departments(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_employee(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_employee(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;