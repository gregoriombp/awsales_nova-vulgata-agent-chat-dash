"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";
import { AwButton } from "@/components/ui/AwButton";
import { TbFolder, TbFolderPlus } from "react-icons/tb";

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
        <div className="flex items-center justify-between p-6 border-b border-[#f2f2f2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f2f2f2] flex items-center justify-center text-[#2f2f2f]">
              <TbFolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="body-lg font-semibold text-[#1a1a1a]">
                Nova Pasta
              </h2>
              {parentFolderName && (
                <p className="body-xs text-[#5e5e5e]">
                  Dentro de: {parentFolderName}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-[#5e5e5e] hover:text-[#1a1a1a] hover:bg-[#f2f2f2] rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label
              htmlFor="folder-name"
              className="block body-xs font-medium text-[#2f2f2f] mb-2"
            >
              Nome da pasta
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]">
                <TbFolder className="w-5 h-5" />
              </div>
              <input
                id="folder-name"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Ex: Documentos de Vendas"
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#e5e5e5] bg-white body-sm text-[#1a1a1a] placeholder:text-[#999] focus:border-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] transition-colors"
                autoFocus
              />
            </div>
          </div>

          <p className="body-xs text-[#5e5e5e]">
            As pastas ajudam a organizar seus arquivos, URLs, snippets e
            integrações dentro da base de conhecimento.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#f2f2f2]">
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
