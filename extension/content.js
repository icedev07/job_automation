(() => {
  let scanning = false;
  let stopRequested = false;
  let stats = { checked: 0, approved: 0, hidden: 0, skipped: 0 };
  let currentStatus = "Idle";
  let serverUrl = "";
  let apiKey = "";

  function log(msg) {
    console.log(`[JobScanner] ${msg}`);
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "GET_STATUS") {
      log("GET_STATUS received");
      sendResponse({ running: scanning, stats, statusMsg: currentStatus });
      return true;
    }
    if (msg.type === "START_SCAN") {
      log(`START_SCAN received. serverUrl=${msg.serverUrl}, scanning=${scanning}`);
      if (scanning) {
        log("Already scanning, ignoring duplicate START_SCAN.");
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
      log("STOP_SCAN received");
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

  function getJobCards() {
    const selectors = [
      ".scaffold-layout__list-container .scaffold-layout__list-item",
      ".scaffold-layout__list-container li.ember-view",
      ".jobs-search-results-list li.jobs-search-results__list-item",
      ".jobs-search-results-list li.ember-view",
      "li[data-occludable-job-id]",
      ".jobs-search__results-list li",
      "ul.scaffold-layout__list-container > li",
      ".scaffold-layout__list > div > ul > li",
    ];
    for (const sel of selectors) {
      const cards = document.querySelectorAll(sel);
      if (cards.length > 0) {
        log(`Found ${cards.length} cards with selector: ${sel}`);
        return Array.from(cards);
      }
    }

    // Fallback: find any list items that contain job links
    const allLis = document.querySelectorAll("li");
    const jobLis = Array.from(allLis).filter(li => {
      const link = li.querySelector("a[href*='/jobs/view/']");
      return link && li.offsetHeight > 50;
    });
    if (jobLis.length > 0) {
      log(`Fallback: found ${jobLis.length} li elements with job links`);
      return jobLis;
    }

    // Debug: log what we can see
    const mainEl = document.querySelector("main") || document.querySelector("[role='main']");
    const listContainer = document.querySelector(".scaffold-layout__list-container") ||
                          document.querySelector(".scaffold-layout__list") ||
                          document.querySelector("[class*='jobs-search-results']");
    log(`No job cards found. main=${mainEl?.className?.substring(0, 100)}, listContainer=${listContainer?.className?.substring(0, 100)}, listChildren=${listContainer?.children?.length || 0}`);

    if (listContainer) {
      const children = listContainer.querySelectorAll("li, div[data-job-id], div[class*='job-card']");
      if (children.length > 0) {
        log(`Found ${children.length} alternative children in list container`);
        return Array.from(children).filter(el => el.offsetHeight > 40);
      }
    }

    return [];
  }

  function getDetailPanel() {
    const selectors = [
      ".jobs-search__job-details--container",
      ".jobs-search__job-details",
      ".job-details-jobs-unified-top-card",
      ".jobs-details__main-content",
      ".jobs-unified-top-card",
      "[class*='job-details']",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function extractJobUrl() {
    const match = window.location.href.match(/currentJobId=(\d+)/);
    if (match) return `https://www.linkedin.com/jobs/view/${match[1]}`;

    const match2 = window.location.href.match(/\/jobs\/view\/(\d+)/);
    if (match2) return `https://www.linkedin.com/jobs/view/${match2[1]}`;

    const detail = getDetailPanel();
    if (detail) {
      const link = detail.querySelector("a[href*='/jobs/view/']");
      if (link) return link.href.split("?")[0];
    }

    return window.location.href;
  }

  function extractTitle() {
    const selectors = [
      ".job-details-jobs-unified-top-card__job-title a",
      ".job-details-jobs-unified-top-card__job-title h1",
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title a",
      ".jobs-unified-top-card__job-title",
      "h1.t-24",
      "h2.t-24",
      "h1[class*='job-title']",
      ".jobs-details__main-content h1",
      "a.job-card-list__title",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const t = el.textContent.trim();
        if (t) { log(`Title found with ${sel}: "${t}"`); return t; }
      }
    }
    log("Could not extract title");
    return "";
  }

  function extractCompany() {
    const selectors = [
      ".job-details-jobs-unified-top-card__company-name a",
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name a",
      ".jobs-unified-top-card__company-name",
      ".job-details-jobs-unified-top-card__primary-description-container .app-aware-link",
      ".jobs-details__main-content [class*='company-name']",
      "span.jobs-unified-top-card__subtitle-primary-grouping a",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const t = el.textContent.trim();
        if (t) { log(`Company found with ${sel}: "${t}"`); return t; }
      }
    }
    log("Could not extract company");
    return "";
  }

  function extractLocation() {
    const selectors = [
      ".job-details-jobs-unified-top-card__primary-description-container .tvm__text",
      ".job-details-jobs-unified-top-card__primary-description-container span",
      ".jobs-unified-top-card__bullet",
      "span[class*='workplace-type']",
      ".jobs-unified-top-card__subtitle-primary-grouping span:nth-child(2)",
    ];
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const t = el.textContent.trim();
        if (t && !t.match(/^\d+ (applicant|hour|day|week|month|minute)/i) && t.length > 2 && t.length < 100) {
          log(`Location: "${t}"`);
          return t;
        }
      }
    }
    return "";
  }

  function extractDescription() {
    const selectors = [
      "#job-details > div",
      "#job-details",
      ".jobs-description-content__text",
      ".jobs-description__content",
      ".jobs-box__html-content",
      "[class*='jobs-description']",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const t = el.innerText.trim();
        if (t.length > 30) {
          log(`Description found (${t.length} chars) with ${sel}`);
          return t;
        }
      }
    }
    log("Could not extract description");
    return "";
  }

  function isEasyApply() {
    const buttons = document.querySelectorAll("button.jobs-apply-button, button[class*='apply']");
    for (const btn of buttons) {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes("easy apply") && btn.offsetParent !== null) {
        log("Easy Apply detected (button)");
        return true;
      }
    }
    const allBtns = document.querySelectorAll("button");
    for (const btn of allBtns) {
      if (btn.textContent.trim().toLowerCase() === "easy apply") {
        log("Easy Apply detected (generic button)");
        return true;
      }
    }
    const badges = document.querySelectorAll("[class*='easy-apply'], [class*='easyApply'], .jobs-apply-button--top-card");
    for (const badge of badges) {
      if (badge.textContent.toLowerCase().includes("easy apply")) {
        log("Easy Apply detected (badge)");
        return true;
      }
    }
    return false;
  }

  async function clickNotInterested(card) {
    try {
      const menuBtn = card.querySelector("button[aria-label*='Dismiss'], button[aria-label*='dismiss']") ||
                       card.querySelector("button[aria-label*='options'], button[aria-label*='More actions']") ||
                       card.querySelector("button[class*='job-card-list__entity-lockup-actions']");
      if (menuBtn) {
        log("Clicking menu button...");
        menuBtn.click();
        await sleep(600);
      }

      const menuItems = document.querySelectorAll("div[role='menu'] li, div[role='menu'] button, ul[role='menu'] li, li[role='menuitem'], div.artdeco-dropdown__content li");
      for (const item of menuItems) {
        const text = item.textContent.trim().toLowerCase();
        if (text.includes("not interested") || text.includes("hide this") || text.includes("dismiss")) {
          log(`Clicking: "${item.textContent.trim()}"`);
          item.click();
          await sleep(500);
          return true;
        }
      }

      const dismissBtns = document.querySelectorAll("button[aria-label*='Dismiss'], button[aria-label*='dismiss']");
      for (const btn of dismissBtns) {
        if (btn.offsetParent !== null) {
          log("Clicking dismiss button directly");
          btn.click();
          await sleep(400);
          return true;
        }
      }

      log("Could not find Not Interested / Dismiss button");
    } catch (e) {
      log(`Error in clickNotInterested: ${e.message}`);
    }
    return false;
  }

  async function analyzeOnServer(jobData) {
    const url = `${serverUrl}/api/extension/analyze`;
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["X-API-Key"] = apiKey;

    log(`POST ${url} - "${jobData.title}" at ${jobData.company}`);

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(jobData),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      log(`Server responded ${res.status}: ${errBody.substring(0, 200)}`);
      throw new Error(`Server error ${res.status}: ${errBody.substring(0, 100)}`);
    }

    const result = await res.json();
    log(`Server result: action=${result.action}, score=${result.score}, reason=${result.reason?.substring(0, 80)}`);
    return result;
  }

  async function processCard(card, index) {
    if (stopRequested) return "stopped";

    sendProgress(`Checking job ${index + 1}...`);

    const clickTarget = card.querySelector("a[href*='/jobs/view/']") ||
                         card.querySelector("a[class*='job-card-list__title']") ||
                         card.querySelector("a[class*='job-card-container__link']") ||
                         card;
    log(`Clicking card ${index + 1}: ${clickTarget.tagName} ${clickTarget.className?.substring(0, 50)}`);
    clickTarget.click();
    await sleep(2000);

    await waitForSelector("#job-details, .jobs-description-content__text, .job-details-jobs-unified-top-card", document, 8000);
    await sleep(500);

    const title = extractTitle();
    const company = extractCompany();
    const location = extractLocation();
    const description = extractDescription();
    const jobUrl = extractJobUrl();
    const easyApply = isEasyApply();

    log(`Extracted: title="${title}", company="${company}", loc="${location}", desc=${description.length}chars, url=${jobUrl}, easyApply=${easyApply}`);

    if (!title || !company) {
      stats.skipped++;
      sendProgress(`Skipped job ${index + 1}: could not extract title/company`);
      return "skipped";
    }

    sendProgress(`Analyzing: ${title} at ${company}...`);

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

      if (result.action === "easy_apply" || result.action === "rejected") {
        stats.hidden++;
        sendProgress(`Hidden: ${title} (${result.reason || result.action})`);
        const hidden = await clickNotInterested(card);
        log(`Hide attempt result: ${hidden}`);
        await sleep(300);
        return "hidden";
      }

      if (result.action === "approved") {
        stats.approved++;
        sendProgress(`Approved: ${title} at ${company} (score: ${result.score})`);
        return "approved";
      }

      if (result.action === "skipped" || result.alreadyExists) {
        stats.skipped++;
        sendProgress(`Skipped: ${title} (already processed)`);
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
      sendProgress(`Error on ${title}: ${err.message}`);
      return "error";
    }
  }

  async function goToNextPage() {
    const nextSelectors = [
      "button[aria-label='View next page']",
      "button[aria-label='Next']",
      "li.artdeco-pagination__indicator--number.active + li button",
      ".artdeco-pagination__button--next",
    ];
    for (const sel of nextSelectors) {
      const btn = document.querySelector(sel);
      if (btn && !btn.disabled && btn.offsetParent !== null) {
        log(`Clicking next page: ${sel}`);
        btn.click();
        await sleep(2500);
        await waitForSelector(".jobs-search-results__list-item, .scaffold-layout__list-container li, li.ember-view", document, 8000);
        await sleep(1500);
        return true;
      }
    }
    log("No next page button found");
    return false;
  }

  async function startScan() {
    log("=== SCAN STARTED ===");
    sendProgress("Starting scan...");

    let pageNum = 1;

    while (!stopRequested) {
      sendProgress(`Scanning page ${pageNum}...`);
      await sleep(1500);

      const cards = getJobCards();
      if (cards.length === 0) {
        sendDone(`Done. No job cards found on page ${pageNum}. Total: ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
        return;
      }

      sendProgress(`Page ${pageNum}: found ${cards.length} jobs`);

      for (let i = 0; i < cards.length; i++) {
        if (stopRequested) {
          sendDone(`Stopped by user. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
          return;
        }
        await processCard(cards[i], i);
        await sleep(1000);
      }

      sendProgress(`Page ${pageNum} done. Going to next page...`);
      const hasNext = await goToNextPage();
      if (!hasNext) {
        sendDone(`Scan complete. No more pages. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
        return;
      }

      pageNum++;
    }

    sendDone(`Stopped. ${stats.checked} checked, ${stats.approved} approved, ${stats.hidden} hidden.`);
  }

  log("Content script loaded on: " + window.location.href);
})();
