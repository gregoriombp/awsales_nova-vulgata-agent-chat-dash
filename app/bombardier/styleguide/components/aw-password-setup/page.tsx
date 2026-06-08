"use client"

import { AwPasswordSetup } from "@/components/ui/AwPasswordSetup"
import {
  ApiTable,
  CodeExample,
  DoDont,
  KeyboardTable,
  PageHero,
  PropRow,
  RelatedLinks,
  Section,
  Spec,
  Stage,
  Tldr,
  TokensConsumed,
} from "../../_primitives"

export default function AwPasswordSetupPage() {
  return (
    <>
      <PageHero title="Password setup">
        Bloco canônico de “criar uma senha”, compartilhado por todos os fluxos
        de onboarding (membro, responsável). A regra vive num lugar só —{" "}
        <code className="mono">lib/password-policy</code> (NIST 800-63-4):
        comprimento mínimo, sem regras de complexidade, aceita frase secreta,
        checagem de vazamento (HIBP) e um medidor de força só consultivo.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Em qualquer tela onde o usuário <b>define</b> uma senha nova
              (primeiro acesso do responsável, convite de membro, reset).
            </>,
            <>
              Quando você quer a mesma regra de senha em todos os fluxos —
              corrige em <code className="mono">password-policy</code> e alinha
              todos.
            </>,
          ]}
          dontUse={[
            <>
              Para <b>login</b> (só digitar a senha existente) — ali é{" "}
              <code className="mono">AwInput</code> /{" "}
              <code className="mono">PasswordInput</code>, sem requisito nem
              medidor.
            </>,
            <>
              Para exigir maiúscula/número/símbolo — o NIST 800-63-4 §5.1.1.2
              desencoraja; não recrie complexidade aqui.
            </>,
          ]}
        />

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Dois campos (nova + confirmar), um único requisito rígido (comprimento), medidor de força consultivo, nota de vazamento, dica de frase secreta e rodapé com voltar + enviar."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="campos" v="2 × password" d="Nova senha + confirmar, com toggle mostrar/ocultar compartilhado." />
            <Spec k="requisito" v="≥ 10 chars" d="Único gate. Sem complexidade. Vem de PASSWORD_MIN_LENGTH." />
            <Spec k="medidor" v="4 segmentos" d="Consultivo (não trava). evaluatePassword → score 0–4." />
            <Spec k="vazamento" v="HIBP (copy)" d="Microcopy 'bloqueamos senhas vazadas'. Back faz o check real." />
            <Spec k="dica" v="frase secreta" d="Incentivo a passphrase em vez de senha curta." />
            <Spec k="match" v="borda âmbar/esmeralda" d="Confirmar reflete igualdade em tempo real." />
            <Spec k="rodapé" v="voltar + enviar" d="Enviar habilita só com ≥10 chars E confirmação batendo." />
            <Spec k="submitting" v="loader 1100 ms" d="'Criando sua conta segura…' + botões travados." />
          </div>
        </Section>

        <Section
          id="variants"
          title="Variantes"
          lead="A mesma regra, dois enquadramentos de rodapé. Largura controlada pelo container pai (aqui ~400px, como no onboarding shell)."
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Stage label="responsável — sem nota de segurança" gridClassName="flex justify-center w-full">
              <div className="w-full max-w-[400px]">
                <AwPasswordSetup
                  email="rafael.almeida@fyntra.com.br"
                  submitLabel="Criar conta e entrar"
                  onBack={() => {}}
                  onSubmit={() => {}}
                />
              </div>
            </Stage>

            <Stage label="membro — com nota de segurança" gridClassName="flex justify-center w-full">
              <div className="w-full max-w-[400px]">
                <AwPasswordSetup
                  email="ana.souza@fyntra.com.br"
                  submitLabel="Criar conta e continuar"
                  showSecurityNote
                  onBack={() => {}}
                  onSubmit={() => {}}
                />
              </div>
            </Stage>
          </div>
        </Section>

        <Section
          id="states"
          title="Comportamento"
          lead="O componente gerencia o próprio estado — interaja na demo acima. Os estados observáveis:"
        >
          <ul className="body-sm text-(--fg-secondary) flex flex-col gap-1.5 m-0 pl-4 list-disc">
            <li>
              <b>Vazio</b> — requisito cinza, medidor em “—”, enviar desabilitado.
            </li>
            <li>
              <b>{"< 10 caracteres"}</b> — requisito segue cinza, força no máximo
              “fraca”, enviar desabilitado.
            </li>
            <li>
              <b>≥ 10 caracteres</b> — requisito fica verde; o medidor sobe por
              comprimento (variedade só dá um empurrãozinho).
            </li>
            <li>
              <b>Confirmação</b> — borda esmeralda quando bate, âmbar quando
              diverge (em tempo real).
            </li>
            <li>
              <b>Válido</b> (≥10 E confirmação batendo) — enviar habilita.
            </li>
            <li>
              <b>Enviando</b> — loader “Criando sua conta segura…”, botões
              travados por ~1,1 s antes de <code className="mono">onSubmit</code>.
            </li>
          </ul>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwPasswordSetup } from "@/components/ui/AwPasswordSetup".`}
        >
          <ApiTable>
            <PropRow prop="onSubmit" type="() => void" doc="Chamado após o delay de 'criando…' quando o form é válido. Required." />
            <PropRow prop="email" type="string" doc="Compõe o subtítulo padrão ('Você usará <email>…')." />
            <PropRow prop="title" type="string" def="Defina uma senha forte" doc="Título do bloco." />
            <PropRow prop="subtitle" type="ReactNode" def="(via email)" doc="Sobrescreve o subtítulo. Passe null para ocultar." />
            <PropRow prop="submitLabel" type="string" def="Criar conta e continuar" doc="Rótulo do botão de envio." />
            <PropRow prop="submittingLabel" type="string" def="Criando…" doc="Rótulo durante o envio." />
            <PropRow prop="onBack" type="() => void" doc="Se passado, mostra o botão Voltar no rodapé." />
            <PropRow prop="backLabel" type="string" def="Outro método" doc="Rótulo do botão Voltar." />
            <PropRow prop="showSecurityNote" type="boolean" def="false" doc="Mostra 'Conexão criptografada' no rodapé." />
            <PropRow prop="className" type="string" doc="Classes extras no container raiz." />
          </ApiTable>

          <CodeExample label="no fluxo do membro (app/convite/conta)">{`import { AwPasswordSetup } from "@/components/ui/AwPasswordSetup"

<AwPasswordSetup
  email={CONVITE_INVITEE.email}
  submitLabel="Criar conta e continuar"
  showSecurityNote
  onBack={() => setMode("choose")}
  onSubmit={() => router.push("/convite/perfil?metodo=senha")}
/>`}</CodeExample>

          <CodeExample label="a regra vive num lugar só">{`import { evaluatePassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy"

const ev = evaluatePassword(pwd)
ev.longEnough  // pwd.length >= PASSWORD_MIN_LENGTH (10)
ev.score       // 0–4, consultivo
ev.label       // "razoável" | "forte" | …`}</CodeExample>
        </Section>

        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="Só tokens existentes — nenhum token novo foi criado."
        >
          <TokensConsumed
            tokens={[
              { token: "--fg-primary", role: "título, valor digitado", value: "var(--aw-gray-1200)" },
              { token: "--fg-secondary", role: "subtítulo, labels", value: "var(--aw-gray-800)" },
              { token: "--fg-tertiary", role: "dicas, medidor, ícones", value: "var(--aw-gray-600)" },
              { token: "--bg-raised", role: "fundo dos campos", value: "var(--aw-white)" },
              { token: "--bg-muted", role: "segmento vazio do medidor / chip", value: "var(--aw-gray-200)" },
              { token: "--border-subtle", role: "divisória do rodapé", value: "var(--aw-gray-200)" },
              { token: "--aw-emerald-500", role: "medidor preenchido / borda match", value: "#5BDF9E" },
              { token: "--aw-emerald-700", role: "requisito atendido", value: "#22A871" },
              { token: "--aw-amber-500", role: "borda de divergência", value: "#E6762F" },
            ]}
          />
        </Section>

        <Section
          id="accessibility"
          title="Acessibilidade"
          lead="Campos com <label> associado; o toggle mostrar/ocultar fica fora da ordem de Tab (tabIndex -1) pra não atrapalhar o fluxo de digitação."
        >
          <KeyboardTable
            rows={[
              { keys: ["Tab"], action: "Move entre os dois campos e o rodapé (pula o toggle de visibilidade)." },
              { keys: ["Enter"], action: "No botão de envio, submete quando habilitado." },
              { keys: ["Espaço"], action: "Permitido na senha — frases secretas com espaços são válidas." },
            ]}
          />
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Manter a regra em <code className="mono">lib/password-policy</code> e consumir aqui.</>,
              <>Deixar o usuário usar frase secreta — espaços e qualquer caractere.</>,
              <>Tratar o medidor como feedback, não como trava.</>,
            ]}
            donts={[
              <>Recriar checklist de complexidade (maiúscula/número/símbolo).</>,
              <>Duplicar a regra inline em cada tela — foi exatamente o que consolidamos.</>,
              <>Usar no login (digitar senha existente) — lá não tem requisito.</>,
            ]}
          />
        </Section>

        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              { name: "Inputs", href: "/bombardier/styleguide/components/inputs", description: "AwInput / AwField — base dos campos." },
              { name: "Onboarding shell", href: "/bombardier/styleguide/components/aw-onboarding-shell", description: "Casca que embrulha o setup nos fluxos." },
              { name: "Escrita", href: "/bombardier/styleguide/foundation/content", description: "Microcopy de segurança e tom." },
            ]}
          />
        </Section>
      </div>
    </>
  )
}
