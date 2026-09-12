import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface RoleRouteProps {
  children: React.ReactNode;
  allow: Array<"admin" | "manager" | "staff">;
}

const RoleRoute = ({ children, allow }: RoleRouteProps) => {
  const { role, profileLoading } = useAuth();

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!role || !allow.includes(role as "admin" | "manager" | "staff")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
