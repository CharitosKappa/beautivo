# Beautivo

Booking platform for beauty salons (frontend + admin + API).

**Quick Start**
1. Start PostgreSQL:
   - `docker compose up -d`
2. Install dependencies (from repo root):
   - `npm install`
3. Ensure backend environment is set:
   - `cp backend/.env.example backend/.env` (Windows PowerShell: `Copy-Item backend/.env.example backend/.env`)
4. Start frontend + backend:
   - `npm run dev`

**Environment Variables**
- Backend: copy `backend/.env.example` to `backend/.env` and adjust if needed.
- Frontend: set `NEXT_PUBLIC_API_URL=http://localhost:3001` in `frontend/.env.local`.

**Seed**
- Run: `npm --prefix backend run seed`

**Backend Migrations**
- Generate: `npm --prefix backend run migration:generate -- src/database/migrations/InitialSchema`
- Run: `npm --prefix backend run migration:run`
- Revert: `npm --prefix backend run migration:revert`

**Services**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/v1
