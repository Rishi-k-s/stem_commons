import React from "react";
import { Check } from "lucide-react";
import { theme } from "../../styles/theme";
import { fetchRecentSubmissions, verifyResource } from "../../lib/api";
import { ApiError } from "../../lib/auth";
import type { Resource } from "../../data/resources";
import { Button } from "../common/Button";

interface Props {
  onApproved?: () => void;
}

export function RecentSubmissionsCard({ onApproved }: Props) {
  const [items, setItems] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [verifying, setVerifying] = React.useState<number | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    fetchRecentSubmissions(10, true)
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(load, [load]);

  const handleApprove = async (r: Resource) => {
    setVerifying(r.id);
    try {
      await verifyResource(r.id);
      setItems((prev) => prev.filter((x) => x.id !== r.id));
      onApproved?.();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to verify.");
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <h2
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: theme.letterSpacing.wide,
            color: theme.colors.text,
            margin: 0,
          }}
        >
          RECENT SUBMISSIONS
        </h2>
        {items.length > 0 && (
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: "0.6rem",
              letterSpacing: theme.letterSpacing.wide,
              padding: "3px 9px",
              background: "rgba(234,179,8,0.18)",
              border: "1px solid rgba(234,179,8,0.55)",
              color: "#854d0e",
              fontWeight: 700,
            }}
          >
            {items.length} PENDING
          </span>
        )}
      </div>

      <div style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
        {loading ? (
          <div style={empty}>LOADING…</div>
        ) : items.length === 0 ? (
          <div style={empty}>No pending submissions — all caught up.</div>
        ) : (
          items.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderTop: i === 0 ? "none" : `1px solid ${theme.colors.border}`,
                background: "rgba(234,179,8,0.04)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "140px" }}>
                <div
                  style={{
                    fontFamily: theme.fonts.heading,
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: theme.colors.text,
                  }}
                >
                  {r.name}
                </div>
                <div
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: "0.63rem",
                    color: theme.colors.textMuted,
                    letterSpacing: theme.letterSpacing.wide,
                    marginTop: "2px",
                  }}
                >
                  {r.type} · {r.city}, {r.state}
                  {r.createdAt && (
                    <> · {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>
                  )}
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApprove(r)}
                disabled={verifying === r.id}
                style={{ flexShrink: 0 }}
              >
                <Check size={13} /> {verifying === r.id ? "…" : "APPROVE"}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const empty: React.CSSProperties = {
  padding: "32px",
  textAlign: "center",
  fontFamily: theme.fonts.mono,
  fontSize: "0.8rem",
  letterSpacing: theme.letterSpacing.wide,
  color: theme.colors.textMuted,
};
