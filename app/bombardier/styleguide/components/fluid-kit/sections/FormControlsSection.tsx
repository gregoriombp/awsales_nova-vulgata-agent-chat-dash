"use client";

import { useState, type ReactNode } from "react";
import { Switch } from "@/components/ui/fluid/switch";
import {
  CheckboxGroup,
  CheckboxItem,
} from "@/components/ui/fluid/checkbox-group";
import { RadioGroup, RadioItem } from "@/components/ui/fluid/radio-group";
import { Slider } from "@/components/ui/fluid/slider";

/* Bloco de demonstração: heading pequeno + descrição curta + área de demo.
 * A seção é montada dentro da página hub do Fluid Kit — sem hero próprio. */
function Group({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium text-fg-primary">{title}</h3>
      <p className="mt-1 text-sm text-fg-muted max-w-prose">{description}</p>
      <div className="mt-6 rounded-xl border border-border-subtle p-8">
        {children}
      </div>
    </div>
  );
}

const CHANNEL_OPTIONS = ["E-mail", "WhatsApp", "Chat do site", "Telefone"];

export function FormControlsSection() {
  // Switch
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  // CheckboxGroup — 0 e 2 marcados; marcar o item entre eles funde os blocos
  const [channels, setChannels] = useState<Set<number>>(new Set([0, 2]));
  const toggleChannel = (index: number) =>
    setChannels((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });

  // RadioGroup
  const [period, setPeriod] = useState("30d");

  // Sliders
  const [limit, setLimit] = useState(40);
  const [messages, setMessages] = useState(3);

  return (
    <section className="flex flex-col gap-14">
      <Group
        title="Switch"
        description="Alterna uma configuração entre ligado e desligado. Clique ou arraste o controle para ver a física de mola do thumb; o estado desabilitado reduz a opacidade e bloqueia a interação."
      >
        <div className="flex w-fit flex-col gap-1 -mx-3 -my-2">
          <Switch
            label="Notificações por e-mail"
            checked={emailAlerts}
            onToggle={() => setEmailAlerts((v) => !v)}
          />
          <Switch
            label="Resumo diário para o time"
            checked={dailySummary}
            onToggle={() => setDailySummary((v) => !v)}
          />
          <Switch
            label="Sincronização automática"
            checked
            disabled
            onToggle={() => {}}
          />
        </div>
      </Group>

      <Group
        title="Checkbox group"
        description="Seleção múltipla com hover por proximidade. Opções adjacentes marcadas fundem o destaque em um único bloco — marque a opção entre duas seleções para ver a animação de fusão."
      >
        <CheckboxGroup checkedIndices={channels}>
          {CHANNEL_OPTIONS.map((label, index) => (
            <CheckboxItem
              key={label}
              index={index}
              label={label}
              checked={channels.has(index)}
              onToggle={() => toggleChannel(index)}
            />
          ))}
        </CheckboxGroup>
      </Group>

      <Group
        title="Radio group"
        description="Seleção única: o destaque desliza com física de mola até a opção escolhida. As setas do teclado movem a seleção entre as opções."
      >
        <RadioGroup value={period} onValueChange={setPeriod}>
          <RadioItem index={0} value="7d" label="Últimos 7 dias" />
          <RadioItem index={1} value="30d" label="Últimos 30 dias" />
          <RadioItem index={2} value="quarter" label="Trimestre atual" />
        </RadioGroup>
      </Group>

      <Group
        title="Slider"
        description="Controle deslizante com valor sempre visível — clique no número para digitar um valor exato. O segundo exemplo usa um intervalo curto (1 a 8) com pontos de passo no trilho."
      >
        <div className="flex max-w-md flex-col gap-10">
          <Slider
            label="Limite"
            value={limit}
            onChange={(v) => setLimit(v as number)}
            min={0}
            max={100}
            formatValue={(v) => `${v}%`}
          />
          <Slider
            label="Mensagens"
            value={messages}
            onChange={(v) => setMessages(v as number)}
            min={1}
            max={8}
            step={1}
            showSteps
          />
        </div>
      </Group>
    </section>
  );
}
