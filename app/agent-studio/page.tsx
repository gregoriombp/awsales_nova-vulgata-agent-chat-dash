"use client";

import { useState } from "react";
import Link from "next/link";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwPageHeader } from "@/components/ui/AwPageHeader";
import { AwAgentTile } from "@/components/ui/AwAgentTile";
import { AwDotTunnel } from "@/components/ui/AwDotTunnel";
import {
  AwEmpty,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
  AwEmptyDescription,
  AwEmptyContent,
} from "@/components/ui/AwEmpty";
import { getOrbForAgent } from "@/lib/agentOrbs";
import { cn } from "@/lib/utils";

type Agent = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  count: number;
};

const MEUS_AGENTES: Agent[] = [
  {
    id: "sales",
    title: "Agente de vendas",
    description:
      "Conduz qualificação de lead, agenda demo e mantém o pipeline atualizado no CRM.",
    authorName: "Alex Smith",
    count: 12,
  },
  {
    id: "customer-support",
    title: "Agente de suporte",
    description:
      "Resolve dúvidas sensíveis com empatia e escala pro humano quando bate o limite.",
    authorName: "Alex Smith",
    count: 3,
  },
  {
    id: "hr",
    title: "Agente de RH",
    description:
      "Tira dúvidas de políticas, conduz onboarding e direciona pra time certo.",
    authorName: "Alex Smith",
    count: 0,
  },
  {
    id: "it-support",
    title: "Agente de TI",
    description:
      "Diagnostica problemas técnicos e abre chamado quando precisa escalar.",
    authorName: "Alex Smith",
    count: 0,
  },
];

const TODOS_OS_AGENTES: Agent[] = [
  {
    id: "research",
    title: "Agente de research",
    description:
      "Sintetiza briefs de mercado, concorrentes e sinais de cliente em sumários compartilháveis.",
    authorName: "Bea Costa",
    count: 12,
  },
  {
    id: "qa",
    title: "Agente de QA",
    description:
      "Revisa release notes, checa regressões e sinaliza merges arriscados antes do deploy.",
    authorName: "Carlos Sun",
    count: 8,
  },
  {
    id: "onboarding",
    title: "Agente de onboarding",
    description:
      "Guia novos integrantes pela configuração da workspace, integrações e playbook dos primeiros 90 dias.",
    authorName: "Dani Rocha",
    count: 5,
  },
  {
    id: "data",
    title: "Agente de dados",
    description:
      "Roda queries ad hoc, monta dashboards e escreve análises com fontes anexadas.",
    authorName: "Eva Lima",
    count: 3,
  },
];

type StudioState = "welcome" | "populated" | "returning";

export default function AgentStudioPage() {
  // `welcome` é a tela de primeiro acesso (aparece uma única vez). Os outros
  // dois estados são o studio já com chrome. O switcher abaixo é só de preview
  // — em produção o estado vem do backend (tem agente? primeiro login?).
  const [state, setState] = useState<StudioState>("welcome");

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

      <PreviewSwitcher state={state} onChange={setState} />
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
 * ───────────────────────────────────────────────────────────────────────── */
function PopulatedState() {
  return (
    <>
      <Section title="Meus agentes">
        <AgentGrid agents={MEUS_AGENTES} />
      </Section>

      <div className="mt-14 border-t border-[var(--border-subtle)]" />

      <Section title="Todos os agentes">
        <AgentGrid agents={TODOS_OS_AGENTES} />
      </Section>
    </>
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
        <AgentGrid agents={TODOS_OS_AGENTES} />
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

function AgentGrid({ agents }: { agents: Agent[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
      {agents.map((agent) => (
        <AwAgentTile
          key={agent.id}
          avatarSrc={getOrbForAgent(agent.id)}
          title={agent.title}
          description={agent.description}
          authorName={agent.authorName}
          count={agent.count}
          href={`/agent-studio/${agent.id}`}
        />
      ))}
    </div>
  );
}

/* Controle de preview — alterna os 3 estados no browser. Não é UI de produto. */
function PreviewSwitcher({
  state,
  onChange,
}: {
  state: StudioState;
  onChange: (next: StudioState) => void;
}) {
  const options: { id: StudioState; label: string }[] = [
    { id: "welcome", label: "Boas-vindas (1º acesso)" },
    { id: "populated", label: "Com agentes" },
    { id: "returning", label: "Sem agentes (recorrente)" },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-1 rounded-[var(--radius-full)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-1 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.25)]">
      <span className="px-2 text-[11px] uppercase tracking-wide text-[var(--fg-tertiary)]">
        Preview
      </span>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-[var(--radius-full)] px-3 py-1.5 text-[12.5px] transition-colors",
            state === option.id
              ? "bg-[var(--fg-primary)] text-[var(--bg-canvas)]"
              : "text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
