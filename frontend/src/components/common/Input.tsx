import { theme } from "../../styles/theme";

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  error?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
  disabled = false,
  error,
  multiline = false,
  rows = 3,
  className = "",
}: InputProps) {
  const baseStyles = {
    background: theme.colors.surface,
    border: error ? `2px solid ${theme.colors.error}` : `1px solid ${theme.colors.border}`,
    outline: "none",
    padding: "12px 16px",
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.base,
    transition: "border-color 0.15s",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  const hoverStyles = {
    borderColor: theme.colors.borderStrong,
  };

  const focusStyles = {
    borderColor: theme.colors.primary,
  };

  const Component = multiline ? "textarea" : "input";

  return (
    <div style={{ width: "100%" }}>
      <Component
        type={!multiline ? type : undefined}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        style={baseStyles as React.CSSProperties}
        className={className}
        onMouseEnter={(e) => !disabled && Object.assign(e.currentTarget.style, hoverStyles)}
        onMouseLeave={(e) => !disabled && Object.assign(e.currentTarget.style, { borderColor: theme.colors.border })}
        onFocus={(e) => !disabled && Object.assign(e.currentTarget.style, focusStyles)}
        onBlur={(e) =>
          !disabled && Object.assign(e.currentTarget.style, { borderColor: error ? theme.colors.error : theme.colors.border })
        }
      />
      {error && (
        <p
          style={{
            color: theme.colors.error,
            fontSize: theme.fontSizes.sm,
            marginTop: "4px",
            fontFamily: theme.fonts.body,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
        >
          {error}
        </p>
      )}
    </div>
  );
}
