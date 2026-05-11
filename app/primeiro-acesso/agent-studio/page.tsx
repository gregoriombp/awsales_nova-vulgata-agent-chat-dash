import type { Metadata } from "next"
import { AwLogo } from "@/components/ui/AwLogo"
import { Icon } from "@/components/ui/Icon"
import { NeuralPattern } from "@/components/playground/NeuralPattern"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

export const metadata: Metadata = {
  title: "Agent Studio · AwSales",
  description: "Bem-vindo ao Agent Studio. Crie seu primeiro agente.",
}

const NAV_PRIMARY = [
  { icon: "home", label: "início", active: true },
  { icon: "neurology", label: "agentes" },
  { icon: "library_books", label: "fontes" },
  { icon: "monitoring", label: "acompanhamento" },
]

const NAV_ORG = [
  { icon: "group", label: "equipe" },
  { icon: "settings", label: "configurações" },
]

const userInitials = ONBOARDING_USER.name
  .split(" ")
  .map((p) => p[0])
  .slice(0, 2)
  .join("")

export default function AgentStudioPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-aw-gray-1200 text-white">
      <aside
        className="flex w-60 flex-shrink-0 flex-col gap-1 border-r border-aw-gray-1100 bg-aw-gray-1200 p-3"
        style={{ paddingTop: 16, paddingBottom: 16 }}
      >
        <div className="mb-3.5 flex items-center gap-2 px-2.5 py-2">
          <AwLogo variant="mark" height={18} />
          <span
            className="font-display font-semibold text-white"
            style={{ fontSize: 13, letterSpacing: "-0.01em" }}
          >
            awsales
          </span>
        </div>

        {NAV_PRIMARY.map((item) => (
          <SideNavItem key={item.label} {...item} />
        ))}

        <div
          className="px-2.5 pb-1.5 pt-4 font-mono uppercase text-aw-gray-800"
          style={{ fontSize: 9, letterSpacing: "0.08em" }}
        >
          organização
        </div>

        {NAV_ORG.map((item) => (
          <SideNavItem key={item.label} {...item} />
        ))}

        <div className="mt-auto flex items-center gap-2.5 px-2.5 py-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-aw-blue-700 font-semibold text-white"
            style={{ fontSize: 11 }}
          >
            {userInitials}
          </div>
          <div className="min-w-0">
            <div
              className="truncate font-medium text-white"
              style={{ fontSize: 12 }}
            >
              {ONBOARDING_USER.name}
            </div>
            <div
              className="font-mono text-aw-gray-700"
              style={{ fontSize: 10 }}
            >
              {ONBOARDING_ORG.name}
            </div>
          </div>
        </div>
      </aside>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-aw-gray-1200">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 opacity-[0.35]"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <NeuralPattern size={560} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 text-center text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-aw-gray-1000 bg-white/[0.06]">
            <AwLogo variant="mark" height={28} />
          </div>
          <h1
            className="m-0 font-display font-medium text-white"
            style={{
              fontSize: "var(--h1-size)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Bem-vindo ao Agent Studio
          </h1>
          <p
            className="m-0 max-w-[360px] text-aw-gray-500"
            style={{ fontSize: 14 }}
          >
            Crie seu primeiro agente em menos de 90 minutos.
          </p>
          <button
            type="button"
            className="mt-2 inline-flex h-10 items-center gap-2 rounded-md bg-white px-5 font-medium text-aw-gray-1200 hover:bg-aw-gray-300"
            style={{ fontSize: 13.5 }}
          >
            <Icon name="add" size={16} />
            Criar agente
          </button>
          <div
            className="mt-4 font-mono text-aw-gray-700"
            style={{ fontSize: 10, letterSpacing: "0.04em" }}
          >
            primeira sessão · sua conta foi ativada com sucesso
          </div>
        </div>
      </main>
    </div>
  )
}

function SideNavItem({
  icon,
  label,
  active,
}: {
  icon: string
  label: string
  active?: boolean
}) {
  return (
    <div
      className={[
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2",
        active
          ? "bg-white text-aw-gray-1200"
          : "text-aw-gray-500 hover:bg-aw-gray-1000 hover:text-white",
      ].join(" ")}
      style={{ fontSize: 13 }}
    >
      <Icon name={icon} size={18} />
      {label}
    </div>
  )
}
