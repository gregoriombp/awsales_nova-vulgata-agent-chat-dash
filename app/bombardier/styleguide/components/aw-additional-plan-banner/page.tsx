"use client"

import * as React from "react"
import { AwAdditionalPlanBanner } from "@/components/ui/AwAdditionalPlanBanner"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

/**
 * AwAdditionalPlanBanner — lembra o usuário de configurar um plano comprado
 * cuja organização ainda não foi configurada. Aparece no topo do /inicio
 * quando o usuário decidiu adiar a configuração no fluxo de login.
 */

export default function AwAdditionalPlanBannerPage() {
  const [dismissed, setDismissed] = React.useState(false)

  return (
    <>
      <PageHero title="Banner de plano adicional">
        Lembrete persistente no topo do /inicio quando o usuário comprou um plano
        novo (segunda organização) mas escolheu adiar a configuração no fluxo de
        login. Some assim que a configuração é concluída.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Padrão · 1 plano pendente"
            lead="Estado mais comum: usuário comprou 1 plano novo e adiou. Inclui o nome da org quando disponível pra dar contexto imediato."
          >
            <Stage label="1 plano pendente, com nome da org">
              <div className="w-full max-w-[820px]">
                <AwAdditionalPlanBanner orgName="Núcleo Performance" />
              </div>
            </Stage>
          </Section>

          <Section
            id="without-org"
            title="Sem nome de organização"
            lead="Quando o nome ainda não foi definido (ex.: convite genérico recém-comprado), fica só com o título genérico."
          >
            <Stage label="Sem orgName">
              <div className="w-full max-w-[820px]">
                <AwAdditionalPlanBanner />
              </div>
            </Stage>
          </Section>

          <Section
            id="multiple"
            title="Múltiplos planos pendentes"
            lead="Caso raro: usuário comprou mais de um plano novo e adiou tudo. Plural na copy."
          >
            <Stage label="3 planos pendentes">
              <div className="w-full max-w-[820px]">
                <AwAdditionalPlanBanner count={3} />
              </div>
            </Stage>
          </Section>

          <Section
            id="dismissible"
            title="Com dispensar"
            lead="Quando passada onDismiss, mostra o X pra fechar. Persistência é responsabilidade do consumidor — no /inicio o banner some na sessão e volta na próxima visita até configurar."
          >
            <Stage label="Botão de dispensar visível">
              <div className="w-full max-w-[820px]">
                {dismissed ? (
                  <button
                    type="button"
                    onClick={() => setDismissed(false)}
                    className="aw-btn aw-btn--secondary aw-btn--sm"
                  >
                    <span className="aw-btn__label">Mostrar banner novamente</span>
                  </button>
                ) : (
                  <AwAdditionalPlanBanner
                    orgName="Núcleo Performance"
                    onDismiss={() => setDismissed(true)}
                  />
                )}
              </div>
            </Stage>
          </Section>

          <Section id="api" title="API" lead="Props do componente.">
            <ApiTable>
              <PropRow
                prop="count"
                type="number"
                def="1"
                doc="Quantidade de planos comprados sem org configurada. Plural se > 1."
              />
              <PropRow
                prop="orgName"
                type="string"
                doc="Nome da org pendente. Quando count = 1 e orgName está presente, usa no título; senão, fallback genérico."
              />
              <PropRow
                prop="configureHref"
                type="string"
                def='"/organizacao-adicional"'
                doc="Destino do CTA primário 'Configurar agora'."
              />
              <PropRow
                prop="onDismiss"
                type="() => void"
                doc="Callback do botão de dispensar. Quando omitido, o X não aparece."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Classes extras aplicadas no container raiz."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  )
}
