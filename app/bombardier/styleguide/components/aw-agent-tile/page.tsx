import { AwAgentTile } from "@/components/ui/AwAgentTile"
import { AwCard } from "@/components/ui/AwCard"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

/**
 * AwAgentTile — card de navegação de um agente: orb (ou ícone tonal),
 * título, descrição, autor e contagem opcional. É o "card de navegação"
 * canônico referenciado pelo Capability tile — pra abrir uma rota, use
 * este tile, não o Capability (que só concede permissão).
 */

export default function AwAgentTilePage() {
  return (
    <>
      <PageHero title="Agent tile">
        Card de um agente para grades de galeria/marketplace: orb à esquerda
        (ou ícone tonal quando não há orb), título, descrição em duas linhas,
        autor e uma contagem opcional. Vira link quando recebe{" "}
        <code className="mono">href</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Com orb"
            lead="Quando o agente tem orb, ele ocupa o slot da esquerda no lugar do container tonal. Grid 2-col dentro de um AwCard."
          >
            <Stage label="Galeria de agentes · 2 colunas">
              <div className="w-full max-w-[820px]">
                <AwCard className="p-2!">
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <AwAgentTile
                      avatarSrc="/assets/agent_imgs/orbs/orb_model-a_01-1.png"
                      title="SDR Outbound"
                      description="Prospecta, qualifica e agenda reuniões a partir das listas de leads."
                      authorName="Gregorio Pinheiro"
                      count={12}
                      href="#"
                    />
                    <AwAgentTile
                      avatarSrc="/assets/agent_imgs/orbs/orb_model-a_08-1.png"
                      title="Suporte N1"
                      description="Responde dúvidas de produto e abre tickets quando precisa escalar."
                      authorName="Equipe Aswork"
                      count={8}
                      href="#"
                    />
                  </div>
                </AwCard>
              </div>
            </Stage>
          </Section>

          <Section
            id="tonal"
            title="Sem orb — ícone tonal"
            lead="Sem avatarSrc, o tile usa um container colorido com Material Symbol. A prop tone escolhe a paleta (lime, amber, emerald, blue, purple, pink, neutral)."
          >
            <Stage label="Ícones tonais">
              <div className="flex w-full max-w-[420px] flex-col gap-1">
                <AwAgentTile
                  icon="insights"
                  tone="blue"
                  title="Analista de Pipeline"
                  description="Resume o funil e aponta negócios parados."
                  authorName="Gregorio Pinheiro"
                  href="#"
                />
                <AwAgentTile
                  icon="campaign"
                  tone="amber"
                  title="Copy de Campanha"
                  description="Gera variações de mensagem por segmento."
                  authorName="Equipe Aswork"
                  href="#"
                />
                <AwAgentTile
                  icon="fact_check"
                  tone="emerald"
                  title="Revisor de Contrato"
                  description="Confere cláusulas contra o playbook jurídico."
                  authorName="Gregorio Pinheiro"
                  href="#"
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="static"
            title="Sem href (estático)"
            lead="Sem href o tile não vira link nem aplica o hover — útil pra previews ou cabeçalhos de seção."
          >
            <Stage label="Tile estático">
              <div className="w-full max-w-[420px]">
                <AwAgentTile
                  icon="smart_toy"
                  tone="purple"
                  title="Agente sem rota"
                  description="Renderiza como bloco, sem cursor de clique."
                  authorName="Equipe Aswork"
                />
              </div>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Vira <Link> do next/link quando href está presente; senão renderiza um bloco estático."
          >
            <ApiTable>
              <PropRow
                prop="avatarSrc"
                type="string"
                doc="Caminho do orb do agente. Quando presente, ocupa o slot do ícone tonal."
              />
              <PropRow
                prop="icon"
                type="string"
                doc="Material Symbol exibido no container tonal — usado quando avatarSrc está ausente."
              />
              <PropRow
                prop="tone"
                type="AwAgentTileTone"
                def="neutral"
                doc="Paleta do container do ícone: lime · amber · emerald · blue · purple · pink · neutral. Ignorada quando há avatarSrc."
              />
              <PropRow
                prop="title"
                type="string"
                doc="Nome do agente, peso medium. Obrigatório."
              />
              <PropRow
                prop="description"
                type="string"
                doc="Resumo em até duas linhas (line-clamp). Obrigatório."
              />
              <PropRow
                prop="authorName"
                type="string"
                doc="Autor exibido com avatar derivado das iniciais. Obrigatório."
              />
              <PropRow
                prop="authorAvatar"
                type="string"
                doc="Imagem do autor; cai nas iniciais quando ausente."
              />
              <PropRow
                prop="count"
                type="number"
                doc="Contagem opcional ao lado do autor (ex.: instalações)."
              />
              <PropRow
                prop="href"
                type="string"
                doc="Destino da navegação. Quando presente, o card vira link e ganha hover."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  )
}
