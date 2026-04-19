import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "storage", "uploads");
const MAX_TOTAL_BYTES = 1024 * 1024 * 1024; // 1GB
const META_FILENAME = "_meta.json";

export type FileMeta = { name: string; mimeType: string };

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function getTotalStorageBytes(): Promise<number> {
  let total = 0;
  try {
    const baseDirs = await fs.readdir(UPLOADS_DIR);
    for (const baseId of baseDirs) {
      const basePath = path.join(UPLOADS_DIR, baseId);
      const stat = await fs.stat(basePath);
      if (!stat.isDirectory()) continue;
      const files = await fs.readdir(basePath);
      for (const f of files) {
        if (f === META_FILENAME) continue;
        const fPath = path.join(basePath, f);
        const s = await fs.stat(fPath);
        if (s.isFile()) total += s.size;
      }
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  return total;
}

export async function canAcceptBytes(additionalBytes: number): Promise<boolean> {
  const current = await getTotalStorageBytes();
  return current + additionalBytes <= MAX_TOTAL_BYTES;
}

export async function saveUpload(
  baseId: string,
  fileId: string,
  buffer: Buffer,
  name: string,
  mimeType: string
): Promise<void> {
  const basePath = path.join(UPLOADS_DIR, baseId);
  await ensureDir(basePath);
  const filePath = path.join(basePath, fileId);
  await fs.writeFile(filePath, buffer);
  const metaPath = path.join(basePath, META_FILENAME);
  let meta: Record<string, FileMeta> = {};
  try {
    const raw = await fs.readFile(metaPath, "utf-8");
    meta = JSON.parse(raw) as Record<string, FileMeta>;
  } catch {
    // new base or no meta yet
  }
  meta[fileId] = { name, mimeType };
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 0), "utf-8");
}

export async function getFileMeta(
  baseId: string,
  fileId: string
): Promise<FileMeta | null> {
  const metaPath = path.join(UPLOADS_DIR, baseId, META_FILENAME);
  try {
    const raw = await fs.readFile(metaPath, "utf-8");
    const meta = JSON.parse(raw) as Record<string, FileMeta>;
    return meta[fileId] ?? null;
  } catch {
    return null;
  }
}

export async function getFilePath(baseId: string, fileId: string): Promise<string | null> {
  const filePath = path.join(UPLOADS_DIR, baseId, fileId);
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() ? filePath : null;
  } catch {
    return null;
  }
}
