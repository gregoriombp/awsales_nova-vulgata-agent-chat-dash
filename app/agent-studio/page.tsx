"use client";

import Link from "next/link";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwPageHeader } from "@/components/ui/AwPageHeader";
import { AwAgentTile } from "@/components/ui/AwAgentTile";
import { getOrbForAgent } from "@/lib/agentOrbs";

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

export default function AgentStudioPage() {
  const breadcrumbs = [{ label: "Agent Studio" }];

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
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

        <Section title="Meus agentes">
          <AgentGrid agents={MEUS_AGENTES} />
        </Section>

        <div className="mt-14 border-t border-[var(--border-subtle)]" />

        <Section title="Todos os agentes">
          <AgentGrid agents={TODOS_OS_AGENTES} />
        </Section>
      </div>
    </AwDashboardLayout>
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
