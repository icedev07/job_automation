# Job Application Bot

Automated job scraping, tracking, and tailored resume/cover letter generation — designed to run **24/7** as a set of Docker services.

## Architecture

```
┌─────────────┐     ┌────────────────┐     ┌─────────────────┐
│  PostgreSQL  │◄────│   Web (Next.js) │     │   Scanner       │
│  (database)  │◄────│   UI + API      │     │   (cron jobs)   │
└──────┬───────┘     └────────────────┘     └────────┬────────┘
       │                                             │
       │             ┌────────────────┐              │
       └─────────────│   DocGen       │──────────────┘
                     │   (backfill)   │
                     └────────┬───────┘
                              │
                     ┌────────▼───────┐
                     │  PDF Converter │
                     │   (watch)      │
                     └────────────────┘
```

| Service | Purpose | Runs as |
|---|---|---|
| **postgres** | PostgreSQL 16 database | Container (persistent volume) |
| **web** | Next.js 14 app — job table UI + REST API | Container on port 3000 |
| **scanner** | Scrapes job boards on cron schedules (Jobright, ZipRecruiter, Glassdoor, Dice, Simplify) | Container with cron |
| **docgen** | Polls DB for jobs needing docs, generates tailored resume + cover letter via ChatGPT UI | Container (long-running) |
| **pdf-converter** | Watches for new `.docx` files and converts to PDF via LibreOffice | Container (long-running) |

## Quick Start (Docker — recommended for 24/7)

### 1. Clone and configure

```bash
git clone <your-repo-url> job-bot
cd job-bot
cp .env.example .env
```

Edit `.env` — at minimum set:

```env
POSTGRES_PASSWORD=your_strong_password
JOBRIGHT_CONTEXT_DIR=~/.jobbot/jobright
```

### 2. Start all services

```bash
docker compose up -d --build
```

This starts PostgreSQL, runs migrations, then launches the web app, scanner, docgen worker, and PDF converter.

### 3. Open the UI

Go to **http://localhost:3000/jobs** to view the job table.

### 4. View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f scanner
docker compose logs -f docgen
```

### 5. Stop

```bash
docker compose down        # Stop (keep data)
docker compose down -v     # Stop and delete volumes (reset everything)
```

## Local Development (without Docker)

### Prerequisites

- **Node.js 20+**
- **PostgreSQL** (local or remote)
- **Python 3.12+** (optional — for SeleniumBase scripts and PDF conversion)

### 1. Install dependencies

```bash
npm install
npx playwright install chromium
```

For Python scripts:

```bash
pip install -r requirements-seleniumbase.txt  # SeleniumBase (ChatGPT, ZipRecruiter)
pip install -r requirements-pdf.txt           # PDF conversion
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and other settings
```

### 3. Set up database

```bash
# Create the database
createdb jobbot

# Run migrations
npx prisma migrate dev

# (Optional) Create profile users
npm run profiles:ensure

# (Optional) Add base resume
npm run resume:setup
```

### 4. Start the dev server

```bash
npm run dev
```

Open **http://localhost:3000/jobs**.

### 5. Run scanners manually

```bash
# Log in to Jobright first (one-time)
npm run jobright:login

# Scan jobs
npm run jobright:scan

# Other boards (log in first with :init, then :scan)
npm run dice:init
npm run dice:scan
```

### 6. Generate documents

```bash
# One-shot: generate docs for all jobs missing them
npm run docs:backfill

# Watch mode: continuously poll and generate
npm run docs:backfill:watch

# SeleniumBase backfill (bypasses Cloudflare)
npm run chatgpt:backfill
```

### 7. Convert DOCX to PDF

```bash
# One-shot
npm run convert:pdf Resumes

# Watch mode
npm run convert:watch
```

## npm Scripts Reference

### Core

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

### Database

| Script | Description |
|---|---|
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Apply migrations (production) |
| `npm run prisma:migrate:dev` | Create/apply migrations (development) |
| `npm run prisma:studio` | Open Prisma Studio GUI |

### Scanners

| Script | Description |
|---|---|
| `npm run jobright:login` | Log in to Jobright (one-time browser session) |
| `npm run jobright:scan` | Scan Jobright recommended board |
| `npm run ziprecruiter:init` | Init ZipRecruiter session |
| `npm run ziprecruiter:scan` | Scan ZipRecruiter |
| `npm run glassdoor:init` | Init Glassdoor session |
| `npm run glassdoor:scan` | Scan Glassdoor |
| `npm run dice:init` | Log in to Dice |
| `npm run dice:scan` | Scan Dice |
| `npm run simplify:init` | Log in to Simplify |
| `npm run simplify:scan` | Scan Simplify |

### Document Generation

| Script | Description |
|---|---|
| `npm run docs:backfill` | Generate docs for all jobs missing resume/cover letter |
| `npm run docs:backfill:watch` | Watch mode — continuously poll DB and generate |
| `npm run chatgpt:backfill` | SeleniumBase backfill (Cloudflare bypass) |
| `npm run docs:reset-user` | Reset generated documents for a user |

### PDF Conversion

| Script | Description |
|---|---|
| `npm run convert:pdf` | One-shot DOCX to PDF conversion |
| `npm run convert:watch` | Watch mode — poll for new DOCX and convert |

### Maintenance

| Script | Description |
|---|---|
| `npm run profiles:ensure` | Create profile users in DB |
| `npm run resume:setup` | Add base resume to DB |
| `npm run cache:clean` | Clean browser profile caches (~/.jobbot) |
| `npm run jobdesc:cleanup-bad` | Remove malformed job descriptions |

### Docker

| Script | Description |
|---|---|
| `npm run docker:up` | Build and start all services |
| `npm run docker:down` | Stop all services |
| `npm run docker:logs` | Follow logs from all services |
| `npm run docker:ps` | Show service status |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/jobs` | List job applications |
| `POST` | `/api/jobs` | Create job manually |
| `GET` | `/api/jobs/:id` | Get single job |
| `PATCH` | `/api/jobs/:id` | Update job |
| `DELETE` | `/api/jobs/:id` | Delete job + files |
| `GET` | `/api/jobs/:id/description` | Get job description |
| `PATCH` | `/api/jobs/:id/description` | Update job description |
| `POST` | `/api/jobs/:id/generate` | Generate tailored resume + cover letter |
| `DELETE` | `/api/jobs/:id/documents` | Delete generated documents |
| `POST` | `/api/scan` | Trigger Jobright scan |
| `GET` | `/api/resumes` | List resumes |
| `POST` | `/api/resumes` | Create resume |
| `GET` | `/api/one-click-jobs` | List one-click/easy-apply jobs |
| `POST` | `/api/one-click-jobs` | Create one-click job |
| `POST` | `/api/one-click-jobs/batch-delete` | Bulk delete |

## Database Schema

```
User ─────┬── JobApplication ──── JobDescription
          │        ├──────────── TailoredResume
          │        └──────────── CoverLetter
          ├── Resume
          ├── OneClickJob
          └── AutomationRun
```

Key models:
- **JobApplication** — scraped job with title, company, source, URLs, match score, status
- **OneClickJob** — easy-apply listings (ZipRecruiter, Simplify) stored separately
- **TailoredResume / CoverLetter** — LLM-generated output linked to a job

## Resume Templates

Place your templates in `Resumes/Templates/`:

| File | Purpose |
|---|---|
| `*_Sample.docx` | Full base resume text (source content for tailoring) |
| `*.docx` (styled) | Resume template with Docxtemplater placeholders |
| `Cover Letter.docx` | Cover letter template with `{coverletterContent}` placeholder |

## Environment Variables

See `.env.example` for the full list with descriptions. Key groups:

- **Database** — `DATABASE_URL`, `POSTGRES_*`
- **Scanner** — `JOBRIGHT_CONTEXT_DIR`, `MAX_JOBS`, `MATCH_SCORE_THRESHOLD`, `*_SEARCH_URL`
- **Cron schedules** — `CRON_JOBRIGHT`, `CRON_ZIPRECRUITER`, etc.
- **Document generation** — `BACKFILL_POLL_INTERVAL_SEC`, `RESUMES_OUTPUT_DIR`, `RESUME_*_PATH`
- **ChatGPT** — `CHATGPT_CONTEXT_DIR`, `CHATGPT_COOKIES_FILE`
- **PDF** — `DOCX_PDF_WATCH_POLL_SECONDS`, `DOCX_PDF_SUBDIR_WITHIN_DAYS`

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/                # REST API route handlers
│   │   ├── health/         # Health check
│   │   ├── jobs/           # Job CRUD + generate + description
│   │   ├── one-click-jobs/ # Easy-apply job CRUD
│   │   ├── resumes/        # Resume CRUD
│   │   └── scan/           # Trigger scanner
│   ├── jobs/               # /jobs page + JobsTable component
│   ├── one-click-jobs/     # /one-click-jobs page
│   └── components/         # Layout shell
├── lib/                    # Shared domain logic
│   ├── prisma.ts           # Prisma singleton
│   ├── jobApplications.ts  # Job upsert logic
│   ├── jobDuplicateDetection.ts
│   ├── jobSkipRules.ts     # Title/company/URL blocklists
│   ├── oneClickJobs.ts     # OneClickJob upsert
│   ├── generateDocuments.ts # Orchestrates doc generation
│   ├── chatgptUiClient.ts  # ChatGPT web UI automation (Playwright)
│   ├── documentGenerator.ts # DOCX assembly
│   └── templateProcessor.ts # Mammoth + Docxtemplater
├── scripts/                # CLI scanners and utilities
│   ├── jobrightScan.ts     # Jobright scanner
│   ├── ziprecruiterScan.ts # ZipRecruiter scanner
│   ├── glassdoorScan.ts    # Glassdoor scanner
│   ├── diceScan.ts         # Dice scanner
│   ├── simplifyScan.ts     # Simplify scanner
│   ├── backfillWatch.ts    # Doc generation watch loop
│   ├── convertDocxToPdf.py # DOCX→PDF converter
│   └── ...                 # Login, setup, maintenance scripts
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # SQL migrations
├── docker/                 # Dockerfiles and entrypoints
│   ├── web.Dockerfile
│   ├── scanner.Dockerfile
│   ├── scanner-entrypoint.sh
│   ├── docgen.Dockerfile
│   └── pdf.Dockerfile
├── docker-compose.yml      # Full service orchestration
├── .env.example            # All environment variables documented
├── requirements-pdf.txt    # Python deps for PDF conversion
└── requirements-seleniumbase.txt  # Python deps for SeleniumBase scripts
```

## License

Private / personal use.
