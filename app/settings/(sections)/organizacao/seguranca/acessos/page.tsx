"use client";

import * as React from "react";
import Link from "next/link";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwBrowserIcon } from "@/components/ui/AwBrowserIcon";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";
import { SettingsPageHeader } from "../../../_components/shared";

type Access = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  device: string;
  location: string;
  ip: string;
  lastUsed: string;
  otherOrgs: number;
  stale?: boolean;
};

const INITIAL: Access[] = [
  {
    id: "a1",
    name: "Felipe Rezende",
    email: "felipe.rezende@fyntra.com",
    avatar: "/assets/ui-faces/male-2.jpg",
    device: "Chrome · macOS",
    location: "São Paulo · SP",
    ip: "189.45.x.x",
    lastUsed: "agora",
    otherOrgs: 2,
  },
  {
    id: "a2",
    name: "Ana Cavalcante",
    email: "ana.cavalcante@fyntra.com",
    avatar: "/assets/ui-faces/female-2.jpg",
    device: "Safari · iOS",
    location: "São Paulo · SP",
    ip: "177.99.x.x",
    lastUsed: "há 3 h",
    otherOrgs: 0,
  },
  {
    id: "a3",
    name: "Carlos Lima",
    email: "carlos.lima@fyntra.com",
    avatar: "/assets/ui-faces/male-7.jpg",
    device: "Chrome · Windows",
    location: "Curitiba · PR",
    ip: "200.142.x.x",
    lastUsed: "há 2 dias",
    otherOrgs: 1,
  },
  {
    id: "a4",
    name: "Mariana Castro",
    email: "mariana.castro@fyntra.com",
    avatar: "/assets/ui-faces/female-3.jpg",
    device: "Edge · Windows",
    location: "Rio de Janeiro · RJ",
    ip: "186.220.x.x",
    lastUsed: "há 38 dias",
    otherOrgs: 0,
    stale: true,
  },
];

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export default function AcessosOrgPage() {
  const [rows, setRows] = React.useState(INITIAL);
  const [query, setQuery] = React.useState("");
  const [relogout, setRelogout] = React.useState<Access | null>(null);
  const [revoke, setRevoke] = React.useState<Access | null>(null);
  const [reloginAll, setReloginAll] = React.useState(false);

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <div className="mb-6">
        <AwButton asChild size="sm" variant="ghost" iconLeft="arrow_back">
          <Link href="/settings/organizacao/seguranca">Segurança & acesso</Link>
        </AwButton>
      </div>

      <SettingsPageHeader
        title="Acessos à organização"
        description="Quem está com acesso ativo agora. As ações aqui valem só para esta organização."
        trailing={
          <AwButton
            size="sm"
            variant="danger"
            iconLeft="restart_alt"
            onClick={() => setReloginAll(true)}
          >
            Forçar relogin de todos
          </AwButton>
        }
      />

      {/* Boundary */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-(--aw-blue-200) bg-(--aw-blue-100) px-4 py-3">
        <Icon name="info" size={18} className="mt-px shrink-0 text-(--aw-blue-700)" />
        <p className="m-0 body-xs text-(--aw-blue-800)">
          Encerrar ou revogar um acesso aqui afeta só a {ONBOARDING_ORG.name}. A
          pessoa continua conectada nas outras organizações onde tem acesso, e a
          conta global não é desconectada.
        </p>
      </div>

      <div className="mb-4 max-w-[360px]">
        <AwInput
          iconLeft="search"
          placeholder="Buscar por nome ou e-mail…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <AwCard className="p-0!">
        <ul className="m-0 list-none divide-y divide-(--border-subtle) p-0">
          {filtered.map((r) => (
            <li key={r.id} className="m-0 flex items-center gap-4 px-6 py-4">
              <AwAvatar size="md" src={r.avatar} alt={r.name} initials={getInitials(r.name)} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="m-0 body-sm font-medium text-(--fg-primary)">
                    {r.name}
                  </p>
                  {r.otherOrgs > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-(--border-subtle) bg-(--bg-muted) px-2 py-0.5 body-xs font-medium text-(--fg-tertiary)">
                      <Icon name="apartment" size={11} />+{r.otherOrgs} org{r.otherOrgs > 1 ? "s" : ""}
                    </span>
                  )}
                  {r.stale && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-(--aw-amber-300) bg-(--aw-amber-100) px-2 py-0.5 body-xs font-medium text-(--aw-amber-800)">
                      <Icon name="schedule" size={11} />
                      sem uso
                    </span>
                  )}
                </div>
                <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                  {r.email}
                </p>
              </div>

              <div className="hidden min-w-0 items-center gap-2.5 md:flex">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-raised)">
                  <AwBrowserIcon browser={r.device.split(" · ")[0]} size={18} />
                </span>
                <div className="flex min-w-0 flex-col items-start gap-0.5">
                  <span className="body-xs text-(--fg-secondary)">{r.device}</span>
                  <span className="body-xs tabular-nums text-(--fg-tertiary)">
                    {r.location} · {r.ip}
                  </span>
                </div>
              </div>

              <span className="hidden w-24 shrink-0 text-right body-xs tabular-nums text-(--fg-secondary) lg:block">
                {r.lastUsed}
              </span>

              <AwDropdownMenu
                align="end"
                trigger={
                  <AwButton
                    size="sm"
                    variant="ghost"
                    iconOnly="more_vert"
                    aria-label={`Ações para ${r.name}`}
                  />
                }
                items={[
                  {
                    id: "relogout",
                    label: "Forçar relogout desta org",
                    icon: "logout",
                    onSelect: () => setRelogout(r),
                  },
                  { id: "sep", separator: true },
                  {
                    id: "revoke",
                    label: "Revogar acesso à org",
                    icon: "person_remove",
                    danger: true,
                    onSelect: () => setRevoke(r),
                  },
                ]}
              />
            </li>
          ))}
        </ul>
        <div className="border-t border-(--border-subtle) px-6 py-3">
          <p className="m-0 body-xs text-(--fg-tertiary)">
            {filtered.length} pessoa{filtered.length === 1 ? "" : "s"} com acesso
            ativo.
          </p>
        </div>
      </AwCard>

      {/* Modal — relogout individual */}
      <RelogoutModal
        access={relogout}
        onClose={() => setRelogout(null)}
        onConfirm={() => {
          if (relogout) setRows((rs) => rs.filter((x) => x.id !== relogout.id));
          setRelogout(null);
        }}
      />

      {/* Modal — revogar */}
      <RevokeModal
        access={revoke}
        onClose={() => setRevoke(null)}
        onConfirm={() => {
          if (revoke) setRows((rs) => rs.filter((x) => x.id !== revoke.id));
          setRevoke(null);
        }}
      />

      {/* Modal — forçar relogin de todos */}
      <ReloginAllModal
        open={reloginAll}
        count={rows.length}
        onClose={() => setReloginAll(false)}
        onConfirm={() => setReloginAll(false)}
      />
    </div>
  );
}

function RelogoutModal({
  access,
  onClose,
  onConfirm,
}: {
  access: Access | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [reason, setReason] = React.useState("");
  React.useEffect(() => {
    if (access) setReason("");
  }, [access]);

  return (
    <AwModal
      open={access !== null}
      onClose={onClose}
      title={access ? `Forçar relogout de ${access.name.split(" ")[0]}?` : undefined}
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton size="sm" variant="primary" onClick={onConfirm}>
            Forçar relogout
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 body-sm text-(--fg-secondary)">
          Encerra o acesso desta pessoa a esta organização. Ela continua
          conectada nas outras organizações e precisará entrar de novo só aqui.
        </p>
        <AwInput
          placeholder="Motivo (opcional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </AwModal>
  );
}

function RevokeModal({
  access,
  onClose,
  onConfirm,
}: {
  access: Access | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [reason, setReason] = React.useState("");
  React.useEffect(() => {
    if (access) setReason("");
  }, [access]);
  const valid = reason.trim().length >= 10;

  return (
    <AwModal
      open={access !== null}
      onClose={onClose}
      title={access ? `Revogar acesso de ${access.name.split(" ")[0]}?` : undefined}
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton size="sm" variant="danger" disabled={!valid} onClick={onConfirm}>
            Revogar acesso
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 body-sm text-(--fg-secondary)">
          Remove o vínculo da pessoa com esta organização. Para voltar a operar
          aqui, ela vai precisar de um novo convite. Outras organizações não são
          afetadas.
        </p>
        <div>
          <AwInput
            placeholder="Motivo (mínimo 10 caracteres)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <p className="m-0 mt-1.5 body-xs text-(--fg-tertiary)">
            Fica registrado no histórico da organização.
          </p>
        </div>
      </div>
    </AwModal>
  );
}

function ReloginAllModal({
  open,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmName, setConfirmName] = React.useState("");
  const [reason, setReason] = React.useState("");
  React.useEffect(() => {
    if (open) {
      setConfirmName("");
      setReason("");
    }
  }, [open]);
  const nameOk =
    confirmName.trim().toLowerCase() === ONBOARDING_ORG.name.toLowerCase();
  const valid = nameOk && reason.trim().length >= 10;

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Forçar relogin de todos na organização?"
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton size="sm" variant="danger" disabled={!valid} onClick={onConfirm}>
            Forçar relogin
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="m-0 body-sm text-(--fg-secondary)">
          Encerra o acesso de{" "}
          <strong className="font-medium text-(--fg-primary)">
            {count} pessoas
          </strong>{" "}
          a esta organização — inclusive o seu. Todo mundo terá que entrar de
          novo. A conta global e as outras organizações não são afetadas.
        </p>
        <AwField
          label={`Digite "${ONBOARDING_ORG.name}" para confirmar`}
          htmlFor="confirm-org"
        >
          <AwInput
            id="confirm-org"
            autoComplete="off"
            placeholder={ONBOARDING_ORG.name}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
          />
        </AwField>
        <AwField label="Motivo (mínimo 10 caracteres)" htmlFor="relogin-reason">
          <AwInput
            id="relogin-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </AwField>
      </div>
    </AwModal>
  );
}
