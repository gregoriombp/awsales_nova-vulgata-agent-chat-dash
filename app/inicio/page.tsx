"use client";

import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";
import { AwModal } from "@/components/ui/AwModal";
import { AwLogo } from "@/components/ui/AwLogo";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_USER } from "@/app/primeiro-acesso/_data";

export default function Inicio() {
  const breadcrumbs = ["Início"];
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "1";

  const closeWelcome = () => {
    router.replace("/inicio");
  };

  return (
    <DashboardLayout title="Início" breadcrumbs={breadcrumbs}>
      <ComingSoon />
      <AwModal open={showWelcome} onClose={closeWelcome} dismissible>
        <div className="flex flex-col items-center gap-4 px-2 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-bg-muted text-fg-primary">
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
              Bem-vindo, {ONBOARDING_USER.firstName}.
            </h2>
            <p
              className="mx-auto mt-2 max-w-[360px] text-fg-secondary text-pretty"
              style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
            >
              Sua conta foi ativada com sucesso. Crie seu primeiro agente em
              menos de 90 minutos.
            </p>
          </div>
          <div className="mt-2 flex gap-2.5">
            <button
              type="button"
              onClick={closeWelcome}
              className="aw-btn aw-btn--ghost aw-btn--md"
            >
              <span className="aw-btn__label">Fechar</span>
            </button>
            <button
              type="button"
              onClick={closeWelcome}
              className="aw-btn aw-btn--primary aw-btn--md"
            >
              <Icon name="manage_accounts" size={16} />
              <span className="aw-btn__label">Personalizar perfil</span>
            </button>
          </div>
        </div>
      </AwModal>
    </DashboardLayout>
  );
}
