"use client";

import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import {
  API_KEYS,
  SectionHeading,
  SettingsPageHeader,
} from "../_components/shared";

export default function ApiSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
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
      <div className="grid grid-cols-1 divide-y divide-(--border-subtle) sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {API_KEYS.map((k, i) => (
          <div
            key={k.id}
            className={
              "flex flex-col gap-3 py-4 sm:py-1 " +
              (i === 0 ? "sm:pr-6" : "sm:pl-6")
            }
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-(--fg-secondary)">
                <Icon name="key" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 body-xs font-medium text-(--fg-primary)">
                  {k.name}
                </p>
                <p className="m-0 body-xs text-(--fg-secondary)">
                  <code className="mono text-(--fg-primary)">{k.prefix}</code> ·
                  criada {k.createdAt} · usada {k.lastUsed}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 pl-12">
              <AwButton size="sm" variant="ghost" iconLeft="content_copy">
                Copiar
              </AwButton>
              <AwButton size="sm" variant="ghost" iconLeft="delete">
                Revogar
              </AwButton>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-(--border-subtle) pt-4">
        <div>
          <p className="m-0 body-xs font-medium text-(--fg-primary)">
            Webhook signing secret
          </p>
          <p className="m-0 body-xs text-(--fg-secondary)">
            Usado para validar payloads recebidos dos agentes.
          </p>
        </div>
        <AwButton size="sm" variant="secondary" iconLeft="autorenew">
          Rotacionar
        </AwButton>
      </div>
    </div>
  );
}
