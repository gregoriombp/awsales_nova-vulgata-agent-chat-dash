"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwButton } from "@/components/ui/AwButton";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { getOrbForAgent } from "@/lib/agentOrbs";
import {
  KNOWLEDGE_LAYERS,
  QUALITY_COLOR,
  type KnowledgeLayer,
} from "@/components/memory-base/knowledgeLayers";

/**
 * Aba "Playbook" do detalhe da base — lista de Knowledge Layers (Tela 10 do flow
 * do Figma). Toggle Lista/Card, busca, menu de ações por linha e modal de detalhe
 * com link pra edição (./layers/[id]). Conteúdo real das abas que antes eram
 * placeholders no detalhe da base.
 */

const ROW_GRID = "grid-cols-[2.4fr_0.8fr_1.2fr_1.3fr_1fr_1.6fr_40px]";

export function KnowledgeLayersTab({ baseId }: { baseId: string }) {
  const [view, setView] = React.useState<"lista" | "card">("lista");
  const [search, setSearch] = React.useState("");
  const [menuId, setMenuId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<KnowledgeLayer | null>(null);
  const [rows, setRows] = React.useState<KnowledgeLayer[]>(KNOWLEDGE_LAYERS);

  React.useEffect(() => {
    if (!menuId) return;
    const close = () => setMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuId]);

  const filtered = rows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-sm">
          <AwInput
            iconLeft="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar em Memory Base"
          />
        </div>
        <div className="inline-flex rounded-full border border-(--border-default) p-1">
          <ViewToggle active={view === "lista"} onClick={() => setView("lista")} icon="view_list" label="Lista" />
          <ViewToggle active={view === "card"} onClick={() => setView("card")} icon="grid_view" label="Card" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="mt-5">
        {view === "lista" ? (
          <div className="overflow-hidden rounded-2xl border border-(--border-default)">
            <div className={cn("grid gap-3 border-b border-(--border-subtle) bg-(--bg-surface) px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-(--fg-tertiary)", ROW_GRID)}>
              <span>Knowledge Layer</span>
              <span>Status</span>
              <span>Fonte</span>
              <span>Uso</span>
              <span>Última modificação</span>
              <span>Taxa de utilização e qualidade</span>
              <span />
            </div>
            {filtered.map((r) => (
              <div
                key={r.id}
                className={cn("grid items-center gap-3 border-b border-(--border-subtle) px-4 py-3 last:border-0 hover:bg-(--bg-hover)", ROW_GRID)}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="truncate text-[11px] text-(--fg-tertiary)">{r.desc}</p>
                </div>
                <AwPill variant="live">Ativo</AwPill>
                <span className="inline-flex items-center gap-1.5 truncate text-xs text-(--fg-secondary)">
                  <Icon name="picture_as_pdf" size={14} /> {r.fonte}
                </span>
                <AgentUsage agents={r.agents} />
                <span className="text-xs text-(--fg-secondary)">{r.mod}</span>
                <span className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: QUALITY_COLOR[r.q] }}>
                    <Icon name="trending_up" size={14} /> {r.q}
                  </span>
                  <span className="block truncate text-[11px] text-(--fg-tertiary)">{r.qualityNote}</span>
                </span>
                <RowMenu
                  baseId={baseId}
                  layerId={r.id}
                  open={menuId === r.id}
                  onToggle={() => setMenuId(menuId === r.id ? null : r.id)}
                  onView={() => { setDetail(r); setMenuId(null); }}
                  onDelete={() => { setRows((l) => l.filter((x) => x.id !== r.id)); setMenuId(null); }}
                />
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-(--fg-tertiary)">
                Nenhum Knowledge Layer encontrado.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDetail(r)}
                className="flex flex-col gap-2 rounded-2xl border border-(--border-default) bg-(--bg-raised) p-4 text-left transition-colors hover:border-(--border-strong)"
              >
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="line-clamp-3 text-xs text-(--fg-secondary)">{r.desc}</p>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-(--fg-tertiary)">
                  <Icon name="picture_as_pdf" size={13} /> {r.fonte}
                </span>
                <div className="mt-2 flex items-center justify-between border-t border-(--border-subtle) pt-2">
                  <AgentUsage agents={r.agents} />
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: QUALITY_COLOR[r.q] }}>
                    <Icon name="trending_up" size={13} /> {r.q}
                  </span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full px-4 py-10 text-center text-sm text-(--fg-tertiary)">
                Nenhum Knowledge Layer encontrado.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal: detalhe do Knowledge Layer (Visualizar) */}
      <AwModal
        open={detail !== null}
        onClose={() => setDetail(null)}
        size="md"
        title="Knowledge Layer"
        footer={
          detail && (
            <div className="flex items-center justify-end">
              <Link href={`/memory-base/${baseId}/layers/${detail.id}`} className="no-underline">
                <AwButton variant="primary" className="w-auto" iconLeft="edit">
                  Editar
                </AwButton>
              </Link>
            </div>
          )
        }
      >
        {detail && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold">{detail.title}</h3>
              <p className="mt-1 text-sm text-(--fg-secondary)">{detail.resposta}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-(--fg-tertiary)">Arquivo</p>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm">
                <Icon name="picture_as_pdf" size={16} /> {detail.fonte}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-(--border-subtle) pt-3 text-xs">
              <div>
                <p className="text-(--fg-tertiary)">Status</p>
                <AwPill variant="live">Ativo</AwPill>
              </div>
              <div>
                <p className="text-(--fg-tertiary)">Qualidade</p>
                <span className="font-medium" style={{ color: QUALITY_COLOR[detail.q] }}>{detail.q}</span>
              </div>
              <div>
                <p className="text-(--fg-tertiary)">Última atualização</p>
                <span>{detail.mod}</span>
              </div>
            </div>
          </div>
        )}
      </AwModal>
    </div>
  );
}

function AgentUsage({ agents }: { agents: string[] }) {
  const count = agents.length;
  return (
    <span className="inline-flex items-center gap-2 truncate text-xs text-(--fg-secondary)">
      {count > 0 && (
        <span className="flex -space-x-1.5">
          {agents.slice(0, 3).map((a) => (
            <img
              key={a}
              src={getOrbForAgent(a)}
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] rounded-full object-cover ring-2 ring-(--bg-raised)"
            />
          ))}
        </span>
      )}
      <span className="truncate">
        {count === 0 ? "Sem agentes" : `Utilizado por ${count} ${count === 1 ? "agente" : "agentes"}`}
      </span>
    </span>
  );
}

function ViewToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full bg-(--bg-inverse) px-3 py-1.5 text-xs font-medium text-(--fg-on-inverse)"
          : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-(--fg-secondary) hover:text-(--fg-primary)"
      }
    >
      <Icon name={icon} size={15} />
      {label}
    </button>
  );
}

function RowMenu({
  baseId,
  layerId,
  open,
  onToggle,
  onView,
  onDelete,
}: {
  baseId: string;
  layerId: string;
  open: boolean;
  onToggle: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="text-(--fg-tertiary) hover:text-(--fg-primary)"
        aria-label="Ações"
      >
        <Icon name="more_vert" size={18} />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-7 z-10 w-40 overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-raised) py-1 shadow-lg"
        >
          <button type="button" onClick={onView} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-(--fg-primary) hover:bg-(--bg-hover)">
            <Icon name="visibility" size={16} /> Visualizar
          </button>
          <Link href={`/memory-base/${baseId}/layers/${layerId}`} className="no-underline">
            <span className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-(--fg-primary) hover:bg-(--bg-hover)">
              <Icon name="edit" size={16} /> Editar
            </span>
          </Link>
          <button type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-(--fg-primary) hover:bg-(--bg-hover)">
            <Icon name="content_copy" size={16} /> Duplicar
          </button>
          <button type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-(--fg-primary) hover:bg-(--bg-hover)">
            <Icon name="block" size={16} /> Inativar
          </button>
          <button type="button" onClick={onDelete} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-(--accent-danger) hover:bg-(--bg-hover)">
            <Icon name="delete" size={16} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}
