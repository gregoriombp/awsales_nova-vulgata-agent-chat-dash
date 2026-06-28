"use client"

import * as React from "react"
import { DayButton, type DateRange } from "react-day-picker"
import { AwButton } from "@/components/ui/AwButton"
import { Calendar } from "@/components/ui/calendar"
import { Icon } from "@/components/ui/Icon"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Stage,
  Tldr,
} from "../../_primitives"

const PRESETS = ["Hoje", "Ontem", "Últimos 7 dias", "Este mês", "Últimos 30 dias", "Últimos 90 dias"]

function formatRange(range: DateRange | undefined): string {
  if (!range?.from || !range?.to) return "Selecione início e fim"
  const sameMonth =
    range.from.getMonth() === range.to.getMonth() &&
    range.from.getFullYear() === range.to.getFullYear()
  const from = range.from.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: sameMonth ? undefined : "short",
  })
  const to = range.to.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
  return `${from} - ${to}`
}

export default function CalendarPage() {
  const [single, setSingle] = React.useState<Date | undefined>(
    new Date(2026, 5, 24),
  )
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 5, 21),
    to: new Date(2026, 5, 27),
  })
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <PageHero title="Calendar">
        Primitivo shadcn direto para seleção de data e intervalo. Não há wrapper
        Aw por enquanto: use <code className="mono">Calendar</code> de{" "}
        <code className="mono">@/components/ui/calendar</code> e componha o
        seletor final com <code className="mono">Popover</code>,{" "}
        <code className="mono">AwButton</code> e <code className="mono">Icon</code>.
      </PageHero>

      <div className="mx-auto flex max-w-screen-xl flex-col gap-16 px-10 pb-14">
        <Tldr
          use={[
            <>Seleção de data única, intervalo ou navegação de mês em popover.</>,
            <>Filtros de período em dashboards, relatórios e auditoria.</>,
            <>Quando o usuário precisa inspecionar dias antes de aplicar.</>,
          ]}
          dontUse={[
            <>Para listas curtas de presets sem data customizada; use menu ou tabs.</>,
            <>Como agenda de eventos; Calendar so seleciona datas.</>,
            <>Como componente solto sem trigger, label ou contexto de formulário.</>,
          ]}
        />

        <Section
          id="single"
          title="Data única"
          lead="Uso direto do primitive. O mês inicial, seleção e locale ficam sob controle do consumidor."
        >
          <Stage label="single date">
            <Calendar
              mode="single"
              selected={single}
              onSelect={setSingle}
              defaultMonth={new Date(2026, 5, 1)}
              captionLayout="dropdown"
            />
          </Stage>
        </Section>

        <Section
          id="range"
          title="Intervalo"
          lead="Modo range com dois meses, usado em filtros de período. A barra de ações fica fora do Calendar."
        >
          <Stage label="range · dois meses" gridClassName="flex flex-col gap-4">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              defaultMonth={new Date(2026, 5, 1)}
              numberOfMonths={2}
              captionLayout="dropdown"
              classNames={{
                range_start: "bg-(--bg-inverse) rounded-l-md",
                range_middle: "bg-(--bg-inverse) rounded-none",
                range_end: "bg-(--bg-inverse) rounded-r-md",
              }}
              components={{ DayButton: RangeDayButton }}
            />
            <div className="flex items-center justify-between gap-3 border-t border-(--border-subtle) pt-4">
              <p className="m-0 body-sm text-(--fg-tertiary)">
                {formatRange(range)}
              </p>
              <div className="flex items-center gap-2">
                <AwButton size="sm" variant="ghost">
                  Cancelar
                </AwButton>
                <AwButton size="sm" variant="primary" disabled={!range?.from || !range?.to}>
                  Aplicar
                </AwButton>
              </div>
            </div>
          </Stage>
        </Section>

        <Section
          id="period-picker"
          title="Receita: seletor de período"
          lead="A composição do print: trigger com ícone, lista de presets e Calendar em range. A receita vive no produto; o primitive continua sendo Calendar."
        >
          <Stage label="popover fechado · clique para abrir">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Selecionar período"
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-raised) px-4 body-sm font-medium text-(--fg-primary) hover:border-(--border-default) hover:bg-(--bg-hover)"
                >
                  <Icon name="calendar_month" size={16} className="text-(--fg-tertiary)" />
                  Este mês
                  <Icon name="expand_more" size={16} className="text-(--fg-tertiary)" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={6}
                className="w-auto border border-(--border-subtle) bg-(--bg-raised) p-0 shadow-lg"
              >
                <PeriodPickerPanel range={range} setRange={setRange} />
              </PopoverContent>
            </Popover>
          </Stage>

          <Stage label="popover aberto · anatomia" gridClassName="block">
            <PeriodPickerPanel range={range} setRange={setRange} />
          </Stage>
        </Section>

        <Section id="api" title="API" lead={`Import: import { Calendar } from "@/components/ui/calendar".`}>
          <ApiTable>
            <PropRow prop="mode" type={`"single" | "range" | "multiple"`} doc="Modo de seleção herdado de react-day-picker." />
            <PropRow prop="selected" type="Date | DateRange | Date[]" doc="Valor selecionado. Controle no consumidor." />
            <PropRow prop="onSelect" type="SelectHandler" doc="Callback do DayPicker para sincronizar estado." />
            <PropRow prop="numberOfMonths" type="number" def="1" doc="Renderiza um ou mais meses lado a lado." />
            <PropRow prop="captionLayout" type={`"label" | "dropdown"`} def={`"label"`} doc="Dropdown permite trocar mês/ano direto no cabeçalho." />
            <PropRow prop="components" type="DayPicker components" doc="Sobrescreve partes internas, como DayButton, quando o produto precisa de visual próprio." />
            <PropRow prop="classNames" type="Partial<ClassNames>" doc="Ajustes pontuais de classes do DayPicker. Use tokens existentes." />
          </ApiTable>

          <CodeExample label="range em popover">{`import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

<Popover>
  <PopoverTrigger asChild>
    <AwButton iconLeft="calendar_month">Este mês</AwButton>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange}
      numberOfMonths={2}
      captionLayout="dropdown"
    />
  </PopoverContent>
</Popover>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Mantenha presets, resumo e ações fora do <code className="mono">Calendar</code>.</>,
              <>Use <code className="mono">numberOfMonths=2</code> para intervalos longos.</>,
              <>Feche o popover somente ao aplicar ou cancelar, não a cada clique de dia.</>,
            ]}
            donts={[
              <>Criar <code className="mono">AwCalendar</code> cerimonial sem mudar comportamento.</>,
              <>Misturar presets ativos e range customizado sem indicar qual está valendo.</>,
              <>Usar o Calendar como seletor de horário ou agenda de disponibilidade.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}

function PeriodPickerPanel({
  range,
  setRange,
}: {
  range: DateRange | undefined
  setRange: (next: DateRange | undefined) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-xl bg-(--bg-raised)">
      <div className="flex w-48 shrink-0 flex-col border-r border-(--border-subtle) py-2">
        {PRESETS.map((preset) => {
          const active = preset === "Este mês"
          return (
            <button
              key={preset}
              type="button"
              className={cn(
                "flex items-center justify-between gap-2 px-4 py-3 text-left body-sm",
                active
                  ? "bg-(--bg-muted) font-medium text-(--fg-primary)"
                  : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
              )}
            >
              {preset}
              {active && <Icon name="check" size={16} className="text-(--fg-primary)" />}
            </button>
          )
        })}
        <div className="mx-4 my-2 h-px bg-(--border-subtle)" />
        <span className="px-4 py-1 aw-eyebrow text-(--fg-tertiary)">
          Personalizado
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          defaultMonth={new Date(2026, 5, 1)}
          numberOfMonths={2}
          captionLayout="dropdown"
          classNames={{
            range_start: "bg-(--bg-inverse) rounded-l-md",
            range_middle: "bg-(--bg-inverse) rounded-none",
            range_end: "bg-(--bg-inverse) rounded-r-md",
          }}
          components={{ DayButton: RangeDayButton }}
        />
        <div className="flex items-center justify-between gap-3 border-t border-(--border-subtle) pt-4">
          <p className="m-0 body-sm text-(--fg-tertiary)">{formatRange(range)}</p>
          <div className="flex items-center gap-2">
            <AwButton size="sm" variant="ghost">
              Cancelar
            </AwButton>
            <AwButton size="sm" variant="primary" disabled={!range?.from || !range?.to}>
              Aplicar
            </AwButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function RangeDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  // A faixa do período é um bloco SÓLIDO no accent (--bg-inverse), contínuo de
  // ponta a ponta. O preenchimento vem da CÉLULA (classNames range_start/middle/
  // end), então o botão só carrega o texto on-inverse; as pontas arredondam pela
  // célula. Dias fora do range: sem tile, só hover, pra o calendário respirar.
  const inRange =
    modifiers.selected ||
    modifiers.range_start ||
    modifiers.range_middle ||
    modifiers.range_end

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString()}
      className={cn(
        "flex aspect-square h-auto w-full min-w-(--cell-size) items-center justify-center rounded-md text-sm font-normal outline-hidden transition-colors duration-aw-fast focus-visible:ring-2 focus-visible:ring-(--fg-primary) focus-visible:ring-offset-1 focus-visible:ring-offset-(--bg-raised)",
        inRange
          ? "font-medium text-(--fg-on-inverse)"
          : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
        modifiers.today && !inRange && "ring-1 ring-inset ring-(--border-strong)",
        modifiers.outside && !inRange && "opacity-40",
        modifiers.disabled && "opacity-30",
        className,
      )}
      {...props}
    />
  )
}
