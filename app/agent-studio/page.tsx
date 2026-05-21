"use client";

import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { AwButton } from "@/components/ui/AwButton";
import { AwDotTunnel } from "@/components/ui/AwDotTunnel";
import { Icon } from "@/components/ui/Icon";

const AGENT_STUDIO_COLUMN = "mx-auto w-full max-w-lg px-5 sm:px-6";

export default function AgentStudioEntrancePage() {
  const breadcrumbs = [
    { label: "Início", href: "/inicio" },
    {
      label: "Agent Studio",
      icon: <Icon name="agent_studio" size={20} />,
    },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex min-h-full w-full flex-col items-center justify-center py-10 sm:py-14">
        <div className={`flex flex-col items-center justify-center gap-10 ${AGENT_STUDIO_COLUMN}`}>
          <AwDotTunnel size={320} className="w-full max-w-[320px] aspect-square" />

          <div className="flex flex-col items-center text-center">
            <h1 className="mb-3 font-heading text-4xl font-regular tracking-tight text-[var(--fg-primary)] sm:text-5xl md:text-6xl">
              Browse agents
            </h1>
            <p className="mb-10 max-w-md font-sans text-lg font-normal text-[var(--fg-secondary)] sm:text-xl">
              Descubra e crie agentes customizados que combinam instruções, conhecimento extra e qualquer combinação de tarefas.
            </p>
            <AwButton asChild variant="primary" size="lg" iconLeft="add">
              <Link href="/agent-studio/new">Criar agente</Link>
            </AwButton>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
