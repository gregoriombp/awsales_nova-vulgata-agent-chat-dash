"use client"

import Link from "next/link"
import type { Edge, Node } from "@xyflow/react"

import { PageHero, Section } from "../../_primitives"
import { branchEdge, edgeBase, FlowDiagram } from "../_components/flow-editor"
import {
  FlowUpdatesBadge,
  FlowUpdatesHistorySection,
  type FlowUpdate,
} from "../_components/flow-updates"

/* ─────────────────────────────────────────────────────────────────────
 * Layout constants
 * ──────────────────────────────────────────────────────────────────── */

const COL   = 280
const COL_D = 260

const PIX_X    = 40
const CARTAO_X = 280
const BOLETO_X = 520

const MFA_SETUP_X  = 40   // Cadeia "Trava → setup TOTP → backup codes" (alinhado com Pix)
const MFA_VERIFY_X = 520  // Tela "Verificação MFA" (alinhado com Boleto)

const Y = {
  entrada:        0,
  contrato:     180,
  pagamento:    360,
  methods:      560,
  policyDec:    720,    // decisão "Policy da org?" — checa 2FA per-org
  mfaBranchRow: 880,    // mfaGate (MFA_SETUP_X) | mfaVerify (MFA_VERIFY_X)
  mfaSetupApp:  1040,
  mfaBackupCodes: 1200,
  concluido:    1360,
  retorno:      1540,
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes
 * ──────────────────────────────────────────────────────────────────── */

const NODES: Node[] = [
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: {
      step: "entrada",
      title: "Login (já cadastrado, plano novo)",
      href: "/bombardier/styleguide/ux-flows/login-auth",
      note: "Vindo do login: decisão D7 detectou um plano comprado sem org configurada e o usuário escolheu 'Configurar agora'.",
    },
  },
  {
    id: "contrato",
    type: "screen",
    position: { x: COL, y: Y.contrato },
    data: {
      step: "01",
      title: "Contrato",
      href: "/organizacao-adicional/contrato",
      note: "Revisa condições comerciais da nova organização e aceita os termos. Perfil pessoal não aparece — já existe.",
    },
  },
  {
    id: "pagamento",
    type: "decision",
    position: { x: COL_D, y: Y.pagamento },
    data: { step: "02", title: "Pagamento", question: "Implementação + 1ª mensalidade da nova organização. Qual o método?" },
  },
  {
    id: "pix",
    type: "screen",
    position: { x: PIX_X, y: Y.methods },
    data: { step: "02a", title: "Pix", href: "/organizacao-adicional/pagamento", note: "QR Code instantâneo. Confirmação em segundos." },
  },
  {
    id: "cartao",
    type: "screen",
    position: { x: CARTAO_X, y: Y.methods },
    data: { step: "02b", title: "Cartão de crédito", href: "/organizacao-adicional/pagamento", note: "Crédito em até 12×. Confirmação imediata. Recusa do banco abre modal inline com o motivo + opção de tentar outro cartão ou mudar de método — sem sair da etapa de pagamento." },
  },
  {
    id: "boleto",
    type: "screen",
    position: { x: BOLETO_X, y: Y.methods },
    data: { step: "02c", title: "Boleto bancário", href: "/organizacao-adicional/pagamento", note: "Vencimento em 3 dias úteis. Compensação em 1 dia útil." },
  },
  {
    id: "policyDec",
    type: "decision",
    position: { x: COL_D, y: Y.policyDec },
    data: { step: "02d", title: "Policy da org?", question: "A nova organização exige SSO ou 2FA? O token é cunhado pela nova org neste ponto — pode exigir 2FA mesmo que a org principal do usuário não exija." },
  },
  // ── MFA branch — espelha login-auth. Vale tanto pra signup quanto pra login. ──
  {
    id: "mfaGate",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBranchRow },
    data: { step: "02e", title: "Trava de 2FA", href: "/awsales/login", note: "Gate quando a nova org exige 2FA e o usuário ainda não configurou. Método único: app autenticador (TOTP)." },
  },
  {
    id: "mfaVerify",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaBranchRow },
    data: { step: "02h", title: "Verificação MFA", href: "/awsales/login", note: "Para usuários que já têm TOTP configurado em sessão anterior (caso comum se a org principal também exige 2FA). Input de 6 dígitos." },
  },
  {
    id: "mfaSetupApp",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaSetupApp },
    data: { step: "02f", title: "Configurar app autenticador", href: "/awsales/login", note: "Passo 1 de 2 do setup TOTP. QR code + segredo em texto pra copiar. Input de 6 dígitos pra confirmar." },
  },
  {
    id: "mfaBackupCodes",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBackupCodes },
    data: { step: "02g", title: "Códigos de backup", href: "/awsales/login", note: "Passo 2 de 2 do setup TOTP. 8 códigos de uso único. Copiar todos ou baixar .txt. Checkbox obrigatório 'salvei em lugar seguro'." },
  },
  {
    id: "mfaRecovery",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaSetupApp },
    data: { step: "02i", title: "Usar código de backup", href: "/awsales/login", note: "Fallback de MFA quando o usuário perdeu acesso ao app autenticador. Entra um dos 8 códigos de backup salvos no setup TOTP. Cada código vale uma vez." },
  },
  {
    id: "concluido",
    type: "screen",
    position: { x: COL, y: Y.concluido },
    data: { step: "03", title: "Concluído", href: "/organizacao-adicional/concluido", note: "Nova organização provisionada. Resumo do que foi pago e próxima cobrança." },
  },
  {
    id: "retorno",
    type: "screen",
    position: { x: COL, y: Y.retorno },
    data: { step: "→ plataforma", title: "Entrou na plataforma", href: "/inicio", note: "Home logada já no contexto da nova organização." },
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Edges
 * ──────────────────────────────────────────────────────────────────── */

const labelProps = {
  labelStyle: { fill: "var(--fg-secondary)", fontSize: 11, fontWeight: 500 },
  labelBgStyle: { fill: "var(--bg-canvas)" },
  labelBgPadding: [6, 4] as [number, number],
}

const EDGES: Edge[] = [
  { ...edgeBase, id: "e-entrada-contrato", source: "entrada", target: "contrato", label: "Configurar agora", ...labelProps },
  { ...edgeBase, id: "e-contrato-pagamento", source: "contrato", target: "pagamento" },
  { ...branchEdge, id: "e-pagamento-pix",    source: "pagamento", target: "pix",    sourceHandle: "left",   label: "Pix",    ...labelProps },
  { ...branchEdge, id: "e-pagamento-cartao", source: "pagamento", target: "cartao", sourceHandle: "bottom", label: "Cartão", ...labelProps },
  { ...branchEdge, id: "e-pagamento-boleto", source: "pagamento", target: "boleto", sourceHandle: "right",  label: "Boleto", ...labelProps },
  { ...edgeBase, id: "e-pix-policy",    source: "pix",    target: "policyDec" },
  { ...edgeBase, id: "e-cartao-policy", source: "cartao", target: "policyDec" },
  { ...edgeBase, id: "e-boleto-policy", source: "boleto", target: "policyDec" },

  // ── Policy da org? — 2FA per-org ─────────────────────────────────
  { ...branchEdge, id: "e-policy-mfaGate",    source: "policyDec", target: "mfaGate",    sourceHandle: "left",   label: "Org exige 2FA · user sem TOTP", ...labelProps },
  { ...branchEdge, id: "e-policy-mfaVerify",  source: "policyDec", target: "mfaVerify",  sourceHandle: "right",  label: "User tem TOTP",                 ...labelProps },
  { ...branchEdge, id: "e-policy-concluido",  source: "policyDec", target: "concluido",  sourceHandle: "bottom", label: "Sem policy adicional",          ...labelProps },

  // ── Setup chain: gate → app → backup → concluido ─────────────────
  { ...branchEdge, id: "e-mfaGate-already",      source: "mfaGate",        target: "mfaVerify",       label: "Já tenho o app", ...labelProps },
  { ...edgeBase,   id: "e-mfaGate-setup",        source: "mfaGate",        target: "mfaSetupApp",     label: "Configurar",     ...labelProps },
  { ...edgeBase,   id: "e-mfaSetup-backup",      source: "mfaSetupApp",    target: "mfaBackupCodes" },
  { ...edgeBase,   id: "e-mfaBackup-concluido",  source: "mfaBackupCodes", target: "concluido" },
  { ...edgeBase,   id: "e-mfaVerify-concluido",  source: "mfaVerify",      target: "concluido" },
  { ...branchEdge, id: "e-mfaVerify-recovery",    source: "mfaVerify",      target: "mfaRecovery",     label: "Usar backup", ...labelProps },
  { ...edgeBase,   id: "e-mfaRecovery-concluido", source: "mfaRecovery",    target: "concluido" },

  { ...edgeBase, id: "e-concluido-retorno", source: "concluido", target: "retorno", label: "Acessar plataforma", ...labelProps },
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "01",
    title: "Contrato",
    href: "/organizacao-adicional/contrato",
    purpose: "Cliente revisa dados da nova organização e condições comerciais do plano comprado (implementação, mensalidade cheia, 1ª mensalidade prorrata) antes de pagar. Não pede dados pessoais — o perfil já existe.",
    decisions: "Aceitar os termos → pagamento. Voltar / Adiar → /inicio (banner persistente segue ativo).",
  },
  {
    step: "02",
    title: "Pagamento",
    href: "/organizacao-adicional/pagamento",
    purpose: "Mesma etapa de pagamento do primeiro acesso, aplicada à nova organização. Cobra implementação e 1ª mensalidade via Pix, Cartão ou Boleto. Confirmação automática. Recusa do banco no cartão abre modal inline com o motivo — sem sair da etapa.",
    decisions: "Pix → QR Code; Cartão → crédito parcelado; Boleto → gerado na hora → policy da org?.",
  },
  {
    step: "02d",
    title: "Policy da org?",
    href: "/awsales/login",
    purpose: "Decisão server-side após pagamento confirmado: a NOVA organização exige 2FA? O token de sessão é cunhado pela nova org neste ponto, com suas próprias exigências — pode exigir 2FA mesmo que a org principal do usuário não exija. Mesma decisão usada nos flows de login e primeiro acesso.",
    decisions: "Org exige 2FA + user sem TOTP → 'Trava de 2FA'. User tem TOTP → 'Verificação MFA'. Sem policy adicional → concluído.",
  },
  {
    step: "02e",
    title: "Trava de 2FA",
    href: "/awsales/login",
    purpose: "Gate explicando que a nova organização exige 2FA e o usuário precisa configurar agora pra continuar. Método único por enquanto: app autenticador (TOTP). Mesmo componente dos demais flows.",
    decisions: "Configurar agora → tela de setup do app. Já tenho o app → vai pra 'Verificação MFA'. Sair → volta pro login.",
  },
  {
    step: "02f",
    title: "Configurar app autenticador (TOTP)",
    href: "/awsales/login",
    purpose: "Passo 1 de 2 do setup TOTP. QR code grande no centro pra escanear no app autenticador, com o segredo em texto logo abaixo (copy-to-clipboard) pra quem não consegue escanear. Embaixo, input de 6 dígitos pra confirmar.",
    decisions: "Código correto → códigos de backup. Voltar → trava de 2FA.",
  },
  {
    step: "02g",
    title: "Códigos de backup",
    href: "/awsales/login",
    purpose: "Passo 2 de 2 do setup TOTP. Apresenta 8 códigos de backup de uso único em grid de 2 colunas. Ações 'Copiar todos' e 'Baixar .txt'. Callout âmbar com aviso de risco. Checkbox obrigatório 'salvei em lugar seguro' antes do botão liberar.",
    decisions: "Marcar checkbox + Concluir → segue pro 'Concluído'.",
  },
  {
    step: "02h",
    title: "Verificação MFA",
    href: "/awsales/login",
    purpose: "Caminho mais comum aqui: o usuário já tinha TOTP configurado na org principal e a nova org também exige 2FA. Input de 6 dígitos do app autenticador. Link 'Usar código de backup' como fallback se perdeu o app.",
    decisions: "Código correto → concluído. Usar código de backup → 'Usar código de backup'. Sair → volta pro login.",
  },
  {
    step: "02i",
    title: "Usar código de backup",
    href: "/awsales/login",
    purpose: "Fallback de MFA quando o usuário perdeu acesso ao app autenticador. Entra um dos 8 códigos de backup salvos no setup TOTP. Cada código é one-shot.",
    decisions: "Código válido → concluído. Voltar pro app autenticador → 'Verificação MFA'.",
  },
  {
    step: "03",
    title: "Concluído",
    href: "/organizacao-adicional/concluido",
    purpose: "Nova organização provisionada e pronta. Mostra resumo do que foi pago e a próxima cobrança. Banner persistente no /inicio some daqui em diante.",
    decisions: "Acessar plataforma → /inicio (home logada, agora também com acesso à nova org).",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Updates log — structural changes only. Add new entries at the top.
 * Managed by the `bombardier-update-ux-flow` skill.
 * ──────────────────────────────────────────────────────────────────── */

const updates: FlowUpdate[] = [
  {
    date: "2026-05-28",
    summary:
      "Nova tela 'Usar código de backup' como fallback do 'Verificação MFA' — pro usuário que perdeu acesso ao app autenticador. Converge no mesmo 'Concluído'.",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-27",
    summary:
      "Branch de 2FA por organização entre pagamento e concluído. A nova org pode exigir 2FA que o usuário ainda não tem configurado.",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-26",
    summary:
      "Flow criado pra cobrir o caso 'usuário já cadastrado comprou plano novo'. Reaproveita contrato e pagamento do primeiro acesso, sem perfil — porque o perfil pessoal já existe.",
    tags: ["new-page"],
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

export default function OrganizacaoAdicionalFlowPage() {
  return (
    <>
      <PageHero
        title="Configurar organização adicional"
        trailing={<FlowUpdatesBadge updates={updates} />}
      >
        Subflow disparado a partir da decisão D7 do{" "}
        <Link
          href="/bombardier/styleguide/ux-flows/login-auth"
          className="text-[var(--aw-blue-700)] hover:text-[var(--aw-blue-800)] no-underline hover:underline"
        >
          login
        </Link>
        : usuário já cadastrado que comprou um plano novo para outra organização e escolheu
        configurá-la agora. Mesmas etapas do primeiro acesso — menos perfil — porque os
        dados pessoais já existem.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-2xl -mt-8">
          Três etapas lineares: contrato da nova organização → pagamento (Pix, Cartão ou
          Boleto) → confirmação. Quando o usuário escolhe adiar no login, ele cai direto
          em /inicio com um banner persistente lembrando da pendência — esse banner some
          assim que a configuração é concluída.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo num painel lateral. Caixas tracejadas em âmbar são decisões. Setas âmbar indicam bifurcações."
        >
          <FlowDiagram flow="organizacao-adicional" nodes={NODES} edges={EDGES} height={1820} />
        </Section>

        <Section
          id="screens"
          title="Cada tela"
          lead="Propósito, decisões e link direto pro protótipo de cada uma."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
            <ul className="m-0 p-0 list-none flex flex-col divide-y divide-[var(--border-subtle)]">
              {screens.map((s) => (
                <li key={s.step + s.title} className="p-5 flex flex-col gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="aw-eyebrow text-[var(--aw-blue-700)]">{s.step}</span>
                    <h3 className="m-0 text-base font-medium text-[var(--fg-primary)]">{s.title}</h3>
                  </div>
                  <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">{s.purpose}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1">
                    <span className="caption">
                      <span className="font-medium text-[var(--fg-secondary)]">Decisões: </span>
                      {s.decisions}
                    </span>
                    <Link
                      href={s.href}
                      className="text-sm font-medium text-[var(--aw-blue-700)] hover:text-[var(--aw-blue-800)] no-underline hover:underline"
                    >
                      Abrir protótipo →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          id="design-notes"
          title="Decisões de design"
          lead="Por que esse subflow existe separado do primeiro acesso."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Perfil já existe — não pergunta de novo</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Nome, telefone, foto e destinatários de fatura já foram coletados no primeiro acesso. Pedir de novo é fricção sem retorno. O contrato e a cobrança são por organização, então essas duas etapas continuam.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Disparado por D7 do login</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Não existe entrada direta para esse fluxo — o usuário chega aqui sempre pela decisão D7 do{" "}
                <Link
                  href="/bombardier/styleguide/ux-flows/login-auth"
                  className="text-[var(--aw-blue-700)] hover:text-[var(--aw-blue-800)] no-underline hover:underline"
                >
                  login
                </Link>
                {" "}ou pelo banner persistente no /inicio quando adiou.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Adiar é uma opção, não uma pendência ignorada</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Quem comprou o plano correndo pode entrar na plataforma usando outra organização. O banner persistente em /inicio garante que a pendência fique visível até ser resolvida — sem bloquear o trabalho.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Mesmos componentes de pagamento</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                A etapa de pagamento reusa o seletor de método e instrumentos do primeiro acesso. Cliente já conhece a tela — menos surpresa, menos chance de erro.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
