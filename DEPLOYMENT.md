# Deployment & Configuration Guide

## Services used

| Service | Purpose | Free? | Billing required? |
|---------|---------|-------|-------------------|
| Vercel | hosts the Next.js web app | yes, free tier | **no card required** |
| Supabase | PostgreSQL database | yes, free tier | no card required |
| Google Sheets API | output approved jobs | yes, completely free | no card required |
| Google Cloud service account | authenticates Sheets API | yes, completely free | no billing required |
| OpenAI API | AI job analysis | **paid, per-token** | uses your own API key, ~$0.01 per job with gpt-4o-mini |

OpenAI is the only paid service. All infrastructure is 100% free with no credit card required.

---

## Step 1: Set up Supabase (database)

1. Go to https://supabase.com and create a free account
2. Click "New project"
3. Choose a name (e.g. `job-finder`), set a database password, pick a region
4. Wait for the project to be created (1-2 minutes)
5. Click the green **Connect** button at the top of the dashboard
6. Click the **Direct** tab
7. Copy the connection string URI. It looks like:
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
8. Replace `[YOUR-PASSWORD]` with the database password you set
9. Save this. You'll need it as `DATABASE_URL`

### Keep Supabase alive

Supabase free tier pauses databases after 1 week of inactivity. The app has a `/api/health` endpoint that pings the database. Set up a free cron job to call it:

1. Go to https://cron-job.org (free, no card required)
2. Create a job: URL = `https://your-app.vercel.app/api/health`, schedule = every 10 minutes
3. This keeps Supabase active

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
3. Create two sheet tabs: `Jobs` and `LinkedIn`
4. Click **Share** and add the `client_email` from step 12 above with **Editor** access
5. Copy the spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/`**THIS_PART**`/edit`

---

## Step 3: Get your OpenAI API key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and save it

---

## Step 4: Deploy to Vercel

1. Push the code to a GitHub repository
2. Go to https://vercel.com and sign in with GitHub (free, no card needed)
3. Click **Add New > Project**
4. Import your GitHub repository
5. Vercel auto-detects Next.js. Leave the default settings.
6. Under **Environment Variables**, add:
   - `DATABASE_URL` = your Supabase connection string from Step 1
7. Click **Deploy**

### First deploy takes 2-3 minutes. After it's live:

1. Open `https://your-project.vercel.app`
2. You'll see the job listing page (empty)
3. Go to `https://your-project.vercel.app/admin`
4. Login with password: `admin` (change it in settings)

### Run database migrations

After the first deploy, run migrations to create the database tables:

```bash
# on your local machine, with the same DATABASE_URL
npm install
npx prisma generate
npx prisma migrate deploy
```

Set the "Build Command" in Vercel project settings to:
```
npx prisma generate && next build
```

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

### LinkedIn Extension
| Setting | Value |
|---------|-------|
| LinkedIn Sheet Tab | `LinkedIn` (or any name you prefer for the tab) |
| Extension API Key | set a secret key for the Chrome extension (optional) |

### Admin
| Setting | Value |
|---------|-------|
| Admin Password | change from `admin` to something secure |

Click **Save All Settings**.

---

## Step 6: Install the Chrome Extension

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension/` folder from this project
5. The extension icon appears in your toolbar

### Configure the extension

1. Open `extension/popup.js` in a text editor
2. Change `SERVER_URL` on line 1 to your Vercel URL:
   ```js
   const SERVER_URL = "https://your-project.vercel.app";
   ```
3. Reload the extension in `chrome://extensions`
4. (Optional) Click the extension icon and enter your Extension API Key

### How to use

1. Go to https://www.linkedin.com/jobs/search/ and search for jobs
2. Click the extension icon
3. Click **Start Scan**
4. The extension will check every job on the page, send it to your server for AI analysis, hide unsuitable jobs, and save approved jobs to Google Sheets

---

## Step 7: Run scanners locally (optional)

Scanners require a browser (Playwright + Chrome) so they run on your local machine.

### First-time setup

```bash
git clone <your-repo-url>
cd job_automation
npm install

# create .env file
cp .env.example .env
# edit .env and set DATABASE_URL to your Supabase connection string

npx prisma generate

# one-time browser login for each platform
npm run jobright:login
npm run ziprecruiter:init
npm run glassdoor:init
npm run dice:init
npm run simplify:init
```

### Run scans

```bash
npm run jobright:scan
npm run ziprecruiter:scan
npm run glassdoor:scan
npm run dice:scan
npm run simplify:scan
```

### After scanning

1. Go to `/admin/scanners` in the web UI
2. Click **Analyze Pending Jobs**
3. The AI analyzes each job and automatically syncs approved ones to Google Sheets

---

## How deduplication works

| Layer | What it prevents | How |
|-------|-----------------|-----|
| URL dedup | same job URL scraped twice | normalized URL check before saving |
| Title+company dedup | same job on same platform | exact match before saving |
| Cross-platform dedup | same job on Dice AND LinkedIn | normalized title+company match across all platforms |
| Analysis dedup | analyzing a job already analyzed | only PENDING jobs are analyzed, atomic status check |
| Sheet sync dedup | syncing same job to sheet twice | `sheetSynced` flag |
| Skip rules | unwanted companies/titles/URLs | checked before saving, configurable from admin |

Once a job is analyzed (approved or rejected), it **never gets analyzed again** even if found again in a future scan.

---

## Google Sheet output

### "Jobs" tab (from scanners)

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

### "LinkedIn" tab (from Chrome extension)

| Column | Description |
|--------|------------|
| No | row number |
| Date | date found (YYYY-MM-DD) |
| Platform | always "LinkedIn" |
| Job Url | LinkedIn job URL |
| Company | company name |
| Country | location/country |
| Role | job title |
| Url | same as Job Url |

---

## Troubleshooting

**Vercel function timeout**
- Free tier has a 10-second limit on serverless functions.
- AI analysis with `gpt-4o-mini` usually takes 3-8 seconds, so it should work fine.
- If timeouts occur, make sure you're using `gpt-4o-mini` (faster than gpt-4o).

**Supabase database is paused**
- Supabase pauses free databases after 1 week of inactivity.
- Set up the cron job from Step 1 to prevent this.

**Scanner fails with "context directory not found"**
- Run the init script first: `npm run <platform>:init`
- Log in manually in the browser that opens

**"OpenAI API key not configured"**
- Go to `/admin/settings` and enter your API key

**Google Sheets not updating**
- Make sure the sheet tabs are named `Jobs` and `LinkedIn`
- Make sure the service account email has Editor access to the sheet
- Check that the Sheet ID is correct (from the URL)

**Chrome extension not connecting**
- Make sure `SERVER_URL` in `popup.js` matches your Vercel URL
- Check that you're on a LinkedIn jobs search page
- If using an API key, make sure it matches what's in `/admin/settings`

**Jobs are being analyzed twice**
- This should not happen. The system only analyzes PENDING jobs with an atomic status check. If you see duplicates, check `/admin/logs`.
