import React from "react";
import { AlertCircle, Mail } from "lucide-react";
import { theme } from "../../styles/theme";
import { Button } from "../common/Button";
import {
  fetchReports,
  setReportStatus,
  type Report,
} from "../../lib/api";
import { ApiError } from "../../lib/auth";
import {
  filterRow,
  filterChip,
  statusTag,
  row,
  nameText,
  metaText,
  contactRow,
  messageText,
  emptyBox,
  messageBox,
} from "./ClaimsPanel";

const STATUS_FILTERS = ["Open", "In Progress", "Resolved", "Invalid"] as const;

export function ReportsPanel() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<string>("Open");
  const [busyId, setBusyId] = React.useState<number | null>(null);

  const reload = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetchReports(filter || undefined)
      .then(setReports)
      .catch(() => setError("Failed to load reports."))
      .finally(() => setLoading(false));
  }, [filter]);

  React.useEffect(reload, [reload]);

  const change = async (id: number, status: string) => {
    setBusyId(id);
    try {
      await setReportStatus(id, status);
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div style={filterRow}>
        {["", ...STATUS_FILTERS].map((s) => (
          <button key={s || "all"} onClick={() => setFilter(s)} style={filterChip(filter === s)}>
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
      ) : reports.length === 0 ? (
        <div style={emptyBox}>No reports{filter ? ` with status “${filter}”` : ""}.</div>
      ) : (
        <div style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
          {reports.map((r, i) => (
            <div key={r.id} style={{ ...row, borderTop: i === 0 ? "none" : `1px solid ${theme.colors.border}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={nameText}>{r.issue_type}</span>
                  <span style={statusTag(r.status)}>{r.status}</span>
                </div>
                <div style={metaText}>
                  on <strong>{r.resource_name ?? `#${r.resource_id}`}</strong>
                </div>
                <p style={messageText}>{r.description}</p>
                {(r.reporter_name || r.reporter_email) && (
                  <div style={contactRow}>
                    <Mail size={12} /> {r.reporter_name ?? "Anonymous"}
                    {r.reporter_email && <span>({r.reporter_email})</span>}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                <select
                  value={r.status}
                  disabled={busyId === r.id}
                  onChange={(e) => change(r.id, e.target.value)}
                  style={selectStyle}
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {r.status !== "Resolved" && (
                  <Button variant="primary" size="sm" disabled={busyId === r.id} onClick={() => change(r.id, "Resolved")}>
                    RESOLVE
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  border: `1px solid ${theme.colors.borderStrong}`,
  background: theme.colors.surface,
  padding: "6px 8px",
  fontFamily: theme.fonts.body,
  fontSize: "0.78rem",
  color: theme.colors.text,
  outline: "none",
};
