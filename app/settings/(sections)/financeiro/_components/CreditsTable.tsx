"use client";

import { AwButton } from "@/components/ui/AwButton";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import {
  brl,
  COUPONS_APPLIED,
  VOUCHERS,
  type CouponRow,
  type VoucherRow,
} from "./data";

type UnifiedRow =
  | ({ kind: "voucher" } & VoucherRow)
  | ({ kind: "coupon" } & CouponRow);

function unifiedRows(): UnifiedRow[] {
  const vouchers = VOUCHERS.map<UnifiedRow>((v) => ({ kind: "voucher", ...v }));
  const coupons = COUPONS_APPLIED.map<UnifiedRow>((c) => ({
    kind: "coupon",
    ...c,
  }));
  return [...vouchers, ...coupons];
}

function typePillVariant(kind: UnifiedRow["kind"]): AwPillVariant {
  return kind === "voucher" ? "live" : "beta";
}

function typeLabel(kind: UnifiedRow["kind"]): string {
  return kind === "voucher" ? "Voucher" : "Cupom";
}

export function CreditsTable() {
  const rows = unifiedRows();

  return (
    <AwTable>
      <thead>
        <tr>
          <th>Tipo &amp; nome</th>
          <th>Status</th>
          <th className="text-right">Valor</th>
          <th>Consumo</th>
          <th className="text-right">Restante / desconto</th>
          <th>Vigência</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) =>
          row.kind === "voucher" ? (
            <VoucherTableRow key={`v-${row.id}`} row={row} />
          ) : (
            <CouponTableRow key={`c-${row.id}`} row={row} />
          ),
        )}
      </tbody>
    </AwTable>
  );
}

function TypeNameCell({
  kind,
  name,
  meta,
  warning,
}: {
  kind: UnifiedRow["kind"];
  name: string;
  meta: string;
  warning?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <AwPill variant={typePillVariant(kind)} dot={false}>
          {typeLabel(kind)}
        </AwPill>
        <span className="font-medium text-[var(--fg-primary)]">{name}</span>
      </div>
      <span className="body-xs text-[var(--fg-tertiary)]">{meta}</span>
      {warning && (
        <span className="mt-0.5 inline-flex items-center gap-1.5 body-xs text-[var(--accent-warning)]">
          <Icon name="warning" size={13} />
          {warning}
        </span>
      )}
    </div>
  );
}

function VoucherTableRow({ row }: { row: VoucherRow & { kind: "voucher" } }) {
  const pct = row.total > 0 ? Math.round((row.consumed / row.total) * 100) : 0;
  const remaining = row.total - row.consumed;
  const progressVariant = row.acceleratedConsumption ? "warning" : "default";

  return (
    <tr>
      <td>
        <TypeNameCell
          kind="voucher"
          name={row.description}
          meta={`Aplica em: ${row.applicableTo}`}
          warning={
            row.acceleratedConsumption
              ? "Consumo 2,3× acima do previsto"
              : undefined
          }
        />
      </td>
      <td>
        <AwPill variant={row.status === "Ativo" ? "live" : "neutral"}>
          {row.status}
        </AwPill>
      </td>
      <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
        {brl(row.total)}
      </td>
      <td>
        <div className="min-w-[180px]">
          <AwProgress
            value={pct}
            max={100}
            variant={progressVariant}
            valueLabel={`${pct}% · ${brl(row.consumed)} de ${brl(row.total)}`}
          />
        </div>
      </td>
      <td className="text-right tabular-nums text-[var(--fg-primary)]">
        {brl(remaining)}
      </td>
      <td className="text-[var(--fg-secondary)]">{row.expiresAt}</td>
      <td className="text-right">
        <AwButton size="sm" variant="ghost" iconRight="arrow_forward">
          Ver
        </AwButton>
      </td>
    </tr>
  );
}

function CouponTableRow({ row }: { row: CouponRow & { kind: "coupon" } }) {
  return (
    <tr>
      <td>
        <TypeNameCell
          kind="coupon"
          name={row.description}
          meta={`Código ${row.code} · ${row.application}`}
        />
      </td>
      <td>
        <AwPill variant="neutral">Aplicado</AwPill>
      </td>
      <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
        {brl(row.discount)}
      </td>
      <td>
        <span className="body-xs text-[var(--fg-secondary)]">
          Aplicado em{" "}
          <span className="text-[var(--fg-primary)]">{row.invoiceId}</span>
        </span>
      </td>
      <td className="text-right font-medium tabular-nums text-[var(--accent-success)]">
        −{brl(row.discount)}
      </td>
      <td className="text-[var(--fg-secondary)]">{row.appliedAt}</td>
      <td className="text-right">
        <AwButton size="sm" variant="ghost" iconRight="arrow_forward">
          Ver
        </AwButton>
      </td>
    </tr>
  );
}
