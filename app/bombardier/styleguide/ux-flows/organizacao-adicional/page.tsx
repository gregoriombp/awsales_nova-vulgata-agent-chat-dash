"use client"

import Link from "next/link"
import type { Edge, Node } from "@xyflow/react"

import { PageHero, Section } from "../../_primitives"
import { branchEdge, crossEdge, edgeBase, FlowDiagram } from "../_components/flow-editor"
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

const MFA_SETUP_X  = 40    // ramo de setup (gate → app → backup), alinhado com Pix
const MFA_VERIFY_X = 520   // ramo de verificação (verify → recovery), alinhado com Boleto

const Y = {
  entrada:        0,
  contrato:     170,
  pagamento:    340,
  methods:      520,
  policyDec:    700,    // decisão "A organização exige verificação extra?" — 2FA por org
  mfaBranchRow: 880,    // mfaGate (esquerda) | mfaVerify (direita) — mesma linha
  mfaSetupApp: 1060,    // setup (esquerda) | recovery (direita) — mesma linha
  mfaBackupCodes: 1240,
  concluido:   1420,
  retorno:     1600,
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes
 * ──────────────────────────────────────────────────────────────────── */

const NODES: Node[] = [
  {
    id: "entrada",
    type: "crossflow",
    position: { x: COL, y: Y.entrada },
    data: {
      step: "← login",
      title: "Login",
      href: "/bombardier/styleguide/ux-flows/login-auth",
      note: "Entrada vinda do login: plano comprado, organização ainda não configurada.",
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
      note: "Revisa condições comerciais e aceita os termos.",
    },
  },
  {
    id: "pagamento",
    type: "decision",
    position: { x: COL_D, y: Y.pagamento },
    data: { step: "02", title: "Pagamento", question: "Implementação + 1ª mensalidade. Qual o método?" },
  },
  {
    id: "pix",
    type: "screen",
    position: { x: PIX_X, y: Y.methods },
    data: { step: "02a", title: "Pix", href: "/organizacao-adicional/pagamento", note: "QR Code instantâneo." },
  },
  {
    id: "cartao",
    type: "screen",
    position: { x: CARTAO_X, y: Y.methods },
    data: { step: "02b", title: "Cartão de crédito", href: "/organizacao-adicional/pagamento", note: "Crédito em até 4×. Confirmação imediata. Recusa do banco abre modal inline com o motivo + opção de tentar outro cartão ou trocar de método, sem sair da etapa." },
  },
  {
    id: "boleto",
    type: "screen",
    position: { x: BOLETO_X, y: Y.methods },
    data: { step: "02c", title: "Boleto bancário", href: "/organizacao-adicional/pagamento", note: "Vencimento em 3 dias úteis." },
  },
  {
    id: "policyDec",
    type: "decision",
    position: { x: COL_D, y: Y.policyDec },
    data: { step: "02d", title: "A organização exige verificação extra?", question: "A organização exige uma segunda etapa de verificação antes de liberar o acesso? Cada organização tem suas próprias regras de segurança." },
  },
  // ── Cadeia de 2FA — espelha o primeiro acesso. Gate, setup, backup, verificação e recuperação. ──
  {
    id: "mfaGate",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBranchRow },
    data: { step: "02e", title: "Ativar verificação em duas etapas", href: "/awsales/login?screen=mfaGate", note: "Gate: a org exige 2FA, configure agora. Botões 'Configurar agora' e 'Já tenho o app'." },
  },
  {
    id: "mfaVerify",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaBranchRow },
    data: { step: "02h", title: "Confirmar código", href: "/awsales/login?screen=mfaVerify", note: "Campo de 6 dígitos do app de verificação." },
  },
  {
    id: "mfaSetupApp",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaSetupApp },
    data: { step: "02f", title: "Configurar app de verificação", href: "/awsales/login?screen=mfaSetupApp", note: "QR code pra parear o app + campo de 6 dígitos pra confirmar." },
  },
  {
    id: "mfaBackupCodes",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBackupCodes },
    data: { step: "02g", title: "Códigos de backup", href: "/awsales/login?screen=mfaBackupCodes", note: "10 códigos de uso único pra guardar." },
  },
  {
    id: "mfaRecovery",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaSetupApp },
    data: { step: "02i", title: "Usar código de backup", href: "/awsales/login?screen=mfaRecovery", note: "Fallback de quem perdeu o app: um dos códigos salvos." },
  },
  {
    id: "concluido",
    type: "screen",
    position: { x: COL, y: Y.concluido },
    data: { step: "03", title: "Concluído", href: "/organizacao-adicional/concluido", note: "Nova organização provisionada e pronta." },
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
  { ...crossEdge, id: "e-entrada-contrato", source: "entrada", target: "contrato", label: "Configurar agora", ...labelProps },
  { ...edgeBase, id: "e-contrato-pagamento", source: "contrato", target: "pagamento" },

  // ── Pagamento → métodos ──────────────────────────────────────────
  { ...branchEdge, id: "e-pagamento-pix",    source: "pagamento", target: "pix",    sourceHandle: "left",   label: "Pix",    ...labelProps },
  { ...branchEdge, id: "e-pagamento-cartao", source: "pagamento", target: "cartao", sourceHandle: "bottom", label: "Cartão", ...labelProps },
  { ...branchEdge, id: "e-pagamento-boleto", source: "pagamento", target: "boleto", sourceHandle: "right",  label: "Boleto", ...labelProps },

  // ── Métodos confirmam e convergem na decisão de verificação extra ──
  { ...edgeBase, id: "e-pix-policy",    source: "pix",    target: "policyDec" },
  { ...edgeBase, id: "e-cartao-policy", source: "cartao", target: "policyDec" },
  { ...edgeBase, id: "e-boleto-policy", source: "boleto", target: "policyDec" },

  // ── A organização exige verificação extra? — 2FA por org ─────────
  { ...branchEdge, id: "e-policy-mfaGate",   source: "policyDec", target: "mfaGate",   sourceHandle: "left",   label: "Exige 2FA · sem app",  ...labelProps },
  { ...branchEdge, id: "e-policy-mfaVerify", source: "policyDec", target: "mfaVerify", sourceHandle: "right",  label: "Já tem o app",          ...labelProps },
  { ...branchEdge, id: "e-policy-concluido", source: "policyDec", target: "concluido", sourceHandle: "bottom", label: "Não exige",             ...labelProps },

  // ── Ramo de setup: gate → app → backup → concluído ───────────────
  { ...branchEdge, id: "e-mfaGate-already",     source: "mfaGate",        target: "mfaVerify",     label: "Já tenho o app",   ...labelProps },
  { ...edgeBase,   id: "e-mfaGate-setup",       source: "mfaGate",        target: "mfaSetupApp",   label: "Configurar agora", ...labelProps },
  { ...edgeBase,   id: "e-mfaSetup-backup",     source: "mfaSetupApp",    target: "mfaBackupCodes" },
  { ...edgeBase,   id: "e-mfaBackup-concluido", source: "mfaBackupCodes", target: "concluido" },

  // ── Ramo de verificação: verify → concluído, com fallback de backup ──
  { ...edgeBase,   id: "e-mfaVerify-concluido",  source: "mfaVerify",   target: "concluido" },
  { ...branchEdge, id: "e-mfaVerify-recovery",   source: "mfaVerify",   target: "mfaRecovery", label: "Usar backup", ...labelProps },
  { ...edgeBase,   id: "e-mfaRecovery-concluido", source: "mfaRecovery", target: "concluido" },

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
    purpose: "Cliente revisa as condições comerciais da nova organização (implementação, mensalidade cheia, 1ª mensalidade prorrata) e aceita os termos antes de pagar. Não pede dados pessoais — o perfil já existe.",
    decisions: "Aceitar os termos → pagamento. Voltar / Adiar → /inicio (banner persistente segue ativo).",
  },
  {
    step: "02",
    title: "Pagamento",
    href: "/organizacao-adicional/pagamento",
    purpose: "Etapa única que cobra a implementação e a 1ª mensalidade da nova organização. Três métodos: Pix (confirmação instantânea), Cartão de crédito (em até 4×) ou Boleto bancário (vencimento em 3 dias úteis). Recusa do banco no cartão abre modal inline com o motivo, sem sair da etapa.",
    decisions: "Pix → QR Code; Boleto → gerado na hora; Cartão → crédito parcelado → a organização exige verificação extra?.",
  },
  {
    step: "02a",
    title: "Pix",
    href: "/organizacao-adicional/pagamento",
    purpose: "QR Code Pix instantâneo, com código copia-e-cola e contador de expiração. Confirmação em segundos — sem passo de aprovação do banco.",
    decisions: "Já paguei o Pix → a organização exige verificação extra?.",
  },
  {
    step: "02b",
    title: "Cartão de crédito",
    href: "/organizacao-adicional/pagamento",
    purpose: "Formulário de cartão com parcelamento em até 4×. Confirmação imediata, mas sujeita à resposta do banco emissor — se recusar, abre um modal inline com o motivo e a opção de tentar outro cartão ou trocar de método, sem sair da etapa.",
    decisions: "Cartão aprovado → a organização exige verificação extra?. Recusado → modal inline (outro cartão / trocar método).",
  },
  {
    step: "02c",
    title: "Boleto bancário",
    href: "/organizacao-adicional/pagamento",
    purpose: "Boleto único com código de barras, linha digitável e ações de baixar PDF / enviar por e-mail. Vencimento em 3 dias úteis; o cliente pode seguir enquanto a compensação não cai.",
    decisions: "Já paguei o boleto → a organização exige verificação extra?.",
  },
  {
    step: "02d",
    title: "A organização exige verificação extra?",
    href: "/awsales/login",
    purpose: "Antes de a pessoa entrar na plataforma na nova organização, o produto verifica se a org exige uma segunda etapa de verificação. Cada organização define suas próprias regras de segurança — quem decide é o admin da org. A nova org pode exigir 2FA mesmo que a org principal não exija.",
    decisions: "Exige 2FA, sem app → 'Ativar verificação em duas etapas'. Já tem o app → 'Confirmar código'. Não exige → concluído.",
  },
  {
    step: "02e",
    title: "Ativar verificação em duas etapas",
    href: "/awsales/login?screen=mfaGate",
    purpose: "Gate de 2FA: a organização exige verificação extra e a pessoa ainda não configurou. Explica que ela precisa configurar agora pra continuar. Método: app de verificação no celular — Google Authenticator, 1Password, Authy, similar.",
    decisions: "Configurar agora → 'Configurar app de verificação'. Já tenho o app → 'Confirmar código'.",
  },
  {
    step: "02f",
    title: "Configurar app de verificação",
    href: "/awsales/login?screen=mfaSetupApp",
    purpose: "QR code pra escanear no app de verificação do celular, com o código em texto pra copiar. Campo de 6 dígitos pra confirmar que o app foi pareado.",
    decisions: "Código correto → códigos de backup. Voltar → 'Ativar verificação em duas etapas'.",
  },
  {
    step: "02g",
    title: "Códigos de backup",
    href: "/awsales/login?screen=mfaBackupCodes",
    purpose: "Apresenta 10 códigos de backup de uso único em grid de 2 colunas. Ações 'Copiar todos' e 'Baixar .txt'. Callout âmbar com aviso de risco. Checkbox obrigatório 'salvei em lugar seguro' antes do botão liberar.",
    decisions: "Marcar checkbox + Concluir → concluído.",
  },
  {
    step: "02h",
    title: "Confirmar código",
    href: "/awsales/login?screen=mfaVerify",
    purpose: "Pra quem já tem o app de verificação configurado em outra organização. Campo de 6 dígitos do app. Link 'Usar código de backup' como fallback.",
    decisions: "Código correto → concluído. Usar código de backup → 'Usar código de backup'.",
  },
  {
    step: "02i",
    title: "Usar código de backup",
    href: "/awsales/login?screen=mfaRecovery",
    purpose: "Fallback de quem perdeu acesso ao app de verificação. Entra um dos 10 códigos de backup salvos no setup. Cada código é one-shot.",
    decisions: "Código válido → concluído. Voltar pro app de verificação → 'Confirmar código'.",
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
    date: "2026-06-03",
    summary:
      "Entrada do subflow ('vem do Login') virou nó de outro fluxo — losango roxo que abre o fluxo de Login com modal de confirmação. Aresta solta do 2FA (confirmar código → usar backup) reconectada.",
    tags: ["flow-rework"],
  },
  {
    date: "2026-05-29",
    time: "15:58 BRT",
    summary:
      "Pagamento ganhou caminho de cartão recusado e bloqueio (mesmo PagamentoBody do primeiro acesso): recusa com motivo do banco + 3 saídas e bloqueio após 3 tentativas. Antes só existia o caminho feliz.",
    tags: ["new-page", "new-branch"],
  },
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
        title="Organização adicional"
        trailing={<FlowUpdatesBadge updates={updates} />}
      >
        Subflow disparado a partir do{" "}
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
        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo num painel lateral. Caixas tracejadas em âmbar são decisões. Setas âmbar indicam bifurcações."
        >
          <FlowDiagram flow="organizacao-adicional" nodes={NODES} edges={EDGES} height={1180} />
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
              <div className="aw-eyebrow mb-2">Adiar é uma opção, não uma pendência ignorada</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Quem comprou o plano correndo pode entrar na plataforma usando outra organização. O banner persistente em /inicio garante que a pendência fique visível até ser resolvida — sem bloquear o trabalho.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
