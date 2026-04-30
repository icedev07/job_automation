import * as path from "path";

/**
 * Base directory for browser profiles and exported cookie JSON files (~/.jobbot).
 * Override with JOBOT_DIR (same as npm run jobbot:clean-cache).
 */
export function getJobbotDir(): string {
  const raw = process.env.JOBOT_DIR?.trim();
  if (raw) {
    return path.resolve(raw.replace(/^["']|["']$/g, ""));
  }
  const home = process.env.USERPROFILE || process.env.HOME || ".";
  return path.join(home, ".jobbot");
}
