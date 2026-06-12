import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Phone, Mail, Globe, MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { theme } from "../../styles/theme";
import { statusVariant, statusColor, nearbyResources, type Resource } from "../../data/resources";
import { ResizeHandle } from "./ResizeHandle";

interface MapDetailPanelProps {
  resource: Resource | null;
  allResources: Resource[];
  width: number;
  mobile?: boolean;
  onResize: (deltaX: number) => void;
  onClose: () => void;
  onSelectNearby?: (resource: Resource) => void;
}

export function MapDetailPanel({ resource, allResources, width, mobile = false, onResize, onClose, onSelectNearby }: MapDetailPanelProps) {
  const navigate = useNavigate();
  const open = resource !== null;

  const containerStyle: React.CSSProperties = mobile
    ? {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: "auto",
        width: "100%",
        maxHeight: "75vh",
        background: theme.colors.surface,
        borderTop: `1px solid ${theme.colors.border}`,
        boxShadow: open ? "0 -8px 24px rgba(0,0,0,0.18)" : "none",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.25s ease",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }
    : {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: `${width}px`,
        maxWidth: "90vw",
        background: theme.colors.surface,
        borderLeft: `1px solid ${theme.colors.border}`,
        boxShadow: open ? "-8px 0 24px rgba(0,0,0,0.12)" : "none",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s ease",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      };

  return (
    <div style={containerStyle}>
      {resource && (
        <>
          {/* Mobile drag-handle affordance */}
          {mobile && (
            <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 2px", flexShrink: 0 }}>
              <span style={{ width: "40px", height: "4px", borderRadius: "2px", background: theme.colors.borderStrong }} />
            </div>
          )}

          {/* Left-edge resize handle (desktop only) */}
          {!mobile && (
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex" }}>
              <ResizeHandle onResize={(dx) => onResize(-dx)} side="left" />
            </div>
          )}

          {/* Panel header */}
          <div
            style={{
              background: theme.colors.primary,
              padding: "16px 20px",
              display: "flex",
              alignItems: "start",
              justifyContent: "space-between",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: "0.58rem",
                  letterSpacing: theme.letterSpacing.widest,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: "4px",
                }}
              >
                {resource.type.toUpperCase()}
              </div>
              <h2
                style={{
                  fontFamily: theme.fonts.heading,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: theme.colors.textInverse,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {resource.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                cursor: "pointer",
                color: theme.colors.textInverse,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                flexShrink: 0,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Badge variant={statusVariant(resource.status)}>{resource.status}</Badge>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: theme.fonts.body,
                  fontSize: "0.85rem",
                  color: theme.colors.textMuted,
                }}
              >
                <MapPin size={14} style={{ color: theme.colors.secondary }} />
                {resource.city}, {resource.state}
              </span>
            </div>

            <p
              style={{
                fontFamily: theme.fonts.body,
                fontSize: "0.9rem",
                lineHeight: 1.6,
                color: "rgba(0,0,0,0.65)",
                marginTop: 0,
              }}
            >
              {resource.description}
            </p>

            {/* Facilities */}
            <div style={sectionLabel}>FACILITIES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
              {resource.facilities.map((f) => (
                <Badge key={f} variant="neutral">
                  {f}
                </Badge>
              ))}
            </div>

            {/* Address */}
            <div style={sectionLabel}>ADDRESS</div>
            <div style={{ display: "flex", alignItems: "start", gap: "10px", marginBottom: "20px" }}>
              <MapPin size={15} style={{ color: theme.colors.secondary, flexShrink: 0, marginTop: "2px" }} />
              <span
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  color: "rgba(0,0,0,0.7)",
                }}
              >
                {resource.address}
              </span>
            </div>

            {/* Contact */}
            <div style={sectionLabel}>CONTACT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "8px" }}>
              <a href={`tel:${resource.phone}`} style={contactLink}>
                <Phone size={15} style={{ color: theme.colors.secondary }} /> {resource.phone}
              </a>
              <a href={`mailto:${resource.contact}`} style={contactLink}>
                <Mail size={15} style={{ color: theme.colors.secondary }} /> {resource.contact}
              </a>
              <a href={resource.website} target="_blank" rel="noopener noreferrer" style={contactLink}>
                <Globe size={15} style={{ color: theme.colors.secondary }} /> Visit Website
              </a>
            </div>

            {/* Similar nearby facilities */}
            <NearbyCarousel
              resource={resource}
              all={allResources}
              onSelect={(r) => {
                if (onSelectNearby) onSelectNearby(r);
                else navigate(`/resource/${r.id}`);
              }}
            />
          </div>

          {/* Footer action */}
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${theme.colors.border}`, flexShrink: 0 }}>
            <Button
              variant="primary"
              onClick={() => navigate(`/resource/${resource.id}`)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              VIEW FULL PAGE <ArrowRight size={14} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: "0.6rem",
  letterSpacing: theme.letterSpacing.widest,
  color: theme.colors.textFaint,
  marginBottom: "8px",
};

const contactLink: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontFamily: theme.fonts.body,
  fontSize: "0.88rem",
  color: theme.colors.text,
  textDecoration: "none",
};

/** Horizontal card carousel of the nearest similar resources. */
function NearbyCarousel({
  resource,
  all,
  onSelect,
}: {
  resource: Resource;
  all: Resource[];
  onSelect: (r: Resource) => void;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const nearby = React.useMemo(() => nearbyResources(resource, all, 6), [resource, all]);

  if (nearby.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ ...sectionLabel, marginBottom: 0 }}>SIMILAR NEARBY</div>
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={() => scrollBy(-1)} aria-label="Scroll left" style={arrowBtn}>
            <ChevronLeft size={15} />
          </button>
          <button onClick={() => scrollBy(1)} aria-label="Scroll right" style={arrowBtn}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "6px",
          scrollbarWidth: "thin",
        }}
      >
        {nearby.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            style={{
              flexShrink: 0,
              width: "160px",
              textAlign: "left",
              cursor: "pointer",
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              transition: "border-color 0.12s, box-shadow 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary;
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: "0.54rem",
                letterSpacing: theme.letterSpacing.wide,
                color: theme.colors.secondary,
              }}
            >
              {r.type.toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: theme.fonts.heading,
                fontSize: "0.82rem",
                fontWeight: 700,
                color: theme.colors.text,
                lineHeight: 1.2,
              }}
            >
              {r.name}
            </div>
            <div style={{ fontFamily: theme.fonts.body, fontSize: "0.72rem", color: theme.colors.textMuted }}>
              {r.city}, {r.state}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor(r.status), display: "inline-block" }} />
                <span style={{ fontFamily: theme.fonts.body, fontSize: "0.68rem", color: theme.colors.textMuted }}>
                  {r.status}
                </span>
              </span>
              <span style={{ fontFamily: theme.fonts.mono, fontSize: "0.62rem", color: theme.colors.primary }}>
                {r.distanceKm < 1 ? "<1" : Math.round(r.distanceKm)} km
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const arrowBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.surface,
  color: theme.colors.textMuted,
  cursor: "pointer",
};
