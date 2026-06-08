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

const HUBLA_WEBHOOK =
  "https://app.awsales.io/api/webhooks/checkouts/d12fa78b-3e4c-4a1f-91e2"

export default function ConnectModalPage() {
  const [openLinear, setOpenLinear] = useState(false)
  const [openHubspot, setOpenHubspot] = useState(false)
  const [openMin, setOpenMin] = useState(false)
  const [openWebhook, setOpenWebhook] = useState(false)
  const [openApiKey, setOpenApiKey] = useState(false)

  return (
    <>
      <PageHero title="Connect modal">
        Modal de conexão para integrações de terceiros. Suporta três fluxos via{" "}
        <code className="mono">kind</code>:{" "}
        <code className="mono">oauth</code> (autorização por escopos),{" "}
        <code className="mono">webhook</code> (passo-a-passo guiado em slider) e{" "}
        <code className="mono">apiKey</code> (formulário de credenciais).
        Sempre o mesmo hero — par de logos + título — variando apenas o miolo
        e o rótulo do botão primário.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          {/* ───────── Demo ───────── */}
          <Section
            id="demo"
            title="Demo"
            lead="Três fluxos, mesmo shell. Esc fecha. Clique fora descarta."
          >
            <div className="flex flex-col gap-4">
            <Stage label="OAuth — autorização por escopos">
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

            <Stage label="Webhook — passo-a-passo em slider">
              <AwButton
                variant="primary"
                iconLeft="bolt"
                onClick={() => setOpenWebhook(true)}
              >
                Integrar Hubla
              </AwButton>
            </Stage>

            <Stage label="API key — credenciais diretas">
              <AwButton
                variant="primary"
                iconLeft="key"
                onClick={() => setOpenApiKey(true)}
              >
                Conectar Hotmart
              </AwButton>
            </Stage>
            </div>
          </Section>

          {/* ───────── Kinds ───────── */}
          <Section
            id="kinds"
            title="Os três fluxos"
            lead="Cada integração de terceiro cai em um destes — escolha o que combina com o método de autenticação."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-sm text-(--fg-secondary)">
              <div className="flex flex-col gap-2">
                <div className="text-(--fg-primary) font-semibold text-[14px]">
                  OAuth
                </div>
                <p className="m-0 text-[13px] leading-normal">
                  Lista de escopos com check + URL de redirecionamento. Botão{" "}
                  <em>Permitir acesso</em>. Padrão para HubSpot, Linear,
                  Calendly, Pipedrive.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-(--fg-primary) font-semibold text-[14px]">
                  Webhook
                </div>
                <p className="m-0 text-[13px] leading-normal">
                  Stepper horizontal + slider que avança por instruções
                  (copiar URL, configurar no painel do parceiro, salvar,
                  testar). Padrão para Hubla, Ticto, LastLink.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-(--fg-primary) font-semibold text-[14px]">
                  API key
                </div>
                <p className="m-0 text-[13px] leading-normal">
                  Campos numerados em coluna única (clientId, secret,
                  token…). Asterisco em obrigatórios e link inline pro
                  passo a passo do parceiro. Padrão para Hotmart, Stripe,
                  Kiwify, Tally, Magalu.
                </p>
              </div>
            </div>
          </Section>

          {/* ───────── Anatomy ───────── */}
          <Section
            id="anatomy"
            title="Anatomia"
            lead="O hero é constante. O miolo varia por kind."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-(--fg-secondary)">
              <ul className="m-0 pl-4 list-disc flex flex-col gap-1.5">
                <li>
                  <strong>Hero (sempre).</strong> Logo do produto · conector ·
                  logo do alvo (56px) + título adaptado ao kind + descrição
                  curta.
                </li>
                <li>
                  <strong>Nome (sempre).</strong> Campo opcional de nome da
                  conexão — útil quando há múltiplas instâncias (“Hubla — Loja
                  BR”, “Hubla — Loja PT”). Esconda com <code className="mono">showName=false</code>.
                </li>
                <li>
                  <strong>OAuth.</strong> Lista de permissões com check azul
                  e, opcional, URL de redirect com botão copiar.
                </li>
                <li>
                  <strong>Webhook.</strong> Stepper numerado (etapa atual em
                  preto) + slide horizontal animado por etapa. Cada etapa pode
                  embutir um copy-URL.
                </li>
              </ul>
              <ul className="m-0 pl-4 list-disc flex flex-col gap-1.5">
                <li>
                  <strong>API key.</strong> Texto de introdução + grade de
                  campos (chave, secret, etc.) + link para docs.
                </li>
                <li>
                  <strong>Rodapé (sempre).</strong> Esquerda: <em>Como funciona</em>{" "}
                  ou <em>Voltar</em> (no webhook a partir da etapa 2). Direita:{" "}
                  <em>Cancelar</em> + ação primária.
                </li>
                <li>
                  <strong>Botão primário.</strong> OAuth ={" "}
                  <em>Permitir acesso</em>. Webhook ={" "}
                  <em>Continuar</em> (intermediárias) /{" "}
                  <em>Concluir configuração</em> (última). API key ={" "}
                  <em>Conectar</em>.
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
                prop="kind"
                type={`"oauth" | "webhook" | "apiKey"`}
                def={`"oauth"`}
                doc="Define o miolo, o título e o rótulo da ação primária."
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
                doc="Nome usado no título OAuth."
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

              {/* Naming — applies to all kinds */}
              <PropRow
                prop="showName"
                type="boolean"
                def="true"
                doc="Exibe o campo Nome acima do miolo. Permite ao usuário nomear a conexão (útil quando há múltiplas)."
              />
              <PropRow
                prop="defaultConnectionName"
                type="string"
                doc="Valor inicial do campo Nome."
              />
              <PropRow
                prop="namePlaceholder"
                type="string"
                doc={`Placeholder do Nome. Default: "{targetName} – {kind}".`}
              />

              {/* OAuth */}
              <PropRow
                prop="permissions"
                type="ReactNode[]"
                def="[]"
                doc="(OAuth) Lista de scopes. Cada item recebe o check azul."
              />
              <PropRow
                prop="permissionsTitle"
                type="string"
                doc="(OAuth) Heading da lista. Ex: “AwSales precisa”."
              />
              <PropRow
                prop="redirectUrl"
                type="string"
                doc="(OAuth) URL read-only com botão copiar. Omitido = sem URL."
              />

              {/* Webhook */}
              <PropRow
                prop="steps"
                type="AwWebhookStep[]"
                doc="(Webhook) Etapas do passo-a-passo. Cada etapa = um slide."
              />
              <PropRow
                prop="initialStep"
                type="number"
                def="0"
                doc="(Webhook) Etapa inicial."
              />

              {/* API key */}
              <PropRow
                prop="apiKeyFields"
                type="AwApiKeyField[]"
                doc="(API key) Campos numerados em coluna única. Cada um aceita { id, label, placeholder, iconLeft, helper, defaultValue, required }. required adiciona asterisco."
              />
              <PropRow
                prop="apiKeyIntro"
                type="ReactNode"
                doc="(API key) Texto curto antes do formulário."
              />
              <PropRow
                prop="docsUrl"
                type="string"
                doc="(API key) Link para documentação do parceiro."
              />
              <PropRow
                prop="docsLabel"
                type="string"
                def={`"Ver documentação"`}
                doc="(API key) Rótulo do link de docs."
              />

              {/* Footer */}
              <PropRow
                prop="onAllow"
                type="() => void"
                doc="Ação primária. No webhook, só dispara na última etapa — antes disso o botão avança o slide."
              />
              <PropRow
                prop="onCancel"
                type="() => void"
                doc="Default: onClose."
              />
              <PropRow
                prop="onHowItWorks"
                type="() => void"
                doc="Slot esquerdo do rodapé (escondido no webhook a partir da etapa 2 — vira Voltar)."
              />
              <PropRow
                prop="loading"
                type="boolean"
                def="false"
                doc="Spinner no botão primário. Bloqueia interação."
              />
              <PropRow
                prop="labels"
                type="Partial<Labels>"
                doc="Override de strings: cancel, allow, allowWebhook, allowApiKey, howItWorks, copy, copied, titleConnector, next, back, finish, stepOf."
              />
            </ApiTable>

            <CodeExample>{`import { AwConnectModal } from "@/components/ui/AwConnectModal"

// Webhook flow (Hubla, Ticto, LastLink…)
<AwConnectModal
  open={open}
  onClose={() => setOpen(false)}
  kind="webhook"
  targetBrand="hubla"
  targetName="Hubla"
  description="Receba eventos de venda da Hubla em tempo real."
  steps={[
    {
      label: "Copiar webhook",
      title: "Copie o webhook",
      body: <p>Use o link abaixo na configuração da Hubla:</p>,
      copy: { label: "Webhook URL", value: webhookUrl },
    },
    {
      label: "Configurar",
      title: "Acesse a Hubla",
      body: (
        <>
          <p>Em <strong>Painel → Webhooks → Novo</strong>, preencha:</p>
          <ul>
            <li><strong>Nome:</strong> Integração AwSales</li>
            <li><strong>URL:</strong> cole o webhook acima</li>
            <li><strong>Eventos:</strong> Fatura criada, Fatura paga, Carrinho abandonado</li>
          </ul>
        </>
      ),
    },
    {
      label: "Salvar",
      title: "Salve no painel da Hubla",
      body: <p>Confirme que o webhook aparece como <strong>Ativo</strong>.</p>,
    },
    {
      label: "Testar",
      title: "Faça um teste",
      body: <p>Use <em>Testar configuração</em> na Hubla — checamos a entrega aqui.</p>,
    },
  ]}
  onAllow={() => connectHubla()}
/>

// API key flow (Hotmart, Stripe, Kiwify…)
<AwConnectModal
  open={open}
  onClose={() => setOpen(false)}
  kind="apiKey"
  targetBrand="hotmart"
  targetName="Hotmart"
  apiKeyIntro={
    <>
      Adicione abaixo as credenciais da sua conta Hotmart. Para ver o
      passo a passo,{" "}
      <a href="https://developers.hotmart.com" target="_blank" rel="noreferrer">
        clique aqui
      </a>.
    </>
  }
  apiKeyFields={[
    { id: "client-id",     label: "Insira o clientId",      placeholder: "Insira aqui seu ClientId",      required: true },
    { id: "client-secret", label: "Insira o Client Secret", placeholder: "Insira aqui seu Client Secret", required: true },
    { id: "basic-token",   label: "Insira o basic token",   placeholder: "Insira aqui seu basic token",   required: true },
  ]}
  onAllow={() => connectHotmart()}
/>`}</CodeExample>
          </Section>

          {/* ───────── Do / Don't ───────── */}
          <Section
            id="do-dont"
            title="Do / Don't"
            lead="O kind certo importa: webhooks pedem mãos do usuário, OAuth só pede consentimento."
          >
            <DoDont
              dos={[
                "OAuth: 3–6 permissões concretas, em infinitivo.",
                "Webhook: 3–5 etapas curtas. Uma ação por etapa.",
                "Webhook: embuta o copy-URL na etapa que precisa dele — não force o usuário a procurar.",
                "API key: link para a página exata de geração de chave do parceiro, em nova aba.",
              ]}
              donts={[
                "Misturar OAuth e API key na mesma integração — escolha um.",
                "Webhook com 8+ passos. Se for grande, abra um doc dedicado e linke pelo onHowItWorks.",
                "Botão primário em variant=ai — esta confirmação é técnica, não decisão de IA.",
                "Trocar Cancelar por “Fechar”. Cancelar deixa claro que nada foi gravado.",
              ]}
            />
          </Section>
        </div>
      </div>

      {/* ───── OAuth demos ───── */}
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

      {/* ───── Webhook demo (Hubla) ───── */}
      <AwConnectModal
        open={openWebhook}
        onClose={() => setOpenWebhook(false)}
        kind="webhook"
        targetBrand="hubla"
        targetName="Hubla"
        description="Receba eventos de venda, abandono e reembolso da Hubla em tempo real."
        steps={[
          {
            label: "Copiar",
            title: "Copie o webhook",
            body: (
              <p>
                Copie o link fornecido abaixo. Ele será utilizado na
                configuração dentro da Hubla.
              </p>
            ),
            copy: { label: "Webhook URL", value: HUBLA_WEBHOOK },
          },
          {
            label: "Configurar",
            title: "Acesse a Hubla",
            body: (
              <>
                <p>
                  Caso tenha dúvidas sobre como iniciar a configuração,
                  siga este{" "}
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    passo-a-passo
                  </a>
                  . Para preencher as informações necessárias, use:
                </p>
                <ul>
                  <li>
                    <strong>Nome:</strong> Integração AwSales
                  </li>
                  <li>
                    <strong>URL:</strong> cole o webhook copiado na etapa
                    anterior
                  </li>
                  <li>
                    <strong>Produtos:</strong> selecione os produtos
                    desejados
                  </li>
                  <li>
                    <strong>Ofertas:</strong> selecione as ofertas
                    desejadas
                  </li>
                  <li>
                    <strong>Eventos:</strong> Fatura Criada (V2), Fatura
                    Expirada (V2), Pagamento Realizado (V2), Carrinho
                    Abandonado (V2), Pagamento Falhou (V2) e Fatura
                    Reembolsada (V2)
                  </li>
                </ul>
              </>
            ),
          },
          {
            label: "Salvar",
            title: "Salve a configuração",
            body: (
              <p>
                Após ajustar todas as configurações, garanta que o webhook
                foi salvo e aparece como <strong>Ativo</strong> no painel
                da Hubla.
              </p>
            ),
          },
          {
            label: "Testar",
            title: "Faça um teste",
            body: (
              <p>
                A Hubla oferece a opção <em>Testar configuração</em> na
                tela de edição do webhook. Use essa opção para enviar um
                evento de teste — nosso sistema verifica se a integração
                foi realizada com sucesso.
              </p>
            ),
          },
        ]}
        onAllow={() => setOpenWebhook(false)}
      />

      {/* ───── API key demo (Hotmart) ───── */}
      <AwConnectModal
        open={openApiKey}
        onClose={() => setOpenApiKey(false)}
        kind="apiKey"
        targetBrand="hotmart"
        targetName="Hotmart"
        description="Sincronize transações, assinantes e reembolsos da Hotmart via API."
        apiKeyIntro={
          <>
            Adicione abaixo as credenciais da sua conta Hotmart. Para ver
            o passo a passo de como encontrar as informações,{" "}
            <a
              href="https://developers.hotmart.com"
              target="_blank"
              rel="noreferrer"
            >
              clique aqui
            </a>
            .
          </>
        }
        apiKeyFields={[
          {
            id: "hotmart-client-id",
            label: "Insira o clientId",
            placeholder: "Insira aqui seu ClientId",
            required: true,
          },
          {
            id: "hotmart-client-secret",
            label: "Insira o Client Secret",
            placeholder: "Insira aqui seu Client Secret",
            required: true,
          },
          {
            id: "hotmart-basic-token",
            label: "Insira o basic token",
            placeholder: "Insira aqui seu basic token",
            required: true,
          },
        ]}
        onAllow={() => setOpenApiKey(false)}
      />
    </>
  )
}
