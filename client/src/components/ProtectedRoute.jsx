import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const hasLocalToken = !!localStorage.getItem("token");

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--text-main)", background: "var(--bg-dark)" }}>
        Loading user session...
      </div>
    );
  }

  return (token || hasLocalToken) ? children : <Navigate to="/" replace />;
}