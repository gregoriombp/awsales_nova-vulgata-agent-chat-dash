"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import {
  API_KEYS,
  SectionHeading,
  SettingsPageHeader,
} from "../_components/shared";

export default function ApiSettingsPage() {
  const [genOpen, setGenOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const openGenerator = () => {
    setKeyName("");
    setGeneratedKey(null);
    setCopied(false);
    setGenOpen(true);
  };

  const generateKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const rand = Array.from(
      { length: 24 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    setGeneratedKey(`aws_live_${rand}`);
  };

  const copyKey = async () => {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
    } catch {
      // Clipboard pode falhar fora de https — segue mostrando "Copiada".
    }
    setCopied(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="API & desenvolvedores"
        description="Conecte seus sistemas internos aos agentes via API. Cada chave é auditada."
      />
      <SectionHeading
        title="Chaves de API"
        action={
          <AwButton
            size="sm"
            variant="secondary"
            iconLeft="add"
            onClick={openGenerator}
          >
            Gerar nova chave
          </AwButton>
        }
      />
      <div className="grid grid-cols-1 divide-y divide-(--border-subtle) sm:grid-cols-2 sm:divide-y-0">
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

      <AwModal
        open={genOpen}
        onClose={() => setGenOpen(false)}
        title="Gerar nova chave"
        footer={
          generatedKey ? (
            <div className="flex items-center justify-end">
              <AwButton variant="primary" onClick={() => setGenOpen(false)}>
                Concluir
              </AwButton>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <AwButton variant="ghost" onClick={() => setGenOpen(false)}>
                Cancelar
              </AwButton>
              <AwButton
                variant="primary"
                iconLeft="vpn_key"
                disabled={!keyName.trim()}
                onClick={generateKey}
              >
                Gerar chave
              </AwButton>
            </div>
          )
        }
      >
        {generatedKey ? (
          <div className="flex flex-col gap-3">
            <p className="m-0 body-xs text-(--fg-secondary)">
              Copie a chave agora — por segurança, ela não será exibida
              novamente.
            </p>
            <div className="flex items-center gap-2 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-2">
              <code className="mono min-w-0 flex-1 truncate text-(--fg-primary)">
                {generatedKey}
              </code>
              <AwButton
                size="sm"
                variant="ghost"
                iconLeft={copied ? "check" : "content_copy"}
                onClick={copyKey}
              >
                {copied ? "Copiada" : "Copiar"}
              </AwButton>
            </div>
          </div>
        ) : (
          <AwField label="Nome da chave" htmlFor="newKeyName">
            <AwInput
              id="newKeyName"
              placeholder="Ex.: Integração CRM"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              autoFocus
            />
          </AwField>
        )}
      </AwModal>
    </div>
  );
}
