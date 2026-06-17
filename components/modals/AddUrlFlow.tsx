"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";

type PageItem = {
  id: string;
  path: string;
  selected: boolean;
};

interface AddUrlFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (url: string, title: string, pages: PageItem[]) => void;
}

export default function AddUrlFlow({
  isOpen,
  onClose,
  onComplete,
}: AddUrlFlowProps) {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [pageElementMode, setPageElementMode] = useState<"main" | "custom">("main");
  const [additionalUrls, setAdditionalUrls] = useState<string[]>([]);
  const [excludedUrls, setExcludedUrls] = useState<string[]>([]);

  const handleUrlSubmit = () => {
    if (!url.trim()) return;
    
    // Simulate fetching site title and pages
    const mockTitle = "Artificial Concord - Projetos Práticos e Criativos Baseados em Inteligência Artificial";
    const mockPages: PageItem[] = [
      { id: "1", path: "/blog/2024/future-of-ai", selected: true },
      { id: "2", path: "/about", selected: true },
      { id: "3", path: "/ai-consulting", selected: true },
      { id: "4", path: "/ai-ethics", selected: true },
      { id: "5", path: "/ai-research", selected: true },
      { id: "6", path: "/ai-cloud", selected: true },
      { id: "7", path: "/ai-robots", selected: true },
      { id: "8", path: "/ai-algorithms", selected: true },
      { id: "9", path: "/ai-innovation", selected: true },
      { id: "10", path: "/ai-solutions", selected: false },
    ];

    setTitle(mockTitle);
    setPages(mockPages);
    setStep(3);
  };

  const togglePage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const toggleAllPages = () => {
    const allSelected = pages.every((p) => p.selected);
    setPages((prev) => prev.map((p) => ({ ...p, selected: !allSelected })));
  };

  const handleSave = () => {
    onComplete(url, title, pages.filter((p) => p.selected));
    handleReset();
  };

  const handleReset = () => {
    setStep(1);
    setUrl("");
    setTitle("");
    setPages([]);
    setIsAdvancedOpen(false);
    setPageElementMode("main");
    setAdditionalUrls([]);
    setExcludedUrls([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Step 1: Empty URL input */}
      {step === 1 && (
        <BaseModal isOpen={isOpen} onClose={handleClose} size="md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-medium tracking-heading text-(--fg-primary)">
                Adicionar URL
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            <p className="text-text-secondary mb-6">
              Adicione a URL da página principal do seu site. Ao adicionar, demais subpáginas serão sincronizadas automaticamente.
            </p>

            <div className="mb-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon name="language" size={20} />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://"
                  className="w-full h-10 pl-12 pr-4 border border-input-border bg-input-bg rounded-lg focus:outline-hidden focus:ring-2 focus:ring-gray-1200 body-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <AwButton
                variant="primary"
                onClick={() => {
                  if (url.trim()) {
                    setStep(2);
                  }
                }}
                disabled={!url.trim()}
                className="w-auto"
              >
                Avançar
              </AwButton>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Step 2: URL with example filled */}
      {step === 2 && (
        <BaseModal isOpen={isOpen} onClose={handleClose} size="md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-medium tracking-heading text-(--fg-primary)">
                Adicionar URL
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            <p className="text-text-secondary mb-6">
              Adicione a URL da página principal do seu site. Ao adicionar, demais subpáginas serão sincronizadas automaticamente.
            </p>

            <div className="mb-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon name="language" size={20} />
                </div>
                <input
                  type="text"
                  value={url || "https://artificialconcord.com"}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-10 pl-12 pr-4 border border-input-border bg-input-bg rounded-lg focus:outline-hidden focus:ring-2 focus:ring-gray-1200 body-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <AwButton variant="primary" onClick={handleUrlSubmit} className="w-auto">
                Avançar
              </AwButton>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Step 3: Review pages (collapsed advanced) */}
      {step === 3 && (
        <BaseModal isOpen={isOpen} onClose={handleClose} size="xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-medium tracking-heading text-(--fg-primary)">
                Adicionar URL
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block body-sm font-medium text-text-primary mb-2">
                Título
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center body-xs text-gray-600">
                  y.
                </div>
                <span className="body-sm text-text-primary">{title}</span>
              </div>
            </div>

            {/* Review pages */}
            <div className="mb-6">
              <h3 className="body-lg font-semibold text-text-primary mb-2">
                Revisar páginas para sincronizar
              </h3>
              <p className="body-sm text-text-secondary mb-4">
                Todas as subpáginas vinculadas em cada seção selecionada serão sincronizadas. Selecione somente conteúdo relevante e atualizado.
              </p>

              <div className="border border-gray-200 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <button
                    type="button"
                    onClick={toggleAllPages}
                    className="shrink-0"
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center ${
                        pages.every((p) => p.selected)
                          ? "bg-gray-1200 border-gray-1200"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {pages.every((p) => p.selected) && (
                        <Icon name="check" size={12} className="text-white" />
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-2 flex-1">
                    <Icon name="language" size={16} className="text-gray-400" />
                    <span className="body-sm text-text-primary">{url || "https://artificialconcord.com/"}</span>
                  </div>
                </div>

                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center gap-3 p-2 pl-8 hover:bg-gray-50 rounded"
                  >
                    <button
                      type="button"
                      onClick={() => togglePage(page.id)}
                      className="shrink-0"
                    >
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          page.selected
                            ? "bg-gray-1200 border-gray-1200"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {page.selected && (
                          <Icon name="check" size={12} className="text-white" />
                        )}
                      </div>
                    </button>
                    <span className="body-sm text-text-primary">{page.path}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced settings (collapsed) */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="body-sm font-medium text-text-primary">
                  Configurações avançadas
                </span>
                <Icon
                  name="expand_more"
                  size={16}
                  className={`transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <AwButton variant="secondary" onClick={handleClose} className="w-auto">
                Cancelar
              </AwButton>
              <AwButton variant="primary" onClick={() => setStep(4)} className="w-auto">
                Avançar
              </AwButton>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Step 4: Review pages (expanded advanced) */}
      {step === 4 && (
        <BaseModal isOpen={isOpen} onClose={handleClose} size="xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-medium tracking-heading text-(--fg-primary)">
                Adicionar URL
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block body-sm font-medium text-text-primary mb-2">
                Título
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center body-xs text-gray-600">
                  y.
                </div>
                <span className="body-sm text-text-primary">{title}</span>
              </div>
            </div>

            {/* Review pages */}
            <div className="mb-6">
              <h3 className="body-lg font-semibold text-text-primary mb-2">
                Revisar páginas para sincronizar
              </h3>
              <p className="body-sm text-text-secondary mb-4">
                Todas as subpáginas vinculadas em cada seção selecionada serão sincronizadas. Selecione somente conteúdo relevante e atualizado.
              </p>

              <div className="border border-gray-200 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <button
                    type="button"
                    onClick={toggleAllPages}
                    className="shrink-0"
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center ${
                        pages.every((p) => p.selected)
                          ? "bg-gray-1200 border-gray-1200"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {pages.every((p) => p.selected) && (
                        <Icon name="check" size={12} className="text-white" />
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-2 flex-1">
                    <Icon name="language" size={16} className="text-gray-400" />
                    <span className="body-sm text-text-primary">{url || "https://artificialconcord.com/"}</span>
                  </div>
                </div>

                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center gap-3 p-2 pl-8 hover:bg-gray-50 rounded"
                  >
                    <button
                      type="button"
                      onClick={() => togglePage(page.id)}
                      className="shrink-0"
                    >
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          page.selected
                            ? "bg-gray-1200 border-gray-1200"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {page.selected && (
                          <Icon name="check" size={12} className="text-white" />
                        )}
                      </div>
                    </button>
                    <span className="body-sm text-text-primary">{page.path}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced settings (expanded) */}
            <div className="mb-6 space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <h3 className="body-sm font-semibold text-text-primary mb-4">
                  Configurações avançadas
                </h3>

                {/* Additional URLs */}
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="add" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="body-sm text-text-primary mb-2">
                        Adicione páginas para sincronizar que não estejam vinculadas como subpáginas das seções acima.
                      </p>
                      <AwButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setAdditionalUrls([...additionalUrls, ""])}
                        className="w-auto"
                      >
                        <Icon name="add" size={16} className="mr-1" />
                        Adicionar
                      </AwButton>
                    </div>
                  </div>
                </div>

                {/* Excluded URLs */}
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="close" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="body-sm text-text-primary mb-2">
                        Especifique todas as páginas que não quiser sincronizar.
                      </p>
                      <AwButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setExcludedUrls([...excludedUrls, ""])}
                        className="w-auto"
                      >
                        <Icon name="add" size={16} className="mr-1" />
                        Adicionar
                      </AwButton>
                    </div>
                  </div>
                </div>

                {/* Page elements */}
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="task_alt" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="body-sm font-medium text-text-primary mb-3">
                        Elementos da página a incluir
                      </p>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="pageElement"
                            checked={pageElementMode === "main"}
                            onChange={() => setPageElementMode("main")}
                            className="mt-1"
                          />
                          <div>
                            <p className="body-sm text-text-primary font-medium">
                              Somente conteúdo da página principal
                            </p>
                            <p className="body-xs text-text-secondary mt-1">
                              Exclui elementos como cabeçalhos, rodapés, modais, scripts e imagens.
                            </p>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="pageElement"
                            checked={pageElementMode === "custom"}
                            onChange={() => setPageElementMode("custom")}
                            className="mt-1"
                          />
                          <div>
                            <p className="body-sm text-text-primary font-medium">
                              Personalizado
                            </p>
                            <p className="body-xs text-text-secondary mt-1">
                              Inclua ou exclua elementos específicos da página, além do conteúdo principal.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <AwButton variant="secondary" onClick={handleClose} className="w-auto">
                Cancelar
              </AwButton>
              <AwButton variant="primary" onClick={() => setStep(5)} className="w-auto">
                Avançar
              </AwButton>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Step 5: Final review */}
      {step === 5 && (
        <BaseModal isOpen={isOpen} onClose={handleClose} size="xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-medium tracking-heading text-(--fg-primary)">
                Adicionar URL
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block body-sm font-medium text-text-primary mb-2">
                Título
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center body-xs text-gray-600">
                  y.
                </div>
                <span className="body-sm text-text-primary">{title}</span>
              </div>
            </div>

            {/* Review pages summary */}
            <div className="mb-6">
              <h3 className="body-lg font-semibold text-text-primary mb-2">
                Revisar páginas para sincronizar
              </h3>
              <p className="body-sm text-text-secondary mb-4">
                {pages.filter((p) => p.selected).length} página(s) selecionada(s) para sincronização.
              </p>
            </div>

            {/* Advanced settings summary */}
            {isAdvancedOpen && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="body-sm text-text-secondary">
                  Configurações avançadas aplicadas
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <AwButton variant="secondary" onClick={() => setStep(4)} className="w-auto">
                Voltar
              </AwButton>
              <AwButton variant="primary" onClick={handleSave} className="w-auto">
                Salvar URL
              </AwButton>
            </div>
          </div>
        </BaseModal>
      )}
    </>
  );
}
