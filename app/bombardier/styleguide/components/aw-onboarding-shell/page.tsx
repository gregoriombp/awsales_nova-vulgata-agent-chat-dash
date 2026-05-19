import Link from "next/link"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
} from "../../_primitives"

const ROUTES: { href: string; label: string }[] = [
  { href: "/primeiro-acesso/verificacao", label: "Etapa 01 · verificação" },
  { href: "/primeiro-acesso/conta", label: "Etapa 02 · sua conta" },
  { href: "/primeiro-acesso/perfil", label: "Etapa 03 · seu perfil" },
  { href: "/primeiro-acesso/contrato", label: "Etapa 04 · contrato" },
  { href: "/primeiro-acesso/pagamento", label: "Etapa 05 · pagamento" },
  { href: "/primeiro-acesso/concluido", label: "Etapa 06 · concluído" },
]

export default function AwOnboardingShellPlaygroundPage() {
  return (
    <>
      <PageHero title="AwOnboardingShell">
        Casca de tela inteira pro fluxo de Primeiro Acesso (6 etapas). Divide a
        viewport em duas zonas: o brand pane escuro à esquerda — logo e card da
        organização — e o work pane scrollable à direita, onde o conteúdo da
        etapa entra via{" "}
        <code className="font-mono text-[13px]">children</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="preview"
            title="Preview ao vivo"
            lead="O shell ocupa a viewport inteira (h-screen) e não cabe inline no styleguide — abra uma das rotas pra inspecionar o layout completo."
          >
            <div className="rounded-xl border border-border-subtle bg-bg-raised p-6">
              <div
                className="aw-eyebrow mb-3 text-fg-tertiary"
                style={{ letterSpacing: "0.08em" }}
              >
                Rotas implementadas
              </div>
              <ul className="m-0 flex flex-col gap-2 p-0 list-none">
                {ROUTES.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      className="inline-flex items-center gap-2 font-mono text-sm text-fg-primary underline decoration-border-strong underline-offset-4 hover:decoration-fg-primary"
                    >
                      {r.href}
                      <span className="text-fg-tertiary">→ {r.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="O shell costura duas zonas. Os tokens visuais vêm todos do foundation; o brand pane fixa o fundo escuro (aw-gray-1200) por intenção identitária."
          >
            <div className="rounded-xl border border-border-subtle bg-bg-raised p-6 text-sm text-fg-secondary leading-relaxed">
              <ul className="m-0 flex flex-col gap-2 p-0 list-disc pl-5">
                <li>
                  <b className="text-fg-primary">Brand pane</b> — 38% (320–480 px),
                  fundo escuro fixo com imagem de marca e overlay em gradiente.
                </li>
                <li>
                  <b className="text-fg-primary">Logo</b> — wordmark AwSales no
                  topo do brand pane.
                </li>
                <li>
                  <b className="text-fg-primary">Card da organização</b> —
                  logotipo, nome, CNPJ e plano; some antes do reconhecimento do
                  usuário via{" "}
                  <code className="font-mono text-xs">showOrgCard</code>.
                </li>
                <li>
                  <b className="text-fg-primary">Work pane</b> — slot scrollable
                  centralizado (max-w 640 px), recebe o conteúdo da etapa.
                </li>
              </ul>
            </div>
          </Section>

          <Section
            id="api"
            title="Props"
            lead="Configuração mínima — passe org. O restante ajusta o brand pane."
          >
            <ApiTable>
              <PropRow
                prop="org"
                type="{ name, cnpj, plan, contractTerm, logo? }"
                doc="Dados da organização exibidos no card escuro do brand pane. O logo aparece à esquerda do nome."
              />
              <PropRow
                prop="children"
                type="ReactNode"
                doc="Conteúdo do work pane — o componente da tela (eyebrow, título, body, ações)."
              />
              <PropRow
                prop="brandBackground"
                type="string"
                def="AW_ONBOARDING_BRAND_BACKGROUND"
                doc="Imagem de fundo do brand pane. Sem imagem, cai no neural pattern."
              />
              <PropRow
                prop="showOrgCard"
                type="boolean"
                def="true"
                doc="Esconde o card da organização — usado na etapa 01, antes de reconhecer o usuário."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  )
}
