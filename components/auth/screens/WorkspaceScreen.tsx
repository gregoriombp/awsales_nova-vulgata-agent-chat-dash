"use client";

import { useState } from "react";
import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { cn } from "@/lib/utils";
import type { Locale, AuthScreen } from "../_types";
import { COPY, ORGS } from "../_copy";

export function WorkspaceScreen({
  locale,
  goTo,
  skipMfa,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
  skipMfa?: boolean;
}) {
  const c = COPY.workspace[locale];
  const orgs = ORGS[locale];
  const [selected, setSelected] = useState(0);

  return (
    <div className="w-full max-w-[380px] animate-fadeInUp">
      <h3 className="text-aw-gray-1200 mb-2.5 text-center">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6 text-center">{c.sub}</p>

      <div className="flex flex-col gap-2 mb-5">
        {orgs.map((org, i) => {
          const isSelected = selected === i;
          const baseClass = "flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer";
          const stateClass = org.pending
            ? "border-dashed border-aw-gray-400 bg-aw-gray-150 hover:border-aw-gray-1200 hover:bg-white"
            : isSelected
              ? "border-aw-gray-1200 bg-white shadow-[0_0_0_1px_var(--aw-gray-1200)]"
              : "border-aw-gray-300 bg-white hover:border-aw-gray-400 hover:bg-aw-gray-150";

          const content = (
            <>
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
                <span className="block body-xs text-aw-gray-700 mt-0.5">{org.meta}</span>
              </span>
              {org.pending ? (
                <span className="body-xs font-medium text-aw-gray-1200 shrink-0">
                  Configurar →
                </span>
              ) : (
                <span
                  className={cn(
                    "size-5 rounded-full border flex items-center justify-center shrink-0",
                    isSelected ? "border-aw-gray-1200" : "border-aw-gray-400"
                  )}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-aw-gray-1200" />}
                </span>
              )}
            </>
          );

          if (org.pending) {
            return (
              <Link
                key={i}
                href="/organizacao-adicional"
                className={cn(baseClass, stateClass, "no-underline")}
              >
                {content}
              </Link>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(baseClass, stateClass)}
            >
              {content}
            </button>
          );
        })}
      </div>

      <AwButton
        variant="primary"
        size="md"
        block
        onClick={() => {
          // SSO empresarial: o IdP da org já fez o MFA — o app não repete o
          // challenge de 2FA (evita o double-prompt). Vai direto pro sucesso.
          if (skipMfa) {
            goTo("success");
            return;
          }
          const next: AuthScreen =
            selected === 0
              ? "mfaVerify"
              : selected === 1
                ? "mfaGate"
                : "success";
          goTo(next);
        }}
      >
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
