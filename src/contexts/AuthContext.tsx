import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export interface EmployeeRecord {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  work_email: string | null;
  phone: string | null;
  department_id: string | null;
  position_id: string | null;
  manager_id: string | null;
  hire_date: string;
  status: string;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  employee: EmployeeRecord | null;
  isAdmin: boolean;
  isManager: boolean;
  profileLoading: boolean;
  refreshEmployee: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [employee, setEmployee] = useState<EmployeeRecord | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (!nextSession) {
        setRole(null);
        setEmployee(null);
        setProfileLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      setLoading(false);
      if (!existing) setProfileLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadHrContext = useCallback(async (userId: string) => {
    setProfileLoading(true);
    const [roleRes, employeeRes] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      supabase
        .from('employees')
        .select('id, employee_code, first_name, last_name, work_email, phone, department_id, position_id, manager_id, hire_date, status, avatar_url')
        .eq('profile_id', userId)
        .maybeSingle(),
    ]);
    setRole(roleRes.data?.role ?? 'staff');
    setEmployee((employeeRes.data as EmployeeRecord) ?? null);
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadHrContext(user.id);
    }
  }, [user, loadHrContext]);

  const refreshEmployee = useCallback(async () => {
    if (user) await loadHrContext(user.id);
  }, [user, loadHrContext]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) navigate('/dashboard');
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setEmployee(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        employee,
        isAdmin: role === 'admin',
        isManager: role === 'admin' || role === 'manager',
        profileLoading,
        refreshEmployee,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
