import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

import type { ReviewComment } from "@/components/bombardier-review/types";

/**
 * Externaliza anexos de imagem do Review Mode. Antes, cada `data:...;base64,...`
 * vivia INLINE dentro do comentário — o que inflava review-bridge/data/*.json
 * (chegou a 21MB) e fazia cada escrita reescrever megabytes só pra mexer num
 * status. Agora os bytes vão pra disco content-addressed (sha256 = dedup grátis)
 * e o JSON guarda só uma ref `/api/review-bridge/images/<hash>.<ext>` — que o
 * cliente renderiza direto em `<img src>` (vide ReviewCommentCard/ThreadPopover).
 *
 * Tudo é aditivo: refs já externalizadas e data URIs legados convivem; a leitura
 * não precisa reidratar nada.
 */

const DATA_DIR = path.join(process.cwd(), "review-bridge", "data");
export const IMAGES_DIR = path.join(DATA_DIR, "images");

const ROUTE_PREFIX = "/api/review-bridge/images/";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

const DATA_URI_RE = /^data:([a-z0-9.+/-]+);base64,(.+)$/i;
// Só nomes content-addressed válidos podem ser servidos/aceitos (anti traversal).
const FILENAME_RE = /^[a-f0-9]{64}\.[a-z0-9]+$/;

/** Extrai o filename seguro de uma ref `/api/review-bridge/images/<name>`. */
export function refToFilename(ref: string): string | null {
  if (!ref.startsWith(ROUTE_PREFIX)) return null;
  const name = ref.slice(ROUTE_PREFIX.length);
  return FILENAME_RE.test(name) ? name : null;
}

/** Valida um filename vindo da rota antes de tocar o disco. */
export function isSafeImageName(name: string): boolean {
  return FILENAME_RE.test(name);
}

export function contentTypeFor(name: string): string {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  for (const [mime, e] of Object.entries(MIME_EXT)) if (e === ext) return mime;
  return "application/octet-stream";
}

/**
 * Persiste um único data URI no pool e devolve a ref. Strings que não são
 * `data:...;base64,...` (refs já externalizadas, URLs http) voltam intactas.
 */
async function persistDataUri(value: string): Promise<string> {
  const m = value.match(DATA_URI_RE);
  if (!m) return value;
  const mime = m[1].toLowerCase();
  let buf: Buffer;
  try {
    buf = Buffer.from(m[2], "base64");
  } catch {
    return value;
  }
  if (buf.length === 0) return value;
  const ext = MIME_EXT[mime] ?? "bin";
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  const filename = `${hash}.${ext}`;
  const dest = path.join(IMAGES_DIR, filename);
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  try {
    await fs.access(dest); // já existe → dedup, não reescreve
  } catch {
    const tmp = `${dest}.tmp`;
    await fs.writeFile(tmp, buf);
    await fs.rename(tmp, dest); // atômico
  }
  return `${ROUTE_PREFIX}${filename}`;
}

/** Externaliza uma lista de imagens (campo `images`), preservando a ordem. */
export async function externalizeImageList(
  images?: string[],
): Promise<string[] | undefined> {
  if (!Array.isArray(images) || images.length === 0) return images;
  const out: string[] = [];
  for (const s of images) {
    out.push(typeof s === "string" ? await persistDataUri(s) : s);
  }
  return out;
}

/** Externaliza imagens do comentário e de todas as suas replies. */
export async function externalizeComment(
  comment: ReviewComment,
): Promise<ReviewComment> {
  const next: ReviewComment = { ...comment };
  if (next.images) next.images = await externalizeImageList(next.images);
  if (Array.isArray(next.replies)) {
    next.replies = await Promise.all(
      next.replies.map(async (r) =>
        r.images ? { ...r, images: await externalizeImageList(r.images) } : r,
      ),
    );
  }
  return next;
}
