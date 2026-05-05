(() => {
  if (window.__jobScannerLoaded) return;
  window.__jobScannerLoaded = true;

  let scanning = false;
  let stopRequested = false;
  let stats = { checked: 0, approved: 0, hidden: 0, skipped: 0 };
  let currentStatus = "Idle";
  let serverUrl = "";
  let apiKey = "";

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

  function sendProgress(statusMsg) {
    currentStatus = statusMsg;
    log(`Progress: ${statusMsg}`);
    chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", stats: { ...stats }, statusMsg }).catch(() => {});
  }

  function sendDone(statusMsg) {
    currentStatus = statusMsg;
    scanning = false;
    log(`Done: ${statusMsg}`);
    chrome.runtime.sendMessage({ type: "SCAN_DONE", stats: { ...stats }, statusMsg }).catch(() => {});
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

  function getJobCards() {
    // LinkedIn job cards have data-job-id or class job-card-container
    const selectors = [
      "div.job-card-container",
      "li div.job-card-container",
      ".scaffold-layout__list-container .scaffold-layout__list-item",
      ".scaffold-layout__list-container li.ember-view",
      "li[data-occludable-job-id]",
    ];
    for (const sel of selectors) {
      const cards = document.querySelectorAll(sel);
      if (cards.length > 0) {
        log(`Found ${cards.length} cards with selector: ${sel}`);
        return Array.from(cards);
      }
    }

    // Fallback: find any elements with data-job-id
    const dataJobIds = document.querySelectorAll("[data-job-id]");
    if (dataJobIds.length > 0) {
      log(`Fallback: found ${dataJobIds.length} elements with data-job-id`);
      return Array.from(dataJobIds);
    }

    // Last fallback: li items containing job links
    const allLis = document.querySelectorAll("li");
    const jobLis = Array.from(allLis).filter(li => {
      return li.querySelector("a[href*='/jobs/view/']") && li.offsetHeight > 50;
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

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(jobData),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      log(`Server error ${res.status}: ${errBody}`, "error");
      throw new Error(`Server ${res.status}: ${errBody}`);
    }

    const result = await res.json();
    log(
      `Server response: action=${result.action}, linkedInDismiss=${result.linkedInDismiss}, score=${result.score}, reason="${result.reason || ""}", error="${result.error || ""}"`,
    );
    return result;
  }

  // --- DISMISS / NOT INTERESTED ---

  async function clickDismiss(card) {
    try {
      // LinkedIn has a dismiss X button on each card
      const dismissBtn = card.querySelector("button[aria-label*='Dismiss']") ||
                          card.querySelector("button.job-card-container__action");
      if (dismissBtn) {
        log(`Clicking dismiss button: "${dismissBtn.getAttribute("aria-label") || "dismiss"}"`);
        dismissBtn.click();
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

    log(`Extracted: title="${title}", company="${company}", location="${location}", desc=${description.length}chars, url=${jobUrl}`);

    if (!title || !company) {
      stats.skipped++;
      sendProgress(`Skipped ${index + 1}/${totalCards}: no title/company`);
      return "skipped";
    }

    // Send to server
    sendProgress(`Analyzing ${index + 1}/${totalCards}: ${title}...`);

    try {
      const result = await analyzeOnServer({
        title,
        company,
        location,
        url: jobUrl,
        description,
        easyApply,
      });

      stats.checked++;

      if (result.action === "easy_apply") {
        stats.hidden++;
        sendProgress(`Easy Apply hidden ${index + 1}: ${title}`);
        await clickDismiss(card);
        return "hidden";
      }

      if (result.action === "rejected") {
        const dismissOnLinkedIn = result.linkedInDismiss !== false;
        if (dismissOnLinkedIn) {
          stats.hidden++;
          sendProgress(`Rejected ${index + 1}: ${title} (${result.reason || ""})`);
          await clickDismiss(card);
          return "hidden";
        }
        stats.skipped++;
        sendProgress(`Analysis issue (card kept): ${index + 1}: ${title} (${result.reason || ""})`);
        return "skipped";
      }

      if (result.action === "approved") {
        stats.approved++;
        sendProgress(`Approved ${index + 1}: ${title} (score: ${result.score})`);
        return "approved";
      }

      if (result.action === "skipped" || result.alreadyExists) {
        stats.skipped++;
        sendProgress(`Already processed ${index + 1}: ${title}`);
        return "skipped";
      }

      if (result.action === "error") {
        stats.skipped++;
        sendProgress(`Server error for ${title}: ${result.error || "unknown"}`);
        return "error";
      }

      stats.skipped++;
      return "unknown";
    } catch (err) {
      stats.skipped++;
      sendProgress(`Error ${index + 1}: ${err.message}`);
      return "error";
    }
  }

  // --- PAGINATION ---

  async function goToNextPage() {
    const selectors = [
      "button[aria-label='View next page']",
      "button[aria-label='Next']",
      ".artdeco-pagination__button--next",
      "li.artdeco-pagination__indicator--number.active + li button",
    ];
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn && !btn.disabled && btn.offsetParent !== null) {
        log(`Next page: ${sel}`);
        btn.click();
        await sleep(3000);
        await waitForSelector("div.job-card-container, li.ember-view a[href*='/jobs/view/']", document, 8000);
        await sleep(1500);
        return true;
      }
    }
    log("No next page button found or it's disabled");
    return false;
  }

  // --- MAIN SCAN LOOP ---

  async function startScan() {
    log("=== SCAN STARTED ===");
    sendProgress("Starting scan...");

    let pageNum = 1;

    while (!stopRequested) {
      sendProgress(`Scanning page ${pageNum}...`);
      await sleep(1500);

      const cards = getJobCards();
      if (cards.length === 0) {
        sendDone(`Done. No job cards found on page ${pageNum}. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
        return;
      }

      sendProgress(`Page ${pageNum}: ${cards.length} jobs found`);

      for (let i = 0; i < cards.length; i++) {
        if (stopRequested) {
          sendDone(`Stopped. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
          return;
        }
        await processCard(cards[i], i, cards.length);
        await sleep(1200);
      }

      sendProgress(`Page ${pageNum} complete. Moving to next...`);
      const hasNext = await goToNextPage();
      if (!hasNext) {
        sendDone(`All pages scanned. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
        return;
      }

      pageNum++;
    }

    sendDone(`Stopped. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
  }

  log("Content script loaded: " + window.location.href);
})();
