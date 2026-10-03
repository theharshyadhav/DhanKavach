import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chat, quiz, limited, ready } from "./lib/core.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");
const PORT = process.env.PORT || 3000;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };

const send = (res, code, body, type = "application/json") => { res.writeHead(code, { "content-type": type, "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" }); res.end(body); };
const readBody = req => new Promise((ok, no) => { let b = ""; req.on("data", c => { b += c; if (b.length > 16000) { no(new Error("too big")); req.destroy(); } }); req.on("end", () => { try { ok(JSON.parse(b || "{}")); } catch (e) { no(e); } }); });

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/health") return send(res, 200, JSON.stringify({ ai: ready() }));
  if (url.pathname === "/api/chat" || url.pathname === "/api/quiz") {
    if (req.method !== "POST") return send(res, 405, '{"error":"POST only"}');
    if (!ready()) return send(res, 503, '{"error":"AI not configured"}');
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
    if (limited(ip)) return send(res, 429, '{"error":"slow down"}');
    try {
      const b = await readBody(req);
      return send(res, 200, JSON.stringify(await (url.pathname === "/api/chat" ? chat(b) : quiz(b))));
    } catch (e) { console.error(e.message); return send(res, 502, '{"error":"AI request failed"}'); }
  }
  const file = path.join(ROOT, path.normalize("/" + (url.pathname === "/" ? "/index.html" : url.pathname)));
  fs.readFile(file, (err, buf) => err ? send(res, 404, "Not found", "text/plain") : send(res, 200, buf, MIME[path.extname(file)] || "application/octet-stream"));
}).listen(PORT, () => console.log(`Dhan Kavach on http://localhost:${PORT} (AI ${ready() ? "on" : "off"})`));
