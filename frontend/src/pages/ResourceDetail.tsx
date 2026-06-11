import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Globe } from "lucide-react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { theme } from "../styles/theme";
import { getResource, statusVariant } from "../data/resources";

export function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resource = getResource(Number(id));

  if (!resource) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: theme.colors.background,
        }}
      >
        <div style={{ height: "3px", background: theme.colors.primary, flexShrink: 0 }} />
        <Header />
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "48px",
          }}
        >
          <h1
            style={{
              fontFamily: theme.fonts.heading,
              fontSize: "1.6rem",
              fontWeight: 700,
              color: theme.colors.text,
              margin: 0,
            }}
          >
            RESOURCE NOT FOUND
          </h1>
          <p style={{ fontFamily: theme.fonts.body, color: theme.colors.textMuted, margin: 0 }}>
            We couldn't find a resource with that id.
          </p>
          <Button onClick={() => navigate("/resources")} variant="primary">
            BACK TO RESOURCES
          </Button>
        </main>
      </div>
    );
  }

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
          maxWidth: "1080px",
          width: "100%",
          margin: "0 auto",
          padding: "48px 32px",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/resources")}
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
            letterSpacing: "0.1em",
            marginBottom: "24px",
          }}
        >
          <ArrowLeft size={16} /> BACK
        </button>

        {/* Resource header */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "start", gap: "16px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontFamily: theme.fonts.heading,
                  fontSize: "2.4rem",
                  fontWeight: 700,
                  margin: 0,
                  color: theme.colors.text,
                }}
              >
                {resource.name}
              </h1>
              <p
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: "0.85rem",
                  color: theme.colors.primary,
                  letterSpacing: "0.2em",
                  marginTop: "4px",
                }}
              >
                {resource.type} • {resource.city}, {resource.state}
              </p>
            </div>
            <Badge variant={statusVariant(resource.status)}>{resource.status}</Badge>
          </div>
        </div>

        {/* Content grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "32px",
            marginBottom: "48px",
          }}
        >
          {/* Main content */}
          <div>
            {/* Description */}
            <Card>
              <h2
                style={{
                  fontFamily: theme.fonts.heading,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  marginTop: 0,
                  color: theme.colors.text,
                }}
              >
                ABOUT
              </h2>
              <p
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  color: "rgba(0,0,0,0.6)",
                }}
              >
                {resource.description}
              </p>
            </Card>

            {/* Facilities */}
            <Card style={{ marginTop: "24px" }}>
              <h2
                style={{
                  fontFamily: theme.fonts.heading,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  marginTop: 0,
                  color: theme.colors.text,
                }}
              >
                FACILITIES
              </h2>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                {resource.facilities.map((f: string) => (
                  <Badge key={f} variant="neutral">
                    {f}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Contact */}
            <Card>
              <h3
                style={{
                  fontFamily: theme.fonts.heading,
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginTop: 0,
                  color: theme.colors.text,
                }}
              >
                CONTACT
              </h3>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
                <Phone size={16} style={{ color: theme.colors.primary }} />
                <a
                  href={`tel:${resource.phone}`}
                  style={{
                    fontFamily: theme.fonts.body,
                    fontSize: "0.9rem",
                    color: theme.colors.primary,
                    textDecoration: "none",
                  }}
                >
                  {resource.phone}
                </a>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
                <Mail size={16} style={{ color: theme.colors.primary }} />
                <a
                  href={`mailto:${resource.contact}`}
                  style={{
                    fontFamily: theme.fonts.body,
                    fontSize: "0.9rem",
                    color: theme.colors.primary,
                    textDecoration: "none",
                  }}
                >
                  {resource.contact}
                </a>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
                <Globe size={16} style={{ color: theme.colors.primary }} />
                <a
                  href={resource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: theme.fonts.body,
                    fontSize: "0.9rem",
                    color: theme.colors.primary,
                    textDecoration: "none",
                  }}
                >
                  Visit Website
                </a>
              </div>
            </Card>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
              <Button
                variant="primary"
                onClick={() => alert("Claim functionality coming soon!")}
                style={{ width: "100%", justifyContent: "center" }}
              >
                CLAIM THIS LAB
              </Button>
              <Button
                variant="outline"
                onClick={() => alert("Report functionality coming soon!")}
                style={{ width: "100%", justifyContent: "center" }}
              >
                REPORT ISSUE
              </Button>
            </div>
          </div>
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
          borderTop: `3px solid ${theme.colors.secondary}`,
        }}
      >
        <p
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: "0.6rem",
            color: "rgba(255,255,255,0.6)",
            margin: 0,
          }}
        >
          © 2026 STEM COMMONS. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}
