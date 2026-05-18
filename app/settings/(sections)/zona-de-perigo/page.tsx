"use client";

import { AwAlert } from "@/components/ui/AwAlert";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { SettingsPageHeader } from "../_components/shared";

export default function DangerZoneSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Zona de perigo"
        description="Ações irreversíveis. Confirmamos com você antes de aplicar."
      />
      <AwAlert
        variant="warning"
        title="Antes de excluir, exporte seus dados"
      >
        Conversas, agentes, knowledge bases e logs de execução podem ser
        baixados em JSON.
      </AwAlert>
      <AwCard className="!p-0 mt-4">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="m-0 body-sm font-medium text-[var(--fg-primary)]">
              Exportar todos os dados da organização
            </p>
            <p className="m-0 body-xs text-[var(--fg-secondary)]">
              Geramos um arquivo .zip e enviamos para seu email.
            </p>
          </div>
          <AwButton size="sm" variant="secondary" iconLeft="download">
            Exportar
          </AwButton>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] px-6 py-5">
          <div>
            <p className="m-0 body-sm font-medium text-[var(--fg-primary)]">
              Excluir organização
            </p>
            <p className="m-0 body-xs text-[var(--fg-secondary)]">
              Remove agentes, conversas e integrações. Não há como reverter.
            </p>
          </div>
          <AwButton size="sm" variant="danger">
            Excluir organização
          </AwButton>
        </div>
      </AwCard>
    </div>
  );
}
