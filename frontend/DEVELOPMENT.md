# Frontend Development Guide

## Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git

### First Time Setup

```bash
# Clone the repository
git clone https://github.com/your-org/stem-commons.git
cd stem-commons/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

The server watches for file changes and auto-reloads. Press `h` in terminal for Vite help.

### 2. Make Changes

All source code is in `src/`.

**Important files:**
- `src/app/App.tsx` - Main application
- `src/main.tsx` - React entry point
- `src/styles/` - Global styles

### 3. Format Code

```bash
npx prettier --write src/**/*.{ts,tsx}
```

### 4. Lint Code

```bash
npm run lint
# or
npx eslint src --ext .ts,.tsx
```

### 5. Build for Testing

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   └── App.tsx              # Main component
│   ├── components/
│   │   ├── LandingPage.tsx      # Hero/search page
│   │   └── ResourcesPage.tsx    # Search results page
│   ├── imports/                 # Imported components
│   ├── styles/
│   │   ├── index.css            # Global styles
│   │   └── ...
│   ├── main.tsx                 # React entry
│   └── index.html               # HTML template
├── public/                      # Static assets
├── Dockerfile                   # Production image
├── Dockerfile.dev               # Development image
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── .env.local                  # Local environment (gitignored)
├── .env.example                # Environment template
└── README.md                   # This file
```

## Component Development

### Creating a New Component

```typescript
// src/components/MyComponent.tsx
import React from "react";

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {onClick && <button onClick={onClick}>Click me</button>}
    </div>
  );
}
```

### Styling

Use inline styles for single-use components:

```typescript
const styles = {
  container: {
    display: "flex",
    gap: "16px",
    padding: "24px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1a1a1a",
  },
};

export function MyComponent() {
  return <div style={styles.container}></div>;
}
```

## API Integration

### Connecting to Backend

Update `.env.local`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Making API Calls

```typescript
const API_URL = import.meta.env.VITE_API_URL;

async function fetchResources() {
  const response = await fetch(`${API_URL}/resources`);
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
}
```

## Debugging

### Browser DevTools

1. Open `F12` (DevTools)
2. Check Console for errors
3. Use React DevTools extension (recommended)

### Vite Debug Mode

```bash
npm run dev -- --debug
```

### Environment Logging

Set in `.env.local`:

```env
VITE_LOG_LEVEL=debug
```

## Docker Development

### Run in Docker

```bash
# Build dev image
docker build -f Dockerfile.dev -t stem-commons-web:dev .

# Run container
docker run -p 5173:5173 -v $(PWD)/src:/app/src stem-commons-web:dev
```

### Using Docker Compose

From project root:

```bash
docker-compose up frontend
```

## Testing

### Running Tests (When Added)

```bash
npm run test
```

### Coverage Report

```bash
npm run test -- --coverage
```

## Common Tasks

### Update Dependencies

```bash
npm update
npm install <package>@latest
```

### Fix Vulnerabilities

```bash
npm audit fix
npm audit fix --force  # Use with caution
```

### Clear Cache

```bash
rm -rf node_modules package-lock.json
npm install
```

### Production Build

```bash
npm run build
# Output in dist/
```

## Performance Optimization

### Bundle Analysis

```bash
npm run build -- --analyze
```

### Image Optimization

Use Next.js Image component (when migrating):

```typescript
import Image from "next/image";

<Image
  src="/image.png"
  alt="Description"
  width={800}
  height={600}
/>
```

## Deployment

### To Vercel

```bash
npm install -g vercel
vercel
```

### To Netlify

```bash
npm run build
# Deploy dist/ folder to Netlify
```

### To Docker

```bash
docker build -f Dockerfile -t stem-commons-web:latest .
docker run -p 3000:3000 stem-commons-web:latest
```

## Troubleshooting

### "EADDRINUSE: address already in use :::5173"

```bash
lsof -i :5173
kill -9 <PID>
npm run dev
```

### "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Vite HMR not working

Add to `vite.config.ts`:

```typescript
export default {
  server: {
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
  },
};
```

### TypeScript errors

Run type checking:

```bash
npx tsc --noEmit
```

## Best Practices

1. **Keep components small** - Easier to test and maintain
2. **Use TypeScript** - Catch errors early
3. **Prop validation** - Use interfaces/types
4. **Meaningful names** - Clear variable/function names
5. **DRY principle** - Don't repeat yourself
6. **Comment WHY, not WHAT** - Code speaks for itself
7. **Test edge cases** - Empty states, loading, errors
8. **Accessibility** - Use semantic HTML, ARIA labels
9. **Performance** - Lazy load, code split, optimize images
10. **Security** - Validate inputs, sanitize HTML

## Useful Resources

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Material-UI](https://mui.com/)

## Getting Help

1. Check existing issues on GitHub
2. Read the [README.md](./README.md)
3. Review the [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)
4. Ask in team Slack/Discord

## Commit Message Guidelines

```
type(scope): subject

feat(search): add autocomplete search
fix(map): resolve clustering issue
docs(readme): update setup instructions
style(buttons): improve hover states
refactor(api): simplify response handling
test(resources): add unit tests
```

Types: feat, fix, docs, style, refactor, test, chore

---

Happy coding! 🚀
