"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { AwToggleRow } from "@/components/ui/AwToggle";
import { SESSIONS, SettingsPageHeader } from "../_components/shared";

export default function SecuritySettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Segurança"
        description="Acesso à sua conta e auditoria de sessões."
      />
      <AwCard className="p-0!">
        <div className="flex items-start justify-between gap-4 border-b border-(--border-subtle) px-6 py-5">
          <div>
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              Senha
            </p>
            <p className="m-0 body-xs text-(--fg-secondary)">
              Última alteração há 3 meses.
            </p>
          </div>
          <AwButton size="sm" variant="secondary">
            Alterar senha
          </AwButton>
        </div>
        <div className="px-6 py-2">
          <AwToggleRow
            title="Autenticação em 2 fatores"
            description="Exige um código do seu app autenticador a cada login."
            checked={twoFactor}
            onChange={setTwoFactor}
          />
        </div>
        <div className="border-t border-(--border-subtle) px-6 py-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              Sessões ativas
            </p>
            <button
              type="button"
              className="body-xs font-medium text-(--fg-secondary) hover:text-(--fg-primary)"
            >
              Encerrar todas as outras
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {SESSIONS.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-(--bg-surface)"
              >
                <AwStatusDot
                  variant={s.current ? "live" : "neutral"}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="m-0 flex items-center gap-2 body-xs font-medium text-(--fg-primary)">
                    {s.device}
                    {s.current && (
                      <AwPill variant="live" dot={false}>
                        Esta sessão
                      </AwPill>
                    )}
                  </p>
                  <p className="m-0 body-xs text-(--fg-secondary)">
                    {s.location} · {s.lastActive}
                  </p>
                </div>
                {!s.current && (
                  <AwButton size="sm" variant="ghost">
                    Encerrar
                  </AwButton>
                )}
              </li>
            ))}
          </ul>
        </div>
      </AwCard>
    </div>
  );
}
