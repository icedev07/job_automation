#!/usr/bin/env python3
"""
ChatGPT: use SeleniumBase UC Mode (undetected Chrome) to pass Cloudflare, 
then export cookies to a JSON file for the Node/Playwright scripts to load.

Usage:
  pip install seleniumbase
  python scripts/chatgpt_seleniumbase.py

Then run your playwright scripts or backfill scripts.
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

def default_cookies_path() -> str:
    home = os.environ.get("HOME") or os.environ.get("USERPROFILE") or os.getcwd()
    jobbot = Path(home) / ".jobbot"
    jobbot.mkdir(parents=True, exist_ok=True)
    return str(jobbot / "chatgpt-cookies.json")

def default_profile_dir() -> str:
    path_env = os.environ.get("CHATGPT_NODRIVER_USER_DATA_DIR")
    if path_env and path_env.strip():
        return path_env.strip()
    home = os.environ.get("HOME") or os.environ.get("USERPROFILE") or os.getcwd()
    jobbot = Path(home) / ".jobbot"
    jobbot.mkdir(parents=True, exist_ok=True)
    return str(jobbot / "chatgpt-seleniumbase-profile")

def cookie_to_editor(c: dict) -> dict:
    domain = c.get("domain", "")
    if domain and not domain.startswith("."):
        domain = "." + domain
    
    path = c.get("path", "/")
    
    out = {
        "name": c.get("name", ""),
        "value": c.get("value", ""),
        "domain": domain or ".openai.com",
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

def _is_truthy(v: str | None) -> bool:
    return (v or "").strip().lower() in ("1", "true", "yes", "y", "on")

def wait_for_chat_ready(driver, timeout_sec: int = 300) -> bool:
    selectors = [
        "#prompt-textarea",
        'textarea[placeholder*="Message"]',
        'textarea[placeholder*="message"]',
        '[contenteditable="true"]',
        'div[role="textbox"]',
    ]
    for _ in range(max(1, timeout_sec)):
        try:
            ready = driver.execute_script(
                """
                const sels = arguments[0];
                for (const s of sels) {
                  const el = document.querySelector(s);
                  if (el) return true;
                }
                return false;
                """,
                selectors,
            )
            if ready:
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

    url = os.environ.get("CHATGPT_URL", "https://chat.openai.com")
    
    out_path = os.environ.get("CHATGPT_COOKIES_FILE") or default_cookies_path()
    profile_dir = default_profile_dir()
    unattended = _is_truthy(os.environ.get("CHATGPT_SELENIUMBASE_UNATTENDED"))
    unattended_wait_sec = max(60, int(os.environ.get("CHATGPT_SELENIUMBASE_WAIT_SECONDS", "300")))

    print("\nChatGPT – SeleniumBase (Undetected Chrome)\n")
    print(f"URL: {url}")
    print(f"Profile: {profile_dir} (session saved; you usually log in only once)")
    print(f"Cookies will be saved to: {out_path}\n")
    if unattended:
        print(
            "Mode: unattended (CHATGPT_SELENIUMBASE_UNATTENDED=1). "
            f"Waiting up to {unattended_wait_sec}s for chat input to appear.\n"
        )
    else:
        print("A Chrome window will open. If you haven't used this profile before: complete")
        print("Cloudflare if shown, then log in (e.g. with Google). When the chat interface")
        print("loads, press ENTER to export cookies. On later runs you may already be logged in.\n")

    driver = None
    try:
        driver = Driver(uc=True, user_data_dir=profile_dir)
        driver.get(url)
        
        time.sleep(2)
        
        if unattended:
            print("Waiting for chat composer (Cloudflare/login can complete in this browser profile)...")
            if not wait_for_chat_ready(driver, timeout_sec=unattended_wait_sec):
                print(
                    "Timed out waiting for chat interface in unattended mode. "
                    "Use interactive mode once to complete login/Cloudflare.",
                    file=sys.stderr,
                )
                return 1
        else:
            input("When the chat interface is loaded, press ENTER to export cookies... ")
        
        cookies = driver.get_cookies()
        
        editor_cookies = []
        for c in cookies:
            d = c.get("domain", "")
            if "openai" in d.lower() or "cloudflare" in d.lower() or "chatgpt" in d.lower():
                editor_cookies.append(cookie_to_editor(c))
                
        if not editor_cookies:
            editor_cookies = [cookie_to_editor(c) for c in cookies]
            
        Path(out_path).parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"cookies": editor_cookies, "userAgent": driver.execute_script("return navigator.userAgent")}, f, indent=2)
            
        print(f"\nExported {len(editor_cookies)} cookies to {out_path}")
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
