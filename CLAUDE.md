# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UPT Pontaje is a timesheet and salary annex management system for teaching staff at Politehnica University of Timişoara. Users have three roles: `CADRU_DIDACTIC` (Faculty), `SECRETARIAT`, and `ADMIN`.

## Commands

### Docker (primary way to run the full stack)
```bash
docker-compose up --build      # Build and start all services
docker-compose up              # Start already-built services
docker-compose down            # Stop all services
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Dev server with HMR at http://localhost:5173
npm run build      # TypeScript check + production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend
```bash
cd backend
./mvnw spring-boot:run                    # Run in dev mode (port 8080)
./mvnw clean package -DskipTests          # Build JAR
./mvnw test                               # Run tests
```

### Environment Setup
Copy `.env.example` to `.env` and fill in values before running Docker. Required vars: `DB_PASSWORD`, `JWT_SECRET`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `CORS_ORIGINS`.

## Architecture

### Backend (Spring Boot 3.2.2, Java 17)
Layered architecture: **Controllers → Services → Repositories → PostgreSQL**

- [backend/src/main/java/ro/upt/pontaje/](backend/src/main/java/ro/upt/pontaje/) — package root
  - `controller/` — 8 REST controllers; all prefixed `/api/`
  - `service/` — business logic including PDF generation (Apache PDFBox) and Excel export (Apache POI)
  - `model/` — JPA entities with UUID PKs; key entities: `User`, `Timesheet`, `TimesheetEntry`, `Schedule`, `Document`
  - `security/` — JWT authentication (`JwtTokenProvider`, `JwtAuthenticationFilter`), 24-hour token expiry
  - `config/SecurityConfig.java` — CORS config and endpoint authorization rules per role
  - `exception/GlobalExceptionHandler.java` — centralized error handling

Database schema is initialized from [backend/src/main/resources/db/init.sql](backend/src/main/resources/db/init.sql) (8 tables). JPA runs with `ddl-auto: validate` — schema changes require updating `init.sql` and rebuilding the container.

Spring profiles: `dev` (application-dev.yml) and `prod` (application-prod.yml). Docker uses `prod`.

### Frontend (React 19 + TypeScript + Vite)
SPA with role-based routing.

- [frontend/src/api/api.ts](frontend/src/api/api.ts) — single Axios instance; all API calls go through here
- [frontend/src/context/AuthContext.tsx](frontend/src/context/AuthContext.tsx) — JWT storage and user state; wraps the entire app
- [frontend/src/components/auth/ProtectedRoute.tsx](frontend/src/components/auth/ProtectedRoute.tsx) — role-based route guards
- [frontend/src/components/layout/MainLayout.tsx](frontend/src/components/layout/MainLayout.tsx) — responsive sidebar; role-aware nav items
- [frontend/src/pages/](frontend/src/pages/) — one file per page; MUI v7 components throughout
- [frontend/src/types/](frontend/src/types/) — TypeScript interfaces mirroring backend DTOs
- [frontend/src/theme/](frontend/src/theme/) — MUI theme with UPT branding (primary: `#003366`)

State: React Context for auth, TanStack Query v5 for server state caching.

### Database
PostgreSQL 15 in Docker (external port 5433). Test credentials in [useri_test.txt](useri_test.txt):
- `admin@upt.ro` / `admin123`
- `secretariat@upt.ro` / `secret123`
- `profesor@upt.ro` / `test123`

### Key Domain Concepts
- **Timesheet statuses:** `DRAFT` → `SUBMITTED` → `APPROVED`
- **Hour types:** `NORMA` (standard hours) and `PLATA_ORA` (per-hour payment)
- **Annex documents:** Annex 1 and Annex 3 are PDF salary annexes generated server-side
- **Pontaj deadline:** 25th of each month; reminders sent 3 days before
