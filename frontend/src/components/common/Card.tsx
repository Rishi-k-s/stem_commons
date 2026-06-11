import { theme } from "../../styles/theme";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", hoverable = false, style }: CardProps) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        padding: "24px",
        transition: hoverable ? "box-shadow 0.15s" : undefined,
        ...style,
      }}
      className={className}
      onMouseEnter={(e) => {
        if (hoverable) e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        if (hoverable) e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </div>
  );
}
