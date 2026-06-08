"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";
import { AwButton } from "@/components/ui/AwButton";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { Icon } from "@/components/ui/Icon";

export type IntegrationItem = {
  id: string;
  name: string;
  shortLabel: string; // fallback quando não houver marca no registry
  description?: string;
  icon?: string;
};

/* Defaults usam ids do registry canônico do AwBrandLogo (o mesmo do styleguide),
 * então os logos renderizam de verdade — sem PNG/URL solto. */
export const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  { id: "hubspot", name: "HubSpot", shortLabel: "H", description: "CRM e marketing" },
  { id: "rdstation", name: "RD Station", shortLabel: "RD", description: "Automação de marketing" },
  { id: "pipedrive", name: "Pipedrive", shortLabel: "P", description: "CRM de vendas" },
  { id: "calendly", name: "Calendly", shortLabel: "C", description: "Agendamentos" },
];

interface ActivateIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (integrations: IntegrationItem[]) => void;
  integrations?: IntegrationItem[];
}

/** Caixa de seleção apenas visual — o item inteiro é o botão que alterna. */
function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm border transition-colors " +
        (checked
          ? "border-(--fg-primary) bg-(--fg-primary) text-(--bg-raised)"
          : "border-(--border-default) bg-(--bg-raised)")
      }
    >
      {checked && <Icon name="check" size={12} />}
    </span>
  );
}

export default function ActivateIntegrationsModal({
  isOpen,
  onClose,
  onComplete,
  integrations = DEFAULT_INTEGRATIONS,
}: ActivateIntegrationsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = selectedIds.size === integrations.length;

  const selectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(integrations.map((i) => i.id)));
  };

  const handleConfirm = () => {
    const selected = integrations.filter((i) => selectedIds.has(i.id));
    if (selected.length > 0) onComplete?.(selected);
    setSelectedIds(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    onClose();
  };

  const selectedCount = selectedIds.size;

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="flex max-h-[90vh] flex-col">
        <div className="px-6 pb-4 pt-6">
          <h2 className="text-[20px] font-medium tracking-[-0.01em] text-(--fg-primary)">
            Ativar integrações
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-(--fg-secondary)">
            Selecione as integrações que viram fonte nesta pasta. A IA analisa os
            dados e gera Knowledge Layers.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-2">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={selectAll}
              className="text-[13px] font-medium text-(--fg-secondary) transition-colors hover:text-(--fg-primary)"
            >
              {allSelected ? "Desmarcar todas" : "Selecionar todas"}
            </button>
            {selectedCount > 0 && (
              <span className="text-[13px] text-(--fg-tertiary)">
                {selectedCount} selecionada{selectedCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <ul className="flex flex-col gap-2">
            {integrations.map((integration) => {
              const checked = selectedIds.has(integration.id);
              return (
                <li key={integration.id}>
                  <button
                    type="button"
                    onClick={() => toggle(integration.id)}
                    className={
                      "flex w-full items-center gap-3.5 rounded-lg border p-3.5 text-left transition-colors " +
                      (checked
                        ? "border-(--fg-primary) bg-(--bg-hover)"
                        : "border-(--border-subtle) bg-(--bg-raised) hover:border-(--border-default) hover:bg-(--bg-hover)")
                    }
                  >
                    <CheckBox checked={checked} />
                    <AwBrandLogo brand={integration.id} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium text-(--fg-primary)">
                        {integration.name}
                      </div>
                      {integration.description && (
                        <div className="mt-0.5 text-[12.5px] text-(--fg-tertiary)">
                          {integration.description}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex justify-end gap-2 border-t border-(--border-subtle) px-6 py-4">
          <AwButton type="button" variant="secondary" size="sm" className="w-auto" onClick={handleClose}>
            Cancelar
          </AwButton>
          <AwButton
            type="button"
            variant="primary"
            size="sm"
            className="w-auto"
            disabled={selectedCount === 0}
            onClick={handleConfirm}
          >
            Ativar integrações
          </AwButton>
        </div>
      </div>
    </BaseModal>
  );
}
