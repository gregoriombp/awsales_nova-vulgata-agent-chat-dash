"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { Icon } from "@/components/ui/Icon"
import {
  CHECKPOINT_ABILITY_GROUPS,
  CHECKPOINT_FOLLOWUPS,
  CHECKPOINT_VARIABLES,
} from "./abilities"
import type { Ability, AbilityGroup } from "./types"

function AbilityRow({
  ability,
  onInsert,
}: {
  ability: Ability
  onInsert: (trigger: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onInsert(ability.trigger)}
      className="group flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-bg-muted"
    >
      <span
        className="shrink-0 mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-bg-muted text-fg-secondary group-hover:bg-white"
        style={ability.accent ? { color: ability.accent } : undefined}
      >
        <Icon name={ability.icon ?? "bolt"} size={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-fg-primary">
            {ability.label}
          </span>
          <span className="truncate text-[11px] font-mono text-fg-tertiary">
            {ability.trigger}
          </span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[11.5px] leading-snug text-fg-tertiary">
          {ability.description}
        </span>
      </span>
    </button>
  )
}

function GroupSection({
  group,
  defaultOpen = true,
  onInsert,
}: {
  group: AbilityGroup
  defaultOpen?: boolean
  onInsert: (trigger: string) => void
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const grouped = React.useMemo(() => {
    const map = new Map<string, Ability[]>()
    for (const item of group.items) {
      const key = item.group ?? ""
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    return Array.from(map.entries())
  }, [group.items])

  return (
    <section className="rounded-xl border border-border-subtle bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5"
      >
        <span className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-bg-muted text-fg-secondary">
            <Icon name={group.icon ?? "bolt"} size={14} />
          </span>
          <span className="flex flex-col text-left">
            <span className="text-[13px] font-semibold text-fg-primary">
              {group.title}
            </span>
            {group.description ? (
              <span className="text-[11px] text-fg-tertiary">
                {group.description}
              </span>
            ) : null}
          </span>
        </span>
        <Icon
          name={open ? "expand_less" : "expand_more"}
          size={16}
          className="text-fg-tertiary"
        />
      </button>
      {open && group.items.length > 0 ? (
        <div className="space-y-3 px-2 pb-2">
          {grouped.map(([groupName, items]) => (
            <div key={groupName || "_root"}>
              {groupName ? (
                <p className="px-2 pb-1 text-[10.5px] font-medium uppercase tracking-wider text-fg-tertiary">
                  {groupName}
                </p>
              ) : null}
              <div className="space-y-0.5">
                {items.map((item) => (
                  <AbilityRow key={item.id} ability={item} onInsert={onInsert} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export type CheckpointSidebarProps = {
  onInsertTrigger: (trigger: string) => void
  onInsertVariable: (variable: string) => void
}

export function CheckpointSidebar({
  onInsertTrigger,
  onInsertVariable,
}: CheckpointSidebarProps) {
  return (
    <aside className="flex w-[360px] flex-shrink-0 flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Icon name="bolt" size={14} className="text-fg-tertiary" />
          <h3 className="text-[13px] font-semibold text-fg-primary">
            Habilidades disponíveis
          </h3>
        </div>
        <p className="mb-3 text-[11.5px] leading-snug text-fg-tertiary">
          Habilidades que estão disponíveis para utilização. Digite{" "}
          <span className="rounded bg-bg-muted px-1 py-0.5 font-mono text-fg-primary">
            @
          </span>{" "}
          no checkpoint, para utilizar.
        </p>
        <div className="space-y-3">
          {CHECKPOINT_ABILITY_GROUPS.map((g, idx) => (
            <GroupSection
              key={g.id}
              group={g}
              defaultOpen={idx < 4}
              onInsert={onInsertTrigger}
            />
          ))}
        </div>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-fg-secondary hover:text-fg-primary"
        >
          <Icon name="add" size={14} />
          Adicionar integração
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Icon name="data_object" size={14} className="text-fg-tertiary" />
          <h3 className="text-[13px] font-semibold text-fg-primary">
            Variáveis configuradas
          </h3>
        </div>
        <p className="mb-3 text-[11.5px] leading-snug text-fg-tertiary">
          Variáveis que já estão configuradas. Para utilizar no checkpoint,
          digite {"{{}}"}.
        </p>
        <div className="flex flex-wrap gap-2">
          {CHECKPOINT_VARIABLES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onInsertVariable(v.name)}
              className="rounded-md bg-bg-muted px-2 py-1 font-mono text-[11.5px] text-fg-primary hover:bg-aw-gray-300"
            >
              {`{ } ${v.name}`}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-fg-secondary hover:text-fg-primary"
        >
          <Icon name="add" size={14} />
          Adicionar variável
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <Icon name="reply" size={14} className="text-fg-tertiary" />
          <h3 className="text-[13px] font-semibold text-fg-primary">
            Follow up
          </h3>
          <span className="rounded bg-bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-fg-tertiary">
            Recomendado
          </span>
        </div>
        <p className="mb-3 text-[11.5px] leading-snug text-fg-tertiary">
          Follow-ups ajudam seu agente a retomar conversas automaticamente.
        </p>
        <div className="space-y-2">
          {CHECKPOINT_FOLLOWUPS.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-white px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-bg-muted text-fg-secondary">
                  <Icon name="forum" size={14} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-medium text-fg-primary">
                    {f.name}
                  </span>
                  <span className="truncate text-[11px] text-fg-tertiary">
                    {f.hint}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <AwButton variant="secondary" size="sm">
                  Visualizar
                </AwButton>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-aw-red-600 hover:bg-aw-red-100"
                  aria-label="Remover follow-up"
                >
                  <Icon name="delete" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-fg-secondary hover:text-fg-primary"
        >
          <Icon name="add" size={14} />
          Novo follow-up
        </button>
      </div>
    </aside>
  )
}
