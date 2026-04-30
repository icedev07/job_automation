# Connection timeout (ERR_CONNECTION_TIMED_OUT) – what to try

If the dev server runs but the browser can’t load http://127.0.0.1:3000 (or :3001), try these in order.

---

## Workaround: use a tunnel (bypasses localhost/firewall)

If nothing below fixes it, you can still use the app by exposing it through a tunnel. The browser then talks to a public URL that forwards to your local server.

1. **Terminal 1** – start the dev server:
   ```bash
   npm run dev
   ```
   Wait until you see "Ready".

2. **Terminal 2** – start the tunnel:
   ```bash
   npm run tunnel
   ```
   You’ll see a URL like `https://something.loca.lt`. Copy it.

3. **Browser** – open that URL (e.g. `https://something.loca.lt`). The first time, localtunnel may show a “Click to continue” page; click it, then you should see your app. Use that URL for `/jobs` too (e.g. `https://something.loca.lt/jobs`).

This avoids localhost and firewall entirely. Only use it on your own machine; don’t leave the tunnel running if you’re not using the app.

---

## 1. Firewall (all network profiles)

Run **PowerShell as Administrator**:

```powershell
cd "C:\career-scrum-bot"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\scripts\allow-dev-server-firewall.ps1
```

Then restart the dev server and try the browser again.

## 2. Use port 3001 and 127.0.0.1

Sometimes port 3000 or the default host behaves differently. Start the app on another port:

```bash
npm run dev:3001
```

In the browser open: **http://127.0.0.1:3001**

## 3. Check if the browser can reach any local server

In one terminal:

```bash
npm run dev:test-server
```

In the browser open: **http://127.0.0.1:3099**

- If you see **“OK”** → the browser can reach a local server; the problem is likely specific to Next.js or port 3000. Use `npm run dev:3001` and open http://127.0.0.1:3001.
- If that also **times out** → something (firewall, antivirus, proxy) is blocking the browser from localhost. Try:
  - Temporarily disabling antivirus
  - Chrome: Settings → System → “Open proxy settings” and ensure no proxy for 127.0.0.1
  - Or try another browser (Edge, Firefox)

## 4. Chrome proxy bypass

If you use a proxy in Windows, make sure localhost is bypassed:

1. Chrome → Settings → search “proxy” → “Open your computer’s proxy settings”
2. Under “Manual proxy setup” or “Use a proxy server”, add to the bypass list: `127.0.0.1;localhost`

## 5. Run Chrome with proxy bypass (test only)

Close Chrome, then from a command prompt:

```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --proxy-bypass-list="127.0.0.1;localhost"
```

Open http://127.0.0.1:3000 again. If it works, your normal proxy/bypass settings are the cause.
