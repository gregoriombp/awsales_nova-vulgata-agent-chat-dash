"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwAgentCore } from "@/components/ui/AwAgentCore";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwDotTunnel } from "@/components/ui/AwDotTunnel";
import { AwModal } from "@/components/ui/AwModal";
import { AwPageHeader } from "@/components/ui/AwPageHeader";
import { AwUserAgentOrb } from "@/components/ui/AwUserAgentOrb";
import {
  AwMembersTable,
  AwMembersTablePersonCell,
  AwMembersTableTextCell,
  type AwMembersTableSort,
} from "@/components/ui/AwMembersTable";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/AwToast";
import {
  AwEmpty,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
  AwEmptyDescription,
  AwEmptyContent,
} from "@/components/ui/AwEmpty";
import {
  AGENT_STATUS_META,
  ALL_AGENTES,
  type Agent,
  type AgentStatus,
} from "@/lib/agentStudio";
import {
  AGENT_LIST_OVERRIDES_EVENT,
  applyAgentListOverrides,
  emptyAgentListOverrides,
  loadAgentListOverrides,
  saveAgentListOverrides,
  type AgentListOverrides,
} from "@/lib/agentStudioStore";

type StudioState = "welcome" | "populated" | "returning";

/** Dono do workspace no protótipo — separa "meus" agentes dos da organização. */
const OWNER_NAME = "Gregório Pinheiro";

const MESES_CURTOS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function agoraFormatado(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MESES_CURTOS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

export default function AgentStudioPage() {
  const { push } = useToast();

  // Overlay local sobre o registry mock (duplicar/pausar/arquivar/excluir).
  // Hidrata depois do mount — o primeiro paint usa só o registry, igual ao SSR.
  const [overrides, setOverrides] = React.useState<AgentListOverrides | null>(
    null
  );
  React.useEffect(() => {
    const sync = () => setOverrides(loadAgentListOverrides());
    sync();
    // Mutações vindas de outros componentes (ex.: "Desfazer" de um toast das
    // Preferências clicado já na listagem) também atualizam a tabela.
    window.addEventListener(AGENT_LIST_OVERRIDES_EVENT, sync);
    return () => window.removeEventListener(AGENT_LIST_OVERRIDES_EVENT, sync);
  }, []);

  const agents = React.useMemo(
    () =>
      applyAgentListOverrides(
        ALL_AGENTES,
        overrides ?? emptyAgentListOverrides()
      ),
    [overrides]
  );

  const mutate = React.useCallback(
    (fn: (o: AgentListOverrides) => AgentListOverrides) => {
      setOverrides((prev) => {
        const next = fn(prev ?? emptyAgentListOverrides());
        saveAgentListOverrides(next);
        return next;
      });
    },
    []
  );

  // Estado derivado dos dados — excluir/arquivar leva de verdade aos vazios:
  // sem nenhum agente → boas-vindas; sem agentes próprios → empty de recorrente.
  const meus = agents.filter((a) => a.author.name === OWNER_NAME);
  const state: StudioState =
    agents.length === 0
      ? "welcome"
      : meus.length === 0
        ? "returning"
        : "populated";

  const [agentToDelete, setAgentToDelete] = React.useState<Agent | null>(null);

  function handleDuplicate(agent: Agent) {
    // Cópia de cópia ancora no agente raiz — o id resolve via getAgentById.
    const rootId = agent.id.replace(/(-copia(?:-\d+)?)+$/, "");
    const base = `${rootId}-copia`;
    mutate((o) => {
      const taken = new Set([
        ...ALL_AGENTES.map((a) => a.id),
        ...o.duplicates.map((d) => d.id),
      ]);
      let id = base;
      let n = 2;
      while (taken.has(id)) id = `${base}-${n++}`;
      return {
        ...o,
        duplicates: [
          ...o.duplicates,
          { sourceId: rootId, id, createdAt: agoraFormatado() },
        ],
      };
    });
    push({
      title: "Agente duplicado",
      description: `A cópia de “${agent.title}” entrou na lista como rascunho.`,
    });
  }

  function handleToggleStatus(agent: Agent) {
    const next: AgentStatus = agent.status === "active" ? "paused" : "active";
    mutate((o) => ({
      ...o,
      statusOverrides: { ...o.statusOverrides, [agent.id]: next },
    }));
    push({
      title: next === "paused" ? "Agente pausado" : "Agente ativado",
      description:
        next === "paused"
          ? `“${agent.title}” não inicia novas conversas até você reativar.`
          : `“${agent.title}” voltou a operar normalmente.`,
    });
  }

  function confirmDelete() {
    const agent = agentToDelete;
    if (!agent) return;
    setAgentToDelete(null);
    mutate((o) => ({ ...o, removed: [...o.removed, agent.id] }));
    // Sem "Desfazer": o modal promete exclusão permanente — arquivar é o
    // caminho restaurável.
    push({
      title: "Agente excluído",
      description: `“${agent.title}” e todas as configurações dele foram removidos.`,
    });
  }

  const tableActions = {
    onDuplicate: handleDuplicate,
    onToggleStatus: handleToggleStatus,
    onDelete: setAgentToDelete,
  };

  return (
    <>
      <AwDashboardLayout breadcrumbs={[{ label: "Agent Studio" }]}>
        {state === "welcome" ? (
          <WelcomeState />
        ) : (
          <div className="mx-auto w-full max-w-[1600px] px-6 pb-20 pt-6 sm:px-10">
            <StudioHeader agents={agents} />

            {state === "populated" ? (
              <Section title="Seus agentes">
                <AgentsTable agents={agents} {...tableActions} />
              </Section>
            ) : (
              <ReturningEmptyState agents={agents} {...tableActions} />
            )}
          </div>
        )}
      </AwDashboardLayout>

      {/* Confirmação — excluir agente (mesma copy da zona de risco do editor) */}
      <AwModal
        open={agentToDelete !== null}
        onClose={() => setAgentToDelete(null)}
        title="Excluir agente"
        footer={
          <>
            <AwButton variant="ghost" onClick={() => setAgentToDelete(null)}>
              Cancelar
            </AwButton>
            <AwButton variant="danger" iconLeft="delete" onClick={confirmDelete}>
              Excluir agente
            </AwButton>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-(--fg-secondary)">
          O agente <strong>{agentToDelete?.title}</strong> e todas as
          configurações dele serão removidos de forma permanente. Esta ação não
          pode ser desfeita.
        </p>
      </AwModal>
    </>
  );
}

function StudioHeader({ agents }: { agents: Agent[] }) {
  const orbs = agents.slice(0, 5);

  return (
    <AwPageHeader
      size="hero"
      icon="agent_studio"
      title="Agent Studio"
      description="Descubra e crie agentes customizados que combinam instruções, conhecimento extra e qualquer combinação de tarefas."
      divider={false}
      actions={
        <>
          <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex -space-x-3">
            {orbs.map((agent) => (
              <AwUserAgentOrb
                key={agent.id}
                seed={agent.id}
                state="responding"
                size={40}
                className="border-2 border-(--bg-canvas) shadow-sm"
              />
            ))}
          </div>
          <p className="text-xs text-(--fg-secondary)">
            {agents.length === 1
              ? "1 agente operando neste workspace"
              : `${agents.length} agentes operando neste workspace`}
          </p>
          </div>
          <AwButton asChild variant="primary" size="md" iconLeft="add">
            <Link href="/agent-studio/new">Criar agente</Link>
          </AwButton>
        </>
      }
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Estado 1 — primeiro acesso (empty state "not populated")
 * Vive dentro do shell do studio (a sidebar é mantida); o conteúdo só
 * centraliza na área principal. Todos os valores saem de token.
 * ───────────────────────────────────────────────────────────────────────── */
function WelcomeState() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center">
      <AwDotTunnel size={320} />

      <h1 className="mt-12 text-(length:--h1-size) font-light leading-tight tracking-tight text-(--fg-primary)">
        Bem-vindo ao Agent Studio
      </h1>
      <p className="mt-3 text-sm text-(--fg-secondary)">
        Crie seu primeiro agente em menos de 90 minutos.
      </p>

      <AwButton
        asChild
        variant="primary"
        size="md"
        iconLeft="add"
        className="mt-8"
      >
        <Link href="/agent-studio/new">Criar agente</Link>
      </AwButton>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Estado 3 — empty state pra usuário recorrente (não é o primeiro acesso,
 * mas não tem nenhum agente próprio). Mantém o chrome do studio e mostra os
 * agentes restantes da organização — diferente da tela de boas-vindas.
 * ───────────────────────────────────────────────────────────────────────── */
function ReturningEmptyState({
  agents,
  ...actions
}: { agents: Agent[] } & AgentsTableActions) {
  return (
    <>
      <Section title="Meus agentes">
        <div className="rounded-xl border border-(--border-subtle) bg-(--bg-canvas)">
          <AwEmpty>
            <AwEmptyHeader>
              <AwEmptyMedia variant="default">
                <AwDotTunnel size={96} />
              </AwEmptyMedia>
              <AwEmptyTitle>Você ainda não tem agentes</AwEmptyTitle>
              <AwEmptyDescription>
                Crie um agente do zero ou comece a partir de um dos modelos
                disponíveis na sua organização.
              </AwEmptyDescription>
            </AwEmptyHeader>
            <AwEmptyContent>
              <AwButton asChild variant="primary" iconLeft="add">
                <Link href="/agent-studio/new">Criar agente</Link>
              </AwButton>
            </AwEmptyContent>
          </AwEmpty>
        </div>
      </Section>

      <div className="mt-14 border-t border-(--border-subtle)" />

      <Section title="Todos os agentes">
        <AgentsTable agents={agents} {...actions} />
      </Section>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-6 text-xl font-medium leading-tight text-(--fg-primary)">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Tabela de agentes — composta sobre AwMembersTable (header + person cell +
 * text cell) + AwPill (status) + AwAgentCore (Core) + AwDropdownMenu (ações).
 * Mesma receita usada em Equipe & permissões, adaptada pra agentes.
 * ───────────────────────────────────────────────────────────────────────── */
type AgentsTableActions = {
  onDuplicate: (agent: Agent) => void;
  onToggleStatus: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
};

/* Colunas opcionais (Nome e ações são sempre exibidos). Cada coluna sabe se
 * renderizar como cabeçalho (label/icon/sortKey) e como célula da linha, além
 * de fornecer o valor pra ordenação. */
type AgentColKey =
  | "objetivo"
  | "status"
  | "core"
  | "author"
  | "createdAt"
  | "knowledgeBase";

const PT_MONTHS: Record<string, string> = {
  jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06",
  jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12",
};

/** "9 fev 2026, 20:21" → "2026-02-09 20:21" (ordenável por string). */
function createdAtSortKey(s: string): string {
  const m = s.match(/(\d+)\s+(\w+)\s+(\d{4}),?\s*(\d{2}:\d{2})?/);
  if (!m) return s;
  return `${m[3]}-${PT_MONTHS[m[2].toLowerCase()] ?? "00"}-${m[1].padStart(2, "0")} ${m[4] ?? ""}`;
}

type AgentColumnDef = {
  key: AgentColKey;
  label: string;
  icon?: string;
  sortValue: (a: Agent) => string;
  render: (a: Agent) => React.ReactNode;
};

const AGENT_COLUMNS: AgentColumnDef[] = [
  {
    key: "objetivo",
    label: "Objetivo",
    icon: "target",
    sortValue: (a) => a.objetivo,
    render: (a) => (
      <AwMembersTableTextCell key="objetivo" muted>
        <span className="flex items-center gap-2">
          <Icon name="target" size={16} className="shrink-0 text-(--fg-tertiary)" />
          <span className="truncate">{a.objetivo}</span>
        </span>
      </AwMembersTableTextCell>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortValue: (a) => AGENT_STATUS_META[a.status].label,
    render: (a) => (
      <td key="status">
        <AwPill variant={AGENT_STATUS_META[a.status].variant}>
          {AGENT_STATUS_META[a.status].label}
        </AwPill>
      </td>
    ),
  },
  {
    key: "core",
    label: "Agente core",
    sortValue: (a) => a.coreName,
    render: (a) => (
      <td key="core">
        <span className="flex items-center gap-2">
          <AwAgentCore src={a.coreSrc} size={20} />
          <span className="truncate text-(length:--body-sm-size) text-(--fg-primary)">
            {a.coreName}
          </span>
        </span>
      </td>
    ),
  },
  {
    key: "author",
    label: "Criado por",
    icon: "person",
    sortValue: (a) => a.author.name,
    render: (a) => (
      <td key="author">
        <span className="flex items-center gap-2">
          <AwAvatar
            size="sm"
            src={a.author.avatar}
            initials={a.author.initials}
            alt={a.author.name}
          />
          <span className="truncate text-(length:--body-sm-size) text-(--fg-secondary)">
            {a.author.name}
          </span>
        </span>
      </td>
    ),
  },
  {
    key: "createdAt",
    label: "Criado em",
    icon: "schedule",
    sortValue: (a) => createdAtSortKey(a.createdAt),
    render: (a) => (
      <AwMembersTableTextCell key="createdAt" muted className="whitespace-nowrap">
        {a.createdAt}
      </AwMembersTableTextCell>
    ),
  },
  {
    key: "knowledgeBase",
    label: "Base de conhecimento",
    icon: "account_balance",
    sortValue: (a) => a.knowledgeBase,
    render: (a) => (
      <AwMembersTableTextCell key="knowledgeBase" muted>
        <span className="flex items-center gap-2">
          <Icon name="account_balance" size={15} className="shrink-0 text-(--fg-tertiary)" />
          <span className="truncate">{a.knowledgeBase}</span>
        </span>
      </AwMembersTableTextCell>
    ),
  },
];

const AGENT_COLS_STORAGE_KEY = "agent-studio:visible-cols";

function AgentsTable({
  agents,
  onDuplicate,
  onToggleStatus,
  onDelete,
}: { agents: Agent[] } & AgentsTableActions) {
  const router = useRouter();

  const [sort, setSort] = React.useState<AwMembersTableSort | null>(null);
  const [visible, setVisible] = React.useState<Set<AgentColKey>>(
    () => new Set(AGENT_COLUMNS.map((c) => c.key)),
  );

  // Hidrata a preferência de colunas no client (evita mismatch de hidratação).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(AGENT_COLS_STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw) as AgentColKey[];
      const valid = arr.filter((k) => AGENT_COLUMNS.some((c) => c.key === k));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(new Set(valid));
    } catch {
      /* noop */
    }
  }, []);

  const toggleCol = (k: AgentColKey) =>
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      try {
        localStorage.setItem(AGENT_COLS_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        /* noop */
      }
      return next;
    });

  const onSort = (key: string) =>
    setSort((s) =>
      s && s.by === key
        ? { by: key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { by: key, dir: "asc" },
    );

  const cols = AGENT_COLUMNS.filter((c) => visible.has(c.key));

  const sorted = React.useMemo(() => {
    if (!sort) return agents;
    const dir = sort.dir === "asc" ? 1 : -1;
    const valueOf = (a: Agent) =>
      sort.by === "title"
        ? a.title
        : (AGENT_COLUMNS.find((c) => c.key === sort.by)?.sortValue(a) ?? "");
    return [...agents].sort((a, b) => valueOf(a).localeCompare(valueOf(b)) * dir);
  }, [agents, sort]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <AwDropdownMenu
          align="end"
          trigger={
            <AwButton variant="secondary" size="sm" iconLeft="view_column">
              Colunas
            </AwButton>
          }
          items={AGENT_COLUMNS.map((c) => ({
            id: c.key,
            label: c.label,
            checked: visible.has(c.key),
            closeOnSelect: false,
            onSelect: () => toggleCol(c.key),
          }))}
        />
      </div>

      <AwMembersTable
        sort={sort ?? undefined}
        onSort={onSort}
        columns={[
          { label: "Nome", icon: "agent", sortKey: "title" },
          ...cols.map((c) => ({
            label: c.label,
            icon: c.icon,
            sortKey: c.key,
          })),
          { label: "", width: 52 },
        ]}
      >
        {sorted.map((agent) => {
          const href = `/agent-studio/${agent.id}`;
          const isPaused = agent.status === "paused";
          return (
            <tr
              key={agent.id}
              className={`aw-row-clickable${isPaused ? " opacity-60" : ""}`}
              onClick={() => router.push(href)}
            >
              <AwMembersTablePersonCell
                name={agent.title}
                avatar={
                  <AwUserAgentOrb
                    seed={agent.id}
                    state={isPaused ? "paused" : "responding"}
                    size={40}
                  />
                }
              />

              {cols.map((c) => c.render(agent))}

              <td>
                <div className="flex items-center justify-end">
                  <span onClick={(e) => e.stopPropagation()}>
                    <AwDropdownMenu
                      align="end"
                      trigger={
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
                          aria-label={`Ações de ${agent.title}`}
                        >
                          <Icon name="more_vert" size={20} />
                        </button>
                      }
                      items={[
                        {
                          id: "open",
                          label: "Abrir agente",
                          icon: "open_in_new",
                          onSelect: () => router.push(href),
                        },
                        {
                          id: "duplicate",
                          label: "Duplicar",
                          icon: "content_copy",
                          onSelect: () => onDuplicate(agent),
                        },
                        {
                          id: "toggle-status",
                          label: agent.status === "active" ? "Pausar" : "Ativar",
                          icon:
                            agent.status === "active" ? "pause" : "play_arrow",
                          onSelect: () => onToggleStatus(agent),
                        },
                        { id: "sep", separator: true },
                        {
                          id: "delete",
                          label: "Excluir",
                          icon: "delete",
                          danger: true,
                          onSelect: () => onDelete(agent),
                        },
                      ]}
                    />
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </AwMembersTable>
    </div>
  );
}
