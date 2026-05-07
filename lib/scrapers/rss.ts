// Minimal RSS / Atom parser. Tradeoffs over a real XML lib: we accept that
// malformed feeds may be skipped, in exchange for a zero-dependency runtime
// that fits comfortably in a Vercel function. Sufficient for the public
// remote-job RSS feeds we target.

export type RssItem = {
  title: string;
  link: string;
  guid?: string;
  description?: string;
  contentEncoded?: string;
  pubDate?: string;
  categories?: string[];
};

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&[a-zA-Z]+;/g, (m) => ENTITY_MAP[m] ?? m);
}

function unwrapCdata(raw: string): string {
  const m = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return m ? m[1] : raw;
}

function pickTag(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  return decodeEntities(unwrapCdata(m[1].trim()));
}

function pickAllTags(block: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    out.push(decodeEntities(unwrapCdata(m[1].trim())));
  }
  return out;
}

export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  // Match both <item>...</item> (RSS) and <entry>...</entry> (Atom)
  const blockRe = /<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(xml)) !== null) {
    const block = m[2];
    const title = pickTag(block, "title") || "";
    let link = pickTag(block, "link") || "";
    if (!link) {
      // Atom uses <link href="..."/>
      const hrefMatch = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\/?>/i);
      if (hrefMatch) link = decodeEntities(hrefMatch[1]);
    }
    const guid = pickTag(block, "guid");
    const description = pickTag(block, "description") || pickTag(block, "summary");
    const contentEncoded = pickTag(block, "content:encoded") || pickTag(block, "content");
    const pubDate = pickTag(block, "pubDate") || pickTag(block, "published") || pickTag(block, "updated");
    const categories = pickAllTags(block, "category");
    if (!title || !link) continue;
    items.push({
      title,
      link,
      guid,
      description,
      contentEncoded,
      pubDate,
      categories: categories.length ? categories : undefined,
    });
  }
  return items;
}

export function stripHtml(html: string): string {
  if (!html) return "";
  // Some sources (Greenhouse) double-encode their HTML, so decode entities
  // first then strip tags. Run decode twice in case the source decoded once.
  const decoded = decodeEntities(decodeEntities(html));
  return decoded
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<\/li\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
