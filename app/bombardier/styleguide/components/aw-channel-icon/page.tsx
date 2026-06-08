import { AwChannelIcon } from "@/components/ui/AwChannelIcon"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

const CHANNELS = [
  { id: "whatsapp", name: "WhatsApp" },
  { id: "instagram", name: "Instagram" },
  { id: "messenger", name: "Messenger" },
  { id: "telegram", name: "Telegram" },
  { id: "email", name: "E-mail" },
  { id: "slack", name: "Slack" },
] as const

export default function ChannelIconPage() {
  return (
    <>
      <PageHero title="Channel icon">
        Glifo de marca em cores cheias, sobre fundo transparente — pra listas e
        pickers de canal onde o ícone mora dentro de uma superfície neutra (uma
        linha de origem, um tile <code className="mono">bg-bg-muted</code>).
        Irmão do <code className="mono">AwBrandLogo</code>: aquele pinta um{" "}
        <em>tile</em> colorido (catálogos, cards); este é só a marca. As cores
        single-value vêm de <code className="mono">lib/brandColors.ts</code>; o
        gradiente do Instagram fica inline como artwork.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-5 py-4 mb-10 text-sm text-(--aw-blue-900)">
          <strong>AwChannelIcon vs AwBrandLogo.</strong> Use{" "}
          <code className="mono">AwChannelIcon</code> pra um glifo solto num
          tile neutro. Pra um tile colorido com a cor da marca, use{" "}
          <a
            href="/bombardier/styleguide/components/brand-logo"
            className="underline underline-offset-2 hover:text-(--aw-blue-700)"
          >
            AwBrandLogo
          </a>
          .
        </div>

        <div className="flex flex-col gap-16">
          <Section
            id="canais"
            title="Canais"
            lead="Os seis canais de mensageria suportados. Marcas single-value puxam a cor de brandColors.ts; o Instagram mantém o gradiente."
          >
            <Stage label="channel">
              {CHANNELS.map((c) => (
                <div key={c.id} className="flex flex-col items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--bg-muted)">
                    <AwChannelIcon channel={c.id} />
                  </span>
                  <span className="text-xs text-(--fg-tertiary)">{c.name}</span>
                </div>
              ))}
            </Stage>
          </Section>

          <Section
            id="tamanhos"
            title="Tamanhos"
            lead="size em px — o glifo escala junto. Default 24."
          >
            <Stage label="size · 16 / 24 / 32 / 40">
              <AwChannelIcon channel="whatsapp" size={16} />
              <AwChannelIcon channel="whatsapp" size={24} />
              <AwChannelIcon channel="whatsapp" size={32} />
              <AwChannelIcon channel="whatsapp" size={40} />
            </Stage>
          </Section>

          <Section
            id="fallback"
            title="Fallback"
            lead="Canal desconhecido cai num marcador neutro com tokens do produto (sem cor de marca)."
          >
            <Stage label='channel="desconhecido"'>
              <AwChannelIcon channel="desconhecido" size={32} />
            </Stage>
          </Section>

          <Section id="api" title="API">
            <ApiTable>
              <PropRow
                prop="channel"
                type="AwChannelId | string"
                doc="Identificador do canal. Ids fora do registry caem no marcador neutro."
              />
              <PropRow
                prop="size"
                type="number"
                def="24"
                doc="Lado do quadrado em px."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Classes extras aplicadas ao <svg>."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  )
}
