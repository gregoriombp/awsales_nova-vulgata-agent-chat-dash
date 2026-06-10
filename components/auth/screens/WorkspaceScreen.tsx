"use client";

import { useEffect, useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { cn } from "@/lib/utils";
import type { Locale, AuthScreen, AuthMethod } from "../_types";
import { COPY, ORGS } from "../_copy";

export function WorkspaceScreen({
  locale,
  goTo,
  authMethod,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
  authMethod: AuthMethod;
}) {
  const c = COPY.workspace[locale];

  // Filtra por método: o seletor só lista organizações que aceitam o método
  // usado pra entrar (orgs SSO-only somem num login por senha). Evita expor a
  // relação org↔usuário e impede escolher um caminho que nunca autorizaria.
  const orgs = ORGS[locale].filter((o) => o.methods.includes(authMethod));
  const [selected, setSelected] = useState(0);

  // Nenhuma org compatível → tela terminal "sem acesso por este método".
  useEffect(() => {
    if (orgs.length === 0) goTo("noAccessForMethod");
  }, [orgs.length, goTo]);

  if (orgs.length === 0) return null;

  const handleContinue = () => {
    const org = orgs[selected];
    // SSO empresarial só pula o 2FA quando a org delega o MFA ao IdP. Sem
    // delegação, mesmo via SSO o desafio acontece (não é skip global).
    if (authMethod === "sso" && org.mfaDelegatedToIdp) {
      goTo("success");
      return;
    }
    if (org.mfa === "verify") goTo("mfaVerify");
    else if (org.mfa === "setup") goTo("mfaGate");
    else goTo("success");
  };

  return (
    <div className="w-full max-w-[380px] animate-fadeInUp">
      <h3 className="text-aw-gray-1200 mb-2.5 text-center">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6 text-center">{c.sub}</p>

      <div className="flex flex-col gap-2 mb-5">
        {orgs.map((org, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={org.name}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer",
                isSelected
                  ? "border-aw-gray-1200 bg-white shadow-[0_0_0_1px_var(--aw-gray-1200)]"
                  : "border-aw-gray-300 bg-white hover:border-aw-gray-400 hover:bg-aw-gray-150"
              )}
            >
              {org.avatar ? (
                <span className="w-9 h-9 rounded-lg overflow-hidden bg-aw-gray-150 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={org.avatar} alt={org.name} className="h-full w-full object-cover" />
                </span>
              ) : (
                <span className="w-9 h-9 rounded-lg flex items-center justify-center body-sm font-medium shrink-0 bg-aw-gray-150 text-aw-gray-1200 border border-aw-gray-300">
                  {org.name.substring(0, 1).toUpperCase()}
                </span>
              )}
              <span className="flex-1 min-w-0">
                <span className="block body-sm font-medium text-aw-gray-1200">{org.name}</span>
                <span className="block body-xs text-aw-gray-700 mt-0.5">
                  {org.role ? `${org.meta} · ${org.role}` : org.meta}
                </span>
              </span>
              <span
                className={cn(
                  "size-5 rounded-full border flex items-center justify-center shrink-0",
                  isSelected ? "border-aw-gray-1200" : "border-aw-gray-400"
                )}
              >
                {isSelected && <span className="w-2 h-2 rounded-full bg-aw-gray-1200" />}
              </span>
            </button>
          );
        })}
      </div>

      <AwButton variant="primary" size="md" block onClick={handleContinue}>
        {c.cta}
      </AwButton>

      <div className="h-px bg-aw-gray-200 my-6" />
      <p className="body-xs text-center">
        <button
          type="button"
          onClick={() => goTo("login")}
          className="font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          {c.change}
        </button>
      </p>
    </div>
  );
}
