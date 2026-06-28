"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AwBrowserIcon, getBrowserKey } from "@/components/ui/AwBrowserIcon";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { useToast } from "@/components/ui/AwToast";
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
  const toast = useToast();
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [terminateTarget, setTerminateTarget] = useState<Session | null>(null);
  // Etapa de identidade antes do encerramento em massa (ação irreversível
  // que desconecta todos os outros dispositivos de uma vez).
  const [identityOpen, setIdentityOpen] = useState(false);
  const [terminateAllOpen, setTerminateAllOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const secretRef = useRef<HTMLInputElement>(null);

  // Foca o campo assim que a etapa de identidade abre.
  useEffect(() => {
    if (identityOpen) {
      const t = window.setTimeout(() => secretRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [identityOpen]);

  function startTerminateAll() {
    setSecret("");
    setIdentityError(null);
    setIdentityOpen(true);
  }

  function confirmIdentity() {
    // Mock: qualquer valor não vazio é aceito. Sem backend de auth aqui.
    if (!secret.trim()) {
      setIdentityError("Informe a senha ou o código de verificação para continuar.");
      secretRef.current?.focus();
      return;
    }
    setIdentityOpen(false);
    setTerminateAllOpen(true);
  }

  function confirmTerminate() {
    if (!terminateTarget) return;
    const ended = terminateTarget;
    setSessions((s) => s.filter((x) => x.id !== ended.id));
    setTerminateTarget(null);
    toast.push({
      variant: "success",
      title: "Sessão encerrada",
      description: `${ended.browser} no ${ended.os} foi desconectado.`,
    });
  }

  function confirmTerminateAll() {
    const ended = sessions.filter((x) => !x.current).length;
    setSessions((s) => s.filter((x) => x.current));
    setTerminateAllOpen(false);
    setSecret("");
    toast.push({
      variant: "success",
      title: "Outras sessões encerradas",
      description: `${ended} dispositivo${
        ended === 1 ? " foi desconectado" : "s foram desconectados"
      }. Você continua conectado neste.`,
    });
  }

  function toggleExpanded(id: string) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  const otherCount = sessions.filter((s) => !s.current).length;

  // Distinct browser marks present in the sessions, for the header row.
  const distinctBrowsers = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of sessions) {
      const key = getBrowserKey(s.browser);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s.browser);
    }
    return out;
  }, [sessions]);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Sessões ativas"
        description="Dispositivos onde sua conta está logada. Encerre qualquer sessão que não reconhecer."
        trailing={
          otherCount > 0 ? (
            <AwButton
              size="sm"
              variant="secondary"
              iconLeft="logout"
              onClick={startTerminateAll}
            >
              Encerrar todas exceto esta
            </AwButton>
          ) : undefined
        }
      />

      {/* Fileira de ícones dos browsers presentes — melhor visualização */}
      {distinctBrowsers.length > 0 && (
        <div className="-mt-6 mb-8 flex items-center gap-2.5">
          <span className="body-xs text-(--fg-tertiary)">
            Navegadores em uso:
          </span>
          <span className="inline-flex items-center gap-1.5" aria-hidden="true">
            {distinctBrowsers.map((b) => (
              <AwBrowserIcon key={b} browser={b} size={18} />
            ))}
          </span>
        </div>
      )}

      {/* Cards — uma sessão por card, em duas colunas */}
      <div className="grid grid-cols-1 gap-3">
        {sessions.map((s) => {
          const isOpen = !!expanded[s.id];
          const mapsSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
            s.city,
          )}&z=11&output=embed`;
          return (
            <AwCard key={s.id} className="p-0!">
              {/* Topo do card */}
              <div className="flex items-start gap-3.5 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-raised)">
                  <AwBrowserIcon browser={s.browser} size={22} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="m-0 body-sm font-medium text-(--fg-primary) truncate">
                      {s.browser}{" "}
                      <span className="font-normal text-(--fg-secondary)">
                        no {s.os}
                      </span>
                    </p>
                    {s.current && (
                      <AwPill variant="live" dot={false}>
                        Esta sessão
                      </AwPill>
                    )}
                  </div>

                  {/* Metadados */}
                  <dl className="mt-2 grid grid-cols-[auto_1fr_auto_1fr] gap-x-3 gap-y-1.5">
                    <Meta
                      icon={s.deviceType === "mobile" ? "smartphone" : "laptop"}
                      label={s.deviceType === "mobile" ? "Celular" : "Computador"}
                    />
                    <Meta icon="public" label={`${s.ip} · ${s.city}`} />
                    <Meta icon="schedule" label={`Iniciada ${s.startedAt}`} />
                    <Meta icon="bolt" label={`Último uso ${s.lastUsed}`} />
                  </dl>

                </div>

                {/* Ações: encerrar (logout) + ver mapa (chevron, 1 clique) */}
                <div className="flex shrink-0 items-center gap-1">
                  {!s.current && (
                    <button
                      type="button"
                      onClick={() => setTerminateTarget(s)}
                      aria-label={`Encerrar sessão ${s.browser}`}
                      title="Encerrar sessão"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--accent-danger)"
                    >
                      <Icon name="logout" size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(s.id)}
                    aria-expanded={isOpen}
                    aria-label={
                      isOpen ? "Ocultar local estimado" : "Ver local estimado"
                    }
                    title={isOpen ? "Ocultar local estimado" : "Ver local estimado"}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
                  >
                    <Icon
                      name="expand_more"
                      size={20}
                      className={`transition-transform duration-aw-fast ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Embed do mapa — revelado ao expandir */}
              {isOpen && (
                <div className="aw-fade-in border-t border-(--border-subtle) px-5 py-4">
                  <iframe
                    src={mapsSrc}
                    title={`Local estimado de acesso — ${s.city}`}
                    width="100%"
                    height={300}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block w-full rounded-lg border border-(--border-subtle)"
                    style={{ border: 0 }}
                  />
                  <p className="m-0 mt-2 inline-flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
                    <Icon name="info" size={13} />
                    Estimado pelo IP — a posição pode não ser exata.
                  </p>
                </div>
              )}
            </AwCard>
          );
        })}
      </div>

      {/* Contagem */}
      <p className="m-0 mt-4 body-xs text-(--fg-tertiary)">
        {sessions.length} sessã
        {sessions.length === 1 ? "o ativa" : "ões ativas"}.
      </p>

      {/* Etapa de identidade — gate antes do encerramento em massa */}
      <AwModal
        open={identityOpen}
        onClose={() => setIdentityOpen(false)}
        title="Confirme sua identidade"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setIdentityOpen(false)}
            >
              Cancelar
            </AwButton>
            <AwButton size="sm" variant="primary" onClick={confirmIdentity}>
              Confirmar
            </AwButton>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirmIdentity();
          }}
          className="flex flex-col gap-4"
        >
          <p className="m-0 inline-flex items-start gap-2 body-sm text-(--fg-secondary)">
            <Icon
              name="lock"
              size={18}
              className="mt-px shrink-0 text-(--fg-tertiary)"
            />
            <span>
              Isso desconecta todos os seus outros dispositivos na hora.
              Confirme sua identidade para continuar.
            </span>
          </p>
          <AwField
            label="Senha ou código de verificação"
            htmlFor="session-identity"
            error={identityError ?? undefined}
            helper={
              identityError
                ? undefined
                : "Use a senha da conta ou o código de 6 dígitos do app autenticador."
            }
          >
            <AwInput
              id="session-identity"
              ref={secretRef}
              type="password"
              value={secret}
              invalid={!!identityError}
              onChange={(e) => {
                setSecret(e.target.value);
                if (identityError) setIdentityError(null);
              }}
              autoComplete="current-password"
            />
          </AwField>
        </form>
      </AwModal>

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
            <AwButton size="sm" variant="danger" onClick={confirmTerminate}>
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
            <AwButton size="sm" variant="danger" onClick={confirmTerminateAll}>
              Encerrar {otherCount} sessã{otherCount === 1 ? "o" : "ões"}
            </AwButton>
          </>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary)">
          {otherCount === 1
            ? "Outro dispositivo vai ser desconectado e precisa entrar de novo."
            : `${otherCount} outros dispositivos vão ser desconectados e precisam entrar de novo.`}{" "}
          Sua sessão atual continua.
        </p>
      </AwModal>
    </div>
  );
}

/* ===================================================================== *
 * Peças visuais
 * ===================================================================== */

function Meta({ icon, label }: { icon: string; label: string }) {
  return (
    <>
      <dt className="flex items-center">
        <Icon name={icon} size={15} className="text-(--fg-tertiary)" />
      </dt>
      <dd className="m-0 body-xs text-(--fg-secondary) tabular-nums">{label}</dd>
    </>
  );
}
