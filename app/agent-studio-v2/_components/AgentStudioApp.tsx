"use client"

import * as React from "react"
import { BuilderShell } from "./Builder"
import { Home } from "./Home"
import { Sidebar } from "./Sidebar"
import { Toolbar } from "./Toolbar"
import { TweaksPanel } from "./TweaksPanel"
import { Wizard, type WizardResult } from "./Wizard"
import { AgentCoreStep } from "./steps/AgentCore"
import { CanaisStep } from "./steps/Canais"
import { HabilidadesStep } from "./steps/Habilidades"
import { ObjetivoStep } from "./steps/Objetivo"
import { PublicarStep } from "./steps/Publicar"
import { RevisaoStep } from "./steps/Revisao"
import {
  AGENT_SEED,
  BUILDER_STEPS,
  DEFAULT_TWEAKS,
  EMPTY_AGENT,
  type AgentDraft,
  type AgentSeed,
  type StepId,
  type Tweaks,
  type ViewState,
} from "./types"

function usePersisted<T>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = React.useState<T>(() => {
    if (typeof window === "undefined") return initial
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(v))
    } catch {
      /* ignore quota */
    }
  }, [key, v])
  return [v, setV]
}

export function AgentStudioApp() {
  const [tweaks, setTweaks] = usePersisted<Tweaks>(
    "agentstudio_v2.tweaks",
    DEFAULT_TWEAKS
  )
  const [tweaksOpen, setTweaksOpen] = React.useState(false)

  const [view, setView] = usePersisted<ViewState>("agentstudio_v2.view", {
    screen: "home",
  })
  const [agent, setAgent] = React.useState<AgentDraft>({ ...EMPTY_AGENT })

  const collapsed = tweaks.sidebarMode === "collapsed"
  const setCollapsed = (c: boolean) =>
    setTweaks({ ...tweaks, sidebarMode: c ? "collapsed" : "expanded" })

  React.useEffect(() => {
    const root = document.querySelector<HTMLDivElement>(".as2-root")
    if (root) root.setAttribute("data-density", tweaks.density || "regular")
  }, [tweaks.density])

  const agents: AgentSeed[] = tweaks.agentState === "populado" ? AGENT_SEED : []

  const handleGoto = React.useCallback(
    (dest: string) => {
      if (dest === "wizard") {
        setView({ screen: "wizard" })
        return
      }
      if (dest.startsWith("builder:")) {
        const step = dest.split(":")[1] as StepId
        setAgent((prev) =>
          prev.name
            ? prev
            : {
                ...EMPTY_AGENT,
                name: "Agente de Recuperação de Leads",
                objective:
                  "Reengajar leads B2B que não responderam em 7 dias e agendar reuniões com o SDR.",
              }
        )
        setView({ screen: "builder", step })
      }
    },
    [setView]
  )

  const onStartCreate = () => setView({ screen: "wizard" })
  const onCloseWizard = () => setView({ screen: "home" })
  const onWizardCreate = (r: WizardResult) => {
    const draft: AgentDraft = { ...EMPTY_AGENT }
    if (r.source === "ai") {
      draft.name = "Novo agente"
      draft.objective = r.prompt
    } else {
      draft.name = r.template.name
      draft.objective = r.template.desc
      draft.id = "new-" + r.template.id
    }
    setAgent(draft)
    setView({ screen: "builder", step: "objetivo" })
  }
  const onOpenAgent = (a: AgentSeed) => {
    setAgent({
      ...EMPTY_AGENT,
      id: a.id,
      name: a.name,
      objective: a.objective,
      core: a.core,
    })
    setView({ screen: "builder", step: "objetivo" })
  }

  const goStep = (step: StepId) =>
    setView({ screen: "builder", step })

  const nextStep = () => {
    if (view.screen !== "builder") return
    const idx = BUILDER_STEPS.findIndex((s) => s.id === view.step)
    if (idx < BUILDER_STEPS.length - 1) goStep(BUILDER_STEPS[idx + 1].id)
  }

  React.useEffect(() => {
    if (agent._jumpTo) {
      goStep(agent._jumpTo)
      setAgent((a) => {
        const { _jumpTo: _ignored, ...rest } = a
        return rest
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent._jumpTo])

  const onPublish = () => {
    if (view.screen !== "builder") return
    setView({ screen: "builder", step: "publicar", published: true })
  }
  const onBackHome = () => setView({ screen: "home" })

  const breadcrumb: string[] = (() => {
    if (view.screen === "home") return ["Agent studio v2"]
    if (view.screen === "wizard") return ["Agent studio v2", "Criar agente"]
    const step = BUILDER_STEPS.find((s) => s.id === view.step)
    return [
      "Agent studio v2",
      agent.name || "Novo agente",
      step?.label ?? "",
    ]
  })()

  const isHome = view.screen === "home"
  const isEmptyHome = isHome && agents.length === 0
  const isPublish =
    view.screen === "builder" && view.step === "publicar"
  const darkCanvas = isEmptyHome || isPublish

  return (
    <div className="as2-root" data-density={tweaks.density}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        activeId="studio"
        onSelect={(id, impl) => {
          if (impl) setView({ screen: "home" })
        }}
      />
      <main className="as2-main">
        <div className={`as2-canvas${darkCanvas ? " as2-canvas--dark" : ""}`}>
          <Toolbar breadcrumb={breadcrumb} onDark={darkCanvas} />

          {view.screen === "home" ? (
            <Home agents={agents} onCreate={onStartCreate} onOpen={onOpenAgent} />
          ) : null}

          {view.screen === "builder" ? (
            <BuilderShell
              stepId={view.step}
              onStep={goStep}
              agent={agent}
              onBack={onBackHome}
              onSave={() => {
                /* no-op in prototype */
              }}
              onContinue={view.step === "publicar" ? onPublish : nextStep}
              continueLabel={
                view.step === "publicar"
                  ? "Publicar agora"
                  : view.step === "revisao"
                    ? "Ir para publicação"
                    : "Continuar"
              }
            >
              {view.step === "objetivo" ? (
                <ObjetivoStep agent={agent} setAgent={setAgent} />
              ) : null}
              {view.step === "core" ? (
                <AgentCoreStep agent={agent} setAgent={setAgent} />
              ) : null}
              {view.step === "habilidades" ? (
                <HabilidadesStep agent={agent} setAgent={setAgent} />
              ) : null}
              {view.step === "canais" ? (
                <CanaisStep agent={agent} setAgent={setAgent} />
              ) : null}
              {view.step === "revisao" ? (
                <RevisaoStep agent={agent} setAgent={setAgent} />
              ) : null}
              {view.step === "publicar" ? (
                <PublicarStep
                  agent={agent}
                  published={!!view.published}
                  onPublish={onPublish}
                />
              ) : null}
            </BuilderShell>
          ) : null}
        </div>
      </main>

      <Wizard
        open={view.screen === "wizard"}
        onClose={onCloseWizard}
        onCreate={onWizardCreate}
      />
      <TweaksPanel
        open={tweaksOpen}
        tweaks={tweaks}
        onChange={setTweaks}
        onClose={() => setTweaksOpen(false)}
        onGoto={handleGoto}
      />

      {/* Tweaks toggle — fixed bottom-right gear */}
      <button
        onClick={() => setTweaksOpen((s) => !s)}
        aria-label="Abrir painel de tweaks"
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 89,
          width: 40,
          height: 40,
          borderRadius: 20,
          background: "var(--aw-gray-1100)",
          color: "var(--aw-white)",
          border: "1px solid var(--aw-gray-1000)",
          display: tweaksOpen ? "none" : "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
        }}
      >
        <span
          className="as2-mi as2-mi-20"
          style={{ lineHeight: 1 }}
          aria-hidden="true"
        >
          tune
        </span>
      </button>
    </div>
  )
}
