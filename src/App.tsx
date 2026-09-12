import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DepartmentProvider } from "./contexts/DepartmentContext";
import RoleRoute from "./components/RoleRoute";
import Auth from "./pages/Auth";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import EmployeeDetailsTab from "./pages/employee/DetailsTab";
import EmployeeEmploymentTab from "./pages/employee/EmploymentTab";
import EmployeeLeaveTab from "./pages/employee/LeaveTab";
import EmployeeAttendanceTab from "./pages/employee/AttendanceTab";
import EmployeeDocumentsTab from "./pages/employee/DocumentsTab";
import EmployeeReviewsTab from "./pages/employee/ReviewsTab";
import Departments from "./pages/Departments";
import Leave from "./pages/Leave";
import Attendance from "./pages/Attendance";
import Onboarding from "./pages/Onboarding";
import Performance from "./pages/Performance";
import Payroll from "./pages/Payroll";
import Announcements from "./pages/Announcements";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DepartmentProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/setup" element={<PublicRoute><Setup /></PublicRoute>} />

              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
              <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>}>
                <Route index element={<Navigate to="details" replace />} />
                <Route path="details" element={<EmployeeDetailsTab />} />
                <Route path="employment" element={<EmployeeEmploymentTab />} />
                <Route path="leave" element={<EmployeeLeaveTab />} />
                <Route path="attendance" element={<EmployeeAttendanceTab />} />
                <Route path="documents" element={<EmployeeDocumentsTab />} />
                <Route path="reviews" element={<EmployeeReviewsTab />} />
              </Route>
              <Route path="/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} />
              <Route path="/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <RoleRoute allow={["admin", "manager"]}>
                      <Onboarding />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
              <Route
                path="/payroll"
                element={
                  <ProtectedRoute>
                    <RoleRoute allow={["admin"]}>
                      <Payroll />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <RoleRoute allow={["admin"]}>
                      <Settings />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DepartmentProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
