# Verify the dev server is listening (0.0.0.0 or localhost)

If the browser can't load http://localhost:3000, check that the server is running and what address it's bound to.

## 1. Start the server

```bash
npm run dev
```

You should see something like:

```
▲ Next.js 14.x.x
- Local:    http://localhost:3000
- Network:  http://0.0.0.0:3000
✓ Ready in ...
```

- **Local: http://localhost:3000** – app is reachable on this machine at localhost.
- **Network: http://0.0.0.0:3000** – app is listening on all interfaces (only shown when using `--hostname 0.0.0.0`).

## 2. Check what is listening on port 3000 (Windows)

In **PowerShell** or **Command Prompt**:

```cmd
netstat -ano | findstr ":3000"
```

Example output:

```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       12345
TCP    [::]:3000              [::]:0                 LISTENING       12345
```

- **0.0.0.0:3000** – listening on all IPv4 addresses (browser can use localhost or 127.0.0.1).
- **127.0.0.1:3000** – listening only on loopback (localhost only).
- **LISTENING** – something is bound to port 3000 (your dev server if you just ran `npm run dev`).

If you see no line with `LISTENING` and `:3000`, the app is not listening on 3000 (wrong port, not started, or crashed).

## 3. Test from the command line (same machine)

In **PowerShell**:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:3000/api/health" -UseBasicParsing -TimeoutSec 10
```

If the server is running and reachable, you get **StatusCode 200**. If you get "connection refused" or timeout, the server isn’t accepting connections (not running, wrong port, or firewall).

## 4. This project’s dev script

- **`npm run dev`** – runs `next dev --turbo --hostname 0.0.0.0`, so the app listens on **0.0.0.0:3000** (all interfaces).
- **`npm run dev:3001`** – same but on port **3001** with **0.0.0.0**.

So after starting the server, **verify** with:

1. Next.js output (Local + Network URLs).
2. `netstat -ano | findstr ":3000"` (or `:3001` if using dev:3001).
3. `Invoke-WebRequest http://127.0.0.1:3000/api/health` (or port 3001).

If (2) shows LISTENING and (3) returns 200 but the browser still doesn’t load, the issue is usually browser, proxy, or firewall (not the server binding).
