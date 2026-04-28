import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { getFilePath, getFileMeta } from "@/lib/storage-uploads";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ baseId: string; fileId: string }> }
) {
  try {
    const { baseId, fileId } = await context.params;
    if (!baseId?.trim() || !fileId?.trim()) {
      return NextResponse.json({ error: "baseId e fileId são obrigatórios" }, { status: 400 });
    }
    const filePath = await getFilePath(baseId, fileId);
    if (!filePath) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }
    const meta = await getFileMeta(baseId, fileId);
    const mimeType = meta?.mimeType ?? "application/octet-stream";
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error("Preview error:", e);
    return NextResponse.json({ error: "Erro ao servir o arquivo." }, { status: 500 });
  }
}
