import path from "node:path";
import fs from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";

import { IMAGES_DIR, contentTypeFor, isSafeImageName } from "../../_images";

export const runtime = "nodejs";

/**
 * Serve um anexo content-addressed do Review Mode. O nome é um sha256 + extensão
 * (validado antes de tocar o disco — sem traversal) e o conteúdo é imutável, daí
 * o cache agressivo: a mesma URL nunca aponta pra bytes diferentes.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!isSafeImageName(name)) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }
  try {
    const buf = await fs.readFile(path.join(IMAGES_DIR, name));
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": contentTypeFor(name),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
