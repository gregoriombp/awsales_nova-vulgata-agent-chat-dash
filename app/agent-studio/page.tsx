"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwAgentCore } from "@/components/ui/AwAgentCore";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwDotTunnel } from "@/components/ui/AwDotTunnel";
import { AwPageHeader } from "@/components/ui/AwPageHeader";
import { AwUserAgentOrbStatic } from "@/components/ui/AwUserAgentOrb";
import {
  AwMembersTable,
  AwMembersTablePersonCell,
  AwMembersTableTextCell,
} from "@/components/ui/AwMembersTable";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
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
  TODOS_OS_AGENTES,
  type Agent,
} from "@/lib/agentStudio";


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
          <div className="mx-auto w-full max-w-[1600px] px-6 pb-20 pt-6 sm:px-10">
            <StudioHeader />

            {state === "populated" ? <PopulatedState /> : <ReturningEmptyState />}
          </div>
        )}
      </AwDashboardLayout>
    </>
  );
}

function StudioHeader() {
  const orbs = ALL_AGENTES.slice(0, 5);

  return (
    <AwPageHeader
      size="hero"
      icon={<AwUserAgentOrbStatic seed="agent-studio" size={48} />}
      title="Agent Studio"
      description="Descubra e crie agentes customizados que combinam instruções, conhecimento extra e qualquer combinação de tarefas."
      divider={false}
      actions={
        <>
          <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex -space-x-3">
            {orbs.map((agent) => (
              <AwUserAgentOrbStatic
                key={agent.id}
                seed={agent.id}
                size={40}
                className="border-2 border-(--bg-canvas) shadow-sm"
              />
            ))}
          </div>
          <p className="text-xs text-(--fg-secondary)">
            {ALL_AGENTES.length} agentes operando neste workspace
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
        Bem vindo ao Agent Studio
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
        { label: "Base de conhecimento", icon: "account_balance" },
        { label: "", width: 52 },
      ]}
    >
      {agents.map((agent) => {
        const status = AGENT_STATUS_META[agent.status];
        const href = `/agent-studio/${agent.id}`;
        return (
          <tr
            key={agent.id}
            className="aw-row-clickable"
            onClick={() => router.push(href)}
          >
            <AwMembersTablePersonCell
              name={agent.title}
              avatar={<AwUserAgentOrbStatic seed={agent.id} size={40} />}
            />

            <AwMembersTableTextCell muted>
              <span className="flex items-center gap-2">
                <Icon
                  name="target"
                  size={16}
                  className="shrink-0 text-(--fg-tertiary)"
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
                <span className="truncate text-(length:--body-sm-size) text-(--fg-primary)">
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
                <span className="truncate text-(length:--body-sm-size) text-(--fg-secondary)">
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
                  name="account_balance"
                  size={15}
                  className="shrink-0 text-(--fg-tertiary)"
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
