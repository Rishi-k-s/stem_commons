import React from "react";
import { useNavigate } from "react-router-dom";
import { Send, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { theme, gridBg } from "../styles/theme";
import { useIsMobile } from "../hooks/useMediaQuery";
import { LocationPicker } from "../components/admin/LocationPicker";
import { submitResource, type ResourceSubmission } from "../lib/api";
import { ApiError } from "../lib/auth";
import { RESOURCE_TYPES, ALL_FACILITIES } from "../data/resources";
import { parseSubmission, type FieldErrors } from "../lib/schemas";

const EMPTY: ResourceSubmission = {
  name: "",
  type: RESOURCE_TYPES[0],
  description: "",
  facilities: [],
  website: "",
  city: "",
  state: "",
  address: "",
  lat: 0,
  lng: 0,
  poc_name: "",
  designation: "",
  email: "",
  phone: "",
  submitted_by: "",
};

export function SubmitResource() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [form, setForm] = React.useState<ResourceSubmission>(EMPTY);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const set = <K extends keyof ResourceSubmission>(key: K, value: ResourceSubmission[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  };

  const toggleFacility = (f: string) =>
    setForm((prev) => {
      const has = prev.facilities?.includes(f);
      return {
        ...prev,
        facilities: has
          ? (prev.facilities ?? []).filter((x) => x !== f)
          : [...(prev.facilities ?? []), f],
      };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = parseSubmission(form);
    if (!validation.ok) {
      setFieldErrors(validation.errors);
      const first = Object.values(validation.errors)[0];
      setError(first ?? "Please fix the errors below.");
      return;
    }

    setSubmitting(true);
    try {
      await submitResource({
        ...form,
        name: form.name.trim(),
        poc_name: form.poc_name.trim(),
        designation: form.designation.trim(),
        email: form.email.trim(),
        submitted_by: form.submitted_by.trim(),
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: theme.colors.background, position: "relative" }}>
      <div style={gridBg} />
      <div style={{ height: "3px", background: theme.colors.primary, flexShrink: 0, position: "relative", zIndex: 10 }} />
      <Header />

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          padding: isMobile ? "24px 16px 48px" : "40px 32px 64px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: theme.colors.primary,
            fontFamily: theme.fonts.heading,
            fontSize: "0.78rem",
            letterSpacing: "0.1em",
            marginBottom: "20px",
          }}
        >
          <ArrowLeft size={16} /> BACK
        </button>

        {done ? (
          <div
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.borderStrong}`,
              padding: isMobile ? "32px 22px" : "48px 40px",
              textAlign: "center",
            }}
          >
            <CheckCircle2 size={48} style={{ color: theme.colors.primary, marginBottom: "16px" }} />
            <h1 style={{ fontFamily: theme.fonts.heading, fontSize: "1.6rem", fontWeight: 700, margin: "0 0 10px", color: theme.colors.text }}>
              THANK YOU!
            </h1>
            <p style={{ fontFamily: theme.fonts.body, fontSize: "0.95rem", color: theme.colors.textMuted, lineHeight: 1.6, margin: "0 0 24px" }}>
              Your submission has been received and will be reviewed by our team before being
              verified. We appreciate you helping grow the STEM collective.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Button variant="primary" size="md" onClick={() => navigate("/resources")}>
                BROWSE RESOURCES
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setForm(EMPTY);
                  setDone(false);
                }}
              >
                SUBMIT ANOTHER
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Intro */}
            <h1 style={{ fontFamily: theme.fonts.heading, fontSize: isMobile ? "1.6rem" : "2.1rem", fontWeight: 700, margin: "0 0 8px", color: theme.colors.text, lineHeight: 1.15 }}>
              SUBMIT AN ORGANISATION
            </h1>
            <p style={{ fontFamily: theme.fonts.body, fontSize: "0.92rem", color: theme.colors.textMuted, lineHeight: 1.6, margin: "0 0 28px" }}>
              We're building a repository of organisations working in STEM. Share details of your
              own organisation or one you know — it helps us stay connected, collaborate, and grow
              the STEM collective together. Fields marked <span style={{ color: theme.colors.primary }}>*</span> are required.
            </p>

            {error && (
              <div role="alert" style={alertStyle}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* ── Organisation ── */}
              <SectionTitle>ORGANISATION DETAILS</SectionTitle>

              <Field label="Organisation Name" required error={fieldErrors.name}>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} style={inpStyle(!!fieldErrors.name)} />
              </Field>

              <div style={row(isMobile)}>
                <Field label="Type" required style={{ flex: 1, minWidth: "180px" }}>
                  <select value={form.type} onChange={(e) => set("type", e.target.value)} style={inpStyle(false)}>
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Website (leave blank or N/A if none)" style={{ flex: 1, minWidth: "180px" }} error={fieldErrors.website}>
                  <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" style={inpStyle(!!fieldErrors.website)} />
                </Field>
              </div>

              <Field label="Short Description" error={fieldErrors.description}>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} style={{ ...inpStyle(!!fieldErrors.description), resize: "vertical" }} placeholder="What does this organisation do?" />
              </Field>

              <Field label="Facilities / Equipment (optional)">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {ALL_FACILITIES.map((f) => {
                    const active = form.facilities?.includes(f);
                    return (
                      <button
                        type="button"
                        key={f}
                        onClick={() => toggleFacility(f)}
                        style={{
                          fontFamily: theme.fonts.mono,
                          fontSize: "0.68rem",
                          letterSpacing: "0.04em",
                          padding: "6px 10px",
                          cursor: "pointer",
                          border: `1px solid ${active ? theme.colors.primary : theme.colors.borderStrong}`,
                          background: active ? theme.colors.primary : theme.colors.surface,
                          color: active ? theme.colors.textInverse : theme.colors.text,
                        }}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* ── Location ── */}
              <SectionTitle>LOCATION</SectionTitle>
              <Field label="Pin the location" required error={fieldErrors.lat}>
                <LocationPicker
                  lat={form.lat}
                  lng={form.lng}
                  onChange={(lat, lng) => {
                    setForm((f) => ({ ...f, lat, lng }));
                    setFieldErrors((e) => { const n = { ...e }; delete n.lat; return n; });
                  }}
                  onResolveAddress={(addr) =>
                    setForm((f) => ({
                      ...f,
                      city: f.city.trim() ? f.city : addr.city ?? f.city,
                      state: f.state.trim() ? f.state : addr.state ?? f.state,
                    }))
                  }
                />
              </Field>
              <div style={row(isMobile)}>
                <Field label="City" required style={{ flex: 1, minWidth: "180px" }} error={fieldErrors.city}>
                  <input value={form.city} onChange={(e) => set("city", e.target.value)} style={inpStyle(!!fieldErrors.city)} />
                </Field>
                <Field label="State" required style={{ flex: 1, minWidth: "180px" }} error={fieldErrors.state}>
                  <input value={form.state} onChange={(e) => set("state", e.target.value)} style={inpStyle(!!fieldErrors.state)} />
                </Field>
              </div>
              <Field label="Address (optional)">
                <input value={form.address} onChange={(e) => set("address", e.target.value)} style={inpStyle(false)} />
              </Field>

              {/* ── Point of contact ── */}
              <SectionTitle>POINT OF CONTACT</SectionTitle>
              <div style={row(isMobile)}>
                <Field label="Contact Name (Senior Employee / Representative)" required style={{ flex: 1, minWidth: "180px" }} error={fieldErrors.poc_name}>
                  <input value={form.poc_name} onChange={(e) => set("poc_name", e.target.value)} style={inpStyle(!!fieldErrors.poc_name)} />
                </Field>
                <Field label="Designation / Role" required style={{ flex: 1, minWidth: "180px" }} error={fieldErrors.designation}>
                  <input value={form.designation} onChange={(e) => set("designation", e.target.value)} style={inpStyle(!!fieldErrors.designation)} />
                </Field>
              </div>
              <div style={row(isMobile)}>
                <Field label="Email Address" required style={{ flex: 1, minWidth: "180px" }} error={fieldErrors.email}>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inpStyle(!!fieldErrors.email)} />
                </Field>
                <Field label="Phone Number (optional)" style={{ flex: 1, minWidth: "180px" }}>
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)} style={inpStyle(false)} />
                </Field>
              </div>

              {/* ── Submitter ── */}
              <SectionTitle>SUBMITTED BY</SectionTitle>
              <Field label="Your Name (so we know who's adding this)" required error={fieldErrors.submitted_by}>
                <input value={form.submitted_by} onChange={(e) => set("submitted_by", e.target.value)} style={inpStyle(!!fieldErrors.submitted_by)} />
              </Field>

              <Button type="submit" variant="primary" size="lg" disabled={submitting} style={{ width: "100%", justifyContent: "center", marginTop: "12px" }}>
                {submitting ? "SUBMITTING…" : (<>SUBMIT <Send size={15} /></>)}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: theme.fonts.heading,
        fontSize: "0.95rem",
        fontWeight: 700,
        letterSpacing: theme.letterSpacing.wide,
        color: theme.colors.text,
        margin: "28px 0 12px",
        paddingBottom: "6px",
        borderBottom: `2px solid ${theme.colors.primary}`,
      }}
    >
      {children}
    </h2>
  );
}

function Field({
  label,
  required = false,
  children,
  style,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  error?: string;
}) {
  return (
    <div style={{ marginBottom: "16px", ...style }}>
      <label style={{ display: "block", fontFamily: theme.fonts.mono, fontSize: "0.66rem", letterSpacing: theme.letterSpacing.wide, color: theme.colors.textMuted, marginBottom: "6px", textTransform: "uppercase" }}>
        {label}
        {required && <span style={{ color: theme.colors.primary }}> *</span>}
      </label>
      {children}
      {error && (
        <p style={{ margin: "4px 0 0", fontFamily: theme.fonts.mono, fontSize: "0.64rem", color: theme.colors.error, letterSpacing: "0.03em" }}>
          {error}
        </p>
      )}
    </div>
  );
}

const inpStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${hasError ? theme.colors.error : theme.colors.borderStrong}`,
  background: theme.colors.surface,
  padding: "10px 12px",
  fontFamily: theme.fonts.body,
  fontSize: "0.92rem",
  color: theme.colors.text,
  outline: "none",
});

const row = (isMobile: boolean): React.CSSProperties => ({
  display: "flex",
  gap: "14px",
  flexWrap: "wrap",
  flexDirection: isMobile ? "column" : "row",
});

const alertStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "rgba(127,29,29,0.08)",
  border: "1px solid rgba(127,29,29,0.3)",
  color: theme.colors.error,
  padding: "10px 12px",
  marginBottom: "18px",
  fontFamily: theme.fonts.body,
  fontSize: "0.84rem",
};
