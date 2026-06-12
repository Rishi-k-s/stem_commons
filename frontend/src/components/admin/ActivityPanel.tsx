import React from "react";
import { RefreshCw } from "lucide-react";
import { theme } from "../../styles/theme";
import { fetchActivityLog, type ActivityLogEntry } from "../../lib/api";

const ACTION_STYLE: Record<string, { bg: string; color: string }> = {
  role_change:       { bg: "#ede9fe", color: "#6d28d9" },
  user_activated:    { bg: "#dcfce7", color: "#15803d" },
  user_deactivated:  { bg: "#fee2e2", color: "#b91c1c" },
  bulk_verify:       { bg: "#dbeafe", color: "#1d4ed8" },
  bulk_delete:       { bg: "#fee2e2", color: "#b91c1c" },
};

const FILTERS = [
  "all",
  "role_change",
  "user_activated",
  "user_deactivated",
  "bulk_verify",
  "bulk_delete",
];

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function detail(e: ActivityLogEntry): string {
  const d = e.details;
  if (!d) return "";
  if (e.action === "role_change")
    return `${d.username}: ${d.from} → ${d.to}`;
  if (e.action === "user_activated" || e.action === "user_deactivated")
    return String(d.username ?? "");
  if (e.action === "bulk_verify" || e.action === "bulk_delete") {
    const n = Number(d.count);
    return `${n} resource${n !== 1 ? "s" : ""}`;
  }
  return JSON.stringify(d);
}

export function ActivityPanel() {
  const [entries, setEntries] = React.useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("all");

  const load = React.useCallback(() => {
    setLoading(true);
    fetchActivityLog(100, filter === "all" ? undefined : filter)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [filter]);

  React.useEffect(load, [load]);

  return (
    <div>
      {/* Filter + refresh row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", flex: 1 }}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: "0.62rem",
                  letterSpacing: theme.letterSpacing.wide,
                  padding: "4px 10px",
                  cursor: "pointer",
                  border: `1px solid ${active ? theme.colors.primary : theme.colors.borderStrong}`,
                  background: active ? theme.colors.primary : theme.colors.surface,
                  color: active ? theme.colors.textInverse : theme.colors.text,
                }}
              >
                {f === "all" ? "ALL" : f.replace(/_/g, " ").toUpperCase()}
              </button>
            );
          })}
        </div>
        <button
          onClick={load}
          disabled={loading}
          title="Refresh"
          style={{
            background: "none",
            border: `1px solid ${theme.colors.borderStrong}`,
            cursor: "pointer",
            padding: "5px 8px",
            display: "flex",
            alignItems: "center",
            color: theme.colors.textMuted,
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
        </button>
      </div>

      {loading ? (
        <div style={empty}>LOADING ACTIVITY…</div>
      ) : entries.length === 0 ? (
        <div style={empty}>No activity recorded yet.</div>
      ) : (
        <div style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
          {entries.map((e, i) => {
            const style = ACTION_STYLE[e.action] ?? { bg: theme.colors.surfaceAlt, color: theme.colors.textMuted };
            const d = detail(e);
            return (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "12px 16px",
                  borderTop: i === 0 ? "none" : `1px solid ${theme.colors.border}`,
                  flexWrap: "wrap",
                }}
              >
                {/* Action badge */}
                <span
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: theme.letterSpacing.wide,
                    padding: "3px 9px",
                    background: style.bg,
                    color: style.color,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {e.action.replace(/_/g, " ").toUpperCase()}
                </span>

                {/* Detail */}
                <span style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: "0.85rem", color: theme.colors.text, minWidth: "80px" }}>
                  {d}
                </span>

                {/* Who + when */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: theme.fonts.mono, fontSize: "0.62rem", color: theme.colors.primary, letterSpacing: "0.04em" }}>
                    {e.admin_username}
                  </div>
                  <div style={{ fontFamily: theme.fonts.mono, fontSize: "0.6rem", color: theme.colors.textMuted, marginTop: "2px" }}>
                    {relTime(e.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surface,
};
