import Link from "next/link"
import { AwCard } from "@/components/ui/AwCard"
import { AwPill } from "@/components/ui/AwPill"
import { AwButton } from "@/components/ui/AwButton"
import { Icon } from "@/components/ui/Icon"

type HubSection = {
  title: string
  description: string
  icon: string
  href: string
  status: "ready" | "soon"
}

const sections: HubSection[] = [
  {
    title: "Projetos",
    description:
      "Lista dos seus projetos salvos em disco. Crie novos, abra, duplique ou delete.",
    icon: "folder_open",
    href: "/bombardier/projects",
    status: "ready",
  },
  {
    title: "Page Builder",
    description:
      "Abre o rascunho atual (guardado no navegador). Ideal para experimentar sem criar projeto.",
    icon: "draw",
    href: "/bombardier/page-builder",
    status: "ready",
  },
  {
    title: "Styleguide",
    description:
      "Tokens, foundations e componentes Aw* — a fonte da verdade do design system.",
    icon: "palette",
    href: "/bombardier/styleguide",
    status: "ready",
  },
  {
    title: "UX Flow",
    description:
      "Conecte páginas em fluxos navegáveis, estilo Figma prototype.",
    icon: "account_tree",
    href: "/bombardier/ux-flow",
    status: "soon",
  },
]

export default function BombardierHub() {
  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-primary)]">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <header className="mb-12">
          <p className="aw-eyebrow mb-3">Product Builder Platform</p>
          <h1 className="text-5xl font-semibold tracking-tight mb-3">
            Bombardier
          </h1>
          <p className="text-lg text-[var(--fg-secondary)] max-w-2xl">
            Crie páginas e flows direto no código, reutilizando o design system
            — sem passar pelo Figma.
          </p>
        </header>

        <section className="mb-10">
          <p className="aw-eyebrow mb-3">Seus projetos</p>
          <AwCard interactive className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span
                  className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface)]"
                  style={{ width: 52, height: 52 }}
                >
                  <Icon name="hub" size={28} />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-semibold tracking-tight">AwSales</h2>
                  <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-xl">
                    Plataforma de vendas com agentes — abra o produto para explorar
                    dashboard, conversas, canais e configurações.
                  </p>
                </div>
              </div>
              <AwPill variant="live">Ativo</AwPill>
            </div>
            <div className="mt-2">
              <Link href="/inicio" className="no-underline">
                <AwButton variant="primary" iconRight="arrow_forward">
                  Abrir projeto
                </AwButton>
              </Link>
            </div>
          </AwCard>
        </section>

        <p className="aw-eyebrow mb-3">Ferramentas Bombardier</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((s) => {
            const ready = s.status === "ready"
            return (
              <AwCard
                key={s.title}
                interactive={ready}
                className="p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <span
                    className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface)]"
                    style={{ width: 44, height: 44 }}
                  >
                    <Icon name={s.icon} size={24} />
                  </span>
                  {!ready && <AwPill variant="draft">Em breve</AwPill>}
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold">{s.title}</h2>
                  <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                    {s.description}
                  </p>
                </div>
                <div className="mt-auto pt-2">
                  {ready ? (
                    <Link href={s.href} className="no-underline">
                      <AwButton variant="primary" iconRight="arrow_forward">
                        Abrir
                      </AwButton>
                    </Link>
                  ) : (
                    <AwButton variant="ghost" disabled iconRight="lock">
                      Indisponível
                    </AwButton>
                  )}
                </div>
              </AwCard>
            )
          })}
        </div>
      </div>
    </main>
  )
}
