import Link from "next/link"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
} from "../../_primitives"

export default function AwOnboardingShellPage() {
  return (
    <>
      <PageHero title="Onboarding shell">
        Layout em duas colunas usado em todos os passos de primeiro acesso
        e configuração de organização adicional. Esquerda é o brand pane
        (com logo, background grayscale e card opcional da organização);
        direita recebe o conteúdo do passo. Esse layout ocupa a tela inteira
        — por isso este showcase não renderiza um exemplo inline; veja em
        contexto nos links abaixo.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Section id="contexto" title="Onde aparece">
          <ul className="m-0 p-0 list-none flex flex-col gap-2">
            <li>
              <Link
                href="/primeiro-acesso"
                className="text-sm font-medium text-[var(--aw-blue-700)] hover:text-[var(--aw-blue-800)] no-underline hover:underline"
              >
                /primeiro-acesso →
              </Link>
              <span className="ml-2 text-sm text-[var(--fg-secondary)]">
                Fluxo de criação da organização (verificação, perfil,
                contrato, pagamento, conclusão).
              </span>
            </li>
            <li>
              <Link
                href="/organizacao-adicional"
                className="text-sm font-medium text-[var(--aw-blue-700)] hover:text-[var(--aw-blue-800)] no-underline hover:underline"
              >
                /organizacao-adicional →
              </Link>
              <span className="ml-2 text-sm text-[var(--fg-secondary)]">
                Plano adicional sem perfil (contrato + pagamento). Reusa o
                shell sem o card da organização.
              </span>
            </li>
          </ul>
        </Section>

        <Section id="api" title="API">
          <ApiTable>
            <PropRow
              prop="org"
              type="AwOnboardingOrg"
              doc="Dados da organização exibidos no card do brand pane (name, cnpj, plan, contractTerm, logo opcional)."
            />
            <PropRow
              prop="children"
              type="React.ReactNode"
              doc="Conteúdo do passo, renderizado na coluna direita centralizado verticalmente."
            />
            <PropRow
              prop="brandBackground"
              type="string"
              def="/assets/group-backgrounds/group-bg-17.jpg"
              doc="Imagem de fundo do brand pane. Aplica saturação 0.75 e gradient escuro por cima."
            />
            <PropRow
              prop="showOrgCard"
              type="boolean"
              def="true"
              doc="Esconde o card da organização (use antes de o usuário ser reconhecido)."
            />
          </ApiTable>
        </Section>
      </div>
    </>
  )
}
