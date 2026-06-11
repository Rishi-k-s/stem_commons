/**
 * ─────────────────────────────────────────────────────────────
 *  CENTRALIZED THEME
 *  Edit colors, fonts, and spacing here — changes apply site-wide.
 * ─────────────────────────────────────────────────────────────
 */

export const theme = {
  colors: {
    /* Brand accents */
    primary: "#f3701e", // burnt orange — buttons, accents, top rules
    primaryHover: "#d95f12", // darker orange for hover states
    secondary: "#4b607f", // blue-gray — secondary labels/accents

    /* Surfaces */
    background: "#f5f2ee", // page background (warm off-white)
    surface: "#ffffff", // cards, inputs
    surfaceAlt: "#ede9e3", // stat panels, subtle alt sections
    footer: "#1a1a1a", // dark footer

    /* Text */
    text: "#1a1a1a", // primary text
    textMuted: "rgba(0,0,0,0.5)", // secondary text
    textFaint: "rgba(0,0,0,0.35)", // tertiary / footer text
    textInverse: "#ffffff", // text on dark/colored backgrounds

    /* Borders */
    border: "rgba(0,0,0,0.1)",
    borderStrong: "rgba(0,0,0,0.18)",

    /* Status (badges, resource states) */
    success: "#166534",
    warning: "#92400e",
    error: "#7f1d1d",
    info: "#1d6fa8",
  },

  fonts: {
    heading: "'IBM Plex Sans', sans-serif", // headlines, buttons
    body: "'IBM Plex Sans', sans-serif", // paragraphs, inputs
    mono: "'Space Mono', 'JetBrains Mono', monospace", // labels, tags, captions, specifications
  },

  fontSizes: {
    xs: "0.6rem",
    sm: "0.75rem",
    base: "0.95rem",
    md: "1.1rem",
    lg: "1.4rem",
    xl: "1.8rem",
    hero: "clamp(2.4rem, 5.5vw, 4rem)",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "48px",
  },

  letterSpacing: {
    tight: "0.03em",
    normal: "0.1em",
    wide: "0.15em",
    wider: "0.2em",
    widest: "0.3em",
  },

  radius: {
    none: "0",
    sm: "2px",
    md: "4px",
  },
} as const;

/** Shared decorative grid background overlay. */
export const gridBg: React.CSSProperties = {
  pointerEvents: "none",
  position: "fixed",
  inset: 0,
  zIndex: 0,
  backgroundImage:
    "linear-gradient(rgba(243,112,30,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(243,112,30,0.035) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

export type Theme = typeof theme;
