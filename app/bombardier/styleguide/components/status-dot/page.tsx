import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { AwStatusDot } from "@/components/ui/AwStatusDot"
import {
  PageHero,
  Section,
  Stage,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"

export default function StatusDotPage() {
  return (
    <>
      <PageHero title="Status dot">
        Indicador puntual de estado — &quot;essa coisa está ligada / com
        atenção / offline&quot;. Reaproveita os anchors emerald / amber /
        gray do design system. Pode ser sobreposto a logos e avatares com{" "}
        <code className="mono">ring</code>.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="variants"
            title="Variantes"
            lead="Cinco anchors semânticos. Mantenha o significado consistente — live = funcionando, attention = ação requerida, offline = desligado, info = informativo, neutral = inerte."
          >
            <Stage label="variant">
              <span className="inline-flex items-center gap-2">
                <AwStatusDot variant="live" />
                <span className="text-sm">Live</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <AwStatusDot variant="attention" />
                <span className="text-sm">Attention</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <AwStatusDot variant="offline" />
                <span className="text-sm">Offline</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <AwStatusDot variant="info" />
                <span className="text-sm">Info</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <AwStatusDot variant="neutral" />
                <span className="text-sm">Neutral</span>
              </span>
            </Stage>
          </Section>

          <Section
            id="sizes"
            title="Tamanhos"
            lead="Três tamanhos. xs (6px) para inline em texto pequeno; sm (8px) default; md (10px) para overlay em logos."
          >
            <Stage label="size · xs / sm / md">
              <AwStatusDot size="xs" />
              <AwStatusDot size="sm" />
              <AwStatusDot size="md" />
            </Stage>
          </Section>

          <Section
            id="ring"
            title="Ring (overlay)"
            lead="ring={true} adiciona uma borda fina da cor da superfície — necessário ao sobrepor a logos/avatares para garantir contraste."
          >
            <Stage label="absolute + ring sobre AwBrandLogo">
              <div className="relative">
                <AwBrandLogo brand="whatsapp" size="md" />
                <AwStatusDot variant="live" size="md" ring absolute />
              </div>
              <div className="relative">
                <AwBrandLogo brand="stripe" size="md" />
                <AwStatusDot variant="attention" size="md" ring absolute />
              </div>
              <div className="relative">
                <AwBrandLogo brand="instagram" size="lg" />
                <AwStatusDot variant="offline" size="md" ring absolute />
              </div>
            </Stage>
          </Section>

          <Section
            id="pulse"
            title="Pulse"
            lead="pulse anima a opacidade do dot. Use só quando o estado for transiente / requer atenção imediata. Evite empilhar pulse em vários dots da mesma view."
          >
            <Stage label="pulse={true}">
              <AwStatusDot variant="live" pulse />
              <AwStatusDot variant="attention" size="md" pulse />
              <AwStatusDot variant="info" size="md" pulse />
            </Stage>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Cores referenciam tokens — não hex literais."
          >
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec k="size xs" v="6px" />
              <Spec k="size sm" v="8px (default)" />
              <Spec k="size md" v="10px" />
              <Spec k="live" v="--aw-emerald-500" />
              <Spec k="attention" v="--aw-amber-500" />
              <Spec k="offline" v="--aw-gray-500" />
              <Spec k="info" v="--aw-blue-500" />
              <Spec k="neutral" v="--fg-tertiary" />
              <Spec k="ring" v="2–3px · --bg-raised" d="proporcional ao size." />
            </div>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwStatusDot } from "@/components/ui/AwStatusDot".`}
          >
            <ApiTable>
              <PropRow
                prop="variant"
                type='"live" | "attention" | "offline" | "info" | "neutral"'
                def='"live"'
                doc="Anchor semântico do estado."
              />
              <PropRow
                prop="size"
                type='"xs" | "sm" | "md"'
                def='"sm"'
                doc="Diâmetro do dot."
              />
              <PropRow
                prop="ring"
                type="boolean"
                def="false"
                doc="Adiciona borda --bg-raised. Use ao sobrepor a outros elementos."
              />
              <PropRow
                prop="pulse"
                type="boolean"
                def="false"
                doc="Anima opacidade — só para estados transientes."
              />
              <PropRow
                prop="absolute"
                type="boolean"
                def="false"
                doc="Posiciona absoluto no canto superior direito do parent."
              />
            </ApiTable>
            <CodeExample>{`import { AwStatusDot } from "@/components/ui/AwStatusDot"

<AwStatusDot variant="live" />

{/* Overlay sobre AwBrandLogo */}
<div className="relative">
  <AwBrandLogo brand="whatsapp" />
  <AwStatusDot variant="live" size="md" ring absolute />
</div>`}</CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use ring quando o dot sobrepõe outro elemento.</>,
                <>Mantenha a semântica das variantes (não use live para alerta).</>,
                <>Combine com texto de status quando a cor sozinha não for clara.</>,
              ]}
              donts={[
                <>Usar como decoração — o dot carrega significado.</>,
                <>Pulse em dots estáticos.</>,
                <>Tamanhos custom inline — use o size prop.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
