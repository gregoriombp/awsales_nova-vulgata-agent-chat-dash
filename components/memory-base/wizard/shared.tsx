"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { AwTabs } from "@/components/ui/AwTabs";
import { Icon } from "@/components/ui/Icon";

/**
 * Peças compartilhadas pelos passos Produtos / Catálogo / Playbook do wizard de
 * criação da Memory Base (/memory-base/new). Reconstrução das telas 06–08 do flow
 * do Figma, importadas via Bombardier e adaptadas ao DS atual: as escolhas são
 * decorativas (repo é preview de UX, sem backend) e o estado das fontes é local.
 */

export const INTEGRACOES = [
  { id: "slack", name: "Slack", desc: "Importe mensagens e conteúdos de canais da sua equipe." },
  { id: "hotmart", name: "Hotmart", desc: "Importe informações dos seus produtos e conteúdos." },
  { id: "assiny", name: "Assiny", desc: "Acesse informações sobre suas assinaturas e produtos." },
  { id: "calendly", name: "Calendly", desc: "Acesse informações sobre agendamentos e eventos." },
  { id: "stripe", name: "Stripe", desc: "Acesse informações sobre pagamentos, clientes e assinaturas." },
];

/* ── Card de escolha "Novo X" / "X existente" ─────────────────────────────── */
export function ChoiceCard({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-(--border-default) bg-(--bg-canvas) px-5 py-7 text-center transition-colors hover:border-(--fg-primary) hover:bg-(--bg-hover)"
    >
      <Icon name={icon} size={24} weight={300} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

/* ── Linha de uma fonte adicionada (arquivo / URL / snippet) ──────────────── */
export function SourceRow({
  icon,
  label,
  onRemove,
}: {
  icon: string;
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--border-default) bg-(--bg-raised) px-3 py-2.5">
      <Icon name={icon} size={18} />
      <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-(--fg-tertiary) hover:text-(--fg-primary)"
        aria-label="Remover"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

/* ── Lista de integrações selecionáveis (multi-seleção) ───────────────────── */
export function IntegrationPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {INTEGRACOES.map((it) => {
        const on = selected.includes(it.id);
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onToggle(it.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
              on
                ? "border-(--fg-primary) bg-(--bg-surface)"
                : "border-(--border-default) bg-(--bg-raised) hover:border-(--border-strong)",
            )}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-(--bg-muted) text-xs font-semibold">
              {it.name[0]}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-medium">
                {it.name}
                <AwPill variant="live">Ativo</AwPill>
              </span>
              <span className="block truncate text-xs text-(--fg-tertiary)">{it.desc}</span>
            </span>
            <span className="ml-auto text-(--fg-primary)">
              <Icon
                name={on ? "check_box" : "check_box_outline_blank"}
                size={20}
                fill={on ? 1 : 0}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Seletor de fontes em abas (Arquivos / URL / Snippet / Integração) ─────── */
export type SourceData = {
  files: string[];
  urls: string[];
  snippets: string[];
  integr: string[];
};

export const EMPTY_SOURCES: SourceData = { files: [], urls: [], snippets: [], integr: [] };

export function sourcesTotal(d: SourceData): number {
  return d.files.length + d.urls.length + d.snippets.length + d.integr.length;
}

type SourceTab = "arquivos" | "url" | "snippet" | "integracao";

const TAB_LABELS: Record<SourceTab, string> = {
  arquivos: "Arquivos",
  url: "URL",
  snippet: "Snippet",
  integracao: "Integração",
};

/**
 * Picker auto-contido: guarda o próprio estado das fontes e reporta a cada
 * mudança via `onChange`. O pai zera trocando a `key` (remount). Mantém o estado
 * fora do pai pra não precisar passar 8 setters.
 */
export function SourcePicker({
  tabs = ["arquivos", "url", "snippet", "integracao"],
  onChange,
}: {
  tabs?: SourceTab[];
  onChange: (data: SourceData) => void;
}) {
  const [tab, setTab] = React.useState<SourceTab>(tabs[0]);
  const [files, setFiles] = React.useState<string[]>([]);
  const [urls, setUrls] = React.useState<string[]>([]);
  const [urlDraft, setUrlDraft] = React.useState("");
  const [snippets, setSnippets] = React.useState<string[]>([]);
  const [snippetDraft, setSnippetDraft] = React.useState("");
  const [integr, setIntegr] = React.useState<string[]>([]);

  React.useEffect(() => {
    onChange({ files, urls, snippets, integr });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, urls, snippets, integr]);

  return (
    <div className="flex flex-col gap-5">
      <AwTabs
        variant="underline"
        value={tab}
        onChange={(v) => setTab(v as SourceTab)}
        items={tabs.map((t) => ({ value: t, label: TAB_LABELS[t] }))}
      />

      {tab === "arquivos" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-(--border-strong) bg-(--bg-surface) px-6 py-8 text-center">
            <Icon name="cloud_upload" size={28} />
            <p className="text-sm font-medium">Arraste e solte arquivos aqui</p>
            <p className="text-xs text-(--fg-tertiary)">JPG, PNG ou PDF · até 10 MB</p>
            <div className="mt-1">
              <AwButton
                variant="primary"
                size="sm"
                iconLeft="add"
                className="w-auto"
                onClick={() => setFiles((f) => [...f, `documento-${f.length + 1}.pdf`])}
              >
                Adicionar arquivos
              </AwButton>
            </div>
          </div>
          {files.map((f, i) => (
            <SourceRow
              key={i}
              icon="picture_as_pdf"
              label={f}
              onRemove={() => setFiles((list) => list.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      )}

      {tab === "url" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium">URL</span>
              <AwInput
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="http://"
              />
            </label>
            <AwButton
              variant="secondary"
              iconLeft="add"
              className="w-auto"
              disabled={!urlDraft.trim()}
              onClick={() => {
                setUrls((u) => [...u, urlDraft.trim()]);
                setUrlDraft("");
              }}
            >
              Adicionar URL
            </AwButton>
          </div>
          {urls.map((u, i) => (
            <SourceRow
              key={i}
              icon="link"
              label={u}
              onRemove={() => setUrls((list) => list.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      )}

      {tab === "snippet" && (
        <div className="flex flex-col gap-3">
          <textarea
            value={snippetDraft}
            onChange={(e) => setSnippetDraft(e.target.value)}
            placeholder="Insira um texto"
            rows={4}
            className="w-full resize-y rounded-xl border border-(--border-default) bg-(--bg-raised) px-3 py-2 text-sm text-(--fg-primary) outline-none placeholder:text-(--fg-tertiary) focus:border-(--border-strong)"
          />
          <div>
            <AwButton
              variant="secondary"
              iconLeft="add"
              className="w-auto"
              disabled={!snippetDraft.trim()}
              onClick={() => {
                setSnippets((s) => [...s, snippetDraft.trim()]);
                setSnippetDraft("");
              }}
            >
              Adicionar Snippet
            </AwButton>
          </div>
          {snippets.map((s, i) => (
            <SourceRow
              key={i}
              icon="code"
              label={s}
              onRemove={() => setSnippets((list) => list.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      )}

      {tab === "integracao" && (
        <IntegrationPicker
          selected={integr}
          onToggle={(id) =>
            setIntegr((list) =>
              list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
            )
          }
        />
      )}
    </div>
  );
}
