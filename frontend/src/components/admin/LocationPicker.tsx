/**
 * ─────────────────────────────────────────────────────────────
 *  LocationPicker
 *  An interactive map for choosing a resource's coordinates:
 *   • search an address/place (OpenStreetMap Nominatim geocoding)
 *   • click anywhere on the map to drop the pin
 *   • drag the pin to fine-tune
 *  Reports the chosen { lat, lng } back to the parent.
 * ─────────────────────────────────────────────────────────────
 */
import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { theme } from "../../styles/theme";

// Centre of India — sensible default when no point is set yet.
const DEFAULT_CENTER: [number, number] = [22.5, 79];
const DEFAULT_ZOOM = 5;
const PICKED_ZOOM = 14;

/** Orange teardrop pin matching the app's marker style. */
const pinIcon = L.divIcon({
  className: "stem-picker-pin",
  html: `
    <div style="
      width: 30px; height: 30px;
      background: ${theme.colors.primary};
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
    "></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
  address?: NominatimAddress;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state_district?: string;
  county?: string;
  state?: string;
}

export interface ResolvedAddress {
  city?: string;
  state?: string;
}

/** Extracts a best-guess city + state from a Nominatim address object. */
function parseAddress(a?: NominatimAddress): ResolvedAddress {
  if (!a) return {};
  return {
    city: a.city || a.town || a.village || a.municipality || a.county || a.state_district,
    state: a.state,
  };
}

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  /** Fired when a city/state could be resolved for the chosen point. */
  onResolveAddress?: (addr: ResolvedAddress) => void;
}

/** Registers map click handler to drop/move the pin. */
function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

/** Imperatively recenters the map when the chosen point changes externally. */
function Recenter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
}

export function LocationPicker({ lat, lng, onChange, onResolveAddress }: LocationPickerProps) {
  // A point is "set" when it isn't the (0,0) sentinel from an empty form.
  const hasPoint = !(lat === 0 && lng === 0);

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<NominatimResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  // Used to drive Recenter only on deliberate jumps (search / first pick).
  const [recenter, setRecenter] = React.useState<{ lat: number; lng: number; zoom: number } | null>(
    hasPoint ? { lat, lng, zoom: PICKED_ZOOM } : null
  );

  const debounceRef = React.useRef<number | null>(null);

  const runSearch = React.useCallback((q: string) => {
    if (q.trim().length < 3) {
      setResults([]);
      return;
    }
    setSearching(true);
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(q)}`;
    fetch(url, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: NominatimResult[]) => {
        setResults(data);
        setOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, []);

  /** Reverse-geocode a clicked/dragged point to fill in city + state. */
  const reverseGeocode = React.useCallback(
    (la: number, ln: number) => {
      if (!onResolveAddress) return;
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${la}&lon=${ln}`;
      fetch(url, { headers: { Accept: "application/json" } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: NominatimResult | null) => {
          const addr = parseAddress(data?.address);
          if (addr.city || addr.state) onResolveAddress(addr);
        })
        .catch(() => {});
    },
    [onResolveAddress]
  );

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => runSearch(q), 400);
  };

  const pick = (la: number, ln: number, zoom = PICKED_ZOOM) => {
    onChange(la, ln);
    setRecenter({ lat: la, lng: ln, zoom });
  };

  const chooseResult = (r: NominatimResult) => {
    const la = parseFloat(r.lat);
    const ln = parseFloat(r.lon);
    setQuery(r.display_name);
    setResults([]);
    setOpen(false);
    pick(la, ln);
    const addr = parseAddress(r.address);
    if ((addr.city || addr.state) && onResolveAddress) onResolveAddress(addr);
  };

  return (
    <div>
      {/* Search box */}
      <div style={{ position: "relative", marginBottom: "8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: `1px solid ${theme.colors.borderStrong}`,
            background: theme.colors.surface,
            padding: "8px 11px",
          }}
        >
          {searching ? (
            <Loader2 size={15} style={{ color: theme.colors.textMuted, flexShrink: 0, animation: "spin 1s linear infinite" }} />
          ) : (
            <Search size={15} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
          )}
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            placeholder="Search a place or address…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: theme.fonts.body,
              fontSize: "0.88rem",
              color: theme.colors.text,
              minWidth: 0,
            }}
          />
        </div>

        {open && results.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "calc(100% + 2px)",
              left: 0,
              right: 0,
              margin: 0,
              padding: "4px 0",
              listStyle: "none",
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.borderStrong}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
              zIndex: 1000,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {results.map((r) => (
              <li
                key={r.place_id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  chooseResult(r);
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  padding: "8px 11px",
                  cursor: "pointer",
                  fontFamily: theme.fonts.body,
                  fontSize: "0.82rem",
                  color: "rgba(0,0,0,0.7)",
                  lineHeight: 1.35,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = theme.colors.surfaceAlt)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <MapPin size={14} style={{ color: theme.colors.primary, flexShrink: 0, marginTop: "2px" }} />
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div style={{ height: "260px", border: `1px solid ${theme.colors.borderStrong}` }}>
        <MapContainer
          center={hasPoint ? [lat, lng] : DEFAULT_CENTER}
          zoom={hasPoint ? PICKED_ZOOM : DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ClickHandler onPick={(la, ln) => { pick(la, ln, undefined); reverseGeocode(la, ln); }} />
          {recenter && <Recenter lat={recenter.lat} lng={recenter.lng} zoom={recenter.zoom} />}
          {hasPoint && (
            <Marker
              position={[lat, lng]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target as L.Marker;
                  const { lat: la, lng: ln } = m.getLatLng();
                  onChange(la, ln);
                  reverseGeocode(la, ln);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Coordinate readout + manual fine-tune */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: "0.7rem",
            color: hasPoint ? theme.colors.text : theme.colors.textMuted,
            letterSpacing: theme.letterSpacing.wide,
          }}
        >
          {hasPoint
            ? `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`
            : "Search or click the map to set a location"}
        </span>
      </div>
    </div>
  );
}
