#!/usr/bin/env node
// Migração one-off: quantiza os pontos dos traços (anchor kind:"draw") nos
// comentários do Review Mode. Um traço à mão tem ~350 pontos e a precisão de
// float crua é sub-pixel (invisível), mas dobra/triplica o peso do anchor no
// JSON. px -> inteiro, frações de reflow -> 4 casas. Idempotente.
import path from "node:path";
import fs from "node:fs/promises";

const DATA_DIR = path.join(process.cwd(), "review-bridge", "data");
const FILES = ["comments.json", "comments.archive.json"];

const qPoint = (p) => ({ x: Math.round(p.x), y: Math.round(p.y) });
const round4 = (n) => Math.round(n * 1e4) / 1e4;

function quantizeAnchor(a) {
  if (!a || a.kind !== "draw") return a;
  if (a.path && Array.isArray(a.path.points)) a.path.points = a.path.points.map(qPoint);
  if (a.centroid) a.centroid = qPoint(a.centroid);
  if (a.el && Array.isArray(a.el.points))
    a.el.points = a.el.points.map((p) => ({ fx: round4(p.fx), fy: round4(p.fy) }));
  return a;
}

async function main() {
  let draws = 0;
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
      if (c.anchor && c.anchor.kind === "draw") {
        quantizeAnchor(c.anchor);
        draws++;
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
  console.log(`\ntraços quantizados: ${draws}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
