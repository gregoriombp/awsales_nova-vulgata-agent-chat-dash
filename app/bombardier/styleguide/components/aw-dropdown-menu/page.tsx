"use client"

import { useState } from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu"
import { PageHero, Section, Stage } from "../../_primitives"

type SortKey = "name-asc" | "name-desc" | "recent" | "old"

export default function AwDropdownMenuPage() {
  const [sort, setSort] = useState<SortKey>("name-asc")
  const [active, setActive] = useState(true)

  const sortLabel: Record<SortKey, string> = {
    "name-asc": "Nome (A → Z)",
    "name-desc": "Nome (Z → A)",
    recent: "Mais recentes",
    old: "Mais antigas",
  }

  return (
    <>
      <PageHero title="AwDropdownMenu">
        Menu de ações / seleção sobre Radix DropdownMenu. API declarativa:
        passe um <code className="font-mono text-[13px]">trigger</code>{" "}
        (qualquer botão) e um array de{" "}
        <code className="font-mono text-[13px]">items</code> (commands,
        separators, labels). Suporta estado <em>checked</em>,{" "}
        <em>danger</em> e <em>disabled</em> por item.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="estados"
            title="Todos os estados"
            lead="Referência visual de cada tipo de item num único menu: label de seção, comando simples, comando com ícone, item checked, item disabled, separator e comando danger. (O componente não tem submenu.)"
          >
            <Stage label="Um menu com todos os estados">
              <AwDropdownMenu
                trigger={
                  <AwButton variant="secondary" size="md" iconRight="expand_more">
                    Abrir menu
                  </AwButton>
                }
                aria-label="Todos os estados"
                items={[
                  { id: "lbl", isLabel: true, label: "Seção" },
                  { id: "plain", label: "Item simples", onSelect: () => {} },
                  { id: "icon", label: "Item com ícone", icon: "tune", onSelect: () => {} },
                  { id: "checked", label: "Item checked", checked: true, onSelect: () => {} },
                  { id: "disabled", label: "Item disabled", icon: "block", disabled: true, onSelect: () => {} },
                  { id: "sep", separator: true },
                  { id: "danger", label: "Item danger", icon: "delete", danger: true, onSelect: () => {} },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="sort"
            title="Sort menu — items com checked"
            lead="Mostra a opção ativa com um check à direita. Clique fora ou ESC fecha."
          >
            <Stage label={`Atual: ${sortLabel[sort]}`}>
              <AwDropdownMenu
                trigger={
                  <AwButton
                    variant="secondary"
                    size="md"
                    iconLeft="swap_vert"
                  >
                    {sortLabel[sort]}
                  </AwButton>
                }
                aria-label="Ordenar"
                items={[
                  {
                    id: "name-asc",
                    label: "Nome (A → Z)",
                    checked: sort === "name-asc",
                    onSelect: () => setSort("name-asc"),
                  },
                  {
                    id: "name-desc",
                    label: "Nome (Z → A)",
                    checked: sort === "name-desc",
                    onSelect: () => setSort("name-desc"),
                  },
                  {
                    id: "recent",
                    label: "Mais recentes",
                    checked: sort === "recent",
                    onSelect: () => setSort("recent"),
                  },
                  {
                    id: "old",
                    label: "Mais antigas",
                    checked: sort === "old",
                    onSelect: () => setSort("old"),
                  },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="actions"
            title="Action menu — com ícones, separator e danger"
            lead="Padrão de menu de ações de row: trigger com variant subtle (pílula tonal) em size md, comandos com ícone à esquerda, separator entre grupos, comando destrutivo no fim com cor de danger."
          >
            <Stage label="…sem hover label">
              <AwDropdownMenu
                trigger={
                  <AwButton
                    variant="subtle"
                    size="md"
                    iconOnly="more_vert"
                    aria-label="Ações"
                    title="Ações"
                  />
                }
                aria-label="Ações da integração"
                items={[
                  {
                    id: "toggle",
                    label: active ? "Pausar integração" : "Ativar integração",
                    icon: active ? "pause" : "play_arrow",
                    onSelect: () => setActive((v) => !v),
                  },
                  {
                    id: "configure",
                    label: "Configurar",
                    icon: "tune",
                    onSelect: () => {},
                  },
                  { id: "sep-1", separator: true },
                  {
                    id: "disconnect",
                    label: "Desconectar",
                    icon: "link_off",
                    danger: true,
                    onSelect: () => {},
                  },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="grouped"
            title="Com label de grupo"
            lead="Use itens isLabel pra agrupar comandos relacionados sob um cabeçalho upper-tracked."
          >
            <Stage label="Filtro por status">
              <AwDropdownMenu
                trigger={
                  <AwButton
                    variant="secondary"
                    size="md"
                    iconLeft="filter_list"
                  >
                    Filtrar
                  </AwButton>
                }
                items={[
                  { id: "lbl-status", isLabel: true, label: "Status" },
                  { id: "active", label: "Ativas", icon: "check_circle", onSelect: () => {} },
                  { id: "paused", label: "Pausadas", icon: "pause_circle", onSelect: () => {} },
                  { id: "error", label: "Com erro", icon: "report", onSelect: () => {} },
                  { id: "sep", separator: true },
                  { id: "lbl-source", isLabel: true, label: "Origem" },
                  { id: "native", label: "Nativas", onSelect: () => {} },
                  { id: "custom", label: "Personalizadas", onSelect: () => {}, disabled: true },
                ]}
              />
            </Stage>
          </Section>
        </div>
      </div>
    </>
  )
}
