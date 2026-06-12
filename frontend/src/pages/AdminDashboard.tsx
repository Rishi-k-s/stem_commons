import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Pencil, Trash2, X, AlertCircle, Search } from "lucide-react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { theme } from "../styles/theme";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useMediaQuery";
import {
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
  type ResourceInput,
} from "../lib/api";
import { ApiError } from "../lib/auth";
import {
  statusVariant,
  RESOURCE_TYPES,
  RESOURCE_STATUSES,
  type Resource,
} from "../data/resources";

const EMPTY_FORM: ResourceInput = {
  name: "",
  type: RESOURCE_TYPES[0],
  status: RESOURCE_STATUSES[0],
  description: "",
  city: "",
  state: "",
  address: "",
  phone: "",
  contact: "",
  website: "",
  facilities: [],
  lat: 0,
  lng: 0,
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();

  const [resources, setResources] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");

  const [editing, setEditing] = React.useState<Resource | null>(null);
  const [creating, setCreating] = React.useState(false);

  const reload = React.useCallback(() => {
    setLoading(true);
    fetchResources(1000)
      .then(setResources)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(reload, [reload]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q)
    );
  }, [resources, query]);

  const handleDelete = async (r: Resource) => {
    if (!window.confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    try {
      await deleteResource(r.id);
      setResources((prev) => prev.filter((x) => x.id !== r.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete resource.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const showForm = creating || editing !== null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: theme.colors.background }}>
      <div style={{ height: "3px", background: theme.colors.primary, flexShrink: 0 }} />
      <Header />

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: isMobile ? "24px 16px" : "40px 32px",
        }}
      >
        {/* Title row */}
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
          <h1
            style={{
              fontFamily: theme.fonts.heading,
              fontSize: isMobile ? "1.5rem" : "2rem",
              fontWeight: 700,
              margin: 0,
              color: theme.colors.text,
            }}
          >
            ADMIN DASHBOARD
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: "0.7rem", color: theme.colors.textMuted, letterSpacing: theme.letterSpacing.wide }}>
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={13} /> SIGN OUT
            </Button>
          </div>
        </div>

        <p style={{ fontFamily: theme.fonts.body, fontSize: "0.9rem", color: theme.colors.textMuted, marginTop: 0, marginBottom: "24px" }}>
          Manage the resource directory — create, edit, and remove entries.
        </p>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: `1px solid ${theme.colors.borderStrong}`,
              background: theme.colors.surface,
              padding: "10px 14px",
            }}
          >
            <Search size={16} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name, city, or state…"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: theme.fonts.body,
                fontSize: "0.9rem",
                color: theme.colors.text,
                minWidth: 0,
              }}
            />
          </div>
          <Button variant="primary" size="md" onClick={() => setCreating(true)} style={{ justifyContent: "center" }}>
            <Plus size={15} /> ADD RESOURCE
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div style={emptyStyle}>LOADING…</div>
        ) : filtered.length === 0 ? (
          <div style={emptyStyle}>No resources found.</div>
        ) : (
          <div style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
            {filtered.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
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
                <button onClick={() => setEditing(r)} aria-label="Edit" style={iconBtn}>
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(r)} aria-label="Delete" style={{ ...iconBtn, color: "#b91c1c" }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ResourceFormModal
          initial={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

/* ── Create / edit modal ─────────────────────────────────────── */

function ResourceFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Resource;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isMobile = useIsMobile();
  const [form, setForm] = React.useState<ResourceInput>(() =>
    initial
      ? {
          name: initial.name,
          type: initial.type,
          status: initial.status,
          description: initial.description,
          city: initial.city,
          state: initial.state,
          address: initial.address,
          phone: initial.phone,
          contact: initial.contact,
          website: initial.website,
          facilities: initial.facilities,
          lat: initial.lat,
          lng: initial.lng,
        }
      : EMPTY_FORM
  );
  const [facilitiesText, setFacilitiesText] = React.useState(
    (initial?.facilities ?? []).join(", ")
  );
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
      facilities: facilitiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      lat: Number(form.lat),
      lng: Number(form.lng),
    };
    try {
      if (initial) await updateResource(initial.id, payload);
      else await createResource(payload);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save resource.");
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
          maxWidth: "560px",
          maxHeight: isMobile ? "92vh" : "88vh",
          overflowY: "auto",
          border: `1px solid ${theme.colors.borderStrong}`,
          boxShadow: "0 20px 48px rgba(0,0,0,0.25)",
        }}
      >
        {/* Modal header */}
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
            {initial ? "EDIT RESOURCE" : "ADD RESOURCE"}
          </span>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: theme.colors.textInverse, display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          {error && (
            <div role="alert" style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(185,28,28,0.08)", border: "1px solid rgba(185,28,28,0.3)", color: "#b91c1c", padding: "10px 12px", marginBottom: "16px", fontFamily: theme.fonts.body, fontSize: "0.82rem" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <Field label="NAME">
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} style={fieldInput} />
          </Field>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Field label="TYPE" style={{ flex: 1, minWidth: "160px" }}>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} style={fieldInput}>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="STATUS" style={{ flex: 1, minWidth: "160px" }}>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} style={fieldInput}>
                {RESOURCE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

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

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Field label="LATITUDE" style={{ flex: 1, minWidth: "140px" }}>
              <input required type="number" step="any" value={form.lat} onChange={(e) => set("lat", e.target.value as unknown as number)} style={fieldInput} />
            </Field>
            <Field label="LONGITUDE" style={{ flex: 1, minWidth: "140px" }}>
              <input required type="number" step="any" value={form.lng} onChange={(e) => set("lng", e.target.value as unknown as number)} style={fieldInput} />
            </Field>
          </div>

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

          <Field label="FACILITIES (comma-separated)">
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
              {saving ? "SAVING…" : initial ? "SAVE CHANGES" : "CREATE"}
            </Button>
          </div>
        </form>
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

const iconBtn: React.CSSProperties = {
  background: "none",
  border: `1px solid ${theme.colors.border}`,
  cursor: "pointer",
  color: theme.colors.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px",
  flexShrink: 0,
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
