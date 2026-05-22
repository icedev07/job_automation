# Deployment & Configuration Guide

## Services used

| Service | Purpose | Free? | Billing required? |
|---------|---------|-------|-------------------|
| Vercel | hosts the Next.js web app | yes, free tier | **no card required** |
| Supabase | PostgreSQL database | yes, free tier | no card required |
| Google Sheets API | output approved jobs | yes, completely free | no card required |
| Google Cloud service account | authenticates Sheets API | yes, completely free | no billing required |
| Google Gemini API | AI job analysis (rotation provider) | **yes, free** | **no card required** |
| Groq API | AI job analysis (rotation provider) | **yes, free** | **no card required** |
| Cerebras API | AI job analysis (rotation provider) | **yes, free** | **no card required** |
| OpenRouter API | AI job analysis (rotation provider) | **yes, free** | **no card required** |
| Cloudflare Workers AI | AI job analysis (rotation provider) | **yes, free** (10k Neurons/day) | **no card required** |

**Every service is 100% free and needs no credit card.** In Settings you tick one or more AI providers; the analyzer rotates across the ticked set and automatically fails over when one hits its rate limit.

---

## Step 1: Set up Supabase (database)

1. Go to https://supabase.com and create a free account
2. Click "New project"
3. Choose a name (e.g. `job-finder`), set a database password (use only letters and numbers, avoid special characters like `@!#`), pick a region
4. Wait for the project to be created (1-2 minutes)
5. Click the green **Connect** button at the top of the dashboard
6. Click the **Direct** tab
7. Under **Connection Method**, select **Session pooler**
8. Set **Type** to **URI**
9. Copy the connection string. It looks like:
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-[n]-[region].pooler.supabase.com:5432/postgres
   ```
10. Replace `[YOUR-PASSWORD]` with the database password you set
11. Save this. You'll need it as `DATABASE_URL`

**Important**: use port `5432` (session pooler), NOT `6543` (transaction pooler). The session pooler is required for Prisma to work correctly with Vercel.

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

## Step 3: Get your AI API keys

In Settings you tick the AI providers the analyzer may use; it rotates across the ticked set and automatically fails over when one hits a rate limit. Grab as many of the free keys below as you can; each is optional and the rotation uses whatever you configure. One key is enough to start, but more keys means more daily headroom and the scanner and LinkedIn extension never block each other.

### Google Gemini (free, no card)

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key" and copy it

Large context window — best for the scanner's batched analysis.

### Groq (free, no card)

1. Go to https://console.groq.com/keys
2. Sign in, create an API key, and copy it

Very fast — great for the LinkedIn extension. Optional: skip it if signup is not available for you.

### Cerebras (free, no card)

1. Go to https://cloud.cerebras.ai
2. Sign in, open the API Keys page, create a key and copy it

1,000,000 tokens/day — great for the LinkedIn extension.

### OpenRouter (free, no card)

1. Go to https://openrouter.ai/settings/keys
2. Create a free key and copy it

Aggregator fallback across many free models.

### Cloudflare Workers AI (free, no card)

1. Go to https://dash.cloudflare.com and sign up (no credit card required)
2. Copy your **Account ID** — it is in the URL after `dash.cloudflare.com/` and on
   the Workers & Pages overview page
3. Go to **AI > Workers AI**, click **Use REST API**, and create an API token
4. Save both the Account ID and the token — the analyzer needs both

Free allocation is 10,000 Neurons/day (several thousand analyses).

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

### Create database tables

After the first deploy, visit this URL once in your browser:

```
https://your-project.vercel.app/api/setup
```

You should see `{"status":"success","message":"All tables created successfully."}`. This creates all the required database tables automatically.

Alternatively, run migrations from your local machine:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

---

## Step 5: Configure the admin panel

Go to `/admin/settings` and fill in:

### Target Configuration
| Setting | Example value |
|---------|--------------|
| Target Market | `Europe, Eastern Europe, Remote worldwide` |
| Current Location | `Armenia` |

### AI Providers

Tick the providers you want in the **AI Providers** checklist and paste a key for each. Tick **one** for single-provider mode, or **several** to rotate across them — the analyzer fails over automatically when one is rate-limited. A ticked provider with no key is simply skipped. Click **Test All Selected Providers** to verify.

| Provider | Credentials | Where to get it |
|----------|-------------|-----------------|
| Gemini | `AIzaSy...` | aistudio.google.com/apikey |
| Groq | `gsk_...` | console.groq.com/keys |
| Cerebras | `csk-...` | cloud.cerebras.ai |
| OpenRouter | `sk-or-v1-...` | openrouter.ai/settings/keys |
| Cloudflare | Account ID + API token | dash.cloudflare.com |

The model defaults (`gemini-2.5-flash`, `llama-3.1-8b-instant`, `llama-3.3-70b`, Cloudflare `@cf/meta/llama-3.1-8b-instruct`) work out of the box and are editable in Settings.

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

Nothing extra to do. Each scan checks every job with AI inline, stores only the suitable / not-suitable results, and syncs approved ones to Google Sheets in the same run. The **Analyze Pending Jobs** button is only a fallback for clearing leftovers (a rescan reset, or a pre-upgrade backlog) and normally shows `0`.

---

## How deduplication works

| Layer | What it prevents | How |
|-------|-----------------|-----|
| URL dedup | same job URL scraped twice | normalized URL check before saving |
| Title+company dedup | same job on same platform | exact match before saving |
| Cross-platform dedup | same job on Dice AND LinkedIn | normalized title+company match across all platforms |
| Analysis dedup | analyzing a job already analyzed | a feed scan looks each job up first and analyzes only genuinely new ones |
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

**Cannot log in to `/admin` with password `admin`**
- Make sure database tables exist: visit `/api/setup` first (see Step 4).
- If you see "database may be unreachable", your `DATABASE_URL` is wrong. Use the Supabase **session pooler** URI (port `5432`, see Step 1).
- You can set `ADMIN_PASSWORD=admin` as an environment variable on Vercel to bypass the database for login.
- A `503` error from `/api/admin/auth` in the Network tab means the app cannot reach Postgres, not a wrong password.

**Vercel function timeout**
- Free tier has a 10-second limit on serverless functions.
- AI analysis usually takes 2-6 seconds, so it should work fine.
- If timeouts occur, prefer the fast providers (Cerebras, Groq) in the rotation.

**Supabase database is paused**
- Supabase pauses free databases after 1 week of inactivity.
- Set up the cron job from Step 1 to prevent this.

**Scanner fails with "context directory not found"**
- Run the init script first: `npm run <platform>:init`
- Log in manually in the browser that opens

**"API key not configured" or 429 quota error**
- Go to `/admin/settings`, tick several providers in the **AI Providers** checklist, and add a key for each — the rotation fails over automatically when one is rate-limited.
- The more providers you tick and key (Gemini, Groq, Cerebras, OpenRouter, Cloudflare), the more daily headroom you get.
- If every provider is rate-limited at once, the scan stops checking jobs — unchecked jobs are simply not stored and are re-fetched and retried on the next scan, never wrongly rejected.

**Gemini: `Error fetching from https://generativelanguage.googleapis.com`**
- In Settings set the model to **`gemini-1.5-flash`** and save (newer model names are not always available for every key or region).
- Create a fresh key at https://aistudio.google.com/apikey and paste it again.
- After fixing, just run the scanners again — each scan re-fetches and checks any jobs missed earlier.

**Duplicate lines in the extension activity log**
- Reload the extension after update: `chrome://extensions` then reload "LinkedIn Job Scanner" (background relay was removed).

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
