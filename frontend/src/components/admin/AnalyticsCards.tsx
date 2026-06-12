import React from "react";
import { AlertCircle } from "lucide-react";
import { theme } from "../../styles/theme";
import { fetchAnalytics, type AnalyticsOverview } from "../../lib/api";
import { useIsMobile } from "../../hooks/useMediaQuery";

export function AnalyticsCards() {
  const isMobile = useIsMobile();
  const [data, setData] = React.useState<AnalyticsOverview | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    fetchAnalytics()
      .then((d) => active && setData(d))
      .catch(() => active && setError("Failed to load analytics."));
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div style={errorBox}>
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  if (!data) {
    return <div style={loadingBox}>LOADING ANALYTICS…</div>;
  }

  const cards: { label: string; value: number; accent?: string }[] = [
    { label: "TOTAL RESOURCES", value: data.resources.total },
    { label: "VERIFIED", value: data.resources.verified, accent: "#16a34a" },
    { label: "PENDING REVIEW", value: data.resources.pending, accent: "#eab308" },
    { label: "OPEN CLAIMS", value: data.claims.pending, accent: theme.colors.secondary },
    { label: "OPEN REPORTS", value: data.reports.open, accent: "#dc2626" },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : "repeat(5, 1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {cards.map((c) => (
          <div key={c.label} style={statCard}>
            <div style={{ ...statValue, color: c.accent ?? theme.colors.primary }}>
              {c.value}
            </div>
            <div style={statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Breakdown rows */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        <Breakdown title="BY TYPE" data={data.resources.by_type} />
        <Breakdown title="BY STATUS" data={data.resources.by_status} />
        <Breakdown title="TOP STATES" data={data.resources.by_state} />
      </div>
    </div>
  );
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div style={breakdownCard}>
      <div style={breakdownTitle}>{title}</div>
      {entries.length === 0 ? (
        <div style={{ fontFamily: theme.fonts.mono, fontSize: "0.7rem", color: theme.colors.textMuted }}>
          No data.
        </div>
      ) : (
        entries.map(([label, value]) => (
          <div key={label} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ fontFamily: theme.fonts.body, fontSize: "0.78rem", color: theme.colors.text }}>
                {label}
              </span>
              <span style={{ fontFamily: theme.fonts.mono, fontSize: "0.72rem", color: theme.colors.textMuted }}>
                {value}
              </span>
            </div>
            <div style={{ height: "5px", background: theme.colors.surfaceAlt }}>
              <div
                style={{
                  height: "100%",
                  width: `${(value / max) * 100}%`,
                  background: theme.colors.primary,
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const statCard: React.CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surface,
  padding: "16px 14px",
};

const statValue: React.CSSProperties = {
  fontFamily: theme.fonts.heading,
  fontSize: "1.9rem",
  fontWeight: 700,
  lineHeight: 1,
};

const statLabel: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "0.58rem",
  letterSpacing: theme.letterSpacing.widest,
  color: theme.colors.textMuted,
  marginTop: "8px",
};

const breakdownCard: React.CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surface,
  padding: "16px",
};

const breakdownTitle: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "0.6rem",
  letterSpacing: theme.letterSpacing.widest,
  color: theme.colors.textMuted,
  marginBottom: "12px",
};

const loadingBox: React.CSSProperties = {
  padding: "32px",
  textAlign: "center",
  fontFamily: theme.fonts.mono,
  fontSize: "0.8rem",
  letterSpacing: theme.letterSpacing.wide,
  color: theme.colors.textMuted,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surface,
};

const errorBox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "16px",
  fontFamily: theme.fonts.body,
  fontSize: "0.82rem",
  color: "#b91c1c",
  background: "rgba(185,28,28,0.08)",
  border: "1px solid rgba(185,28,28,0.3)",
};
