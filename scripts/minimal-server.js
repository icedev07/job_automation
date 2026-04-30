#!/usr/bin/env node
/**
 * Minimal HTTP server on port 3099 to test if the browser can reach ANY local server.
 * Run: node scripts/minimal-server.js
 * Then open http://127.0.0.1:3099 in your browser.
 * If you see "OK" -> browser can reach local servers; issue is specific to Next/port 3000.
 * If you get timeout -> firewall/AV is blocking localhost from the browser.
 */
const http = require("http");
const port = 3099;
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK\n");
});
server.listen(port, "127.0.0.1", () => {
  console.log("Minimal server: http://127.0.0.1:" + port);
  console.log("Open that URL in your browser. If you see OK, the browser can reach local servers.");
});
