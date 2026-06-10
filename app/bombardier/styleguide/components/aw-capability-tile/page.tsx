"use client";

import * as React from "react";
import { AwCapabilityTile } from "@/components/ui/AwCapabilityTile";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { Icon } from "@/components/ui/Icon";
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Stage,
  Tldr,
} from "../../_primitives";

/** Ícone de AOP — Material Symbol numa caixa neutra de 40px. */
function AopIcon({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-muted text-fg-secondary">
      <Icon name={name} size={20} fill={1} />
    </div>
  );
}

export default function AwCapabilityTilePage() {
  const [skills, setSkills] = React.useState<Record<string, boolean>>({
    stripe: true,
    calendly: false,
  });
  const [aops, setAops] = React.useState<Record<string, boolean>>({
    reembolso: true,
  });
  const toggle =
    (set: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, id: string) =>
    () =>
      set((s) => ({ ...s, [id]: !s[id] }));

  return (
    <>
      <PageHero title="Capability tile">
        Tile selecionável pra conceder a um agente o acesso a uma{" "}
        <strong>capacidade</strong> — uma <strong>Habilidade</strong> (integração
        de terceiro) ou um <strong>AOP</strong> (processo operacional). As
        capacidades já existem a nível de conta/organização; aqui só se{" "}
        <strong>dá permissão</strong>. Clicar no corpo abre a pré-visualização; o
        botão à direita concede ou remove o acesso.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Montar a grade de <strong>Habilidades e AOPs</strong> no wizard de
              criação de agente.
            </>,
            <>
              Sempre que o usuário concede a um agente acesso a algo que já existe
              na conta.
            </>,
            <>
              Use o <code className="mono">onPreview</code> pra abrir um modal de
              detalhe antes de habilitar.
            </>,
          ]}
          dontUse={[
            <>
              Criar a capacidade em si — o tile só concede permissão, não cria
              integração nem AOP.
            </>,
            <>
              Card de navegação. Pra abrir uma rota, use{" "}
              <code className="mono">AwUserAgentOrb</code> dentro de um link
              do produto.
            </>,
          ]}
        />

        <Section id="habilidades" title="Habilidades (integrações)">
          <Stage
            label="Grade de habilidades"
            hint="ícone = logo da marca · clique no corpo abre o preview"
            gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
          >
            <AwCapabilityTile
              icon={<AwBrandLogo brand="stripe" size="md" />}
              name="Stripe"
              description="stripe.com"
              selected={skills.stripe}
              onToggle={toggle(setSkills, "stripe")}
              onPreview={() => {}}
            />
            <AwCapabilityTile
              icon={<AwBrandLogo brand="calendly" size="md" />}
              name="Calendly"
              description="calendly.com"
              selected={skills.calendly}
              onToggle={toggle(setSkills, "calendly")}
              onPreview={() => {}}
            />
          </Stage>
        </Section>

        <Section id="aops" title="AOPs (processos)">
          <Stage
            label="Grade de AOPs"
            hint="ícone = Material Symbol semântico"
            gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
          >
            <AwCapabilityTile
              icon={<AopIcon name="payments" />}
              name="Reembolso de cartão"
              description="Estorna uma cobrança aprovada"
              selected={aops.reembolso}
              onToggle={toggle(setAops, "reembolso")}
              onPreview={() => {}}
            />
            <AwCapabilityTile
              icon={<AopIcon name="event" />}
              name="Agendar reunião"
              description="Cria evento na agenda conectada"
              selected={!!aops.agendar}
              onToggle={toggle(setAops, "agendar")}
              onPreview={() => {}}
            />
          </Stage>
        </Section>

        <Section id="estados" title="Estados">
          <Stage
            label="default · selecionado · disabled"
            gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full"
          >
            <AwCapabilityTile
              icon={<AwBrandLogo brand="pipedrive" size="md" />}
              name="Pipedrive"
              description="pipedrive.com"
              onPreview={() => {}}
            />
            <AwCapabilityTile
              icon={<AwBrandLogo brand="pipedrive" size="md" />}
              name="Pipedrive"
              description="pipedrive.com"
              selected
              onPreview={() => {}}
            />
            <AwCapabilityTile
              icon={<AwBrandLogo brand="tally" size="md" />}
              name="Tally"
              description="indisponível no plano"
              disabled
            />
          </Stage>
        </Section>

        <Section id="api" title="API">
          <ApiTable>
            <PropRow prop="icon" type="ReactNode" doc="Logo de marca (Habilidade) ou <Icon> Material Symbol (AOP)." />
            <PropRow prop="name" type="string" doc="Nome da capacidade." />
            <PropRow prop="description" type="string" def="—" doc="Domínio da integração ou resumo do processo." />
            <PropRow prop="selected" type="boolean" def="false" doc="Se a permissão está concedida." />
            <PropRow prop="onToggle" type="() => void" def="—" doc="Concede/remove a permissão (botão à direita)." />
            <PropRow prop="onPreview" type="() => void" def="—" doc="Abre o preview (clique no corpo). Sem ele, o corpo não é clicável." />
            <PropRow prop="disabled" type="boolean" def="false" doc="Esmaece e desabilita interação." />
            <PropRow prop="className" type="string" def="—" doc="Classes extras, merge via cn()." />
          </ApiTable>

          <CodeExample>{`<AwCapabilityTile
  icon={<StripeLogo />}
  name="Stripe"
  description="stripe.com"
  selected={granted}
  onToggle={() => setGranted((v) => !v)}
  onPreview={() => openPreview("stripe")}
/>`}</CodeExample>
        </Section>

        <Section id="praticas" title="Boas práticas">
          <DoDont
            dos={[
              <>Clique no corpo abre o preview; o botão concede a permissão.</>,
              <>Esmaeça as não-selecionadas só quando fizer sentido (single-select).</>,
              <>Use Material Symbols semânticos nos AOPs — nunca quadrado de cor.</>,
            ]}
            donts={[
              <>Pintar o card inteiro de preto ao selecionar — pesa a grade.</>,
              <>Usar o tile pra navegar pra uma página.</>,
              <>Deixar o corpo clicável sem ter um preview pra mostrar.</>,
            ]}
          />
        </Section>
      </div>
    </>
  );
}
