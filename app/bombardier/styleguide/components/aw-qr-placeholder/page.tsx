"use client"

import { AwQrPlaceholder } from "@/components/ui/AwQrPlaceholder"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  RelatedLinks,
  Section,
  Spec,
  Stage,
  Tldr,
  TokensConsumed,
} from "../../_primitives"

export default function AwQrPlaceholderPage() {
  return (
    <>
      <PageHero title="QR placeholder">
        QR fake determinístico — só visual, não decodifica nada. Serve de
        placeholder nas telas de 2FA (app autenticador) e Pix enquanto o QR real
        não é gerado no back. O padrão é estável entre renders (seed fixa) pra
        não “piscar”.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Em protótipos/hi-fi onde a tela precisa <b>mostrar um QR</b> mas o
              código real ainda não existe (setup TOTP, Pix).
            </>,
            <>
              Quando você quer o mesmo placeholder de QR em vários fluxos — fonte
              única, sem copiar o gerador.
            </>,
          ]}
          dontUse={[
            <>
              Em produção com QR <b>real</b> — aí gere o QR de verdade (a partir
              do segredo TOTP / payload Pix), não este placeholder.
            </>,
            <>
              Como imagem decorativa genérica — é semanticamente um QR (
              <code className="mono">role=&quot;img&quot;</code>).
            </>,
          ]}
        />

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Uma matriz 21×21 gerada por LCG com seed fixa, com os 3 finders (cantos) desenhados por cima. Quadrado branco com borda sutil."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="matriz" v="21 × 21" d="Densidade fixa; cada célula é um quadradinho com aspect 1:1." />
            <Spec k="finders" v="3 cantos" d="Os marcadores de canto do QR são desenhados (não aleatórios)." />
            <Spec k="seed" v="fixa (LCG)" d="Mesmo padrão sempre — não regenera a cada render." />
            <Spec k="tamanho" v="px (default 148)" d="Lado do quadrado via prop px (inline style, não classe arbitrária)." />
            <Spec k="cores" v="preto/branco" d="#0D0D0D / #FFFFFF — cores do próprio QR, não tokens de marca." />
            <Spec k="a11y" v="role=img" d="aria-label customizável ('QR code' por padrão)." />
          </div>
        </Section>

        <Section
          id="variants"
          title="Tamanhos"
          lead="Um único componente, lado controlado por px."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stage label="96 px" gridClassName="flex justify-center">
              <AwQrPlaceholder px={96} />
            </Stage>
            <Stage label="148 px (default)" gridClassName="flex justify-center">
              <AwQrPlaceholder />
            </Stage>
            <Stage label="200 px" gridClassName="flex justify-center">
              <AwQrPlaceholder px={200} />
            </Stage>
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwQrPlaceholder } from "@/components/ui/AwQrPlaceholder".`}
        >
          <ApiTable>
            <PropRow prop="px" type="number" def="148" doc="Lado do quadrado, em px." />
            <PropRow prop="ariaLabel" type="string" def="QR code" doc="Rótulo acessível do role=img." />
            <PropRow prop="className" type="string" doc="Classes extras no container." />
          </ApiTable>

          <CodeExample label="no setup de 2FA (convite/seguranca)">{`import { AwQrPlaceholder } from "@/components/ui/AwQrPlaceholder"

<AwQrPlaceholder ariaLabel="QR code do app autenticador" />`}</CodeExample>

          <CodeExample label="no Pix (onboarding/PagamentoBody)">{`<AwQrPlaceholder px={140} ariaLabel="QR code Pix" />`}</CodeExample>
        </Section>

        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="Só tokens existentes. As cores internas preto/branco são do QR, não da marca."
        >
          <TokensConsumed
            tokens={[
              { token: "--border-subtle", role: "borda do quadrado", value: "var(--aw-gray-200)" },
              { token: "(branco)", role: "fundo do QR", value: "bg-white" },
            ]}
          />
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Usar como placeholder visual de QR em protótipo/hi-fi.</>,
              <>Reusar este componente em vez de recopiar o gerador de QR fake.</>,
              <>Passar um <code className="mono">ariaLabel</code> que diga o que o QR representa.</>,
            ]}
            donts={[
              <>Confiar que ele decodifica algo — é puramente decorativo.</>,
              <>Mandar pra produção no lugar do QR real.</>,
              <>Recriar a matriz inline numa página (foi o que consolidamos aqui).</>,
            ]}
          />
        </Section>

        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              { name: "Backup codes", href: "/bombardier/styleguide/components/aw-backup-codes", description: "Outro bloco do setup de 2FA." },
              { name: "Login e autenticação", href: "/bombardier/styleguide/ux-flows/login-auth", description: "Onde o QR de 2FA aparece." },
              { name: "Onboarding shell", href: "/bombardier/styleguide/components/aw-onboarding-shell", description: "Casca dos fluxos de onboarding." },
            ]}
          />
        </Section>
      </div>
    </>
  )
}
