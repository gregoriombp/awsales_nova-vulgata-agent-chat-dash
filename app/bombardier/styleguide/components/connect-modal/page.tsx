"use client"

import { useState } from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwConnectModal } from "@/components/ui/AwConnectModal"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

export default function ConnectModalPage() {
  const [openLinear, setOpenLinear] = useState(false)
  const [openHubspot, setOpenHubspot] = useState(false)
  const [openMin, setOpenMin] = useState(false)

  return (
    <>
      <PageHero title="Connect modal">
        Modal de autorização OAuth — conecta o produto a uma integração de
        terceiro. Layout centrado: par de logos + conector, título “Conectar X
        para Y”, lista de permissões com check, URL de redirecionamento e
        rodapé com ação primária <code className="mono">ai</code>. Reusa o
        scrim e shell de <code className="mono">AwModal</code>; só a anatomia
        é própria.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          {/* ───────── Demo ───────── */}
          <Section
            id="demo"
            title="Demo"
            lead="Clique para abrir cada exemplo. Esc fecha. Clique fora descarta."
          >
            <Stage label="Variantes de conteúdo">
              <AwButton
                variant="primary"
                iconLeft="link"
                onClick={() => setOpenLinear(true)}
              >
                Conectar Linear
              </AwButton>
              <AwButton
                variant="secondary"
                iconLeft="link"
                onClick={() => setOpenHubspot(true)}
              >
                Conectar HubSpot
              </AwButton>
              <AwButton
                variant="ghost"
                iconLeft="link"
                onClick={() => setOpenMin(true)}
              >
                Mínimo (sem permissões)
              </AwButton>
            </Stage>
          </Section>

          {/* ───────── Anatomy ───────── */}
          <Section
            id="anatomy"
            title="Anatomia"
            lead="Cinco regiões empilhadas: hero (logos + título + descrição), permissões, URL de redirecionamento, rodapé."
          >
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--fg-secondary)]">
              <ul className="m-0 pl-4 list-disc flex flex-col gap-1.5">
                <li>
                  <strong>Hero.</strong> Logo do produto · conector · logo do
                  alvo. Sempre 56px no light/dark.
                </li>
                <li>
                  <strong>Título.</strong> “Conectar [produto] para [alvo]”.
                  Infinitivo, 19px, semibold.
                </li>
                <li>
                  <strong>Descrição.</strong> Uma frase curta — porquê da
                  conexão, não como.
                </li>
              </ul>
              <ul className="m-0 pl-4 list-disc flex flex-col gap-1.5">
                <li>
                  <strong>Permissões.</strong> Lista de scopes com check azul.
                  Concretas — “Acessar X” não “Permitir leitura”.
                </li>
                <li>
                  <strong>URL.</strong> Read-only + botão <em>Copiar</em>.
                  Aparece só se <code className="mono">redirectUrl</code>{" "}
                  for passado.
                </li>
                <li>
                  <strong>Rodapé.</strong> Esquerda: ação opcional <em>Como funciona</em>.
                  Direita: <em>Cancelar</em> + <em>Permitir acesso</em>{" "}
                  (variant <code className="mono">ai</code>).
                </li>
              </ul>
            </div>
          </Section>

          {/* ───────── API ───────── */}
          <Section
            id="api"
            title="API"
            lead={`Import: import { AwConnectModal } from "@/components/ui/AwConnectModal".`}
          >
            <ApiTable>
              <PropRow
                prop="open"
                type="boolean"
                doc="Controla a visibilidade. Sempre controlado."
              />
              <PropRow
                prop="onClose"
                type="() => void"
                doc="Fecha (ESC, scrim, botão ✕). Obrigatório."
              />
              <PropRow
                prop="productBrand"
                type="string"
                doc="Brand id do AwBrandLogo. Default: mark do AwSales sobre tile preto."
              />
              <PropRow
                prop="productName"
                type="string"
                def={`"AwSales"`}
                doc="Nome usado no título."
              />
              <PropRow
                prop="targetBrand"
                type="string"
                doc="Brand id do AwBrandLogo do alvo. Obrigatório."
              />
              <PropRow
                prop="targetName"
                type="string"
                doc="Nome do alvo no título. Obrigatório."
              />
              <PropRow
                prop="description"
                type="ReactNode"
                doc="Subtítulo — uma frase curta sobre o porquê."
              />
              <PropRow
                prop="permissionsTitle"
                type="string"
                doc="Heading da lista de permissões. Ex: “AwSales precisa”."
              />
              <PropRow
                prop="permissions"
                type="ReactNode[]"
                def="[]"
                doc="Lista de scopes. Cada item recebe o check azul automaticamente."
              />
              <PropRow
                prop="redirectUrl"
                type="string"
                doc="Mostra input read-only + botão Copiar. Omitido = sem URL."
              />
              <PropRow
                prop="onAllow"
                type="() => void"
                doc="Ação primária — botão variant=ai."
              />
              <PropRow
                prop="onCancel"
                type="() => void"
                doc="Default: onClose."
              />
              <PropRow
                prop="onHowItWorks"
                type="() => void"
                doc="Se omitido, slot esquerdo do rodapé fica vazio."
              />
              <PropRow
                prop="loading"
                type="boolean"
                def="false"
                doc="Spinner no botão Permitir acesso. Bloqueia interação."
              />
              <PropRow
                prop="labels"
                type="Partial<Labels>"
                doc="Override de strings: cancel, allow, howItWorks, copy, copied, titleConnector."
              />
            </ApiTable>

            <CodeExample>{`import { AwConnectModal } from "@/components/ui/AwConnectModal"

<AwConnectModal
  open={open}
  onClose={() => setOpen(false)}
  targetBrand="hubspot"
  targetName="HubSpot"
  productName="AwSales"
  description="Sincronize contatos, empresas e pipelines com seus agentes."
  permissionsTitle="O AwSales precisa"
  permissions={[
    "Acessar contatos e empresas",
    "Criar e atualizar deals do pipeline",
    "Disparar workflows quando uma oportunidade fechar",
  ]}
  redirectUrl="https://app.awsales.io/integrations/hubspot/callback"
  onHowItWorks={() => window.open("/docs/integrations/hubspot")}
  onAllow={() => connectHubspot()}
/>`}</CodeExample>
          </Section>

          {/* ───────── Do / Don't ───────── */}
          <Section
            id="do-dont"
            title="Do / Don't"
            lead="As permissões são o ponto de confiança do modal — escreva-as como o usuário leria."
          >
            <DoDont
              dos={[
                "3–6 permissões. Concretas, em infinitivo.",
                <>Descrição responde <em>por que conectar</em>, não <em>o que será feito</em>.</>,
                <>Use <code className="mono">variant=ai</code> no botão de autorizar — é decisão do usuário sobre o agente.</>,
                <><em>Como funciona</em> abre doc em nova aba; nunca navega fora do fluxo.</>,
              ]}
              donts={[
                "“Permitir leitura/escrita” genérico. Seja específico.",
                "Mais de 6 permissões — colapse em categorias ou delegue para uma página de configuração.",
                "Tom de venda na descrição. Esse momento é jurídico.",
                "Botão primário em primary preto — é decisão de IA.",
              ]}
            />
          </Section>
        </div>
      </div>

      {/* Modais de demo */}
      <AwConnectModal
        open={openLinear}
        onClose={() => setOpenLinear(false)}
        targetBrand="pipedrive"
        targetName="Linear"
        productName="AwSales"
        description="Priorize trabalho com base nas necessidades dos clientes e crie um loop de feedback mais apertado."
        permissionsTitle="O AwSales precisa"
        permissions={[
          "Acessar informações básicas da empresa",
          "Acessar e editar bug reports e criar issues",
          "Mudar status e responsável de issues",
          "Abrir e resolver conversas",
          "Adicionar ou remover usuários e mudar papéis",
        ]}
        redirectUrl="app.awsales.io/integrations/linear"
        onHowItWorks={() => {}}
        onAllow={() => setOpenLinear(false)}
      />

      <AwConnectModal
        open={openHubspot}
        onClose={() => setOpenHubspot(false)}
        targetBrand="hubspot"
        targetName="HubSpot"
        productName="AwSales"
        description="Sincronize contatos, empresas e pipelines com seus agentes."
        permissionsTitle="O AwSales precisa"
        permissions={[
          "Acessar contatos e empresas",
          "Criar e atualizar deals do pipeline",
          "Disparar workflows quando uma oportunidade fechar",
        ]}
        redirectUrl="https://app.awsales.io/integrations/hubspot/callback"
        onAllow={() => setOpenHubspot(false)}
      />

      <AwConnectModal
        open={openMin}
        onClose={() => setOpenMin(false)}
        targetBrand="calendly"
        targetName="Calendly"
        productName="AwSales"
        description="Agendamentos automáticos sincronizados com agentes."
        onAllow={() => setOpenMin(false)}
      />
    </>
  )
}
