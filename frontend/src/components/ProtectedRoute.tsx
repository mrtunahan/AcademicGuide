import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../lib/auth";
import type { Role } from "../lib/api";

interface Props {
  children: ReactNode;
  roles?: Role[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="text-sm text-slate-500">Yükleniyor...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
