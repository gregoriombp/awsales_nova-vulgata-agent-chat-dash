import { AwTable } from "@/components/ui/AwTable"
import { AwPill } from "@/components/ui/AwPill"
import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"

export default function TablePage() {
  return (
    <>
      <PageHero title="Tabela">
        Lista densa de entidades. Bordas sutis, hover discreto,{" "}
          <strong>zero zebra</strong>. Dados numéricos e técnicos em mono,
          alinhados à direita.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="default"
          title="Exemplo"
          lead="Headers em eyebrow tracked. Nome da entidade na primeira coluna, em font-heading. Números e IDs em mono."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <AwTable>
              <thead>
                <tr>
                  <th>Agente</th>
                  <th>Status</th>
                  <th className="aw-table__mono">Versão</th>
                  <th className="aw-table__num">Conversas</th>
                  <th className="aw-table__num">Resolução</th>
                  <th className="aw-table__mono">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="aw-table__name">Atendimento FAQ</td>
                  <td>
                    <AwPill variant="live">live</AwPill>
                  </td>
                  <td className="aw-table__mono">v12.4</td>
                  <td className="aw-table__num">1 840</td>
                  <td
                    className="aw-table__num"
                    style={{ color: "var(--aw-emerald-700)" }}
                  >
                    94%
                  </td>
                  <td className="aw-table__mono">14 min atrás</td>
                </tr>
                <tr>
                  <td className="aw-table__name">Pré-venda B2B</td>
                  <td>
                    <AwPill variant="ai">pensando</AwPill>
                  </td>
                  <td className="aw-table__mono">v08.1</td>
                  <td className="aw-table__num">412</td>
                  <td
                    className="aw-table__num"
                    style={{ color: "var(--aw-emerald-700)" }}
                  >
                    87%
                  </td>
                  <td className="aw-table__mono">2 h atrás</td>
                </tr>
                <tr>
                  <td className="aw-table__name">Onboarding SDK</td>
                  <td>
                    <AwPill variant="draft">rascunho</AwPill>
                  </td>
                  <td className="aw-table__mono">v01.0</td>
                  <td className="aw-table__num">—</td>
                  <td className="aw-table__num">—</td>
                  <td className="aw-table__mono">ontem</td>
                </tr>
                <tr>
                  <td className="aw-table__name">Retenção pós-venda</td>
                  <td>
                    <AwPill variant="error">erro</AwPill>
                  </td>
                  <td className="aw-table__mono">v04.2</td>
                  <td className="aw-table__num">86</td>
                  <td
                    className="aw-table__num"
                    style={{ color: "var(--aw-red-700)" }}
                  >
                    41%
                  </td>
                  <td className="aw-table__mono">4 h atrás</td>
                </tr>
                <tr>
                  <td className="aw-table__name">Qualificação inbound</td>
                  <td>
                    <AwPill variant="beta">beta</AwPill>
                  </td>
                  <td className="aw-table__mono">v02.0</td>
                  <td className="aw-table__num">233</td>
                  <td
                    className="aw-table__num"
                    style={{ color: "var(--aw-emerald-700)" }}
                  >
                    76%
                  </td>
                  <td className="aw-table__mono">1 d atrás</td>
                </tr>
              </tbody>
            </AwTable>
          </div>
        </Section>

        <Section
          id="columns"
          title="Tipos de coluna"
          lead="Três classes utilitárias cobrem 95% dos casos. Combine com o próprio <td> normal para texto padrão."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k=".aw-table__name"
              v="heading 500 · --fg-primary"
              d="Nome da entidade principal; primeira coluna da linha."
            />
            <Spec
              k=".aw-table__mono"
              v="mono 12 · --fg-secondary"
              d="IDs, versões, timestamps. Alinha à esquerda."
            />
            <Spec
              k=".aw-table__num"
              v="mono 12 · right-align"
              d="Contagens, porcentagens, valores agregados."
            />
          </div>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="A estética é de lista densa sóbria — não planilha. Hover ilumina a linha inteira; não há linhas alternadas."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="padding"
              v="10 · 14"
              d="Vertical · horizontal, em th e td."
            />
            <Spec
              k="header"
              v="10.5 px · 600 · uppercase · 0.14em"
              d="--fg-tertiary sobre --bg-surface."
            />
            <Spec
              k="hover row"
              v="--bg-surface"
              d="Transição 120ms — discreta, sem pulse."
            />
            <Spec
              k="divisor"
              v="1px --border-subtle"
              d="Última linha não tem divisor."
            />
            <Spec
              k="radius"
              v="--radius-md"
              d="overflow: hidden evita sobrepor no corner."
            />
            <Spec
              k="numeric"
              v="mono · right-align"
              d="Sempre mono em coluna numérica — alinha o ponto decimal."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwTable } from "@/components/ui/AwTable".`}
        >
          <ApiTable>
            <PropRow
              prop="children"
              type="ReactNode"
              doc="Estrutura nativa de tabela: <thead>, <tbody>, <tr>, <th>, <td>."
            />
            <PropRow
              prop="...rest"
              type="TableHTMLAttributes"
              doc="Qualquer atributo nativo de <table>."
            />
          </ApiTable>

          <CodeExample>{`import { AwTable } from "@/components/ui/AwTable"
import { AwPill } from "@/components/ui/AwPill"

<AwTable>
  <thead>
    <tr>
      <th>Agente</th>
      <th>Status</th>
      <th className="aw-table__mono">Versão</th>
      <th className="aw-table__num">Conversas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="aw-table__name">Atendimento FAQ</td>
      <td><AwPill variant="live">live</AwPill></td>
      <td className="aw-table__mono">v12.4</td>
      <td className="aw-table__num">1 840</td>
    </tr>
  </tbody>
</AwTable>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Números em mono alinhados à direita.</>,
              <>Status via AwPill, não via texto colorido.</>,
              <>Coluna “nome” sempre em font-heading destacando a entidade.</>,
            ]}
              donts={[
              <>Zebra striping. A estética é sóbria, lista densa.</>,
              <>Ações inline por linha que não tenham ícone-only (vira ruído).</>,
              <>Tabela com paginação em lugar onde cabe uma lista de 8 itens.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
