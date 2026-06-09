"use client";

import BaseModal from "./BaseModal";
import { Icon } from "@/components/ui/Icon";
import { AwDropzone, type AwDropzoneFile } from "@/components/ui/AwDropzone";

/** Mantido pra compatibilidade com quem importa o tipo (ex. /memory-base/[id]). */
export type UploadedFileItem = AwDropzoneFile;

interface SendFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Id da base — aceito por compatibilidade; o envio é decorativo (sem backend). */
  baseId?: string;
  onComplete?: (files: UploadedFileItem[]) => void;
}

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.csv,.jpg,.jpeg,.png";
const MAX_SIZE_MB = 10;

export default function SendFileModal({
  isOpen,
  onClose,
  onComplete,
}: SendFileModalProps) {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex max-h-[90vh] flex-col p-6">
        <div className="mb-2 flex shrink-0 items-start justify-between">
          <h2 className="text-[20px] font-medium tracking-[-0.01em] text-(--fg-primary)">
            Enviar arquivo
          </h2>
          <button
            type="button"
            onClick={onClose}
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

        <AwDropzone
          accept={ACCEPTED_TYPES}
          maxSizeMb={MAX_SIZE_MB}
          variant="default"
          onComplete={(files) => {
            // pequena pausa pra mostrar 100% antes de fechar
            setTimeout(() => {
              onComplete?.(files);
              onClose();
            }, 400);
          }}
        />
      </div>
    </BaseModal>
  );
}
