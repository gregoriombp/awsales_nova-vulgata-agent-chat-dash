import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

/**
 * Rede de segurança "nunca perder comentário". Os dados do review-bridge vivem em
 * review-bridge/data/*.json — GITIGNORED. Um `git clean -fdx` (ou um "limpar
 * cache" agressivo) apaga os comentários junto com qualquer backup que estivesse
 * DENTRO do repo. Por isso os snapshots vão pra FORA do repo (home do usuário),
 * onde sobrevivem a clean, npm install e até re-clone.
 *
 * Estrutura do backup (REVIEW_BRIDGE_BACKUP_DIR ou ~/.awsales/review-bridge-backups):
 *   <root>/snapshots/<ISO>/comments.json + comments.archive.json   (texto, rotativo)
 *   <root>/images/<hash>.<ext>                                     (pool append-only)
 *
 * Os JSONs são pequenos (imagens já saíram pra disco), então copiar é barato. O
 * pool de imagens é content-addressed e incremental: só copia o que ainda não
 * está lá, então nunca recopia os 11MB existentes.
 */

const DATA_DIR = path.join(process.cwd(), "review-bridge", "data");
const MAIN_FILE = path.join(DATA_DIR, "comments.json");
const ARCHIVE_FILE = path.join(DATA_DIR, "comments.archive.json");
const IMAGES_DIR = path.join(DATA_DIR, "images");

const BACKUP_ROOT = process.env.REVIEW_BRIDGE_BACKUP_DIR
  ? path.resolve(process.env.REVIEW_BRIDGE_BACKUP_DIR)
  : path.join(os.homedir(), ".awsales", "review-bridge-backups");
const SNAP_DIR = path.join(BACKUP_ROOT, "snapshots");
const POOL_DIR = path.join(BACKUP_ROOT, "images");

const KEEP_RECENT = 40; // últimos N snapshots, sempre
const MIN_INTERVAL_MS = 60_000; // não snapshota mais de 1x/min em rajada

let lastSnapshot = 0;

async function readMaybe(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

function countComments(raw: string | null): number {
  if (!raw) return 0;
  try {
    const p = JSON.parse(raw) as { comments?: unknown[] };
    return Array.isArray(p.comments) ? p.comments.length : 0;
  } catch {
    return 0;
  }
}

/** Copia pro pool só as imagens que ainda não existem lá (incremental). */
async function syncImagePool(): Promise<void> {
  let names: string[];
  try {
    names = await fs.readdir(IMAGES_DIR);
  } catch {
    return; // sem pasta de imagens ainda
  }
  await fs.mkdir(POOL_DIR, { recursive: true });
  for (const name of names) {
    if (name.endsWith(".tmp")) continue;
    const dest = path.join(POOL_DIR, name);
    try {
      await fs.access(dest); // já no pool (content-addressed) → pula
    } catch {
      try {
        await fs.copyFile(path.join(IMAGES_DIR, name), dest);
      } catch {
        /* ignora falha em arquivo isolado */
      }
    }
  }
}

async function rotate(): Promise<void> {
  let dirs: string[];
  try {
    dirs = (await fs.readdir(SNAP_DIR)).filter((d) => /^\d{4}-/.test(d)).sort();
  } catch {
    return;
  }
  // Mantém os KEEP_RECENT mais novos + o 1º snapshot de cada dia (histórico longo).
  const keep = new Set(dirs.slice(-KEEP_RECENT));
  const seenDay = new Set<string>();
  for (const d of dirs) {
    const day = d.slice(0, 10);
    if (!seenDay.has(day)) {
      seenDay.add(day);
      keep.add(d);
    }
  }
  for (const d of dirs) {
    if (keep.has(d)) continue;
    await fs.rm(path.join(SNAP_DIR, d), { recursive: true, force: true });
  }
}

/**
 * Snapshot dos JSONs + sync incremental do pool de imagens. Throttled, exceto
 * com `force` (usado antes de uma escrita que pode encolher/zerar os dados).
 */
export async function snapshot(opts?: { force?: boolean }): Promise<void> {
  try {
    const now = Date.now();
    if (!opts?.force && now - lastSnapshot < MIN_INTERVAL_MS) return;
    const [main, archive] = await Promise.all([
      readMaybe(MAIN_FILE),
      readMaybe(ARCHIVE_FILE),
    ]);
    if (main === null && archive === null) return; // nada pra salvar
    lastSnapshot = now;
    const stamp = new Date(now).toISOString().replace(/[:.]/g, "-");
    const dir = path.join(SNAP_DIR, stamp);
    await fs.mkdir(dir, { recursive: true });
    if (main !== null) await fs.writeFile(path.join(dir, "comments.json"), main);
    if (archive !== null)
      await fs.writeFile(path.join(dir, "comments.archive.json"), archive);
    await syncImagePool();
    await rotate();
  } catch (err) {
    // Backup é best-effort: nunca derruba uma escrita por causa dele.
    console.warn("[review-bridge] snapshot falhou:", err);
  }
}

async function latestSnapshotWithData(): Promise<string | null> {
  let dirs: string[];
  try {
    dirs = (await fs.readdir(SNAP_DIR)).filter((d) => /^\d{4}-/.test(d)).sort();
  } catch {
    return null;
  }
  for (let i = dirs.length - 1; i >= 0; i--) {
    const dir = path.join(SNAP_DIR, dirs[i]!);
    const main = await readMaybe(path.join(dir, "comments.json"));
    const archive = await readMaybe(path.join(dir, "comments.archive.json"));
    if (countComments(main) > 0 || countComments(archive) > 0) return dir;
  }
  return null;
}

/**
 * Auto-cura: se o comments.json SUMIU (caso clean/reinstall) e existe backup com
 * conteúdo, restaura JSON + pool de imagens. Só age quando o arquivo está
 * AUSENTE — nunca sobrescreve um arquivo existente (um reset legítimo fica de pé).
 * Roda no máximo 1x por processo.
 */
let restoreChecked: Promise<boolean> | null = null;
export function ensureRestored(): Promise<boolean> {
  if (!restoreChecked) restoreChecked = doRestore();
  return restoreChecked;
}

async function doRestore(): Promise<boolean> {
  try {
    const live = await readMaybe(MAIN_FILE);
    if (live !== null) return false; // arquivo presente → não mexe
    const dir = await latestSnapshotWithData();
    if (!dir) return false;
    await fs.mkdir(DATA_DIR, { recursive: true });
    const main = await readMaybe(path.join(dir, "comments.json"));
    const archive = await readMaybe(path.join(dir, "comments.archive.json"));
    if (main !== null) await fs.writeFile(MAIN_FILE, main);
    if (archive !== null) await fs.writeFile(ARCHIVE_FILE, archive);
    // Devolve os binários do pool pra pasta de imagens do repo.
    try {
      const names = await fs.readdir(POOL_DIR);
      await fs.mkdir(IMAGES_DIR, { recursive: true });
      for (const name of names) {
        const dest = path.join(IMAGES_DIR, name);
        try {
          await fs.access(dest);
        } catch {
          await fs.copyFile(path.join(POOL_DIR, name), dest);
        }
      }
    } catch {
      /* pool pode não existir */
    }
    console.warn(
      `[review-bridge] comments.json estava ausente — RESTAURADO do backup ${dir}`,
    );
    return true;
  } catch (err) {
    console.warn("[review-bridge] restore falhou:", err);
    return false;
  }
}
