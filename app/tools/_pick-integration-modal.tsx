"use client";

/* ----------------------------------------------------------------
 * PickIntegrationModal — second step of the create flow.
 *
 * After PickTypeModal narrows the choice to native or custom, this
 * modal lists the actual integrations of that type and (for custom)
 * surfaces a "create a new connection" affordance. The narrower
 * scope per modal lets each list breathe vertically instead of
 * stacking everything on one screen.
 *
 * Returns its picked id via callbacks; the page is responsible for
 * navigating to /tools/new?conn=<scheme>:<id>.
 * ---------------------------------------------------------------- */

import * as React from "react";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import type { IntegrationCatalogItem } from "@/lib/integrationsCatalog";
import type { IntegrationInstance } from "@/lib/integrationsStore";
import type { CustomIntegration } from "@/lib/toolsStore";

type NativeOption = {
  instance: IntegrationInstance;
  integration: IntegrationCatalogItem;
};

export type PickIntegrationModalType = "native" | "custom";

export function PickIntegrationModal({
  open,
  type,
  onClose,
  onBack,
  nativeOptions,
  customOptions,
  onSelectNative,
  onSelectCustom,
  onCreateNew,
}: {
  open: boolean;
  type: PickIntegrationModalType;
  onClose: () => void;
  /** Hook to return to the type-pick step. The footer always has a
   *  Cancelar button; this drives the secondary "‹ Voltar" affordance
   *  in the title strip when present. */
  onBack?: () => void;
  nativeOptions: NativeOption[];
  customOptions: CustomIntegration[];
  onSelectNative: (instanceId: string) => void;
  onSelectCustom: (customIntegrationId: string) => void;
  onCreateNew: () => void;
}) {
  const isNative = type === "native";

  // Busca pra conter a lista (antes ela crescia e cortava a tela). Mesmo padrão
  // do explorador de /integrações: AwInput com ícone de busca + lista rolável.
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();

  // Zera a busca ao abrir ou trocar de tipo.
  React.useEffect(() => {
    setQuery("");
  }, [type, open]);

  const filteredNative = React.useMemo(
    () =>
      q
        ? nativeOptions.filter(({ instance, integration }) =>
            `${integration.name} ${instance.name}`.toLowerCase().includes(q),
          )
        : nativeOptions,
    [nativeOptions, q],
  );
  const filteredCustom = React.useMemo(
    () =>
      q
        ? customOptions.filter((c) =>
            `${c.name} ${c.alias ?? ""}`.toLowerCase().includes(q),
          )
        : customOptions,
    [customOptions, q],
  );

  // Só mostra o campo de busca quando a lista é grande o bastante pra valer.
  const showSearch = (isNative ? nativeOptions.length : customOptions.length) > 6;
  const listClass =
    "flex max-h-[min(52vh,360px)] flex-col gap-2 overflow-y-auto pr-0.5";

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title={
        isNative
          ? "Qual integração nativa?"
          : "Qual integração personalizada?"
      }
      footer={
        <>
          {onBack && (
            <AwButton
              variant="ghost"
              size="md"
              iconLeft="arrow_back"
              onClick={onBack}
            >
              Voltar
            </AwButton>
          )}
          <AwButton variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 body-xs text-(--fg-secondary)">
          {isNative
            ? "Sua habilidade vai herdar a credencial OAuth/API key dessa integração."
            : "Sua habilidade vai herdar a credencial bearer/api-key/basic dessa conexão."}
        </p>

        {showSearch && (
          <AwInput
            iconLeft="search"
            placeholder="Buscar integração…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={
              isNative
                ? "Buscar integração nativa"
                : "Buscar integração personalizada"
            }
          />
        )}

        {isNative ? (
          nativeOptions.length === 0 ? (
            <EmptyHint>
              Você ainda não conectou nenhuma integração nativa. Conecte
              em <span className="font-medium">/integrações</span> pra
              criar habilidades em cima delas.
            </EmptyHint>
          ) : filteredNative.length === 0 ? (
            <EmptyHint>Nenhuma integração encontrada para “{query}”.</EmptyHint>
          ) : (
            <div className={listClass}>
              {filteredNative.map(({ instance, integration }) => {
                const useInstanceLabel = instance.name !== integration.name;
                return (
                  <PickCard
                    key={instance.instanceId}
                    leading={
                      <AwBrandLogo brand={integration.id} size="sm" />
                    }
                    title={
                      useInstanceLabel
                        ? `${integration.name} · ${instance.name}`
                        : integration.name
                    }
                    subtitle="Nativa · herda credencial"
                    onClick={() => onSelectNative(instance.instanceId)}
                  />
                );
              })}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2">
            {customOptions.length === 0 ? (
              <EmptyHint>
                Você ainda não tem integrações personalizadas. Crie a
                primeira no card abaixo.
              </EmptyHint>
            ) : filteredCustom.length === 0 ? (
              <EmptyHint>Nenhuma integração encontrada para “{query}”.</EmptyHint>
            ) : (
              <div className={listClass}>
                {filteredCustom.map((c) => (
                  <PickCard
                    key={c.id}
                    leading={
                      <div
                        className="flex shrink-0 items-center justify-center rounded-md bg-linear-to-br from-aw-blue-500 via-aw-purple-500 to-aw-teal-500 text-white"
                        style={{ width: 32, height: 32 }}
                      >
                        <Icon name={c.icon} size={16} />
                      </div>
                    }
                    title={c.alias ? `${c.name} · ${c.alias}` : c.name}
                    subtitle={`${authLabel(c.auth)} · personalizada`}
                    onClick={() => onSelectCustom(c.id)}
                  />
                ))}
              </div>
            )}

            {/* Create-new card — only relevant in custom mode. */}
            <button
              type="button"
              onClick={onCreateNew}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl border border-dashed border-(--border-subtle) bg-(--bg-canvas) px-4 py-3.5 text-left transition-colors hover:bg-(--bg-hover) focus:outline-hidden focus-visible:bg-(--bg-hover)"
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-md border border-(--aw-blue-500) bg-(--aw-blue-100) text-(--aw-blue-700)"
                style={{ width: 32, height: 32 }}
              >
                <Icon name="add" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block body-sm font-medium text-(--fg-primary)">
                  Criar nova integração personalizada
                </span>
                <span className="mt-0.5 block body-xs text-(--fg-tertiary)">
                  Pra integrar com uma API que ainda não está no catálogo.
                </span>
              </div>
              <Icon
                name="arrow_forward"
                size={18}
                className="shrink-0 text-(--fg-tertiary)"
              />
            </button>
          </div>
        )}
      </div>
    </AwModal>
  );
}

function PickCard({
  leading,
  title,
  subtitle,
  onClick,
}: {
  leading: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-(--border-subtle) bg-(--bg-canvas) px-4 py-3 text-left transition-colors hover:bg-(--bg-hover) focus:outline-hidden focus-visible:bg-(--bg-hover)"
    >
      {leading}
      <div className="min-w-0 flex-1">
        <span className="block truncate body-sm font-medium text-(--fg-primary)">
          {title}
        </span>
        <span className="mt-0.5 block truncate body-xs text-(--fg-tertiary)">
          {subtitle}
        </span>
      </div>
      <Icon
        name="chevron_right"
        size={18}
        className="shrink-0 text-(--fg-tertiary)"
      />
    </button>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-(--border-subtle) bg-(--bg-canvas) px-4 py-3 body-xs italic text-(--fg-tertiary)">
      {children}
    </div>
  );
}

function authLabel(auth: CustomIntegration["auth"]): string {
  switch (auth) {
    case "bearer":
      return "Bearer token";
    case "basic":
      return "Basic auth";
    case "apiKey":
      return "API key";
    case "none":
    default:
      return "Sem auth";
  }
}
