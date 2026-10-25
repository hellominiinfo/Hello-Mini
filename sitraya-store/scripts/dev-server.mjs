// Local test server: serves /public like Netlify does and sends everything else to the server bundle.
// Usage: DATABASE_URL=postgres://... APP_SECRET=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/dev-server.mjs
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import api from "../netlify/functions/sitraya/server.mjs";

const PORT = Number(process.env.PORT || 3000);
const PUB = path.resolve("public");
const TYPES = { ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json", ".txt": "text/plain", ".ico": "image/x-icon" };

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const file = path.join(PUB, decodeURIComponent(url.pathname));
    if (file.startsWith(PUB + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream", "cache-control": "no-cache" });
      return fs.createReadStream(file).pipe(res);
    }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
    const r = await api.fetch(new Request(url, { method: req.method, headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : body }), req.socket.remoteAddress || "127.0.0.1");
    const out = {};
    r.headers.forEach((v, k) => { if (k !== "set-cookie") out[k] = v; });
    const sc = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
    if (sc.length) out["set-cookie"] = sc;
    res.writeHead(r.status, out);
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    console.error(e);
    res.writeHead(500); res.end("dev server error");
  }
}).listen(PORT, () => console.log(`Sitraya dev server on http://localhost:${PORT}`));
