"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";
import Button from "../Button";

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
      <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
        <div className="p-6 border-b border-[#f2f2f2]">
          <h2 className="body-xl font-heading font-bold text-[#1a1a1a]">
            Adicionar Snippet
          </h2>
          <p className="mt-1 body-sm text-[#5e5e5e]">
            Insira o conteúdo do snippet. Ele será salvo na lista de fontes da pasta.
          </p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="snippet-name" className="block body-sm font-medium text-[#2f2f2f] mb-1.5">
              Nome (opcional)
            </label>
            <input
              id="snippet-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: FAQ_Marca_Concord"
              className="w-full h-10 rounded-[8px] border border-[#e5e5e5] bg-[#f5f5f5] px-4 body-sm text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]"
            />
          </div>
          <div>
            <label htmlFor="snippet-content" className="block body-sm font-medium text-[#2f2f2f] mb-1.5">
              Conteúdo do Snippet *
            </label>
            <textarea
              id="snippet-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Cole ou digite o texto do snippet aqui..."
              rows={8}
              className="w-full rounded-[8px] border border-[#e5e5e5] bg-[#f5f5f5] px-4 py-3 body-sm text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[120px]"
            />
          </div>
        </div>

        <div className="p-6 border-t border-[#f2f2f2] flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" className="w-auto" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" className="w-auto" disabled={!isValid}>
            Adicionar
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
