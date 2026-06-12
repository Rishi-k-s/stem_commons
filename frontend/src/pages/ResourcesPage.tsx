import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { theme } from "../styles/theme";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useSearchAutocomplete } from "../hooks/useSearchAutocomplete";
import { fetchResources } from "../lib/api";
import {
  statusVariant,
  RESOURCE_TYPES,
  RESOURCE_STATUSES,
  type Resource,
  type ResourceType,
  type ResourceStatus,
} from "../data/resources";

type SortKey = "name-asc" | "name-desc" | "recent";

export function ResourcesPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");
  const [typeFilters, setTypeFilters] = React.useState<Set<ResourceType>>(new Set());
  const [statusFilters, setStatusFilters] = React.useState<Set<ResourceStatus>>(new Set());
  const [sort, setSort] = React.useState<SortKey>("name-asc");

  const search = useSearchAutocomplete({ value: query, onChange: setQuery });

  const [resources, setResources] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load resources from the backend once on mount.
  React.useEffect(() => {
    let active = true;
    setLoading(true);
    fetchResources()
      .then((data) => {
        if (active) {
          setResources(data);
          setError(null);
        }
      })
      .catch(() => active && setError("Could not load resources. Is the API running?"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Keep the URL ?q= in sync so the search is shareable / survives reloads.
  React.useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (query) next.set("q", query);
    else next.delete("q");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = resources.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.facilities.some((f) => f.toLowerCase().includes(q));
      const matchesType = typeFilters.size === 0 || typeFilters.has(r.type);
      const matchesStatus = statusFilters.size === 0 || statusFilters.has(r.status);
      return matchesQuery && matchesType && matchesStatus;
    });

    return [...list].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      return b.id - a.id; // recent
    });
  }, [resources, query, typeFilters, statusFilters, sort]);

  const hasActiveFilters =
    query.trim() !== "" || typeFilters.size > 0 || statusFilters.size > 0;

  const clearAll = () => {
    setQuery("");
    setTypeFilters(new Set());
    setStatusFilters(new Set());
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
                  onClick={() => setTypeFilters((s) => toggle(s, t))}
                  style={chip(typeFilters.has(t))}
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
                  onClick={() => setStatusFilters((set) => toggle(set, s))}
                  style={chip(statusFilters.has(s))}
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
            {filtered.length} {filtered.length === 1 ? "RESULT" : "RESULTS"}
            {hasActiveFilters && (
              <span
                onClick={clearAll}
                style={{
                  marginLeft: "14px",
                  color: theme.colors.primary,
                  cursor: "pointer",
                }}
              >
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
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              fontFamily: theme.fonts.mono,
              fontSize: "0.85rem",
              letterSpacing: theme.letterSpacing.wide,
              color: theme.colors.textMuted,
            }}
          >
            LOADING RESOURCES…
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              fontFamily: theme.fonts.body,
              color: theme.colors.error,
            }}
          >
            <p style={{ fontSize: "1rem", margin: 0 }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              fontFamily: theme.fonts.body,
              color: theme.colors.textMuted,
            }}
          >
            <p style={{ fontSize: "1rem", margin: 0 }}>No resources match your search.</p>
            <Button onClick={clearAll} variant="outline" size="sm" style={{ marginTop: "16px" }}>
              CLEAR FILTERS
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fill, minmax(300px, 1fr))",
              gap: isMobile ? "16px" : "24px",
            }}
          >
            {filtered.map((resource) => (
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
