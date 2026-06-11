import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { theme } from "../styles/theme";

// Mock data
const resources = [
  { id: 1, name: "FabLab IIT Delhi", type: "Makerspace", city: "New Delhi", state: "Delhi", status: "Working" },
  { id: 2, name: "ATAL Tinkering Lab — KV No. 1", type: "ATAL Lab", city: "Mumbai", state: "Maharashtra", status: "Working" },
  { id: 3, name: "Tinkerers' Paradise", type: "Makerspace", city: "Bangalore", state: "Karnataka", status: "Working" },
  { id: 4, name: "STEM Ventures India", type: "Vendor", city: "Pune", state: "Maharashtra", status: "Working" },
  { id: 5, name: "ATAL Innovation Centre Chennai", type: "ATAL Lab", city: "Chennai", state: "Tamil Nadu", status: "Working" },
];

export function ResourcesPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: theme.colors.background,
      }}
    >
      {/* Top rule */}
      <div style={{ height: "3px", background: theme.colors.primary, flexShrink: 0 }} />

      <Header />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "48px 32px",
        }}
      >
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: theme.colors.primary,
              fontFamily: theme.fonts.heading,
              fontSize: "0.78rem",
              letterSpacing: theme.letterSpacing.normal,
            }}
          >
            <ArrowLeft size={16} /> BACK
          </button>
          <h1
            style={{
              fontFamily: theme.fonts.heading,
              fontSize: "2rem",
              fontWeight: 700,
              margin: 0,
              color: theme.colors.text,
            }}
          >
            DISCOVER RESOURCES
          </h1>
        </div>

        {/* Resources Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {resources.map((resource) => (
            <div
              key={resource.id}
              onClick={() => navigate(`/resource/${resource.id}`)}
              style={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                padding: "24px",
                cursor: "pointer",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "12px",
                }}
              >
                <h3
                  style={{
                    fontFamily: theme.fonts.heading,
                    fontSize: theme.fontSizes.md,
                    fontWeight: 700,
                    margin: 0,
                    color: theme.colors.text,
                  }}
                >
                  {resource.name}
                </h3>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    background: resource.status === "Working" ? "rgba(22,101,52,0.1)" : "rgba(127,29,29,0.1)",
                    color: resource.status === "Working" ? theme.colors.success : theme.colors.error,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  {resource.status}
                </span>
              </div>

              <p
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: "0.85rem",
                  color: "rgba(0,0,0,0.6)",
                  margin: 0,
                }}
              >
                {resource.type}
              </p>

              <p
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: "0.9rem",
                  color: theme.colors.textMuted,
                  marginTop: "12px",
                  margin: "12px 0",
                }}
              >
                {resource.city}, {resource.state}
              </p>

              <Button
                onClick={() => navigate(`/resource/${resource.id}`)}
                variant="primary"
                size="sm"
                style={{ width: "100%", justifyContent: "center" }}
              >
                VIEW DETAILS
              </Button>
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
        }}
      >
        <p
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSizes.xs,
            color: "rgba(255,255,255,0.4)",
            margin: 0,
          }}
        >
          © 2026 STEM COMMONS. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}
