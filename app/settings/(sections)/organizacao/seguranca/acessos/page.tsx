"use client";

import * as React from "react";
import Link from "next/link";
import {
  AwEmpty,
  AwEmptyContent,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwBrowserIcon } from "@/components/ui/AwBrowserIcon";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import {
  AwDropdownMenu,
  type AwDropdownItem,
} from "@/components/ui/AwDropdownMenu";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwSelect } from "@/components/ui/AwSelect";
import { useToast } from "@/components/ui/AwToast";
import { Icon } from "@/components/ui/Icon";
import { ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";
import { SettingsPageHeader } from "../../../_components/shared";

type AccessOrigin = "studio" | "adm";

type Access = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  device: string;
  location: string;
  ip: string;
  lastUsed: string;
  /** Por onde a pessoa está conectada à organização. */
  origin: AccessOrigin;
  /** Quando esta conexão começou — exibido como meta discreta. */
  startedAt: string;
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
    origin: "studio",
    startedAt: "25/05 · 09:14",
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
    origin: "studio",
    startedAt: "27/05 · 14:02",
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
    origin: "adm",
    startedAt: "21/05 · 08:30",
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
    origin: "adm",
    startedAt: "10/04 · 17:45",
    otherOrgs: 0,
    stale: true,
  },
];

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

const ORIGIN_LABEL: Record<AccessOrigin, string> = {
  studio: "Studio",
  adm: "ADM",
};

type OriginFilter = "all" | AccessOrigin;
type StaleFilter = "all" | "stale";

const ORIGIN_OPTIONS: { value: OriginFilter; label: string }[] = [
  { value: "all", label: "Todas as origens" },
  { value: "studio", label: "Studio" },
  { value: "adm", label: "ADM" },
];

const STALE_OPTIONS: { value: StaleFilter; label: string }[] = [
  { value: "all", label: "Qualquer tempo" },
  { value: "stale", label: "Sem uso há 30+ dias" },
];

function OriginBadge({ origin }: { origin: AccessOrigin }) {
  // ADM em laranja (acesso administrativo, mais sensível); Studio neutro.
  if (origin === "adm") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-(--aw-amber-300) bg-(--aw-amber-100) px-2 py-0.5 body-xs font-medium text-(--aw-amber-800)">
        <Icon name="admin_panel_settings" size={11} />
        {ORIGIN_LABEL.adm}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-(--border-subtle) bg-(--bg-muted) px-2 py-0.5 body-xs font-medium text-(--fg-tertiary)">
      <Icon name="dashboard" size={11} />
      {ORIGIN_LABEL.studio}
    </span>
  );
}

export default function AcessosOrgPage() {
  const { push } = useToast();
  const [rows, setRows] = React.useState(INITIAL);
  const [query, setQuery] = React.useState("");
  const [originFilter, setOriginFilter] = React.useState<OriginFilter>("all");
  const [staleFilter, setStaleFilter] = React.useState<StaleFilter>("all");
  const [relogout, setRelogout] = React.useState<Access | null>(null);
  const [revoke, setRevoke] = React.useState<Access | null>(null);
  const [reloginAll, setReloginAll] = React.useState(false);

  const filtered = rows.filter((r) => {
    const matchesQuery =
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.email.toLowerCase().includes(query.toLowerCase());
    const matchesOrigin = originFilter === "all" || r.origin === originFilter;
    const matchesStale = staleFilter === "all" || Boolean(r.stale);
    return matchesQuery && matchesOrigin && matchesStale;
  });

  const hasFilters =
    query.trim().length > 0 || originFilter !== "all" || staleFilter !== "all";
  const staleCount = rows.filter((r) => r.stale).length;

  const clearFilters = () => {
    setQuery("");
    setOriginFilter("all");
    setStaleFilter("all");
  };

  const originLabel =
    ORIGIN_OPTIONS.find((o) => o.value === originFilter)?.label ??
    "Todas as origens";
  const staleLabel =
    STALE_OPTIONS.find((o) => o.value === staleFilter)?.label ??
    "Qualquer tempo";

  const originItems: AwDropdownItem[] = ORIGIN_OPTIONS.map((o) => ({
    id: o.value,
    label: o.label,
    checked: originFilter === o.value,
    onSelect: () => setOriginFilter(o.value),
  }));
  const staleItems: AwDropdownItem[] = STALE_OPTIONS.map((o) => ({
    id: o.value,
    label: o.label,
    checked: staleFilter === o.value,
    onSelect: () => setStaleFilter(o.value),
  }));

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
            Encerrar todos os acessos
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

      {/* Resumo — contagem + antiguidade */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="m-0 body-sm text-(--fg-secondary)">
          <strong className="font-medium tabular-nums text-(--fg-primary)">
            {rows.length}
          </strong>{" "}
          pessoa{rows.length === 1 ? "" : "s"} ·{" "}
          <strong className="font-medium tabular-nums text-(--fg-primary)">
            {rows.length}
          </strong>{" "}
          acesso{rows.length === 1 ? "" : "s"} aberto{rows.length === 1 ? "" : "s"}
        </p>
        {staleCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-(--aw-amber-300) bg-(--aw-amber-100) px-2.5 py-1 body-xs font-medium text-(--aw-amber-800)">
            <Icon name="schedule" size={13} />
            {staleCount} sem uso há 30+ dias
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="max-w-[360px] flex-1 basis-[260px]">
          <AwInput
            iconLeft="search"
            placeholder="Buscar por nome ou e-mail…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <AwDropdownMenu
          align="start"
          aria-label="Filtrar por origem"
          trigger={
            <AwSelect aria-label={`Origem: ${originLabel}`}>
              {originLabel}
            </AwSelect>
          }
          items={originItems}
        />
        <AwDropdownMenu
          align="start"
          aria-label="Filtrar por tempo sem uso"
          trigger={
            <AwSelect aria-label={`Antiguidade: ${staleLabel}`}>
              {staleLabel}
            </AwSelect>
          }
          items={staleItems}
        />
      </div>

      <AwCard className="p-0!">
        {filtered.length === 0 ? (
          <AwEmpty className="px-6 py-14">
            <AwEmptyHeader>
              <AwEmptyMedia variant="icon">
                <Icon
                  name={rows.length === 0 ? "check_circle" : "search_off"}
                  size={24}
                  className={
                    rows.length === 0
                      ? "text-(--accent-success)"
                      : "text-(--fg-tertiary)"
                  }
                />
              </AwEmptyMedia>
              <AwEmptyTitle>
                {rows.length === 0
                  ? "Nenhum acesso aberto"
                  : "Nenhum acesso com esses filtros"}
              </AwEmptyTitle>
              <AwEmptyDescription>
                {rows.length === 0
                  ? "Todo mundo precisará entrar de novo nesta organização."
                  : "Tente outro termo ou ajuste os filtros de origem e tempo sem uso."}
              </AwEmptyDescription>
            </AwEmptyHeader>
            {rows.length > 0 && hasFilters && (
              <AwEmptyContent>
                <AwButton
                  size="sm"
                  variant="secondary"
                  iconLeft="filter_alt_off"
                  onClick={clearFilters}
                >
                  Limpar filtros
                </AwButton>
              </AwEmptyContent>
            )}
          </AwEmpty>
        ) : (
          <>
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
                  <OriginBadge origin={r.origin} />
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

              <div className="hidden w-28 shrink-0 flex-col items-end gap-0.5 lg:flex">
                <span className="body-xs tabular-nums text-(--fg-secondary)">
                  {r.lastUsed}
                </span>
                <span className="body-xs tabular-nums text-(--fg-tertiary)">
                  desde {r.startedAt}
                </span>
              </div>

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
                    label: "Encerrar acesso a esta org",
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
        <div className="flex flex-col gap-1.5 border-t border-(--border-subtle) px-6 py-3">
          <p className="m-0 body-xs text-(--fg-tertiary)">
            {filtered.length} pessoa{filtered.length === 1 ? "" : "s"} com acesso
            ativo.
          </p>
          <p className="m-0 flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
            <Icon name="history" size={13} className="shrink-0" />
            Encerrar ou revogar um acesso fica registrado no histórico da
            organização, com o motivo informado.
          </p>
        </div>
          </>
        )}
      </AwCard>

      {/* Modal — relogout individual */}
      <RelogoutModal
        access={relogout}
        onClose={() => setRelogout(null)}
        onConfirm={() => {
          if (relogout) {
            setRows((rs) => rs.filter((x) => x.id !== relogout.id));
            const first = relogout.name.split(" ")[0];
            push({
              variant: "success",
              title: `Acesso de ${first} a esta organização encerrado.`,
              description:
                relogout.otherOrgs > 0
                  ? `As outras ${relogout.otherOrgs} organização${
                      relogout.otherOrgs > 1 ? "s" : ""
                    } dessa pessoa continuam ativas.`
                  : undefined,
            });
          }
          setRelogout(null);
        }}
      />

      {/* Modal — revogar */}
      <RevokeModal
        access={revoke}
        onClose={() => setRevoke(null)}
        onConfirm={() => {
          if (revoke) {
            setRows((rs) => rs.filter((x) => x.id !== revoke.id));
            const first = revoke.name.split(" ")[0];
            push({
              variant: "success",
              title: `Acesso de ${first} revogado.`,
              description: "Para voltar, vai precisar de um novo convite.",
            });
          }
          setRevoke(null);
        }}
      />

      {/* Modal — forçar relogin de todos */}
      <ReloginAllModal
        open={reloginAll}
        count={rows.length}
        onClose={() => setReloginAll(false)}
        onConfirm={() => {
          const count = rows.length;
          setRows([]);
          push({
            variant: "success",
            title: "Todo mundo precisará entrar de novo nesta organização.",
            description: `${count} acesso${count === 1 ? "" : "s"} encerrado${
              count === 1 ? "" : "s"
            }.`,
          });
          setReloginAll(false);
        }}
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
      title={access ? `Encerrar o acesso de ${access.name.split(" ")[0]}?` : undefined}
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton size="sm" variant="primary" onClick={onConfirm}>
            Encerrar acesso
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
          aqui, vai precisar de um novo convite. Outras organizações não são
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
      title="Encerrar todos os acessos a esta organização?"
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton size="sm" variant="danger" disabled={!valid} onClick={onConfirm}>
            Encerrar todos os acessos
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
