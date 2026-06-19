import { AwStatGroup } from "@/components/ui/AwStatGroup"
import { PageHero, Section, Stage } from "../../_primitives"

/**
 * AwStatGroup — showcase.
 *
 * Faixa de KPIs com uma célula de título à esquerda + células tonalizadas.
 * Component em /components/ui/AwStatGroup.tsx. Nasceu do wireframe de
 * "Acessos à organização" — o título/descrição entram como a 1ª célula, no
 * lugar de ficarem soltos acima do bloco.
 */

export default function AwStatGroupPage() {
  return (
    <>
      <PageHero title="AwStatGroup">
        Faixa de KPIs onde a <strong className="font-medium">primeira
        célula</strong> carrega o título + descrição da seção, e as demais são
        stats <strong className="font-medium">tonalizados</strong> (tile de
        ícone colorido, número grande, label, hint). Pensado pra 2–4 stats numa
        linha só. Só tokens existentes.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="acessos"
            title="Acessos à organização"
            lead="O caso que originou o componente. Título + descrição viram a célula da esquerda; três stats tonalizados (emerald / teal / red) com ícones distintos por métrica — hub, groups, schedule."
          >
            <Stage label="title cell + 3 stats" gridClassName="w-full">
              <AwStatGroup
                title="Acessos à organização"
                description="Quem está com acesso ativo a esta organização. Encerrar um acesso aqui não desconecta a pessoa de outras organizações."
                stats={[
                  {
                    icon: "hub",
                    value: 48,
                    label: "Conexões ativas",
                    hint: "Sessões e apps conectados agora",
                    tone: "emerald",
                  },
                  {
                    icon: "groups",
                    value: 35,
                    label: "Membros da Organização",
                    hint: "Pessoas com acesso ativo.",
                    tone: "teal",
                  },
                  {
                    icon: "schedule",
                    value: 3,
                    label: "Inativos",
                    hint: "Sem uso há 30+ dias",
                    tone: "red",
                  },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="tons"
            title="Tons e ícones"
            lead="O prop tone define a tinta da célula e do tile (emerald, teal, red, blue, amber). O icon é qualquer Material Symbol, renderizado preenchido."
          >
            <Stage label="outros tons" gridClassName="w-full">
              <AwStatGroup
                title="Uso da plataforma"
                description="Resumo rápido do ciclo atual — escolha o tom que combina com a métrica."
                stats={[
                  {
                    icon: "bolt",
                    value: "1.2k",
                    label: "Disparos",
                    hint: "este ciclo",
                    tone: "blue",
                  },
                  {
                    icon: "schedule",
                    value: "2.4 s",
                    label: "Latência p95",
                    hint: "via Claude",
                    tone: "amber",
                  },
                  {
                    icon: "check_circle",
                    value: "98%",
                    label: "Entregabilidade",
                    hint: "últimas 24h",
                    tone: "emerald",
                  },
                ]}
              />
            </Stage>
          </Section>

          <Section
            id="dois-stats"
            title="Dois stats"
            lead="As colunas são iguais (grid-flow-col auto-cols-fr), então o componente se ajusta ao número de stats — a célula de título acompanha a altura."
          >
            <Stage label="title cell + 2 stats" gridClassName="w-full">
              <AwStatGroup
                title="Faturamento"
                description="Visão geral do mês."
                stats={[
                  {
                    icon: "payments",
                    value: "R$ 48k",
                    label: "Receita",
                    hint: "+12% vs. mês anterior",
                    tone: "emerald",
                  },
                  {
                    icon: "credit_card",
                    value: 3,
                    label: "Faturas em aberto",
                    hint: "1 vencida",
                    tone: "red",
                  },
                ]}
              />
            </Stage>
          </Section>
        </div>
      </div>
    </>
  )
}
