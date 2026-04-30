chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "SCAN_PROGRESS" || msg.type === "SCAN_DONE") {
    chrome.runtime.sendMessage(msg).catch(() => {});
  }
});
