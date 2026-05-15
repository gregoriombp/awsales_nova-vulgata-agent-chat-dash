import { AwCard } from "@/components/ui/AwCard"
import { AwShortcutTile } from "@/components/ui/AwShortcutTile"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

/**
 * AwShortcutTile — clickable icon + title + description row used to
 * surface secondary pages on overview screens (Billing, Settings hubs).
 *
 * Replaces dense KPI-card grids on landing pages where the goal is
 * navigation, not at-a-glance metrics.
 */

export default function AwShortcutTilePage() {
  return (
    <>
      <PageHero title="Shortcut tile">
        Atalho clicável com ícone, título e descrição opcional. Usado em telas
        de overview pra navegar pras sub-páginas sem virar grid de KPI card.
        Inspirado no padrão da Billing overview do OpenAI Platform.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Uso padrão"
            lead="Grid 2-col dentro de um AwCard. Cada tile tem ícone à esquerda em container suave, título em medium, descrição em texto secundário."
          >
            <Stage label="atalhos do Financeiro · 2 colunas">
              <div className="w-full max-w-[820px]">
                <AwCard className="!p-2">
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <AwShortcutTile
                      icon="redeem"
                      title="Saldo de créditos"
                      description="R$ 1.250,00 disponível · 2 vouchers ativos"
                      href="#"
                    />
                    <AwShortcutTile
                      icon="credit_card"
                      title="Métodos de pagamento"
                      description="Visa •••• 3012 como padrão · 3 cadastrados"
                      href="#"
                    />
                    <AwShortcutTile
                      icon="receipt_long"
                      title="Histórico de faturas"
                      description="Última: Abr/26 · R$ 1.002,43"
                      href="#"
                    />
                    <AwShortcutTile
                      icon="history"
                      title="Auditoria"
                      description="Última atividade 11/05/2026 às 14:32"
                      href="#"
                    />
                  </div>
                </AwCard>
              </div>
            </Stage>
          </Section>

          <Section
            id="without-description"
            title="Sem descrição"
            lead="Quando o contexto da seção já explica o atalho, omita a descrição pra um tile mais respirado."
          >
            <Stage label="só título + ícone">
              <div className="w-full max-w-[820px]">
                <AwCard className="!p-2">
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <AwShortcutTile
                      icon="settings"
                      title="Preferências"
                      href="#"
                    />
                    <AwShortcutTile
                      icon="lock"
                      title="Segurança"
                      href="#"
                    />
                  </div>
                </AwCard>
              </div>
            </Stage>
          </Section>

          <Section
            id="stand-alone"
            title="Lista solta (sem card wrapper)"
            lead="Tile também funciona fora de um card — útil em sidebars ou seções menores. O hover continua aplicando o bg-muted."
          >
            <Stage label="3 tiles empilhados sem card">
              <div className="flex w-full max-w-[420px] flex-col gap-1">
                <AwShortcutTile
                  icon="api"
                  title="API keys"
                  description="2 chaves ativas"
                  href="#"
                />
                <AwShortcutTile
                  icon="webhook"
                  title="Webhooks"
                  description="0 endpoints configurados"
                  href="#"
                />
                <AwShortcutTile
                  icon="badge"
                  title="Perfil"
                  description="gregorio@awsales.ai"
                  href="#"
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Wraps <Link> do next/navigation. Aceita todos os atributos de âncora HTML."
          >
            <ApiTable>
              <PropRow
                prop="icon"
                type="string"
                doc="Nome do Material Symbol exibido no container à esquerda. Obrigatório."
              />
              <PropRow
                prop="title"
                type="React.ReactNode"
                doc="Texto principal do tile, peso medium. Obrigatório."
              />
              <PropRow
                prop="description"
                type="React.ReactNode"
                doc="Linha secundária opcional em texto fg-secondary."
              />
              <PropRow
                prop="href"
                type="string"
                doc="Destino da navegação (passado direto pro next/link). Obrigatório."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  )
}
