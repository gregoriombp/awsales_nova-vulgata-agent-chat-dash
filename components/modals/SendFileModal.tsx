"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import BaseModal from "./BaseModal";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";

export type UploadedFileItem = {
  id: string;
  name: string;
  type: string;
  size?: number;
  file?: File;
  status: "uploading" | "completed";
  progress: number;
  startedAt: number;
};

interface SendFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Id da base — aceito por compatibilidade; o envio é decorativo (sem backend). */
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
  onComplete,
}: SendFileModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Envio decorativo (sem backend): simula o progresso até 100% no cliente.
  useEffect(() => {
    const id = setInterval(() => {
      setUploadedFiles((prev) => {
        const hasUploading = prev.some((f) => f.status === "uploading");
        if (!hasUploading) return prev;
        const next = prev.map((item) => {
          if (item.status !== "uploading") return item;
          const elapsed = Date.now() - item.startedAt;
          const p = Math.min(100, Math.round((elapsed / UPLOAD_DURATION_MS) * 100));
          return p >= 100
            ? { ...item, status: "completed" as const, progress: 100 }
            : { ...item, progress: p };
        });
        const changed = next.some((item, i) => item !== prev[i]);
        return changed ? next : prev;
      });
    }, 80);
    return () => clearInterval(id);
  }, []);

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
      <div className="flex max-h-[90vh] flex-col p-6">
        <div className="mb-2 flex shrink-0 items-start justify-between">
          <h2 className="text-[20px] font-medium tracking-[-0.01em] text-(--fg-primary)">
            Enviar arquivo
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-sm text-(--fg-tertiary) transition-colors hover:bg-(--bg-surface) hover:text-(--fg-primary)"
            aria-label="Fechar"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <p className="mb-6 shrink-0 text-[14px] leading-relaxed text-(--fg-secondary)">
          Arraste arquivos para esta área ou clique para selecionar. Aceita PDF,
          DOC, DOCX, TXT, MD, XLSX, XLS, CSV, JPG, PNG. Máximo {MAX_SIZE_MB}MB por
          arquivo.
        </p>

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
            className={`shrink-0 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              isDragging
                ? "border-(--fg-primary) bg-(--bg-hover)"
                : "border-(--border-default) bg-(--bg-canvas)"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-(--bg-surface) text-(--fg-tertiary)">
                <Icon name="upload_file" size={32} weight={300} />
              </div>
              <div>
                <p className="mb-1 font-medium text-(--fg-primary)">
                  Arraste e solte arquivos aqui
                </p>
                <p className="mb-4 text-[13.5px] text-(--fg-tertiary)">
                  ou clique para selecionar no seu computador
                </p>
                <AwButton
                  type="button"
                  variant="primary"
                  size="sm"
                  iconLeft="add"
                  className="w-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Adicionar arquivos
                </AwButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex max-h-[50vh] min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
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
                  className="flex shrink-0 items-start gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-[10px] font-semibold uppercase text-(--fg-secondary)">
                    {kind === "csv" ? "CSV" : kind === "pdf" ? "PDF" : "DOC"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-(--fg-primary)">{item.name}</p>
                    <p className="mt-0.5 text-[12px] text-(--fg-tertiary)">{sizeLabel}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--bg-muted)">
                      <div
                        className="h-full rounded-full bg-(--fg-primary) transition-all duration-150 ease-out"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className={`shrink-0 rounded-md p-1.5 transition-colors ${
                      item.status === "completed"
                        ? "text-(--accent-danger) hover:bg-(--bg-muted)"
                        : "text-(--fg-tertiary) hover:bg-(--bg-muted) hover:text-(--fg-primary)"
                    }`}
                    aria-label={`${item.status === "completed" ? "Excluir" : "Cancelar"} ${item.name}`}
                  >
                    <Icon name={item.status === "completed" ? "delete" : "close"} size={18} weight={300} />
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex shrink-0 items-center justify-center gap-2 rounded-md border border-dashed border-(--border-default) py-2.5 text-[13.5px] font-medium text-(--fg-secondary) transition-colors hover:bg-(--bg-hover) hover:text-(--fg-primary)"
            >
              <Icon name="add" size={18} weight={300} />
              Adicionar arquivos
            </button>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
