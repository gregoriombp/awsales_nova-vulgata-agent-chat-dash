"use client";

import { AwCard } from "@/components/ui/AwCard";
import { Icon } from "@/components/ui/Icon";

export type KpiItem = {
  id: string;
  icon: string;
  label: string;
  value: string;
  hint?: React.ReactNode;
  /** Slot pra elementos extras (mini-barra, link, etc) abaixo do valor. */
  trailing?: React.ReactNode;
};

export function KpiRow({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <AwCard key={it.id} className="!p-0">
          <div className="flex flex-col gap-2 px-5 py-4">
            <div className="flex items-center gap-2 text-[var(--fg-tertiary)]">
              <Icon name={it.icon} size={16} />
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em]">
                {it.label}
              </p>
            </div>
            <p className="m-0 text-[22px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
              {it.value}
            </p>
            {it.trailing}
            {it.hint && (
              <p className="m-0 text-[12px] leading-[1.45] text-[var(--fg-secondary)]">
                {it.hint}
              </p>
            )}
          </div>
        </AwCard>
      ))}
    </div>
  );
}
