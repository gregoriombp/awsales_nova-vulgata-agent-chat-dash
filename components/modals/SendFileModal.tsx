"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import BaseModal from "./BaseModal";

export type UploadedFileItem = {
  id: string;
  name: string;
  type: string;
  size?: number;
  file?: File;
  status: "uploading" | "completed";
  progress: number;
  startedAt: number;
  /** Id retornado pelo servidor após upload; usar como id da linha para preview */
  serverId?: string;
};

interface SendFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Id da base (ex.: knowledge-os/[id]); quando informado, faz upload real para storage local */
  baseId?: string;
  onComplete?: (files: UploadedFileItem[]) => void;
}

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.csv,.jpg,.jpeg,.png";
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const UPLOAD_DURATION_MS = 2200;

function getFileKind(name: string, type: string): "csv" | "pdf" | "other" {
  const ext = name.split(".").pop()?.toLowerCase() ?? type.split("/").pop()?.toLowerCase() ?? "";
  if (ext === "csv" || type.includes("csv")) return "csv";
  if (ext === "pdf" || type.includes("pdf")) return "pdf";
  return "other";
}

function formatSize(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`;
}

export default function SendFileModal({
  isOpen,
  onClose,
  baseId,
  onComplete,
}: SendFileModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadStartedRef = useRef(false);

  // Com baseId: só avança progresso (até 95%); completed vem do retorno da API. Sem baseId: simula até 100%
  useEffect(() => {
    const id = setInterval(() => {
      setUploadedFiles((prev) => {
        const hasUploading = prev.some((f) => f.status === "uploading");
        if (!hasUploading) return prev;
        const cap = baseId ? 95 : 100;
        const next = prev.map((item) => {
          if (item.status !== "uploading") return item;
          const elapsed = Date.now() - item.startedAt;
          const p = Math.min(cap, Math.round((elapsed / UPLOAD_DURATION_MS) * 100));
          const completed = !baseId && p >= 100;
          return completed ? { ...item, status: "completed" as const, progress: 100 } : { ...item, progress: p };
        });
        const changed = next.some((item, i) => item !== prev[i]);
        return changed ? next : prev;
      });
    }, 80);
    return () => clearInterval(id);
  }, [baseId]);

  // Upload real quando baseId está definido e há itens com file
  useEffect(() => {
    if (!baseId?.trim() || uploadedFiles.length === 0) return;
    const uploading = uploadedFiles.filter((f) => f.status === "uploading" && f.file);
    if (uploading.length === 0) return;
    if (uploadStartedRef.current) return;
    uploadStartedRef.current = true;
    setUploadError(null);

    const formData = new FormData();
    formData.set("baseId", baseId);
    uploading.forEach((f) => formData.append("file", f.file!));

    fetch("/api/knowledge-os/upload", { method: "POST", body: formData })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error ?? "Falha no upload");
        }
        const serverFiles = (data.files ?? []) as { id: string; name: string }[];
        let idx = 0;
        setUploadedFiles((prev) =>
          prev.map((item) => {
            if (item.status !== "uploading") return item;
            const server = serverFiles[idx++];
            return {
              ...item,
              status: "completed" as const,
              progress: 100,
              serverId: server?.id,
            };
          })
        );
      })
      .catch((err) => {
        setUploadError(err?.message ?? "Erro ao enviar arquivos");
        setUploadedFiles((prev) =>
          prev.map((item) => (item.status === "uploading" ? { ...item, progress: 0 } : item))
        );
      })
      .finally(() => {
        uploadStartedRef.current = false;
      });
  }, [baseId, uploadedFiles.length]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const valid = files.filter((f) => f.size <= MAX_SIZE_BYTES);
    const now = Date.now();
    const newItems: UploadedFileItem[] = valid.map((file) => ({
      id: `${file.name}-${now}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file,
      status: "uploading" as const,
      progress: 0,
      startedAt: now,
    }));
    setUploadedFiles((prev) => [...prev, ...newItems]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.length) addFiles(files);
      e.target.value = "";
    },
    [addFiles]
  );

  const handleClose = useCallback(() => {
    setUploadedFiles([]);
    onClose();
  }, [onClose]);

  // Quando todos os arquivos terminam, chama onComplete e fecha
  useEffect(() => {
    if (uploadedFiles.length === 0) return;
    const allCompleted = uploadedFiles.every((f) => f.status === "completed");
    if (!allCompleted) return;
    const t = setTimeout(() => {
      onComplete?.(uploadedFiles);
      setUploadedFiles([]);
      onClose();
    }, 400);
    return () => clearTimeout(t);
  }, [uploadedFiles, onComplete, onClose]);

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className=" font-heading font-bold text-text-primary">
            Enviar arquivo
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Fechar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <p className="text-text-secondary body-sm mb-6 flex-shrink-0">
          Arraste os arquivos para esta área ou clique para selecionar. Formatos aceitos: PDF, DOC, DOCX, TXT, MD, XLSX, XLS, CSV, JPG, PNG. Tamanho máximo por arquivo: {MAX_SIZE_MB}MB.
        </p>
        {uploadError && (
          <p className="text-red-600 body-sm mb-4 flex-shrink-0" role="alert">
            {uploadError}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          onChange={handleFileInput}
          className="sr-only"
          aria-hidden
        />

        {uploadedFiles.length === 0 ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors flex-shrink-0 ${
              isDragging
                ? "border-gray-1200 bg-[#f5f5f5]"
                : "border-[#e5e5e5] bg-[#f5f5f5]"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#f2f2f2] flex items-center justify-center text-[#999999]">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-8-6Z" />
                  <path d="M14 3v6h8" />
                </svg>
              </div>
              <div>
                <p className="text-[#1a1a1a] font-medium mb-1">
                  Arraste e solte arquivos aqui
                </p>
                <p className="body-sm text-[#999999] mb-4">
                  ou clique para selecionar no seu computador
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-1200 text-white rounded-lg hover:bg-[#111111] active:bg-black transition-colors cursor-pointer body-sm font-medium"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Adicionar arquivos
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto max-h-[50vh]">
            {uploadedFiles.map((item) => {
              const kind = getFileKind(item.name, item.type);
              const totalBytes = item.size ?? 0;
              const currentBytes =
                item.status === "uploading"
                  ? Math.round((totalBytes * item.progress) / 100)
                  : totalBytes;
              const sizeLabel =
                item.status === "uploading"
                  ? `${formatSize(currentBytes)} de ${formatSize(totalBytes)}`
                  : `${formatSize(totalBytes)} de ${formatSize(totalBytes)}`;

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#e5e5e5] flex-shrink-0"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white body-xs font-semibold uppercase ${
                      kind === "csv"
                        ? "bg-[#0d7d4d]"
                        : kind === "pdf"
                          ? "bg-[#c41e3a]"
                          : "bg-[#5f6368]"
                    }`}
                  >
                    {kind === "csv" ? "CSV" : kind === "pdf" ? "PDF" : "DOC"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="body-sm font-medium text-[#1a1a1a] truncate">{item.name}</p>
                    <p className="body-xs text-[#666] mt-0.5">{sizeLabel}</p>
                    <div className="mt-2 h-1.5 bg-[#e8f0fe] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1a73e8] rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {item.status === "uploading" ? (
                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        className="p-1.5 text-[#666] hover:text-[#1a1a1a] hover:bg-[#f2f2f2] rounded-lg transition-colors"
                        aria-label={`Cancelar ${item.name}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        className="p-1.5 text-[#c41e3a] hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Excluir ${item.name}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 body-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] rounded-lg transition-colors border border-dashed border-[#1a73e8] border-opacity-50 flex-shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Adicionar arquivos
            </button>
          </div>
        )}

      </div>
    </BaseModal>
  );
}
