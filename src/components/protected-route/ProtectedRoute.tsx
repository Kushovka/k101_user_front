import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, fetchUser, loading } = useUserStore();

  const token = localStorage.getItem("access_token_user");

  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  if (loading && !user) {
    return <div className="text-white p-4">Загрузка...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
