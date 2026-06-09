"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { AwPill } from "@/components/ui/AwPill";
import { getOrbForAgent } from "@/lib/agentOrbs";
import {
  AGENT_STATUS_META,
  EDITOR_TABS,
  type AgentEditorData,
  type EditorTabId,
} from "@/lib/agentStudio";

/**
 * Shell do editor de agente (/agent-studio/[id]).
 *
 * Sidebar própria do agente (identidade + navegação entre seções) e um
 * header de seção com o CTA "Revisar" — que leva ao fluxo de revisão e
 * publicação. O conteúdo de cada seção entra como children.
 */
export function AgentEditorShell({
  data,
  activeTab,
  onTabChange,
  children,
}: {
  data: AgentEditorData;
  activeTab: EditorTabId;
  onTabChange: (tab: EditorTabId) => void;
  children: React.ReactNode;
}) {
  const { agent } = data;
  const tab = EDITOR_TABS.find((t) => t.id === activeTab) ?? EDITOR_TABS[0];
  const status = AGENT_STATUS_META[agent.status];

  return (
    <div className="flex min-h-full w-full">
      {/* Sidebar do agente */}
      <aside className="flex w-[264px] shrink-0 flex-col border-r border-(--border-subtle) bg-(--bg-surface)">
        <div className="border-b border-(--border-subtle) px-5 pb-5 pt-6">
          <img
            src={getOrbForAgent(agent.id)}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
          <h2 className="mt-3 text-sm font-medium leading-snug text-(--fg-primary)">
            {agent.title}
          </h2>
          <p className="mt-0.5 text-xs text-(--fg-tertiary)">{agent.objetivo}</p>
          <div className="mt-3">
            <AwPill variant={status.variant}>{status.label}</AwPill>
          </div>
        </div>

        <nav
          className="flex-1 overflow-y-auto p-3"
          aria-label="Seções do agente"
        >
          <ul className="space-y-0.5">
            {EDITOR_TABS.map((item) => {
              const isActive = item.id === activeTab;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors duration-aw-fast ${
                      isActive
                        ? "bg-(--bg-hover) font-medium text-(--fg-primary)"
                        : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      className={
                        isActive
                          ? "shrink-0 text-(--fg-primary)"
                          : "shrink-0 text-(--fg-tertiary)"
                      }
                    />
                    <span className="min-w-0 truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Área da seção ativa */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="border-b border-(--border-subtle) bg-(--bg-canvas) px-10 pb-7 pt-9">
          <div className="mx-auto flex w-full max-w-[1180px] items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <Icon
                  name={tab.icon}
                  size={24}
                  className="shrink-0 text-(--fg-primary)"
                />
                <h1 className="truncate font-heading text-3xl font-medium tracking-tight text-(--fg-primary)">
                  {tab.label}
                </h1>
              </div>
              <p className="mt-2 max-w-[560px] text-sm text-(--fg-tertiary)">
                {tab.description}
              </p>
            </div>
            <AwButton
              asChild
              variant="secondary"
              size="md"
              iconLeft="rate_review"
              className="shrink-0"
            >
              <Link href={`/agent-studio/${agent.id}/review`}>Revisar</Link>
            </AwButton>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1180px] px-10 pb-16 pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
