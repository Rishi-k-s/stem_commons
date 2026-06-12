import React from "react";
import { Search, X, SlidersHorizontal, ChevronLeft, MapPin } from "lucide-react";
import { theme } from "../../styles/theme";
import {
  ALL_STATES,
  ALL_FACILITIES,
  RESOURCE_TYPES,
  RESOURCE_STATUSES,
  statusColor,
  type ResourceType,
  type ResourceStatus,
} from "../../data/resources";

export interface MapFilters {
  query: string;
  states: Set<string>; // empty = all states
  types: Set<ResourceType>;
  statuses: Set<ResourceStatus>;
  facilities: Set<string>;
}

interface MapFilterPanelProps {
  filters: MapFilters;
  resultCount: number;
  collapsed: boolean;
  width: number;
  mobile?: boolean;
  onToggleCollapse: () => void;
  onChange: (next: MapFilters) => void;
}

export function MapFilterPanel({
  filters,
  resultCount,
  collapsed,
  width,
  mobile = false,
  onToggleCollapse,
  onChange,
}: MapFilterPanelProps) {
  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  const activeCount =
    (filters.query ? 1 : 0) +
    filters.states.size +
    filters.types.size +
    filters.statuses.size +
    filters.facilities.size;

  const clearAll = () =>
    onChange({
      query: "",
      states: new Set(),
      types: new Set(),
      statuses: new Set(),
      facilities: new Set(),
    });

  // Collapsed rail — just a reopen button. (desktop only)
  if (collapsed && !mobile) {
    return (
      <button
        onClick={onToggleCollapse}
        aria-label="Show filters"
        style={{
          flexShrink: 0,
          width: "44px",
          background: theme.colors.surface,
          borderRight: `1px solid ${theme.colors.border}`,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          paddingTop: "16px",
          color: theme.colors.primary,
        }}
      >
        <SlidersHorizontal size={18} />
        {activeCount > 0 && (
          <span
            style={{
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
            {activeCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside
      style={{
        flexShrink: 0,
        width: mobile ? "100%" : `${width}px`,
        height: mobile ? "100%" : undefined,
        background: theme.colors.surface,
        borderRight: mobile ? "none" : `1px solid ${theme.colors.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: `1px solid ${theme.colors.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SlidersHorizontal size={16} style={{ color: theme.colors.primary }} />
          <span
            style={{
              fontFamily: theme.fonts.heading,
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: theme.letterSpacing.wide,
              color: theme.colors.text,
            }}
          >
            FILTERS
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          aria-label={mobile ? "Close filters" : "Hide filters"}
          style={{ background: "none", border: "none", cursor: "pointer", color: theme.colors.textMuted, display: "flex" }}
        >
          {mobile ? <X size={20} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* State */}
        <div style={groupLabel}>
          <MapPin size={12} style={{ color: theme.colors.secondary }} /> STATE
        </div>
        <div style={{ marginBottom: "20px" }}>
          <StateMultiSelect
            selected={filters.states}
            onChange={(states) => onChange({ ...filters, states })}
          />
        </div>

        {/* Type */}
        <div style={groupLabel}>TYPE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
          {RESOURCE_TYPES.map((t) => (
            <Checkbox
              key={t}
              label={t}
              checked={filters.types.has(t)}
              onClick={() => onChange({ ...filters, types: toggle(filters.types, t) })}
            />
          ))}
        </div>

        {/* Status */}
        <div style={groupLabel}>STATUS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
          {RESOURCE_STATUSES.map((s) => (
            <Checkbox
              key={s}
              label={s}
              dotColor={statusColor(s)}
              checked={filters.statuses.has(s)}
              onClick={() => onChange({ ...filters, statuses: toggle(filters.statuses, s) })}
            />
          ))}
        </div>

        {/* Facilities */}
        <div style={groupLabel}>FACILITIES</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {ALL_FACILITIES.map((f) => (
            <Checkbox
              key={f}
              label={f}
              checked={filters.facilities.has(f)}
              onClick={() => onChange({ ...filters, facilities: toggle(filters.facilities, f) })}
            />
          ))}
        </div>
      </div>

      {/* Footer: result count + clear */}
      <div
        style={{
          flexShrink: 0,
          borderTop: `1px solid ${theme.colors.border}`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <button
          onClick={clearAll}
          disabled={activeCount === 0}
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: "0.7rem",
            letterSpacing: theme.letterSpacing.normal,
            background: "none",
            border: "none",
            cursor: activeCount === 0 ? "default" : "pointer",
            color: activeCount === 0 ? theme.colors.textFaint : theme.colors.primary,
          }}
        >
          CLEAR ALL
        </button>
        {mobile ? (
          <button
            onClick={onToggleCollapse}
            style={{
              fontFamily: theme.fonts.heading,
              fontSize: "0.74rem",
              letterSpacing: theme.letterSpacing.normal,
              background: theme.colors.primary,
              border: "none",
              cursor: "pointer",
              color: theme.colors.textInverse,
              padding: "10px 20px",
            }}
          >
            SHOW {resultCount} {resultCount === 1 ? "RESULT" : "RESULTS"}
          </button>
        ) : (
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: "0.72rem",
              letterSpacing: theme.letterSpacing.wide,
              color: theme.colors.textMuted,
            }}
          >
            {resultCount} {resultCount === 1 ? "RESULT" : "RESULTS"}
          </span>
        )}
      </div>
    </aside>
  );
}

function Checkbox({
  label,
  checked,
  onClick,
  dotColor,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 0",
        textAlign: "left",
        width: "100%",
      }}
    >
      <span
        style={{
          width: "15px",
          height: "15px",
          flexShrink: 0,
          border: `1.5px solid ${checked ? theme.colors.primary : theme.colors.borderStrong}`,
          background: checked ? theme.colors.primary : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && (
          <span
            style={{
              width: "5px",
              height: "9px",
              borderRight: `2px solid ${theme.colors.textInverse}`,
              borderBottom: `2px solid ${theme.colors.textInverse}`,
              transform: "rotate(45deg) translate(-1px,-1px)",
            }}
          />
        )}
      </span>
      {dotColor && (
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
      )}
      <span
        style={{
          fontFamily: theme.fonts.body,
          fontSize: "0.85rem",
          color: checked ? theme.colors.text : theme.colors.textMuted,
        }}
      >
        {label}
      </span>
    </button>
  );
}

const groupLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  fontFamily: theme.fonts.mono,
  fontSize: "0.62rem",
  letterSpacing: theme.letterSpacing.widest,
  color: theme.colors.textFaint,
  marginBottom: "10px",
};

/** Searchable, multi-select state picker with selected chips. */
function StateMultiSelect({
  selected,
  onChange,
}: {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [search, setSearch] = React.useState("");

  const toggleState = (s: string) => {
    const next = new Set(selected);
    next.has(s) ? next.delete(s) : next.add(s);
    onChange(next);
  };

  const visible = ALL_STATES.filter((s) =>
    s.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div>
      {/* Selected chips */}
      {selected.size > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
          {Array.from(selected).map((s) => (
            <span
              key={s}
              onClick={() => toggleState(s)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: theme.fonts.mono,
                fontSize: "0.64rem",
                letterSpacing: theme.letterSpacing.normal,
                padding: "3px 8px",
                background: theme.colors.primary,
                color: theme.colors.textInverse,
                cursor: "pointer",
              }}
            >
              {s} <X size={11} />
            </span>
          ))}
        </div>
      )}

      {/* Search box */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: `1px solid ${theme.colors.border}`,
          padding: "7px 9px",
          marginBottom: "8px",
        }}
      >
        <Search size={14} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search states…"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: theme.fonts.body,
            fontSize: "0.82rem",
            color: theme.colors.text,
            minWidth: 0,
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear state search"
            style={{ background: "none", border: "none", cursor: "pointer", color: theme.colors.textMuted, display: "flex" }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Options list */}
      <div
        style={{
          maxHeight: "160px",
          overflowY: "auto",
          border: `1px solid ${theme.colors.border}`,
          padding: "6px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {visible.length === 0 ? (
          <span style={{ fontFamily: theme.fonts.body, fontSize: "0.8rem", color: theme.colors.textFaint, padding: "4px 0" }}>
            No states match.
          </span>
        ) : (
          visible.map((s) => (
            <Checkbox key={s} label={s} checked={selected.has(s)} onClick={() => toggleState(s)} />
          ))
        )}
      </div>
    </div>
  );
}
