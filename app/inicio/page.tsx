"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwWelcomeModal } from "@/components/ui/AwWelcomeModal";
import { AwOnboardingTimeline } from "@/components/ui/AwOnboardingTimeline";
import type { AwOnboardingStep } from "@/components/ui/AwOnboardingTimeline";
import { AwAdditionalPlanBanner } from "@/components/ui/AwAdditionalPlanBanner";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_USER, ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";
import { ADDITIONAL_ORG } from "@/app/organizacao-adicional/_data";

export default function Inicio() {
  return (
    <React.Suspense fallback={null}>
      <InicioContent />
    </React.Suspense>
  );
}

function InicioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "1";
  const [pendingOrgDismissed, setPendingOrgDismissed] = React.useState(false);

  const dismiss = () => {
    router.replace("/inicio");
  };

  const startTour = () => {
    router.replace("/inicio?tour=1");
  };

  const inviteMembers = () => {
    router.push("/settings/equipe-permissoes");
  };

  const steps: AwOnboardingStep[] = [
    {
      id: "canais",
      title: "Conecte seus canais de atendimento",
      status: "current",
      description: (
        <>
          Centralize WhatsApp, e-mail, voz e webchat numa caixa só. Seu agente
          IA passa a responder de onde o cliente preferir, sem trocar de
          ferramenta.
        </>
      ),
      helpLink: {
        label: "Como funcionam os canais",
        href: "/integrations",
      },
      cta: {
        label: "Conectar canais",
        href: "/canais",
      },
    },
    {
      id: "equipe",
      title: "Convide sua equipe pra colaborar",
      description: (
        <>
          Defina papéis, permissões e times. Os agentes humanos assumem quando o
          agente IA precisa de uma mão.
        </>
      ),
      cta: {
        label: "Convidar membros",
        iconLeft: "person_add",
        href: "/settings/equipe-permissoes",
      },
    },
    {
      id: "memory-base",
      title:
        "Alimente os seus agentes com a sua base de conhecimento na Memory Base",
      description: (
        <>
          Suba documentos, FAQs e tutoriais na Memory Base. Quanto mais rico o
          contexto, mais preciso o agente fica nas primeiras conversas.
        </>
      ),
      cta: {
        label: "Abrir Memory Base",
        href: "/knowledge-os",
      },
    },
    {
      id: "playground",
      title: "Teste seu agente no Playground",
      description: (
        <>
          Converse com o agente no Playground antes de subir pra produção.
          Ajuste tom, limites e respostas até ficar confortável.
        </>
      ),
      cta: {
        label: "Abrir Playground",
        href: "/playground",
      },
    },
    {
      id: "deploy",
      title: "Coloque o seu primeiro agente no ar",
      description: (
        <>
          Conecte o agente aos canais e libere o atendimento real. Você pode
          pausar ou ajustar a qualquer momento.
        </>
      ),
      cta: {
        label: "Ativar agente",
        href: "/agent-studio",
      },
    },
    {
      id: "aops",
      title: "Crie fluxos predefinidos pra tarefas repetitivas (AOPs)",
      description: (
        <>
          AOPs (Automated Operating Procedures) automatizam cobranças, triagem,
          follow-ups — qualquer rotina que se repete. Configure uma vez,
          dispare em escala.
        </>
      ),
      cta: {
        label: "Criar AOP",
        href: "/aops",
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1120px] px-6 py-10 md:px-10">
        {!pendingOrgDismissed && (
          <div className="mb-6">
            <AwAdditionalPlanBanner
              orgName={ADDITIONAL_ORG.name}
              configureHref="/organizacao-adicional"
              onDismiss={() => setPendingOrgDismissed(true)}
            />
          </div>
        )}
        <AwOnboardingTimeline
          title={
            <>
              Bem-vindo, {ONBOARDING_USER.firstName}.
              <br />
              <span className="font-light text-[var(--fg-secondary)]">
                Vamos colocar a {ONBOARDING_ORG.name} pra rodar.
              </span>
            </>
          }
          steps={steps}
          preview={
            <div className="relative h-full min-h-[360px] w-full">
              <div className="absolute inset-0 aw-gradient-iridescent-soft" />
              <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--bg-raised)] px-2.5 py-1 body-xs font-medium text-[var(--fg-primary)] shadow-sm">
                  <Icon name="play_arrow" size={14} fill={1} />
                  Tour em 60s
                </span>
                <p className="m-0 max-w-[240px] body-sm text-[var(--fg-primary)]">
                  Veja como uma conversa percorre canais, agente IA e humano em
                  menos de um minuto.
                </p>
              </div>
            </div>
          }
        />
      </div>

      <AwWelcomeModal
        open={showWelcome}
        onClose={dismiss}
        imageSrc={ONBOARDING_ORG.brandBackground}
        imageAlt={`Capa da ${ONBOARDING_ORG.name}`}
        eyebrow={`Bem-vindo à AwSales`}
        title={
          <>
            Tudo certo, {ONBOARDING_USER.firstName}.
            <br />A {ONBOARDING_ORG.name} está no ar.
          </>
        }
        description="Por onde quer começar? Você pode pular e explorar a plataforma à vontade — esses passos continuam aqui pra quando quiser voltar."
        actions={[
          {
            id: "invite",
            label: "Convidar minha equipe",
            description: "Comece pelo passo nº 1 da ativação.",
            icon: "person_add",
            primary: true,
            onClick: inviteMembers,
          },
          {
            id: "tour",
            label: "Fazer um tour de 60s",
            description: "Veja a plataforma rodando em menos de um minuto.",
            icon: "play_arrow",
            comingSoon: true,
            onClick: startTour,
          },
          {
            id: "explore",
            label: "Explorar por conta própria",
            description: "Vou direto pra plataforma — sem pressa.",
            icon: "arrow_forward",
            onClick: dismiss,
          },
        ]}
      />
    </DashboardLayout>
  );
}
