// Do not relay SCAN_* messages: content script chrome.runtime.sendMessage already
// reaches the popup listener. Relaying caused duplicate logs and duplicate UI updates.

chrome.runtime.onInstalled.addListener(() => {
  console.log("[JobScanner] Extension installed/updated");
});
