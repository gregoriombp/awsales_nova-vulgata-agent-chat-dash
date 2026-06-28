#!/usr/bin/env node
// Migração one-off: tira as imagens INLINE (data:...;base64) de
// review-bridge/data/comments.json + comments.archive.json e grava em
// review-bridge/data/images/<sha256>.<ext>, deixando no JSON só a ref
// /api/review-bridge/images/<hash>.<ext>. Content-addressed = dedup automático.
// Idempotente: rodar de novo não muda nada (refs já externalizadas são puladas).
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "review-bridge", "data");
const FILES = ["comments.json", "comments.archive.json"];
const IMAGES_DIR = path.join(DATA_DIR, "images");
const ROUTE_PREFIX = "/api/review-bridge/images/";

const MIME_EXT = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};
const DATA_URI_RE = /^data:([a-z0-9.+/-]+);base64,(.+)$/is;

let written = 0;
let deduped = 0;
let bytesOut = 0;

async function persist(value) {
  const m = typeof value === "string" && value.match(DATA_URI_RE);
  if (!m) return value;
  const buf = Buffer.from(m[2], "base64");
  if (buf.length === 0) return value;
  const ext = MIME_EXT[m[1].toLowerCase()] ?? "bin";
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  const filename = `${hash}.${ext}`;
  const dest = path.join(IMAGES_DIR, filename);
  try {
    await fs.access(dest);
    deduped++;
  } catch {
    await fs.writeFile(dest, buf);
    written++;
    bytesOut += buf.length;
  }
  return `${ROUTE_PREFIX}${filename}`;
}

async function mapImages(arr) {
  if (!Array.isArray(arr)) return arr;
  const out = [];
  for (const s of arr) out.push(await persist(s));
  return out;
}

async function main() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  for (const name of FILES) {
    const file = path.join(DATA_DIR, name);
    let db;
    try {
      db = JSON.parse(await fs.readFile(file, "utf8"));
    } catch {
      console.log(`(pulado, não existe) ${name}`);
      continue;
    }
    const before = (await fs.stat(file)).size;
    for (const c of db.comments ?? []) {
      if (c.images) c.images = await mapImages(c.images);
      if (Array.isArray(c.replies)) {
        for (const r of c.replies) if (r.images) r.images = await mapImages(r.images);
      }
    }
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, file);
    const after = (await fs.stat(file)).size;
    console.log(
      `${name}: ${(before / 1048576).toFixed(2)}MB -> ${(after / 1048576).toFixed(2)}MB`,
    );
  }
  console.log(
    `\nimagens gravadas: ${written} | já existentes (dedup): ${deduped} | pool: ${(bytesOut / 1048576).toFixed(2)}MB`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
