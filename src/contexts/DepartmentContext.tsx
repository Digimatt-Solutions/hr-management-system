import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface Department {
  id: string;
  name: string;
  code: string;
}

interface DepartmentContextType {
  departments: Department[];
  selectedDepartment: Department | null;
  setSelectedDepartment: (department: Department | null) => void;
  loading: boolean;
  reload: () => Promise<void>;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export function DepartmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .order('name');
      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error loading departments:', error);
      toast.error('Could not load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      load();
    } else {
      setDepartments([]);
      setSelectedDepartment(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <DepartmentContext.Provider
      value={{ departments, selectedDepartment, setSelectedDepartment, loading, reload: load }}
    >
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartments() {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error('useDepartments must be used within a DepartmentProvider');
  }
  return context;
}
