// Dev server: builds the site, then serves ./dist on http://localhost:3000 (or $PORT)
// `yarn dev` restarts this file (and so rebuilds) when docs/, src/ or public/ change.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import "./build.js"; // importing it runs the build

const dist_dir = path.join(import.meta.dirname, "..", "dist");
const port = Number(process.env.PORT) || 3000;

const content_types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

const not_found = (res) => {
  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Not found");
};

http
  .createServer((req, res) => {
    // "/docs/foo/?x=1" -> "/docs/foo/", and "%20" -> " "
    let url_path;
    try {
      url_path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      return not_found(res); // a broken escape like "%E0%A4%A"
    }

    // "/docs/foo/" -> dist/docs/foo/index.html, "/styles.css" -> dist/styles.css
    let file = path.join(dist_dir, url_path);
    if (!path.extname(file)) file = path.join(file, "index.html");

    // never serve anything outside dist/, e.g. "/../package.json"
    if (!file.startsWith(dist_dir + path.sep)) return not_found(res);

    fs.readFile(file, (err, data) => {
      if (err) return not_found(res);

      const type = content_types[path.extname(file)] ?? "application/octet-stream";
      res.writeHead(200, { "content-type": type });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`serving at http://localhost:${port}`));
