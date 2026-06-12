import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Pencil, X, AlertCircle, KeyRound, Building2, CheckCircle2 } from "lucide-react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { theme } from "../styles/theme";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useMediaQuery";
import { LocationPicker } from "../components/admin/LocationPicker";
import {
  fetchMyResources,
  ownerUpdateResource,
  changePassword,
  type ResourceInput,
} from "../lib/api";
import { ApiError } from "../lib/auth";
import {
  statusVariant,
  RESOURCE_STATUSES,
  type Resource,
} from "../data/resources";

export function OwnerDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();

  const [resources, setResources] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Resource | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const reload = React.useCallback(() => {
    setLoading(true);
    fetchMyResources()
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(reload, [reload]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: theme.colors.background }}>
      <div style={{ height: "3px", background: theme.colors.primary, flexShrink: 0 }} />
      <Header />

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: isMobile ? "24px 16px" : "40px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <h1 style={{ fontFamily: theme.fonts.heading, fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: 700, margin: 0, color: theme.colors.text }}>
            FACILITY ADMIN
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: "0.7rem", color: theme.colors.textMuted, letterSpacing: theme.letterSpacing.wide }}>
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowPassword(true)}>
              <KeyRound size={13} /> PASSWORD
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={13} /> SIGN OUT
            </Button>
          </div>
        </div>

        <p style={{ fontFamily: theme.fonts.body, fontSize: "0.9rem", color: theme.colors.textMuted, marginTop: 0, marginBottom: "24px" }}>
          Manage the facilities you own — update details, contact info, and equipment.
        </p>

        {loading ? (
          <div style={emptyStyle}>LOADING…</div>
        ) : resources.length === 0 ? (
          <div style={emptyStyle}>
            <Building2 size={28} style={{ marginBottom: "10px", opacity: 0.5 }} />
            <div>You don't manage any facilities yet.</div>
            <div style={{ fontSize: "0.72rem", marginTop: "6px", textTransform: "none", letterSpacing: 0 }}>
              Once an admin approves your claim, your facility will appear here.
            </div>
          </div>
        ) : (
          <div style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
            {resources.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  borderTop: i === 0 ? "none" : `1px solid ${theme.colors.border}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: theme.fonts.heading, fontSize: "0.95rem", fontWeight: 700, color: theme.colors.text }}>
                      {r.name}
                    </span>
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                  </div>
                  <div style={{ fontFamily: theme.fonts.mono, fontSize: "0.68rem", color: theme.colors.textMuted, letterSpacing: theme.letterSpacing.wide, marginTop: "3px" }}>
                    {r.type} • {r.city}, {r.state}
                  </div>
                </div>
                <Button variant="primary" size="sm" onClick={() => setEditing(r)}>
                  <Pencil size={14} /> MANAGE
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      {editing && (
        <FacilityEditModal
          resource={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      {showPassword && <ChangePasswordModal onClose={() => setShowPassword(false)} />}
    </div>
  );
}

/* ── Facility edit modal ─────────────────────────────────────── */

function FacilityEditModal({
  resource,
  onClose,
  onSaved,
}: {
  resource: Resource;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<ResourceInput>({
    name: resource.name,
    type: resource.type,
    status: resource.status,
    description: resource.description,
    city: resource.city,
    state: resource.state,
    address: resource.address,
    phone: resource.phone,
    contact: resource.contact,
    website: resource.website,
    facilities: resource.facilities,
    lat: resource.lat,
    lng: resource.lng,
  });
  const [facilitiesText, setFacilitiesText] = React.useState((resource.facilities ?? []).join(", "));
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof ResourceInput>(key: K, value: ResourceInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload: ResourceInput = {
      ...form,
      name: form.name.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      facilities: facilitiesText.split(",").map((s) => s.trim()).filter(Boolean),
      lat: Number(form.lat),
      lng: Number(form.lng),
    };
    try {
      await ownerUpdateResource(resource.id, payload);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="MANAGE FACILITY" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
        {error && (
          <div role="alert" style={errorBox}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <Field label="NAME">
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} style={fieldInput} />
        </Field>

        <Field label="STATUS">
          <select value={form.status} onChange={(e) => set("status", e.target.value)} style={fieldInput}>
            {RESOURCE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Field label="CITY" style={{ flex: 1, minWidth: "160px" }}>
            <input required value={form.city} onChange={(e) => set("city", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="STATE" style={{ flex: 1, minWidth: "160px" }}>
            <input required value={form.state} onChange={(e) => set("state", e.target.value)} style={fieldInput} />
          </Field>
        </div>

        <Field label="ADDRESS">
          <input value={form.address} onChange={(e) => set("address", e.target.value)} style={fieldInput} />
        </Field>

        <Field label="LOCATION">
          <LocationPicker
            lat={Number(form.lat)}
            lng={Number(form.lng)}
            onChange={(la, ln) => setForm((f) => ({ ...f, lat: la as unknown as number, lng: ln as unknown as number }))}
          />
        </Field>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Field label="PHONE" style={{ flex: 1, minWidth: "160px" }}>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} style={fieldInput} />
          </Field>
          <Field label="CONTACT EMAIL" style={{ flex: 1, minWidth: "160px" }}>
            <input value={form.contact} onChange={(e) => set("contact", e.target.value)} style={fieldInput} />
          </Field>
        </div>

        <Field label="WEBSITE">
          <input value={form.website} onChange={(e) => set("website", e.target.value)} style={fieldInput} />
        </Field>

        <Field label="FACILITIES / EQUIPMENT (comma-separated)">
          <input value={facilitiesText} onChange={(e) => setFacilitiesText(e.target.value)} placeholder="3D Printing, Robotics, …" style={fieldInput} />
        </Field>

        <Field label="DESCRIPTION">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} style={{ ...fieldInput, resize: "vertical" }} />
        </Field>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <Button type="button" variant="secondary" size="md" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
            CANCEL
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
            {saving ? "SAVING…" : "SAVE CHANGES"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ── Change-password modal ───────────────────────────────────── */

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await changePassword(current, next);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="CHANGE PASSWORD" onClose={onClose}>
      {done ? (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <CheckCircle2 size={44} style={{ color: "#16a34a", marginBottom: "16px" }} />
          <h3 style={{ fontFamily: theme.fonts.heading, fontSize: "1.1rem", fontWeight: 700, color: theme.colors.text, margin: "0 0 8px" }}>
            PASSWORD UPDATED
          </h3>
          <Button variant="primary" onClick={onClose} style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}>
            CLOSE
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          {error && (
            <div role="alert" style={errorBox}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
          <Field label="CURRENT PASSWORD">
            <input required type="password" value={current} onChange={(e) => setCurrent(e.target.value)} style={fieldInput} />
          </Field>
          <Field label="NEW PASSWORD">
            <input required type="password" value={next} onChange={(e) => setNext(e.target.value)} style={fieldInput} />
          </Field>
          <Field label="CONFIRM NEW PASSWORD">
            <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={fieldInput} />
          </Field>
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <Button type="button" variant="secondary" size="md" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
              {saving ? "SAVING…" : "UPDATE"}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

/* ── Shared modal shell + field bits ─────────────────────────── */

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
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
          maxWidth: "560px",
          maxHeight: isMobile ? "92vh" : "88vh",
          overflowY: "auto",
          border: `1px solid ${theme.colors.borderStrong}`,
          boxShadow: "0 20px 48px rgba(0,0,0,0.25)",
        }}
      >
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
            {title}
          </span>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: theme.colors.textInverse, display: "flex" }}>
            <X size={20} />
          </button>
        </div>
        {children}
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

const emptyStyle: React.CSSProperties = {
  padding: "48px",
  textAlign: "center",
  fontFamily: theme.fonts.mono,
  fontSize: "0.85rem",
  letterSpacing: theme.letterSpacing.wide,
  color: theme.colors.textMuted,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surface,
};
