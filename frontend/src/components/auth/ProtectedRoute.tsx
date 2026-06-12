/**
 * Guards routes that require authentication (optionally admin role).
 * Redirects unauthenticated users to /login, preserving the target path.
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { theme } from "../../styles/theme";

function FullScreenLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme.colors.background,
        fontFamily: theme.fonts.mono,
        fontSize: "0.85rem",
        letterSpacing: theme.letterSpacing.wide,
        color: theme.colors.textMuted,
      }}
    >
      LOADING…
    </div>
  );
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
