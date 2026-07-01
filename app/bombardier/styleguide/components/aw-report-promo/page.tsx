"use client"

import * as React from "react"
import { AwReportPromo } from "@/components/ui/AwReportPromo"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

/**
 * AwReportPromo — faixa que convida a abrir um relatório a partir de uma
 * overview, sem trazer os números pra dentro. Estreou na Visão geral do
 * Financeiro como atalho pro dashboard de "Consumo e custos".
 */

export default function AwReportPromoPage() {
  return (
    <>
      <PageHero title="Report promo">
        Faixa de destaque pra puxar o usuário pra um relatório ou seção mais
        densa direto de uma overview — tile de marca à esquerda, título e apoio
        no meio, CTA escuro à direita. Não despeja números: convida e leva.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="blocks"
            title="Arte · blocks"
            lead="Glifo de blocos — leitura mais 'ícone'. É a arte usada na Visão geral do Financeiro pro atalho de Consumo e custos."
          >
            <Stage label='art="blocks"'>
              <div className="w-full max-w-[860px]">
                <AwReportPromo
                  art="blocks"
                  title="Consumo e custos"
                  description="Concilie o que foi usado com o que foi cobrado, item a item, e acompanhe a evolução do consumo variável ao longo do período."
                  href="/settings/consumo-e-custos/analises"
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="arcs"
            title="Arte · arcs"
            lead="Cartões arredondados empilhados + arco. Default do componente — o tile do mock original."
          >
            <Stage label='art="arcs"'>
              <div className="w-full max-w-[860px]">
                <AwReportPromo
                  art="arcs"
                  title="Consumo e custos"
                  description="Concilie o que foi usado com o que foi cobrado, item a item, e acompanhe a evolução do consumo variável ao longo do período."
                  href="/settings/consumo-e-custos/analises"
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="custom-label"
            title="CTA e descrição custom"
            lead="ctaLabel troca o rótulo do botão; description é opcional. Genérica pra qualquer relatório, não só Consumo e custos."
          >
            <Stage label="Sem descrição, rótulo próprio">
              <div className="w-full max-w-[860px]">
                <AwReportPromo
                  art="arcs"
                  title="Relatório de desempenho"
                  href="/settings/consumo-e-custos/analises"
                  ctaLabel="Abrir relatório"
                />
              </div>
            </Stage>
          </Section>

          <Section id="api" title="API" lead="Props do componente.">
            <ApiTable>
              <PropRow
                prop="title"
                type="React.ReactNode"
                doc="Título — em geral o nome do relatório/feature. Renderiza como h4."
              />
              <PropRow
                prop="description"
                type="React.ReactNode"
                doc="Linha de apoio. Opcional; mantenha curta (1–2 linhas)."
              />
              <PropRow
                prop="href"
                type="string"
                doc="Destino do CTA."
              />
              <PropRow
                prop="ctaLabel"
                type="string"
                def='"Acessar relatório"'
                doc="Rótulo do botão."
              />
              <PropRow
                prop="art"
                type='"arcs" | "blocks"'
                def='"arcs"'
                doc="Arte do tile de marca."
              />
              <PropRow
                prop="illustrationSrc"
                type="string"
                doc="Sobrescreve a arte por uma imagem custom (ignora art)."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Classes extras aplicadas no card raiz."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  )
}
