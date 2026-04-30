const SERVER_URL = "https://job-finder.onrender.com";

const startBtn = document.getElementById("startBtn");
const statusMsg = document.getElementById("statusMsg");
const checkedCount = document.getElementById("checkedCount");
const approvedCount = document.getElementById("approvedCount");
const hiddenCount = document.getElementById("hiddenCount");
const skippedCount = document.getElementById("skippedCount");
const mainContent = document.getElementById("mainContent");
const notOnLinkedIn = document.getElementById("notOnLinkedIn");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");

let isRunning = false;

chrome.storage.local.get(["extensionApiKey"], (data) => {
  if (data.extensionApiKey) apiKeyInput.value = data.extensionApiKey;
});

saveKeyBtn.addEventListener("click", () => {
  chrome.storage.local.set({ extensionApiKey: apiKeyInput.value.trim() });
  statusMsg.textContent = "API key saved.";
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab || !tab.url || !tab.url.includes("linkedin.com/jobs")) {
    mainContent.style.display = "none";
    notOnLinkedIn.style.display = "block";
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: "GET_STATUS" }, (response) => {
    if (chrome.runtime.lastError) return;
    if (response && response.running) {
      isRunning = true;
      startBtn.textContent = "Stop Scan";
      startBtn.classList.add("running");
      updateStats(response.stats);
      statusMsg.textContent = response.statusMsg || "Scanning...";
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
      return;
    }

    chrome.storage.local.get(["extensionApiKey"], (data) => {
      isRunning = true;
      startBtn.textContent = "Stop Scan";
      startBtn.classList.add("running");
      statusMsg.textContent = "Starting scan...";
      resetStats();

      chrome.tabs.sendMessage(tab.id, {
        type: "START_SCAN",
        serverUrl: SERVER_URL,
        apiKey: data.extensionApiKey || "",
      });
    });
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SCAN_PROGRESS") {
    updateStats(msg.stats);
    statusMsg.textContent = msg.statusMsg || "Scanning...";
  }
  if (msg.type === "SCAN_DONE") {
    isRunning = false;
    startBtn.textContent = "Start Scan";
    startBtn.classList.remove("running");
    updateStats(msg.stats);
    statusMsg.textContent = msg.statusMsg || "Scan complete.";
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
