# STEM Commons - Implementation Plan

**Project:** STEM Resources Discovery Platform - India  
**Tech Stack:** React + Vite + FastAPI + PostgreSQL + PostGIS + Leaflet  
**Start Date:** June 11, 2026

---

## Table of Contents
1. [Design System](#design-system)
2. [Monorepo Structure](#monorepo-structure)
3. [Database Schema](#database-schema)
4. [Frontend Roadmap](#frontend-roadmap)
5. [Backend Roadmap](#backend-roadmap)
6. [Docker Setup](#docker-setup)
7. [API Specifications](#api-specifications)

---

## Design System

### Color Palette
```
PRIMARY_ORANGE: #FF6B35
DEEP_BLACK: #1A1A1A
NEUTRAL_WHITE: #FFFFFF
NEUTRAL_GRAY: #F5F5F5
DARK_GRAY: #333333

STATUS_GREEN: #22C55E (Working)
STATUS_YELLOW: #EAB308 (Planned)
STATUS_ORANGE: #F97316 (Temporarily Closed)
STATUS_RED: #EF4444 (Permanently Closed)
```

### Typography
```
HEADINGS: IBM Plex Sans
  - H1: 48px, bold (700), letter-spacing: -1px
  - H2: 36px, bold (700)
  - H3: 28px, semi-bold (600)
  - H4: 24px, semi-bold (600)

SPECIFICATIONS/CODE: Space Mono or JetBrains Mono
  - Font-size: 12px-14px
  - Line-height: 1.5

BODY TEXT: JetBrains Mono
  - Regular: 16px, normal (400), line-height: 1.6
  - Small: 14px, normal (400)
```

### Component Design Tokens
```
BUTTON_PRIMARY: 
  - Background: #FF6B35
  - Text: #FFFFFF
  - Hover: darken #FF6B35 by 10%
  - Padding: 12px 24px
  - Border-radius: 4px (sharp edges for industrial feel)

CARD_DEFAULT:
  - Background: #FFFFFF
  - Border: 1px solid #E5E5E5
  - Border-radius: 0px (sharp corners)
  - Box-shadow: 0 2px 8px rgba(0,0,0,0.1)

INPUT_FIELD:
  - Background: #F5F5F5
  - Border: 2px solid #E5E5E5
  - Focus-border: 2px solid #FF6B35
  - Padding: 12px 16px
  - Font: JetBrains Mono 14px

BADGE:
  - Padding: 6px 12px
  - Border-radius: 0px
  - Font: IBM Plex Sans 12px semi-bold
```

### Spacing Scale
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### Branding
- **Logo:** Keep orange and black geometric style
- **Tone:** Professional, minimalist, industrial
- **Interaction:** Subtle animations (fade, slide) - no bouncy effects

---

## Monorepo Structure

```
stem-commons/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── app/
│   │   │   └── App.tsx          # Main app with routing
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx  # Landing/search page
│   │   │   ├── ResourcesPage.tsx # Resources discovery
│   │   │   ├── ResourceDetail.tsx # Resource detail page
│   │   │   ├── SubmitResource.tsx # Resource submission form
│   │   │   ├── AdminDashboard.tsx # Admin panel
│   │   │   └── NotFound.tsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Loader.tsx
│   │   │   │   └── Header.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── FilterPills.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   ├── map/
│   │   │   │   ├── MapContainer.tsx
│   │   │   │   ├── Marker.tsx
│   │   │   │   └── MarkerCluster.tsx
│   │   │   ├── resource/
│   │   │   │   ├── ResourceCard.tsx
│   │   │   │   ├── ResourceGallery.tsx
│   │   │   │   ├── MachinesList.tsx
│   │   │   │   ├── ClaimButton.tsx
│   │   │   │   └── ReportButton.tsx
│   │   │   └── forms/
│   │   │       ├── ResourceSubmitForm.tsx
│   │   │       ├── ClaimForm.tsx
│   │   │       └── ReportForm.tsx
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useGeolocation.ts
│   │   │   └── useFetch.ts
│   │   ├── lib/
│   │   │   ├── api-client.ts
│   │   │   ├── validation.ts
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── main.tsx            # Vite entry point
│   │   └── index.html
│   ├── public/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.local
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Entry point
│   │   ├── config.py            # Configuration
│   │   ├── dependencies.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py
│   │   │   ├── exceptions.py
│   │   │   └── config.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── resource.py      # SQLAlchemy ORM models
│   │   │   ├── machine.py
│   │   │   ├── photo.py
│   │   │   ├── claim.py
│   │   │   └── report.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── resource.py      # Pydantic schemas
│   │   │   ├── machine.py
│   │   │   ├── claim.py
│   │   │   └── report.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── resources.py
│   │   │   │   │   ├── machines.py
│   │   │   │   │   ├── photos.py
│   │   │   │   │   ├── claims.py
│   │   │   │   │   ├── reports.py
│   │   │   │   │   └── search.py
│   │   │   │   └── api.py       # API router aggregation
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── resource_service.py
│   │   │   ├── search_service.py
│   │   │   ├── geocoding_service.py
│   │   │   ├── email_service.py
│   │   │   └── file_service.py
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # SQLAlchemy setup
│   │   │   ├── session.py       # DB session management
│   │   │   └── migrations/      # Alembic migrations
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── test_resources.py
│   │   │   ├── test_search.py
│   │   │   └── conftest.py
│   ├── requirements.txt
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   └── alembic.ini
│
├── docker-compose.yml           # Local development setup
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

---

## Database Schema

### PostgreSQL with PostGIS

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Resources Table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Makerspace', 'ATAL Lab', 'Vendor')),
    status VARCHAR(50) NOT NULL DEFAULT 'Working' CHECK (status IN ('Planned', 'Working', 'Temporarily Closed', 'Permanently Closed')),
    short_description VARCHAR(500),
    full_description TEXT,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    website VARCHAR(500),
    social_media JSONB,
    operating_hours JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    verified_owner INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (verified_owner) REFERENCES users(id)
);

CREATE INDEX idx_resources_state_district ON resources(state, district);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_location ON resources USING GIST(location);

-- Machines/Facilities Table
CREATE TABLE machines (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    model_specs VARCHAR(500),
    quantity INTEGER DEFAULT 1,
    availability_status VARCHAR(50) DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Under Maintenance', 'Booked')),
    access_conditions VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE INDEX idx_machines_resource_id ON machines(resource_id);
CREATE INDEX idx_machines_category ON machines(category);

-- Photos Table
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    uploaded_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_photos_resource_id ON photos(resource_id);

-- Claims Table
CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL,
    claimer_name VARCHAR(255) NOT NULL,
    claimer_email VARCHAR(255) NOT NULL,
    claimer_phone VARCHAR(20),
    role VARCHAR(50),
    proof_document_url VARCHAR(500),
    message TEXT,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX idx_claims_resource_id ON claims(resource_id);
CREATE INDEX idx_claims_status ON claims(status);

-- Reports Table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL,
    reporter_name VARCHAR(255),
    reporter_email VARCHAR(255),
    issue_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    screenshot_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Invalid')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INTEGER,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);

CREATE INDEX idx_reports_resource_id ON reports(resource_id);
CREATE INDEX idx_reports_status ON reports(status);

-- Users Table (for future authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(500),
    role VARCHAR(50) DEFAULT 'User' CHECK (role IN ('User', 'Verified Owner', 'Admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

## Frontend Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goals:**
- Setup React + Vite project with TypeScript
- Create reusable component library
- Build landing page with search engine UI
- Setup React Router for navigation

**Tasks:**
1. Initialize React + Vite project with TypeScript
2. Install React Router for client-side routing
3. Create component library:
   - Button, Card, Badge, Modal, Input, Loader, Header
   - SearchBar, FilterPills, SearchResults
4. Implement landing page:
   - Hero section with search bar
   - Browse & Map View buttons
   - Statistics display
5. Create pages structure:
   - LandingPage component
   - ResourcesPage component (stub)
   - NotFound page
6. Setup routing:
   - / → LandingPage
   - /resources → ResourcesPage
   - /resources/:id → ResourceDetail
7. Create utility functions and constants

**Deliverables:**
- Functional landing page with routing
- Reusable component library
- Type definitions and utilities
- Dev server running smoothly

---

### Phase 2: Map & Discovery (Weeks 3-4)

**Goals:**
- Integrate Leaflet map
- Build resource discovery features
- Implement advanced filtering

**Tasks:**
1. Setup Leaflet with React:
   - MapContainer component
   - Custom markers with status colors
   - Marker clustering
2. Build ResourceCard component
3. Implement filtering logic:
   - Geographic (State → District → City)
   - Resource Type
   - Status
   - Facilities/Equipment
4. Create list view with pagination
5. Connect to mock API endpoints
6. Implement save filters to localStorage

**Deliverables:**
- Functional map with clustered markers
- Working filters (all types)
- List/map view toggle
- Error boundaries and loading states

---

### Phase 3: Resource Pages (Weeks 5-6)

**Goals:**
- Build detailed resource pages
- Implement photo gallery
- Create action buttons (claim, report, share)

**Tasks:**
1. Build resource detail page layout
2. Create PhotoGallery component (lightbox)
3. Build MachinesList component
4. Implement action buttons:
   - Claim This Lab (modal form)
   - Report Issue (modal form)
   - Share (social + QR code + copy)
   - Bookmark/Save
5. Add contact section with map embed
6. Build operating hours display
7. Implement form validation with React Hook Form + Zod

**Deliverables:**
- Full resource detail pages
- Working modals for claims/reports
- Photo gallery with captions
- Share functionality

---

### Phase 4: Forms & Submissions (Week 7)

**Goals:**
- Build public submission forms
- Implement form validation and error handling

**Tasks:**
1. Create ResourceSubmitForm component
2. Implement multi-step form for resource submission
3. Add photo upload preview
4. Add location picker (map-based)
5. Setup form validation schemas (Zod)
6. Implement file upload handling
7. Add CAPTCHA integration

**Deliverables:**
- Working resource submission form
- Form validation with error messages
- File upload preview
- Success/error states

---

### Phase 5: Admin Dashboard (Week 8)

**Goals:**
- Build basic admin interface
- Implement resource management UI

**Tasks:**
1. Create dashboard layout
2. Build resource management table:
   - Approve/reject pending
   - Edit resources
   - Delete/archive
   - Bulk actions
3. Build claims management panel
4. Build reports management panel
5. Create basic analytics cards
6. Add data export functionality (CSV)

**Deliverables:**
- Functional admin dashboard
- CRUD operations UI
- Claims/Reports management
- Basic analytics view

---

### Phase 6: Optimization & Polish (Week 9)

**Goals:**
- Performance optimization
- Responsive design refinement
- Testing

**Tasks:**
1. Image optimization (next/image)
2. Code splitting and lazy loading
3. Responsive design audit (mobile, tablet, desktop)
4. Accessibility audit (a11y)
5. SEO optimization
6. Write unit tests for components
7. Implement error logging

**Deliverables:**
- Optimized bundle size
- Mobile-responsive design
- Unit test coverage (>80%)
- Performance metrics documented

---

## Backend Roadmap

### Phase 1: Project Setup (Week 1)

**Goals:**
- Setup FastAPI project structure
- Configure database connection
- Create base models and schemas

**Tasks:**
1. Initialize FastAPI project
2. Setup virtual environment and requirements.txt:
   ```
   fastapi==0.104.1
   uvicorn==0.24.0
   sqlalchemy==2.0.23
   psycopg2-binary==2.9.9
   geoalchemy2==0.14.1
   alembic==1.12.1
   pydantic==2.5.0
   pydantic-settings==2.1.0
   python-multipart==0.0.6
   python-jose==3.3.0
   passlib==1.7.4
   python-dotenv==1.0.0
   pytest==7.4.3
   ```
3. Setup PostgreSQL connection with SQLAlchemy
4. Create SQLAlchemy models (Resource, Machine, Photo, Claim, Report, User)
5. Create Pydantic schemas for request/response validation
6. Setup Alembic for database migrations
7. Create base configuration (config.py)

**Deliverables:**
- Project structure with proper imports
- Database connection working
- Initial migration files
- Base ORM models

---

### Phase 2: Core API Endpoints (Weeks 2-3)

**Goals:**
- Implement CRUD endpoints for resources
- Setup search and filtering

**Tasks:**
1. Create resource endpoints:
   - GET /api/v1/resources (with filters)
   - POST /api/v1/resources (submit new)
   - GET /api/v1/resources/{id}
   - PUT /api/v1/resources/{id} (admin only)
   - DELETE /api/v1/resources/{id} (admin only)
2. Implement advanced search service:
   - Full-text search
   - GeospatialQueries (distance-based)
   - Multi-filter support
3. Create machine endpoints:
   - GET /api/v1/resources/{id}/machines
   - POST/PUT/DELETE for machines (admin)
4. Implement input validation and error handling
5. Add CORS configuration
6. Setup request logging

**Deliverables:**
- Working CRUD endpoints
- Search with geospatial queries
- Proper error responses
- API documentation (auto-generated)

---

### Phase 3: Photos & File Handling (Week 4)

**Goals:**
- Implement photo upload endpoints
- Setup file storage

**Tasks:**
1. Create photo endpoints:
   - POST /api/v1/resources/{id}/photos (upload)
   - GET /api/v1/resources/{id}/photos
   - DELETE /api/v1/photos/{id} (admin)
2. Setup file storage service:
   - Local storage OR cloud (AWS S3)
   - Image validation and compression
3. Implement photo database schema
4. Add photo listing for resource pages
5. Setup virus scanning for uploads

**Deliverables:**
- Working photo upload
- File storage configured
- Photo endpoints functional

---

### Phase 4: Claims & Reports (Week 5)

**Goals:**
- Implement claim and report workflows

**Tasks:**
1. Create claim endpoints:
   - POST /api/v1/resources/{id}/claim
   - GET /api/v1/claims (admin)
   - PATCH /api/v1/claims/{id}/approve (admin)
   - PATCH /api/v1/claims/{id}/reject (admin)
2. Create report endpoints:
   - POST /api/v1/resources/{id}/report
   - GET /api/v1/reports (admin)
   - PATCH /api/v1/reports/{id}/resolve (admin)
3. Implement email notifications:
   - Claim submitted notification
   - Claim approved/rejected
   - Report received notification
4. Add validation schemas for claims/reports

**Deliverables:**
- Working claim workflow
- Working report workflow
- Email notifications configured

---

### Phase 5: Search & Geocoding (Week 6)

**Goals:**
- Optimize search performance
- Implement geospatial features

**Tasks:**
1. Implement PostGIS queries:
   - Distance-based search
   - Polygon queries (district boundaries)
2. Build search service:
   - Autocomplete for states/districts
   - Autocomplete for resource names
3. Add filtering service:
   - Multi-filter logic
   - Performance optimization
4. Cache common queries (Redis - future)
5. Write complex SQL queries for aggregations

**Deliverables:**
- Efficient geospatial queries
- Working autocomplete endpoints
- Search performance optimized

---

### Phase 6: Admin Endpoints (Week 7)

**Goals:**
- Build admin-specific endpoints
- Implement analytics

**Tasks:**
1. Create admin management endpoints:
   - Resource approval/rejection
   - User role management
   - Bulk operations
2. Build analytics endpoints:
   - Resources by type/state/district
   - Status distribution
   - Recent submissions
   - Popular searches
3. Create export endpoints (CSV/JSON)
4. Add admin activity logging

**Deliverables:**
- Admin endpoints
- Analytics data endpoints
- Export functionality

---

### Phase 7: Testing & Documentation (Week 8)

**Goals:**
- Comprehensive testing
- API documentation

**Tasks:**
1. Write unit tests for services
2. Write integration tests for endpoints
3. Setup pytest fixtures
4. Generate OpenAPI/Swagger documentation
5. Create postman collection
6. Write deployment docs

**Deliverables:**
- Test coverage >80%
- API documentation
- Deployment ready

---

## Docker Setup

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    container_name: stem_commons_db
    environment:
      POSTGRES_DB: stem_commons
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - stem_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d stem_commons"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: stem_commons_api
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/stem_commons
      ENVIRONMENT: development
    volumes:
      - ./backend:/app
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - stem_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: stem_commons_web
    command: npm run dev
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - stem_network

volumes:
  postgres_data:

networks:
  stem_network:
    driver: bridge
```

### Dockerfile (Backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Dockerfile.dev (Frontend)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

---

## API Specifications

### Base URL: `http://localhost:8000/api/v1`

### Authentication Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Core Endpoints

#### Resources
```
GET    /resources                 # List all resources (with filters)
POST   /resources                 # Submit new resource
GET    /resources/{id}            # Get resource details
PUT    /resources/{id}            # Update resource (admin/owner)
DELETE /resources/{id}            # Delete resource (admin)
```

#### Search & Autocomplete
```
GET    /search/resources          # Full-text search
GET    /search/states             # Get all states
GET    /search/districts/{state}  # Get districts by state
GET    /search/autocomplete       # Autocomplete search
GET    /search/nearby             # Nearby resources (geospatial)
```

#### Machines/Facilities
```
GET    /resources/{id}/machines
POST   /resources/{id}/machines
PUT    /machines/{id}
DELETE /machines/{id}
```

#### Photos
```
GET    /resources/{id}/photos
POST   /resources/{id}/photos
DELETE /photos/{id}
```

#### Claims
```
POST   /resources/{id}/claim             # Submit claim
GET    /claims (admin only)              # List claims
PATCH  /claims/{id}/approve (admin)     # Approve claim
PATCH  /claims/{id}/reject (admin)      # Reject claim
```

#### Reports
```
POST   /resources/{id}/report            # Submit report
GET    /reports (admin only)             # List reports
PATCH  /reports/{id}/resolve (admin)    # Resolve report
```

#### Admin Analytics
```
GET    /admin/analytics/overview
GET    /admin/analytics/resources-by-type
GET    /admin/analytics/resources-by-state
GET    /admin/analytics/status-distribution
GET    /admin/export/resources
```

### Example Request: List Resources with Filters

```http
GET /resources?state=Maharashtra&district=Pune&type=Makerspace&status=Working&page=1&limit=20

Response:
{
  "data": [
    {
      "id": 1,
      "name": "Mumbai Makerspace",
      "type": "Makerspace",
      "status": "Working",
      "location": "Pune, Maharashtra",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "is_verified": true,
      "thumbnail": "https://..."
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "pages": 8
}
```

### Example Request: Geospatial Search

```http
GET /search/nearby?latitude=18.5204&longitude=73.8567&radius=5

Response:
{
  "data": [
    {
      "id": 1,
      "name": "Mumbai Makerspace",
      "distance_km": 2.3,
      ...
    }
  ]
}
```

---

## Development Workflow

### Local Setup

```bash
# Clone repo
git clone <repo>
cd stem-commons

# Start Docker services
docker-compose up -d

# Verify services
docker-compose ps

# Run database migrations
docker-compose exec backend alembic upgrade head

# Visit:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Development Commands

```bash
# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Access database shell
docker-compose exec postgres psql -U user -d stem_commons

# Rebuild after dependency changes
docker-compose build
docker-compose up -d
```

---

## Next Steps

1. ✅ Create monorepo structure
2. ✅ Initialize Next.js frontend
3. ✅ Initialize FastAPI backend
4. ✅ Setup Docker Compose
5. ✅ Run Phase 1 implementations
6. ✅ Connect frontend to backend
7. ✅ Deploy to staging
8. ✅ Launch MVP

---

**Ready to Start Coding?** Let me know which phase to begin!
