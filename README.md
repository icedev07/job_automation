# Job Finder

Automated job finder for Armenian developers targeting European and remote positions.

Scrapes jobs from multiple platforms, uses AI to filter for suitability, and pushes approved jobs to Google Sheets. Everything is configurable from the admin panel.

## How it works

1. **Scrape** - Playwright-based scanners collect jobs from 5 platforms (Jobright, ZipRecruiter, Glassdoor, Dice, Simplify)
2. **Analyze** - Each scraped job is sent to OpenAI for suitability analysis (remote-friendly? accessible from Armenia? etc.)
3. **Approve/Reject** - Jobs that pass the AI filter get status `APPROVED`, others get `REJECTED`
4. **Sync** - Approved jobs are pushed to a Google Sheet with configurable columns

## Architecture

```
Admin Panel (/admin)
    |
    v
+-------------------+       +-----------+
| Next.js App       |------>| OpenAI    |
| (Render free)     |       | API       |
|                   |       +-----------+
| - Scanner scripts |
| - AI analyzer     |------>+---------------+
| - Admin panel     |       | Google Sheets |
| - Job listing UI  |       +---------------+
+-------------------+
    |
    v
+-------------------+
| PostgreSQL        |
| (Supabase free)   |
+-------------------+
```

## Services (all free tier)

| Service | Purpose |
|---------|---------|
| Render | Host the Next.js web app |
| Supabase | PostgreSQL database |
| Google Sheets API | Output approved jobs |
| OpenAI API | AI job analysis (user-provided key) |

## Quick start

```bash
# 1. Clone and install
npm install

# 2. Set up database
cp .env.example .env
# Edit .env with your Supabase DATABASE_URL

# 3. Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000/admin
# Default password: admin
# Configure: OpenAI key, Google Sheets, target market, etc.
```

## Admin panel

| Page | Purpose |
|------|---------|
| Dashboard | Stats overview, sync to Google Sheets |
| Settings | OpenAI key, Google Sheets, target market, location, AI prompt, columns |
| Scanners | Enable/disable platforms, set search URLs, run scans, analyze pending jobs |
| Skip Rules | Block jobs by company, title keyword, or URL pattern |
| Logs | View scan history and AI analysis logs |

## Running scanners

Scanners require a browser (Playwright + Chrome) so they run locally, not on Render.

```bash
# First-time login (opens browser for manual login)
npm run jobright:login
npm run ziprecruiter:init
npm run glassdoor:init
npm run dice:init
npm run simplify:init

# Run scans
npm run jobright:scan
npm run ziprecruiter:scan
npm run glassdoor:scan
npm run dice:scan
npm run simplify:scan
```

After scanning, go to `/admin/scanners` and click **Analyze Pending Jobs** to run AI analysis and auto-sync approved jobs to Google Sheets.

## Google Sheet output columns (default)

| Title | Company | Location | URL | Source | AI Score | Tech Stack | Salary | Date Found |
|-------|---------|----------|-----|--------|----------|------------|--------|------------|

Columns are configurable from `/admin/settings`.

## Database schema

- **ScrapedJob** - every job found by scanners (pending/approved/rejected)
- **AppConfig** - key/value settings store
- **SkipRule** - company/title/url block rules
- **ScanLog** - scan history
- **AnalysisLog** - AI analysis results per job

## Deploy to Render

1. Push to GitHub
2. Connect repo in Render dashboard
3. Render uses `render.yaml` for configuration
4. Set `DATABASE_URL` env var to your Supabase connection string
5. Configure everything else from `/admin/settings`

## Environment variables

Only `DATABASE_URL` is required. Everything else is configured from the admin panel.

```
DATABASE_URL=postgresql://...
NODE_ENV=production
```
