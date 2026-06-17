"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";
import { AwButton } from "@/components/ui/AwButton";
import { TbFolder, TbFolderPlus } from "react-icons/tb";
import { Icon } from "@/components/ui/Icon";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (folderName: string) => void;
  parentFolderName?: string;
}

export default function CreateFolderModal({
  isOpen,
  onClose,
  onComplete,
  parentFolderName,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsSubmitting(true);
    // Simula delay de criação
    await new Promise((resolve) => setTimeout(resolve, 300));
    onComplete(folderName.trim());
    setFolderName("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setFolderName("");
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-(--border-subtle)">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-(--bg-muted) flex items-center justify-center text-(--fg-primary)">
              <TbFolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="body-lg font-semibold text-(--fg-primary)">
                Nova Pasta
              </h2>
              {parentFolderName && (
                <p className="body-xs text-(--fg-secondary)">
                  Dentro de: {parentFolderName}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-(--fg-secondary) hover:text-(--fg-primary) hover:bg-(--bg-muted) rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label
              htmlFor="folder-name"
              className="block body-xs font-medium text-(--fg-primary) mb-2"
            >
              Nome da pasta
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-(--fg-tertiary)">
                <TbFolder className="w-5 h-5" />
              </div>
              <input
                id="folder-name"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Ex: Documentos de Vendas"
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-(--border-default) bg-(--bg-canvas) body-sm text-(--fg-primary) placeholder:text-(--fg-tertiary) focus:border-(--fg-primary) focus:outline-hidden focus:ring-1 focus:ring-(--fg-primary) transition-colors"
                autoFocus
              />
            </div>
          </div>

          <p className="body-xs text-(--fg-secondary)">
            As pastas ajudam a organizar seus arquivos, URLs, snippets e
            integrações dentro da base de conhecimento.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-(--border-subtle)">
          <AwButton
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="w-auto px-5"
          >
            Cancelar
          </AwButton>
          <AwButton
            type="submit"
            variant="primary"
            disabled={!folderName.trim() || isSubmitting}
            className={`w-auto px-5 ${
              !folderName.trim() || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Criando...
              </span>
            ) : (
              "Criar pasta"
            )}
          </AwButton>
        </div>
      </form>
    </BaseModal>
  );
}
