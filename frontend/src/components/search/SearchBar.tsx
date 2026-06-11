import { Search } from "lucide-react";
import { theme } from "../../styles/theme";

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
  return (
    <div style={{ width: "100%", maxWidth: "600px" }}>
      {/* Search header label */}
      <div style={{ background: theme.colors.primary, fontFamily: theme.fonts.mono, fontSize: theme.fontSizes.sm, letterSpacing: theme.letterSpacing.widest, color: theme.colors.textInverse, padding: "6px 20px", textAlign: "left" }}>
        SEARCH RESOURCES
      </div>

      {/* Search input with button */}
      <div style={{ display: "flex", border: `2px solid ${theme.colors.primary}`, background: theme.colors.surface, overflow: "hidden" }}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch?.(value)}
          disabled={disabled}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "18px 24px",
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.md,
          }}
        />
        <button
          onClick={() => onSearch?.(value)}
          disabled={disabled}
          style={{
            background: theme.colors.primary,
            border: "none",
            padding: "18px 28px",
            color: theme.colors.textInverse,
            fontFamily: theme.fonts.heading,
            fontSize: "1rem",
            letterSpacing: theme.letterSpacing.normal,
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "opacity 0.15s",
            opacity: disabled ? 0.5 : 1,
          }}
          onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => !disabled && (e.currentTarget.style.opacity = "1")}
        >
          <Search size={18} /> SEARCH
        </button>
      </div>
    </div>
  );
}
