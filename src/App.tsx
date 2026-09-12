import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ShopProvider } from "./contexts/ShopContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Suppliers from "./pages/Suppliers";
import Alerts from "./pages/Alerts";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ShopProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
              <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ShopProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
