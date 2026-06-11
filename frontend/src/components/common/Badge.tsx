import { theme } from "../../styles/theme";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  className?: string;
}

const variantStyles = {
  success: { background: "rgba(22,101,52,0.1)", color: theme.colors.success, border: "1px solid rgba(22,101,52,0.2)" },
  warning: { background: "rgba(146,64,14,0.1)", color: theme.colors.warning, border: "1px solid rgba(146,64,14,0.2)" },
  error: { background: "rgba(127,29,29,0.1)", color: theme.colors.error, border: "1px solid rgba(127,29,29,0.2)" },
  info: { background: "rgba(29,111,168,0.1)", color: theme.colors.info, border: "1px solid rgba(29,111,168,0.2)" },
  neutral: { background: "rgba(0,0,0,0.08)", color: theme.colors.text, border: "1px solid rgba(0,0,0,0.12)" },
};

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const style = variantStyles[variant];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: theme.radius.sm,
        fontSize: theme.fontSizes.sm,
        fontWeight: 600,
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
}
