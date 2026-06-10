"use client";

import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";

/**
 * Fim da redefinição de senha — SEPARADO do sucesso de login. Não faz
 * auto-login nem redireciona pra /inicio: o usuário volta ao login normal
 * (que pode passar por política da org, SSO e 2FA). No backend, salvar a nova
 * senha encerra as sessões antigas (OWASP Forgot Password).
 */
export function ResetSuccessScreen({
  locale,
  goTo,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
}) {
  const c = COPY.resetSuccess[locale];

  return (
    <div className="w-full max-w-[380px] animate-fadeInUp">
      <div className="w-14 h-14 rounded-full bg-aw-emerald-500 flex items-center justify-center mb-5 text-white ring-8 ring-aw-emerald-500/15">
        <Icon name="lock_reset" size={28} />
      </div>
      <h3 className="text-aw-gray-1200 mb-2.5">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6">{c.sub}</p>
      <AwButton variant="primary" size="md" block onClick={() => goTo("login")} iconRight="arrow_forward">
        {c.cta}
      </AwButton>
    </div>
  );
}
