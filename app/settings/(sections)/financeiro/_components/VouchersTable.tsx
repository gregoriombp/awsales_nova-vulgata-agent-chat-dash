"use client";

import { AwButton } from "@/components/ui/AwButton";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import { brl, VOUCHERS } from "./data";

export function VouchersTable() {
  return (
    <AwTable>
      <thead>
        <tr>
          <th>Descrição</th>
          <th>Status</th>
          <th className="text-right">Valor</th>
          <th>Consumo</th>
          <th className="text-right">Restante</th>
          <th>Término</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {VOUCHERS.map((v) => {
          const pct = v.total > 0 ? Math.round((v.consumed / v.total) * 100) : 0;
          const remaining = v.total - v.consumed;
          const progressVariant = v.acceleratedConsumption
            ? "warning"
            : "default";

          return (
            <tr key={v.id}>
              <td>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-[var(--fg-primary)]">
                    {v.description}
                  </span>
                  <span className="text-[11.5px] text-[var(--fg-tertiary)]">
                    Aplica em: {v.applicableTo}
                  </span>
                  {v.acceleratedConsumption && (
                    <span className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-[var(--accent-warning)]">
                      <Icon name="warning" size={13} />
                      Consumo 2,3× acima do previsto
                    </span>
                  )}
                </div>
              </td>
              <td>
                <AwPill variant={v.status === "Ativo" ? "live" : "neutral"}>
                  {v.status}
                </AwPill>
              </td>
              <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
                {brl(v.total)}
              </td>
              <td>
                <div className="min-w-[180px]">
                  <AwProgress
                    value={pct}
                    max={100}
                    variant={progressVariant}
                    valueLabel={`${pct}% · ${brl(v.consumed)} de ${brl(
                      v.total,
                    )}`}
                  />
                </div>
              </td>
              <td className="text-right tabular-nums text-[var(--fg-primary)]">
                {brl(remaining)}
              </td>
              <td className="text-[var(--fg-secondary)]">{v.expiresAt}</td>
              <td className="text-right">
                <AwButton size="sm" variant="ghost" iconRight="arrow_forward">
                  Ver
                </AwButton>
              </td>
            </tr>
          );
        })}
      </tbody>
    </AwTable>
  );
}
