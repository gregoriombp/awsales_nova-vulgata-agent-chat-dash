import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";

/**
 * Serverless persistence for Bombardier Live Edit Mode (mirrors the flow-bridge
 * serverless store in `app/api/flow-suggestions/_store.ts`). The page editor
 * posts non-destructive edit "ops" here (same-origin, no token); they live as a
 * staging OVERLAY that the EditModeProvider re-applies on every load, until the
 * materialization skill turns them into real TSX and Greg approves them.
 *
 * One JSON file PER ROUTE (`page-editor/data/<encoded-route>.json` + archive) so
 * the materialization skill can open exactly the route it's fixing. A route's
 * pathname is the file key (encodeURIComponent), e.g. "/integrations" →
 * "%2Fintegrations.json".
 *
 * Lifecycle mirrors flow-bridge:
 *   open ──in_review──► in_review ──apply──► applied   (→ archive, overlay clears)
 *    │                      │      ──discard─► discarded (→ archive)
 *    │                      └──reject──► open
 *    └──discard──► discarded (→ archive)
 */

export type PageEditOpType = "text" | "style" | "hide";

export type PageEditStatus = "open" | "in_review" | "applied" | "discarded";

export type PageEditActor = { kind: "agent" | "user"; id: string; name: string };

export type PageEditResolution = { actor: PageEditActor; at: number; summary: string };

/**
 * Reuses the review-mode anchor contract (selector + fingerprint), plus a
 * diagnostic snapshot (component/domText) the materialization skill greps the
 * source with. The live resolver lives client-side in lib/bombardier-edit.
 */
export interface PageEditAnchor {
  selector: string;
  fingerprint?: { tag: string; text?: string };
  /** From data-aw-component on the element root, when present. */
  component?: string;
  /** textContent at capture time — helps the agent grep the TSX. */
  domText?: string;
}

export type PageEditPayload =
  | { kind: "text"; text: string; prevText?: string }
  // token is always a `var(--token)` string so the override tracks dark mode.
  | { kind: "style"; prop: string; token: string; prevToken?: string }
  | { kind: "hide"; mode: "hide" | "remove" };

export interface PageEditOp {
  id: string;
  schemaVersion: 1;
  route: string;
  anchor: PageEditAnchor;
  type: PageEditOpType;
  payload: PageEditPayload;
  createdAt: number;
  updatedAt: number;
  authorName?: string;
  status: PageEditStatus;
  resolution?: PageEditResolution;
}

export type Transition = "in_review" | "apply" | "discard" | "reject";

const SCHEMA_VERSION = 1;
const DATA_DIR = path.join(process.cwd(), "page-editor", "data");

function encodeRoute(route: string): string {
  // encodeURIComponent keeps it readable and reversible ("/a/b" → "%2Fa%2Fb").
  return encodeURIComponent(route) || "%2F";
}
function mainFile(route: string): string {
  return path.join(DATA_DIR, `${encodeRoute(route)}.json`);
}
function archiveFile(route: string): string {
  return path.join(DATA_DIR, `${encodeRoute(route)}.archive.json`);
}

type Db = { schemaVersion: number; route: string; ops: PageEditOp[] };

async function readDb(file: string, route: string): Promise<Db> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<Db>;
    return {
      schemaVersion: SCHEMA_VERSION,
      route,
      ops: Array.isArray(parsed.ops) ? parsed.ops : [],
    };
  } catch {
    // Missing/corrupt file → start empty (the dir is created on first write).
    return { schemaVersion: SCHEMA_VERSION, route, ops: [] };
  }
}

async function writeDb(file: string, db: Db): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), "utf8");
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

// Same human-readable stamp the review-bridge / flow-bridge use.
function summarize(
  actor: PageEditActor,
  at: number,
  kind: "applied" | "discarded" | "claimed",
): string {
  const verb =
    kind === "applied" ? "Aplicada" : kind === "discarded" ? "Descartada" : "Em revisão por";
  const d = new Date(at);
  const stamp = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} às ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  return kind === "claimed"
    ? `${verb} ${actor.name} em ${stamp}.`
    : `${verb} por ${actor.name} em ${stamp}.`;
}

/** Identidade estável de uma op: tipo + seletor do elemento. Editar o mesmo
 *  elemento+tipo de novo atualiza a op aberta em vez de empilhar — assim o
 *  overlay tem no máximo uma op aberta por (elemento, tipo) e o apply é
 *  determinístico. */
function opKey(type: PageEditOpType, selector: string): string {
  return `${type}::${selector}`;
}

export async function listOps(
  route: string,
  status?: PageEditStatus,
): Promise<PageEditOp[]> {
  const db = await readDb(mainFile(route), route);
  let out = db.ops;
  if (status) out = out.filter((o) => o.status === status);
  return out.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function createOrUpdateOp(input: {
  route: string;
  type: PageEditOpType;
  anchor: PageEditAnchor;
  payload: PageEditPayload;
  authorName?: string;
}): Promise<PageEditOp> {
  const db = await readDb(mainFile(input.route), input.route);
  const now = Date.now();
  const key = opKey(input.type, input.anchor.selector);

  // Upsert: replace a still-OPEN op on the same element+type; leave in_review/
  // applied ops untouched (a fresh edit on a claimed element becomes a new op).
  const existing = db.ops.find(
    (o) => o.status === "open" && opKey(o.type, o.anchor.selector) === key,
  );
  if (existing) {
    existing.anchor = input.anchor;
    existing.payload = input.payload;
    existing.updatedAt = now;
    if (input.authorName) existing.authorName = input.authorName;
    await writeDb(mainFile(input.route), db);
    return existing;
  }

  const op: PageEditOp = {
    id: randomUUID().slice(0, 8),
    schemaVersion: SCHEMA_VERSION,
    route: input.route,
    anchor: input.anchor,
    type: input.type,
    payload: input.payload,
    createdAt: now,
    updatedAt: now,
    authorName: input.authorName,
    status: "open",
  };
  db.ops.push(op);
  await writeDb(mainFile(input.route), db);
  return op;
}

export async function transitionOp(
  route: string,
  id: string,
  transition: Transition,
  actor?: PageEditActor,
): Promise<PageEditOp | null> {
  const main = await readDb(mainFile(route), route);
  const idx = main.ops.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const op = main.ops[idx];
  const at = Date.now();
  const who: PageEditActor = actor ?? { kind: "user", id: "user", name: "Usuário" };

  if (transition === "in_review") {
    if (op.status === "open") {
      op.status = "in_review";
      op.updatedAt = at;
      op.resolution = { actor: who, at, summary: summarize(who, at, "claimed") };
      await writeDb(mainFile(route), main);
    }
    return op;
  }

  if (transition === "reject") {
    if (op.status === "in_review") {
      op.status = "open";
      op.updatedAt = at;
      delete op.resolution;
      await writeDb(mainFile(route), main);
    }
    return op;
  }

  // apply | discard → stamp + move to the archive file (overlay stops applying).
  const finalStatus: PageEditStatus = transition === "apply" ? "applied" : "discarded";
  op.status = finalStatus;
  op.updatedAt = at;
  op.resolution = { actor: who, at, summary: summarize(who, at, finalStatus) };
  main.ops.splice(idx, 1);

  const archive = await readDb(archiveFile(route), route);
  const archiveIdx = archive.ops.findIndex((o) => o.id === id);
  if (archiveIdx === -1) archive.ops.push(op);
  else archive.ops[archiveIdx] = op;

  await writeDb(mainFile(route), main);
  await writeDb(archiveFile(route), archive);
  return op;
}

export async function deleteOp(route: string, id: string): Promise<boolean> {
  const main = await readDb(mainFile(route), route);
  const mainIdx = main.ops.findIndex((o) => o.id === id);
  if (mainIdx !== -1) {
    main.ops.splice(mainIdx, 1);
    await writeDb(mainFile(route), main);
    return true;
  }
  const archive = await readDb(archiveFile(route), route);
  const archiveIdx = archive.ops.findIndex((o) => o.id === id);
  if (archiveIdx !== -1) {
    archive.ops.splice(archiveIdx, 1);
    await writeDb(archiveFile(route), archive);
    return true;
  }
  return false;
}
