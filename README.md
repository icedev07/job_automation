# Job Application Bot

Automated job scraping, resume tailoring, and cover letter generation — deployed entirely on **free cloud services**.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                Render (Free Tier)                     │
│  Next.js App:  UI · Admin Panel · API · Scanners     │
└──────────────┬─────────────┬────────────────────────┘
               │             │
    ┌──────────▼──────┐  ┌───▼───────────┐
    │ Supabase (Free) │  │ Google Sheets │
    │  PostgreSQL DB  │  │  Job Results  │
    └─────────────────┘  └───────────────┘
                             │
                     ┌───────▼───────┐
                     │  OpenAI API   │
                     │ (Your own key)│
                     └───────────────┘
```

## Services (all free, no credit card required)

| Service | Purpose | Free Tier Limits |
|---------|---------|-----------------|
| **Render** | Web app hosting | 750 hrs/month, 512MB RAM |
| **Supabase** | PostgreSQL database | 500MB storage, unlimited API |
| **Google Sheets** | Job list output | 300 reads/writes per minute |
| **OpenAI API** | Resume & cover letter generation | Your own API key |

## Features

- **Job Board Scanners**: Playwright-based scrapers for Jobright, ZipRecruiter, Glassdoor, Dice, Simplify
- **AI Document Generation**: Tailored resumes and cover letters via OpenAI API
- **Admin Panel** (`/admin`): Configure API keys, prompts, scanners, skip rules, user profiles
- **Google Sheets Sync**: Auto-sync job data to a Google Sheet
- **Skip Rules**: Auto-skip jobs by company, title keyword, or URL pattern
- **Scan Logging**: Track scan history and generation stats

## Quick Start

### 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy the database connection string from Settings → Database

### 2. Deploy to Render

1. Fork this repo
2. Create a new Web Service on [render.com](https://render.com)
3. Set the environment variable:
   - `DATABASE_URL` = your Supabase connection string
4. Render will use `render.yaml` for build/start commands

### 3. Configure via Admin Panel

1. Visit `your-app.onrender.com/admin` (default password: `admin`)
2. Go to **API Keys** → Set your OpenAI API key
3. Go to **Profiles** → Create a user profile with your base resume
4. Optionally configure Google Sheets credentials for job list sync

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── layout.tsx      # Admin layout with nav & password gate
│   │   ├── page.tsx        # Dashboard with stats
│   │   ├── api-keys/       # OpenAI key, Google Sheets credentials
│   │   ├── prompts/        # LLM prompt template editor
│   │   ├── scanners/       # Scanner config & manual trigger
│   │   ├── skip-rules/     # Blocked companies/titles/URLs
│   │   ├── profiles/       # User profile management
│   │   └── logs/           # Scan & generation history
│   ├── api/
│   │   ├── admin/          # Admin API routes
│   │   ├── health/         # Health check (keeps Supabase alive)
│   │   └── jobs/           # Job CRUD + document generation
│   ├── jobs/               # Jobs list UI
│   └── one-click-jobs/     # 1-Click jobs UI
├── lib/
│   ├── config.ts           # Read/write AppConfig from DB
│   ├── llmClient.ts        # OpenAI API wrapper
│   ├── googleSheetsSync.ts # Google Sheets sync
│   ├── jobSkipRules.ts     # Skip rules (loaded from DB)
│   ├── generateDocuments.ts# Resume + cover letter generation
│   └── prisma.ts           # Prisma client singleton
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/                # CLI scripts for local scanning
└── render.yaml             # Render deployment config
```

## Admin Panel Pages

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin` | Stats overview (jobs, docs, recent scans) |
| API Keys | `/admin/api-keys` | OpenAI key, Google Sheets creds, admin password |
| Prompts | `/admin/prompts` | Edit resume & cover letter prompt templates |
| Scanners | `/admin/scanners` | Configure boards, search URLs, manual Run Now |
| Skip Rules | `/admin/skip-rules` | CRUD for blocked companies/titles/URLs |
| Profiles | `/admin/profiles` | User profiles with base resume text |
| Logs | `/admin/logs` | Scan history and generation history |

## Database Schema

### Core Tables
- `JobApplication` — Full job listings with metadata
- `OneClickJob` — 1-Click/Easy Apply jobs
- `JobDescription` — Scraped job descriptions
- `TailoredResume` — AI-generated tailored resumes
- `CoverLetter` — AI-generated cover letters
- `Resume` — Base resume storage

### Admin Tables
- `AppConfig` — Key-value configuration (API keys, prompts, settings)
- `SkipRule` — Auto-skip rules (company, title, URL patterns)
- `UserProfile` — User profiles with base resume text
- `ScanLog` — Scan execution history
- `GenerationLog` — Document generation history

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (pings DB) |
| GET | `/api/jobs` | List job applications |
| POST | `/api/jobs/[id]/generate` | Generate resume + cover letter |
| DELETE | `/api/jobs/[id]/documents` | Delete generated documents |
| POST | `/api/admin/auth` | Admin login |
| GET/PUT | `/api/admin/config` | Read/write admin config |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET/POST | `/api/admin/skip-rules` | CRUD skip rules |
| GET/POST | `/api/admin/profiles` | CRUD user profiles |
| GET | `/api/admin/logs` | Scan & generation logs |
| POST | `/api/admin/sheets-sync` | Full sync to Google Sheets |
| POST | `/api/admin/scanners/run` | Trigger manual scan |

## Keep-Alive

To prevent Render and Supabase from pausing due to inactivity:
1. Set up [UptimeRobot](https://uptimerobot.com) (free) to ping `/api/health` every 14 minutes
2. The health endpoint pings Supabase, keeping both services active

## Scanner Scripts (Local Only)

```bash
npm run jobright:scan       # Scan Jobright
npm run ziprecruiter:scan   # Scan ZipRecruiter
npm run glassdoor:scan      # Scan Glassdoor
npm run dice:scan           # Scan Dice
npm run simplify:scan       # Scan Simplify
```

Scanners require Playwright + Chromium and are meant for local use. Cloud scanning via the admin panel "Run Now" button is planned for future implementation.
