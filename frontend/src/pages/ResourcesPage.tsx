import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { theme } from "../styles/theme";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useSearchAutocomplete } from "../hooks/useSearchAutocomplete";
import { fetchResourcesPage, type ResourcePage } from "../lib/api";
import {
  statusVariant,
  RESOURCE_TYPES,
  RESOURCE_STATUSES,
  type ResourceType,
  type ResourceStatus,
} from "../data/resources";

type SortKey = "name-asc" | "name-desc" | "recent";
const PAGE_SIZE = 50;

export function ResourcesPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);
  const [typeFilter, setTypeFilter] = React.useState<ResourceType | "">("");
  const [statusFilter, setStatusFilter] = React.useState<ResourceStatus | "">("");
  const [sort, setSort] = React.useState<SortKey>("name-asc");
  const [page, setPage] = React.useState(1);

  const search = useSearchAutocomplete({ value: query, onChange: setQuery });

  const [result, setResult] = React.useState<ResourcePage>({ data: [], total: 0, pages: 0, page: 1 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Debounce search query
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to page 1 whenever filters/sort change
  React.useEffect(() => { setPage(1); }, [debouncedQuery, typeFilter, statusFilter, sort]);

  // Sync ?q= in URL
  React.useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (query) next.set("q", query); else next.delete("q");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Fetch from server
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    fetchResourcesPage(
      page, PAGE_SIZE,
      debouncedQuery || undefined,
      true,
      typeFilter || undefined,
      statusFilter || undefined,
      sort,
    )
      .then((data) => { if (active) { setResult(data); setError(null); } })
      .catch(() => active && setError("Could not load resources. Is the API running?"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, debouncedQuery, typeFilter, statusFilter, sort]);

  const hasActiveFilters = query.trim() !== "" || typeFilter !== "" || statusFilter !== "";

  const clearAll = () => {
    setQuery("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const chip = (active: boolean): React.CSSProperties => ({
    fontFamily: theme.fonts.mono,
    fontSize: "0.68rem",
    letterSpacing: theme.letterSpacing.wide,
    padding: "6px 12px",
    cursor: "pointer",
    border: `1px solid ${active ? theme.colors.primary : theme.colors.border}`,
    background: active ? theme.colors.primary : theme.colors.surface,
    color: active ? theme.colors.textInverse : theme.colors.textMuted,
    transition: "all 0.12s",
    userSelect: "none",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: theme.colors.background,
      }}
    >
      {/* Top rule */}
      <div style={{ height: "3px", background: theme.colors.primary, flexShrink: 0 }} />

      <Header />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: isMobile ? "24px 18px" : "48px 32px",
        }}
      >
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: isMobile ? "12px" : "16px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
              color: theme.colors.primary,
              fontFamily: theme.fonts.heading,
              fontSize: "0.78rem",
              letterSpacing: theme.letterSpacing.normal,
            }}
          >
            <ArrowLeft size={16} /> BACK
          </button>
          <h1
            style={{
              fontFamily: theme.fonts.heading,
              fontSize: isMobile ? "1.4rem" : "2rem",
              fontWeight: 700,
              margin: 0,
              color: theme.colors.text,
            }}
          >
            DISCOVER RESOURCES
          </h1>
        </div>

        {/* Search input */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: `1px solid ${theme.colors.borderStrong}`,
            background: theme.colors.surface,
            padding: "10px 14px",
            marginBottom: "16px",
          }}
        >
          <Search size={18} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            {...search.inputProps}
            placeholder="Search by name, city, state, type, or facility…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: theme.fonts.body,
              fontSize: "0.95rem",
              color: theme.colors.text,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme.colors.textMuted,
                display: "flex",
              }}
            >
              <X size={16} />
            </button>
          )}
          {search.dropdown}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "20px" }}>
          <div>
            <div style={filterLabel}>TYPE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {RESOURCE_TYPES.map((t) => (
                <span
                  key={t}
                  onClick={() => setTypeFilter((v) => v === t ? "" : t)}
                  style={chip(typeFilter === t)}
                >
                  {t.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={filterLabel}>STATUS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {RESOURCE_STATUSES.map((s) => (
                <span
                  key={s}
                  onClick={() => setStatusFilter((v) => v === s ? "" : s)}
                  style={chip(statusFilter === s)}
                >
                  {s.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Result count + sort + clear */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px",
            paddingBottom: "16px",
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: "0.75rem",
              letterSpacing: theme.letterSpacing.wide,
              color: theme.colors.textMuted,
            }}
          >
            {loading ? "LOADING…" : `${result.total.toLocaleString()} ${result.total === 1 ? "RESULT" : "RESULTS"}`}
            {hasActiveFilters && !loading && (
              <span onClick={clearAll} style={{ marginLeft: "14px", color: theme.colors.primary, cursor: "pointer" }}>
                CLEAR ALL
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ ...filterLabel, marginBottom: 0 }}>SORT</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: "0.72rem",
                letterSpacing: theme.letterSpacing.wide,
                padding: "6px 10px",
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                color: theme.colors.text,
                cursor: "pointer",
              }}
            >
              <option value="name-asc">NAME (A–Z)</option>
              <option value="name-desc">NAME (Z–A)</option>
              <option value="recent">RECENTLY ADDED</option>
            </select>
          </div>
        </div>

        {/* Resources Grid / loading / error / empty state */}
        {error ? (
          <div style={{ textAlign: "center", padding: "64px 24px", fontFamily: theme.fonts.body, color: theme.colors.error }}>
            <p style={{ fontSize: "1rem", margin: 0 }}>{error}</p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "64px 24px", fontFamily: theme.fonts.mono, fontSize: "0.85rem", letterSpacing: theme.letterSpacing.wide, color: theme.colors.textMuted }}>
            LOADING RESOURCES…
          </div>
        ) : result.data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", fontFamily: theme.fonts.body, color: theme.colors.textMuted }}>
            <p style={{ fontSize: "1rem", margin: 0 }}>No resources match your search.</p>
            <Button onClick={clearAll} variant="outline" size="sm" style={{ marginTop: "16px" }}>CLEAR FILTERS</Button>
          </div>
        ) : (
          <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
              gap: isMobile ? "16px" : "24px",
            }}
          >
            {result.data.map((resource) => (
              <div
                key={resource.id}
                onClick={() => navigate(`/resource/${resource.id}`)}
                style={{
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  padding: "24px",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: theme.fonts.heading,
                      fontSize: theme.fontSizes.md,
                      fontWeight: 700,
                      margin: 0,
                      color: theme.colors.text,
                    }}
                  >
                    {resource.name}
                  </h3>
                  <Badge variant={statusVariant(resource.status)}>{resource.status}</Badge>
                </div>

                <p
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: "0.85rem",
                    color: "rgba(0,0,0,0.6)",
                    margin: 0,
                  }}
                >
                  {resource.type}
                </p>

                <p
                  style={{
                    fontFamily: theme.fonts.body,
                    fontSize: "0.9rem",
                    color: theme.colors.textMuted,
                    margin: "12px 0 20px",
                  }}
                >
                  {resource.city}, {resource.state}
                </p>

                <Button
                  onClick={() => navigate(`/resource/${resource.id}`)}
                  variant="primary"
                  size="sm"
                  style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
                >
                  VIEW DETAILS
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {result.pages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "40px", flexWrap: "wrap", gap: "12px" }}>
              <span style={{ fontFamily: theme.fonts.mono, fontSize: "0.68rem", letterSpacing: theme.letterSpacing.wide, color: theme.colors.textMuted }}>
                PAGE {result.page} OF {result.pages}
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  ← PREV
                </Button>
                {/* Page number pills — show up to 5 around current page */}
                {Array.from({ length: Math.min(result.pages, 5) }, (_, i) => {
                  const start = Math.max(1, Math.min(result.page - 2, result.pages - 4));
                  return start + i;
                }).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    style={{
                      fontFamily: theme.fonts.mono,
                      fontSize: "0.7rem",
                      padding: "6px 10px",
                      border: `1px solid ${p === page ? theme.colors.primary : theme.colors.border}`,
                      background: p === page ? theme.colors.primary : theme.colors.surface,
                      color: p === page ? theme.colors.textInverse : theme.colors.text,
                      cursor: "pointer",
                      minWidth: "36px",
                    }}
                  >
                    {p}
                  </button>
                ))}
                <Button variant="outline" size="sm" disabled={page >= result.pages} onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  NEXT →
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          background: theme.colors.footer,
          color: theme.colors.textInverse,
          padding: isMobile ? "14px 18px" : "0 32px",
          height: isMobile ? "auto" : "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "center" : "space-between",
          flexShrink: 0,
          borderTop: `3px solid ${theme.colors.secondary}`,
        }}
      >
        <p
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSizes.xs,
            color: "rgba(255,255,255,0.6)",
            margin: 0,
            textAlign: "center",
          }}
        >
          © 2026 STEM COMMONS. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}

const filterLabel: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "0.62rem",
  letterSpacing: theme.letterSpacing.widest,
  color: theme.colors.textFaint,
  marginBottom: "8px",
};
