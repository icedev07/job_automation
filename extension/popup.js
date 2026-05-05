const startBtn = document.getElementById("startBtn");
const statusMsg = document.getElementById("statusMsg");
const checkedCount = document.getElementById("checkedCount");
const approvedCount = document.getElementById("approvedCount");
const hiddenCount = document.getElementById("hiddenCount");
const skippedCount = document.getElementById("skippedCount");
const mainContent = document.getElementById("mainContent");
const notOnLinkedIn = document.getElementById("notOnLinkedIn");
const serverUrlInput = document.getElementById("serverUrlInput");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveBtn = document.getElementById("saveBtn");
const logArea = document.getElementById("logArea");
const sendLogsChk = document.getElementById("sendLogsChk");
const hideApprovedChk = document.getElementById("hideApprovedChk");
const showResultsChk = document.getElementById("showResultsChk");

const MAX_VISIBLE_RESULTS = 100;
const downloadBtn = document.getElementById("downloadBtn");
const currentJobBox = document.getElementById("currentJobBox");
const currentJobTitle = document.getElementById("currentJobTitle");
const currentJobMeta = document.getElementById("currentJobMeta");
const resultsFeed = document.getElementById("resultsFeed");
const resultsCount = document.getElementById("resultsCount");
const clearResultsBtn = document.getElementById("clearResultsBtn");

let isRunning = false;
let renderedResultIds = new Set();

function appendLogLine(level, message, ts) {
  const t = ts ? new Date(ts).toLocaleTimeString() : new Date().toLocaleTimeString();
  logArea.textContent += `[${t}] ${message}\n`;
  logArea.scrollTop = logArea.scrollHeight;
}

function addLog(msg, level) {
  appendLogLine(level || "info", msg, new Date().toISOString());
  console.log("[JobScanner]", msg);
}

chrome.storage.local.get(["extensionApiKey", "serverUrl", "sendLogsToServer", "hideApproved", "showResults"], (data) => {
  if (data.extensionApiKey) apiKeyInput.value = data.extensionApiKey;
  if (data.serverUrl) serverUrlInput.value = data.serverUrl;
  if (data.sendLogsToServer) sendLogsChk.checked = true;
  if (data.hideApproved) hideApprovedChk.checked = true;
  // default ON unless explicitly disabled
  showResultsChk.checked = data.showResults !== false;
  applyShowResults();
});

saveBtn.addEventListener("click", () => {
  const url = serverUrlInput.value.trim().replace(/\/$/, "");
  const key = apiKeyInput.value.trim();
  chrome.storage.local.set({ extensionApiKey: key, serverUrl: url });
  statusMsg.textContent = "Settings saved.";
  addLog(`Saved: server=${url || "(empty)"}, key=${key ? "***" : "(none)"}`);
});

sendLogsChk.addEventListener("change", () => {
  chrome.storage.local.set({ sendLogsToServer: sendLogsChk.checked });
});

hideApprovedChk.addEventListener("change", () => {
  chrome.storage.local.set({ hideApproved: hideApprovedChk.checked });
  addLog(`Hide approved jobs: ${hideApprovedChk.checked ? "ON" : "OFF"}`);
});

showResultsChk.addEventListener("change", () => {
  chrome.storage.local.set({ showResults: showResultsChk.checked });
  applyShowResults();
  if (showResultsChk.checked) {
    rehydrateFromBgState();
  }
});

function applyShowResults() {
  const section = document.querySelector(".results-section");
  if (!section) return;
  if (showResultsChk.checked) {
    section.style.display = "";
  } else {
    section.style.display = "none";
    // free DOM memory while disabled
    resultsFeed.innerHTML = "";
    renderedResultIds = new Set();
    resultsCount.textContent = "0";
  }
}

clearResultsBtn.addEventListener("click", () => {
  resultsFeed.innerHTML = "";
  renderedResultIds = new Set();
  resultsCount.textContent = "0";
});

downloadBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "GET_BG_STATE" }, (state) => {
    const logs = (state && state.logs) || [];
    if (logs.length === 0) {
      statusMsg.textContent = "No logs to download.";
      return;
    }
    const content = logs.map((l) => `[${l.ts}] [${l.level}] ${l.message}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extension-logs-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addLog("Logs downloaded.");
  });
});

function sendLogsToServer() {
  if (!sendLogsChk.checked) return;
  const serverUrl = serverUrlInput.value.trim().replace(/\/$/, "");
  if (!serverUrl) return;

  chrome.runtime.sendMessage({ type: "GET_BG_STATE" }, (state) => {
    if (!state || !state.logs || state.logs.length === 0) return;
    const payload = {
      logs: state.logs.map((l) => ({ timestamp: l.ts, level: l.level, message: l.message })),
      sessionId: state.sessionId,
    };
    fetch(`${serverUrl}/api/extension/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json()).then((data) => {
      console.log("[JobScanner] Logs sent:", data);
    }).catch((err) => {
      console.log("[JobScanner] Failed to send logs:", err.message);
    });
  });
}

function showCurrentJob(job) {
  if (!job) {
    currentJobBox.classList.remove("visible");
    return;
  }
  currentJobTitle.textContent = `Analyzing ${job.index + 1}/${job.total}: ${job.title}`;
  const meta = [job.company, job.location].filter(Boolean).join(" — ");
  currentJobMeta.textContent = meta;
  currentJobBox.classList.add("visible");
}

function statusLabel(status) {
  switch (status) {
    case "approved": return "Approved";
    case "rejected": return "Rejected";
    case "easy_apply": return "Easy Apply";
    case "skipped": return "Skipped";
    case "already_processed": return "Already";
    case "analysis_issue": return "Issue";
    case "error": return "Error";
    default: return status || "Unknown";
  }
}

function renderResultCard(r) {
  const card = document.createElement("div");
  card.className = `result-card ${r.status}`;
  card.dataset.id = r.id;

  const row1 = document.createElement("div");
  row1.className = "result-row1";

  const title = document.createElement("div");
  title.className = "result-title";
  title.textContent = `${r.index + 1}. ${r.title}`;

  const badge = document.createElement("span");
  badge.className = `result-badge ${r.status}`;
  const label = statusLabel(r.status);
  const scoreText = r.score != null && r.score > 0 ? ` ${r.score}` : "";
  badge.textContent = label + scoreText;

  row1.appendChild(title);
  row1.appendChild(badge);
  card.appendChild(row1);

  const meta = document.createElement("div");
  meta.className = "result-meta";
  meta.textContent = [r.company, r.location].filter(Boolean).join(" — ");
  card.appendChild(meta);

  if (r.reason) {
    const reason = document.createElement("div");
    reason.className = "result-reason";
    reason.textContent = r.reason;
    card.appendChild(reason);
  }

  return card;
}

function upsertResult(r) {
  if (!r || !r.id) return;
  if (!showResultsChk.checked) return; // user disabled rendering for performance
  const existing = resultsFeed.querySelector(`.result-card[data-id="${CSS.escape(r.id)}"]`);
  const node = renderResultCard(r);
  if (existing) {
    existing.replaceWith(node);
  } else {
    resultsFeed.insertBefore(node, resultsFeed.firstChild);
    renderedResultIds.add(r.id);
  }
  // Enforce a hard ceiling on rendered cards to keep the popup snappy on
  // long scans (≈1000 jobs would otherwise drown the DOM).
  while (resultsFeed.children.length > MAX_VISIBLE_RESULTS) {
    const last = resultsFeed.lastElementChild;
    if (last) {
      const id = last.getAttribute("data-id");
      if (id) renderedResultIds.delete(id);
      last.remove();
    } else {
      break;
    }
  }
  resultsCount.textContent = String(renderedResultIds.size);
}

function rehydrateFromBgState() {
  chrome.runtime.sendMessage({ type: "GET_BG_STATE" }, (state) => {
    if (!state) return;
    if (state.scanning) {
      isRunning = true;
      startBtn.textContent = "Stop Scan";
      startBtn.classList.add("running");
    } else {
      isRunning = false;
      startBtn.textContent = "Start Scan";
      startBtn.classList.remove("running");
    }

    updateStats(state.stats || {});
    statusMsg.textContent = state.statusMsg || (state.scanning ? "Scanning..." : "Ready.");

    showCurrentJob(state.currentJob);

    // Replay logs
    logArea.textContent = "";
    (state.logs || []).forEach((l) => appendLogLine(l.level, l.message, l.ts));

    // Replay results (newest first in the feed) only if rendering is enabled
    resultsFeed.innerHTML = "";
    renderedResultIds = new Set();
    if (showResultsChk.checked) {
      const sorted = [...(state.results || [])].sort((a, b) =>
        (a.timestamp || "").localeCompare(b.timestamp || "")
      );
      // Only restore the most recent slice to avoid spiking the DOM at popup open.
      const tail = sorted.slice(-MAX_VISIBLE_RESULTS);
      tail.forEach(upsertResult);
    }

    if (!state.scanning && (state.results || []).length > 0) {
      downloadBtn.style.display = "block";
    }
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  const onLinkedIn = !!(tab && tab.url && tab.url.includes("linkedin.com/jobs"));

  // Always show the main content so the results feed and current-job spinner
  // remain visible even if the user is currently working in a non-LinkedIn tab.
  mainContent.style.display = "";
  notOnLinkedIn.style.display = "none";

  if (!onLinkedIn) {
    addLog("Not on a LinkedIn jobs page (showing last scan state).");
    startBtn.disabled = false; // allow Stop while scan runs in the LinkedIn tab
    chrome.runtime.sendMessage({ type: "GET_BG_STATE" }, (state) => {
      if (state && state.scanning) {
        statusMsg.textContent = state.statusMsg || "Scan running in LinkedIn tab.";
      } else {
        statusMsg.textContent = "Open a LinkedIn jobs tab to start a new scan.";
      }
    });
  } else {
    addLog(`On LinkedIn: ${tab.url}`);
  }

  rehydrateFromBgState();
});

startBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;

    if (isRunning) {
      chrome.runtime.sendMessage({ type: "GET_BG_STATE" }, (state) => {
        const targetTabId = (state && state.scanTabId) || tab.id;
        chrome.tabs.sendMessage(targetTabId, { type: "STOP_SCAN" }, () => {
          // ignore errors (tab may have closed)
          void chrome.runtime.lastError;
        });
        isRunning = false;
        startBtn.textContent = "Start Scan";
        startBtn.classList.remove("running");
        statusMsg.textContent = "Scan stopped by user.";
        addLog("User stopped scan.");
        downloadBtn.style.display = "block";
        sendLogsToServer();
      });
      return;
    }

    chrome.storage.local.get(["extensionApiKey", "serverUrl"], (data) => {
      const serverUrl = data.serverUrl || serverUrlInput.value.trim().replace(/\/$/, "");

      if (!serverUrl) {
        statusMsg.textContent = "Error: Set the Server URL first, then click Save.";
        addLog("ERROR: No server URL configured.", "error");
        return;
      }

      const sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      chrome.runtime.sendMessage({
        type: "RESET_BG_STATE",
        serverUrl,
        sessionId,
        tabId: tab.id,
      }, () => {
        isRunning = true;
        downloadBtn.style.display = "none";
        startBtn.textContent = "Stop Scan";
        startBtn.classList.add("running");
        statusMsg.textContent = "Starting scan...";
        resetStats();
        resultsFeed.innerHTML = "";
        renderedResultIds = new Set();
        resultsCount.textContent = "0";
        logArea.textContent = "";
        addLog(`Starting scan. Server: ${serverUrl}`);
        sendStartScan(tab.id, serverUrl, data.extensionApiKey || "", false);
      });
    });
  });
});

function sendStartScan(tabId, serverUrl, apiKey, isRetry) {
  chrome.tabs.sendMessage(tabId, {
    type: "START_SCAN",
    serverUrl,
    apiKey,
  }, () => {
    if (chrome.runtime.lastError) {
      if (!isRetry) {
        addLog("Content script not found, injecting...", "warn");
        chrome.scripting.executeScript({
          target: { tabId },
          files: ["content.js"],
        }, () => {
          if (chrome.runtime.lastError) {
            addLog(`Injection failed: ${chrome.runtime.lastError.message}`, "error");
            statusMsg.textContent = "Error: cannot inject script. Refresh the LinkedIn page and try again.";
            isRunning = false;
            startBtn.textContent = "Start Scan";
            startBtn.classList.remove("running");
            return;
          }
          addLog("Content script injected. Retrying START_SCAN...");
          setTimeout(() => sendStartScan(tabId, serverUrl, apiKey, true), 500);
        });
      } else {
        addLog(`ERROR sending START_SCAN: ${chrome.runtime.lastError.message}`, "error");
        statusMsg.textContent = "Error: content script not responding. Refresh the LinkedIn page and try again.";
        isRunning = false;
        startBtn.textContent = "Start Scan";
        startBtn.classList.remove("running");
      }
    }
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SCAN_PROGRESS") {
    if (msg.stats) updateStats(msg.stats);
    if (msg.statusMsg) statusMsg.textContent = msg.statusMsg;
    addLog(msg.statusMsg || "progress update");
    if (msg.currentJob !== undefined) showCurrentJob(msg.currentJob);
  }
  if (msg.type === "SCAN_LOG") {
    appendLogLine(msg.level || "debug", msg.message || "", new Date().toISOString());
  }
  if (msg.type === "SCAN_RESULT") {
    if (msg.result) upsertResult(msg.result);
    showCurrentJob(null);
  }
  if (msg.type === "SCAN_DONE") {
    isRunning = false;
    startBtn.textContent = "Start Scan";
    startBtn.classList.remove("running");
    if (msg.stats) updateStats(msg.stats);
    statusMsg.textContent = msg.statusMsg || "Scan complete.";
    addLog(`DONE: ${msg.statusMsg}`);
    downloadBtn.style.display = "block";
    showCurrentJob(null);
    sendLogsToServer();
  }
});

function updateStats(stats) {
  if (!stats) return;
  checkedCount.textContent = stats.checked || 0;
  approvedCount.textContent = stats.approved || 0;
  hiddenCount.textContent = stats.hidden || 0;
  skippedCount.textContent = stats.skipped || 0;
}

function resetStats() {
  checkedCount.textContent = "0";
  approvedCount.textContent = "0";
  hiddenCount.textContent = "0";
  skippedCount.textContent = "0";
}
