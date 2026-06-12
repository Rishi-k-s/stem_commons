import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query and re-render when it changes.
 * Used to drive responsive inline styles (this app uses CSS-in-JS).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True on smartphone-width screens (<= 640px). */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 640px)");
}
