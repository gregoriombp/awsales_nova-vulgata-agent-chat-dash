"use client";

import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";
import { AwModal } from "@/components/ui/AwModal";
import { AwLogo } from "@/components/ui/AwLogo";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_USER, ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";

export default function Inicio() {
  const breadcrumbs = ["Início"];
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "1";

  const dismiss = () => {
    router.replace("/inicio");
  };

  const startTour = () => {
    router.replace("/inicio?tour=1");
  };

  return (
    <DashboardLayout title="Início" breadcrumbs={breadcrumbs}>
      <ComingSoon />
      <AwModal open={showWelcome} onClose={dismiss} dismissible>
        <div className="flex flex-col items-center gap-4 px-2 py-4 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-white"
            style={{ background: "var(--aw-blue-600)" }}
          >
            <AwLogo variant="mark" height={28} />
          </div>
          <div>
            <h2
              className="m-0 font-display font-medium text-fg-primary text-balance"
              style={{
                fontSize: "var(--h4-size)",
                lineHeight: 1.15,
                letterSpacing: "-0.015em",
              }}
            >
              Tudo certo, {ONBOARDING_USER.firstName}. Você está dentro.
            </h2>
            <p
              className="mx-auto mt-2 max-w-[380px] text-fg-secondary text-pretty"
              style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
            >
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
          <div
            className="mt-1 text-fg-tertiary"
            style={{ fontSize: 10, letterSpacing: "0.04em" }}
          >
            você pode refazer o tour depois em Ajuda → Onboarding
          </div>
        </div>
      </AwModal>
    </DashboardLayout>
  );
}
