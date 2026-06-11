import { Link } from "react-router-dom";
import { Button } from "./Button";
import { theme } from "../../styles/theme";

const navBtnStyle = {
  fontFamily: theme.fonts.heading,
  fontSize: "0.78rem",
  color: "rgba(0,0,0,0.45)",
  background: "none",
  border: "none",
  cursor: "pointer",
  letterSpacing: theme.letterSpacing.wide,
  padding: 0,
  transition: "color 0.15s",
};

export function Header() {
  return (
    <header
      style={{
        flexShrink: 0,
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        background: theme.colors.background,
        position: "relative" as const,
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div>
            <div
              style={{
                fontFamily: theme.fonts.heading,
                fontSize: theme.fontSizes.lg,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: theme.colors.text,
                lineHeight: 1,
              }}
            >
              STEM COMMONS
            </div>
            <div style={{ fontFamily: theme.fonts.mono, fontSize: "0.55rem", letterSpacing: theme.letterSpacing.widest, color: theme.colors.primary, marginTop: "1px" }}>
              DISCOVERY PLATFORM
            </div>
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {["About", "Contact"].map((item) => (
            <button
              key={item}
              style={navBtnStyle as React.CSSProperties}
              onMouseEnter={(e) => (e.currentTarget.style.color = theme.colors.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}
            >
              {item.toUpperCase()}
            </button>
          ))}
          <Link to="/resources" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="md">
              SUBMIT
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
