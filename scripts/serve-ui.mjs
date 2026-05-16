#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "ui");
const port = Number.parseInt(process.env.PORT ?? "4173", 10);
const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"]
]);

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const path = normalize(join(root, requested));
  if (!path.startsWith(root)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  try {
    const body = await readFile(path);
    res.writeHead(200, { "content-type": types.get(extname(path)) ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
}).listen(port, () => {
  console.log(`Benchmark UI: http://localhost:${port}`);
});
