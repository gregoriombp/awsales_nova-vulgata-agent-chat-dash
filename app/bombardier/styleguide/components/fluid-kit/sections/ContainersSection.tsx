"use client"

import * as React from "react"
import { Section, Stage } from "../../../_primitives"
import { Badge, type BadgeColor } from "@/components/ui/fluid/badge"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/fluid/accordion"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/fluid/dialog"
import { Dropdown, DropdownLabel, DropdownSeparator } from "@/components/ui/fluid/dropdown"
import { MenuItem } from "@/components/ui/fluid/menu-item"
import { Button } from "@/components/ui/fluid/button"

const BADGE_COLORS: BadgeColor[] = [
  "gray",
  "red",
  "amber",
  "lime",
  "emerald",
  "teal",
  "blue",
  "purple",
  "pink",
  "slate",
]

// Inicial maiúscula no rótulo de cada cor (gray → Gray), como o Greg pediu.
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Quantidade de conversas do exemplo de confirmação — fonte única para o título
// e a ação, em vez de cravar "12" no meio da frase.
const ARCHIVE_COUNT = 12

export function ContainersSection() {
  return (
    <div className="flex flex-col gap-16">
      {/* ── Badge ─────────────────────────────────────────────── */}
      <Section
        id="fluid-badge"
        title="Badge"
        lead="Rótulo de status em duas variantes — solid, com fundo tingido pela família de cor, e dot, neutra com ponto colorido. Dez famílias da escala aw, três tamanhos."
      >
        <div className="flex flex-col gap-4">
          <Stage label="solid" hint="cor a 15% sobre a superfície · texto sempre fg-primary">
            {BADGE_COLORS.map((color) => (
              <Badge key={color} variant="solid" color={color}>
                {titleCase(color)}
              </Badge>
            ))}
          </Stage>

          <Stage label="dot" hint="borda neutra · o ponto carrega a cor">
            {BADGE_COLORS.map((color) => (
              <Badge key={color} variant="dot" color={color}>
                {titleCase(color)}
              </Badge>
            ))}
          </Stage>

          <Stage label="tamanhos" hint="sm · md · lg — o ponto acompanha a escala">
            <Badge variant="solid" size="sm" color="slate">
              Qualificado
            </Badge>
            <Badge variant="solid" size="md" color="slate">
              Em negociação
            </Badge>
            <Badge variant="solid" size="lg" color="slate">
              Proposta enviada
            </Badge>
            <Badge variant="dot" size="sm" color="slate">
              Qualificado
            </Badge>
            <Badge variant="dot" size="md" color="slate">
              Em negociação
            </Badge>
            <Badge variant="dot" size="lg" color="slate">
              Proposta enviada
            </Badge>
          </Stage>
        </div>
      </Section>

      {/* ── Accordion ─────────────────────────────────────────── */}
      <Section
        id="fluid-accordion"
        title="Accordion"
        lead="Conteúdo recolhível com mola na altura e peso da fonte animado no título. Abra um item para ver a transição; o fundo do item aberto permanece destacado."
      >
        <Stage label="single · collapsible" hint="um item aberto por vez">
          <Accordion type="single" collapsible className="w-96">
            <AccordionItem value="memory-base">
              <AccordionTrigger>Memory Base</AccordionTrigger>
              <AccordionContent>
                O agente consulta a Memory Base antes de responder, usando o
                contexto e o vocabulário da sua operação para manter as
                respostas consistentes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="transbordo">
              <AccordionTrigger>Transbordo para humanos</AccordionTrigger>
              <AccordionContent>
                Quando a conversa exige uma pessoa, o agente transfere o
                atendimento com o histórico completo — ninguém precisa pedir
                para o cliente repetir nada.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="auditoria">
              <AccordionTrigger>Histórico e auditoria</AccordionTrigger>
              <AccordionContent>
                Cada decisão do agente fica registrada para a equipe revisar
                depois, com data, canal e o trecho da conversa que motivou a
                ação.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Stage>
      </Section>

      {/* ── Dialog ────────────────────────────────────────────── */}
      <Section
        id="fluid-dialog"
        title="Dialog"
        lead="Janela modal sobre overlay escurecido, com entrada e saída em spring. Fecha pelo botão de ação, pelo X ou pela tecla Esc."
      >
        <Stage label="confirmação" hint="título · descrição · ações no rodapé">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Arquivar conversas</Button>
            </DialogTrigger>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Arquivar {ARCHIVE_COUNT} conversas?</DialogTitle>
                <DialogDescription>
                  As conversas saem da caixa de entrada, mas continuam
                  disponíveis na busca e nos relatórios. Você pode
                  restaurá-las quando quiser.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="tertiary">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="primary">Arquivar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Stage>
      </Section>

      {/* ── Dropdown ──────────────────────────────────────────── */}
      <Section
        id="fluid-dropdown"
        title="Dropdown"
        lead="Menu de ações com hover por proximidade — o fundo desliza entre os itens em vez de piscar. Suporta ícones, separador e item destrutivo."
      >
        <Stage label="menu de ações" hint="5 itens · separador antes da ação destrutiva">
          <Dropdown className="w-64">
            <DropdownLabel>Ações do agente</DropdownLabel>
            <MenuItem index={0} icon="content_copy" label="Duplicar agente" />
            <MenuItem index={1} icon="edit" label="Renomear" />
            <MenuItem index={2} icon="ios_share" label="Exportar configuração" />
            <MenuItem index={3} icon="pause_circle" label="Pausar atendimento" />
            <DropdownSeparator />
            <MenuItem index={4} icon="delete" label="Excluir agente" destructive />
          </Dropdown>
        </Stage>
      </Section>
    </div>
  )
}
