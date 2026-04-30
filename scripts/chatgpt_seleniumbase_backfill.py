#!/usr/bin/env python3
"""
Backfill documents using SeleniumBase UC Mode. Cloudflare and doc generation
both happen in the same undetected browser, so Cloudflare does not reappear.

Default: 24/7 watch mode – polls for jobs needing docs, processes them, then polls again.
  Env: CHATGPT_BACKFILL_POLL_SECONDS (default 300 = 5 min when no jobs).
  Env: CHATGPT_BACKFILL_RUN_ONCE=1 to process one batch and exit.
  Env: CHATGPT_BACKFILL_JOBS_PER_CHAT (default 20): start a new chat after N jobs to avoid conversation limit.
  Env: CHATGPT_BACKFILL_UNATTENDED=1 – skip the “press ENTER” prompt; wait for the composer (saved profile keeps login).
  Env: CHATGPT_BACKFILL_COMPOSER_WAIT_SECONDS (default 600): max wait for composer when unattended.
  Env: CHATGPT_BACKFILL_MAX_CONSECUTIVE_FAILURES (default 1): after this many failed jobs in a row, quit the browser and
      restart the whole Python process (same script, same env; use a supervisor if execv is unavailable).
      Set to 2+ if you want to tolerate transient UI flakiness before restarting.
      After that auto-restart, UNATTENDED is forced on so the new process does not wait for ENTER.

Flow:
  1. Open ChatGPT with SeleniumBase; you pass Cloudflare and log in (once).
  2. Loop: get jobs needing docs from Node; if none, sleep and retry.
  3. For each job: send resume prompt → get reply → send cover prompt → get reply; save via Node.
  4. Repeat until you press Ctrl+C (or RUN_ONCE=1).

Usage:
  pip install seleniumbase
  From project root: python scripts/chatgpt_seleniumbase_backfill.py
  Or: npm run chatgpt:backfill:seleniumbase

Requires: Node/tsx available (npx tsx), .env and DB with jobs.
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

try:
    from dotenv import load_dotenv
    _env = PROJECT_ROOT / ".env"
    if _env.exists():
        load_dotenv(_env)
except ImportError:
    pass

POLL_SECONDS = max(60, int(os.environ.get("CHATGPT_BACKFILL_POLL_SECONDS", "300")))
RUN_ONCE = os.environ.get("CHATGPT_BACKFILL_RUN_ONCE", "").strip().lower() in ("1", "true", "yes")
JOBS_PER_CHAT = max(1, int(os.environ.get("CHATGPT_BACKFILL_JOBS_PER_CHAT", "20")))
UNATTENDED = os.environ.get("CHATGPT_BACKFILL_UNATTENDED", "").strip().lower() in ("1", "true", "yes")
COMPOSER_WAIT_SECONDS = max(120, int(os.environ.get("CHATGPT_BACKFILL_COMPOSER_WAIT_SECONDS", "600")))
MAX_CONSECUTIVE_FAILURES = max(1, int(os.environ.get("CHATGPT_BACKFILL_MAX_CONSECUTIVE_FAILURES", "1")))

def restart_process_same_script(*, force_unattended: bool = False) -> None:
    """Replace this process with a fresh interpreter running this script (full process restart)."""
    if force_unattended:
        # Recovery restarts must not block on ENTER (no human at keyboard).
        os.environ["CHATGPT_BACKFILL_UNATTENDED"] = "1"
    script_path = Path(__file__).resolve()
    argv = [sys.executable, str(script_path), *sys.argv[1:]]
    try:
        os.execv(sys.executable, argv)
    except OSError as e:
        print(
            f"Could not restart process (execv failed: {e}). Exit and use a supervisor/wrapper to rerun the script.",
            file=sys.stderr,
        )
        sys.exit(2)


def default_profile_dir() -> str:
    path_env = os.environ.get("CHATGPT_NODRIVER_USER_DATA_DIR")
    if path_env and path_env.strip():
        return path_env.strip()
    home = os.environ.get("HOME") or os.environ.get("USERPROFILE") or os.getcwd()
    jobbot = Path(home) / ".jobbot"
    jobbot.mkdir(parents=True, exist_ok=True)
    return str(jobbot / "chatgpt-seleniumbase-profile")

def _run_node_script(script_name: str, stdin_text: str | None = None, timeout: int = 120) -> str:
    cmd = f"npx tsx scripts/{script_name}"
    env = os.environ.copy()
    env.setdefault("PATH", os.defpath)
    result = subprocess.run(
        cmd,
        cwd=PROJECT_ROOT,
        input=stdin_text,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        shell=True,
        env=env,
    )
    if result.returncode != 0:
        raise RuntimeError(f"{script_name} failed: {result.stderr or result.stdout}")
    return result.stdout or ""

def get_jobs_json() -> list[dict]:
    stdout = _run_node_script("getJobsForSeleniumBackfill.ts", timeout=60)
    data = json.loads(stdout.strip() or "[]")
    return data if isinstance(data, list) else []

def save_docs_via_node(job_id: int, resume_text: str, cover_letter_text: str) -> None:
    payload = json.dumps({
        "jobId": job_id,
        "resumeText": resume_text,
        "coverLetterText": cover_letter_text,
    })
    _run_node_script("saveGeneratedDocsFromSelenium.ts", stdin_text=payload, timeout=120)

def wait_for_composer(driver, timeout_sec: int = 120) -> bool:
    selectors = [
        '#prompt-textarea',
        'textarea[placeholder*="Message"]',
        'textarea[placeholder*="message"]',
        '[contenteditable="true"]',
        'div[role="textbox"]',
    ]
    for _ in range(timeout_sec):
        for sel in selectors:
            try:
                # Use execute_script since some elements might be deep in DOM or driver.is_element_visible might be flaky
                is_visible = driver.execute_script(f"""
                    var el = document.querySelector('{sel}');
                    return el != null;
                """)
                if is_visible:
                    return True
            except Exception:
                pass
        time.sleep(1)
    return False

def start_new_chat(driver, base_url: str) -> bool:
    try:
        driver.execute_script("""
            (function() {
                var links = document.querySelectorAll('a[href="/"], a[href="/chat"], [data-testid="new-chat-link"], nav a, aside a');
                for (var i = 0; i < links.length; i++) {
                    var t = (links[i].textContent || '').trim().toLowerCase();
                    var h = (links[i].getAttribute('href') || '');
                    if (t.indexOf('new chat') >= 0 || h === '/' || h === '/chat') {
                        links[i].click();
                        return true;
                    }
                }
                var btn = document.querySelector('button[aria-label*="New chat"], button[aria-label*="new chat"]');
                if (btn) { btn.click(); return true; }
                return false;
            })();
        """)
        time.sleep(2)
        if wait_for_composer(driver, timeout_sec=5):
            return True
    except Exception:
        pass
    
    # Fallback to direct navigation
    try:
        driver.get(base_url)
        time.sleep(2)
        return wait_for_composer(driver, timeout_sec=15)
    except Exception:
        return False

def send_prompt_and_get_reply(driver, prompt: str, timeout_sec: int = 180) -> str:
    # Use SeleniumBase's native methods for typing - they are often more robust 
    # than pure JS for React inputs that strictly watch for physical keyboard events
    # Try an even more direct approach using `document.execCommand` which simulates a user paste
    try:
        driver.execute_script(f"""
            var el = document.querySelector('#prompt-textarea');
            if (el) {{
                el.focus();
                var text = {json.dumps(prompt)};
                // This is the most reliable way to bypass React's synthetic events
                if (!document.execCommand('insertText', false, text)) {{
                    // Fallback if execCommand is blocked
                    el.innerText = text;
                    el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                }}
            }}
        """)
        time.sleep(1.5)
        
        # Verify if input was actually typed
        val = driver.execute_script("return document.querySelector('#prompt-textarea').innerText || document.querySelector('#prompt-textarea').value || '';")
        if len(val.strip()) < 10:
            raise Exception("JS inject method failed to enter text")
            
    except Exception as e:
        # Fallback using JS insertion
        escaped = json.dumps(prompt)
        # ... rest of fallback logic
        ok = driver.execute_script(f"""
            (function() {{
                var el = document.querySelector('#prompt-textarea') ||
                         document.querySelector('textarea[placeholder*="Message"]') ||
                         document.querySelector('textarea[placeholder*="message"]') ||
                         document.querySelector('[contenteditable="true"]') ||
                         document.querySelector('div[role="textbox"]');
                if (!el) return false;
                
                // For contenteditable/divs (Prosemirror, etc)
                if (el.tagName !== 'TEXTAREA') {{
                    el.focus();
                    
                    // Clear existing text first
                    el.innerHTML = '';
                    
                    // Set text directly
                    el.innerText = {escaped};
                    
                    // Trigger events
                    el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    
                }} else {{
                    el.value = {escaped};
                    el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
                return true;
            }})();
        """)
        
        if not ok:
            raise RuntimeError(f"Could not find ChatGPT message input: {e}")

    # Click send
    try:
        # Give UI a moment to enable the button after input
        time.sleep(1.5)
        
        # Look for the send button (aria-label="Send prompt" as seen in the screenshot)
        send_btn_selector = 'button[data-testid="send-button"], button[aria-label="Send prompt"], button[aria-label="Send message"]'
        
        # Count assistant messages before sending
        prev_assistant_count = driver.execute_script('return document.querySelectorAll("[data-message-author-role=\\"assistant\\"]").length;')
        
        # Try finding the exact send button from the DOM directly to ensure reliability
        clicked = driver.execute_script("""
            var btn = document.querySelector('button[data-testid="send-button"]') || 
                      document.querySelector('button[aria-label="Send prompt"]') ||
                      document.querySelector('button[aria-label="Send message"]');
            if(btn && !btn.disabled) {
                btn.click();
                return true;
            }
            return false;
        """)
        
        if not clicked:
            if driver.is_element_visible(send_btn_selector):
                driver.click(send_btn_selector)
            else:
                # Fallback to Enter key
                driver.execute_script("""
                    var el = document.querySelector('#prompt-textarea') || document.querySelector('[contenteditable="true"]');
                    if (el) {
                        var enterEvent = new KeyboardEvent('keydown', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            which: 13,
                            bubbles: true,
                            cancelable: true
                        });
                        el.dispatchEvent(enterEvent);
                    }
                """)
    except Exception:
        raise RuntimeError("Could not click Send button")

    # Wait for the new message to appear
    appeared = False
    for _ in range(30):
        current_count = driver.execute_script('return document.querySelectorAll("[data-message-author-role=\\"assistant\\"]").length;')
        if current_count > prev_assistant_count:
            appeared = True
            break
        time.sleep(1)
        
    if not appeared:
        # If it didn't increase, maybe it's editing the existing one or it failed to send.
        pass

    # Wait for generation to finish. 
    # Generation is complete when the "Stop generating" button disappears 
    # OR when the text stays completely unchanged for 10 seconds.
    max_wait = timeout_sec
    start_time = time.time()
    last_text = ""
    unchanged_time = 0
    
    while time.time() - start_time < max_wait:
        # Check for stop button
        is_generating_btn = driver.execute_script("""
            return document.querySelector('button[aria-label="Stop generating"]') !== null ||
                   document.querySelector('button[data-testid="stop-button"]') !== null;
        """)
        
        # Get current text
        current_text = driver.execute_script("""
            var nodes = document.querySelectorAll('[data-message-author-role="assistant"]');
            if (nodes.length === 0) return "";
            var last = nodes[nodes.length - 1];
            var md = last.querySelector('div[class*="markdown"]');
            return md ? md.innerText : "";
        """)
        
        if current_text == last_text and current_text != "":
            unchanged_time += 1
        else:
            unchanged_time = 0
            
        last_text = current_text
        
        if not is_generating_btn and unchanged_time >= 3:
            # Button is gone AND text hasn't changed for 3 seconds -> done
            break
            
        # If text hasn't changed for 15 seconds even if button is there -> probably done / hung
        if unchanged_time >= 15:
            break
            
        time.sleep(1)
    
    if time.time() - start_time >= max_wait:
        print("Warning: Timeout waiting for ChatGPT reply, using whatever was extracted.", file=sys.stderr)
        
    # Extract the final text
    text = driver.execute_script("""
        var nodes = document.querySelectorAll('[data-message-author-role="assistant"]');
        if (nodes.length === 0) return null;
        var last = nodes[nodes.length - 1];
        var md = last.querySelector('div[class*="markdown"]');
        return md ? md.innerText : null;
    """)
    
    if not text or len(text.strip()) < 50:
        raise RuntimeError("Extracted reply was too short or empty")
        
    return text.strip()

def run_backfill_in_browser() -> int:
    try:
        from seleniumbase import Driver
    except ImportError:
        print("seleniumbase not installed. Run: pip install seleniumbase", file=sys.stderr)
        return 1

    url = os.environ.get("CHATGPT_URL", "https://chat.openai.com")
    profile_dir = default_profile_dir()

    print("\nChatGPT backfill (SeleniumBase UC Mode)\n")
    print(f"Profile: {profile_dir} (session saved; you usually log in only once)")
    if RUN_ONCE:
        print("Mode: run once then exit (CHATGPT_BACKFILL_RUN_ONCE=1)")
    else:
        print("Mode: 24/7 watch – polls for jobs every %ds when idle. Ctrl+C to stop." % POLL_SECONDS)
    print("New chat every %d jobs to avoid conversation limit (CHATGPT_BACKFILL_JOBS_PER_CHAT)." % JOBS_PER_CHAT)
    if UNATTENDED:
        print(
            "Unattended mode: no ENTER prompt — waiting up to %ds for the chat composer "
            "(CHATGPT_BACKFILL_UNATTENDED / CHATGPT_BACKFILL_COMPOSER_WAIT_SECONDS).\n"
            % COMPOSER_WAIT_SECONDS
        )
    else:
        print("When the chat interface is ready, press ENTER to start.\n")

    driver = None
    try:
        driver = Driver(uc=True, user_data_dir=profile_dir)
        driver.get(url)
        time.sleep(2)

        if not UNATTENDED:
            input(
                "Opening ChatGPT in the browser. Log in if needed, then when the chat interface is ready, press ENTER here... "
            )

        composer_timeout = COMPOSER_WAIT_SECONDS if UNATTENDED else 120
        if not wait_for_composer(driver, timeout_sec=composer_timeout):
            print("Chat composer not found. Make sure you are on the chat page.", file=sys.stderr)
            return 1

        print("Watching for jobs that need documents (Ctrl+C to stop).\n")
        consecutive_job_failures = 0

        while True:
            try:
                jobs = get_jobs_json()
            except Exception as e:
                print(f"Failed to get jobs: {e}", file=sys.stderr)
                if RUN_ONCE:
                    return 1
                print(f"Retrying in {POLL_SECONDS}s...\n")
                time.sleep(POLL_SECONDS)
                continue

            if not jobs:
                if RUN_ONCE:
                    print("No jobs need documents.")
                    return 0
                print(f"No jobs need documents. Next check in {POLL_SECONDS}s (Ctrl+C to stop).")
                time.sleep(POLL_SECONDS)
                continue

            print(f"\nFound {len(jobs)} job(s). Generating in this browser.\n")
            jobs_in_current_chat = 0
            
            for i, job in enumerate(jobs):
                if jobs_in_current_chat >= JOBS_PER_CHAT:
                    print(f"\nStarting new chat after {JOBS_PER_CHAT} jobs (avoid context limit)...")
                    if start_new_chat(driver, url):
                        jobs_in_current_chat = 0
                        print("New chat ready.\n")
                    else:
                        print("Warning: could not start new chat; continuing in current conversation.\n", file=sys.stderr)

                job_id = job["jobId"]
                company = job.get("company", "?")
                role = job.get("role", "?")
                print(f"[{i+1}/{len(jobs)}] Job {job_id}: {company} – {role}")
                
                try:
                    resume_prompt = job["resumePrompt"]
                    cover_prompt = job["coverLetterPrompt"]
                    resume_text = send_prompt_and_get_reply(driver, resume_prompt)
                    cover_text = send_prompt_and_get_reply(driver, cover_prompt)
                    save_docs_via_node(job_id, resume_text, cover_text)
                    print(f"  Saved resume + cover letter.")
                    jobs_in_current_chat += 1
                    consecutive_job_failures = 0
                except Exception as e:
                    print(f"  Error: {e}", file=sys.stderr)
                    consecutive_job_failures += 1
                    if consecutive_job_failures >= MAX_CONSECUTIVE_FAILURES:
                        print(
                            f"\n{consecutive_job_failures} consecutive job failure(s) "
                            f"(>= CHATGPT_BACKFILL_MAX_CONSECUTIVE_FAILURES={MAX_CONSECUTIVE_FAILURES}). "
                            "Closing browser and restarting process...\n",
                            file=sys.stderr,
                        )
                        try:
                            driver.quit()
                        except Exception:
                            pass
                        driver = None
                        print(
                            "Next process will run unattended (no ENTER prompt) after auto-restart.",
                            file=sys.stderr,
                        )
                        restart_process_same_script(force_unattended=True)

            if RUN_ONCE:
                print("\nDone (RUN_ONCE).")
                return 0
            print("\nBatch done. Checking for more jobs...")

    except KeyboardInterrupt:
        print("\nStopping...")
        return 0
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass

def main() -> int:
    return run_backfill_in_browser()

if __name__ == "__main__":
    sys.exit(main())
