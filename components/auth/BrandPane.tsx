"use client";

import { useState, useEffect } from "react";
import type { AuthScreen } from "./AuthFlow";

type Locale = "pt" | "en";

interface BrandPaneProps {
  screen: AuthScreen;
  locale: Locale;
}

const BG_IMAGE_COUNT = 20;
const pickRandomBgIndex = () => Math.floor(Math.random() * BG_IMAGE_COUNT) + 1;
const bgImageSrc = (idx: number) =>
  `/assets/group-backgrounds/group-bg-${String(idx).padStart(2, "0")}.jpg`;

const PANE_COPY: Record<AuthScreen, Record<Locale, { kicker: string; title: string; sub: string }>> = {
  login: {
    pt: {
      kicker: "// acesso",
      title: "Uma voz única, uma plataforma.",
      sub: "AwSales unifica seus agentes, fluxos e integrações em uma única linguagem de operação.",
    },
    en: {
      kicker: "// access",
      title: "One voice. One platform.",
      sub: "AwSales unifies your agents, flows and integrations into a single operational language.",
    },
  },
  forgot: {
    pt: {
      kicker: "// recuperação",
      title: "Recupere o acesso.",
      sub: "Um link seguro, válido por 30 minutos. Verifique também a pasta de spam.",
    },
    en: {
      kicker: "// recovery",
      title: "Recover access.",
      sub: "A secure link, valid for 30 minutes. Don\u2019t forget to check your spam folder.",
    },
  },
  reset: {
    pt: {
      kicker: "// nova senha",
      title: "Uma senha forte, por favor.",
      sub: "Guarde em um gerenciador de senhas (1Password, Bitwarden) e ative autenticação em 2 etapas.",
    },
    en: {
      kicker: "// new password",
      title: "A strong password, please.",
      sub: "Save it in a password manager (1Password, Bitwarden) and turn on two-step verification.",
    },
  },
  verify: {
    pt: {
      kicker: "// verificação",
      title: "Só confirmando que é você.",
      sub: "O código expira em 10 minutos. Se não receber, verifique a pasta de spam ou reenvie.",
    },
    en: {
      kicker: "// verify",
      title: "Just making sure it\u2019s you.",
      sub: "The code expires in 10 minutes. If you don\u2019t see it, check your spam folder or resend.",
    },
  },
  workspace: {
    pt: {
      kicker: "// workspace",
      title: "Onde você trabalha hoje?",
      sub: "Cada workspace tem seus próprios agentes, fluxos, integrações e permissões. Você pode alternar a qualquer momento.",
    },
    en: {
      kicker: "// workspace",
      title: "Where are you working today?",
      sub: "Each workspace has its own agents, flows, integrations and permissions. You can switch any time.",
    },
  },
  success: {
    pt: {
      kicker: "// sucesso",
      title: "Bem-vindo de volta, Ana.",
      sub: "Seu Agente Aurora está respondendo novos leads agora mesmo. Vamos direto ao Studio.",
    },
    en: {
      kicker: "// success",
      title: "Welcome back, Ana.",
      sub: "Your Aurora Agent is replying to new leads right now. Let\u2019s go straight to the Studio.",
    },
  },
};

export default function BrandPane({ screen, locale }: BrandPaneProps) {
  const copy = PANE_COPY[screen][locale];
  const [bgIndex, setBgIndex] = useState<number | null>(null);

  useEffect(() => {
    setBgIndex(pickRandomBgIndex());
  }, []);

  return (
    <section className="relative hidden lg:flex flex-col min-h-screen overflow-hidden bg-aw-gray-1200 text-white p-8 xl:p-10">
      {/* Random background image overlay */}
      {bgIndex !== null && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${bgImageSrc(bgIndex)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.45,
            filter: "grayscale(100%) contrast(1.1)",
            mixBlendMode: "screen",
            maskImage: "radial-gradient(ellipse at 55% 50%, black 55%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse at 55% 50%, black 55%, transparent 100%)",
          }}
        />
      )}

      {/* Grid texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 70% 40%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, black 30%, transparent 80%)",
        }}
      />



      {/* Body copy */}
      <div className="relative z-[2] flex-1 flex flex-col justify-end max-w-[460px]">
        <h1 className="font-heading font-medium text-[44px] leading-[1.05] tracking-tight text-white mb-4">
          {copy.title}
        </h1>
        <p className="text-[15px] leading-relaxed text-aw-gray-500 max-w-[420px]">
          {copy.sub}
        </p>
      </div>
    </section>
  );
}
