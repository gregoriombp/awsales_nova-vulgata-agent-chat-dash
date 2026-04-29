"use client";

import type { AuthScreen } from "./AuthFlow";

type Locale = "pt" | "en";

interface BrandPaneProps {
  screen: AuthScreen;
  locale: Locale;
}

const PANE_COPY: Record<AuthScreen, Record<Locale, { kicker: string; title: string; sub: string }>> = {
  login: {
    pt: {
      kicker: "// acesso",
      title: "Uma voz única, uma plataforma.",
      sub: "Nova Vulgata unifica seus agentes, fluxos e integrações em uma única linguagem de operação.",
    },
    en: {
      kicker: "// access",
      title: "One voice. One platform.",
      sub: "Nova Vulgata unifies your agents, flows and integrations into a single operational language.",
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
  const isLogin = screen === "login";

  return (
    <section className="relative hidden lg:flex flex-col min-h-screen overflow-hidden bg-aw-gray-1200 text-white p-8 xl:p-10">
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

      {/* Decorative blob */}
      {isLogin ? (
        <div
          className="pointer-events-none absolute z-[1]"
          style={{
            width: 720,
            height: 720,
            top: -180,
            right: -260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, rgba(80,160,255,0.95) 0%, rgba(27,118,242,0.85) 30%, rgba(0,113,194,0.4) 55%, transparent 72%)",
            filter: "blur(1px)",
          }}
        />
      ) : (
        <div
          className="pointer-events-none absolute z-[1]"
          style={{
            width: 420,
            height: 420,
            bottom: -140,
            right: -120,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, rgba(80,160,255,0.95) 0%, rgba(27,118,242,0.85) 30%, rgba(0,113,194,0.4) 55%, transparent 72%)",
            filter: "blur(1px)",
            opacity: 0.55,
          }}
        />
      )}

      {/* Status bar */}
      <div className="relative z-[2] flex items-center gap-2.5 text-[11px] uppercase tracking-[0.12em] font-medium text-aw-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-aw-emerald-500" style={{ boxShadow: "0 0 0 3px rgba(104,215,128,0.12)" }} />
        <span>{locale === "pt" ? "status \u00b7 tudo operando" : "status \u00b7 all systems nominal"}</span>
      </div>

      {/* Body copy */}
      <div className="relative z-[2] flex-1 flex flex-col justify-end max-w-[460px]">
        <span className="font-mono text-[11px] text-aw-gray-500 tracking-[0.04em] mb-2.5">
          {copy.kicker}
        </span>
        <h1 className="font-heading font-medium text-[44px] leading-[1.05] tracking-tight text-white mb-4">
          {copy.title}
        </h1>
        <p className="text-[15px] leading-relaxed text-aw-gray-500 max-w-[420px] mb-7">
          {copy.sub}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-[2] flex items-center gap-3.5 text-xs text-aw-gray-600">
        <span>v4.2 \u00b7 Nova Vulgata</span>
        <span className="w-px h-2.5 bg-aw-gray-900" />
        <span>{locale === "pt" ? "plataforma" : "platform"}</span>
      </div>
    </section>
  );
}
