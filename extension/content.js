(() => {
  if (window.__jobScannerLoaded) return;
  window.__jobScannerLoaded = true;

  let scanning = false;
  let stopRequested = false;
  let stats = { checked: 0, approved: 0, hidden: 0, skipped: 0 };
  let currentStatus = "Idle";
  let serverUrl = "";
  let apiKey = "";
  const MIN_VALID_CARDS_THRESHOLD = 3;
  const MIN_BROAD_CARDS_FOR_MISMATCH = 10;

  function log(msg, level) {
    console.log(`[JobScanner] ${msg}`);
    try {
      chrome.runtime.sendMessage({ type: "SCAN_LOG", level: level || "debug", message: msg }).catch(() => {});
    } catch (e) {}
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "GET_STATUS") {
      sendResponse({ running: scanning, stats, statusMsg: currentStatus });
      return true;
    }
    if (msg.type === "START_SCAN") {
      log(`START_SCAN received. serverUrl=${msg.serverUrl}, scanning=${scanning}`);
      if (scanning) {
        sendResponse({ ok: false, reason: "already scanning" });
        return true;
      }
      scanning = true;
      serverUrl = msg.serverUrl;
      apiKey = msg.apiKey || "";
      stats = { checked: 0, approved: 0, hidden: 0, skipped: 0 };
      stopRequested = false;
      sendResponse({ ok: true });
      startScan();
      return true;
    }
    if (msg.type === "STOP_SCAN") {
      stopRequested = true;
      sendResponse({ ok: true });
      return true;
    }
  });

  function sendProgress(statusMsg, currentJob) {
    currentStatus = statusMsg;
    log(`Progress: ${statusMsg}`);
    const payload = { type: "SCAN_PROGRESS", stats: { ...stats }, statusMsg };
    if (currentJob !== undefined) payload.currentJob = currentJob;
    chrome.runtime.sendMessage(payload).catch(() => {});
  }

  function sendResult(result) {
    chrome.runtime.sendMessage({ type: "SCAN_RESULT", result }).catch(() => {});
  }

  function sendDone(statusMsg) {
    currentStatus = statusMsg;
    scanning = false;
    log(`Done: ${statusMsg}`);
    chrome.runtime.sendMessage({ type: "SCAN_DONE", stats: { ...stats }, statusMsg }).catch(() => {});
  }

  function sendNavigating(statusMsg) {
    currentStatus = statusMsg;
    log(statusMsg);
    return chrome.runtime.sendMessage({ type: "SCAN_NAVIGATING", stats: { ...stats }, statusMsg }).catch(() => {});
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function waitForSelector(sel, parent, timeoutMs = 8000) {
    return new Promise((resolve) => {
      const el = (parent || document).querySelector(sel);
      if (el) return resolve(el);
      const observer = new MutationObserver(() => {
        const found = (parent || document).querySelector(sel);
        if (found) { observer.disconnect(); resolve(found); }
      });
      observer.observe(parent || document.body, { childList: true, subtree: true });
      setTimeout(() => { observer.disconnect(); resolve(null); }, timeoutMs);
    });
  }

  // --- JOB CARD DETECTION ---

  function getCardJobId(card) {
    if (!card) return "";
    if (card.matches?.("[data-job-id]")) {
      return (card.getAttribute("data-job-id") || "").trim();
    }
    return (card.querySelector("[data-job-id]")?.getAttribute("data-job-id") || "").trim();
  }

  function isInsideNonResultsSection(el) {
    return !!(el?.closest("#jobs-search-results-footer") || el?.closest(".continuous-discovery-modules"));
  }

  function isValidJobCardElement(el) {
    if (!el || isInsideNonResultsSection(el)) return false;
    const jobId = getCardJobId(el);
    if (!jobId || jobId === "search") return false;
    return !!el.querySelector("a[href*='/jobs/view/']");
  }

  function getPageSignature() {
    const pageState = findPageState();
    if (pageState) return `p:${pageState.current}/${pageState.total}`;
    const cards = getJobCards();
    const firstId = cards[0] ? getCardJobId(cards[0]) : "";
    return `f:${firstId || "none"}:${cards.length}`;
  }

  function getBroadJobLikeCardCount() {
    return Array.from(document.querySelectorAll("li[data-occludable-job-id], div.job-card-container, [data-job-id]"))
      .filter((el) => !isInsideNonResultsSection(el))
      .filter((el) => {
        const jobId = getCardJobId(el);
        if (jobId && jobId !== "search") return true;
        return !!el.querySelector("a[href*='/jobs/view/']");
      })
      .length;
  }

  function assessResultsHealth(validCards) {
    const pageState = findPageState();
    const isLastPage = !!(pageState && pageState.current >= pageState.total);
    const broadCount = getBroadJobLikeCardCount();
    const validCount = validCards.length;

    if (validCount === 0 && broadCount > 0 && !isLastPage) {
      return {
        suspicious: true,
        reason: `No valid cards extracted but ${broadCount} job-like elements are present.`,
        validCount,
        broadCount,
      };
    }

    const severeMismatch =
      validCount > 0 &&
      validCount < MIN_VALID_CARDS_THRESHOLD &&
      broadCount >= MIN_BROAD_CARDS_FOR_MISMATCH &&
      validCount * 3 < broadCount &&
      !isLastPage;

    if (severeMismatch) {
      return {
        suspicious: true,
        reason: `Only ${validCount} valid cards extracted while ${broadCount} job-like elements are present.`,
        validCount,
        broadCount,
      };
    }

    return { suspicious: false, reason: "", validCount, broadCount };
  }

  function getJobCards() {
    const primaryList =
      document.querySelector(".scaffold-layout__list ul") ||
      document.querySelector(".jobs-search-results-list ul") ||
      document.querySelector("ul.scaffold-layout__list-container") ||
      document.querySelector("ul[role='list']");

    if (primaryList) {
      // Restrict to the real left-rail search results only.
      const primaryCards = Array.from(
        primaryList.querySelectorAll("li[data-occludable-job-id], li.scaffold-layout__list-item"),
      ).filter(isValidJobCardElement);

      if (primaryCards.length > 0) {
        log(`Found ${primaryCards.length} cards in primary results list`);
        return primaryCards;
      }
    }

    // LinkedIn job cards have data-job-id or class job-card-container.
    // Keep this fallback for older layouts where the list root selector differs.
    const selectors = [
      ".scaffold-layout__list-container li.ember-view",
      "li[data-occludable-job-id]",
      ".scaffold-layout__list-container .scaffold-layout__list-item",
      "li div.job-card-container",
      "div.job-card-container",
    ];
    for (const sel of selectors) {
      const cards = Array.from(document.querySelectorAll(sel))
        .filter(isValidJobCardElement);
      if (cards.length > 0) {
        log(`Found ${cards.length} cards with selector: ${sel}`);
        return cards;
      }
    }

    // Fallback: find any elements with data-job-id
    const dataJobIds = Array.from(document.querySelectorAll("[data-job-id]")).filter(isValidJobCardElement);
    if (dataJobIds.length > 0) {
      log(`Fallback: found ${dataJobIds.length} elements with data-job-id`);
      return dataJobIds;
    }

    // Last fallback: li items containing job links
    const allLis = document.querySelectorAll("li");
    const jobLis = Array.from(allLis).filter((li) => {
      if (isInsideNonResultsSection(li)) return false;
      const href = li.querySelector("a[href*='/jobs/view/']");
      const hasDataId = li.querySelector("[data-job-id]");
      return !!href && !!hasDataId && li.offsetHeight > 50;
    });
    if (jobLis.length > 0) {
      log(`Last fallback: found ${jobLis.length} li elements with job links`);
      return jobLis;
    }

    log("No job cards found.");
    return [];
  }

  // --- EASY APPLY DETECTION (from the job card in the list, NOT the detail panel) ---

  function isEasyApplyFromCard(card) {
    // The most reliable indicator: the card footer has "Easy Apply" text with LinkedIn icon
    const footerItems = card.querySelectorAll(".job-card-container__footer-item, li");
    for (const item of footerItems) {
      const text = item.textContent.trim().toLowerCase();
      if (text.includes("easy apply")) {
        log("Easy Apply detected from card footer text");
        return true;
      }
    }

    // Also check for the LinkedIn bug icon followed by "Easy Apply"
    const svgs = card.querySelectorAll("svg[data-test-icon='linkedin-bug-color-small']");
    if (svgs.length > 0) {
      const parent = svgs[0].closest("li") || svgs[0].parentElement;
      if (parent && parent.textContent.toLowerCase().includes("easy apply")) {
        log("Easy Apply detected from LinkedIn bug icon in card");
        return true;
      }
    }

    return false;
  }

  // --- DETAIL PANEL EXTRACTION ---

  function getDetailContainer() {
    return document.querySelector(".jobs-search__job-details--container") ||
           document.querySelector(".jobs-search__job-details--wrapper") ||
           document.querySelector(".jobs-details__main-content");
  }

  function extractJobUrl() {
    // Try currentJobId from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const currentJobId = urlParams.get("currentJobId");
    if (currentJobId) return `https://www.linkedin.com/jobs/view/${currentJobId}`;

    // Try from URL path
    const pathMatch = window.location.href.match(/\/jobs\/view\/(\d+)/);
    if (pathMatch) return `https://www.linkedin.com/jobs/view/${pathMatch[1]}`;

    // Try from detail panel link
    const detail = getDetailContainer();
    if (detail) {
      const link = detail.querySelector("a[href*='/jobs/view/']");
      if (link) {
        const m = link.href.match(/\/jobs\/view\/(\d+)/);
        if (m) return `https://www.linkedin.com/jobs/view/${m[1]}`;
      }
    }

    // Try from data-job-id on the active card
    const activeCard = document.querySelector(".jobs-search-two-pane__job-card-container--viewport-tracking-0, [aria-current='page']");
    if (activeCard) {
      const jobId = activeCard.getAttribute("data-job-id") || activeCard.closest("[data-job-id]")?.getAttribute("data-job-id");
      if (jobId) return `https://www.linkedin.com/jobs/view/${jobId}`;
    }

    return window.location.href;
  }

  function decodeJsonString(s) {
    try {
      return JSON.parse(`"${s.replace(/"/g, '\\"')}"`);
    } catch {
      return s.replace(/\\u002F/gi, "/").replace(/\\\//g, "/");
    }
  }

  function tidyApplyUrl(raw) {
    if (!raw) return "";
    try {
      const abs = new URL(raw, window.location.origin);
      const redirectTarget =
        abs.searchParams.get("url") ||
        abs.searchParams.get("target") ||
        abs.searchParams.get("targetUrl") ||
        abs.searchParams.get("redirectUrl");
      if (redirectTarget) {
        try {
          return new URL(redirectTarget).toString();
        } catch {
          return redirectTarget;
        }
      }
      return abs.toString();
    } catch {
      return raw;
    }
  }

  function findApplyUrlInEmbeddedJson() {
    const currentId =
      new URLSearchParams(window.location.search).get("currentJobId") ||
      (window.location.href.match(/\/jobs\/view\/(\d+)/) || [])[1] ||
      "";
    const blobs = [
      ...Array.from(document.querySelectorAll("code")),
      ...Array.from(document.querySelectorAll("script[type='application/json']")),
      ...Array.from(document.querySelectorAll("script[type='application/ld+json']")),
    ];
    const candidates = [];
    for (const node of blobs) {
      const text = node.textContent || "";
      if (!text || text.length < 100) continue;
      if (
        !text.includes("companyApplyUrl") &&
        !text.includes("applyUrl") &&
        !text.includes("externalApplyUrl") &&
        !text.includes("offsiteApplyUrl") &&
        !text.includes("OffsiteApply")
      ) {
        continue;
      }
      const re = /"(?:companyApplyUrl|applyUrl|externalApplyUrl|offsiteApplyUrl)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g;
      const matches = text.matchAll(re);
      for (const m of matches) {
        const url = m[1];
        if (!url) continue;
        const decoded = decodeJsonString(url);
        if (!/^https?:\/\//i.test(decoded)) continue;
        const isLinkedInRedirect = /linkedin\.com\/(redir|jobs\/view)/i.test(decoded);
        const mentionsCurrentJob = currentId && text.includes(currentId);
        candidates.push({ url: decoded, mentionsCurrentJob, isLinkedInRedirect });
      }
    }
    if (candidates.length === 0) return "";
    candidates.sort((a, b) => {
      // prefer entries belonging to the currently open job, then non-linkedin redirect URLs
      if (a.mentionsCurrentJob !== b.mentionsCurrentJob) return a.mentionsCurrentJob ? -1 : 1;
      if (a.isLinkedInRedirect !== b.isLinkedInRedirect) return a.isLinkedInRedirect ? 1 : -1;
      return 0;
    });
    return candidates[0].url;
  }

  function extractApplyUrl() {
    const detail = getDetailContainer() || document;
    const selectors = [
      "a[data-live-test-job-apply-button]",
      ".jobs-apply-button a",
      "a.jobs-apply-button",
      "a[href*='offsite']",
      "a[href*='externalApply']",
      "a[href*='linkedin.com/redir/redirect']",
    ];
    for (const sel of selectors) {
      const link = detail.querySelector(sel) || document.querySelector(sel);
      if (!link) continue;
      const href = (link.getAttribute("href") || "").trim();
      if (!href) continue;
      const tidied = tidyApplyUrl(href);
      if (tidied) return tidied;
    }

    // Fallback 1: read href off the apply button if LinkedIn ever stamps one on the <button>
    const btn =
      detail.querySelector("button[data-live-test-job-apply-button]") ||
      document.querySelector("button[data-live-test-job-apply-button]") ||
      document.querySelector("#jobs-apply-button-id");
    if (btn) {
      const dataAttrs = ["data-apply-url", "data-href", "data-job-apply-url"];
      for (const attr of dataAttrs) {
        const v = btn.getAttribute(attr);
        if (v && /^https?:\/\//i.test(v)) return tidyApplyUrl(v);
      }

      // Some LinkedIn layouts wrap the apply button in an anchor while the
      // button itself has no href/data attrs.
      const wrappedLink = btn.closest("a[href]");
      if (wrappedLink) {
        const href = (wrappedLink.getAttribute("href") || "").trim();
        if (href) return tidyApplyUrl(href);
      }

      // Another common structure is an anchor sibling in the same button
      // container; prefer any offsite link we can find there.
      const btnContainer = btn.parentElement;
      const siblingLink = btnContainer?.querySelector("a[href]");
      if (siblingLink) {
        const href = (siblingLink.getAttribute("href") || "").trim();
        if (href) return tidyApplyUrl(href);
      }
    }

    // Fallback 2: scan embedded Voyager JSON blobs for companyApplyUrl / applyUrl
    const fromJson = findApplyUrlInEmbeddedJson();
    if (fromJson) return tidyApplyUrl(fromJson);

    return "";
  }

  function extractTitle() {
    const detail = getDetailContainer();
    const scope = detail || document;
    const selectors = [
      ".job-details-jobs-unified-top-card__job-title h1 a",
      ".job-details-jobs-unified-top-card__job-title h1",
      ".job-details-jobs-unified-top-card__job-title a",
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title a",
      ".jobs-unified-top-card__job-title",
      "h1.t-24.t-bold",
      "h1.t-24",
    ];
    for (const sel of selectors) {
      const el = scope.querySelector(sel);
      if (el) {
        const t = el.textContent.trim();
        if (t && t.length < 200) { log(`Title: "${t}" (${sel})`); return t; }
      }
    }
    log("Could not extract title from detail panel");
    return "";
  }

  function extractCompany() {
    const detail = getDetailContainer();
    const scope = detail || document;
    const selectors = [
      ".job-details-jobs-unified-top-card__company-name a",
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name a",
      ".jobs-unified-top-card__company-name",
    ];
    for (const sel of selectors) {
      const el = scope.querySelector(sel);
      if (el) {
        const t = el.textContent.trim();
        if (t && t.length < 100) { log(`Company: "${t}" (${sel})`); return t; }
      }
    }
    log("Could not extract company");
    return "";
  }

  function extractLocation() {
    const detail = getDetailContainer();
    const scope = detail || document;
    // Look for tvm__text spans in the tertiary description
    const tertiaryContainer = scope.querySelector(".job-details-jobs-unified-top-card__tertiary-description-container") ||
                               scope.querySelector(".job-details-jobs-unified-top-card__primary-description-container");
    if (tertiaryContainer) {
      const spans = tertiaryContainer.querySelectorAll("span.tvm__text");
      for (const span of spans) {
        const t = span.textContent.trim();
        // Skip time/applicant text, keep location-like text
        if (t && t.length > 2 && t.length < 100 &&
            !t.match(/^\d+ (applicant|people|hour|day|week|month|minute|second)/i) &&
            !t.match(/^(promoted|responses|viewed)/i) &&
            !t.match(/ago$/i)) {
          log(`Location: "${t}"`);
          return t;
        }
      }
    }

    // Fallback: look for workspace type buttons
    const buttons = (scope).querySelectorAll(".job-details-fit-level-preferences button");
    const types = [];
    for (const btn of buttons) {
      const t = btn.textContent.trim();
      if (t.match(/remote|hybrid|on-site/i)) types.push(t);
    }
    if (types.length > 0) {
      log(`Location from preferences: "${types.join(", ")}"`);
      return types.join(", ");
    }

    return "";
  }

  function extractDescription() {
    const selectors = [
      "#job-details",
      ".jobs-description-content__text",
      ".jobs-description__content",
      ".jobs-box__html-content",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const t = el.innerText.trim();
        if (t.length > 50) {
          log(`Description: ${t.length} chars (${sel})`);
          return t;
        }
      }
    }
    log("Could not extract description (too short or not found)");
    return "";
  }

  // --- SERVER COMMUNICATION ---

  async function analyzeOnServer(jobData) {
    const url = `${serverUrl}/api/extension/analyze`;
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["X-API-Key"] = apiKey;

    log(`POST ${url} - title="${jobData.title}", company="${jobData.company}", easyApply=${jobData.easyApply}, descLen=${jobData.description?.length || 0}`);

    const MAX_ATTEMPTS = 2;
    let lastErr = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(jobData),
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          log(`Server error ${res.status} (attempt ${attempt}/${MAX_ATTEMPTS}): ${errBody}`, "error");
          if (res.status >= 500 && attempt < MAX_ATTEMPTS) {
            await sleep(1500);
            continue;
          }
          throw new Error(`Server ${res.status}: ${errBody}`);
        }

        const result = await res.json();
        log(
          `Server response: action=${result.action}, alreadyExists=${result.alreadyExists}, linkedInDismiss=${result.linkedInDismiss}, score=${result.score}, reason="${result.reason || ""}", error="${result.error || ""}"`,
        );
        return result;
      } catch (err) {
        lastErr = err;
        log(`Fetch failed (attempt ${attempt}/${MAX_ATTEMPTS}): ${err.message}`, "warn");
        if (attempt < MAX_ATTEMPTS) {
          await sleep(2000);
        }
      }
    }

    throw lastErr || new Error("Unknown fetch failure");
  }

  // --- DISMISS / NOT INTERESTED ---

  async function clickDismiss(card) {
    try {
      // LinkedIn has a dismiss X button on each card
      const dismissBtn =
        card.querySelector("button[aria-label*='Dismiss']") ||
        card.querySelector("button[aria-label*='Not interested']") ||
        card.querySelector("button[aria-label*='Hide']") ||
        card.querySelector("button.job-card-container__action") ||
        card.querySelector("button[data-control-name*='dismiss']") ||
        card.querySelector("button[data-control-name*='not_interested']");
      if (dismissBtn) {
        log(`Clicking dismiss button: "${dismissBtn.getAttribute("aria-label") || "dismiss"}"`);
        dismissBtn.click();
        await sleep(500);
        return true;
      }

      // Fallback: try action buttons in the details panel when card-level action is unavailable.
      const detailDismiss =
        document.querySelector("button[aria-label*='Dismiss']") ||
        document.querySelector("button[aria-label*='Not interested']") ||
        document.querySelector("button[data-control-name*='dismiss']") ||
        document.querySelector("button[data-control-name*='not_interested']");
      if (detailDismiss) {
        log(`Clicking fallback dismiss button: "${detailDismiss.getAttribute("aria-label") || "dismiss"}"`);
        detailDismiss.click();
        await sleep(500);
        return true;
      }
      log("No dismiss button found on card");
    } catch (e) {
      log(`Error dismissing: ${e.message}`);
    }
    return false;
  }

  // --- PROCESS A SINGLE JOB CARD ---

  async function processCard(card, index, totalCards) {
    if (stopRequested) return "stopped";

    sendProgress(`Checking job ${index + 1}/${totalCards}...`);

    // Cards previously dismissed by an earlier scan come back wearing
    // `.job-card-list--is-dismissed` ("We won't show you this job again").
    // We want to re-process them so the current extractor can backfill
    // missing data (manual apply URL most importantly) on the existing DB
    // row. Click the per-card "undo" button to restore the card to its
    // active state, then fall through to the normal scan flow. The dedup
    // path in upsertScrapedJob will refresh the row's fields without
    // creating a duplicate, and analyzeJob short-circuits if the row was
    // already classified — so re-processing is cheap and safe.
    const innerCard = card.matches?.("[data-job-id]") ? card : card.querySelector("[data-job-id]");
    const dismissedTarget = innerCard || card;
    if (dismissedTarget.classList?.contains("job-card-list--is-dismissed")) {
      const undoBtn =
        card.querySelector("button[aria-label*='dismissed, undo']") ||
        card.querySelector("button[aria-label*='undo']");
      if (undoBtn) {
        log(`Job ${index + 1}: undismissing previously dismissed card to re-process.`);
        undoBtn.click();
        // Poll for the dismissed class to actually disappear instead of
        // sleeping a fixed amount. LinkedIn's React render after the click
        // is usually <300ms but can spike under load — give it up to 3s,
        // then proceed regardless.
        const undismissDeadline = Date.now() + 3000;
        while (
          dismissedTarget.classList?.contains("job-card-list--is-dismissed") &&
          Date.now() < undismissDeadline &&
          !stopRequested
        ) {
          await sleep(150);
        }
        if (dismissedTarget.classList?.contains("job-card-list--is-dismissed")) {
          log(`Job ${index + 1}: undo click did not flip card state in time; processing anyway.`);
        }
      } else {
        log(`Job ${index + 1}: dismissed but no undo button found; processing anyway.`);
      }
    }

    // First: check Easy Apply from the card BEFORE clicking it
    const easyApply = isEasyApplyFromCard(card);
    if (easyApply) {
      log(`Job ${index + 1}: Easy Apply detected from card`);
    }

    // Get job URL from the card link
    const cardLink = card.querySelector("a[href*='/jobs/view/']");
    const cardJobId = card.getAttribute("data-job-id") || card.closest("[data-job-id]")?.getAttribute("data-job-id");
    const cardTitle = card.querySelector(".job-card-list__title--link, a[class*='job-card-container__link']");
    const cardTitleText = cardTitle?.textContent?.trim() || "";
    const cardCompanyEl = card.querySelector(".artdeco-entity-lockup__subtitle span");
    const cardCompanyText = cardCompanyEl?.textContent?.trim() || "";

    const cardId = cardJobId || `idx-${index}-${Date.now()}`;

    log(`Card ${index + 1}: title="${cardTitleText}", company="${cardCompanyText}", easyApply=${easyApply}, jobId=${cardJobId}`);

    // Click the card to load the detail panel
    const clickTarget = cardLink || cardTitle || card;
    clickTarget.click();
    await sleep(2000);

    // Wait for detail panel to load
    await waitForSelector("#job-details, .job-details-jobs-unified-top-card__job-title", document, 8000);
    await sleep(800);

    // Extract from detail panel
    const title = extractTitle() || cardTitleText;
    const company = extractCompany() || cardCompanyText;
    const location = extractLocation();
    const description = extractDescription();
    const jobUrl = cardJobId
      ? `https://www.linkedin.com/jobs/view/${cardJobId}`
      : extractJobUrl();
    const applyUrl = easyApply ? "" : extractApplyUrl();

    log(`Extracted: title="${title}", company="${company}", location="${location}", desc=${description.length}chars, url=${jobUrl}, applyUrl=${applyUrl || "n/a"}`);

    async function maybeHideSkippedCard() {
      const dismissed = await clickDismiss(card);
      if (dismissed) {
        stats.hidden++;
      }
      return dismissed;
    }

    if (!title || !company) {
      stats.skipped++;
      await maybeHideSkippedCard();
      sendProgress(`Skipped ${index + 1}/${totalCards}: no title/company`, null);
      sendResult({
        id: cardId,
        index,
        total: totalCards,
        title: title || cardTitleText || "(unknown)",
        company: company || cardCompanyText || "(unknown)",
        location,
        url: jobUrl,
        status: "skipped",
        reason: "Could not extract title or company from card",
        score: 0,
        timestamp: new Date().toISOString(),
      });
      return "skipped";
    }

    // Mark this job as the currently-analyzing one (popup shows spinner)
    sendProgress(`Analyzing ${index + 1}/${totalCards}: ${title}...`, {
      id: cardId,
      index,
      total: totalCards,
      title,
      company,
      location,
      startedAt: Date.now(),
    });

    try {
      const result = await analyzeOnServer({
        title,
        company,
        location,
        url: jobUrl,
        applyUrl,
        description,
        easyApply,
      });

      stats.checked++;

      const baseResult = {
        id: cardId,
        index,
        total: totalCards,
        title,
        company,
        location,
        url: jobUrl,
        score: result.score || 0,
        reason: result.reason || "",
        timestamp: new Date().toISOString(),
      };

      if (result.alreadyExists || result.action === "skipped") {
        stats.skipped++;
        await maybeHideSkippedCard();
        sendProgress(`Already processed ${index + 1}: ${title}`, null);
        sendResult({ ...baseResult, status: "already_processed", reason: result.reason || "Already analyzed" });
        return "skipped";
      }

      if (result.action === "easy_apply") {
        stats.hidden++;
        sendProgress(`Easy Apply hidden ${index + 1}: ${title}`, null);
        sendResult({ ...baseResult, status: "easy_apply", reason: result.reason || "Easy Apply auto-rejected" });
        await clickDismiss(card);
        return "hidden";
      }

      if (result.action === "rejected") {
        const dismissOnLinkedIn = result.linkedInDismiss !== false;
        if (dismissOnLinkedIn) {
          stats.hidden++;
          sendProgress(`Rejected ${index + 1}: ${title} (${result.reason || ""})`, null);
          sendResult({ ...baseResult, status: "rejected" });
          await clickDismiss(card);
          return "hidden";
        }
        stats.skipped++;
        await maybeHideSkippedCard();
        sendProgress(`Analysis issue (card kept): ${index + 1}: ${title} (${result.reason || ""})`, null);
        sendResult({ ...baseResult, status: "analysis_issue" });
        return "skipped";
      }

      if (result.action === "approved") {
        stats.approved++;
        const hideApproved = await new Promise((resolve) =>
          chrome.storage.local.get(["hideApproved"], (d) => resolve(!!d.hideApproved))
        );
        if (hideApproved) {
          stats.hidden++;
          sendProgress(`Approved & hidden ${index + 1}: ${title} (score: ${result.score})`, null);
          sendResult({
            ...baseResult,
            status: "approved",
            reason: `${result.reason || ""}${result.reason ? " " : ""}[card hidden by 'Also hide approved jobs' setting]`,
          });
          await clickDismiss(card);
          return "approved";
        }
        sendProgress(`Approved ${index + 1}: ${title} (score: ${result.score})`, null);
        sendResult({ ...baseResult, status: "approved" });
        return "approved";
      }

      if (result.action === "error") {
        stats.skipped++;
        await maybeHideSkippedCard();
        sendProgress(`Server error for ${title}: ${result.error || "unknown"}`, null);
        sendResult({ ...baseResult, status: "error", reason: result.error || "Server error" });
        return "error";
      }

      stats.skipped++;
      await maybeHideSkippedCard();
      sendResult({ ...baseResult, status: "unknown", reason: result.reason || "Unknown server response" });
      return "unknown";
    } catch (err) {
      stats.skipped++;
      await maybeHideSkippedCard();
      sendProgress(`Error ${index + 1}: ${err.message}`, null);
      sendResult({
        id: cardId,
        index,
        total: totalCards,
        title,
        company,
        location,
        url: jobUrl,
        status: "error",
        score: 0,
        reason: err.message || "Network/server error",
        timestamp: new Date().toISOString(),
      });
      return "error";
    }
  }

  // --- PAGINATION ---

  async function scrollJobsListToBottom() {
    // LinkedIn renders pagination only after you scroll the list container to the bottom.
    const container = getResultsListContainer();
    if (!container) {
      log("No jobs list container found for scroll");
      return;
    }
    log("Scrolling jobs list to bottom to reveal pagination");
    let prev = -1;
    for (let i = 0; i < 10; i++) {
      container.scrollTop = container.scrollHeight;
      await sleep(400);
      if (container.scrollTop === prev) break;
      prev = container.scrollTop;
    }
    await sleep(500);
  }

  function getResultsListContainer() {
    const candidates = [
      document.querySelector(".scaffold-layout__list"),
      document.querySelector(".jobs-search-results-list"),
      document.querySelector(".scaffold-layout__list-container"),
      document.querySelector("div[data-results-list-top-scroll-sentinel]")?.parentElement || null,
    ].filter(Boolean);

    // Prefer the actual scrollable rail. Some LinkedIn layouts keep list items
    // virtualized under `.scaffold-layout__list`, and scrolling a non-scrollable
    // wrapper can miss cards.
    for (const node of candidates) {
      const el = node;
      if (el.scrollHeight > el.clientHeight + 20) return el;
    }

    return candidates[0] || null;
  }

  function findActivePageNumber() {
    // LinkedIn uses several pagination DOMs. Try each.
    const sel = document.querySelector("li.artdeco-pagination__indicator--number.active button, li.artdeco-pagination__indicator--number.selected button, button[aria-current='true']");
    if (sel) {
      const t = sel.textContent.trim();
      const n = parseInt(t, 10);
      if (!isNaN(n)) return n;
      const aria = sel.getAttribute("aria-label") || "";
      const m = aria.match(/Page (\d+)/i);
      if (m) return parseInt(m[1], 10);
    }
    // Newer jobs left-rail pagination exposes "Page X of Y".
    const pageState = document.querySelector(".jobs-search-pagination__page-state");
    if (pageState?.textContent) {
      const m = pageState.textContent.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
      if (m) {
        const current = parseInt(m[1], 10);
        const total = parseInt(m[2], 10);
        if (!isNaN(current) && !isNaN(total) && current <= total) return current;
      }
    }
    return null;
  }

  function findPageState() {
    const pageState = document.querySelector(".jobs-search-pagination__page-state");
    if (!pageState?.textContent) return null;
    const m = pageState.textContent.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
    if (!m) return null;
    const current = parseInt(m[1], 10);
    const total = parseInt(m[2], 10);
    if (isNaN(current) || isNaN(total)) return null;
    return { current, total };
  }

  function findPageButton(pageNum) {
    const candidates = [
      `button[aria-label='Page ${pageNum}']`,
      `button[aria-label="Page ${pageNum}"]`,
      `[data-test-pagination-page-btn='${pageNum}'] button`,
      `li[data-test-pagination-page-btn='${pageNum}'] button`,
    ];
    for (const sel of candidates) {
      const btn = document.querySelector(sel);
      if (btn && !btn.disabled && btn.offsetParent !== null) return btn;
    }
    // Fallback: scan all numbered buttons
    const all = document.querySelectorAll("li.artdeco-pagination__indicator--number button, button[aria-label^='Page ']");
    for (const btn of all) {
      const t = btn.textContent.trim();
      if (parseInt(t, 10) === pageNum && !btn.disabled && btn.offsetParent !== null) return btn;
    }
    return null;
  }

  async function goToNextPage() {
    await scrollJobsListToBottom();
    const beforeSignature = getPageSignature();

    const pageState = findPageState();
    if (pageState && pageState.current >= pageState.total) {
      log(`Reached last page (${pageState.current}/${pageState.total}), stopping pagination`);
      return false;
    }

    // Strategy 1: find the active page number and click N+1.
    const active = findActivePageNumber();
    if (active != null) {
      log(`Active page detected: ${active}`);
      const nextBtn = findPageButton(active + 1);
      if (nextBtn) {
        log(`Clicking page ${active + 1}`);
        nextBtn.click();
        await sleep(1200);
        const changed = await waitForPageChange(beforeSignature, 10000);
        if (!changed) {
          log("Page button clicked but page signature did not change", "warn");
          return false;
        }
        return true;
      }
      log(`Page ${active + 1} button not found (likely last page)`);
    }

    // Strategy 2: explicit Next button (older DOM).
    const nextSelectors = [
      "button[aria-label='View next page']",
      "button[aria-label='Next']",
      "button.artdeco-pagination__button--next",
      ".artdeco-pagination__button--next",
      "button.jobs-search-pagination__button--next",
      ".jobs-search-pagination__button--next",
    ];
    for (const sel of nextSelectors) {
      const btn = document.querySelector(sel);
      if (btn && !btn.disabled && btn.offsetParent !== null) {
        log(`Next page via fallback selector: ${sel}`);
        btn.click();
        await sleep(1200);
        const changed = await waitForPageChange(beforeSignature, 10000);
        if (!changed) {
          log("Next button clicked but page signature did not change", "warn");
          return false;
        }
        return true;
      }
    }

    // Strategy 3: URL-based pagination (start=N param).
    try {
      const url = new URL(window.location.href);
      const start = parseInt(url.searchParams.get("start") || "0", 10);
      const newStart = start + 25; // LinkedIn jobs uses 25-per-page
      url.searchParams.set("start", String(newStart));
      await sendNavigating(`Trying URL-based pagination: start=${newStart}`);
      window.location.href = url.toString();
      return "navigating";
    } catch (e) {
      log(`URL pagination failed: ${e.message}`);
    }

    log("No next page available (last page reached)");
    return false;
  }

  async function waitForPageChange(previousSignature, timeoutMs = 10000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline && !stopRequested) {
      const cards = getJobCards();
      const signature = getPageSignature();
      if (cards.length > 0 && signature !== previousSignature) {
        await sleep(600);
        return true;
      }
      await sleep(250);
    }
    return false;
  }

  function getCardStableId(card) {
    const jobId = getCardJobId(card);
    if (jobId) return `job:${jobId}`;
    const href = card.querySelector("a[href*='/jobs/view/']")?.getAttribute("href") || "";
    if (href) return `href:${href}`;
    return "";
  }

  async function processAllCardsOnCurrentPage(pageNum) {
    const seenIds = new Set();
    let processedCount = 0;
    let stagnantPasses = 0;
    const maxPasses = 80;

    for (let pass = 0; pass < maxPasses && !stopRequested; pass++) {
      const cards = getJobCards();
      let foundNew = 0;

      for (const card of cards) {
        if (stopRequested) break;
        const stableId = getCardStableId(card);
        if (!stableId || seenIds.has(stableId)) continue;
        seenIds.add(stableId);
        foundNew++;
        processedCount++;
        await processCard(card, processedCount - 1, processedCount);
        await sleep(1200);
      }

      const container = getResultsListContainer();
      if (!container) {
        log("No list container while scanning page; finishing current page pass");
        break;
      }

      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 6;
      if (foundNew === 0) {
        stagnantPasses++;
      } else {
        stagnantPasses = 0;
      }

      if (atBottom && stagnantPasses >= 2) {
        log(`Page ${pageNum}: reached bottom and no new cards found`);
        break;
      }
      if (stagnantPasses >= 5) {
        log(`Page ${pageNum}: stopping after repeated passes without new cards`);
        break;
      }

      const step = Math.max(300, Math.floor(container.clientHeight * 0.85));
      const nextScrollTop = Math.min(container.scrollTop + step, container.scrollHeight);
      if (nextScrollTop === container.scrollTop) {
        stagnantPasses++;
      } else {
        container.scrollTop = nextScrollTop;
      }
      await sleep(450);
    }

    log(`Page ${pageNum}: processed ${processedCount} unique jobs`);
    return processedCount;
  }

  // --- MAIN SCAN LOOP ---

  async function startScan() {
    log("=== SCAN STARTED ===");
    sendProgress("Starting scan...");

    const initialPageState = findPageState();
    let pageNum = initialPageState?.current || findActivePageNumber() || 1;

    while (!stopRequested) {
      sendProgress(`Scanning page ${pageNum}...`);
      await sleep(1500);

      let cards = getJobCards();
      const health = assessResultsHealth(cards);
      if (health.suspicious) {
        log(`Results health warning on page ${pageNum}: ${health.reason}`, "warn");
        await sleep(1500);
        const retryCards = getJobCards();
        const retryHealth = assessResultsHealth(retryCards);
        if (retryHealth.suspicious) {
          sendDone(
            `Safety stop: LinkedIn layout mismatch detected on page ${pageNum}. ` +
              `${retryHealth.reason} Please refresh and retry after verifying the UI. ` +
              `${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`,
          );
          return;
        }
        cards = retryCards;
      }

      if (cards.length === 0) {
        sendDone(`Done. No job cards found on page ${pageNum}. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
        return;
      }

      sendProgress(`Page ${pageNum}: scanning all jobs in list...`);

      const processedOnPage = await processAllCardsOnCurrentPage(pageNum);
      if (stopRequested) {
        sendDone(`Stopped. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
        return;
      }
      if (processedOnPage === 0) {
        sendDone(`Safety stop: No processable jobs found on page ${pageNum}. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
        return;
      }

      sendProgress(`Page ${pageNum} complete. Moving to next...`);
      const hasNext = await goToNextPage();
      if (hasNext === "navigating") {
        return;
      }
      if (!hasNext) {
        sendDone(`All pages scanned. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
        return;
      }

      pageNum++;
    }

    sendDone(`Stopped. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
  }

  function maybeResumeAfterNavigation() {
    chrome.runtime.sendMessage({ type: "GET_BG_STATE" }, (state) => {
      if (chrome.runtime.lastError || !state?.scanning || !state.resumeAfterNavigation || !state.isScanTab) return;
      chrome.storage.local.get(["extensionApiKey"], (data) => {
        if (!state.scanning || scanning) return;
        scanning = true;
        stopRequested = false;
        serverUrl = state.serverUrl || "";
        apiKey = data.extensionApiKey || "";
        stats = state.stats || { checked: 0, approved: 0, hidden: 0, skipped: 0 };
        startScan();
      });
    });
  }

  log("Content script loaded: " + window.location.href);
  maybeResumeAfterNavigation();
})();
