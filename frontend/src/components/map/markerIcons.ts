import L from "leaflet";
import { statusColor, type Resource } from "../../data/resources";

/** Teardrop pin marker colored by the resource's operational status. */
export function markerIcon(resource: Resource, selected = false): L.DivIcon {
  const color = statusColor(resource.status);
  const size = selected ? 38 : 26;
  const dot = selected ? 12 : 8;
  return L.divIcon({
    className: selected ? "stem-marker stem-marker--selected" : "stem-marker",
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: ${color};
        border: ${selected ? 3 : 2}px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: ${selected ? "0 0 0 4px rgba(41,0,135,0.35), 0 4px 10px rgba(0,0,0,0.4)" : "0 2px 6px rgba(0,0,0,0.35)"};
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="
          width: ${dot}px; height: ${dot}px; background: #ffffff;
          border-radius: 50%; transform: rotate(45deg);
        "></div>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size - 2],
  });
}

/** Numbered cluster circle (matches the reference's green count bubbles). */
export function clusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 38 : count < 50 ? 46 : 54;
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: #290087;
        color: #ffffff;
        border: 3px solid rgba(255,255,255,0.85);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-family: 'IBM Plex Sans', sans-serif;
        font-weight: 700; font-size: ${count < 10 ? 14 : 15}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${count}</div>`,
    className: "stem-cluster",
    iconSize: L.point(size, size, true),
  });
}
