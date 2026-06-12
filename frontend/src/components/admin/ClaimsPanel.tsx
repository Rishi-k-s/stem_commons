import React from "react";
import { Check, X, AlertCircle, Mail, Phone, KeyRound, Copy } from "lucide-react";
import { theme } from "../../styles/theme";
import { Button } from "../common/Button";
import {
  fetchClaims,
  approveClaim,
  rejectClaim,
  type Claim,
} from "../../lib/api";
import { ApiError } from "../../lib/auth";

const STATUS_FILTERS = ["Pending", "Approved", "Rejected"] as const;

interface OwnerCredentials {
  email: string;
  password: string | null;
  existed: boolean;
}

export function ClaimsPanel() {
  const [claims, setClaims] = React.useState<Claim[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<string>("Pending");
  const [busyId, setBusyId] = React.useState<number | null>(null);
  const [credentials, setCredentials] = React.useState<OwnerCredentials | null>(null);

  const reload = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetchClaims(filter || undefined)
      .then(setClaims)
      .catch(() => setError("Failed to load claims."))
      .finally(() => setLoading(false));
  }, [filter]);

  React.useEffect(reload, [reload]);

  const act = async (id: number, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      if (action === "approve") {
        const result = await approveClaim(id);
        setCredentials({
          email: result.owner_email ?? "",
          password: result.owner_temp_password ?? null,
          existed: result.owner_account_existed ?? false,
        });
      } else {
        await rejectClaim(id);
      }
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {credentials && (
        <CredentialsBanner credentials={credentials} onClose={() => setCredentials(null)} />
      )}

      <div style={filterRow}>
        {["", ...STATUS_FILTERS].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            style={filterChip(filter === s)}
          >
            {s || "ALL"}
          </button>
        ))}
      </div>

      {error ? (
        <div style={messageBox}>
          <AlertCircle size={16} /> {error}
        </div>
      ) : loading ? (
        <div style={emptyBox}>LOADING…</div>
      ) : claims.length === 0 ? (
        <div style={emptyBox}>No claims{filter ? ` with status “${filter}”` : ""}.</div>
      ) : (
        <div style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
          {claims.map((c, i) => (
            <div key={c.id} style={{ ...row, borderTop: i === 0 ? "none" : `1px solid ${theme.colors.border}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={nameText}>{c.claimer_name}</span>
                  {c.role && <span style={roleTag}>{c.role}</span>}
                  <span style={statusTag(c.status)}>{c.status}</span>
                </div>
                <div style={metaText}>
                  claims <strong>{c.resource_name ?? `#${c.resource_id}`}</strong>
                </div>
                <div style={contactRow}>
                  <Mail size={12} /> {c.claimer_email}
                  {c.claimer_phone && (
                    <>
                      <span style={{ opacity: 0.4 }}>•</span>
                      <Phone size={12} /> {c.claimer_phone}
                    </>
                  )}
                </div>
                {c.message && <p style={messageText}>“{c.message}”</p>}
              </div>
              {c.status === "Pending" && (
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <Button variant="primary" size="sm" disabled={busyId === c.id} onClick={() => act(c.id, "approve")}>
                    <Check size={14} /> APPROVE
                  </Button>
                  <Button variant="outline" size="sm" disabled={busyId === c.id} onClick={() => act(c.id, "reject")}>
                    <X size={14} /> REJECT
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Owner credentials banner ────────────────────────────────── */

function CredentialsBanner({
  credentials,
  onClose,
}: {
  credentials: OwnerCredentials;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    const text = credentials.password
      ? `Login: ${credentials.email}\nTemporary password: ${credentials.password}`
      : `Login: ${credentials.email}`;
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  };

  return (
    <div
      style={{
        border: `1px solid ${theme.colors.primary}`,
        background: "rgba(41,0,135,0.05)",
        padding: "14px 16px",
        marginBottom: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <KeyRound size={16} style={{ color: theme.colors.primary }} />
        <span style={{ fontFamily: theme.fonts.heading, fontSize: "0.85rem", fontWeight: 700, color: theme.colors.text }}>
          CLAIM APPROVED — FACILITY OWNER ACCESS
        </span>
        <button onClick={onClose} aria-label="Dismiss" style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: theme.colors.textMuted, display: "flex" }}>
          <X size={16} />
        </button>
      </div>

      {credentials.existed ? (
        <p style={{ fontFamily: theme.fonts.body, fontSize: "0.82rem", color: theme.colors.text, margin: 0 }}>
          <strong>{credentials.email}</strong> already has an account and now manages this facility.
          Ask them to sign in with their existing password.
        </p>
      ) : (
        <>
          <p style={{ fontFamily: theme.fonts.body, fontSize: "0.82rem", color: theme.colors.text, margin: "0 0 10px" }}>
            Share these one-time credentials with the owner. They won't be shown again.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <code style={credPill}>{credentials.email}</code>
            <code style={credPill}>{credentials.password}</code>
            <Button variant="outline" size="sm" onClick={copy}>
              <Copy size={13} /> {copied ? "COPIED" : "COPY"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const credPill: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "0.78rem",
  background: theme.colors.surface,
  border: `1px solid ${theme.colors.borderStrong}`,
  padding: "6px 10px",
  color: theme.colors.text,
  wordBreak: "break-all",
};

/* ── shared bits reused by ReportsPanel via export ───────────── */

export const filterRow: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  marginBottom: "16px",
  flexWrap: "wrap",
};

export function filterChip(active: boolean): React.CSSProperties {
  return {
    cursor: "pointer",
    fontFamily: theme.fonts.mono,
    fontSize: "0.64rem",
    letterSpacing: theme.letterSpacing.wide,
    padding: "6px 12px",
    border: `1px solid ${active ? theme.colors.primary : theme.colors.borderStrong}`,
    background: active ? theme.colors.primary : theme.colors.surface,
    color: active ? theme.colors.textInverse : theme.colors.text,
    fontWeight: 700,
  };
}

export function statusTag(status: string): React.CSSProperties {
  const map: Record<string, [string, string]> = {
    Pending: ["rgba(234,179,8,0.18)", "#854d0e"],
    Open: ["rgba(234,179,8,0.18)", "#854d0e"],
    Approved: ["rgba(22,163,74,0.15)", "#166534"],
    Resolved: ["rgba(22,163,74,0.15)", "#166534"],
    Rejected: ["rgba(220,38,38,0.12)", "#b91c1c"],
    Invalid: ["rgba(220,38,38,0.12)", "#b91c1c"],
    "In Progress": ["rgba(29,111,168,0.15)", "#1d6fa8"],
  };
  const [bg, color] = map[status] ?? ["rgba(0,0,0,0.06)", theme.colors.text];
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    background: bg,
    color,
    fontFamily: theme.fonts.mono,
    fontSize: "0.58rem",
    fontWeight: 700,
    letterSpacing: theme.letterSpacing.wide,
  };
}

export const row: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  padding: "14px 16px",
};

export const nameText: React.CSSProperties = {
  fontFamily: theme.fonts.heading,
  fontSize: "0.95rem",
  fontWeight: 700,
  color: theme.colors.text,
};

export const roleTag: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "0.58rem",
  letterSpacing: theme.letterSpacing.wide,
  padding: "2px 7px",
  background: theme.colors.surfaceAlt,
  color: theme.colors.text,
};

export const metaText: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: "0.78rem",
  color: theme.colors.textMuted,
  marginTop: "4px",
};

export const contactRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flexWrap: "wrap",
  fontFamily: theme.fonts.mono,
  fontSize: "0.66rem",
  color: theme.colors.textMuted,
  marginTop: "6px",
};

export const messageText: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: "0.8rem",
  color: theme.colors.text,
  fontStyle: "italic",
  margin: "8px 0 0",
};

export const emptyBox: React.CSSProperties = {
  padding: "40px",
  textAlign: "center",
  fontFamily: theme.fonts.mono,
  fontSize: "0.8rem",
  letterSpacing: theme.letterSpacing.wide,
  color: theme.colors.textMuted,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surface,
};

export const messageBox: React.CSSProperties = {
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
