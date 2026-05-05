// Background service worker: persistent state hub.
// The popup may close at any time, but the scan keeps running in the LinkedIn
// tab and this worker keeps accumulating progress, logs, and per-job results.
// When the popup reopens, it asks for GET_BG_STATE to rehydrate the UI.

const STATE_KEY = "scanState";
// Keep memory bounded for very large scans (~1000 jobs).
const MAX_LOGS = 500;
const MAX_RESULTS = 200;

const EMPTY_STATE = {
  scanning: false,
  serverUrl: "",
  sessionId: null,
  startedAt: null,
  stats: { checked: 0, approved: 0, hidden: 0, skipped: 0 },
  statusMsg: "Idle",
  logs: [],
  results: [],
  currentJob: null,
  scanTabId: null,
};

let state = { ...EMPTY_STATE };
let stateLoaded = false;

function loadStateOnce() {
  return new Promise((resolve) => {
    if (stateLoaded) return resolve();
    chrome.storage.local.get([STATE_KEY], (data) => {
      if (data && data[STATE_KEY]) state = { ...EMPTY_STATE, ...data[STATE_KEY] };
      stateLoaded = true;
      resolve();
    });
  });
}

let saveTimer = null;
function saveStateSoon() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    chrome.storage.local.set({ [STATE_KEY]: state });
  }, 250);
}

function pushLog(level, message) {
  state.logs.push({ ts: new Date().toISOString(), level: level || "info", message: String(message || "") });
  if (state.logs.length > MAX_LOGS) state.logs = state.logs.slice(-MAX_LOGS);
}

function upsertResult(r) {
  if (!r || !r.id) return;
  const idx = state.results.findIndex((x) => x.id === r.id);
  if (idx >= 0) state.results[idx] = { ...state.results[idx], ...r };
  else state.results.push(r);
  if (state.results.length > MAX_RESULTS) state.results = state.results.slice(-MAX_RESULTS);
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("[JobScanner] Extension installed/updated");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  loadStateOnce().then(() => {
    if (msg.type === "GET_BG_STATE") {
      sendResponse(state);
      return;
    }
    if (msg.type === "RESET_BG_STATE") {
      state = {
        ...EMPTY_STATE,
        scanning: true,
        serverUrl: msg.serverUrl || "",
        sessionId: msg.sessionId || null,
        startedAt: Date.now(),
        statusMsg: "Starting scan...",
        scanTabId: msg.tabId || null,
      };
      saveStateSoon();
      sendResponse({ ok: true });
      return;
    }
    if (msg.type === "SCAN_LOG") {
      pushLog(msg.level, msg.message);
      saveStateSoon();
      sendResponse?.({ ok: true });
      return;
    }
    if (msg.type === "SCAN_PROGRESS") {
      if (msg.stats) state.stats = msg.stats;
      if (msg.statusMsg) state.statusMsg = msg.statusMsg;
      if (msg.currentJob !== undefined) state.currentJob = msg.currentJob;
      state.scanning = true;
      saveStateSoon();
      sendResponse?.({ ok: true });
      return;
    }
    if (msg.type === "SCAN_RESULT") {
      upsertResult(msg.result);
      // Once a card finishes, clear the "currently analyzing" indicator if it
      // matches the same card id.
      if (state.currentJob && msg.result && state.currentJob.id === msg.result.id) {
        state.currentJob = null;
      }
      saveStateSoon();
      sendResponse?.({ ok: true });
      return;
    }
    if (msg.type === "SCAN_DONE") {
      state.scanning = false;
      state.currentJob = null;
      if (msg.stats) state.stats = msg.stats;
      if (msg.statusMsg) state.statusMsg = msg.statusMsg;
      saveStateSoon();
      sendResponse?.({ ok: true });
      return;
    }
    sendResponse?.({ ok: false, reason: "unknown_message" });
  });
  return true; // keep channel open for async sendResponse
});
