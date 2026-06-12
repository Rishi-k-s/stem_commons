import React from "react";
import { UserCheck, UserX, ChevronDown } from "lucide-react";
import { theme } from "../../styles/theme";
import {
  fetchAdminUsers,
  updateUserRole,
  updateUserActive,
  type AdminUser,
} from "../../lib/api";
import { ApiError } from "../../lib/auth";

const ROLES = ["User", "Verified Owner", "Admin"];

const ROLE_COLOR: Record<string, string> = {
  Admin: theme.colors.primary,
  "Verified Owner": "#15803d",
  User: theme.colors.textMuted,
};

export function UsersPanel() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [busy, setBusy] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    fetchAdminUsers()
      .then(setUsers)
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(load, [load]);

  const handleRole = async (user: AdminUser, role: string) => {
    setBusy(user.id);
    setError(null);
    try {
      const updated = await updateUserRole(user.id, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update role.");
    } finally {
      setBusy(null);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    setBusy(user.id);
    setError(null);
    try {
      const updated = await updateUserActive(user.id, !user.is_active);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status.");
    } finally {
      setBusy(null);
    }
  };

  const filtered =
    roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  if (loading) return <div style={empty}>LOADING USERS…</div>;

  return (
    <div>
      {error && (
        <div style={errorBox}>
          {error}
          <button onClick={() => setError(null)} style={clearBtn}>×</button>
        </div>
      )}

      {/* Role filter pills */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["all", ...ROLES].map((r) => {
          const count = r === "all" ? users.length : users.filter((u) => u.role === r).length;
          const active = roleFilter === r;
          return (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: "0.66rem",
                letterSpacing: theme.letterSpacing.wide,
                padding: "5px 12px",
                cursor: "pointer",
                border: `1px solid ${active ? theme.colors.primary : theme.colors.borderStrong}`,
                background: active ? theme.colors.primary : theme.colors.surface,
                color: active ? theme.colors.textInverse : theme.colors.text,
              }}
            >
              {r === "all" ? "ALL" : r.toUpperCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* User list */}
      <div style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
        {filtered.length === 0 ? (
          <div style={empty}>No users in this group.</div>
        ) : (
          filtered.map((u, i) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                borderTop: i === 0 ? "none" : `1px solid ${theme.colors.border}`,
                opacity: u.is_active ? 1 : 0.55,
                flexWrap: "wrap",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: u.is_active
                    ? (ROLE_COLOR[u.role] ?? theme.colors.primary)
                    : theme.colors.textMuted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: theme.fonts.heading,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#fff",
                }}
              >
                {u.username.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: "160px" }}>
                <div
                  style={{
                    fontFamily: theme.fonts.heading,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: theme.colors.text,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {u.username}
                  {!u.is_active && (
                    <span style={{ fontFamily: theme.fonts.mono, fontSize: "0.55rem", letterSpacing: theme.letterSpacing.wide, padding: "2px 7px", background: "#fee2e2", color: "#b91c1c", fontWeight: 700 }}>
                      INACTIVE
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: "0.64rem",
                    color: theme.colors.textMuted,
                    letterSpacing: "0.04em",
                    marginTop: "2px",
                  }}
                >
                  {u.email} · joined{" "}
                  {new Date(u.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Role dropdown */}
              <div style={{ position: "relative" }}>
                <select
                  value={u.role}
                  disabled={busy === u.id}
                  onChange={(e) => handleRole(u, e.target.value)}
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: "0.66rem",
                    letterSpacing: theme.letterSpacing.wide,
                    fontWeight: 700,
                    padding: "5px 28px 5px 10px",
                    border: `1px solid ${theme.colors.borderStrong}`,
                    background: theme.colors.surface,
                    color: ROLE_COLOR[u.role] ?? theme.colors.text,
                    cursor: "pointer",
                    appearance: "none",
                    outline: "none",
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown
                  size={10}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: theme.colors.textMuted,
                  }}
                />
              </div>

              {/* Active toggle */}
              <button
                disabled={busy === u.id}
                onClick={() => handleToggleActive(u)}
                title={u.is_active ? "Deactivate user" : "Activate user"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontFamily: theme.fonts.mono,
                  fontSize: "0.62rem",
                  letterSpacing: theme.letterSpacing.wide,
                  padding: "5px 10px",
                  cursor: "pointer",
                  border: `1px solid ${u.is_active ? "#86efac" : theme.colors.borderStrong}`,
                  background: u.is_active ? "#f0fdf4" : theme.colors.surface,
                  color: u.is_active ? "#15803d" : theme.colors.textMuted,
                  opacity: busy === u.id ? 0.5 : 1,
                }}
              >
                {u.is_active ? (
                  <><UserCheck size={12} /> ACTIVE</>
                ) : (
                  <><UserX size={12} /> INACTIVE</>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const empty: React.CSSProperties = {
  padding: "48px",
  textAlign: "center",
  fontFamily: theme.fonts.mono,
  fontSize: "0.85rem",
  letterSpacing: theme.letterSpacing.wide,
  color: theme.colors.textMuted,
};

const errorBox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 14px",
  marginBottom: "16px",
  background: "rgba(185,28,28,0.08)",
  border: "1px solid rgba(185,28,28,0.3)",
  color: "#b91c1c",
  fontFamily: theme.fonts.body,
  fontSize: "0.82rem",
};

const clearBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#b91c1c",
  fontSize: "1rem",
  lineHeight: 1,
};
