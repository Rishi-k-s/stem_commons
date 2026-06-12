import { Search } from "lucide-react";
import { theme } from "../../styles/theme";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { useSearchAutocomplete } from "../../hooks/useSearchAutocomplete";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchBar({
  value = "",
  onChange,
  onSearch,
  placeholder = "Search by name, city, or location...",
  disabled = false,
}: SearchBarProps) {
  const isMobile = useIsMobile();
  const { inputProps, dropdown } = useSearchAutocomplete({
    value,
    onChange: (v) => onChange?.(v),
    onPick: (s) => onSearch?.(s.value),
  });

  return (
    <div style={{ width: "100%", maxWidth: "600px", position: "relative" }}>
      {/* Search header label */}
      <div style={{ background: theme.colors.primary, fontFamily: theme.fonts.mono, fontSize: theme.fontSizes.sm, letterSpacing: theme.letterSpacing.widest, color: theme.colors.textInverse, padding: "6px 20px", textAlign: "left" }}>
        SEARCH RESOURCES
      </div>

      {/* Search input with button */}
      <div style={{ display: "flex", border: `2px solid ${theme.colors.primary}`, background: theme.colors.surface, overflow: "hidden" }}>
        <input
          type="text"
          placeholder={isMobile ? "Search resources..." : placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          {...inputProps}
          onKeyDown={(e) => {
            inputProps.onKeyDown(e);
            if (!e.defaultPrevented && e.key === "Enter") onSearch?.(value);
          }}
          disabled={disabled}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            padding: isMobile ? "14px 16px" : "18px 24px",
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
            fontSize: isMobile ? theme.fontSizes.base : theme.fontSizes.md,
          }}
        />
        <button
          onClick={() => onSearch?.(value)}
          disabled={disabled}
          aria-label="Search"
          style={{
            background: theme.colors.primary,
            border: "none",
            padding: isMobile ? "0 18px" : "18px 28px",
            color: theme.colors.textInverse,
            fontFamily: theme.fonts.heading,
            fontSize: "1rem",
            letterSpacing: theme.letterSpacing.normal,
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            gap: "8px",
            transition: "opacity 0.15s",
            opacity: disabled ? 0.5 : 1,
          }}
          onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => !disabled && (e.currentTarget.style.opacity = "1")}
        >
          <Search size={18} /> {!isMobile && "SEARCH"}
        </button>
      </div>

      {dropdown}
    </div>
  );
}
