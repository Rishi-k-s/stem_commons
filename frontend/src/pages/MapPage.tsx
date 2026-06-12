import React from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Layers, SlidersHorizontal, Search, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

import { Header } from "../components/common/Header";
import { theme } from "../styles/theme";
import { type Resource } from "../data/resources";
import { fetchResources } from "../lib/api";
import { markerIcon, clusterIcon } from "../components/map/markerIcons";
import { MapDetailPanel } from "../components/map/MapDetailPanel";
import { MapFilterPanel, type MapFilters } from "../components/map/MapFilterPanel";
import { ResizeHandle } from "../components/map/ResizeHandle";
import { MapController } from "../components/map/MapController";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useSearchAutocomplete } from "../hooks/useSearchAutocomplete";

const FILTER_MIN = 220;
const FILTER_MAX = 460;
const DETAIL_MIN = 300;
const DETAIL_MAX = 620;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const TILES = {
  map: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics",
  },
};

const EMPTY_FILTERS: MapFilters = {
  query: "",
  states: new Set(),
  types: new Set(),
  statuses: new Set(),
  facilities: new Set(),
};

export function MapPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [view, setView] = React.useState<"map" | "satellite">("map");
  const [filters, setFilters] = React.useState<MapFilters>(EMPTY_FILTERS);
  const [panelCollapsed, setPanelCollapsed] = React.useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const search = useSearchAutocomplete({
    value: filters.query,
    onChange: (v) => setFilters((f) => ({ ...f, query: v })),
  });
  const [selected, setSelected] = React.useState<Resource | null>(null);
  const [filterWidth, setFilterWidth] = React.useState(280);
  const [detailWidth, setDetailWidth] = React.useState(360);

  const [resources, setResources] = React.useState<Resource[]>([]);

  // Load all resources from the backend once on mount.
  React.useEffect(() => {
    let active = true;
    fetchResources(500, true)
      .then((data) => active && setResources(data))
      .catch(() => active && setResources([]));
    return () => {
      active = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return resources.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.facilities.some((f) => f.toLowerCase().includes(q));
      const matchesState = filters.states.size === 0 || filters.states.has(r.state);
      const matchesType = filters.types.size === 0 || filters.types.has(r.type);
      const matchesStatus = filters.statuses.size === 0 || filters.statuses.has(r.status);
      const matchesFacilities =
        filters.facilities.size === 0 ||
        r.facilities.some((f) => filters.facilities.has(f));
      return matchesQuery && matchesState && matchesType && matchesStatus && matchesFacilities;
    });
  }, [resources, filters]);

  const activeFilterCount =
    (filters.query ? 1 : 0) +
    filters.states.size +
    filters.types.size +
    filters.statuses.size +
    filters.facilities.size;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top rule */}
      <div style={{ height: "3px", background: theme.colors.primary, flexShrink: 0 }} />

      <Header />

      {/* Content row: filter panel (desktop) + map.
          zIndex:0 establishes a stacking context so the map's high z-index
          overlays (search bar, detail panel, filter sheet, Leaflet controls)
          stay contained below the Header and don't cover its mobile dropdown. */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", zIndex: 0 }}>
        {/* Desktop side filter panel */}
        {!isMobile && (
          <>
            <MapFilterPanel
              filters={filters}
              resultCount={filtered.length}
              collapsed={panelCollapsed}
              width={filterWidth}
              onToggleCollapse={() => setPanelCollapsed((c) => !c)}
              onChange={setFilters}
            />
            {!panelCollapsed && (
              <ResizeHandle onResize={(dx) => setFilterWidth((w) => clamp(w + dx, FILTER_MIN, FILTER_MAX))} />
            )}
          </>
        )}

        {/* Map area */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Persistent search bar (always visible, never inside filters) */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: isMobile ? "16px" : "50%",
              right: isMobile ? "16px" : "auto",
              transform: isMobile ? "none" : "translateX(-50%)",
              zIndex: 600,
              display: "flex",
              gap: "8px",
              width: isMobile ? "auto" : "380px",
              maxWidth: "calc(100% - 32px)",
            }}
          >
            <div
              style={{
                position: "relative",
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                padding: "0 12px",
                height: "42px",
                minWidth: 0,
              }}
            >
              <Search size={16} style={{ color: theme.colors.primary, flexShrink: 0 }} />
              <input
                value={filters.query}
                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                {...search.inputProps}
                placeholder="Search makerspaces, cities, states…"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: theme.fonts.body,
                  fontSize: "0.88rem",
                  color: theme.colors.text,
                  minWidth: 0,
                }}
              />
              {filters.query && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, query: "" }))}
                  aria-label="Clear search"
                  style={{ background: "none", border: "none", cursor: "pointer", color: theme.colors.textMuted, display: "flex", flexShrink: 0 }}
                >
                  <X size={15} />
                </button>
              )}
              {search.dropdown}
            </div>

            {/* Mobile filters button sits beside the search bar */}
            {isMobile && (
              <button
                onClick={() => setMobileFiltersOpen(true)}
                aria-label="Open filters"
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                  width: "42px",
                  height: "42px",
                  flexShrink: 0,
                  cursor: "pointer",
                  color: theme.colors.primary,
                }}
              >
                <SlidersHorizontal size={17} />
                {activeFilterCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: theme.colors.primary,
                      color: theme.colors.textInverse,
                      fontFamily: theme.fonts.mono,
                      fontSize: "0.6rem",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Map / Satellite toggle (pushed below the search bar on mobile) */}
          <div
            style={{
              position: "absolute",
              top: isMobile ? "68px" : "16px",
              left: "16px",
              zIndex: 500,
              display: "inline-flex",
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            {(["map", "satellite"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 14px",
                  fontFamily: theme.fonts.heading,
                  fontSize: "0.72rem",
                  letterSpacing: theme.letterSpacing.normal,
                  background: view === v ? theme.colors.primary : "transparent",
                  color: view === v ? theme.colors.textInverse : theme.colors.textMuted,
                }}
              >
                {v === "map" ? <Layers size={13} /> : null}
                {v.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Mobile result-count pill (Google-Maps-style) */}
          {isMobile && !selected && (
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 500,
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                padding: "8px 16px",
                fontFamily: theme.fonts.mono,
                fontSize: "0.72rem",
                letterSpacing: theme.letterSpacing.wide,
                color: theme.colors.textMuted,
                whiteSpace: "nowrap",
              }}
            >
              {filtered.length} {filtered.length === 1 ? "RESULT" : "RESULTS"}
            </div>
          )}

          {/* Leaflet map */}
          <MapContainer center={[22.5, 79]} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom zoomControl={false}>
            <ZoomControl position="bottomleft" />
            <TileLayer key={view} url={TILES[view].url} attribution={TILES[view].attribution} />

            <MapController selected={selected} />

            <MarkerClusterGroup chunkedLoading iconCreateFunction={clusterIcon}>
              {filtered.map((r) => {
                const isSelected = selected?.id === r.id;
                return (
                  <Marker
                    key={r.id}
                    position={[r.lat, r.lng]}
                    icon={markerIcon(r, isSelected)}
                    zIndexOffset={isSelected ? 1000 : 0}
                    eventHandlers={{ click: () => setSelected(r) }}
                  />
                );
              })}
            </MarkerClusterGroup>
          </MapContainer>

          {/* Slide-in / bottom-sheet detail panel */}
          <MapDetailPanel
            resource={selected}
            allResources={resources}
            width={detailWidth}
            mobile={isMobile}
            onResize={(dx) => setDetailWidth((w) => clamp(w + dx, DETAIL_MIN, DETAIL_MAX))}
            onClose={() => setSelected(null)}
            onSelectNearby={setSelected}
          />
        </div>

        {/* Mobile full-screen filter sheet */}
        {isMobile && mobileFiltersOpen && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1200,
              display: "flex",
              flexDirection: "column",
              background: theme.colors.surface,
            }}
          >
            <MapFilterPanel
              filters={filters}
              resultCount={filtered.length}
              collapsed={false}
              width={filterWidth}
              mobile
              onToggleCollapse={() => setMobileFiltersOpen(false)}
              onChange={setFilters}
            />
          </div>
        )}
      </div>

      {/* Footer — hidden on mobile for a full-screen map experience */}
      {!isMobile && (
        <footer
          style={{
            background: theme.colors.footer,
            color: theme.colors.textInverse,
            padding: "0 32px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            borderTop: `3px solid ${theme.colors.secondary}`,
          }}
        >
          <p style={{ fontFamily: theme.fonts.mono, fontSize: theme.fontSizes.xs, color: "rgba(255,255,255,0.6)", margin: 0 }}>
            © 2026 STEM COMMONS. ALL RIGHTS RESERVED.
          </p>
          <button
            onClick={() => navigate("/resources")}
            style={{
              fontFamily: theme.fonts.heading,
              fontSize: theme.fontSizes.xs,
              letterSpacing: theme.letterSpacing.normal,
              color: theme.colors.textInverse,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            LIST VIEW
          </button>
        </footer>
      )}
    </div>
  );
}
