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

const ACESSAR_X   = 80
const CONSULTOR_X = 480

const EXPIRADO_X   = 560
const UTILIZADO_X  = 820
const CANCELADO_X  = 1080

const MFA_SETUP_X  = 40   // Cadeia "Trava → setup TOTP → backup codes" (left corridor, alinhado com Pix)
const MFA_VERIFY_X = 520  // Tela "Verificação MFA" (right corridor, alinhado com Boleto)

const Y = {
  entrada:        0,
  linkValido:   160,
  verificacao:  360,
  conta:        520,
  perfil:       690,
  contrato:     840,
  pagamento:   1000,
  methods:     1200,
  policyDec:   1360,   // decisão "Policy da org?" — checa 2FA per-org
  mfaBranchRow: 1520,  // mfaGate (MFA_SETUP_X) | mfaVerify (MFA_VERIFY_X)
  mfaSetupApp: 1680,
  mfaBackupCodes: 1840,
  concluido:   2000,
  finalDecision: 2160,
  finalOptions:  2320,
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes
 * ──────────────────────────────────────────────────────────────────── */

const NODES: Node[] = [
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: { step: "entrada", title: "Login", href: "/awsales/login?screen=login", note: "Tela de login. Clique em Primeiro acesso para iniciar o fluxo." },
  },
  {
    id: "linkValido",
    type: "decision",
    position: { x: COL_D, y: Y.linkValido },
    data: { step: "link", title: "Status do link?", question: "O link do e-mail ainda é válido? (até 10 dias, primeira utilização e não cancelado pela organização)" },
  },
  {
    id: "verificacao",
    type: "screen",
    position: { x: COL, y: Y.verificacao },
    data: { step: "01", title: "Acesso por link", href: "/primeiro-acesso/verificacao", note: "Magic link: o clique no link enviado por e-mail já autentica — sem código nem senha. Segue direto pra criação de conta." },
  },
  {
    id: "linkExpirado",
    type: "screen",
    position: { x: EXPIRADO_X, y: Y.verificacao },
    data: { step: "01b", title: "Link expirado", href: "/primeiro-acesso/link-expirado", note: "Fora do fluxo demo. Passou de 10 dias — oferece reenvio." },
  },
  {
    id: "linkUtilizado",
    type: "screen",
    position: { x: UTILIZADO_X, y: Y.verificacao },
    data: { step: "01c", title: "Link já utilizado", href: "/primeiro-acesso/link-utilizado", note: "Fora do fluxo demo. Link é one-time — direciona pro suporte." },
  },
  {
    id: "linkCancelado",
    type: "screen",
    position: { x: CANCELADO_X, y: Y.verificacao },
    data: { step: "01d", title: "Link cancelado", href: "/primeiro-acesso/link-cancelado", note: "Fora do fluxo demo. Convite removido pela organização — pro suporte." },
  },
  {
    id: "conta",
    type: "decision",
    position: { x: COL_D, y: Y.conta },
    data: { step: "02", title: "Sua conta", question: "Cliente cria a conta: Google, Microsoft ou senha." },
  },
  {
    id: "perfil",
    type: "screen",
    position: { x: COL, y: Y.perfil },
    data: { step: "03", title: "Seu perfil", href: "/primeiro-acesso/perfil", note: "Nome, telefone, foto e destinatários de fatura." },
  },
  {
    id: "contrato",
    type: "screen",
    position: { x: COL, y: Y.contrato },
    data: { step: "04", title: "Contrato", href: "/primeiro-acesso/contrato", note: "Revisa condições comerciais e aceita os termos." },
  },
  {
    id: "pagamento",
    type: "decision",
    position: { x: COL_D, y: Y.pagamento },
    data: { step: "05", title: "Pagamento", question: "Implementação + 1ª mensalidade. Qual o método?" },
  },
  {
    id: "pix",
    type: "screen",
    position: { x: PIX_X, y: Y.methods },
    data: { step: "05a", title: "Pix", href: "/primeiro-acesso/pagamento", note: "QR Code instantâneo. Confirmação em segundos." },
  },
  {
    id: "cartao",
    type: "screen",
    position: { x: CARTAO_X, y: Y.methods },
    data: { step: "05b", title: "Cartão de crédito", href: "/primeiro-acesso/pagamento", note: "Crédito em até 12×. Confirmação imediata. Recusa do banco abre modal inline com o motivo + opção de tentar outro cartão ou mudar de método — sem sair da etapa de pagamento." },
  },
  {
    id: "boleto",
    type: "screen",
    position: { x: BOLETO_X, y: Y.methods },
    data: { step: "05c", title: "Boleto bancário", href: "/primeiro-acesso/pagamento", note: "Vencimento em 3 dias úteis. Compensação em 1 dia útil." },
  },
  {
    id: "policyDec",
    type: "decision",
    position: { x: COL_D, y: Y.policyDec },
    data: { step: "05d", title: "Policy da org?", question: "A organização que convidou esse membro exige 2FA? O token de sessão é cunhado pela org neste ponto." },
  },
  // ── MFA branch — espelha o flow de login. Vale tanto pra signup quanto pra login. ──
  {
    id: "mfaGate",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBranchRow },
    data: { step: "05e", title: "Trava de 2FA", href: "/awsales/login?screen=mfaGate", note: "Gate quando a org exige 2FA e o novo membro precisa configurar antes de acessar. Método único: app autenticador (TOTP). Botões 'Configurar agora' e 'Já tenho o app configurado'." },
  },
  {
    id: "mfaVerify",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaBranchRow },
    data: { step: "05h", title: "Verificação MFA", href: "/awsales/login?screen=mfaVerify", note: "Para membros que já tinham TOTP configurado em outro contexto (raro num primeiro acesso, mas possível se o usuário já existia em outra org). Input de 6 dígitos." },
  },
  {
    id: "mfaSetupApp",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaSetupApp },
    data: { step: "05f", title: "Configurar app autenticador", href: "/awsales/login?screen=mfaSetupApp", note: "Passo 1 de 2 do setup TOTP. QR code + segredo em texto pra copiar. Input de 6 dígitos pra confirmar." },
  },
  {
    id: "mfaBackupCodes",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBackupCodes },
    data: { step: "05g", title: "Códigos de backup", href: "/awsales/login?screen=mfaBackupCodes", note: "Passo 2 de 2 do setup TOTP. 10 códigos de uso único. Copiar todos ou baixar .txt. Checkbox obrigatório 'salvei em lugar seguro'." },
  },
  {
    id: "mfaRecovery",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaSetupApp },
    data: { step: "05i", title: "Usar código de backup", href: "/awsales/login?screen=mfaRecovery", note: "Fallback raro num primeiro acesso, mas relevante quando o usuário já tinha TOTP de outra org e perdeu o app. Entra um dos 10 códigos de backup salvos. Cada código vale uma vez." },
  },
  {
    id: "concluido",
    type: "screen",
    position: { x: COL, y: Y.concluido },
    data: { step: "06", title: "Concluído", href: "/primeiro-acesso/concluido", note: "Ambiente provisionado e pronto para uso." },
  },
  {
    id: "finalDecision",
    type: "decision",
    position: { x: COL_D, y: Y.finalDecision },
    data: { step: "fim", title: "O que fazer agora?", question: "Acessar a plataforma direto ou conversar com o consultor." },
  },
  {
    id: "acessar",
    type: "screen",
    position: { x: ACESSAR_X, y: Y.finalOptions },
    data: { step: "→ plataforma", title: "Acessar plataforma", href: "/inicio", note: "Home logada — entra no produto imediatamente." },
  },
  {
    id: "consultor",
    type: "screen",
    position: { x: CONSULTOR_X, y: Y.finalOptions },
    data: { step: "→ consultor", title: "Falar com consultor", href: "/suporte", note: "Agenda uma conversa com o Account Manager." },
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
  { ...edgeBase, id: "e-entrada-linkValido", source: "entrada", target: "linkValido", label: "Primeiro acesso", ...labelProps },
  { ...branchEdge, id: "e-linkValido-verificacao", source: "linkValido", target: "verificacao", sourceHandle: "bottom", label: "Válido", ...labelProps },
  { ...branchEdge, id: "e-linkValido-expirado",    source: "linkValido", target: "linkExpirado",  sourceHandle: "right", label: "Expirado (10d)", ...labelProps },
  { ...branchEdge, id: "e-linkValido-utilizado",   source: "linkValido", target: "linkUtilizado", sourceHandle: "right", label: "Já utilizado",   ...labelProps },
  { ...branchEdge, id: "e-linkValido-cancelado",   source: "linkValido", target: "linkCancelado", sourceHandle: "right", label: "Cancelado",      ...labelProps },
  { ...edgeBase, id: "e-verificacao-conta", source: "verificacao", target: "conta" },
  { ...edgeBase, id: "e-conta-perfil", source: "conta", target: "perfil", sourceHandle: "bottom" },
  { ...edgeBase, id: "e-perfil-contrato", source: "perfil", target: "contrato" },
  { ...edgeBase, id: "e-contrato-pagamento", source: "contrato", target: "pagamento" },
  { ...branchEdge, id: "e-pagamento-pix",    source: "pagamento", target: "pix",    sourceHandle: "left",   label: "Pix",    ...labelProps },
  { ...branchEdge, id: "e-pagamento-cartao", source: "pagamento", target: "cartao", sourceHandle: "bottom", label: "Cartão", ...labelProps },
  { ...branchEdge, id: "e-pagamento-boleto", source: "pagamento", target: "boleto", sourceHandle: "right",  label: "Boleto", ...labelProps },
  { ...edgeBase, id: "e-pix-policy",    source: "pix",    target: "policyDec" },
  { ...edgeBase, id: "e-cartao-policy", source: "cartao", target: "policyDec" },
  { ...edgeBase, id: "e-boleto-policy", source: "boleto", target: "policyDec" },

  // ── Policy da org? — 2FA per-org ─────────────────────────────────
  { ...branchEdge, id: "e-policy-mfaGate",    source: "policyDec", target: "mfaGate",    sourceHandle: "left",   label: "Org exige 2FA · membro sem TOTP", ...labelProps },
  { ...branchEdge, id: "e-policy-mfaVerify",  source: "policyDec", target: "mfaVerify",  sourceHandle: "right",  label: "Membro já tem TOTP",              ...labelProps },
  { ...branchEdge, id: "e-policy-concluido",  source: "policyDec", target: "concluido",  sourceHandle: "bottom", label: "Sem policy adicional",            ...labelProps },

  // ── Setup chain: gate → app → backup → concluido ─────────────────
  { ...branchEdge, id: "e-mfaGate-already",      source: "mfaGate",        target: "mfaVerify",       label: "Já tenho o app", ...labelProps },
  { ...edgeBase,   id: "e-mfaGate-setup",        source: "mfaGate",        target: "mfaSetupApp",     label: "Configurar",     ...labelProps },
  { ...edgeBase,   id: "e-mfaSetup-backup",      source: "mfaSetupApp",    target: "mfaBackupCodes" },
  { ...edgeBase,   id: "e-mfaBackup-concluido",  source: "mfaBackupCodes", target: "concluido" },
  { ...edgeBase,   id: "e-mfaVerify-concluido",  source: "mfaVerify",      target: "concluido" },
  { ...branchEdge, id: "e-mfaVerify-recovery",    source: "mfaVerify",      target: "mfaRecovery",     label: "Usar backup", ...labelProps },
  { ...edgeBase,   id: "e-mfaRecovery-concluido", source: "mfaRecovery",    target: "concluido" },

  { ...edgeBase, id: "e-concluido-final",  source: "concluido", target: "finalDecision" },
  { ...branchEdge, id: "e-final-acessar",   source: "finalDecision", target: "acessar",   sourceHandle: "left",  label: "Acessar plataforma",   ...labelProps },
  { ...branchEdge, id: "e-final-consultor", source: "finalDecision", target: "consultor", sourceHandle: "right", label: "Falar com consultor", ...labelProps },
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "01",
    title: "Acesso por link",
    href: "/primeiro-acesso/verificacao",
    purpose: "Primeira tela do produto. Entrada por magic link (WorkOS): o link enviado no convite carrega um token assinado e o clique já autentica o e-mail — sem código nem senha. Confirma que a pessoa foi convidada e segue pra criação de conta.",
    decisions: "Clique no link válido → acesso validado → criação da conta. Link expirado / já usado / cancelado → telas próprias.",
  },
  {
    step: "01b",
    title: "Link expirado",
    href: "/primeiro-acesso/link-expirado",
    purpose: "Tela condicional fora do fluxo demo. Aparece quando o usuário clica no e-mail de primeiro acesso depois do prazo de 10 dias. Apresenta o motivo (link expirado) e a ação única de solicitar um novo link.",
    decisions: 'Solicitar novo link → novo e-mail é enviado; "Voltar para o login" volta pra "/".',
  },
  {
    step: "01c",
    title: "Link já utilizado",
    href: "/primeiro-acesso/link-utilizado",
    purpose: "Tela condicional fora do fluxo demo. Aparece quando o link de primeiro acesso já foi consumido — links são one-time. Pode indicar que a conta já foi criada (e o usuário deveria fazer login) ou que alguém abriu o e-mail no lugar dele. Direciona pro suporte pra revogar e reemitir o acesso se necessário.",
    decisions: 'Falar com suporte → abre canal de suporte; "Voltar para o login" volta pra "/".',
  },
  {
    step: "01d",
    title: "Link cancelado",
    href: "/primeiro-acesso/link-cancelado",
    purpose: "Tela condicional fora do fluxo demo. Aparece quando o convite de primeiro acesso foi cancelado ou removido pela organização (reemissão, troca de destinatário, cadastro pausado). O usuário não consegue prosseguir sem ajuda — o suporte verifica o status do convite com a organização.",
    decisions: 'Falar com suporte → abre canal de suporte; "Voltar para o login" volta pra "/".',
  },
  {
    step: "02",
    title: "Sua conta",
    href: "/primeiro-acesso/conta",
    purpose: "Autenticação logo no início — antes de aceitar o contrato ou pagar. OAuth (Google/Microsoft) reduz fricção e é o caminho preferido; senha fica como terceira opção.",
    decisions: "Escolher entre Google, Microsoft ou senha → perfil.",
  },
  {
    step: "03",
    title: "Seu perfil",
    href: "/primeiro-acesso/perfil",
    purpose: "Cliente confirma como quer ser chamado, telefone e foto, e define quem recebe as faturas — ele mesmo e/ou outros destinatários da organização.",
    decisions: "Continuar → contrato.",
  },
  {
    step: "04",
    title: "Contrato",
    href: "/primeiro-acesso/contrato",
    purpose: "Cliente revisa dados da empresa e condições comerciais (implementação, mensalidade cheia, 1ª mensalidade prorrata), conhece o time AwSales e aceita os termos antes de pagar.",
    decisions: "Aceitar os termos → pagamento.",
  },
  {
    step: "05",
    title: "Pagamento",
    href: "/primeiro-acesso/pagamento",
    purpose: "Etapa única que cobra a implementação e a 1ª mensalidade. Três métodos disponíveis: Pix (confirmação instantânea), Cartão de crédito (em até 12×) ou Boleto bancário (compensação em 1 dia útil). Recusa do banco no cartão abre modal inline com o motivo — o usuário decide entre tentar outro cartão ou trocar de método sem sair da etapa.",
    decisions: "Pix → QR Code; Cartão → crédito parcelado; Boleto → gerado na hora → policy da org?.",
  },
  {
    step: "05d",
    title: "Policy da org?",
    href: "/awsales/login",
    purpose: "Decisão server-side após pagamento confirmado: a organização que convidou esse membro exige 2FA? O token de sessão é cunhado pela org neste ponto, com as exigências de segurança daquela org específica. Mesma decisão usada no flow de login.",
    decisions: "Org exige 2FA + membro sem TOTP → 'Trava de 2FA'. Membro tem TOTP → 'Verificação MFA'. Sem policy adicional → concluído.",
  },
  {
    step: "05e",
    title: "Trava de 2FA",
    href: "/awsales/login?screen=mfaGate",
    purpose: "Gate explicando que a organização exige 2FA e o novo membro precisa configurar agora pra continuar. Método único por enquanto: app autenticador (TOTP) — Google Authenticator, 1Password, Authy, similar. Mesmo componente do flow de login.",
    decisions: "Configurar agora → tela de setup do app. Já tenho o app → vai pra 'Verificação MFA'. Sair → volta pro login.",
  },
  {
    step: "05f",
    title: "Configurar app autenticador (TOTP)",
    href: "/awsales/login?screen=mfaSetupApp",
    purpose: "Passo 1 de 2 do setup TOTP. QR code grande no centro pra escanear no app autenticador, com o segredo em texto logo abaixo (copy-to-clipboard) pra quem não consegue escanear. Embaixo, input de 6 dígitos pra confirmar.",
    decisions: "Código correto → códigos de backup. Voltar → trava de 2FA.",
  },
  {
    step: "05g",
    title: "Códigos de backup",
    href: "/awsales/login?screen=mfaBackupCodes",
    purpose: "Passo 2 de 2 do setup TOTP. Apresenta 10 códigos de backup de uso único em grid de 2 colunas. Ações 'Copiar todos' e 'Baixar .txt'. Callout âmbar com aviso de risco. Checkbox obrigatório 'salvei em lugar seguro' antes do botão liberar.",
    decisions: "Marcar checkbox + Concluir → segue pro 'Concluído' (provisão do ambiente).",
  },
  {
    step: "05h",
    title: "Verificação MFA",
    href: "/awsales/login?screen=mfaVerify",
    purpose: "Caso raro no primeiro acesso: membro já tinha TOTP configurado em outra org/contexto. Input de 6 dígitos do app autenticador. Link 'Usar código de backup' como fallback.",
    decisions: "Código correto → concluído. Usar código de backup → 'Usar código de backup'. Sair → volta pro login.",
  },
  {
    step: "05i",
    title: "Usar código de backup",
    href: "/awsales/login?screen=mfaRecovery",
    purpose: "Fallback de MFA quando o usuário perdeu acesso ao app autenticador. Entra um dos 10 códigos de backup salvos no setup TOTP. Cada código é one-shot.",
    decisions: "Código válido → concluído. Voltar pro app autenticador → 'Verificação MFA'.",
  },
  {
    step: "06",
    title: "Concluído",
    href: "/primeiro-acesso/concluido",
    purpose: "Ambiente provisionado e pronto. Mostra o resumo do que foi pago, a próxima cobrança e o Account Manager. Cliente escolhe como prosseguir.",
    decisions: "Acessar plataforma → /inicio (home logada); Falar com consultor → agenda conversa com o Account Manager.",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Updates log — structural changes only. Add new entries at the top.
 * Managed by the `bombardier-update-ux-flow` skill.
 * ──────────────────────────────────────────────────────────────────── */

const updates: FlowUpdate[] = [
  {
    date: "2026-05-29",
    time: "16:37 BRT",
    summary:
      "Entrada do responsável agora é magic link: o clique no link do e-mail já autentica (sem código nem serial). Substitui a verificação por código.",
    tags: ["flow-rework", "integration"],
  },
  {
    date: "2026-05-29",
    time: "15:58 BRT",
    summary:
      "Pagamento ganhou caminho de cartão recusado e bloqueio: a recusa mostra o motivo do banco e 3 saídas (outro cartão / Pix-boleto / falar com o AM); após 3 tentativas, bloqueia e abre chamado. Antes só existia o caminho feliz.",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-28",
    summary:
      "Nova tela 'Usar código de backup' como fallback do 'Verificação MFA' — pro membro que já tinha TOTP de outra org e perdeu acesso ao app. Converge no mesmo 'Concluído'.",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-27",
    summary:
      "Branch de 2FA por organização entre pagamento e concluído, espelhando login-auth: gate, setup TOTP, códigos de backup, verificação MFA.",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-26",
    summary:
      "Decisão de link expandida em três estados de falha — expirado, já utilizado e cancelado. Cada um abre uma tela condicional dedicada com CTA pro suporte (exceto 'expirado', que ainda permite reenvio).",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-21",
    summary:
      "Branch condicional 'link expirado' adicionado quando o e-mail de primeiro acesso passa de 10 dias.",
    tags: ["new-page", "new-branch"],
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

export default function PrimeiroAcessoFlowPage() {
  return (
    <>
      <PageHero
        title="Primeiro acesso"
        trailing={<FlowUpdatesBadge updates={updates} />}
      >
        Fluxo completo de onboarding do novo cliente, em 6 etapas. O cliente se
        autentica logo no começo — antes de aceitar o contrato e de qualquer
        pagamento. Use este mapa quando precisar entender pra onde uma decisão
        leva, ou ao iterar em qualquer tela do fluxo.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-2xl -mt-8">
          Seis etapas lineares do convite ao ambiente ativo: verificação do código,
          criação de conta, perfil, contrato, pagamento (com 3 métodos disponíveis) e
          confirmação. A autenticação acontece na etapa 02 — antes do contrato e de
          qualquer cobrança. Logo no início há três ramos condicionais fora do fluxo
          demo, um para cada motivo de link inválido: expirado (reenvia), já utilizado
          (suporte) ou cancelado pela organização (suporte). No final, o cliente
          escolhe acessar a plataforma direto ou conversar com o consultor.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo num painel lateral. Caixas tracejadas em âmbar são decisões — pontos em que o cliente faz uma escolha. Setas âmbar indicam os caminhos de bifurcação."
        >
          <FlowDiagram flow="primeiro-acesso" nodes={NODES} edges={EDGES} height={2480} />
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
          lead="Por que o fluxo está estruturado desse jeito."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Autenticar antes de tudo</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                O cliente cria a conta na etapa 02 — antes de aceitar o contrato e antes de qualquer pagamento. Ninguém concorda com contrato ou paga sem uma identidade verificada por trás.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Verificação é a etapa 01</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                A primeira tela do produto valida o código de primeiro acesso enviado no convite. É o portão de entrada — só quem foi convidado segue para a criação da conta.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Três métodos de pagamento</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Pix para quem quer confirmar na hora, cartão de crédito para parcelamento, boleto para quem prefere o meio bancário tradicional. Todos convergem pro mesmo estado "Concluído".
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">OAuth como caminho preferido</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Google/Microsoft no topo, senha como terceira opção. Usuário corporativo (público-alvo) prefere SSO. Reduz reset de senha no longo prazo.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Três motivos pra um link falhar</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Links de primeiro acesso são one-time e expiram após 10 dias. Em vez de cair numa única tela genérica de erro, cada motivo tem sua própria tela explicativa: <b className="font-medium text-[var(--fg-primary)]">expirado</b> oferece reenvio direto, <b className="font-medium text-[var(--fg-primary)]">já utilizado</b> e <b className="font-medium text-[var(--fg-primary)]">cancelado</b> direcionam pro suporte — porque exigem verificação de identidade ou contato com a organização.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
