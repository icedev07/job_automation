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
const downloadBtn = document.getElementById("downloadBtn");

let isRunning = false;
let sessionId = null;
let capturedLogs = [];

function addLog(msg, level) {
  level = level || "info";
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${msg}`;
  logArea.textContent += line + "\n";
  logArea.scrollTop = logArea.scrollHeight;
  capturedLogs.push({ timestamp: new Date().toISOString(), level, message: msg });
  console.log("[JobScanner]", msg);
}

chrome.storage.local.get(["extensionApiKey", "serverUrl", "sendLogsToServer"], (data) => {
  if (data.extensionApiKey) apiKeyInput.value = data.extensionApiKey;
  if (data.serverUrl) serverUrlInput.value = data.serverUrl;
  if (data.sendLogsToServer) sendLogsChk.checked = true;
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

downloadBtn.addEventListener("click", () => {
  if (capturedLogs.length === 0) {
    statusMsg.textContent = "No logs to download.";
    return;
  }
  const content = capturedLogs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `extension-logs-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  addLog("Logs downloaded.");
});

function sendLogsToServer() {
  if (!sendLogsChk.checked || capturedLogs.length === 0) return;
  const serverUrl = serverUrlInput.value.trim().replace(/\/$/, "");
  if (!serverUrl) return;

  const payload = { logs: capturedLogs, sessionId };
  fetch(`${serverUrl}/api/extension/logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(r => r.json()).then(data => {
    console.log("[JobScanner] Logs sent to server:", data);
  }).catch(err => {
    console.log("[JobScanner] Failed to send logs:", err.message);
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab || !tab.url || !tab.url.includes("linkedin.com/jobs")) {
    mainContent.style.display = "none";
    notOnLinkedIn.style.display = "block";
    addLog("Not on a LinkedIn jobs page.");
    return;
  }

  addLog(`On LinkedIn: ${tab.url}`);

  chrome.tabs.sendMessage(tab.id, { type: "GET_STATUS" }, (response) => {
    if (chrome.runtime.lastError) {
      addLog(`Content script not responding: ${chrome.runtime.lastError.message}`, "warn");
      return;
    }
    if (response && response.running) {
      isRunning = true;
      startBtn.textContent = "Stop Scan";
      startBtn.classList.add("running");
      updateStats(response.stats);
      statusMsg.textContent = response.statusMsg || "Scanning...";
      addLog("Scan already in progress.");
    }
  });
});

startBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;

    if (isRunning) {
      chrome.tabs.sendMessage(tab.id, { type: "STOP_SCAN" });
      isRunning = false;
      startBtn.textContent = "Start Scan";
      startBtn.classList.remove("running");
      statusMsg.textContent = "Scan stopped by user.";
      addLog("User stopped scan.");
      downloadBtn.style.display = "block";
      sendLogsToServer();
      return;
    }

    chrome.storage.local.get(["extensionApiKey", "serverUrl"], (data) => {
      const serverUrl = data.serverUrl || serverUrlInput.value.trim().replace(/\/$/, "");

      if (!serverUrl) {
        statusMsg.textContent = "Error: Set the Server URL first, then click Save.";
        addLog("ERROR: No server URL configured.", "error");
        return;
      }

      isRunning = true;
      sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      capturedLogs = [];
      downloadBtn.style.display = "none";
      startBtn.textContent = "Stop Scan";
      startBtn.classList.add("running");
      statusMsg.textContent = "Starting scan...";
      resetStats();
      addLog(`Starting scan. Server: ${serverUrl}`);

      sendStartScan(tab.id, serverUrl, data.extensionApiKey || "", false);
    });
  });
});

function sendStartScan(tabId, serverUrl, apiKey, isRetry) {
  chrome.tabs.sendMessage(tabId, {
    type: "START_SCAN",
    serverUrl,
    apiKey,
  }, (response) => {
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
    updateStats(msg.stats);
    statusMsg.textContent = msg.statusMsg || "Scanning...";
    addLog(msg.statusMsg || "progress update");
  }
  if (msg.type === "SCAN_LOG") {
    capturedLogs.push({
      timestamp: new Date().toISOString(),
      level: msg.level || "debug",
      message: msg.message || "",
    });
  }
  if (msg.type === "SCAN_DONE") {
    isRunning = false;
    startBtn.textContent = "Start Scan";
    startBtn.classList.remove("running");
    updateStats(msg.stats);
    statusMsg.textContent = msg.statusMsg || "Scan complete.";
    addLog(`DONE: ${msg.statusMsg}`);
    downloadBtn.style.display = "block";
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
  logArea.textContent = "";
}
