# Job Finder

Automated job finder for Armenian developers targeting European and remote positions.

Scrapes jobs from multiple platforms, uses AI to filter for suitability, and pushes approved jobs to Google Sheets. Includes a Chrome extension for LinkedIn scanning. Everything is configurable from the admin panel.

## How it works

1. **Scrape** - Server-side feeds collect jobs from public job-board APIs / RSS / SSR payloads, plus an authenticated aggregator (MyGreenhouse). The Chrome extension separately scans LinkedIn search results.
2. **Analyze** - Each job is sent to AI (Gemini free or OpenAI) for suitability analysis (remote-friendly? accessible from Armenia? etc.)
3. **Approve/Reject** - Jobs that pass the AI filter get status `APPROVED`, others get `REJECTED`
4. **Sync** - Approved jobs are pushed to Google Sheets
5. **Hide** - On LinkedIn, rejected and Easy Apply jobs are automatically hidden

## Job sources

All sources below are free for applicants. Each is configurable from `/admin/scanners` (search params, max jobs, enabled/disabled).

| Key | Source | Auth | Notes |
|---|---|---|---|
| `remoteok` | [RemoteOK](https://remoteok.com) | none | public JSON feed |
| `jobicy` | [Jobicy](https://jobicy.com) | none | v2 JSON API; supports tag/jobGeo filters |
| `landingjobs` | [Landing.Jobs](https://landing.jobs) | none | EU-leaning developer API |
| `weworkremotely` | [We Work Remotely](https://weworkremotely.com) | none | RSS per category slug |
| `jobspresso` | [Jobspresso](https://jobspresso.co) | none | RSS at `/jobs/feed/` |
| `authenticjobs` | [Authentic Jobs](https://authenticjobs.com) | none | dev-leaning RSS |
| `nodesk` | [Nodesk](https://nodesk.co) | none | Atom feed |
| `justremote` | [JustRemote](https://justremote.co) | none | scraped from SSR payload (~10 jobs/page) |
| `greenhouse` | [Greenhouse boards](https://boards-api.greenhouse.io) | none | per-company public ATS API. Supports `@curated` to expand the bundled 540-slug list, or a comma-separated custom slug list. |
| `lever` | [Lever](https://api.lever.co) | none | per-company public API |
| `ashby` | [Ashby](https://api.ashbyhq.com/posting-api) | none | per-company public API |
| `mygreenhouse` | [MyGreenhouse candidate portal](https://my.greenhouse.io) | session cookie | aggregator across every employer opted into MyGreenhouse. See below. |

### MyGreenhouse session cookie

MyGreenhouse is a passwordless candidate portal aggregating every employer who opted in. There is no public API, so the scanner replays your browser session.

1. Sign in once at https://my.greenhouse.io (enter email, paste the one-time code from your inbox).
2. In your browser, open DevTools → **Application → Cookies → `https://my.greenhouse.io`**.
3. Copy the entire Cookie header value as the browser sends it (right-click any cookie → "Copy as cURL" and lift the `-H 'Cookie: …'` value, or build the string `_session_id=…; MYGREENHOUSE-XSRF-TOKEN=…`).
4. Paste it into the **MyGreenhouse session cookie** input at the top of `/admin/scanners`.
5. (Optional) Paste just the `MYGREENHOUSE-XSRF-TOKEN` value into the X-CSRF-Token field — only needed if scans start failing with 403.

The cookie lives ~14 days (Greenhouse sets `_session_id` with a 14-day Expires). When the scanner reports `session expired`, repeat steps 1–4.

### Bulk Greenhouse coverage without auth

For the public `greenhouse` scanner, type `@curated` in its search-params field. That expands to a bundled list of 540 Greenhouse company slugs scraped from the community [awesome-easy-apply](https://github.com/sample-resume/awesome-easy-apply) index. You can mix it with custom slugs:

```
@curated, mycompany, another-slug
```

## Architecture

```
Admin Panel (/admin)
    |
    v
+-------------------+       +-----------+
| Next.js App       |------>| Gemini or |
| (Vercel free)     |       | OpenAI API|
|                   |       +-----------+
| - Scanner scripts |
| - AI analyzer     |------>+---------------+
| - Admin panel     |       | Google Sheets |
| - Extension API   |       +---------------+
+-------------------+
    |
    v
+-------------------+       +-------------------+
| PostgreSQL        |       | Chrome Extension  |
| (Supabase free)   |       | (LinkedIn scanner)|
+-------------------+       +-------------------+
```

## Services (all free, no card required)

| Service | Purpose | Cost |
|---------|---------|------|
| Vercel | Host the Next.js web app | Free |
| Supabase | PostgreSQL database | Free |
| Google Sheets API | Output approved jobs | Free |
| Google Gemini API | AI job analysis (default) | Free (1500 req/day) |
| OpenAI API | AI job analysis (alternative) | Paid (user key) |

## Quick start

```bash
# 1. Clone and install
npm install

# 2. Set up database
cp .env.example .env
# Edit .env with your Supabase DATABASE_URL (session pooler, port 5432)

# 3. Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000/admin
# Default password: admin
# Configure: Gemini/OpenAI key, Google Sheets, target market, etc.
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo on https://vercel.com (free, no card needed)
3. Add `DATABASE_URL` environment variable (Supabase session pooler URI, port `5432`)
4. Deploy
5. Visit `https://your-app.vercel.app/api/setup` once to create database tables
6. Configure everything from `/admin/settings`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions.

## Supabase connection

Use the **Session pooler** connection string from Supabase (Connect > Direct > Session pooler):

```
postgresql://postgres.[ref]:[PASSWORD]@aws-[n]-[region].pooler.supabase.com:5432/postgres
```

Important: use port `5432` (session pooler), not `6543` (transaction pooler).

## Admin panel

| Page | Purpose |
|------|---------|
| Dashboard | Stats overview, sync to Google Sheets |
| Settings | AI provider (Gemini/OpenAI), API keys, Google Sheets, target market, location, AI prompt, columns |
| Scanners | Enable/disable platforms, set search URLs, run scans, analyze pending jobs |
| Skip Rules | Block jobs by company, title keyword, or URL pattern |
| Logs | View scan history, AI analysis logs, extension logs, bulk delete, date filtering |

## Chrome extension (LinkedIn)

The `extension/` folder contains a Manifest V3 Chrome extension that scans LinkedIn job search results:

1. Open LinkedIn and search for jobs
2. Click the extension icon and hit Start Scan
3. The extension checks each job, sends it to your server for AI analysis
4. Easy Apply jobs are auto-rejected and hidden
5. On-site/hybrid/unsuitable jobs are hidden
6. Approved jobs are saved to the "LinkedIn" tab in Google Sheets

### Install

1. Open `chrome://extensions`, enable Developer mode
2. Click "Load unpacked" and select the `extension/` folder
3. Update `SERVER_URL` in `extension/popup.js` to your Vercel URL

## Running scanners

All feeds run server-side from `/admin/scanners` (or `POST /api/admin/scanners/run`). Use the **Scrape all sources** button for a full pass, or **Run Now** on a single tile. After scanning, click **Analyze Pending Jobs** to filter rows through the AI and push approved ones to Google Sheets.

## Google Sheet output

### "Jobs" tab (from scanners)

Default columns (configurable from admin settings):

| Title | Company | Location | URL | Source | AI Score | Tech Stack | Salary | Date Found |
|-------|---------|----------|-----|--------|----------|------------|--------|------------|

Default column config JSON:

```json
[
  {"key":"title","label":"Title"},
  {"key":"company","label":"Company"},
  {"key":"location","label":"Location"},
  {"key":"url","label":"URL"},
  {"key":"platform","label":"Source"},
  {"key":"aiScore","label":"AI Score"},
  {"key":"techStack","label":"Tech Stack"},
  {"key":"salary","label":"Salary"},
  {"key":"createdAt","label":"Date Found"}
]
```

### "LinkedIn" tab (from Chrome extension)

| No | Date | Platform | Job Url | Company | Country | Role | Url |
|----|------|----------|---------|---------|---------|------|-----|

## Default settings (seeded by /api/setup)

| Setting | Default value |
|---------|--------------|
| Admin Password | `admin` |
| AI Provider | `gemini` |
| Gemini Model | `gemini-1.5-flash` |
| OpenAI Model | `gpt-4o-mini` |
| Target Market | `Europe, Eastern Europe, Remote worldwide` |
| Current Location | `Armenia` |
| LinkedIn Sheet Tab | `LinkedIn` |
| Sheet Columns | see JSON above |
| Job Analysis Prompt | see below |

### Default AI analysis prompt

```
You are a job suitability analyzer. Evaluate whether this job is suitable
for a software developer located in {{CURRENT_LOCATION}} who is looking
for {{TARGET_MARKET}} positions.

JOB TITLE: {{JOB_TITLE}}
COMPANY: {{COMPANY}}
LOCATION: {{LOCATION}}
JOB DESCRIPTION:
{{DESCRIPTION}}

Analyze the following criteria:
1. Is this job remote-friendly or accessible from {{CURRENT_LOCATION}}?
2. Does it target the {{TARGET_MARKET}} market?
3. Does it allow international contractors or remote workers from {{CURRENT_LOCATION}}?
4. Does it require local work authorization or citizenship that the candidate likely does not have?
5. Is the tech stack suitable for a software developer?

Respond in EXACTLY this JSON format, nothing else:
{
  "approved": true or false,
  "score": 0-100 (suitability score),
  "reason": "brief explanation of the decision",
  "techStack": ["list", "of", "technologies", "mentioned"]
}
```

Available placeholders: `{{JOB_TITLE}}`, `{{COMPANY}}`, `{{LOCATION}}`, `{{DESCRIPTION}}`, `{{TARGET_MARKET}}`, `{{CURRENT_LOCATION}}`

## Database schema

- **ScrapedJob** - every job found by scanners or extension (pending/approved/rejected)
- **AppConfig** - key/value settings store
- **SkipRule** - company/title/url block rules
- **ScanLog** - scan history
- **AnalysisLog** - AI analysis results per job

## Environment variables

Only `DATABASE_URL` is required. Everything else is configured from the admin panel.

```
DATABASE_URL=postgresql://...
ADMIN_PASSWORD=admin  # optional, overrides DB-stored password
```
