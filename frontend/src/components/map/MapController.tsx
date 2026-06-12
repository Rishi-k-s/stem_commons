import React from "react";
import { useMap } from "react-leaflet";
import type { Resource } from "../../data/resources";

interface MapControllerProps {
  selected: Resource | null;
}

/**
 * Side-effect component (no UI). When a resource is selected, smoothly
 * pans + zooms the map to center on it so the user can see what they clicked.
 */
export function MapController({ selected }: MapControllerProps) {
  const map = useMap();

  React.useEffect(() => {
    if (!selected) return;
    const targetZoom = Math.max(map.getZoom(), 11);
    map.flyTo([selected.lat, selected.lng], targetZoom, {
      duration: 0.8,
    });
  }, [selected, map]);

  return null;
}
