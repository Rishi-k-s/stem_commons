import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Globe } from "lucide-react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { theme } from "../styles/theme";

// Mock data
const resourceData: Record<number, any> = {
  1: {
    id: 1,
    name: "FabLab IIT Delhi",
    type: "Makerspace",
    city: "New Delhi",
    state: "Delhi",
    status: "Working",
    description: "A comprehensive makerspace with state-of-the-art equipment and facilities for prototyping and design.",
    contact: "fablab@iitd.ac.in",
    phone: "+91-11-2659-1234",
    website: "https://fablab.iitd.ac.in",
    facilities: ["3D Printing", "Laser Cutting", "CNC Machines", "Electronics Lab"],
  },
  2: {
    id: 2,
    name: "ATAL Tinkering Lab — KV No. 1",
    type: "ATAL Lab",
    city: "Mumbai",
    state: "Maharashtra",
    status: "Working",
    description: "ATAL Tinkering Lab focusing on innovation and entrepreneurship for young innovators.",
    contact: "atl.kv1mum@gov.in",
    phone: "+91-22-1234-5678",
    website: "https://atl.gov.in",
    facilities: ["Robotics", "Electronics Lab", "3D Printing"],
  },
};

export function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resource = resourceData[parseInt(id || "0") || 1];

  if (!resource) {
    return (
      <div style={{ textAlign: "center", padding: "48px", marginTop: "100px" }}>
        <h1>Resource not found</h1>
        <Button onClick={() => navigate("/resources")}>Back to Resources</Button>
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
            <Badge variant={resource.status === "Working" ? "success" : "error"}>{resource.status}</Badge>
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
          borderTop: `3px solid ${theme.colors.primary}`,
        }}
      >
        <p
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: "0.6rem",
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
