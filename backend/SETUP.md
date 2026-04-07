# CropGuard AI — Backend Setup Guide
Mekelle Institute of Technology 2026

## Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running
- Python FastAPI model server (after training completes)

---

## Step 1 — PostgreSQL database setup

Open the PostgreSQL command line (psql):

```bash
# On Windows — open pgAdmin or run:
psql -U postgres

# On Linux/Mac:
sudo -u postgres psql
```

Run these SQL commands:
```sql
CREATE DATABASE cropguard_db;
CREATE USER cropguard_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE cropguard_db TO cropguard_user;
\q
```

---

## Step 2 — Create your .env file

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:
```
DATABASE_URL=postgres://cropguard_user:yourpassword@localhost:5432/cropguard_db
FRONTEND_URL=http://localhost:3000
AI_SERVER_URL=http://localhost:8000
PORT=3001
```

---

## Step 3 — Install dependencies

```bash
cd backend
npm install
```

Note: `sharp` (image compression) may take a minute to install as it compiles native code.

---

## Step 4 — Start the backend

```bash
npm run dev    # development (auto-restarts on file changes)
# or
npm start      # production
```

You should see:
```
  ╔══════════════════════════════════════╗
  ║       CropGuard AI — Backend v2      ║
  ╠══════════════════════════════════════╣
  ║  Server  →  http://localhost:3001    ║
  ╚══════════════════════════════════════╝

[db] Schema initialised — tables: predictions, feedback
```

---

## Step 5 — Start the Python AI server (after training)

```bash
cd ml
uvicorn serve:app --host 0.0.0.0 --port 8000
```

---

## Step 6 — Start the frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

---

## API Endpoints Reference

| Method | Endpoint               | Used by                        |
|--------|------------------------|--------------------------------|
| POST   | /api/predict           | DetectPage (upload + camera)   |
| GET    | /api/history           | HistoryPage, DashboardPage     |
| GET    | /api/history/stats     | AnalyticsPage, DashboardPage   |
| GET    | /api/history/:id       | BookmarksPage comparison       |
| DELETE | /api/history/:id       | HistoryPage single delete      |
| DELETE | /api/history           | HistoryPage bulk delete        |
| POST   | /api/feedback          | FeedbackPanel (ResultCard)     |
| GET    | /api/health            | Status pill in topbar          |
| GET    | /api/ai-health         | AI model online check          |
| GET    | /uploads/:filename     | All image displays             |

---

## Troubleshooting

**"DATABASE_URL not set" error**
→ Make sure you created `.env` from `.env.example` and filled in the database URL.

**"AI model server is offline"**
→ Start the Python server: `cd ml && uvicorn serve:app --port 8000`
→ The backend and frontend will still work — predictions just won't be available.

**"sharp" install fails on Windows**
→ Run: `npm install --ignore-scripts` then `npm rebuild sharp`
→ Or disable compression: set `IMAGE_COMPRESS=false` in `.env`

**Port 3001 already in use**
→ Change `PORT=3002` in `.env` and update `VITE_API_URL=http://localhost:3002` in frontend `.env`
