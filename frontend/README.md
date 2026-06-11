
# STEM Commons - Frontend

A modern, industrial-aesthetic discovery platform for STEM resources across India. Built with React + Vite + TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:5173
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── app/
│   └── App.tsx                 # Main application component
├── components/                 # React components
├── types/
│   └── index.ts                # TypeScript type definitions
├── styles/
│   └── index.css               # Global styles
└── main.tsx                    # React entry point

public/
├── images/
└── fonts/
```

## 🎨 Design System

### Colors
- **Primary Red**: `#c41a0a`
- **Background**: `#f5f2ee` (Beige)
- **Text**: `#1a1a1a` (Dark)
- **Status Green**: `#166534`
- **Status Yellow**: `#92400e`
- **Status Orange**: `#9a3412`
- **Status Red**: `#7f1d1d`

### Typography
- **Display**: Oswald (headings, bold)
- **Body**: Barlow (regular text)
- **Monospace**: Monospace (labels, specs)

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then update with your backend API URL:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_ENV=development
```

## 📦 Available Scripts

```bash
npm run dev       # Start dev server on http://localhost:5173
npm run build     # Build for production
npm run preview   # Preview production build locally
```

## 🌐 API Integration

Frontend connects to backend at:
```
Base URL: {VITE_API_URL}
```

API Endpoints:
- `GET /resources` - List resources
- `GET /search/resources` - Search with filters
- `POST /resources` - Submit new resource
- `GET /resources/{id}` - Get resource details
- `GET /resources/{id}/photos` - Get photos
- `POST /resources/{id}/claim` - Claim resource
- `POST /resources/{id}/report` - Report issue

Full API spec: [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)

## 🚢 Deployment

### Vercel / Netlify

```bash
npm run build
# Deploy dist/ folder
```

### Docker

```bash
docker build -f Dockerfile.dev -t stem-commons-web:latest .
docker run -p 5173:5173 stem-commons-web:latest
```

### Docker Compose

```bash
cd .. && docker-compose up --build frontend
```

## 📚 Technology Stack

- **Framework**: React 18.3+
- **Build**: Vite 6.3+
- **Language**: TypeScript 5+
- **UI**: Material-UI, Radix UI, Custom Components
- **Icons**: Lucide React
- **Styling**: Tailwind CSS, Inline Styles
- **Parsing**: Recharts (for analytics)

## 🐛 Troubleshooting

**Port 5173 already in use?**
```bash
lsof -ti :5173 | xargs kill -9
npm run dev
```

**Install issues?**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Build errors?**
```bash
npm run build -- --mode development
```

## 📄 Original Design

Based on: https://www.figma.com/design/SwkilqFrnystfNLXptanVi/Industrial-Themed-Website

## 📝 Contributing

1. Branch from `main`
2. Make changes
3. Test locally (`npm run dev`)
4. Submit pull request

## 📄 License

© 2026 STEM Commons. All rights reserved.
  