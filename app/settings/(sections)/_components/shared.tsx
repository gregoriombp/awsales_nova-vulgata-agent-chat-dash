"use client";

import { AwButton } from "@/components/ui/AwButton";
import { AwProgress } from "@/components/ui/AwProgress";

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
};

export const API_KEYS: ApiKey[] = [
  {
    id: "k-prod",
    name: "Produção — backend",
    prefix: "aws_live_8f3a…",
    createdAt: "12 jan 2026",
    lastUsed: "há 4 minutos",
  },
  {
    id: "k-staging",
    name: "Staging",
    prefix: "aws_test_2c91…",
    createdAt: "08 mar 2026",
    lastUsed: "há 2 dias",
  },
];

export type Session = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
};

export const SESSIONS: Session[] = [
  {
    id: "s-1",
    device: "MacBook Pro · Chrome",
    location: "São Paulo, BR",
    lastActive: "agora mesmo",
    current: true,
  },
  {
    id: "s-2",
    device: "iPhone 15 · Safari",
    location: "São Paulo, BR",
    lastActive: "há 2 horas",
  },
  {
    id: "s-3",
    device: "Windows · Firefox",
    location: "Curitiba, BR",
    lastActive: "há 6 dias",
  },
];

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
          {title}
        </h6>
        {description && (
          <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function NotifGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border-subtle)] pb-6 last:border-b-0 last:pb-0">
      <h4 className="m-0 mb-3 mt-6 first:mt-0 text-[var(--fg-primary)] text-base font-medium">
        {label}
      </h4>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export function SaveBar() {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-6 py-3">
      <AwButton size="sm" variant="ghost">
        Cancelar
      </AwButton>
      <AwButton size="sm" variant="primary">
        Salvar alterações
      </AwButton>
    </div>
  );
}

export function UsageMetric({
  label,
  value,
  max,
  valueLabel,
}: {
  label: string;
  value: number;
  max: number;
  valueLabel?: string;
}) {
  const pct = Math.round((value / max) * 100);
  const variant = pct >= 90 ? "danger" : pct >= 70 ? "warning" : "default";
  return (
    <AwProgress
      label={label}
      value={value}
      max={max}
      valueLabel={
        valueLabel ?? `${value.toLocaleString("pt-BR")} / ${max.toLocaleString("pt-BR")}`
      }
      variant={variant}
    />
  );
}

export function SettingsPageHeader({
  title,
  description,
  trailing,
}: {
  title: string;
  description?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <header className="mb-10 flex items-start justify-between gap-6">
      <div className="min-w-0">
        <h3 className="m-0 mb-2 text-[var(--fg-primary)]">
          {title}
        </h3>
        {description && (
          <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
            {description}
          </p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}
