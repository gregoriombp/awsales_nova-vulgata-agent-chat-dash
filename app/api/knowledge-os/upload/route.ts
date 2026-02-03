import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { canAcceptBytes, saveUpload } from "@/lib/storage-uploads";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB per file (optional cap)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const baseId = formData.get("baseId");
    if (!baseId || typeof baseId !== "string" || !baseId.trim()) {
      return NextResponse.json(
        { error: "baseId é obrigatório" },
        { status: 400 }
      );
    }
    const rawFiles = formData.getAll("file");
    const files = rawFiles.filter((f): f is File => f instanceof File && typeof f.size === "number");
    if (!files.length) {
      return NextResponse.json(
        { error: "Envie pelo menos um arquivo" },
        { status: 400 }
      );
    }
    let totalNewBytes = 0;
    for (const f of files) {
      if (f && f.size != null) totalNewBytes += f.size;
    }
    const allowed = await canAcceptBytes(totalNewBytes);
    if (!allowed) {
      return NextResponse.json(
        { error: "Limite de armazenamento atingido (máx. 1GB). Remova arquivos ou libere espaço." },
        { status: 413 }
      );
    }
    const results: { id: string; name: string }[] = [];
    for (const file of files) {
      if (!file?.size) continue;
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Arquivo "${file.name}" excede 100MB por arquivo.` },
          { status: 413 }
        );
      }
      const fileId = randomUUID();
      const buffer = Buffer.from(await file.arrayBuffer());
      const name = file.name || "arquivo";
      const mimeType = file.type || "application/octet-stream";
      await saveUpload(baseId, fileId, buffer, name, mimeType);
      results.push({ id: fileId, name });
    }
    return NextResponse.json({ files: results });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Erro ao salvar o arquivo." },
      { status: 500 }
    );
  }
}
