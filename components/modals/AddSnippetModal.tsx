"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput, AwField } from "@/components/ui/AwInput";

interface AddSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (name: string, content: string) => void;
}

export default function AddSnippetModal({
  isOpen,
  onClose,
  onComplete,
}: AddSnippetModalProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const reset = () => {
    setName("");
    setContent("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = name.trim() || "Snippet sem título";
    const snippetContent = content.trim();
    if (!snippetContent) return;
    onComplete?.(displayName, snippetContent);
    reset();
    onClose();
  };

  const isValid = content.trim().length > 0;

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
        <div className="px-6 pb-4 pt-6">
          <h2 className="text-[20px] font-medium tracking-[-0.01em] text-[var(--fg-primary)]">
            Adicionar snippet
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-[var(--fg-secondary)]">
            Insira o conteúdo do snippet. Ele vira uma fonte na pasta atual.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-2">
          <AwField label="Nome (opcional)">
            <AwInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: FAQ_Marca_Concord"
            />
          </AwField>
          <AwField label="Conteúdo do snippet">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Cole ou digite o texto do snippet aqui…"
              rows={8}
              className="min-h-[140px] w-full resize-y rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-[14px] text-[var(--fg-primary)] outline-none transition-colors placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg-primary)]"
            />
          </AwField>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border-subtle)] px-6 py-4">
          <AwButton type="button" variant="secondary" size="sm" className="w-auto" onClick={handleClose}>
            Cancelar
          </AwButton>
          <AwButton type="submit" variant="primary" size="sm" className="w-auto" disabled={!isValid}>
            Adicionar
          </AwButton>
        </div>
      </form>
    </BaseModal>
  );
}
