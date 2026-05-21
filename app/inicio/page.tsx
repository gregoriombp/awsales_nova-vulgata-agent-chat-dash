"use client";

import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwModal } from "@/components/ui/AwModal";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwOnboardingTimeline } from "@/components/ui/AwOnboardingTimeline";
import type { AwOnboardingStep } from "@/components/ui/AwOnboardingTimeline";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_USER, ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";

const userInitials = ONBOARDING_USER.name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((p) => p[0]?.toUpperCase() ?? "")
  .join("");

export default function Inicio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "1";

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
        <AwOnboardingTimeline
          title={`Bem-vindo, ${ONBOARDING_USER.firstName}. Vamos colocar a ${ONBOARDING_ORG.name} pra rodar.`}
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

      <AwModal open={showWelcome} onClose={dismiss} dismissible>
        <div className="flex flex-col items-center gap-4 px-2 py-4 text-center">
          <AwAvatar
            size="lg"
            src={ONBOARDING_USER.photo}
            initials={userInitials}
            alt={ONBOARDING_USER.name}
            style={{ width: 56, height: 56, fontSize: 18 }}
          />
          <div>
            <h4 className="m-0 text-fg-primary text-balance">
              Tudo certo, {ONBOARDING_USER.firstName}. Você está dentro.
            </h4>
            <p className="mx-auto mt-2 max-w-[380px] body-sm text-fg-secondary text-pretty">
              Sua conta foi ativada e a{" "}
              <span className="font-medium text-fg-primary">
                {ONBOARDING_ORG.name}
              </span>{" "}
              já está configurada. Em 90 minutos seu primeiro agente pode
              atender o primeiro cliente — posso te mostrar a plataforma em 60
              segundos antes?
            </p>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={dismiss}
              className="aw-btn aw-btn--ghost aw-btn--md"
            >
              <span className="aw-btn__label">Explorar por conta própria</span>
            </button>
            <button
              type="button"
              onClick={startTour}
              className="aw-btn aw-btn--primary aw-btn--md"
            >
              <Icon name="play_arrow" size={16} fill={1} />
              <span className="aw-btn__label">Iniciar tour (60s)</span>
            </button>
          </div>
          <button
            type="button"
            onClick={inviteMembers}
            className="mt-1 inline-flex items-center gap-1.5 body-sm text-fg-secondary hover:text-fg-primary transition-colors"
          >
            <Icon name="person_add" size={16} />
            <span>Convidar membros agora</span>
            <Icon name="arrow_forward" size={14} />
          </button>
        </div>
      </AwModal>
    </DashboardLayout>
  );
}
