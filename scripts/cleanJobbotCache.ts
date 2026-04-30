/**
 * Clean .jobbot browser profile caches to free disk space.
 * Keeps cookies, Local Storage, and IndexedDB so you stay logged in.
 *
 * Usage:
 *   npm run jobbot:clean-cache           # run cleanup
 *   npm run jobbot:clean-cache -- --dry-run   # show what would be removed
 *
 * Optional env: JOBOT_DIR overrides ~/.jobbot (or %USERPROFILE%\.jobbot on Windows).
 */

import * as fs from "fs";
import * as path from "path";

const home = process.env.HOME || process.env.USERPROFILE || process.cwd();
const defaultJobbotDir = path.join(home, ".jobbot");
const jobbotDir = process.env.JOBOT_DIR
  ? path.resolve(process.env.JOBOT_DIR)
  : defaultJobbotDir;

/** Cache directory names safe to delete (relative to each profile, e.g. jobright, chatgpt). */
const CACHE_DIRS = [
  "Default/Cache",
  "Default/Code Cache",
  "Default/GPUCache",
  "Default/Favicons",
  "Default/Application Cache",
  "Default/Service Worker/CacheStorage",
  "Default/CacheStorage",
  "Default/blob_storage",
  "GrShaderCache",
  "optimization_guide_model_store",
  "Crashpad",
  "WasmTtsEngine",
  "Safe Browsing",
  "OnDeviceHeadSuggestModel",
  "component_crx_cache",
  "ShaderCache",
  "GraphiteDawn",
  "DawnCache",
  "GpuCache",
];

function getDirSize(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dirPath, e.name);
      if (e.isDirectory()) total += getDirSize(full);
      else total += fs.statSync(full).size;
    }
  } catch {
    // ignore permission errors
  }
  return total;
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024 * 1024) return (n / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(2) + " KB";
  return n + " B";
}

function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (!fs.existsSync(jobbotDir)) {
    console.log("No .jobbot directory found at:", jobbotDir);
    return;
  }

  const profiles = fs
    .readdirSync(jobbotDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  if (profiles.length === 0) {
    console.log("No profile directories in", jobbotDir);
    return;
  }

  console.log(dryRun ? "[DRY RUN] Would clean caches in:" : "Cleaning caches in:");
  console.log("  ", jobbotDir);
  console.log("  Profiles:", profiles.join(", "));
  console.log("");

  let totalFreed = 0;
  let totalRemoved = 0;

  for (const profile of profiles) {
    const profilePath = path.join(jobbotDir, profile);
    for (const cacheRel of CACHE_DIRS) {
      const cachePath = path.join(profilePath, cacheRel);
      if (!fs.existsSync(cachePath)) continue;

      const size = getDirSize(cachePath);
      totalFreed += size;
      totalRemoved += 1;

      if (dryRun) {
        console.log("  [would remove]", path.join(profile, cacheRel), formatBytes(size));
      } else {
        try {
          fs.rmSync(cachePath, { recursive: true, maxRetries: 2 });
          console.log("  removed", path.join(profile, cacheRel), formatBytes(size));
        } catch (err) {
          console.warn("  skip (in use?):", path.join(profile, cacheRel), String(err));
        }
      }
    }
  }

  console.log("");
  if (dryRun) {
    console.log("[DRY RUN] Would free:", formatBytes(totalFreed), "(", totalRemoved, "dirs)");
  } else {
    console.log("Freed:", formatBytes(totalFreed), "(", totalRemoved, "cache dirs removed)");
  }
}

main();
