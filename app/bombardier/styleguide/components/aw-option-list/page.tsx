"use client";

import { useState } from "react";
import {
  AwOptionList,
  type AwOptionListOption,
  type AwOptionListSelection,
} from "@/components/ui/AwOptionList";
import { Icon } from "@/components/ui/Icon";
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives";

const CHANNEL_OPTIONS: AwOptionListOption[] = [
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    description: "Mensagens 1:1 com clientes verificados.",
    icon: <Icon name="chat" size={18} />,
  },
  {
    id: "instagram",
    label: "Instagram Direct",
    description: "Inbox + automações nas histórias.",
    icon: <Icon name="photo_camera" size={18} />,
  },
  {
    id: "checkout",
    label: "Custom Checkout",
    description: "Eventos de pedido, pagamento e reembolso.",
    icon: <Icon name="shopping_cart" size={18} />,
  },
  {
    id: "email",
    label: "Email transacional",
    description: "Disparos de pós-venda e recuperação.",
    icon: <Icon name="mail" size={18} />,
    disabled: true,
  },
];

const PLAN_OPTIONS: AwOptionListOption[] = [
  {
    id: "starter",
    label: "Starter",
    description: "Até 1.000 conversas/mês — ideal pra validar.",
  },
  {
    id: "pro",
    label: "Pro",
    description: "Até 10.000 conversas/mês + integrações premium.",
  },
  {
    id: "scale",
    label: "Scale",
    description: "Volume ilimitado, SLA 99.95% e suporte dedicado.",
  },
];

export default function OptionListPage() {
  const [multiValue, setMultiValue] = useState<AwOptionListSelection>([
    "whatsapp",
  ]);
  const [singleValue, setSingleValue] = useState<AwOptionListSelection>("pro");
  const [boundedValue, setBoundedValue] = useState<AwOptionListSelection>([
    "whatsapp",
    "instagram",
  ]);

  return (
    <>
      <PageHero title="Option list">
        Lista de opções para superfícies Tool UI — usada em chamadas de
        ferramenta do agente onde o usuário precisa escolher entre alternativas
        antes do agente continuar. Suporta seleção múltipla, seleção única,
        limites <code className="mono">min/max</code>, descrição, ícone, ações
        customizáveis no rodapé e modo recibo (read-only). Reusa os tokens
        AwSales — sem cores hardcoded.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          {/* ---------- Multi-select ---------- */}
          <Section
            id="multi"
            title="Multi-select (default)"
            lead="Modo padrão. O rodapé mostra Clear / Confirm — Confirm exibe a contagem dinâmica entre parênteses."
          >
            <Stage label="Selecionar canais ativos" gridClassName="p-8 flex">
              <AwOptionList
                id="demo-multi"
                options={CHANNEL_OPTIONS}
                value={multiValue}
                onChange={setMultiValue}
              />
            </Stage>
            <CodeExample>{`<AwOptionList
  id="channels"
  options={CHANNEL_OPTIONS}
  value={selected}
  onChange={setSelected}
/>`}</CodeExample>
          </Section>

          {/* ---------- Single-select ---------- */}
          <Section
            id="single"
            title="Single-select"
            lead='selectionMode="single" — usado para decisões mutuamente exclusivas (planos, regiões, idiomas).'
          >
            <Stage label="Escolher um plano" gridClassName="p-8 flex">
              <AwOptionList
                id="demo-single"
                options={PLAN_OPTIONS}
                selectionMode="single"
                value={singleValue}
                onChange={setSingleValue}
              />
            </Stage>
            <CodeExample>{`<AwOptionList
  id="plan"
  options={PLAN_OPTIONS}
  selectionMode="single"
  value={selected}
  onChange={setSelected}
/>`}</CodeExample>
          </Section>

          {/* ---------- Min / Max selections ---------- */}
          <Section
            id="bounded"
            title="Limites de seleção"
            lead="minSelections trava o Confirm até atingir o piso. maxSelections trava as opções restantes quando o teto é atingido."
          >
            <Stage
              label="Pelo menos 1, no máximo 2"
              hint="minSelections={1} · maxSelections={2}"
              gridClassName="p-8 flex"
            >
              <AwOptionList
                id="demo-bounded"
                options={CHANNEL_OPTIONS}
                value={boundedValue}
                onChange={setBoundedValue}
                minSelections={1}
                maxSelections={2}
              />
            </Stage>
          </Section>

          {/* ---------- Receipt mode ---------- */}
          <Section
            id="receipt"
            title="Modo recibo (choice)"
            lead='Quando "choice" é setado, a lista vira read-only e mostra só os escolhidos. Use no resultado da tool call para confirmar o que foi feito.'
          >
            <Stage
              label="Recibo após decisão"
              hint='choice={["whatsapp", "instagram"]}'
              gridClassName="p-8 flex"
            >
              <AwOptionList
                id="demo-receipt"
                options={CHANNEL_OPTIONS}
                choice={["whatsapp", "instagram"]}
              />
            </Stage>
            <CodeExample>{`// Em um toolkit render:
if (result) {
  return <AwOptionList {...args} choice={result} />
}`}</CodeExample>
          </Section>

          {/* ---------- Custom actions ---------- */}
          <Section
            id="actions"
            title="Ações customizadas"
            lead='O rodapé default é "Clear / Confirm". Substitua via "actions" para qualquer combinação de ações (com variant, ícone, atalho de teclado).'
          >
            <Stage
              label="Cancelar / Pular / Aplicar"
              gridClassName="p-8 flex"
            >
              <AwOptionList
                id="demo-actions"
                options={PLAN_OPTIONS}
                selectionMode="single"
                defaultValue="starter"
                actions={[
                  { id: "cancel", label: "Cancelar", variant: "ghost" },
                  { id: "skip", label: "Pular", variant: "secondary" },
                  {
                    id: "confirm",
                    label: "Aplicar",
                    variant: "default",
                    shortcut: "⏎",
                  },
                ]}
              />
            </Stage>
          </Section>

          {/* ---------- API ---------- */}
          <Section
            id="api"
            title="API"
            lead="Props principais. Tipos completos em components/tool-ui/option-list/schema.ts."
          >
            <ApiTable>
              <PropRow
                prop="id"
                type="string"
                doc="Identificador estável da instância. Usado pra narração e recibo."
              />
              <PropRow
                prop="options"
                type="OptionListOption[]"
                doc="Lista de opções. Cada uma tem id, label, description?, icon?, disabled?."
              />
              <PropRow
                prop="selectionMode"
                type='"multi" | "single"'
                def='"multi"'
                doc="Multi permite N seleções; single substitui a anterior."
              />
              <PropRow
                prop="value / defaultValue"
                type="string | string[] | null"
                doc="Controlado / não controlado. Use defaultValue em payloads de tool."
              />
              <PropRow
                prop="choice"
                type="string | string[] | null"
                doc='Quando setado, vira modo recibo (read-only). Use no resultado.'
              />
              <PropRow
                prop="onChange"
                type="(value) => void"
                doc="Disparado a cada toggle no modo interativo."
              />
              <PropRow
                prop="minSelections"
                type="number"
                def="1"
                doc="Trava Confirm até atingir o piso."
              />
              <PropRow
                prop="maxSelections"
                type="number"
                doc="Trava opções restantes quando o teto é atingido (multi)."
              />
              <PropRow
                prop="actions"
                type="Action[] | ActionsConfig"
                def='Clear + Confirm'
                doc="Sobrescreve o rodapé. Cada ação tem id, label, variant, icon?, shortcut?."
              />
              <PropRow
                prop="onAction"
                type="(actionId, value) => void"
                doc="Roda após o usuário acionar uma ação do rodapé."
              />
              <PropRow
                prop="onBeforeAction"
                type="(actionId, value) => boolean"
                doc="Hook de validação. Retornar false aborta a ação."
              />
            </ApiTable>
          </Section>

          {/* ---------- Notes ---------- */}
          <Section
            id="notes"
            title="Notas"
            lead="Detalhes operacionais e de acessibilidade."
          >
            <ul className="flex flex-col gap-2 text-[13.5px] leading-[1.55] text-(--fg-secondary)">
              <li>
                <strong className="text-(--fg-primary)">
                  Acessibilidade:
                </strong>{" "}
                listbox roving tabindex (↑/↓ navega, Home/End extremos, Enter/Espaço
                toggla, Esc limpa). aria-multiselectable reflete o
                selectionMode.
              </li>
              <li>
                <strong className="text-(--fg-primary)">
                  Container queries:
                </strong>{" "}
                a lista usa @container/option-list para encolher fonte e
                ajustar padding em containers menores.
              </li>
              <li>
                <strong className="text-(--fg-primary)">
                  Tool UI surface:
                </strong>{" "}
                exporta SerializableOptionListSchema (Zod) +
                parseSerializableOptionList para validar payloads vindos do
                LLM. value (controlado) é excluído do schema serializável.
              </li>
              <li>
                <strong className="text-(--fg-primary)">
                  Tokens:
                </strong>{" "}
                superfície usa --bg-raised, borda --border-subtle, indicador de
                seleção --fg-primary, descrição --fg-secondary, hover halo
                --bg-muted. Sem tokens novos.
              </li>
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
}
