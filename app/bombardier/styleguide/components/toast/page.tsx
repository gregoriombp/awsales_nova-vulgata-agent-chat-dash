import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"
import { ToastDemo } from "./ToastDemo"

export default function ToastPage() {
  return (
    <>
      <PageHero title="Toast">
        Feedback pós-ação no canto inferior direito. Ficam 4 s por padrão —
        8 s quando há ação de <em>desfazer</em>. <strong>Nunca</strong>{" "}
        usamos toast para erro que exige decisão — nesse caso, alert inline
        ou modal.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="demo"
          title="Demo"
          lead="Clique pra disparar. Toasts empilham no canto inferior direito, até 3 visíveis."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8">
            <ToastDemo />
          </div>
        </Section>

        <Section
          id="variants"
          title="Variantes"
          lead="5 variantes. Cor só aparece no ícone e no link de ação inline — o corpo do toast continua neutro em ambos os modos."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="success"
              v="check_circle · emerald-600"
              d="Ação concluída (publicar, salvar, enviar)."
            />
            <Spec
              k="ai"
              v="auto_awesome · blue-600"
              d="Resultado de agente. Link de ação vira azul."
            />
            <Spec
              k="error"
              v="error · red-600"
              d="Falha reversível (rede, timeout). Com retry inline."
            />
            <Spec
              k="warning"
              v="warning · amber-500"
              d="Atenção não-bloqueante (quota, versão desatualizada)."
            />
            <Spec
              k="info"
              v="info · fg-tertiary"
              d="Feedback neutro, sem urgência."
            />
          </div>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Dois rótulos no máximo — título verbal + uma linha de detalhe ou ação."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="posição"
              v="bottom-right · 20 px gap"
              d="Empilha verticalmente, mais recente no topo do stack."
            />
            <Spec
              k="largura"
              v="até 420 px"
              d="Uma linha de título + uma linha de desc."
            />
            <Spec
              k="duração"
              v="4 s default · 8 s com ação"
              d="0 (duration=0) mantém até dismiss manual."
            />
            <Spec
              k="máximo visível"
              v="3"
              d="Excedentes aguardam em fila."
            />
            <Spec
              k="shadow"
              v="--shadow-lg"
              d="Elevação maior que cards — flutua sobre tudo."
            />
            <Spec
              k="motion"
              v="translateY(8 → 0) · 220 ms"
              d="Exit fade 160 ms ease-in-out."
            />
            <Spec
              k="link de ação"
              v="inline · underline"
              d="Nunca botão dentro do toast — link sublinhado na cor da variante."
            />
            <Spec
              k="close"
              v="× no canto direito"
              d="Sempre presente para dismiss manual."
            />
            <Spec
              k="aria-live"
              v="polite"
              d="Leitor anuncia o novo toast sem interromper."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { useToast, AwToastProvider } from "@/components/ui/AwToast". Envolva o app em <AwToastProvider> uma vez (layout raiz).`}
        >
          <h3 className="text-(--h5-size) font-medium mt-4 mb-3">
            useToast().push(opts)
          </h3>
          <ApiTable>
            <PropRow
              prop="title"
              type="ReactNode"
              doc="Título em font-heading. Obrigatório."
            />
            <PropRow
              prop="description"
              type="ReactNode"
              doc="Segunda linha opcional."
            />
            <PropRow
              prop="variant"
              type='"success" | "ai" | "error" | "warning" | "info"'
              def='"success"'
              doc="Cor do ícone e do link de ação."
            />
            <PropRow
              prop="icon"
              type="string"
              doc="Material Symbols glyph para sobrescrever o default da variante."
            />
            <PropRow
              prop="action"
              type="{ label, onClick }"
              doc='Ação inline (ex.: "desfazer", "tentar novamente"). Dobra a duração para 8 s.'
            />
            <PropRow
              prop="duration"
              type="number"
              def="4000 · 8000"
              doc="Tempo em ms até auto-dismiss. 0 desliga auto-dismiss."
            />
          </ApiTable>

          <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-4 py-3 text-sm text-(--aw-blue-900) mt-4">
            <code className="mono">variant</code> vira token de{" "}
            <code className="mono">className</code>; title, description e
            action viram filhos com classes próprias. O toast é instanciado
            via hook no produto — o markup à esquerda só ilustra o resultado
            renderizado.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">styleguide · HTML + className</div>
              <CodeExample label="success">{`<div
  className="toast success"
  role="status"
>
  <span
    className="toast-icon"
    data-icon="check_circle"
  />
  <div className="toast-body">
    <strong className="toast-title">
      Agente publicado
    </strong>
    <p className="toast-description">
      Live em Web e WhatsApp.
    </p>
  </div>
</div>`}</CodeExample>
              <CodeExample label="ai com ação inline">{`<div className="toast ai" role="status">
  <span
    className="toast-icon"
    data-icon="auto_awesome"
  />
  <div className="toast-body">
    <strong className="toast-title">
      6 respostas reescritas
    </strong>
    <p className="toast-description">
      Revise antes de publicar
    </p>
    <button className="toast-action">
      desfazer
    </button>
  </div>
</div>`}</CodeExample>
            </div>

            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">produto · useToast()</div>
              <CodeExample label="success">{`"use client"
import { useToast } from "@/components/ui/AwToast"

function PublishButton() {
  const { push } = useToast()

  const onPublish = async () => {
    await api.publish()
    push({
      variant: "success",
      title: "Agente publicado",
      description: "Live em Web e WhatsApp.",
    })
  }

  return (
    <AwButton onClick={onPublish}>
      Publicar
    </AwButton>
  )
}`}</CodeExample>
              <CodeExample label="ai com desfazer (8s)">{`push({
  variant: "ai",
  title: "6 respostas reescritas",
  description: "Revise antes de publicar",
  action: {
    label: "desfazer",
    onClick: undoRewrite,
  },
})`}</CodeExample>
              <CodeExample label="setup no layout raiz">{`import { AwToastProvider } from "@/components/ui/AwToast"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AwToastProvider>
          {children}
        </AwToastProvider>
      </body>
    </html>
  )
}`}</CodeExample>
            </div>
          </div>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Título verbal curto ({"<"} 32 chars) + 1 linha de detalhe.</>,
              <>Ação inline como link sublinhado, nunca botão.</>,
              <>Máximo 3 toasts visíveis; deixar fila para o resto.</>,
              <>Aria-live polite — leitor anuncia sem roubar foco.</>,
            ]}
            donts={[
              <>Toast para erro que exige decisão do usuário.</>,
              <>Toast para confirmação crítica (publicar, excluir) — use modal.</>,
              <>Texto longo. Mais que 2 linhas vira alerta ou sheet.</>,
              <>Toast com botões. Ação é sempre link.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
