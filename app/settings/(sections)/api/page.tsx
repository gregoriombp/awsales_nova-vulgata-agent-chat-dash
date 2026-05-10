"use client";

import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { Icon } from "@/components/ui/Icon";
import {
  API_KEYS,
  SectionHeading,
  SettingsPageHeader,
} from "../_components/shared";

export default function ApiSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="API & desenvolvedores"
        description="Conecte seus sistemas internos aos agentes via API. Cada chave é auditada."
      />
      <SectionHeading
        title="Chaves de API"
        action={
          <AwButton size="sm" variant="secondary" iconLeft="add">
            Gerar nova chave
          </AwButton>
        }
      />
      <AwCard className="!p-0">
        <ul className="divide-y divide-[var(--border-subtle)]">
          {API_KEYS.map((k) => (
            <li key={k.id} className="flex items-center gap-4 px-6 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
                <Icon name="key" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[13.5px] font-medium text-[var(--fg-primary)]">
                  {k.name}
                </p>
                <p className="m-0 font-mono text-[12px] text-[var(--fg-secondary)]">
                  {k.prefix} · criada {k.createdAt} · usada {k.lastUsed}
                </p>
              </div>
              <AwButton size="sm" variant="ghost" iconLeft="content_copy">
                Copiar
              </AwButton>
              <AwButton size="sm" variant="ghost" iconLeft="delete">
                Revogar
              </AwButton>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] px-6 py-4">
          <div>
            <p className="m-0 text-[13px] font-medium text-[var(--fg-primary)]">
              Webhook signing secret
            </p>
            <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
              Usado para validar payloads recebidos dos agentes.
            </p>
          </div>
          <AwButton size="sm" variant="secondary" iconLeft="autorenew">
            Rotacionar
          </AwButton>
        </div>
      </AwCard>
    </div>
  );
}
