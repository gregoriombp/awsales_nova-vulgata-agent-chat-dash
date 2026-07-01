"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { AwLogo } from "@/components/ui/AwLogo";
import { Icon } from "@/components/ui/Icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useConsumo, type DisparosFilter } from "./ConsumoContext";
import { ALL_CHANNELS, SPEND_CHANNELS } from "./channels-model";
import type { ProviderId } from "./explorer-model";

/* ----------------------------------------------------------------------------
 * Hub de filtros do consumo — destino (Aswork/Meta), canais e disparos num
 * popover só (regra do Greg: todo dado novo no analytics ganha o filtro
 * correspondente — cmt-f014416f + cmt-33a8d4dd). Substitui o dropdown avulso
 * de destino na topbar do explorador e entra igual na Visão geral.
 * ------------------------------------------------------------------------- */

const DISPAROS_OPTIONS: { value: DisparosFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "mkt", label: "Só marketing" },
  { value: "util", label: "Só utilidade" },
  { value: "none", label: "Sem disparos" },
];

export function FilterHub() {
  const {
    payers,
    selectPayers,
    channels,
    toggleChannel,
    disparosFilter,
    setDisparosFilter,
  } = useConsumo();
  const [open, setOpen] = React.useState(false);

  const payerMode = payers.has("meta") ? "all" : "aswork";
  // Quantos filtros estão fora do padrão — vira o badge do gatilho.
  const activeCount =
    (payerMode !== "all" ? 1 : 0) +
    (channels.size < ALL_CHANNELS.length ? 1 : 0) +
    (disparosFilter !== "all" ? 1 : 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Filtros do consumo"
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--bg-raised) px-3.5 body-sm font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover)"
        >
          <Icon name="filter_list" size={16} className="text-(--fg-tertiary)" />
          Filtros
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-(--fg-primary) px-1 text-3xs font-semibold text-(--fg-on-inverse)">
              {activeCount}
            </span>
          )}
          <Icon name="expand_more" size={16} className="text-(--fg-tertiary)" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="flex w-80 flex-col gap-4 border border-(--border-subtle) bg-(--bg-raised) p-4 shadow-lg"
      >
        {/* Destino do pagamento */}
        <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
          <legend className="mb-1 aw-eyebrow text-(--fg-tertiary)">Destino do pagamento</legend>
          <DestinoRow
            checked={payerMode === "aswork"}
            onSelect={() => selectPayers(["aswork"] as ProviderId[])}
            label="Aswork"
            leading={<AwLogo variant="mark" height={13} className="text-(--aw-blue-500)" />}
          />
          <DestinoRow
            checked={payerMode === "all"}
            onSelect={() => selectPayers(["aswork", "meta"] as ProviderId[])}
            label="Aswork e Meta"
            leading={
              <span className="inline-flex items-center">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--bg-raised) ring-1 ring-(--border-subtle)">
                  <AwLogo variant="mark" height={11} className="text-(--aw-blue-500)" />
                </span>
                <span className="-ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--bg-raised) ring-1 ring-(--border-subtle)">
                  <AwBrandLogo brand="meta" size={12} markOnly />
                </span>
              </span>
            }
          />
        </fieldset>

        {/* Canais */}
        <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
          <legend className="mb-1 aw-eyebrow text-(--fg-tertiary)">Canais</legend>
          {SPEND_CHANNELS.map((c) => {
            const active = channels.has(c.id);
            const lastActive = active && channels.size === 1;
            return (
              <label
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-aw-fast hover:bg-(--bg-hover)",
                  lastActive && "cursor-not-allowed opacity-90",
                )}
                title={lastActive ? "Pelo menos um canal fica ativo" : undefined}
              >
                <AwCheckbox
                  checked={active}
                  onChange={() => toggleChannel(c.id)}
                  label={c.label}
                  disabled={lastActive}
                />
                <AwChannelIcon channel={c.id} size={18} />
                <span className="body-sm text-(--fg-primary)">{c.label}</span>
              </label>
            );
          })}
        </fieldset>

        {/* Disparos */}
        <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
          <legend className="mb-1 aw-eyebrow text-(--fg-tertiary)">Disparos</legend>
          <div className="grid grid-cols-2 gap-1.5">
            {DISPAROS_OPTIONS.map((opt) => {
              const active = disparosFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDisparosFilter(opt.value)}
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-lg border px-3 body-sm font-medium transition-colors duration-aw-fast",
                    active
                      ? "border-(--border-strong) bg-(--bg-muted) text-(--fg-primary)"
                      : "border-(--border-subtle) text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </PopoverContent>
    </Popover>
  );
}

function DestinoRow({
  checked,
  onSelect,
  label,
  leading,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  leading: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left body-sm transition-colors duration-aw-fast",
        checked
          ? "bg-(--bg-muted) font-medium text-(--fg-primary)"
          : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
      )}
    >
      <span className="inline-flex w-9 shrink-0 items-center justify-center">{leading}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {checked && <Icon name="check" size={15} className="shrink-0 text-(--fg-primary)" />}
    </button>
  );
}
