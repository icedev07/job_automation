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

let isRunning = false;

function addLog(msg) {
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${msg}`;
  logArea.textContent += line + "\n";
  logArea.scrollTop = logArea.scrollHeight;
  console.log("[JobScanner]", msg);
}

chrome.storage.local.get(["extensionApiKey", "serverUrl"], (data) => {
  if (data.extensionApiKey) apiKeyInput.value = data.extensionApiKey;
  if (data.serverUrl) serverUrlInput.value = data.serverUrl;
});

saveBtn.addEventListener("click", () => {
  const url = serverUrlInput.value.trim().replace(/\/$/, "");
  const key = apiKeyInput.value.trim();
  chrome.storage.local.set({ extensionApiKey: key, serverUrl: url });
  statusMsg.textContent = "Settings saved.";
  addLog(`Saved: server=${url || "(empty)"}, key=${key ? "***" : "(none)"}`);
});

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
      addLog(`Content script not responding: ${chrome.runtime.lastError.message}`);
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
      return;
    }

    chrome.storage.local.get(["extensionApiKey", "serverUrl"], (data) => {
      const serverUrl = data.serverUrl || serverUrlInput.value.trim().replace(/\/$/, "");

      if (!serverUrl) {
        statusMsg.textContent = "Error: Set the Server URL first, then click Save.";
        addLog("ERROR: No server URL configured.");
        return;
      }

      isRunning = true;
      startBtn.textContent = "Stop Scan";
      startBtn.classList.add("running");
      statusMsg.textContent = "Starting scan...";
      resetStats();
      addLog(`Starting scan. Server: ${serverUrl}`);

      chrome.tabs.sendMessage(tab.id, {
        type: "START_SCAN",
        serverUrl,
        apiKey: data.extensionApiKey || "",
      }, (response) => {
        if (chrome.runtime.lastError) {
          addLog(`ERROR sending START_SCAN: ${chrome.runtime.lastError.message}`);
          statusMsg.textContent = "Error: content script not loaded. Refresh the LinkedIn page and try again.";
          isRunning = false;
          startBtn.textContent = "Start Scan";
          startBtn.classList.remove("running");
        }
      });
    });
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SCAN_PROGRESS") {
    updateStats(msg.stats);
    statusMsg.textContent = msg.statusMsg || "Scanning...";
    addLog(msg.statusMsg || "progress update");
  }
  if (msg.type === "SCAN_DONE") {
    isRunning = false;
    startBtn.textContent = "Start Scan";
    startBtn.classList.remove("running");
    updateStats(msg.stats);
    statusMsg.textContent = msg.statusMsg || "Scan complete.";
    addLog(`DONE: ${msg.statusMsg}`);
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
