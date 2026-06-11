import { theme } from "../../styles/theme";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  style,
}: ButtonProps) {
  const baseStyles = {
    fontFamily: theme.fonts.heading,
    letterSpacing: theme.letterSpacing.normal,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "opacity 0.15s, background 0.15s, color 0.15s",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
  } as const;

  const variantStyles = {
    primary: {
      background: theme.colors.primary,
      color: theme.colors.textInverse,
      padding: size === "sm" ? "6px 12px" : size === "lg" ? "13px 28px" : "9px 18px",
      fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.82rem" : "0.76rem",
    },
    secondary: {
      background: theme.colors.background,
      color: theme.colors.text,
      border: `1px solid ${theme.colors.borderStrong}`,
      padding: size === "sm" ? "6px 12px" : size === "lg" ? "13px 28px" : "9px 18px",
      fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.82rem" : "0.76rem",
    },
    outline: {
      background: "transparent",
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
      padding: size === "sm" ? "5px 11px" : size === "lg" ? "12px 26px" : "8px 16px",
      fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.82rem" : "0.76rem",
    },
    ghost: {
      background: "transparent",
      color: theme.colors.textMuted,
      border: `1px solid ${theme.colors.borderStrong}`,
      padding: size === "sm" ? "6px 12px" : size === "lg" ? "13px 28px" : "9px 18px",
      fontSize: size === "sm" ? "0.7rem" : size === "lg" ? "0.82rem" : "0.76rem",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === "primary") e.currentTarget.style.opacity = "0.82";
          if (variant === "ghost") {
            e.currentTarget.style.borderColor = theme.colors.primary;
            e.currentTarget.style.color = theme.colors.primary;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (variant === "primary") e.currentTarget.style.opacity = "1";
          if (variant === "ghost") {
            e.currentTarget.style.borderColor = theme.colors.borderStrong;
            e.currentTarget.style.color = theme.colors.textMuted;
          }
        }
      }}
    >
      {children}
    </button>
  );
}
