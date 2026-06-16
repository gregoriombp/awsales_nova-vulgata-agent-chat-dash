"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { SettingsPageHeader } from "../../_components/shared";

type Session = {
  id: string;
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile";
  ip: string;
  city: string;
  startedAt: string;
  lastUsed: string;
  current?: boolean;
};

const INITIAL_SESSIONS: Session[] = [
  {
    id: "s-current",
    browser: "Chrome 124",
    os: "macOS 14",
    deviceType: "desktop",
    ip: "189.45.x.x",
    city: "São Paulo · SP",
    startedAt: "25/05 · 09:14",
    lastUsed: "agora",
    current: true,
  },
  {
    id: "s-safari",
    browser: "Safari",
    os: "iOS 17",
    deviceType: "mobile",
    ip: "177.99.x.x",
    city: "São Paulo · SP",
    startedAt: "23/05 · 18:22",
    lastUsed: "2h atrás",
  },
  {
    id: "s-firefox",
    browser: "Firefox",
    os: "Windows 11",
    deviceType: "desktop",
    ip: "200.142.x.x",
    city: "Campinas · SP",
    startedAt: "20/05 · 10:05",
    lastUsed: "3 dias atrás",
  },
  {
    id: "s-chrome-android",
    browser: "Chrome",
    os: "Android 14",
    deviceType: "mobile",
    ip: "186.220.x.x",
    city: "Rio de Janeiro · RJ",
    startedAt: "10/05 · 14:30",
    lastUsed: "8 dias atrás",
  },
];

export default function SessoesAtivasPage() {
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [terminateTarget, setTerminateTarget] = useState<Session | null>(null);
  const [terminateAllOpen, setTerminateAllOpen] = useState(false);

  function confirmTerminate() {
    if (!terminateTarget) return;
    setSessions((s) => s.filter((x) => x.id !== terminateTarget.id));
    setTerminateTarget(null);
  }

  function confirmTerminateAll() {
    setSessions((s) => s.filter((x) => x.current));
    setTerminateAllOpen(false);
  }

  const otherCount = sessions.filter((s) => !s.current).length;

  return (
    <div className="mx-auto w-full max-w-[900px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Sessões ativas"
        description="Dispositivos onde sua conta está logada. Encerre qualquer sessão que não reconhecer."
        trailing={
          otherCount > 0 ? (
            <AwButton
              size="sm"
              variant="secondary"
              iconLeft="logout"
              onClick={() => setTerminateAllOpen(true)}
            >
              Encerrar todas exceto esta
            </AwButton>
          ) : undefined
        }
      />

      <AwCard className="p-0!">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] items-center gap-4 border-b border-(--border-subtle) px-6 py-3">
          {(["Dispositivo", "Origem", "Iniciada", "Último uso", ""] as const).map(
            (col, i) => (
              <span
                key={i}
                className="aw-eyebrow text-(--fg-tertiary)"
              >
                {col}
              </span>
            ),
          )}
        </div>

        {/* Rows */}
        <ul className="m-0 list-none divide-y divide-(--border-subtle) p-0">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="m-0 grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] items-center gap-4 px-6 py-4"
            >
              {/* Dispositivo */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)">
                  <Icon
                    name={s.deviceType === "mobile" ? "smartphone" : "laptop"}
                    size={16}
                  />
                </span>
                <div className="min-w-0">
                  <p className="m-0 body-sm font-medium text-(--fg-primary) truncate">
                    {s.browser}{" "}
                    <span className="font-normal text-(--fg-secondary)">
                      no {s.os}
                    </span>
                  </p>
                  {s.current && (
                    <AwPill variant="live" dot={false} className="mt-0.5">
                      Este dispositivo
                    </AwPill>
                  )}
                </div>
              </div>

              {/* Origem */}
              <div>
                <p className="m-0 body-sm tabular-nums text-(--fg-primary)">
                  {s.ip}
                </p>
                <p className="m-0 body-xs text-(--fg-secondary)">{s.city}</p>
              </div>

              {/* Iniciada */}
              <p className="m-0 body-sm tabular-nums text-(--fg-secondary)">
                {s.startedAt}
              </p>

              {/* Último uso */}
              <p className="m-0 body-sm tabular-nums text-(--fg-secondary)">
                {s.lastUsed}
              </p>

              {/* Ação */}
              <div className="flex justify-end">
                {s.current ? (
                  <span className="body-xs text-(--fg-tertiary)">
                    — use Sair
                  </span>
                ) : (
                  <AwButton
                    size="sm"
                    variant="ghost"
                    onClick={() => setTerminateTarget(s)}
                  >
                    Encerrar
                  </AwButton>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Footer count */}
        <div className="border-t border-(--border-subtle) px-6 py-3">
          <p className="m-0 body-xs text-(--fg-tertiary)">
            {sessions.length} sessã{sessions.length === 1 ? "o ativa" : "ões ativas"}.
          </p>
        </div>
      </AwCard>

      {/* Modal — encerrar sessão individual */}
      <AwModal
        open={!!terminateTarget}
        onClose={() => setTerminateTarget(null)}
        title="Encerrar sessão?"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setTerminateTarget(null)}
            >
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="danger"
              onClick={confirmTerminate}
            >
              Encerrar
            </AwButton>
          </>
        }
      >
        {terminateTarget && (
          <p className="m-0 body-sm text-(--fg-secondary)">
            A sessão de{" "}
            <strong className="font-medium text-(--fg-primary)">
              {terminateTarget.browser} no {terminateTarget.os}
            </strong>{" "}
            ({terminateTarget.city}) será encerrada e o dispositivo precisará
            fazer login novamente.
          </p>
        )}
      </AwModal>

      {/* Modal — encerrar todas */}
      <AwModal
        open={terminateAllOpen}
        onClose={() => setTerminateAllOpen(false)}
        title="Encerrar todas as outras sessões?"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setTerminateAllOpen(false)}
            >
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="danger"
              onClick={confirmTerminateAll}
            >
              Encerrar {otherCount} sessã{otherCount === 1 ? "o" : "ões"}
            </AwButton>
          </>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary)">
          {otherCount} outro{otherCount !== 1 ? "s" : ""} dispositivo
          {otherCount !== 1 ? "s" : ""}{" "}
          {otherCount !== 1 ? "serão desconectados" : "será desconectado"} e
          precisarão fazer login novamente. Sua sessão atual permanece ativa.
        </p>
      </AwModal>
    </div>
  );
}
