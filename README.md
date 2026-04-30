# Career Scrum Bot (Job Application Bot)

A personal job-application assistant that **scans multiple job boards**, saves listings to a PostgreSQL database, and **auto-generates tailored resumes and cover letters** using your styled `.docx` templates and ChatGPT.

---

## What It Does

1. **Scan jobs** from Jobright (Recommended board), ZipRecruiter, Glassdoor, Dice, or Simplify — using your logged-in browser sessions so you control which jobs are visible.
2. **Store** each job (title, company, URL, match score, source) and scrape the **job description** when possible.
3. **Generate documents** on demand or in bulk:
   - **Tailored resume** — same structure as your base resume, with technologies and bullets aligned to the job description.
   - **Story-like cover letter** — no bullets, keyword-aware, tied to your experience.
4. **Manage** everything from a single **`/jobs`** table: filter, search, edit, mark “Invited to interview,” generate docs per job (Normal or Aggressive tailoring), export to CSV.

You can run scans from the UI or CLI, and generate docs from the UI or via backfill scripts through the **ChatGPT web UI**.

---

## Tech Stack

| Layer | Stack |
|-------|--------|
| **App** | Next.js 14 (App Router), React, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Job scanning** | Playwright (Node) with persistent browser contexts; optional Python + nodriver for Cloudflare bypass (ZipRecruiter/Glassdoor) |
| **Documents** | Docxtemplater + Mammoth; LLM via ChatGPT web UI |
| **Output** | Styled `.docx` resumes and cover letters from your templates |

---

## Features

### Job sources

- **Jobright** — Recommended board; Google login once, then scan. Saves apply URL and job description; skips LinkedIn and low match score (&lt; threshold).
- **ZipRecruiter** — Search URL + persistent context; optional FlareSolverr/nodriver for Cloudflare.
- **Glassdoor** — Search URL; “Apply on employer site” only (no Easy Apply).
- **Dice** — Search URL; login once, then scan.
- **Simplify** — Search URL; login once, then scan.
- **Manual** — Add job from UI with title, company, URL, and optional description (e.g. paste from any site).

### Database & UI (`/jobs`)

- **Table**: title, company, source, date, match score, “Invited to interview,” docs status (Resume / Cover / Desc).
- **Filters**: date range, interview status (all / invited / not invited), description (all / with / without).
- **Search**: company, title, URL, score.
- **Actions per row**: View description, Edit (title, company, URL, description, invited to interview), **Generate Docs** (uses current Tailoring setting), Delete.
- **Toolbar**: Tailoring (Normal / Aggressive), Jobs to scan count, Scan Jobs, Add job (manual), Export to CSV.

### Resume & cover letter generation

- **Templates** in `Resumes/Templates`:
  - Base resume text from `*_Sample.docx`; styled output from a resume template with placeholders.
  - Cover letter template with `{coverletterContent}`.
- **Tailoring**:
  - **Normal** — Balanced keyword alignment and readability.
  - **Aggressive** — Stronger keyword/requirements matching (better ATS-style match; no fabrication).
- **Output**: `Resumes/<Company+Role>/` with tailored resume, cover letter, and job description copy.
- **Backend**: **ChatGPT web UI**.

### Automation

- **Backfill** — Generate docs for all jobs that have a description but no resume/cover letter:
  - One-shot: `npm run docs:backfill`.
  - **Watch mode**: `npm run docs:backfill:watch` — polls the DB on an interval and processes new jobs (env: `BACKFILL_POLL_INTERVAL_SEC`, `BACKFILL_TAILORING_STRENGTH`).

---

## Prerequisites

- **Node.js 18+**
- **PostgreSQL** (local or remote)
- **Git** (optional)
- **Python 3** (optional, only for ZipRecruiter/Glassdoor nodriver scripts)

---

## Setup Guide

### 1. Clone and install

```bash
git clone <your-repo-url> career-scrum-bot
cd career-scrum-bot
npm install
```

(Or open the project folder and run `npm install`.)

### 2. Environment variables

Create a `.env` file in the project root (it is git-ignored). Below: **required** vs **optional**.

**Required**

```env
# PostgreSQL (replace with your user, password, host, port, database)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE"
```

**Job scanning (at least one source)**  
Pick the context dir format for your OS.

- **Windows**: `C:\Users\YourName\.jobbot\jobright`
- **Linux / macOS**: `/home/yourname/.jobbot/jobright` or `~/.jobbot/jobright`

```env
# Jobright – required for Jobright scan
JOBRIGHT_CONTEXT_DIR=C:\Users\YourName\.jobbot\jobright

# User ID for saved jobs (must exist in DB; default 1)
JOBBOT_USER_ID=1
MAX_JOBS=5
MATCH_SCORE_THRESHOLD=80
AUTO_GENERATE_DOCUMENTS=true
```

**Document generation**

```env
# ChatGPT-generated documents output directory
RESUMES_OUTPUT_DIR=Resumes

# Optional: resume source/template overrides (use these for non-Jiayong profiles)
# RESUME_SAMPLE_PATH=Resumes/Templates/Mohan Sha_Sample.docx
# RESUME_TEMPLATE_PATH=Resumes/Templates/Mohan Sha.docx
# RESUME_OUTPUT_FILENAME=Mohan Sha.docx
# Optional (for Mohan template): include {toolsContent} placeholder in the template TOOLS section
```

**Backfill watch (optional)**

```env
BACKFILL_POLL_INTERVAL_SEC=120
```

**Optional job sources** (only if you use them)

```env
# ZipRecruiter
ZIPRECRUITER_SEARCH_URL=https://...
ZIPRECRUITER_MAX_JOBS_PER_RUN=10
# ZIPRECRUITER_CONTEXT_DIR=...

# Glassdoor
GLASSDOOR_SEARCH_URL=https://...
GLASSDOOR_MAX_JOBS_PER_RUN=5

# Dice
DICE_SEARCH_URL=https://...
DICE_MAX_JOBS_PER_RUN=10
# DICE_CONTEXT_DIR=...

# Simplify
SIMPLIFY_SEARCH_URL=https://...
SIMPLIFY_MAX_JOBS_PER_RUN=5
# SIMPLIFY_CONTEXT_DIR=...
```

**ChatGPT UI**

```env
# Optional; default is ~/.jobbot/chatgpt (or %USERPROFILE%\.jobbot\chatgpt on Windows)
# CHATGPT_CONTEXT_DIR=...

# Optional; cookies exported by chatgpt:nodriver (default: ~/.jobbot/chatgpt-cookies.json)
# CHATGPT_COOKIES_FILE=...
# Optional; persistent browser profile for ChatGPT nodriver (default: ~/.jobbot/chatgpt-nodriver-profile). Log in once; later runs reuse the session.
# CHATGPT_NODRIVER_USER_DATA_DIR=...
# Optional; ChatGPT backfill nodriver: RUN_ONCE=1 to process one batch and exit; POLL_SECONDS (default 300) when no jobs in 24/7 mode.
# CHATGPT_BACKFILL_RUN_ONCE=1
# CHATGPT_BACKFILL_POLL_SECONDS=300
# CHATGPT_BACKFILL_JOBS_PER_CHAT=20  (start new chat after N jobs to avoid conversation limit)
# CHATGPT_BACKFILL_KILL_BROWSERS=1   (if port never opens: close all Chrome/Edge before launching)
```

If the script says "Port did not respond": close all Chrome and Edge windows and run again, or set `CHATGPT_BACKFILL_KILL_BROWSERS=1`. To test the Chrome debug port alone: `py -3.12 scripts/test_chrome_debug_port.py`.

**If the port still never opens** (e.g. on Chrome 136+ or locked-down installs), use **Chrome for Testing**, which is built for automation and respects the debug port:
1. Download the [Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/) build (e.g. latest stable **win64**).
2. Extract the zip and set the path to the executable, e.g. `set CHROME_FOR_TESTING_PATH=C:\path\to\chrome-win64\chrome.exe` (or put the extracted `chrome-win64` folder in the project root and the script will use `chrome-win64\chrome.exe` automatically).
3. Run `npm run chatgpt:backfill:nodriver` again (with `CHATGPT_BACKFILL_KILL_BROWSERS=1` if you prefer).

**Why doesn’t the debug port open on my PC?** On some Windows machines Chrome never listens on `--remote-debugging-port` even with the right flags. Common causes and how to fix them so it works “like other Windows”:
- **Antivirus / Windows Defender** – Can block Chrome from opening a local server. Add an exclusion for Chrome (or the project folder), or temporarily disable real-time protection and test. If the port then works, keep an exclusion.
- **Group policy** – Managed PCs (work/school) may have policies that disable remote debugging. Open `chrome://policy` in Chrome and search for “debug” or “remote”; check `gpresult /h gpreport.html` for Chrome-related policies. Only an admin can change these.
- **Chrome build** – Some installs (enterprise, store) use a build that ignores the flag. Install [Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/) (extract the zip, set `CHROME_FOR_TESTING_PATH` to its `chrome.exe`) and run the script again.
- **Run as Administrator** – In a few cases behavior differs when the script is run elevated. Right‑click Command Prompt → “Run as administrator”, then run `py -3.12 scripts/test_chrome_debug_port.py`.

Run the diagnostic: `py -3.12 scripts/test_chrome_debug_port.py`. It prints whether Chrome is still running and whether anything is listening on the port, plus the fixes above.

**When nodriver still never connects on this PC** (e.g. debug port never opens after trying the above): run nodriver on **another machine** where it works (different Windows PC, WSL2, or Linux VM), then use the cookies on this PC so Playwright can generate docs without hitting Cloudflare:
1. On the other machine: clone this repo, `pip install -r requirements-nodriver.txt`, run `npm run chatgpt:nodriver`, pass Cloudflare and log in, press ENTER to export cookies.
2. Copy the cookie file from that machine to this PC (e.g. `~/.jobbot/chatgpt-cookies.json` or the path in `CHATGPT_COOKIES_FILE`).
3. On this PC: set `CHATGPT_COOKIES_FILE` to the path of the copied file, then run `npm run chatgpt:backfill:playwright`. Playwright loads those cookies; Cloudflare usually does not reappear until the session expires. Re-copy the cookie file if it expires or you get blocked again.

### 3. Database

Create the database if it does not exist (e.g. `createdb jobbot` or via pgAdmin). Then:

```bash
npx prisma migrate dev
```

If you use a dedicated DB user, ensure it can create a shadow DB for migrations (e.g. `ALTER ROLE youruser CREATEDB;`).

### 4. Resume templates

Put these under **`Resumes/Templates`**:

| File | Purpose |
|------|--------|
| `Jiayong Lin_Sample.docx` | Full base resume text (all sections). Used as the source content for tailoring. |
| `Jiayong Lin.docx` | Styled resume template with placeholders for Docxtemplater (e.g. summary, experience sections). |
| `Cover Letter.docx` | Styled cover letter with a single body placeholder. |

**Cover letter template** should contain something like:

```text
Hi Hiring Team,

{coverletterContent}

Best,
Your Name
```

Replace “Jiayong Lin” with your name in both filenames and content if you prefer; the code and docs often reference these example names.

### 5. (Optional) Log in to job boards and ChatGPT

- **Jobright**  
  ```bash
  npm run jobright:login
  ```  
  Log in with Google in the opened browser and land on the Recommended page. Close when done; session is stored in `JOBRIGHT_CONTEXT_DIR`.

- **ChatGPT (only if using ChatGPT for docs)**  
  Use the **nodriver-only backfill**: doc generation runs in the same undetected browser as login, so Cloudflare does not reappear.
  1. Install nodriver if you want the nodriver backfill: `pip install -r requirements-nodriver.txt` (on Windows: `py -3.12 -m pip install -r requirements-nodriver.txt` if needed).
  2. Run **`npm run chatgpt:backfill:playwright`** (when nodriver fails to connect), or `npm run chatgpt:backfill:nodriver`. **Playwright cannot bypass Cloudflare.** If you see a Cloudflare challenge with Playwright: run nodriver on another PC where it works, export cookies, and copy `~/.jobbot/chatgpt-cookies.json` to this machine and set `CHATGPT_COOKIES_FILE`. A Chrome window opens; if needed, pass Cloudflare and log in, then press ENTER. The script uses a **persistent profile** (`~/.jobbot/chatgpt-nodriver-profile`), so you usually log in only once. By default it runs **24/7**: it polls for jobs needing docs, generates resume + cover letter for each in that browser, then polls again (Ctrl+C to stop). Set `CHATGPT_BACKFILL_RUN_ONCE=1` to process one batch and exit; `CHATGPT_BACKFILL_POLL_SECONDS` (default 300) sets the wait when no jobs. After every `CHATGPT_BACKFILL_JOBS_PER_CHAT` (default 20) jobs the script starts a new chat in the UI to avoid the conversation length limit.
  **Optional:** `npm run chatgpt:nodriver` exports cookies to `~/.jobbot/chatgpt-cookies.json` for use with Playwright-based flows (e.g. UI “Generate Docs” or `docs:backfill:watch`) if your setup does not trigger Cloudflare there.

- **ZipRecruiter**  
  Bypass Cloudflare with nodriver, then scan with Node/Playwright: run `npm run ziprecruiter:nodriver` (browser opens, pass Cloudflare, log in if needed, press ENTER to export cookies), then run `npm run ziprecruiter:scan`. The script uses a **persistent profile** (`~/.jobbot/ziprecruiter-nodriver-profile`), so you usually log in only once. Set `ZIPRECRUITER_COOKIES_FILE` if not using the default `~/.jobbot/ziprecruiter-cookies.json`.
- **Glassdoor / Dice / Simplify**  
  Run the corresponding `:init` or `:login` script once (see **Scripts** below), then use the `:scan` scripts or UI.

---

## Running the App

### Start the dev server

```bash
npm run dev
```

Open **http://localhost:3000/jobs** to use the table, filters, Scan Jobs, Generate Docs, and Export.

### Scan jobs

- **From UI**: On `/jobs`, set “Jobs to scan” and click **Scan Jobs**. Scans use your configured source (e.g. Jobright) and `MAX_JOBS`, `MATCH_SCORE_THRESHOLD`, `AUTO_GENERATE_DOCUMENTS`.
- **From CLI** (Jobright example):  
  ```bash
  npm run jobright:scan
  ```  
  Use the same `JOBRIGHT_CONTEXT_DIR` as in `.env` (or set it in the command).

### Generate resume & cover letter

- **From UI**: Choose **Tailoring** (Normal / Aggressive), then click **Generate Docs** on a job that has a description. Files are written to `Resumes/<Company+Role>/` and linked in the DB.
- **Backfill (one-shot)**:  
  ```bash
  npm run docs:backfill
  ```  
- **Backfill watch** (continuous):  
  ```bash
  npm run docs:backfill:watch
  ```  
  Uses `BACKFILL_POLL_INTERVAL_SEC`. Stop with Ctrl+C.

---

## UI Overview (`/jobs`)

- **Filters**: Date (All / Today / Last 7 / 30 days), Interview (All / Invited / Not invited), Description (All / With / Without).
- **Search**: Matches company, title, URL, match score.
- **Tailoring**: Normal or Aggressive — applies to the next **Generate Docs** click on any row.
- **Docs column**: Pills for Resume, Cover, Desc (green/blue/purple when present).
- **Actions**: View Description, Edit (including “Invited to interview”), **Generate Docs**, Delete.
- **Export to CSV**: Exports the currently filtered rows.

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run Next.js lint |
| **Jobright** | |
| `npm run jobright:login` | Log in to Jobright (persistent context) |
| `npm run jobright:scan` | Scan Jobright Recommended board |
| **Documents** | |
| `npm run resume:setup` | Add base resume (script helper) |
| `npm run docs:backfill` | Generate docs for all jobs missing resume/cover via ChatGPT UI |
| `npm run docs:backfill:watch` | Watch mode: periodically find jobs needing docs and generate (env: `BACKFILL_POLL_INTERVAL_SEC`) |
| `npm run docs:chatgpt-ui` | Generate resume + cover via ChatGPT UI (by job ID or env files) |
| **ChatGPT UI** | |
| `npm run chatgpt:backfill:playwright` | Backfill via ChatGPT UI (Playwright; use when nodriver fails to connect) |
| `npm run chatgpt:backfill:nodriver` | Backfill via ChatGPT: nodriver only (login + doc generation in same browser; no Playwright) |
| `npm run chatgpt:nodriver` | Open ChatGPT in undetected Chrome, log in, export cookies (for Playwright flows if needed) |
| **ZipRecruiter** | |
| `npm run ziprecruiter:nodriver` | Bypass Cloudflare in nodriver, export cookies (run before scan if CF appears) |
| `npm run ziprecruiter:init` | Init ZipRecruiter session / export cookies |
| `npm run ziprecruiter:scan` | Scan ZipRecruiter (Playwright; loads cookies from nodriver export) |
| `npm run explore:ziprecruiter` | Explore ZipRecruiter (e.g. with FlareSolverr) |
| **Glassdoor** | |
| `npm run glassdoor:nodriver` | Python nodriver script |
| `npm run glassdoor:init` | Init Glassdoor session |
| `npm run glassdoor:scan` | Scan Glassdoor search results |
| **Dice** | |
| `npm run dice:init` | Log in to Dice (browser); session saved |
| `npm run dice:scan` | Scan Dice search results |
| **Simplify** | |
| `npm run simplify:init` | Log in to Simplify (browser); session saved |
| `npm run simplify:scan` | Scan Simplify search results |
| **Maintenance** | |
| `npm run jobbot:clean-cache` | Remove browser caches under `~/.jobbot` to free disk space; keeps cookies so you stay logged in. Use `-- --dry-run` to preview. |

### Managing .jobbot disk space

Browser profiles under `~/.jobbot` (e.g. Jobright, ZipRecruiter, ChatGPT) can grow to several GB due to cache, code cache, and Chrome optimization data. You can reclaim space without losing logins:

- **Clean caches only** (recommended):  
  `npm run jobbot:clean-cache`  
  Removes Cache, Code Cache, GPUCache, optimization models, Crashpad, etc., and leaves cookies and local storage intact.
- **Preview first**:  
  `npm run jobbot:clean-cache -- --dry-run`  
  Shows what would be removed and how much space would be freed.
- **Custom path**: Set `JOBOT_DIR` to a different base directory if you don’t use the default `~/.jobbot`.

---

## Troubleshooting

### "Failed to connect to browser" (nodriver scripts)

This means the script started Chrome/Edge but could not connect to its **debug port** in time (nodriver retries for a few seconds). It is **not** because you use Chrome instead of Chromium—both work the same way.

- **Close other Chrome/Edge windows** and run the script again.
- The script now tries **Chrome first, then Microsoft Edge** on Windows; Edge (Chromium) sometimes connects more reliably.
- Set an explicit browser path: `CHATGPT_CHROME_PATH` or `ZIPRECRUITER_CHROME_PATH` to the full path to `chrome.exe` or `msedge.exe`.
- Use **Python 3.12** for nodriver (npm scripts use `py -3.12`); Python 3.14 can cause connection/asyncio issues.
- If nodriver keeps failing, run Playwright with cookies exported from nodriver on another machine where it works.

---

## Safety & Secrets

- **`.env` is git-ignored.** Do not commit `DATABASE_URL` or any credentials.
- Before sharing the repo: ensure no `.env` or secret files are in history; consider whether resume templates and generated documents should be excluded or redacted.

---

## License

Private / personal use. Adjust as needed for your setup.
