(() => {
  let scanning = false;
  let stopRequested = false;
  let stats = { checked: 0, approved: 0, hidden: 0, skipped: 0 };
  let currentStatus = "Idle";
  let serverUrl = "";
  let apiKey = "";

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "GET_STATUS") {
      sendResponse({ running: scanning, stats, statusMsg: currentStatus });
      return true;
    }
    if (msg.type === "START_SCAN") {
      if (scanning) return;
      serverUrl = msg.serverUrl;
      apiKey = msg.apiKey || "";
      stats = { checked: 0, approved: 0, hidden: 0, skipped: 0 };
      stopRequested = false;
      startScan();
      return;
    }
    if (msg.type === "STOP_SCAN") {
      stopRequested = true;
      return;
    }
  });

  function sendProgress(statusMsg) {
    currentStatus = statusMsg;
    chrome.runtime.sendMessage({ type: "SCAN_PROGRESS", stats: { ...stats }, statusMsg });
  }

  function sendDone(statusMsg) {
    currentStatus = statusMsg;
    scanning = false;
    chrome.runtime.sendMessage({ type: "SCAN_DONE", stats: { ...stats }, statusMsg });
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
      ".jobs-search-results-list .scaffold-layout__list-container li.jobs-search-results__list-item",
      ".jobs-search-results-list li.ember-view.occludable-update",
      ".jobs-search__results-list li",
      "ul.scaffold-layout__list-container > li",
    ];
    for (const sel of selectors) {
      const cards = document.querySelectorAll(sel);
      if (cards.length > 0) return Array.from(cards);
    }
    return [];
  }

  function getDetailPanel() {
    return document.querySelector(".jobs-search__job-details--container") ||
           document.querySelector(".job-details-jobs-unified-top-card") ||
           document.querySelector(".jobs-details__main-content") ||
           document.querySelector("[class*='job-details']");
  }

  function extractJobUrl() {
    const detail = getDetailPanel();
    if (!detail) return window.location.href;
    const link = detail.querySelector("a[href*='/jobs/view/']");
    if (link) return link.href.split("?")[0];
    const match = window.location.href.match(/\/jobs\/view\/(\d+)/);
    if (match) return `https://www.linkedin.com/jobs/view/${match[1]}`;
    return window.location.href;
  }

  function extractTitle() {
    const selectors = [
      ".job-details-jobs-unified-top-card__job-title a",
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title a",
      ".jobs-unified-top-card__job-title",
      "h1.t-24",
      "h2.t-24",
      "h1[class*='job-title']",
      ".jobs-details__main-content h1",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) { const t = el.textContent.trim(); if (t) return t; }
    }
    return "";
  }

  function extractCompany() {
    const selectors = [
      ".job-details-jobs-unified-top-card__company-name a",
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name a",
      ".jobs-unified-top-card__company-name",
      ".jobs-details__main-content [class*='company-name']",
      "span.jobs-unified-top-card__subtitle-primary-grouping a",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) { const t = el.textContent.trim(); if (t) return t; }
    }
    return "";
  }

  function extractLocation() {
    const selectors = [
      ".job-details-jobs-unified-top-card__primary-description-container .tvm__text",
      ".jobs-unified-top-card__bullet",
      ".job-details-jobs-unified-top-card__primary-description span.tvm__text",
      "span[class*='workplace-type']",
    ];
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const t = el.textContent.trim();
        if (t && !t.match(/^\d+ (applicant|hour|day|week|month|minute)/i) && t.length > 2) return t;
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
      "[class*='jobs-description']",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) { const t = el.innerText.trim(); if (t.length > 30) return t; }
    }
    return "";
  }

  function isEasyApply() {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes("easy apply") && btn.offsetParent !== null) return true;
    }
    const badges = document.querySelectorAll("[class*='easy-apply'], [class*='easyApply']");
    if (badges.length > 0) return true;
    return false;
  }

  async function clickNotInterested(card) {
    try {
      const menuBtn = card.querySelector("button[aria-label*='Dismiss'], button[aria-label*='dismiss'], button[class*='job-card-list__dismiss']") ||
                       card.querySelector("button[aria-label*='options'], button[aria-label*='More']");
      if (menuBtn) {
        menuBtn.click();
        await sleep(500);
      }

      const allButtons = document.querySelectorAll("div[role='menu'] button, div[class*='dropdown'] button, li[role='menuitem']");
      for (const btn of allButtons) {
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes("not interested") || text.includes("hide") || text.includes("dismiss")) {
          btn.click();
          await sleep(400);
          return true;
        }
      }

      const dismissBtn = card.querySelector("button[aria-label*='Dismiss']");
      if (dismissBtn) {
        dismissBtn.click();
        await sleep(400);
        return true;
      }
    } catch (e) {
      console.log("[JobScanner] Failed to click Not Interested:", e.message);
    }
    return false;
  }

  async function analyzeOnServer(jobData) {
    const url = `${serverUrl}/api/extension/analyze`;
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["X-API-Key"] = apiKey;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(jobData),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Server error ${res.status}: ${errBody}`);
    }

    return res.json();
  }

  async function processCard(card, index) {
    if (stopRequested) return "stopped";

    sendProgress(`Checking job ${index + 1}...`);

    const clickTarget = card.querySelector("a[class*='job-card-list__title'], a[class*='job-card-container__link'], a[href*='/jobs/view/']") || card;
    clickTarget.click();
    await sleep(1500);

    const descEl = await waitForSelector("#job-details", document, 6000);
    if (!descEl) {
      await sleep(1000);
    }

    const title = extractTitle();
    const company = extractCompany();
    const location = extractLocation();
    const description = extractDescription();
    const jobUrl = extractJobUrl();
    const easyApply = isEasyApply();

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
        await clickNotInterested(card);
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
        if (result.action === "rejected") {
          await clickNotInterested(card);
        }
        return "skipped";
      }

      stats.skipped++;
      return "skipped";
    } catch (err) {
      stats.skipped++;
      sendProgress(`Error on ${title}: ${err.message}`);
      return "error";
    }
  }

  async function goToNextPage() {
    const nextBtn = document.querySelector("button[aria-label='View next page'], li.artdeco-pagination__indicator--number.active + li button, button[aria-label='Next']");
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.click();
      await sleep(2000);
      await waitForSelector(".jobs-search-results__list-item, .scaffold-layout__list-container li", document, 8000);
      await sleep(1000);
      return true;
    }
    return false;
  }

  async function startScan() {
    scanning = true;
    sendProgress("Starting scan...");

    let pageNum = 1;

    while (!stopRequested) {
      sendProgress(`Scanning page ${pageNum}...`);
      await sleep(1000);

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
        await sleep(800);
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
})();
