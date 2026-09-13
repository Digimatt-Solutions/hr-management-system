export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          department_id: string | null
          id: string
          priority: string
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          department_id?: string | null
          id?: string
          priority?: string
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          department_id?: string | null
          id?: string
          priority?: string
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      app_setup_state: {
        Row: {
          admin_exists: boolean
          singleton: boolean
        }
        Insert: {
          admin_exists?: boolean
          singleton?: boolean
        }
        Update: {
          admin_exists?: boolean
          singleton?: boolean
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          clock_in: string | null
          clock_out: string | null
          created_at: string
          employee_id: string
          hours_worked: number | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
          work_date: string
        }
        Insert: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          employee_id: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          work_date?: string
        }
        Update: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          employee_id?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          head_employee_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          head_employee_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          head_employee_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_head_employee_id_fkey"
            columns: ["head_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string
          doc_type: string
          employee_id: string
          expires_at: string | null
          file_path: string | null
          id: string
          name: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          doc_type?: string
          employee_id: string
          expires_at?: string | null
          file_path?: string | null
          id?: string
          name: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          doc_type?: string
          employee_id?: string
          expires_at?: string | null
          file_path?: string | null
          id?: string
          name?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          department_id: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_code: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          first_name: string
          gender: string | null
          hire_date: string
          id: string
          last_name: string
          manager_id: string | null
          notes: string | null
          phone: string | null
          position_id: string | null
          profile_id: string | null
          salary: number | null
          status: Database["public"]["Enums"]["employee_status"]
          termination_date: string | null
          updated_at: string
          work_email: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_code: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          first_name: string
          gender?: string | null
          hire_date?: string
          id?: string
          last_name: string
          manager_id?: string | null
          notes?: string | null
          phone?: string | null
          position_id?: string | null
          profile_id?: string | null
          salary?: number | null
          status?: Database["public"]["Enums"]["employee_status"]
          termination_date?: string | null
          updated_at?: string
          work_email?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_code?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          first_name?: string
          gender?: string | null
          hire_date?: string
          id?: string
          last_name?: string
          manager_id?: string | null
          notes?: string | null
          phone?: string | null
          position_id?: string | null
          profile_id?: string | null
          salary?: number | null
          status?: Database["public"]["Enums"]["employee_status"]
          termination_date?: string | null
          updated_at?: string
          work_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_history: {
        Row: {
          change_type: string
          created_at: string
          effective_date: string
          employee_id: string
          id: string
          new_value: string | null
          notes: string | null
          previous_value: string | null
        }
        Insert: {
          change_type: string
          created_at?: string
          effective_date?: string
          employee_id: string
          id?: string
          new_value?: string | null
          notes?: string | null
          previous_value?: string | null
        }
        Update: {
          change_type?: string
          created_at?: string
          effective_date?: string
          employee_id?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          previous_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string
          holiday_date: string
          id: string
          is_recurring: boolean
          name: string
        }
        Insert: {
          created_at?: string
          holiday_date: string
          id?: string
          is_recurring?: boolean
          name: string
        }
        Update: {
          created_at?: string
          holiday_date?: string
          id?: string
          is_recurring?: boolean
          name?: string
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          created_at: string
          employee_id: string
          entitled_days: number
          id: string
          leave_type_id: string
          updated_at: string
          used_days: number
          year: number
        }
        Insert: {
          created_at?: string
          employee_id: string
          entitled_days?: number
          id?: string
          leave_type_id: string
          updated_at?: string
          used_days?: number
          year?: number
        }
        Update: {
          created_at?: string
          employee_id?: string
          entitled_days?: number
          id?: string
          leave_type_id?: string
          updated_at?: string
          used_days?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string
          days: number
          employee_id: string
          end_date: string
          id: string
          leave_type_id: string
          reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          days?: number
          employee_id: string
          end_date: string
          id?: string
          leave_type_id: string
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          days?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type_id?: string
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          color: string
          created_at: string
          days_per_year: number
          description: string | null
          id: string
          is_paid: boolean
          name: string
          requires_approval: boolean
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          days_per_year?: number
          description?: string | null
          id?: string
          is_paid?: boolean
          name: string
          requires_approval?: boolean
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          days_per_year?: number
          description?: string | null
          id?: string
          is_paid?: boolean
          name?: string
          requires_approval?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          employee_id: string
          id: string
          is_completed: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          is_completed?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          is_completed?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_periods: {
        Row: {
          created_at: string
          end_date: string
          finalized_at: string | null
          id: string
          name: string
          pay_date: string | null
          start_date: string
          status: Database["public"]["Enums"]["payroll_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          finalized_at?: string | null
          id?: string
          name: string
          pay_date?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["payroll_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          finalized_at?: string | null
          id?: string
          name?: string
          pay_date?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["payroll_status"]
          updated_at?: string
        }
        Relationships: []
      }
      payslips: {
        Row: {
          allowances: number
          created_at: string
          days_worked: number | null
          deductions: number
          employee_id: string
          gross_pay: number
          id: string
          net_pay: number
          notes: string | null
          period_id: string
          tax: number
          updated_at: string
        }
        Insert: {
          allowances?: number
          created_at?: string
          days_worked?: number | null
          deductions?: number
          employee_id: string
          gross_pay?: number
          id?: string
          net_pay?: number
          notes?: string | null
          period_id: string
          tax?: number
          updated_at?: string
        }
        Update: {
          allowances?: number
          created_at?: string
          days_worked?: number | null
          deductions?: number
          employee_id?: string
          gross_pay?: number
          id?: string
          net_pay?: number
          notes?: string | null
          period_id?: string
          tax?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "payroll_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          comments: string | null
          created_at: string
          cycle_id: string
          employee_comments: string | null
          employee_id: string
          id: string
          improvements: string | null
          overall_rating: number | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["review_status"]
          strengths: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          cycle_id: string
          employee_comments?: string | null
          employee_id: string
          id?: string
          improvements?: string | null
          overall_rating?: number | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          strengths?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          cycle_id?: string
          employee_comments?: string | null
          employee_id?: string
          id?: string
          improvements?: string | null
          overall_rating?: number | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          strengths?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "review_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          level: string | null
          max_salary: number | null
          min_salary: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          level?: string | null
          max_salary?: number | null
          min_salary?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          level?: string | null
          max_salary?: number | null
          min_salary?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      review_cycles: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          status: Database["public"]["Enums"]["review_cycle_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["review_cycle_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["review_cycle_status"]
          updated_at?: string
        }
        Relationships: []
      }
      review_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          progress: number
          review_id: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          progress?: number
          review_id: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          progress?: number
          review_id?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_goals_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "performance_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      user_department_access: {
        Row: {
          created_at: string
          department_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_department_access_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_department_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      can_manage_employee: {
        Args: { check_employee_id: string }
        Returns: boolean
      }
      can_view_employee: {
        Args: { check_employee_id: string }
        Returns: boolean
      }
      current_employee_id: { Args: never; Returns: string }
      get_user_departments: {
        Args: { check_user_id: string }
        Returns: string[]
      }
      get_user_role: { Args: { check_user_id: string }; Returns: string }
      is_hr_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_people_manager: { Args: { check_user_id: string }; Returns: boolean }
    }
    Enums: {
      attendance_status:
        | "present"
        | "absent"
        | "late"
        | "on_leave"
        | "half_day"
        | "holiday"
        | "remote"
      employee_status:
        | "active"
        | "probation"
        | "on_leave"
        | "suspended"
        | "terminated"
      employment_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "intern"
        | "temporary"
      leave_status: "pending" | "approved" | "rejected" | "cancelled"
      payroll_status: "draft" | "processing" | "finalized"
      reorder_status: "pending" | "ordered" | "received" | "cancelled"
      review_cycle_status: "planning" | "active" | "closed"
      review_status: "draft" | "submitted" | "acknowledged"
      stock_status: "critical" | "low" | "adequate" | "good"
      user_role: "admin" | "manager" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attendance_status: [
        "present",
        "absent",
        "late",
        "on_leave",
        "half_day",
        "holiday",
        "remote",
      ],
      employee_status: [
        "active",
        "probation",
        "on_leave",
        "suspended",
        "terminated",
      ],
      employment_type: [
        "full_time",
        "part_time",
        "contract",
        "intern",
        "temporary",
      ],
      leave_status: ["pending", "approved", "rejected", "cancelled"],
      payroll_status: ["draft", "processing", "finalized"],
      reorder_status: ["pending", "ordered", "received", "cancelled"],
      review_cycle_status: ["planning", "active", "closed"],
      review_status: ["draft", "submitted", "acknowledged"],
      stock_status: ["critical", "low", "adequate", "good"],
      user_role: ["admin", "manager", "staff"],
    },
  },
} as const
