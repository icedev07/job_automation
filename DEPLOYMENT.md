# Deployment & Configuration Guide

## Services used

| Service | Purpose | Free? | Notes |
|---------|---------|-------|-------|
| Render | hosts the Next.js web app | yes, free tier | 750 hrs/month, auto-sleep after 15min inactivity |
| Supabase | PostgreSQL database | yes, free tier | 500 MB storage, 2 projects, pauses after 1 week inactivity |
| Google Sheets API | output approved jobs | yes, completely free | no quota limits for typical usage |
| Google Cloud service account | authenticates Sheets API | yes, completely free | no billing required |
| OpenAI API | AI job analysis | **paid, per-token** | uses your own API key, ~$0.01 per job with gpt-4o-mini |

OpenAI is the only paid service. All infrastructure is free.

---

## Step 1: Set up Supabase (database)

1. Go to https://supabase.com and create a free account
2. Click "New project"
3. Choose a name (e.g. `job-finder`), set a database password, pick a region
4. Wait for the project to be created (1-2 minutes)
5. Go to **Settings > Database > Connection string > URI**
6. Copy the connection string. It looks like:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
7. Replace `[password]` with the password you set
8. Save this. You'll need it as `DATABASE_URL`

### Keep Supabase alive

Supabase free tier pauses databases after 1 week of inactivity. The app has a `/api/health` endpoint that pings the database. Set up a free cron job to call it:

1. Go to https://cron-job.org (free account)
2. Create a job: URL = `https://your-render-app.onrender.com/api/health`, schedule = every 10 minutes
3. This keeps both Render and Supabase active

---

## Step 2: Set up Google Sheets API

### Create a Google Cloud service account (free, no billing required)

1. Go to https://console.cloud.google.com
2. Create a new project (e.g. `job-finder`)
3. Go to **APIs & Services > Enable APIs**
4. Search for "Google Sheets API" and enable it
5. Go to **APIs & Services > Credentials**
6. Click **Create credentials > Service account**
7. Name it (e.g. `job-finder-sheets`), click Create
8. Skip the optional permissions steps, click Done
9. Click on the service account you just created
10. Go to **Keys > Add Key > Create new key > JSON**
11. Download the JSON file. This is your credentials file
12. **Important**: copy the `client_email` from the JSON (looks like `xxx@xxx.iam.gserviceaccount.com`)

### Create and share the Google Sheet

1. Go to https://docs.google.com/spreadsheets and create a new spreadsheet
2. Name it (e.g. `Job Finder Results`)
3. Rename the first sheet tab to `Jobs` (important, the app writes to this tab)
4. Click **Share** and add the `client_email` from step 12 above with **Editor** access
5. Copy the spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/`**THIS_PART**`/edit`

---

## Step 3: Get your OpenAI API key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and save it

---

## Step 4: Deploy to Render

### Option A: deploy via Render dashboard

1. Push the code to a GitHub repository
2. Go to https://render.com and sign in
3. Click **New > Web Service**
4. Connect your GitHub repo
5. Render will detect `render.yaml` and auto-configure:
   - Build command: `npm ci && npx prisma generate && npm run build`
   - Start command: `npx prisma migrate deploy && node .next/standalone/server.js`
   - Plan: Free
6. Add environment variable:
   - `DATABASE_URL` = your Supabase connection string from step 1
7. Click **Deploy**

### Option B: deploy via Render Blueprint

1. Push to GitHub
2. Go to https://render.com/deploy and paste your repo URL
3. Render reads `render.yaml` and sets everything up
4. Set `DATABASE_URL` when prompted

### First deploy takes 3-5 minutes. After it's live:

1. Open `https://your-app.onrender.com`
2. You'll see the job listing page (empty)
3. Go to `https://your-app.onrender.com/admin`
4. Login with password: `admin` (change it in settings)

---

## Step 5: Configure the admin panel

Go to `/admin/settings` and fill in:

### Target Configuration
| Setting | Example value |
|---------|--------------|
| Target Market | `Europe, Eastern Europe, Remote worldwide` |
| Current Location | `Armenia` |

### OpenAI API
| Setting | Value |
|---------|-------|
| API Key | `sk-...` (your key from step 3) |
| Model | `gpt-4o-mini` (cheapest, recommended) |

### Google Sheets
| Setting | Value |
|---------|-------|
| Google Sheet ID | the spreadsheet ID from step 2 |
| Service Account JSON | paste the **entire** JSON key file content |
| Sheet Columns | leave blank for defaults |

### Admin
| Setting | Value |
|---------|-------|
| Admin Password | change from `admin` to something secure |

Click **Save All Settings**.

---

## Step 6: Run scanners (locally)

Scanners require a browser (Playwright + Chrome) so they run on your local machine, not on Render.

### First-time setup

```bash
# clone the repo
git clone <your-repo-url>
cd job_automation

# install dependencies
npm install

# create .env file
cp .env.example .env
# edit .env and set DATABASE_URL to your Supabase connection string

# generate prisma client
npx prisma generate

# one-time browser login for each platform
npm run jobright:login
npm run ziprecruiter:init
npm run glassdoor:init
npm run dice:init
npm run simplify:init
```

Each init command opens Chrome for you to manually log in. After logging in, close the browser. The session is saved locally.

### Run scans

```bash
npm run jobright:scan
npm run ziprecruiter:scan
npm run glassdoor:scan
npm run dice:scan
npm run simplify:scan
```

You can enable/disable individual platforms from `/admin/scanners`.

### After scanning

1. Go to `/admin/scanners` in the web UI
2. You'll see "X jobs pending AI analysis"
3. Click **Analyze Pending Jobs**
4. The AI analyzes each job and automatically syncs approved ones to Google Sheets
5. Check your Google Sheet for results

---

## How deduplication works

This is critical for avoiding wasted time and API costs:

| Layer | What it prevents | How |
|-------|-----------------|-----|
| Scanner URL dedup | same job URL scraped twice on same platform | normalized URL check before saving |
| Scanner title dedup | same job title+company on same platform | exact match before saving |
| Cross-platform dedup | same job posted on Dice AND Glassdoor | normalized title+company match across all platforms |
| Analysis dedup | analyzing a job that was already analyzed | only `PENDING` jobs are analyzed, status checked before each API call |
| Sheet sync dedup | syncing same job to sheet twice | `sheetSynced` flag, only `false` jobs are synced |
| Skip rules | unwanted companies/titles/URLs | checked before saving, configurable from admin |

Once a job is analyzed (approved or rejected), it **never gets analyzed again** even if the scanner finds it again in a future run.

---

## Google Sheet output

Default columns (configurable from settings):

| Column | Description |
|--------|------------|
| Title | job title |
| Company | company name |
| Location | job location |
| URL | link to apply |
| Source | which platform found it |
| AI Score | suitability score 0-100 |
| Tech Stack | technologies mentioned |
| Salary | salary if found |
| Date Found | when it was scraped |

---

## Admin panel pages

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin` | stats overview, manual sheet sync button |
| Settings | `/admin/settings` | all configuration in one place |
| Scanners | `/admin/scanners` | enable/disable platforms, run analysis |
| Skip Rules | `/admin/skip-rules` | block companies, titles, URLs |
| Logs | `/admin/logs` | scan history and AI analysis logs |

---

## Project structure

```
job_automation/
  app/
    admin/          # admin panel pages
    api/            # API routes
    page.tsx        # main job listing page
    layout.tsx      # root layout
  lib/
    config.ts       # app configuration
    jobAnalyzer.ts  # AI job analysis
    scrapedJobs.ts  # job CRUD with dedup
    googleSheetsSync.ts  # sheets integration
    jobSkipRules.ts # skip rule engine
    llmClient.ts    # OpenAI client
    prisma.ts       # database client
  prisma/
    schema.prisma   # database schema
    migrations/     # migration history
  scripts/
    *Scan.ts        # 5 scanner scripts
    *Init.ts        # 5 browser login scripts
  render.yaml       # Render deployment config
  package.json
```

---

## Troubleshooting

**Render app is sleeping / slow first load**
- Render free tier sleeps after 15 min of inactivity. First request takes ~30s to wake up.
- Set up a cron job (see Step 1) to keep it alive.

**Supabase database is paused**
- Supabase pauses free databases after 1 week of inactivity.
- The `/api/health` endpoint pings the database. Use a cron job to call it regularly.

**Scanner fails with "context directory not found"**
- Run the init script first: `npm run <platform>:init`
- Log in manually in the browser that opens

**"OpenAI API key not configured"**
- Go to `/admin/settings` and enter your API key

**Google Sheets not updating**
- Make sure the sheet tab is named `Jobs`
- Make sure the service account email has Editor access to the sheet
- Check that the Sheet ID is correct (from the URL)

**Jobs are being analyzed twice**
- This should not happen. The system only analyzes `PENDING` jobs and checks status before each API call. If you see duplicates, check the logs at `/admin/logs`.
