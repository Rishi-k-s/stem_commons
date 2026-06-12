import React from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { theme } from "../../styles/theme";
import { Button } from "../common/Button";
import { useIsMobile } from "../../hooks/useMediaQuery";
import {
  submitClaim,
  submitReport,
  type ClaimSubmission,
  type ReportSubmission,
} from "../../lib/api";
import { ApiError } from "../../lib/auth";

type Mode = "claim" | "report";

const CLAIM_ROLES = ["Owner", "Administrator", "Staff", "Other"];
const ISSUE_TYPES = [
  "Incorrect information",
  "Permanently closed",
  "Duplicate listing",
  "Inappropriate content",
  "Other",
];

export function ClaimReportModal({
  mode,
  resourceId,
  resourceName,
  onClose,
}: {
  mode: Mode;
  resourceId: number;
  resourceName: string;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  const isClaim = mode === "claim";

  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  // Claim fields
  const [claimerName, setClaimerName] = React.useState("");
  const [claimerEmail, setClaimerEmail] = React.useState("");
  const [claimerPhone, setClaimerPhone] = React.useState("");
  const [role, setRole] = React.useState(CLAIM_ROLES[0]);
  const [message, setMessage] = React.useState("");

  // Report fields
  const [reporterName, setReporterName] = React.useState("");
  const [reporterEmail, setReporterEmail] = React.useState("");
  const [issueType, setIssueType] = React.useState(ISSUE_TYPES[0]);
  const [description, setDescription] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isClaim) {
        const payload: ClaimSubmission = {
          claimer_name: claimerName.trim(),
          claimer_email: claimerEmail.trim(),
          claimer_phone: claimerPhone.trim() || undefined,
          role,
          message: message.trim() || undefined,
        };
        await submitClaim(resourceId, payload);
      } else {
        const payload: ReportSubmission = {
          reporter_name: reporterName.trim() || undefined,
          reporter_email: reporterEmail.trim() || undefined,
          issue_type: issueType,
          description: description.trim(),
        };
        await submitReport(resourceId, payload);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Submission failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 2000,
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? 0 : "24px",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: theme.colors.background,
          width: "100%",
          maxWidth: "500px",
          maxHeight: isMobile ? "92vh" : "88vh",
          overflowY: "auto",
          border: `1px solid ${theme.colors.borderStrong}`,
          boxShadow: "0 20px 48px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            background: theme.colors.primary,
            color: theme.colors.textInverse,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontFamily: theme.fonts.heading, fontWeight: 700, letterSpacing: theme.letterSpacing.wide }}>
            {isClaim ? "CLAIM THIS RESOURCE" : "REPORT AN ISSUE"}
          </span>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: theme.colors.textInverse, display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <CheckCircle2 size={44} style={{ color: "#16a34a", marginBottom: "16px" }} />
            <h3 style={{ fontFamily: theme.fonts.heading, fontSize: "1.15rem", fontWeight: 700, color: theme.colors.text, margin: "0 0 8px" }}>
              {isClaim ? "CLAIM SUBMITTED" : "REPORT SUBMITTED"}
            </h3>
            <p style={{ fontFamily: theme.fonts.body, fontSize: "0.9rem", color: theme.colors.textMuted, margin: "0 0 24px" }}>
              {isClaim
                ? "Thanks — our team will review your claim and get in touch."
                : "Thanks for flagging this. Our team will look into it."}
            </p>
            <Button variant="primary" onClick={onClose} style={{ width: "100%", justifyContent: "center" }}>
              CLOSE
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
            <p style={{ fontFamily: theme.fonts.body, fontSize: "0.84rem", color: theme.colors.textMuted, marginTop: 0, marginBottom: "16px" }}>
              {isClaim ? "Claiming" : "Reporting"} <strong style={{ color: theme.colors.text }}>{resourceName}</strong>
            </p>

            {error && (
              <div role="alert" style={errorBox}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            {isClaim ? (
              <>
                <Field label="YOUR NAME">
                  <input required value={claimerName} onChange={(e) => setClaimerName(e.target.value)} style={fieldInput} />
                </Field>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Field label="EMAIL" style={{ flex: 1, minWidth: "180px" }}>
                    <input required type="email" value={claimerEmail} onChange={(e) => setClaimerEmail(e.target.value)} style={fieldInput} />
                  </Field>
                  <Field label="PHONE (OPTIONAL)" style={{ flex: 1, minWidth: "140px" }}>
                    <input value={claimerPhone} onChange={(e) => setClaimerPhone(e.target.value)} style={fieldInput} />
                  </Field>
                </div>
                <Field label="YOUR ROLE">
                  <select value={role} onChange={(e) => setRole(e.target.value)} style={fieldInput}>
                    {CLAIM_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="MESSAGE (OPTIONAL)">
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Tell us about your association with this resource…" style={{ ...fieldInput, resize: "vertical" }} />
                </Field>
              </>
            ) : (
              <>
                <Field label="ISSUE TYPE">
                  <select value={issueType} onChange={(e) => setIssueType(e.target.value)} style={fieldInput}>
                    {ISSUE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="DESCRIPTION">
                  <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the issue…" style={{ ...fieldInput, resize: "vertical" }} />
                </Field>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Field label="YOUR NAME (OPTIONAL)" style={{ flex: 1, minWidth: "180px" }}>
                    <input value={reporterName} onChange={(e) => setReporterName(e.target.value)} style={fieldInput} />
                  </Field>
                  <Field label="EMAIL (OPTIONAL)" style={{ flex: 1, minWidth: "180px" }}>
                    <input type="email" value={reporterEmail} onChange={(e) => setReporterEmail(e.target.value)} style={fieldInput} />
                  </Field>
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <Button type="button" variant="secondary" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
                CANCEL
              </Button>
              <Button type="submit" variant="primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                {saving ? "SUBMITTING…" : "SUBMIT"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ marginBottom: "14px", ...style }}>
      <label style={{ display: "block", fontFamily: theme.fonts.mono, fontSize: "0.6rem", letterSpacing: theme.letterSpacing.widest, color: theme.colors.textMuted, marginBottom: "5px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const fieldInput: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${theme.colors.borderStrong}`,
  background: theme.colors.surface,
  padding: "9px 11px",
  fontFamily: theme.fonts.body,
  fontSize: "0.9rem",
  color: theme.colors.text,
  outline: "none",
};

const errorBox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "rgba(185,28,28,0.08)",
  border: "1px solid rgba(185,28,28,0.3)",
  color: "#b91c1c",
  padding: "10px 12px",
  marginBottom: "16px",
  fontFamily: theme.fonts.body,
  fontSize: "0.82rem",
};
