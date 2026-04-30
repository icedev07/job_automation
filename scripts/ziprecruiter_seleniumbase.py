#!/usr/bin/env python3
"""
ZipRecruiter: use SeleniumBase UC Mode (undetected Chrome) to pass Cloudflare, 
then export cookies to a JSON file for the Node/Playwright scripts to load.

Usage:
  pip install seleniumbase
  python scripts/ziprecruiter_seleniumbase.py

Then run your ziprecruiter playwrigth scripts.
(Set ZIPRECRUITER_COOKIES_FILE to the output path if not using default.)
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path

# Load .env from project root so ZIPRECRUITER_NODRIVER_URL is read
try:
    from dotenv import load_dotenv
    _env = Path(__file__).resolve().parent.parent / ".env"
    if _env.exists():
        load_dotenv(_env)
except ImportError:
    pass

def default_cookies_path() -> str:
    home = os.environ.get("HOME") or os.environ.get("USERPROFILE") or os.getcwd()
    jobbot = Path(home) / ".jobbot"
    jobbot.mkdir(parents=True, exist_ok=True)
    return str(jobbot / "ziprecruiter-cookies.json")

def default_profile_dir() -> str:
    """Persistent browser profile so you don't have to log in every run."""
    path_env = os.environ.get("ZIPRECRUITER_NODRIVER_USER_DATA_DIR")
    if path_env and path_env.strip():
        return path_env.strip()
    home = os.environ.get("HOME") or os.environ.get("USERPROFILE") or os.getcwd()
    jobbot = Path(home) / ".jobbot"
    jobbot.mkdir(parents=True, exist_ok=True)
    return str(jobbot / "ziprecruiter-seleniumbase-profile")

def cookie_to_editor(c: dict) -> dict:
    """Convert seleniumbase cookie to Cookie-Editor style for Node Playwright."""
    domain = c.get("domain", "")
    if domain and not domain.startswith("."):
        domain = "." + domain
    
    path = c.get("path", "/")
    
    out = {
        "name": c.get("name", ""),
        "value": c.get("value", ""),
        "domain": domain or ".ziprecruiter.com",
        "path": path,
    }
    
    if "expiry" in c and c["expiry"] is not None:
        try:
            out["expirationDate"] = int(float(c["expiry"]))
        except (TypeError, ValueError):
            pass
            
    if "httpOnly" in c:
        out["httpOnly"] = bool(c["httpOnly"])
    if "secure" in c:
        out["secure"] = bool(c["secure"])
    if "sameSite" in c and c["sameSite"]:
        same_site = str(c["sameSite"])
        if same_site.lower() == "strict":
            out["sameSite"] = "Strict"
        elif same_site.lower() == "lax":
            out["sameSite"] = "Lax"
        elif same_site.lower() == "none":
            out["sameSite"] = "None"
            
    return out


def _is_truthy(val: str | None) -> bool:
    return (val or "").strip().lower() in ("1", "true", "yes", "y", "on")


def wait_for_ziprecruiter_ready(driver, timeout_sec: int = 180) -> bool:
    """Wait until key search-page signals appear (cards/search results container)."""
    selectors = [
        "div.job_result_two_pane_v2",
        "[data-testid='left-pane']",
        "[data-testid='job-details-scroll-container']",
        "[data-testid='right-pane']",
    ]
    for _ in range(max(1, timeout_sec)):
        try:
            found = driver.execute_script(
                """
                const sels = arguments[0];
                for (const s of sels) {
                    if (document.querySelector(s)) return true;
                }
                return false;
                """,
                selectors,
            )
            if found:
                return True
        except Exception:
            pass
        time.sleep(1)
    return False

def main() -> int:
    try:
        from seleniumbase import Driver
    except ImportError:
        print("seleniumbase not installed. Run: pip install seleniumbase", file=sys.stderr)
        return 1

    url = os.environ.get(
        "ZIPRECRUITER_NODRIVER_URL",
        "https://www.ziprecruiter.com/jobs-search?search=Machine+Learning+Engineer&location=Remote+%28USA%29&refine_by_location_type=&radius=5000&days=5&refine_by_employment=employment_type%3Afull_time&refine_by_experience_level=senior%2Cmid&refine_by_apply_type=&refine_by_salary=120000&refine_by_salary_ceil=&lk=MJv3qHnmGw5k5x5_pTY33Q&page=1",
    )
    
    out_path = os.environ.get("ZIPRECRUITER_COOKIES_FILE") or default_cookies_path()
    profile_dir = default_profile_dir()
    unattended = _is_truthy(os.environ.get("ZIPRECRUITER_UNATTENDED"))
    run_scan_after_export = _is_truthy(os.environ.get("ZIPRECRUITER_RUN_SCAN_AFTER_EXPORT"))
    unattended_wait_sec = max(60, int(os.environ.get("ZIPRECRUITER_UNATTENDED_WAIT_SECONDS", "300")))

    print("\nZipRecruiter – SeleniumBase (Undetected Chrome)\n")
    print(f"URL: {url}")
    print(f"Profile: {profile_dir} (session saved; you usually log in only once)")
    print(f"Cookies will be saved to: {out_path}\n")
    if unattended:
        print(
            "Mode: unattended (ZIPRECRUITER_UNATTENDED=1) — no ENTER prompt. "
            f"Waiting up to {unattended_wait_sec}s for page readiness.\n"
        )
    else:
        print("A Chrome window will open. If you haven't used this profile before: complete")
        print("Cloudflare if shown, then log in (e.g. with Gmail). When the job search page")
        print("loads, press ENTER to export cookies. On later runs you may already be logged in.\n")
    if run_scan_after_export:
        print("Auto-run: scan will start immediately after cookie export.\n")

    driver = None
    try:
        # Launch using Undetected ChromeDriver (uc=True)
        # Using user_data_dir to persist the login session
        driver = Driver(uc=True, user_data_dir=profile_dir)
        driver.get(url)
        
        # Add a short delay to allow the page to initialize
        time.sleep(2)

        if unattended:
            print("Waiting for ZipRecruiter page readiness (cards/pane signals)...")
            if not wait_for_ziprecruiter_ready(driver, timeout_sec=unattended_wait_sec):
                print(
                    "Timed out waiting for ZipRecruiter to become ready in unattended mode. "
                    "Set ZIPRECRUITER_UNATTENDED=0 for manual first-time login/Cloudflare.",
                    file=sys.stderr,
                )
                return 1
        else:
            input("When the page has loaded (and any Cloudflare check is done), press ENTER to export cookies... ")
        
        # Get cookies
        cookies = driver.get_cookies()
        
        # Filter to ZipRecruiter-related and Cloudflare
        editor_cookies = []
        for c in cookies:
            d = c.get("domain", "")
            if "ziprecruiter" in d.lower() or "cloudflare" in d.lower():
                editor_cookies.append(cookie_to_editor(c))
                
        if not editor_cookies:
            editor_cookies = [cookie_to_editor(c) for c in cookies]
            
        # Save cookies to file
        Path(out_path).parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(editor_cookies, f, indent=2)
            
        print(f"\nExported {len(editor_cookies)} cookies to {out_path}")
        if not run_scan_after_export:
            print("You can now run your playwright scripts!")
            return 0

        print("Starting ziprecruiter scan now...")
        result = subprocess.run(
            "npx tsx scripts/ziprecruiterScan.ts",
            cwd=Path(__file__).resolve().parent.parent,
            shell=True,
            text=True,
        )
        return int(result.returncode or 0)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass

if __name__ == "__main__":
    sys.exit(main())
