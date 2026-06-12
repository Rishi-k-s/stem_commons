/**
 * ─────────────────────────────────────────────────────────────
 *  useSearchAutocomplete
 *  A headless autocomplete hook shared by every search box.
 *  Manages the suggestion pool, open/highlight state and keyboard
 *  navigation, and returns a ready-to-render dropdown node.
 * ─────────────────────────────────────────────────────────────
 */
import React from "react";
import { Building2, MapPin, Layers, Wrench, Search } from "lucide-react";
import { theme } from "../styles/theme";
import {
  getSuggestionPool,
  querySuggestions,
  type Suggestion,
  type SuggestionKind,
} from "../lib/suggestions";

interface Options {
  value: string;
  onChange: (value: string) => void;
  /** Called when a suggestion is picked (after value is set). */
  onPick?: (suggestion: Suggestion) => void;
  /** Max suggestions shown. */
  limit?: number;
}

interface Result {
  /** Spread onto the <input>. */
  inputProps: {
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    autoComplete: "off";
    role: "combobox";
    "aria-expanded": boolean;
    "aria-autocomplete": "list";
  };
  /** The dropdown element — render it inside a position:relative wrapper. */
  dropdown: React.ReactNode;
  /** Whether suggestions are currently visible. */
  isOpen: boolean;
}

const KIND_ICON: Record<SuggestionKind, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  name: Building2,
  city: MapPin,
  state: MapPin,
  type: Layers,
  facility: Wrench,
};

const KIND_LABEL: Record<SuggestionKind, string> = {
  name: "Resource",
  city: "City",
  state: "State",
  type: "Type",
  facility: "Facility",
};

/** Splits a label so the part matching the query can be emphasised. */
function highlight(value: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return value;
  const idx = value.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return value;
  return (
    <>
      {value.slice(0, idx)}
      <strong style={{ color: theme.colors.text, fontWeight: 700 }}>
        {value.slice(idx, idx + q.length)}
      </strong>
      {value.slice(idx + q.length)}
    </>
  );
}

export function useSearchAutocomplete({
  value,
  onChange,
  onPick,
  limit = 8,
}: Options): Result {
  const [pool, setPool] = React.useState<Suggestion[]>([]);
  const [focused, setFocused] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(-1);
  const blurTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    let active = true;
    getSuggestionPool().then((p) => active && setPool(p));
    return () => {
      active = false;
    };
  }, []);

  const suggestions = React.useMemo(
    () => querySuggestions(pool, value, limit),
    [pool, value, limit]
  );

  // Reset the highlight whenever the suggestion set changes.
  React.useEffect(() => setHighlighted(-1), [value]);

  const isOpen = focused && suggestions.length > 0;

  const pick = React.useCallback(
    (s: Suggestion) => {
      onChange(s.value);
      onPick?.(s);
      setFocused(false);
      setHighlighted(-1);
    },
    [onChange, onPick]
  );

  const inputProps: Result["inputProps"] = {
    autoComplete: "off",
    role: "combobox",
    "aria-expanded": isOpen,
    "aria-autocomplete": "list",
    onFocus: () => {
      if (blurTimer.current) window.clearTimeout(blurTimer.current);
      setFocused(true);
    },
    onBlur: () => {
      // Delay so a click on a suggestion registers before closing.
      blurTimer.current = window.setTimeout(() => setFocused(false), 120);
    },
    onKeyDown: (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((h) => (h + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
      } else if (e.key === "Enter") {
        if (highlighted >= 0 && highlighted < suggestions.length) {
          e.preventDefault();
          pick(suggestions[highlighted]);
        }
      } else if (e.key === "Escape") {
        setFocused(false);
        setHighlighted(-1);
      }
    },
  };

  const dropdown = isOpen ? (
    <ul
      role="listbox"
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        right: 0,
        margin: 0,
        padding: "4px 0",
        listStyle: "none",
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.borderStrong}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
        zIndex: 1300,
        maxHeight: "320px",
        overflowY: "auto",
      }}
    >
      {suggestions.map((s, i) => {
        const Icon = KIND_ICON[s.kind] ?? Search;
        const active = i === highlighted;
        return (
          <li
            key={`${s.kind}:${s.value}`}
            role="option"
            aria-selected={active}
            // onMouseDown (not onClick) fires before the input blur.
            onMouseDown={(e) => {
              e.preventDefault();
              pick(s);
            }}
            onMouseEnter={() => setHighlighted(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 14px",
              cursor: "pointer",
              background: active ? theme.colors.surfaceAlt : "transparent",
            }}
          >
            <Icon size={15} style={{ color: theme.colors.primary, flexShrink: 0 }} />
            <span
              style={{
                flex: 1,
                fontFamily: theme.fonts.body,
                fontSize: "0.9rem",
                color: "rgba(0,0,0,0.7)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {highlight(s.value, value)}
            </span>
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: "0.6rem",
                letterSpacing: theme.letterSpacing.wide,
                color: theme.colors.textMuted,
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              {KIND_LABEL[s.kind]}
            </span>
          </li>
        );
      })}
    </ul>
  ) : null;

  return { inputProps, dropdown, isOpen };
}
