#!/usr/bin/env python3
"""
Indeed: use SeleniumBase UC Mode (undetected Chrome) to pass Cloudflare,
then export cookies to a JSON file for Node/Playwright scripts to load.

Usage:
  pip install seleniumbase
  python scripts/indeed_seleniumbase.py

Or:
  npm run indeed:seleniumbase

Env:
  INDEED_URL     – Indeed page to open (default: ML engineer, Remote, last 7 days).
  INDEED_COOKIES_FILE – Where to save cookies (default: ~/.jobbot/indeed-cookies.json).
  INDEED_USER_DATA_DIR – Chrome profile dir (default: ~/.jobbot/indeed-seleniumbase-profile).
"""

import json
import os
import sys
import time
from pathlib import Path

try:
    from dotenv import load_dotenv
    _env = Path(__file__).resolve().parent.parent / ".env"
    if _env.exists():
        load_dotenv(_env)
except ImportError:
    pass

DEFAULT_INDEED_URL = (
    "https://www.indeed.com/jobs"
    "?q=machine+learning+engineer"
    "&l=Remote"
    "&fromage=7"
    "&from=searchOnDesktopSerp"
    "&vjk=e602d2e400325ba0"
    "&advn=3338732981232945"
)


def default_cookies_path() -> str:
    home = os.environ.get("HOME") or os.environ.get("USERPROFILE") or os.getcwd()
    jobbot = Path(home) / ".jobbot"
    jobbot.mkdir(parents=True, exist_ok=True)
    return str(jobbot / "indeed-cookies.json")


def default_profile_dir() -> str:
    path_env = os.environ.get("INDEED_USER_DATA_DIR")
    if path_env and path_env.strip():
        return path_env.strip()
    home = os.environ.get("HOME") or os.environ.get("USERPROFILE") or os.getcwd()
    jobbot = Path(home) / ".jobbot"
    jobbot.mkdir(parents=True, exist_ok=True)
    return str(jobbot / "indeed-seleniumbase-profile")


def cookie_to_editor(c: dict) -> dict:
    """Convert SeleniumBase cookie to Cookie-Editor style for Node Playwright."""
    domain = c.get("domain", "")
    if domain and not domain.startswith("."):
        domain = "." + domain

    path = c.get("path", "/")

    out = {
        "name": c.get("name", ""),
        "value": c.get("value", ""),
        "domain": domain or ".indeed.com",
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


def main() -> int:
    try:
        from seleniumbase import Driver
    except ImportError:
        print("seleniumbase not installed. Run: pip install seleniumbase", file=sys.stderr)
        return 1

    url = os.environ.get("INDEED_URL", DEFAULT_INDEED_URL).strip()
    out_path = os.environ.get("INDEED_COOKIES_FILE") or default_cookies_path()
    profile_dir = default_profile_dir()

    print("\nIndeed – SeleniumBase (Undetected Chrome)\n")
    print(f"URL: {url}")
    print(f"Profile: {profile_dir} (session saved; you usually pass Cloudflare only once)")
    print(f"Cookies will be saved to: {out_path}\n")
    print("A Chrome window will open. If Cloudflare appears, complete the check.")
    print("When the Indeed job search page has loaded, press ENTER to export cookies.\n")

    driver = None
    try:
        driver = Driver(uc=True, user_data_dir=profile_dir)
        driver.get(url)

        time.sleep(2)

        input("When the page has loaded (and any Cloudflare check is done), press ENTER to export cookies... ")

        cookies = driver.get_cookies()

        editor_cookies = []
        for c in cookies:
            d = (c.get("domain") or "").lower()
            if "indeed" in d or "cloudflare" in d:
                editor_cookies.append(cookie_to_editor(c))

        if not editor_cookies:
            editor_cookies = [cookie_to_editor(c) for c in cookies]

        Path(out_path).parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(editor_cookies, f, indent=2)

        print(f"\nExported {len(editor_cookies)} cookies to {out_path}")
        print("You can now run Indeed Playwright/scan scripts with these cookies.")
        return 0

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
