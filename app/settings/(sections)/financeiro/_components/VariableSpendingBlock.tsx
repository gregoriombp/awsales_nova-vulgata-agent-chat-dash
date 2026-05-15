"use client";

import * as React from "react";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import {
  brl,
  CAMPAIGN_BREAKDOWN,
  DAILY_SPENDING,
  OVERVIEW_KPIS,
  SERVICE_BREAKDOWN,
  SPENDING_CATEGORIES,
  type SpendingGrouping,
} from "./data";

const PERIODS = [
  { id: "today", label: "Hoje" },
  { id: "this-month", label: "Este mês" },
  { id: "last-30", label: "Últimos 30 dias" },
  { id: "last-90", label: "Últimos 90 dias" },
];

export function VariableSpendingBlock() {
  const [grouping, setGrouping] = React.useState<SpendingGrouping>("service");
  const [periodId, setPeriodId] = React.useState("this-month");

  const period = PERIODS.find((p) => p.id === periodId) ?? PERIODS[1];
  const categories = SPENDING_CATEGORIES[grouping];
  const daily = DAILY_SPENDING[grouping];

  return (
    <AwCard className="!p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon name="bar_chart" size={18} className="text-[var(--fg-tertiary)]" />
          <p className="m-0 body-sm font-semibold text-[var(--fg-primary)]">
            Gastos variáveis
          </p>
        </div>
        <AwDropdownMenu
          align="end"
          trigger={<AwSelect>{period.label}</AwSelect>}
          items={PERIODS.map((p) => ({
            id: p.id,
            label: p.label,
            checked: p.id === periodId,
            onSelect: () => setPeriodId(p.id),
          }))}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
        <SegmentedToggle
          options={[
            { value: "service", label: "Serviço" },
            { value: "campaign", label: "Campanha" },
          ]}
          value={grouping}
          onChange={setGrouping}
        />
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
          Acumulado no período:{" "}
          <strong className="text-[var(--fg-primary)]">
            {brl(OVERVIEW_KPIS.accumulated)}
          </strong>
        </p>
      </div>

      <div className="px-6 pb-3">
        <StackedBarChart data={daily} categories={categories} />
      </div>

      <Legend categories={categories} />

      <div className="border-t border-[var(--border-subtle)]">
        {grouping === "service" ? <ServiceTable /> : <CampaignTable />}
      </div>
    </AwCard>
  );
}

/* ---------- segmented toggle ---------- */

function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Agrupar gastos variáveis"
      className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={
              "rounded-[var(--radius-sm)] px-3 py-1 body-xs font-medium transition-colors duration-aw-fast " +
              (active
                ? "bg-[var(--bg-raised)] text-[var(--fg-primary)] shadow-[var(--shadow-xs)]"
                : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- chart ---------- */

function StackedBarChart({
  data,
  categories,
}: {
  data: number[][];
  categories: { id: string; label: string; colorVar: string }[];
}) {
  const days = data.length;
  const totals = data.map((d) => d.reduce((a, b) => a + b, 0));
  const max = Math.max(...totals, 1);

  // viewBox-aware: 100% width, 220 height. Margins for axis-ish breathing room.
  const W = 100;
  const H = 220;
  const padX = 2;
  const padY = 16;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const gap = 0.35; // % of bar width
  const slot = usableW / days;
  const barW = slot * (1 - gap);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de gastos diários por categoria"
        className="block h-[220px] w-full"
      >
        {data.map((day, i) => {
          const x = padX + slot * i + (slot - barW) / 2;
          let yCursor = padY + usableH;
          const totalH = (totals[i] / max) * usableH;
          let stacked = 0;
          return (
            <g key={i}>
              {/* baseline guide for empty bars */}
              <line
                x1={x + barW / 2}
                x2={x + barW / 2}
                y1={padY + usableH}
                y2={padY + usableH - totalH}
                stroke="var(--border-subtle)"
                strokeWidth={0.1}
              />
              {day.map((value, c) => {
                const segH = (value / max) * usableH;
                stacked += segH;
                const y = padY + usableH - stacked;
                return (
                  <rect
                    key={c}
                    x={x}
                    y={y}
                    width={barW}
                    height={segH}
                    fill={categories[c]?.colorVar ?? "var(--aw-gray-500)"}
                  >
                    <title>
                      {`Dia ${i + 1} · ${categories[c]?.label}: ${brl(value)}`}
                    </title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        Distribuição diária dos gastos variáveis no período selecionado.
      </figcaption>
    </figure>
  );
}

function Legend({
  categories,
}: {
  categories: { id: string; label: string; colorVar: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border-subtle)] px-6 py-3">
      {categories.map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center gap-1.5 body-xs text-[var(--fg-secondary)]"
        >
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ background: c.colorVar }}
          />
          {c.label}
        </span>
      ))}
    </div>
  );
}

/* ---------- tables ---------- */

function ServiceTable() {
  const total = SERVICE_BREAKDOWN.reduce((s, r) => s + r.total, 0);
  return (
    <AwTable>
      <thead>
        <tr>
          <th>Serviço</th>
          <th>Quantidade</th>
          <th>Unitário</th>
          <th className="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {SERVICE_BREAKDOWN.map((r) => (
          <tr key={r.id}>
            <td>
              <span className="inline-flex items-center gap-2">
                <Icon
                  name={r.icon}
                  size={14}
                  className="text-[var(--fg-tertiary)]"
                />
                {r.label}
              </span>
            </td>
            <td>{r.quantity}</td>
            <td>{r.unitPrice}</td>
            <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
              {brl(r.total)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="text-right text-[var(--fg-secondary)]">
            Total
          </td>
          <td className="text-right font-semibold tabular-nums text-[var(--fg-primary)]">
            {brl(total)}
          </td>
        </tr>
      </tfoot>
    </AwTable>
  );
}

function CampaignTable() {
  const total = CAMPAIGN_BREAKDOWN.reduce((s, r) => s + r.total, 0);
  return (
    <AwTable>
      <thead>
        <tr>
          <th>Campanha</th>
          <th>Tipo</th>
          <th>Status</th>
          <th className="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {CAMPAIGN_BREAKDOWN.map((r) => (
          <tr key={r.id}>
            <td>{r.label}</td>
            <td>{r.type}</td>
            <td>
              <AwPill
                variant={
                  r.status === "Ativa"
                    ? "live"
                    : r.status === "Pausada"
                    ? "draft"
                    : "neutral"
                }
              >
                {r.status}
              </AwPill>
            </td>
            <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
              {brl(r.total)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="text-right text-[var(--fg-secondary)]">
            Total
          </td>
          <td className="text-right font-semibold tabular-nums text-[var(--fg-primary)]">
            {brl(total)}
          </td>
        </tr>
      </tfoot>
    </AwTable>
  );
}
