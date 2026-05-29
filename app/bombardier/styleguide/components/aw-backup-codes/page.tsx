"use client"

import * as React from "react"
import { AwBackupCodes } from "@/components/ui/AwBackupCodes"
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

const DEMO_CODES = [
  "A3F9X-K2L7M",
  "B8H4P-N6Q1R",
  "C2J7V-W3D5T",
  "D9K1Z-Y4E8U",
  "E6L3B-X7F2H",
  "F4M8N-P1G9J",
  "G7N2C-Q5H6K",
  "H1P5V-R8J3L",
  "J5R8D-T2M4W",
  "K9T3F-V6N1X",
]

export default function AwBackupCodesPage() {
  const [saved, setSaved] = React.useState(false)

  return (
    <>
      <PageHero title="Backup codes">
        Grade de códigos de recuperação de uso único, com copiar/baixar e —
        opcionalmente — um aviso e um checkbox de confirmação. Fonte única do
        setup de 2FA do AuthFlow e do fluxo de convite, pra os dois não
        divergirem.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              No passo final do setup de 2FA, quando o usuário precisa{" "}
              <b>guardar</b> os códigos de recuperação.
            </>,
            <>
              Em qualquer tela que liste códigos de backup — copiar, baixar e
              confirmar vêm de graça.
            </>,
          ]}
          dontUse={[
            <>
              Para um único código/segredo (ex.: a chave TOTP) — ali é um{" "}
              <code className="mono">code</code> simples, não a grade.
            </>,
            <>
              Para inserir um código de backup (recovery) — isso é input, não
              esta listagem.
            </>,
          ]}
        />

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Grade de 2 colunas com os códigos, par de ações copiar/baixar, e dois slots opcionais: callout de aviso e checkbox de confirmação."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="grade" v="2 colunas" d="tabular-nums + tracking pra alinhar os códigos." />
            <Spec k="copiar" v="clipboard" d="Copia todos (estado 'Copiado' por ~1,8s)." />
            <Spec k="baixar" v=".txt" d="Gera um arquivo (filename configurável)." />
            <Spec k="aviso" v="opcional" d="Callout âmbar acima do checkbox (prop warning)." />
            <Spec k="confirmar" v="opcional" d="AwCheckbox controlado (prop confirm)." />
            <Spec k="CTA" v="no consumidor" d="O botão de avançar fica na tela que usa o componente." />
          </div>
        </Section>

        <Section
          id="variants"
          title="Variantes"
          lead="Mesma grade, slots opcionais ligados/desligados."
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Stage label="simples — só grade + ações" gridClassName="flex justify-center">
              <div className="w-full max-w-[360px]">
                <AwBackupCodes codes={DEMO_CODES} />
              </div>
            </Stage>

            <Stage label="com aviso + confirmação (interativo)" gridClassName="flex justify-center">
              <div className="w-full max-w-[360px]">
                <AwBackupCodes
                  codes={DEMO_CODES}
                  warning="Sem o app e sem os códigos, você perde o acesso à organização."
                  confirm={{
                    checked: saved,
                    onChange: setSaved,
                    label: "Salvei meus códigos em um lugar seguro.",
                  }}
                />
              </div>
            </Stage>
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwBackupCodes } from "@/components/ui/AwBackupCodes".`}
        >
          <ApiTable>
            <PropRow prop="codes" type="string[]" doc="Os códigos a exibir. Required." />
            <PropRow prop="filename" type="string" def="awsales-backup-codes.txt" doc="Nome do arquivo do 'Baixar .txt'." />
            <PropRow prop="warning" type="ReactNode" doc="Callout âmbar opcional acima do checkbox." />
            <PropRow prop="confirm" type="{ checked, onChange, label }" doc="Checkbox de confirmação controlado (opcional)." />
            <PropRow prop="labels" type="{ copy, copied, download }" doc="Rótulos i18n; defaults em PT-BR." />
            <PropRow prop="className" type="string" doc="Classes extras no container." />
          </ApiTable>

          <CodeExample label="no setup de 2FA (auth) — com aviso + i18n">{`import { AwBackupCodes } from "@/components/ui/AwBackupCodes"

<AwBackupCodes
  codes={BACKUP_CODES}
  warning={c.warn}
  confirm={{ checked: confirmed, onChange: setConfirmed, label: c.confirm }}
  labels={{ copy: c.copy, copied: c.copied, download: c.download }}
/>`}</CodeExample>
        </Section>

        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="Só tokens existentes — nenhum token novo foi criado."
        >
          <TokensConsumed
            tokens={[
              { token: "--fg-primary", role: "códigos", value: "var(--aw-gray-1200)" },
              { token: "--fg-secondary", role: "label do checkbox", value: "var(--aw-gray-800)" },
              { token: "--bg-surface", role: "fundo da grade", value: "var(--aw-gray-150)" },
              { token: "--border", role: "borda da grade", value: "var(--aw-gray-300)" },
              { token: "--aw-amber-100", role: "fundo do aviso", value: "#FDF1E3" },
              { token: "--aw-amber-700", role: "ícone do aviso", value: "#B45917" },
              { token: "--aw-amber-900", role: "texto do aviso", value: "#7C3D11" },
            ]}
          />
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Usar como fonte única dos códigos de backup (auth + convite).</>,
              <>Passar o <code className="mono">warning</code> quando o contexto for crítico.</>,
              <>Controlar o checkbox de fora pra travar o avançar.</>,
            ]}
            donts={[
              <>Recriar a grade + copiar/baixar inline numa página.</>,
              <>Embutir o CTA de avançar aqui — ele é da tela consumidora.</>,
              <>Usar <code className="mono">font-mono</code> nos códigos — é sans + tabular-nums.</>,
            ]}
          />
        </Section>

        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              { name: "QR placeholder", href: "/bombardier/styleguide/components/aw-qr-placeholder", description: "O outro bloco do setup de 2FA." },
              { name: "Checkbox", href: "/bombardier/styleguide/components/aw-checkbox", description: "Base da confirmação." },
              { name: "Login e autenticação", href: "/bombardier/styleguide/ux-flows/login-auth", description: "Onde os códigos de backup aparecem." },
            ]}
          />
        </Section>
      </div>
    </>
  )
}
