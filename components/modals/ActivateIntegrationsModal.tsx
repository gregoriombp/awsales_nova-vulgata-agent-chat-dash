"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";
import Button from "../Button";

const INTEGRATIONS_ASSETS = "/assets/integrations";

export type IntegrationItem = {
  id: string;
  name: string;
  shortLabel: string; // fallback quando não houver ícone
  description?: string;
  /** Caminho do ícone em public/assets/integrations (ex: Logotipo/Tool/Tamanho=104px.png) */
  icon?: string;
};

export const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  { id: "hubspot", name: "HubSpot", shortLabel: "H", description: "CRM e marketing", icon: `${INTEGRATIONS_ASSETS}/Logotipo/IA/Tamanho=104px.png` },
  { id: "klaviyo", name: "Klaviyo", shortLabel: "K", description: "E-mail marketing", icon: `${INTEGRATIONS_ASSETS}/Logotipo/Form/Tamanho=104px.png` },
  { id: "google", name: "Google", shortLabel: "G", description: "Drive, Sheets e Docs", icon: "https://www.gstatic.com/images/branding/product/2x/google_48dp.png" },
  { id: "asana", name: "Asana", shortLabel: "A", description: "Gestão de projetos", icon: `${INTEGRATIONS_ASSETS}/Logotipo/Agenda/Tamanho=104px.png` },
];

interface ActivateIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (integrations: IntegrationItem[]) => void;
  integrations?: IntegrationItem[];
}

function Checkbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={checked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`h-4 w-4 rounded-[4px] border flex items-center justify-center transition-colors flex-shrink-0 ${
        checked ? "bg-gray-1200 border-gray-1200" : "bg-white border-[#e5e5e5]"
      }`}
    >
      {checked ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6 9 17l-5-5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </button>
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

  const selectAll = () => {
    if (selectedIds.size === integrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(integrations.map((i) => i.id)));
    }
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
      <div className="flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[#f2f2f2]">
          <h2 className="body-xl font-heading font-bold text-[#1a1a1a]">
            Ativar integrações
          </h2>
          <p className="mt-1 body-sm text-[#5e5e5e]">
            Selecione as integrações que deseja ativar. Elas serão adicionadas à lista de fontes da pasta.
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={selectAll}
              className="body-sm font-medium text-[#1a1a1a] hover:text-[#5e5e5e]"
            >
              {selectedIds.size === integrations.length ? "Desmarcar todas" : "Selecionar todas"}
            </button>
            {selectedCount > 0 && (
              <span className="body-sm text-[#5e5e5e]">
                {selectedCount} selecionada{selectedCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <ul className="space-y-2">
            {integrations.map((integration) => {
              const checked = selectedIds.has(integration.id);
              return (
                <li key={integration.id}>
                  <button
                    type="button"
                    onClick={() => toggle(integration.id)}
                    className={`w-full rounded-[12px] border p-4 flex items-center gap-4 text-left transition-colors ${
                      checked
                        ? "border-gray-1200 bg-[#f9f9f9]"
                        : "border-[#f2f2f2] bg-white hover:border-[#e5e5e5] hover:bg-[#fbfcfd]"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={() => toggle(integration.id)}
                      ariaLabel={`Selecionar ${integration.name}`}
                    />
                    <div className="h-10 w-10 rounded-[8px] border border-[#f2f2f2] bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                      {integration.icon ? (
                        <img src={integration.icon} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[#1a1a1a] font-bold body-sm">{integration.shortLabel}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="body-sm font-medium text-[#0d0d0d]">
                        {integration.name}
                      </div>
                      {integration.description && (
                        <div className="body-xs text-[#5e5e5e] mt-0.5">
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

        <div className="p-6 border-t border-[#f2f2f2] flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" className="w-auto" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className="w-auto"
            disabled={selectedCount === 0}
            onClick={handleConfirm}
          >
            Ativar integrações
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
