import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Pencil, Trash2, X, AlertCircle, Search, Check, Download } from "lucide-react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { theme } from "../styles/theme";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useMediaQuery";
import { LocationPicker } from "../components/admin/LocationPicker";
import { AnalyticsCards } from "../components/admin/AnalyticsCards";
import { ClaimsPanel } from "../components/admin/ClaimsPanel";
import { ReportsPanel } from "../components/admin/ReportsPanel";
import { UsersPanel } from "../components/admin/UsersPanel";
import { ActivityPanel } from "../components/admin/ActivityPanel";
import { RecentSubmissionsCard } from "../components/admin/RecentSubmissionsCard";
import {
  fetchResources,
  fetchResourcesPage,
  createResource,
  updateResource,
  deleteResource,
  verifyResource,
  bulkVerifyResources,
  bulkDeleteResources,
  exportResourcesCsv,
  type ResourceInput,
  type ResourcePage,
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

  const [resourcePage, setResourcePage] = React.useState<ResourcePage>({ data: [], total: 0, pages: 0, page: 1 });
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [section, setSection] = React.useState<"overview" | "resources" | "claims" | "reports" | "users" | "activity">("overview");
  const [tab, setTab] = React.useState<"pending" | "all">("pending");
  const [pendingCount, setPendingCount] = React.useState(0);

  const [editing, setEditing] = React.useState<Resource | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [verifyingId, setVerifyingId] = React.useState<number | null>(null);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = React.useState(false);

  // Debounce search query
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to page 1 when tab or query changes
  React.useEffect(() => { setPage(1); }, [tab, debouncedQuery]);

  const reload = React.useCallback(() => {
    setLoading(true);
    const verified = tab === "pending" ? false : undefined;
    fetchResourcesPage(page, 50, debouncedQuery || undefined, verified)
      .then(setResourcePage)
      .finally(() => setLoading(false));
    // Keep pending count fresh
    fetchResourcesPage(1, 1, undefined, false).then((r) => setPendingCount(r.total));
  }, [page, tab, debouncedQuery]);

  React.useEffect(() => {
    if (section === "resources") reload();
  }, [section, reload]);

  const filtered = resourcePage.data;

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  const toggleSelectAll = () =>
    setSelected(() => {
      if (allVisibleSelected) return new Set();
      return new Set(filtered.map((r) => r.id));
    });

  const handleVerify = async (r: Resource) => {
    setVerifyingId(r.id);
    try {
      const updated = await verifyResource(r.id);
      setResources((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, isVerified: updated.isVerified } : x))
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to verify resource.");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleBulkVerify = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      await bulkVerifyResources(ids);
      setSelected(new Set());
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Bulk verify failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} resource(s)? This cannot be undone.`)) return;
    setBulkBusy(true);
    try {
      await bulkDeleteResources(ids);
      setSelected(new Set());
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Bulk delete failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportResourcesCsv();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Export failed.");
    }
  };

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
          Overview, submissions, claims, and reports — manage the entire directory in one place.
        </p>

        {/* Section navigation */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap", borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: "0" }}>
          <SectionTab label="OVERVIEW" active={section === "overview"} onClick={() => setSection("overview")} />
          <SectionTab
            label="RESOURCES"
            active={section === "resources"}
            onClick={() => setSection("resources")}
            badge={pendingCount > 0 ? pendingCount : undefined}
          />
          <SectionTab label="CLAIMS" active={section === "claims"} onClick={() => setSection("claims")} />
          <SectionTab label="REPORTS" active={section === "reports"} onClick={() => setSection("reports")} />
          <SectionTab label="USERS" active={section === "users"} onClick={() => setSection("users")} />
          <SectionTab label="ACTIVITY" active={section === "activity"} onClick={() => setSection("activity")} />
        </div>

        {section === "overview" && (
          <>
            <AnalyticsCards />
            <RecentSubmissionsCard onApproved={reload} />
          </>
        )}
        {section === "claims" && <ClaimsPanel />}
        {section === "reports" && <ReportsPanel />}
        {section === "users" && <UsersPanel />}
        {section === "activity" && <ActivityPanel />}

        {section === "resources" && (
          <>
            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              <button onClick={() => setTab("pending")} style={tabStyle(tab === "pending")}>
                PENDING REVIEW
                {pendingCount > 0 && <span style={pendingPill}>{pendingCount}</span>}
              </button>
              <button onClick={() => setTab("all")} style={tabStyle(tab === "all")}>
                ALL RESOURCES
              </button>
            </div>

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
              <Button variant="outline" size="md" onClick={handleExport} style={{ justifyContent: "center" }}>
                <Download size={15} /> EXPORT CSV
              </Button>
              <Button variant="primary" size="md" onClick={() => setCreating(true)} style={{ justifyContent: "center" }}>
                <Plus size={15} /> ADD RESOURCE
              </Button>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div style={bulkBar}>
                <span style={{ fontFamily: theme.fonts.mono, fontSize: "0.7rem", letterSpacing: theme.letterSpacing.wide, color: theme.colors.text }}>
                  {selected.size} SELECTED
                </span>
                <div style={{ display: "flex", gap: "8px", marginLeft: "auto", flexWrap: "wrap" }}>
                  <Button variant="primary" size="sm" disabled={bulkBusy} onClick={handleBulkVerify}>
                    <Check size={14} /> VERIFY
                  </Button>
                  <Button variant="outline" size="sm" disabled={bulkBusy} onClick={handleBulkDelete} style={{ color: "#b91c1c", borderColor: "#b91c1c" }}>
                    <Trash2 size={14} /> DELETE
                  </Button>
                  <Button variant="secondary" size="sm" disabled={bulkBusy} onClick={() => setSelected(new Set())}>
                    CLEAR
                  </Button>
                </div>
              </div>
            )}

            {/* List */}
            {loading ? (
              <div style={emptyStyle}>LOADING…</div>
            ) : filtered.length === 0 ? (
              <div style={emptyStyle}>
                {tab === "pending"
                  ? "Nothing awaiting review — all submissions are verified."
                  : "No resources found."}
              </div>
            ) : (
              <div style={{ border: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
                {/* Select-all header */}
                <label style={selectAllRow}>
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} style={{ cursor: "pointer" }} />
                  <span style={{ fontFamily: theme.fonts.mono, fontSize: "0.62rem", letterSpacing: theme.letterSpacing.wide, color: theme.colors.textMuted }}>
                    SELECT ALL ON PAGE ({filtered.length}) — {resourcePage.total} TOTAL
                  </span>
                </label>
                {filtered.map((r) => {
                  const pending = r.isVerified === false;
                  const checked = selected.has(r.id);
                  return (
                    <div
                      key={r.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        borderTop: `1px solid ${theme.colors.border}`,
                        background: checked
                          ? "rgba(41,0,135,0.05)"
                          : pending
                          ? "rgba(234,179,8,0.06)"
                          : undefined,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(r.id)}
                        style={{ cursor: "pointer", flexShrink: 0 }}
                        aria-label={`Select ${r.name}`}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontFamily: theme.fonts.heading, fontSize: "0.95rem", fontWeight: 700, color: theme.colors.text }}>
                            {r.name}
                          </span>
                          <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                          {pending && <span style={pendingBadge}>PENDING</span>}
                        </div>
                        <div style={{ fontFamily: theme.fonts.mono, fontSize: "0.68rem", color: theme.colors.textMuted, letterSpacing: theme.letterSpacing.wide, marginTop: "3px" }}>
                          {r.type} • {r.city}, {r.state}
                        </div>
                      </div>
                      {pending && (
                        <Button variant="primary" size="sm" onClick={() => handleVerify(r)} disabled={verifyingId === r.id}>
                          <Check size={14} /> {verifyingId === r.id ? "…" : "APPROVE"}
                        </Button>
                      )}
                      <button onClick={() => setEditing(r)} aria-label="Edit" style={iconBtn}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(r)} aria-label="Delete" style={{ ...iconBtn, color: "#b91c1c" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {resourcePage.pages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontFamily: theme.fonts.mono, fontSize: "0.65rem", color: theme.colors.textMuted, letterSpacing: theme.letterSpacing.wide }}>
                  PAGE {resourcePage.page} OF {resourcePage.pages} ({resourcePage.total} TOTAL)
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← PREV</Button>
                  <Button variant="outline" size="sm" disabled={page >= resourcePage.pages} onClick={() => setPage((p) => p + 1)}>NEXT →</Button>
                </div>
              </div>
            )}
          </>
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
    if (Number(form.lat) === 0 && Number(form.lng) === 0) {
      setError("Please set a location on the map (search or click to drop a pin).");
      return;
    }
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

          <Field label="LOCATION">
            <LocationPicker
              lat={Number(form.lat)}
              lng={Number(form.lng)}
              onChange={(la, ln) =>
                setForm((f) => ({ ...f, lat: la as unknown as number, lng: ln as unknown as number }))
              }
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

function tabStyle(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontFamily: theme.fonts.mono,
    fontSize: "0.7rem",
    letterSpacing: theme.letterSpacing.wide,
    padding: "9px 16px",
    border: `1px solid ${active ? theme.colors.primary : theme.colors.borderStrong}`,
    background: active ? theme.colors.primary : theme.colors.surface,
    color: active ? theme.colors.textInverse : theme.colors.text,
    fontWeight: 700,
  };
}

function SectionTab({
  label,
  active,
  onClick,
  badge,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontFamily: theme.fonts.mono,
        fontSize: "0.72rem",
        letterSpacing: theme.letterSpacing.wide,
        padding: "10px 4px",
        marginBottom: "-1px",
        background: "none",
        border: "none",
        borderBottom: `2px solid ${active ? theme.colors.primary : "transparent"}`,
        color: active ? theme.colors.primary : theme.colors.textMuted,
        fontWeight: 700,
      }}
    >
      {label}
      {badge !== undefined && <span style={pendingPill}>{badge}</span>}
    </button>
  );
}

const bulkBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 16px",
  marginBottom: "16px",
  background: theme.colors.surfaceAlt,
  border: `1px solid ${theme.colors.borderStrong}`,
  flexWrap: "wrap",
};

const selectAllRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 16px",
  background: theme.colors.surface,
  cursor: "pointer",
};

const pendingPill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "18px",
  height: "18px",
  padding: "0 5px",
  borderRadius: "9px",
  background: "#eab308",
  color: "#1a1a1a",
  fontFamily: theme.fonts.mono,
  fontSize: "0.62rem",
  fontWeight: 700,
};

const pendingBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  background: "rgba(234,179,8,0.18)",
  border: "1px solid rgba(234,179,8,0.55)",
  color: "#854d0e",
  fontFamily: theme.fonts.mono,
  fontSize: "0.6rem",
  fontWeight: 700,
  letterSpacing: theme.letterSpacing.wide,
};
