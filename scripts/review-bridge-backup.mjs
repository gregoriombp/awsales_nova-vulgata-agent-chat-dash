#!/usr/bin/env node
// Backup/restore manual dos dados do Review Mode, FORA do repo (sobrevive a
// `git clean`, npm install, re-clone). Mesma estrutura do auto-backup serverless
// (app/api/review-bridge/_backup.ts): <root>/snapshots/<ISO>/ + <root>/images/.
//
//   node scripts/review-bridge-backup.mjs backup    # snapshota agora (force)
//   node scripts/review-bridge-backup.mjs restore    # restaura o último snapshot
//   node scripts/review-bridge-backup.mjs list       # lista snapshots
//
// Destino: $REVIEW_BRIDGE_BACKUP_DIR ou ~/.awsales/review-bridge-backups
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

const DATA_DIR = path.join(process.cwd(), "review-bridge", "data");
const MAIN = path.join(DATA_DIR, "comments.json");
const ARCHIVE = path.join(DATA_DIR, "comments.archive.json");
const IMAGES_DIR = path.join(DATA_DIR, "images");

const ROOT = process.env.REVIEW_BRIDGE_BACKUP_DIR
  ? path.resolve(process.env.REVIEW_BRIDGE_BACKUP_DIR)
  : path.join(os.homedir(), ".awsales", "review-bridge-backups");
const SNAP_DIR = path.join(ROOT, "snapshots");
const POOL_DIR = path.join(ROOT, "images");

const readMaybe = async (f) => {
  try {
    return await fs.readFile(f, "utf8");
  } catch {
    return null;
  }
};
const count = (raw) => {
  try {
    return (JSON.parse(raw).comments || []).length;
  } catch {
    return 0;
  }
};

async function copyPool(from, to) {
  let names;
  try {
    names = await fs.readdir(from);
  } catch {
    return 0;
  }
  await fs.mkdir(to, { recursive: true });
  let n = 0;
  for (const name of names) {
    if (name.endsWith(".tmp")) continue;
    const dest = path.join(to, name);
    try {
      await fs.access(dest);
    } catch {
      await fs.copyFile(path.join(from, name), dest);
      n++;
    }
  }
  return n;
}

async function snapshots() {
  try {
    return (await fs.readdir(SNAP_DIR)).filter((d) => /^\d{4}-/.test(d)).sort();
  } catch {
    return [];
  }
}

async function backup() {
  const main = await readMaybe(MAIN);
  const archive = await readMaybe(ARCHIVE);
  if (main === null && archive === null) {
    console.log("nada pra salvar (sem dados em review-bridge/data)");
    return;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(SNAP_DIR, stamp);
  await fs.mkdir(dir, { recursive: true });
  if (main !== null) await fs.writeFile(path.join(dir, "comments.json"), main);
  if (archive !== null)
    await fs.writeFile(path.join(dir, "comments.archive.json"), archive);
  const copied = await copyPool(IMAGES_DIR, POOL_DIR);
  console.log(
    `snapshot: ${dir}\n  main: ${count(main)} | archive: ${count(archive)} | imagens novas no pool: ${copied}`,
  );
}

async function restore() {
  const snaps = await snapshots();
  let chosen = null;
  for (let i = snaps.length - 1; i >= 0; i--) {
    const d = path.join(SNAP_DIR, snaps[i]);
    if (count(await readMaybe(path.join(d, "comments.json"))) > 0) {
      chosen = d;
      break;
    }
  }
  if (!chosen) {
    console.log("nenhum snapshot com conteúdo encontrado em", SNAP_DIR);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  const main = await readMaybe(path.join(chosen, "comments.json"));
  const archive = await readMaybe(path.join(chosen, "comments.archive.json"));
  if (main !== null) await fs.writeFile(MAIN, main);
  if (archive !== null) await fs.writeFile(ARCHIVE, archive);
  const copied = await copyPool(POOL_DIR, IMAGES_DIR);
  console.log(
    `restaurado de: ${chosen}\n  main: ${count(main)} | archive: ${count(archive)} | imagens devolvidas: ${copied}`,
  );
}

async function list() {
  const snaps = await snapshots();
  if (!snaps.length) {
    console.log("nenhum snapshot em", SNAP_DIR);
    return;
  }
  console.log(`${snaps.length} snapshots em ${SNAP_DIR}:`);
  for (const s of snaps.slice(-15)) {
    const main = await readMaybe(path.join(SNAP_DIR, s, "comments.json"));
    const arc = await readMaybe(path.join(SNAP_DIR, s, "comments.archive.json"));
    console.log(`  ${s}  (main ${count(main)} / archive ${count(arc)})`);
  }
}

const cmd = process.argv[2];
const fn = { backup, restore, list }[cmd];
if (!fn) {
  console.error("uso: node scripts/review-bridge-backup.mjs <backup|restore|list>");
  process.exit(1);
}
fn().catch((e) => {
  console.error(e);
  process.exit(1);
});
