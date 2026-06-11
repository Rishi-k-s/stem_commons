# STEM Commons — Frontend Quick Reference

> **Stack:** React 18 + Vite + TypeScript + React Router
> Single-source design tokens via `src/styles/theme.ts`. No Next.js, no Context API.

---

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

Only two scripts are defined:

```bash
npm run dev     # Vite dev server (HMR)
npm run build   # Production build → dist/
```

---

## 📂 File Organization

```
frontend/src/
├── main.tsx                  # Entry point — mounts <App />
├── app/
│   ├── App.tsx               # Router setup (BrowserRouter + Routes)
│   └── components/
│       ├── ui/               # Imported shadcn/Radix UI primitives (unused base set)
│       └── figma/            # ImageWithFallback helper
├── components/               # ✅ Our custom component library
│   ├── common/
│   │   ├── Button.tsx        # 4 variants × 3 sizes
│   │   ├── Card.tsx          # Surface container
│   │   ├── Badge.tsx         # 5 status variants
│   │   ├── Input.tsx         # Text/textarea + error states
│   │   └── Header.tsx        # Site nav header
│   └── search/
│       └── SearchBar.tsx     # Hero search input + button
├── pages/                    # ✅ Route pages
│   ├── LandingPage.tsx       # "/"  — hero, search, stats
│   ├── ResourcesPage.tsx     # "/resources" — resource grid
│   └── ResourceDetail.tsx    # "/resource/:id" — detail view
└── styles/
    ├── theme.ts              # ✅ Centralized design tokens (edit here!)
    ├── fonts.css             # Google Fonts import
    ├── index.css             # Imports fonts + tailwind + theme.css
    ├── tailwind.css
    ├── theme.css             # CSS variables (Tailwind/shadcn base)
    └── globals.css
```

---

## 🗺️ Routing

Defined in `src/app/App.tsx` using `react-router-dom`:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `LandingPage` | Hero with search + stats |
| `/resources` | `ResourcesPage` | Grid of resources (mock data) |
| `/resource/:id` | `ResourceDetail` | Single resource view (mock data) |
| `*` | → redirect to `/` | Fallback |

### Navigating in code

```tsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/resources");
navigate(`/resource/${id}`);
```

---

## 🎨 Design System — Centralized Theme

**Everything lives in `src/styles/theme.ts`.** Edit a value there and it applies site-wide. Import it anywhere:

```tsx
import { theme } from "../styles/theme";

<div style={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }} />
```

### Colors

```ts
primary:      "#f3701e"   // burnt orange — buttons, accents, top rules
primaryHover: "#d95f12"   // darker orange for hover
secondary:    "#4b607f"   // blue-gray — secondary labels

background:    "#f5f2ee"  // warm off-white page background
surface:       "#ffffff"  // cards, inputs
surfaceAlt:    "#ede9e3"  // stat panels
footer:        "#1a1a1a"  // dark footer

text:        "#1a1a1a"            // primary text
textMuted:   "rgba(0,0,0,0.5)"   // secondary
textFaint:   "rgba(0,0,0,0.35)"  // tertiary
textInverse: "#ffffff"           // text on dark/colored bg

border:       "rgba(0,0,0,0.1)"
borderStrong: "rgba(0,0,0,0.18)"

/* Status */
success: "#166534"   warning: "#92400e"
error:   "#7f1d1d"   info:    "#1d6fa8"
```

### Fonts

```ts
heading: "'IBM Plex Sans', sans-serif"               // headings, buttons
body:    "'IBM Plex Sans', sans-serif"               // paragraphs, inputs
mono:    "'Space Mono', 'JetBrains Mono', monospace" // labels, tags, specs
```

Loaded via `src/styles/fonts.css` (Google Fonts).

### Font Sizes

```ts
xs: 0.6rem  | sm: 0.75rem | base: 0.95rem | md: 1.1rem
lg: 1.4rem  | xl: 1.8rem  | hero: clamp(2.4rem, 5.5vw, 4rem)
```

### Spacing

```ts
xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 48px
```

### Letter Spacing

```ts
tight: 0.03em | normal: 0.1em | wide: 0.15em | wider: 0.2em | widest: 0.3em
```

### Radius

```ts
none: 0 | sm: 2px | md: 4px
```

### Decorative grid background

```tsx
import { gridBg } from "../styles/theme";
<div style={gridBg} />   // faint orange grid overlay
```

---

## 🧩 Component Library

All components use **inline styles wired to `theme.ts`** (no Tailwind classes in our custom set).

### Button

```tsx
import { Button } from "../components/common/Button";

<Button variant="primary" size="md" onClick={() => {}}>
  CLICK ME
</Button>
```

- **variant:** `"primary" | "secondary" | "outline" | "ghost"`
- **size:** `"sm" | "md" | "lg"`
- **props:** `onClick`, `disabled`, `type`, `className`, `style`

### Card

```tsx
import { Card } from "../components/common/Card";

<Card hoverable style={{ marginTop: "24px" }}>
  ...content...
</Card>
```

- **props:** `hoverable`, `className`, `style`

### Badge

```tsx
import { Badge } from "../components/common/Badge";

<Badge variant="success">WORKING</Badge>
```

- **variant:** `"success" | "warning" | "error" | "info" | "neutral"`

### Input

```tsx
import { Input } from "../components/common/Input";

<Input
  type="text"
  placeholder="Enter name..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={errorMsg}
  multiline           // renders <textarea>
  rows={4}
/>
```

- **props:** `type`, `value`, `onChange`, `onKeyDown`, `disabled`, `error`, `multiline`, `rows`

### SearchBar

```tsx
import { SearchBar } from "../components/search/SearchBar";

<SearchBar
  value={query}
  onChange={setQuery}
  onSearch={() => navigate("/resources")}
/>
```

- **props:** `value`, `onChange`, `onSearch`, `placeholder`, `disabled`

### Header

```tsx
import { Header } from "../components/common/Header";

<Header />   // logo + nav, links to "/" and "/resources"
```

---

## 🧱 Creating a New Component

### Step 1 — Create the file

```bash
# common UI → src/components/common/
# feature-specific → src/components/<feature>/
```

### Step 2 — Use the theme + inline-style pattern

```tsx
import { theme } from "../../styles/theme";

interface MyComponentProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function MyComponent({ children, style }: MyComponentProps) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        padding: theme.spacing.lg,
        fontFamily: theme.fonts.body,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
```

> ✅ Always pull colors/fonts/spacing from `theme` — never hardcode hex values.
> ✅ Accept an optional `style` prop so callers can extend.

---

## 🔄 State Management

We use **local React state only** — `useState` / `useNavigate`. No Context API, no Redux.

```tsx
const [searchQuery, setSearchQuery] = React.useState("");
```

If shared state is needed later, prefer prop-drilling or a lightweight store — keep it simple.

---

## 📦 Notable Dependencies (installed)

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | Core |
| `react-router-dom` | Routing |
| `lucide-react` | Icons (Search, MapPin, ArrowLeft, Phone…) |
| `@mui/material`, `@radix-ui/*` | Base UI primitives (in `app/components/ui`, mostly unused) |
| `tailwind-merge`, `clsx`, `class-variance-authority` | Used by base UI set |
| `react-hook-form` | Available, not yet wired |

> ⚠️ `zod` is **not** installed. Form validation isn't set up yet.

---

## 🎯 Common Patterns

### Local search → navigate

```tsx
const [query, setQuery] = useState("");
<SearchBar value={query} onChange={setQuery} onSearch={() => navigate("/resources")} />
```

### Icons

```tsx
import { Search, MapPin, ArrowLeft } from "lucide-react";
<Search size={18} />
```

### Page shell pattern

```tsx
<div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: theme.colors.background }}>
  <div style={{ height: "3px", background: theme.colors.primary }} />   {/* top rule */}
  <Header />
  <main style={{ flex: 1 }}>...</main>
  <footer style={{ background: theme.colors.footer, borderTop: `3px solid ${theme.colors.primary}` }}>...</footer>
</div>
```

---

## 🛠️ Useful Commands

```bash
npm run dev          # Dev server (port 5173)
npm run build        # Production build → dist/
npx tsc --noEmit     # Type-check only
rm -rf dist          # Clean build output
```

---

## 🐛 Debugging Tips

**Styles/colors not updating site-wide?**
→ Make sure the component imports from `theme.ts` instead of hardcoding values.

**Fonts not showing?**
→ Check the Google Fonts `@import` in `fonts.css` and hard-refresh (Ctrl+Shift+R).

**Navigation not working?**
→ Confirm the route exists in `App.tsx` and you're using `useNavigate()` / `<Link>` from `react-router-dom`.

**Component not rendering?**
→ Check the named `export` matches the `import`.

---

## ✅ Current Status (June 2026)

**Done**
- [x] Vite + React + TypeScript scaffold
- [x] React Router with 3 routes
- [x] Custom component library (Button, Card, Badge, Input, SearchBar, Header)
- [x] Landing, Resources, ResourceDetail pages
- [x] Centralized theme (`theme.ts`) — colors, fonts, spacing, tokens
- [x] IBM Plex Sans + Space Mono typography

**Not yet built**
- [ ] API client / data layer (currently mock data)
- [ ] Backend integration (`.env`, fetch hooks)
- [ ] Form handling + validation (`zod` not installed)
- [ ] Map-based discovery view
- [ ] Filters / search backend wiring
- [ ] Admin / claim / report flows

---

## 🤝 Contribution Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Colors/fonts pulled from `theme.ts` (no hardcoded hex)
- [ ] Component accepts `style` prop where reusable
- [ ] No console errors/warnings

---

**Happy Coding! 🚀**
