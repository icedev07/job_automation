# Job Finder

Automated job finder for Armenian developers targeting European and remote positions.

Scrapes jobs from multiple platforms, uses AI to filter for suitability, and pushes approved jobs to Google Sheets. Includes a Chrome extension for LinkedIn scanning. Everything is configurable from the admin panel.

## How it works

1. **Scrape** - Server-side feeds collect jobs from public job-board APIs / RSS / SSR payloads, plus an authenticated aggregator (MyGreenhouse). The Chrome extension separately scans LinkedIn search results.
2. **Analyze inline** - Every scraped job is checked by AI for suitability *during the scan itself* (remote-friendly? accessible from Armenia? etc.). Pick one or more free AI providers in Settings; the analyzer rotates across them and fails over automatically when one is rate-limited.
3. **Store only the checked result** - A scan saves a job only after it has a verdict: `APPROVED` (suitable) or `REJECTED` (not suitable). It never stores a raw, unanalyzed "pending" job list. Jobs that could not be checked within the run's time/quota budget are skipped and retried on the next scan. (The LinkedIn extension already analyzes each job as it scans, so it is unaffected.)
4. **Sync** - Approved jobs are pushed to Google Sheets
5. **Hide** - On LinkedIn, rejected and Easy Apply jobs are automatically hidden

## Job sources

All sources below are free for applicants. Each is configurable from `/admin/scanners` (search params, max jobs, enabled/disabled).

| Key | Source | Auth | Notes |
|---|---|---|---|
| `remoteok` | [RemoteOK](https://remoteok.com) | none | public JSON feed |
| `jobicy` | [Jobicy](https://jobicy.com) | none | v2 JSON API; supports tag/jobGeo filters |
| `landingjobs` | [Landing.Jobs](https://landing.jobs) | none | EU-leaning developer API |
| `remotive` | [Remotive](https://remotive.com) | none | public JSON; `category=`/`search=`/`company_name=` filters |
| `workingnomads` | [Working Nomads](https://workingnomads.com) | none | public JSON (one flat feed); client-side category filter |
| `arbeitnow` | [Arbeitnow](https://www.arbeitnow.com) | none | Germany/DACH-leaning JSON; paginated, rate-limited (5 req/min) |
| `hnwhoishiring` | [Hacker News “Who is hiring?”](https://news.ycombinator.com) | none | the monthly thread via the HN Algolia API; each comment is a job |
| `themuse` | [The Muse](https://www.themuse.com) | none | public JSON; server-side `category=`/`location=`/`level=` filters |
| `realworkfromanywhere` | [Real Work From Anywhere](https://www.realworkfromanywhere.com) | none | RSS of true work-from-anywhere roles; per-category feeds |
| `nofluffjobs` | [NoFluffJobs](https://nofluffjobs.com) | none | Poland/CEE IT board via the public search API; salary always disclosed, opt-in `keyword`/`remote=true`/`days=N` filters |
| `weworkremotely` | [We Work Remotely](https://weworkremotely.com) | none | RSS per category slug |
| `jobspresso` | [Jobspresso](https://jobspresso.co) | none | RSS at `/jobs/feed/` |
| `authenticjobs` | [Authentic Jobs](https://authenticjobs.com) | none | dev-leaning RSS |
| `nodesk` | [Nodesk](https://nodesk.co) | none | Atom feed |
| `justremote` | [JustRemote](https://justremote.co) | none | scraped from SSR payload (~10 jobs/page) |
| `greenhouse` | [Greenhouse boards](https://boards-api.greenhouse.io) | none | per-company public ATS API. Supports `@curated` to expand the bundled live-only slug list, a comma-separated custom slug list, and opt-in filter tokens (`@remote`, `@since=N`, `@kw=…`, `@loc=…`). |
| `lever` | [Lever](https://api.lever.co) | none | per-company public API |
| `ashby` | [Ashby](https://api.ashbyhq.com/posting-api) | none | per-company public API |
| `mygreenhouse` | [MyGreenhouse candidate portal](https://my.greenhouse.io) | session cookie | aggregator across every employer opted into MyGreenhouse. See below. |

### Hidden sources ("Hidden gems" tab)

`remotive`, `workingnomads`, `arbeitnow`, `hnwhoishiring`, `themuse`, `realworkfromanywhere`, and `nofluffjobs` are low-competition, zero-auth sources that bypass the crowded commercial boards. They are grouped under the **Hidden gems** tab in `/admin/scanners`, each with its own enable/disable toggle, and run as part of **Scrape all sources** like every other feed. No login or API key is required.

- `hnwhoishiring` resolves the latest monthly *"Ask HN: Who is hiring?"* thread via the HN Algolia API, then parses each top-level comment. The job link stored is the HN comment permalink (stable + unique for dedup); the employer's own apply link, when present, is captured separately as the manual apply URL.
- `arbeitnow` is rate-limited to 5 requests/min, so it pulls only a few pages per scan and paces requests.
- `nofluffjobs` queries the public NoFluffJobs search API (`POST /api/search/posting`) in a single call — its pagination params are ignored, so one request returns the freshest slab (~80-190 postings), which we sort newest-first and slice. Salary is always disclosed (PLN/month), and the reliable `fullyRemote` flag powers the `remote=true` filter. The search field is an opt-in pre-filter: a bare keyword (e.g. `.net`, `c#`, `java`) plus optional `remote=true`, `days=N` tokens; blank keeps every technology. The endpoint serves the Poland/CEE catalogue and ignores a region param, so region is not exposed as a filter.
- The search field for the client-filtered feeds (`workingnomads`, `arbeitnow`, `hnwhoishiring`) is a comma-separated keyword/category include filter; `remotive` and `themuse` accept real server-side query params (or a full API URL). `realworkfromanywhere` takes a category slug or a full RSS URL.

Some well-known "hidden" boards were evaluated and **excluded** because they cannot be fetched zero-auth from a serverless function: **Himalayas** (Cloudflare JS challenge blocks datacenter IPs on both its JSON and RSS endpoints), **Wellfound/AngelList** (DataDome + Cloudflare), **StillHiring.today** (data lives only inside an authenticated Airtable embed), and **Dynamite Jobs / Remote.co** (no machine-readable feed). GitHub company directories (yanirs/established-remote, remoteintech/remote-jobs, etc.) are company lists rather than job feeds, so they are better used to extend the Greenhouse/Lever/Ashby slug lists than as standalone scanners.

### MyGreenhouse session cookie

MyGreenhouse is a passwordless candidate portal aggregating every employer who opted in. There is no public API, so the scanner replays your browser session.

1. Sign in once at https://my.greenhouse.io (enter email, paste the one-time code from your inbox).
2. In your browser, open DevTools → **Application → Cookies → `https://my.greenhouse.io`**.
3. Copy the entire Cookie header value as the browser sends it (right-click any cookie → "Copy as cURL" and lift the `-H 'Cookie: …'` value, or build the string `_session_id=…; MYGREENHOUSE-XSRF-TOKEN=…`).
4. Paste it into the **MyGreenhouse session cookie** input at the top of `/admin/scanners`.
5. (Optional) Paste just the `MYGREENHOUSE-XSRF-TOKEN` value into the X-CSRF-Token field — only needed if scans start failing with 403.

The cookie lives ~14 days (Greenhouse sets `_session_id` with a 14-day Expires). When the scanner reports `session expired`, repeat steps 1–4.

### MyGreenhouse location filter

The MyGreenhouse tile has a **Locations** field. Leave it blank to search every location, or list comma-separated places to keep (e.g. `Germany, Netherlands, Remote`). The one-click **Europe** button matches every EU/EEA country plus remote roles. Jobs whose location is a confirmed mismatch are dropped before AI analysis, which also saves free-tier AI quota.

### Bulk Greenhouse coverage without auth

For the public `greenhouse` scanner, type `@curated` in its search-params field. That expands to a bundled, pre-pruned list of live Greenhouse company slugs (every entry currently returns jobs) drawn from the community [awesome-easy-apply](https://github.com/sample-resume/awesome-easy-apply) index. You can mix it with custom slugs:

```
@curated, mycompany, another-slug
```

You can also paste full board URLs (classic `boards.greenhouse.io/slug`, modern `job-boards.greenhouse.io/slug`, the EU host, or an `…/embed/job_board?for=slug` embed) — the slug is extracted automatically.

**Opt-in filters** (applied before AI analysis, so they also save free-tier AI quota) can be mixed into the same field as extra tokens:

```
@curated, @remote, @since=7, @kw=engineer, @loc=germany
```

- `@remote` — keep only remote / work-from-anywhere roles.
- `@since=N` (alias `@days=N`) — keep only jobs first published within the last N days; also drops postings whose application deadline has passed.
- `@kw=term` — keep only jobs whose title or department contains `term` (repeatable; matches are OR'd).
- `@loc=keyword` — keep only jobs whose location or office contains `keyword` (repeatable).

With no filter tokens the scanner behaves as before (newest jobs per company, spread fairly across all configured slugs).

## Architecture

```
Admin Panel (/admin)
    |
    v
+-------------------+       +----------------+
| Next.js App       |------>| AI: Smart      |
| (Vercel free)     |       | Rotation (free)|
|                   |       +----------------+
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
| Google Gemini API | AI job analysis (rotation provider) | Free, no card |
| Groq API | AI job analysis (rotation provider) | Free, no card |
| Cerebras API | AI job analysis (rotation provider) | Free, no card |
| OpenRouter API | AI job analysis (rotation provider) | Free, no card |
| Cloudflare Workers AI | AI job analysis (rotation provider) | Free, no card (10k Neurons/day) |

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
# Configure: AI provider keys, Google Sheets, target market, etc.
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
| Settings | AI providers (tick one or more of Gemini / Groq / Cerebras / OpenRouter / Cloudflare to rotate across), API keys, Google Sheets, target market, location, AI prompt, columns |
| Scanners | Enable/disable platforms, set search URLs and MyGreenhouse location filters, run scans (each scan analyzes inline and stores only checked jobs) |
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

It supports both the classic `/jobs/search/` results and LinkedIn's newer AI /
natural-language search (`/jobs/search-results/`, the chat-style search). The
two pages use completely different layouts, so when you scan the AI search page
tick **"Analyze AI search page (beta)"** in the popup first — the scanner then
switches to the matching extractor (same flow: per-job AI analysis, external
apply-link capture, pagination, and hide-on-reject). Leave it off for the
classic page.

Use the **Job scan limit** field to cap how many jobs a run scans across all
pages. It defaults to **100**; set it to **-1** to scan every job with no limit.
The count includes every job the scanner opens (approved, rejected, skipped, or
already processed), and the limit is honored across pagination — including the
full-page-reload fallback — so a run stops cleanly as soon as the budget is
reached. The field works the same in classic and AI-search (beta) modes.

### Install

1. Open `chrome://extensions`, enable Developer mode
2. Click "Load unpacked" and select the `extension/` folder
3. Update `SERVER_URL` in `extension/popup.js` to your Vercel URL

## Running scanners

All feeds run server-side from `/admin/scanners` (or `POST /api/admin/scanners/run`). Use the **Scrape all sources** button for a full pass, or **Run Now** on a single tile. Each scan checks every job with AI as it runs and stores only the suitable / not-suitable results, then syncs approved ones to Google Sheets — there is no separate analyze step. **Analyze Pending Jobs** stays available only to clear leftovers (a rescan reset, or a pre-upgrade backlog) and normally shows `0`.

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
| AI Providers | `gemini, groq, cerebras, openrouter` (tick/untick any in Settings) |
| Gemini Model | `gemini-2.5-flash` |
| Groq Model | `llama-3.1-8b-instant` |
| Cerebras Model | `llama-3.3-70b` |
| Cloudflare Model | `@cf/meta/llama-3.1-8b-instruct` |
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

- **ScrapedJob** - every stored job (approved/rejected); feed scans store only checked jobs, the LinkedIn extension may briefly hold a job pending while it analyzes
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
