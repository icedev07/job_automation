import * as path from "path";
import * as fs from "fs";

const DEFAULT_RELATIVE = path.join("Resumes_Mohan", "Mohan_experience_inventory.md");

/**
 * Optional expanded experience bank for Mohan (userId=2).
 * Edit the markdown file — base resume sample remains the structural source for Word output.
 */
export function loadMohanExperienceInventory(): string {
  const env = process.env.MOHAN_EXPERIENCE_INVENTORY_PATH?.trim();
  const candidates = [
    env && (path.isAbsolute(env) ? env : path.join(process.cwd(), env)),
    path.join(process.cwd(), DEFAULT_RELATIVE),
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, "utf-8").trim();
    }
  }
  return "";
}
