/**
 * ─────────────────────────────────────────────────────────────
 *  AuthContext — app-wide authentication state.
 *  Exposes the current user, login/logout, and loading status.
 * ─────────────────────────────────────────────────────────────
 */
import React from "react";
import {
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  type AuthUser,
} from "../lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Restore session on mount (validates any stored token against /auth/me).
  React.useEffect(() => {
    let active = true;
    fetchMe()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    await apiLogin(email, password);
    const u = await fetchMe();
    setUser(u);
  }, []);

  const logout = React.useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "Admin",
      isOwner: user?.role === "Verified Owner",
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
