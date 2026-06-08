"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwPageHeader } from "@/components/ui/AwPageHeader";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwAgentCore, agentCoreSrc } from "@/components/ui/AwAgentCore";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwDotTunnel } from "@/components/ui/AwDotTunnel";
import {
  AwMembersTable,
  AwMembersTablePersonCell,
  AwMembersTableTextCell,
} from "@/components/ui/AwMembersTable";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import {
  AwEmpty,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
  AwEmptyDescription,
  AwEmptyContent,
} from "@/components/ui/AwEmpty";
import { getOrbForAgent } from "@/lib/agentOrbs";

type AgentStatus = "active" | "draft" | "paused";

type Agent = {
  id: string;
  title: string;
  /** Objetivo curto do agente (uma linha). */
  objetivo: string;
  status: AgentStatus;
  /** Nome do Agent Core (framework) que o agente roda. */
  coreName: string;
  /** PNG do Core (1–20). */
  coreSrc: string;
  author: { name: string; initials: string };
  createdAt: string;
  knowledgeBase: string;
};

const STATUS_META: Record<
  AgentStatus,
  { label: string; variant: AwPillVariant }
> = {
  active: { label: "Ativo", variant: "live" },
  draft: { label: "Rascunho", variant: "draft" },
  paused: { label: "Pausado", variant: "neutral" },
};

const MEUS_AGENTES: Agent[] = [
  {
    id: "leads-recovery",
    title: "Agente de recuperação de leads",
    objetivo: "Recuperar leads",
    status: "active",
    coreName: "Upsell Specialist",
    coreSrc: agentCoreSrc(3),
    author: { name: "Gregório Pinheiro", initials: "GP" },
    createdAt: "9 fev 2026, 20:21",
    knowledgeBase: "Fyntra | Dados Gerais 2026",
  },
  {
    id: "sales",
    title: "Agente de vendas",
    objetivo: "Qualificar lead e agendar demo",
    status: "active",
    coreName: "Closer Pro",
    coreSrc: agentCoreSrc(7),
    author: { name: "Gregório Pinheiro", initials: "GP" },
    createdAt: "2 fev 2026, 11:08",
    knowledgeBase: "Fyntra | Playbook comercial",
  },
  {
    id: "customer-support",
    title: "Agente de suporte",
    objetivo: "Resolver tickets de nível 1",
    status: "active",
    coreName: "Empathy Core",
    coreSrc: agentCoreSrc(12),
    author: { name: "Gregório Pinheiro", initials: "GP" },
    createdAt: "28 jan 2026, 16:42",
    knowledgeBase: "Fyntra | Central de ajuda",
  },
  {
    id: "hr",
    title: "Agente de RH",
    objetivo: "Onboarding e dúvidas de políticas",
    status: "draft",
    coreName: "People Ops",
    coreSrc: agentCoreSrc(15),
    author: { name: "Gregório Pinheiro", initials: "GP" },
    createdAt: "24 jan 2026, 09:15",
    knowledgeBase: "Fyntra | Manual interno",
  },
];

const TODOS_OS_AGENTES: Agent[] = [
  {
    id: "research",
    title: "Agente de research",
    objetivo: "Sintetizar briefs de mercado",
    status: "active",
    coreName: "Insight Engine",
    coreSrc: agentCoreSrc(5),
    author: { name: "Bea Costa", initials: "BC" },
    createdAt: "18 jan 2026, 14:30",
    knowledgeBase: "Fyntra | Inteligência de mercado",
  },
  {
    id: "qa",
    title: "Agente de QA",
    objetivo: "Checar regressões antes do deploy",
    status: "paused",
    coreName: "Guardian",
    coreSrc: agentCoreSrc(9),
    author: { name: "Carlos Sun", initials: "CS" },
    createdAt: "15 jan 2026, 10:00",
    knowledgeBase: "Fyntra | Release notes",
  },
  {
    id: "onboarding",
    title: "Agente de onboarding",
    objetivo: "Guiar os primeiros 90 dias",
    status: "active",
    coreName: "Pathfinder",
    coreSrc: agentCoreSrc(2),
    author: { name: "Dani Rocha", initials: "DR" },
    createdAt: "12 jan 2026, 08:45",
    knowledgeBase: "Fyntra | Onboarding workspace",
  },
  {
    id: "data",
    title: "Agente de dados",
    objetivo: "Rodar queries e montar dashboards",
    status: "active",
    coreName: "Data Forge",
    coreSrc: agentCoreSrc(18),
    author: { name: "Eva Lima", initials: "EL" },
    createdAt: "9 jan 2026, 17:20",
    knowledgeBase: "Fyntra | Data warehouse",
  },
];

const ALL_AGENTES: Agent[] = [...MEUS_AGENTES, ...TODOS_OS_AGENTES];

type StudioState = "welcome" | "populated" | "returning";

export default function AgentStudioPage() {
  // Em produção o estado vem do backend (tem agente? primeiro login?). No
  // protótipo o studio aparece já populado — os outros estados (welcome / sem
  // agentes) ficam documentados no styleguide do Bombardier.
  const state = "populated" as StudioState;

  return (
    <>
      <AwDashboardLayout breadcrumbs={[{ label: "Agent Studio" }]}>
        {state === "welcome" ? (
          <WelcomeState />
        ) : (
          <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-8 sm:px-10">
            <AwPageHeader
              size="hero"
              title="Agent Studio"
              description="Descubra e crie agentes customizados que combinam instruções, conhecimento extra e qualquer combinação de tarefas."
              actions={
                <AwButton asChild variant="primary" size="md" iconLeft="add">
                  <Link href="/agent-studio/new">Criar agente</Link>
                </AwButton>
              }
              divider={false}
            />

            {state === "populated" ? <PopulatedState /> : <ReturningEmptyState />}
          </div>
        )}
      </AwDashboardLayout>
    </>
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

      <h1 className="mt-12 text-[length:var(--h1-size)] font-light leading-[1.1] tracking-[-0.04em] text-[var(--fg-primary)]">
        Bem vindo ao Agent Studio
      </h1>
      <p className="mt-3 text-[15px] text-[var(--fg-secondary)]">
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
 * Estado 2 — populated (usuário já tem agentes)
 * Lista em tabela: cada linha é um agente com objetivo, status, Core,
 * autoria, data e base de conhecimento. Clicar na linha abre o agente.
 * ───────────────────────────────────────────────────────────────────────── */
function PopulatedState() {
  return (
    <Section title="Seus agentes">
      <AgentsTable agents={ALL_AGENTES} />
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Estado 3 — empty state pra usuário recorrente (não é o primeiro acesso,
 * mas não tem nenhum agente próprio). Mantém o chrome do studio e já oferece
 * os modelos da organização logo abaixo — diferente da tela de boas-vindas.
 * ───────────────────────────────────────────────────────────────────────── */
function ReturningEmptyState() {
  return (
    <>
      <Section title="Meus agentes">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
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

      <div className="mt-14 border-t border-[var(--border-subtle)]" />

      <Section title="Todos os agentes">
        <AgentsTable agents={TODOS_OS_AGENTES} />
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
      <h2 className="mb-6 text-[20px] font-medium leading-tight tracking-[-0.01em] text-[var(--fg-primary)]">
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
function AgentsTable({ agents }: { agents: Agent[] }) {
  const router = useRouter();

  return (
    <AwMembersTable
      columns={[
        { label: "Nome", icon: "smart_toy" },
        { label: "Objetivo", icon: "target" },
        { label: "Status" },
        { label: "Agente core" },
        { label: "Criado por", icon: "person" },
        { label: "Criado em", icon: "schedule" },
        { label: "Base de conhecimento", icon: "database" },
        { label: "", width: 52 },
      ]}
    >
      {agents.map((agent) => {
        const status = STATUS_META[agent.status];
        const href = `/agent-studio/${agent.id}`;
        return (
          <tr
            key={agent.id}
            className="aw-row-clickable"
            onClick={() => router.push(href)}
          >
            <AwMembersTablePersonCell
              name={agent.title}
              avatarSrc={getOrbForAgent(agent.id)}
            />

            <AwMembersTableTextCell muted>
              <span className="flex items-center gap-2">
                <Icon
                  name="target"
                  size={16}
                  className="shrink-0 text-[var(--fg-tertiary)]"
                />
                <span className="truncate">{agent.objetivo}</span>
              </span>
            </AwMembersTableTextCell>

            <td>
              <AwPill variant={status.variant}>{status.label}</AwPill>
            </td>

            <td>
              <span className="flex items-center gap-2">
                <AwAgentCore src={agent.coreSrc} size={20} />
                <span className="truncate text-[length:var(--body-sm-size)] text-[var(--fg-primary)]">
                  {agent.coreName}
                </span>
              </span>
            </td>

            <td>
              <span className="flex items-center gap-2">
                <AwAvatar
                  size="sm"
                  initials={agent.author.initials}
                  alt={agent.author.name}
                />
                <span className="truncate text-[length:var(--body-sm-size)] text-[var(--fg-secondary)]">
                  {agent.author.name}
                </span>
              </span>
            </td>

            <AwMembersTableTextCell muted className="whitespace-nowrap">
              {agent.createdAt}
            </AwMembersTableTextCell>

            <AwMembersTableTextCell muted>
              <span className="flex items-center gap-2">
                <Icon
                  name="database"
                  size={15}
                  className="shrink-0 text-[var(--fg-tertiary)]"
                />
                <span className="truncate">{agent.knowledgeBase}</span>
              </span>
            </AwMembersTableTextCell>

            <td>
              <div className="flex items-center justify-end">
                <span onClick={(e) => e.stopPropagation()}>
                  <AwDropdownMenu
                    align="end"
                    trigger={
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-tertiary)] transition-colors duration-aw-fast hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]"
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
                        onSelect: () => {},
                      },
                      { id: "sep", separator: true },
                      {
                        id: "delete",
                        label: "Excluir",
                        icon: "delete",
                        danger: true,
                        onSelect: () => {},
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
  );
}
