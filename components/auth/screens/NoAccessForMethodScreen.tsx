"use client";

import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";

/**
 * Tela terminal de "sem acesso por este método": nenhuma organização aceita o
 * método usado pra entrar. Por design NÃO lista as organizações existentes
 * (evita vazar a relação org↔usuário) — só orienta a tentar e-mail
 * corporativo, SSO ou falar com o admin.
 */
export function NoAccessForMethodScreen({
  locale,
  goTo,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
}) {
  const c = COPY.noAccessForMethod[locale];

  return (
    <div className="w-full max-w-[380px] animate-fadeInUp">
      <div className="flex justify-center mb-5">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-aw-gray-150 text-aw-gray-1200">
          <Icon name="block" size={24} />
        </span>
      </div>

      <h3 className="text-aw-gray-1200 mb-2.5 text-center">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6 text-center">{c.sub}</p>

      <AwButton variant="primary" size="md" block onClick={() => goTo("login")}>
        {c.retry}
      </AwButton>

      <div className="h-px bg-aw-gray-200 my-6" />
      <p className="body-xs text-center">
        <a
          href="#"
          className="font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          {c.contact}
        </a>
      </p>
    </div>
  );
}
