import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin } from "lucide-react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { SearchBar } from "../components/search/SearchBar";
import { theme, gridBg } from "../styles/theme";

export function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  const stats = [
    { value: "250+", label: "MAKERSPACES" },
    { value: "1,200+", label: "ATAL LABS" },
    { value: "85+", label: "VENDORS" },
    { value: "28", label: "STATES" },
  ];

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        position: "relative",
      }}
    >
      <div style={gridBg} />

      {/* Top rule */}
      <div
        style={{ height: "3px", background: theme.colors.primary, flexShrink: 0, position: "relative", zIndex: 10 }}
      />

      <Header />

      {/* Hero — takes remaining space */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          position: "relative",
          zIndex: 10,
          gap: "0",
        }}
      >
        {/* Badge */}
        <div
          style={{
            border: `1px solid ${theme.colors.primary}`,
            padding: "3px 14px",
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSizes.xs,
            letterSpacing: theme.letterSpacing.widest,
            color: theme.colors.primary,
            marginBottom: "28px",
          }}
        >
          CONNECT · DISCOVER · INNOVATE
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes.hero,
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: theme.letterSpacing.tight,
            color: theme.colors.text,
            margin: 0,
          }}
        >
          FIND YOUR
        </h1>
        <h1
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes.hero,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: theme.letterSpacing.tight,
            color: theme.colors.primary,
            margin: "0 0 12px",
          }}
        >
          NEXT STEM SPACE
        </h1>
        <p
          style={{
            color: "rgba(0,0,0,0.48)",
            fontSize: theme.fontSizes.base,
            lineHeight: 1.6,
            maxWidth: "420px",
            textAlign: "center",
            margin: "0 0 36px",
          }}
        >
          Connect with Makerspaces, ATAL Tinkering Labs, and STEM vendors across India.
        </p>

        {/* Search box */}
        <div style={{ marginBottom: "16px", width: "100%", maxWidth: "1200px", display: "flex", justifyContent: "center" }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => navigate("/resources")}
          />
        </div>

        {/* Browse & Map buttons */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "48px" }}>
          <Button
            onClick={() => navigate("/resources")}
            variant="ghost"
            size="md"
          >
            RESOURCE DIRECTORY <ChevronRight size={13} />
          </Button>
          <Button
            onClick={() => navigate("/resources")}
            variant="ghost"
            size="md"
          >
            MAP VIEW <MapPin size={13} />
          </Button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "0",
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.surfaceAlt,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "16px 24px",
                borderRight: i < stats.length - 1 ? `1px solid ${theme.colors.border}` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: theme.fonts.heading,
                  fontSize: theme.fontSizes.xl,
                  fontWeight: 700,
                  color: theme.colors.primary,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: "0.56rem",
                  letterSpacing: theme.letterSpacing.widest,
                  color: "rgba(0,0,0,0.4)",
                  marginTop: "4px",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
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
          borderTop: `3px solid ${theme.colors.primary}`,
          position: "relative",
          zIndex: 10,
        }}
      >
        <p style={{ fontFamily: theme.fonts.mono, fontSize: theme.fontSizes.xs, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          © 2026 STEM COMMONS. ALL RIGHTS RESERVED.
        </p>
        <div style={{ display: "flex", gap: "28px" }}>
          {["About", "Contact", "Privacy"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                fontFamily: theme.fonts.heading,
                fontSize: theme.fontSizes.xs,
                letterSpacing: theme.letterSpacing.normal,
                color: theme.colors.primary,
                textDecoration: "none",
              }}
            >
              {item.toUpperCase()}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
