import Link from "next/link"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
} from "../../_primitives"

export default function AwOnboardingShellPlaygroundPage() {
  return (
    <>
      <PageHero title="AwOnboardingShell">
        Casca de tela inteira pro fluxo de Primeiro Acesso (8 etapas). Cobre
        a top bar com logo + breadcrumb, o stepper horizontal e o painel de
        marca escuro à esquerda (Variação B — com brand). O conteúdo da
        etapa entra via <code className="font-mono text-[13px]">children</code>{" "}
        no work pane à direita.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="preview"
            title="Preview ao vivo"
            lead="O shell ocupa a viewport inteira (h-screen) e não cabe inline no styleguide — abra em rota dedicada pra inspecionar o layout completo."
          >
            <div className="rounded-xl border border-border-subtle bg-bg-raised p-6">
              <div
                className="aw-eyebrow mb-3 text-fg-tertiary"
                style={{ letterSpacing: "0.08em" }}
              >
                Rotas implementadas
              </div>
              <ul className="m-0 flex flex-col gap-2 p-0 list-none">
                <li>
                  <Link
                    href="/primeiro-acesso/boas-vindas"
                    className="inline-flex items-center gap-2 font-mono text-sm text-fg-primary underline decoration-border-strong underline-offset-4 hover:decoration-fg-primary"
                  >
                    /primeiro-acesso/boas-vindas
                    <span className="text-fg-tertiary">→ Tela 02 · boas-vindas</span>
                  </Link>
                </li>
              </ul>
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="O shell costura três zonas fixas e um slot de conteúdo. Os tokens visuais vêm todos do foundation; o painel escuro fixa fundo brand (aw-gray-1200) por intenção identitária."
          >
            <div className="rounded-xl border border-border-subtle bg-bg-raised p-6 text-sm text-fg-secondary leading-relaxed">
              <ul className="m-0 flex flex-col gap-2 p-0 list-disc pl-5">
                <li>
                  <b className="text-fg-primary">Top bar</b> — 56 px, logo AwSales{" "}
                  <code className="font-mono text-xs">mark</code> + wordmark e
                  breadcrumb mono à direita.
                </li>
                <li>
                  <b className="text-fg-primary">Stepper</b> — 8 pips conectados,
                  com estados <code className="font-mono text-xs">done</code>,{" "}
                  <code className="font-mono text-xs">active</code> e pendente.
                </li>
                <li>
                  <b className="text-fg-primary">Brand pane</b> — 38% (320–480 px),
                  fundo escuro fixo com neural pattern, h1 dinâmico por etapa,
                  card de organização e rodapé mono com contador 0X/08.
                </li>
                <li>
                  <b className="text-fg-primary">Work pane</b> — slot scrollable
                  centralizado (max-w 520 px), recebe o conteúdo da etapa.
                </li>
              </ul>
            </div>
          </Section>

          <Section
            id="api"
            title="Props"
            lead="Configuração mínima — passe currentStep e org; brandTitle/brandSubtitle só pra sobrescrever a copy padrão do passo."
          >
            <ApiTable>
              <PropRow
                prop="currentStep"
                type="number (0–7)"
                doc="Índice da etapa ativa. Define qual pip fica destacado e o título exibido no brand pane."
              />
              <PropRow
                prop="org"
                type="{ name, cnpj, plan, contractTerm }"
                doc="Dados da organização exibidos no card escuro do brand pane."
              />
              <PropRow
                prop="children"
                type="ReactNode"
                doc="Conteúdo do work pane — o componente da tela (eyebrow, título, body, ações)."
              />
              <PropRow
                prop="brandTitle"
                type="string"
                def="STEPS[currentStep].brandTitle"
                doc="Sobrescreve o título do brand pane quando a copy padrão não cabe."
              />
              <PropRow
                prop="brandSubtitle"
                type="string"
                def='"Configuração inicial..."'
                doc="Sobrescreve o subtítulo do brand pane."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  )
}
