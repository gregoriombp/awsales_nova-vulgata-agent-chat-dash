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
 *
 * Centre spine: COL / COL_D (centered at x=380)
 * 3-branch row: GOOGLE_X (40) / MICROSOFT_X (280) / SENHA_X (520)
 * ──────────────────────────────────────────────────────────────────── */

const COL    = 280
const COL_D  = 260

const GOOGLE_X    = 40
const MICROSOFT_X = 280
const SENHA_X     = 520

const EXPIRADO_X  = 560   // Link errors corridor — alinhado com a row de "landing"
const UTILIZADO_X = 820
const CANCELADO_X = 1080

const MFA_SETUP_X  = 40   // Cadeia "Trava → setup TOTP → backup codes" (alinhado com Google)
const MFA_VERIFY_X = 520  // Tela "Verificação MFA" (alinhado com Senha)

const Y = {
  entrada:         0,
  linkValido:    160,   // decisão "Status do link?" — antes das boas-vindas
  landing:       320,
  decisao:       480,
  methods:       680,
  perfil:        860,
  policyDec:    1020,   // decisão "Policy da org?" — checa 2FA per-org
  mfaBranchRow: 1180,   // mfaGate (MFA_SETUP_X) | mfaVerify (MFA_VERIFY_X)
  mfaSetupApp:  1340,
  mfaBackupCodes: 1500,
  concluido:    1660,
  plataforma:   1820,
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
      title: "E-mail de convite",
      href: "#",
      note: "Pessoa recebe o e-mail do admin e clica no magic link.",
    },
  },
  {
    id: "linkValido",
    type: "decision",
    position: { x: COL_D, y: Y.linkValido },
    data: {
      step: "link",
      title: "Status do link?",
      question: "Convite dentro de 7 dias, não foi usado e não foi cancelado pelo admin?",
    },
  },
  {
    id: "landing",
    type: "screen",
    position: { x: COL, y: Y.landing },
    data: {
      step: "01",
      title: "Boas-vindas",
      href: "/convite",
      note: "Mostra organização, quem convidou, função e grupos pré-atribuídos.",
    },
  },
  {
    id: "linkExpirado",
    type: "screen",
    position: { x: EXPIRADO_X, y: Y.landing },
    data: {
      step: "01b",
      title: "Link expirado",
      href: "/convite/link-expirado",
      note: "Fora do fluxo demo. Passou de 7 dias — orienta contatar o admin pra reemitir. Sem auto-reenvio: quem reemite é o admin da org pelo painel de Acesso e Permissões.",
    },
  },
  {
    id: "linkUtilizado",
    type: "screen",
    position: { x: UTILIZADO_X, y: Y.landing },
    data: {
      step: "01c",
      title: "Link já utilizado",
      href: "/convite/link-utilizado",
      note: "Fora do fluxo demo. Magic link é one-time — se já foi consumido, a conta provavelmente existe. Direciona pra conversar com o admin da org.",
    },
  },
  {
    id: "linkCancelado",
    type: "screen",
    position: { x: CANCELADO_X, y: Y.landing },
    data: {
      step: "01d",
      title: "Link cancelado",
      href: "/convite/link-cancelado",
      note: "Fora do fluxo demo. Admin removeu o convite. Não revela motivo do cancelamento (decisão interna do admin). Direciona pra conversar com sua organização.",
    },
  },
  {
    id: "metodo",
    type: "decision",
    position: { x: COL_D, y: Y.decisao },
    data: {
      step: "02",
      title: "Sua conta",
      question: "Como você quer entrar daqui pra frente?",
    },
  },
  {
    id: "google",
    type: "screen",
    position: { x: GOOGLE_X, y: Y.methods },
    data: {
      step: "02a",
      title: "Google SSO",
      href: "/convite/conta",
      note: "OAuth com Google Workspace. Caminho preferido.",
    },
  },
  {
    id: "microsoft",
    type: "screen",
    position: { x: MICROSOFT_X, y: Y.methods },
    data: {
      step: "02b",
      title: "Microsoft SSO",
      href: "/convite/conta",
      note: "OAuth com Microsoft 365 / Entra ID.",
    },
  },
  {
    id: "senha",
    type: "screen",
    position: { x: SENHA_X, y: Y.methods },
    data: {
      step: "02c",
      title: "Senha",
      href: "/convite/conta",
      note: "Define senha forte. Caminho de exceção.",
    },
  },
  {
    id: "perfil",
    type: "screen",
    position: { x: COL, y: Y.perfil },
    data: {
      step: "03",
      title: "Seu perfil",
      href: "/convite/perfil",
      note: "Nome, cargo, foto e celular. E-mail vem travado do convite.",
    },
  },
  {
    id: "policyDec",
    type: "decision",
    position: { x: COL_D, y: Y.policyDec },
    data: {
      step: "03b",
      title: "Policy da org?",
      question: "A organização que convidou exige 2FA? O token é cunhado pela org neste ponto.",
    },
  },
  // ── MFA branch — espelha login-auth e primeiro-acesso. Vale pra todo onboarding. ──
  {
    id: "mfaGate",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBranchRow },
    data: {
      step: "03c",
      title: "Trava de 2FA",
      href: "/awsales/login",
      note: "Gate quando a org exige 2FA e o novo membro precisa configurar antes de entrar. Método único: app autenticador (TOTP).",
    },
  },
  {
    id: "mfaVerify",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaBranchRow },
    data: {
      step: "03f",
      title: "Verificação MFA",
      href: "/awsales/login",
      note: "Caso raro num convite: o membro já tinha TOTP de outra org. Input de 6 dígitos do app autenticador.",
    },
  },
  {
    id: "mfaSetupApp",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaSetupApp },
    data: {
      step: "03d",
      title: "Configurar app autenticador",
      href: "/awsales/login",
      note: "Passo 1 de 2 do setup TOTP. QR code + segredo em texto pra copiar. Input de 6 dígitos pra confirmar.",
    },
  },
  {
    id: "mfaBackupCodes",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBackupCodes },
    data: {
      step: "03e",
      title: "Códigos de backup",
      href: "/awsales/login",
      note: "Passo 2 de 2 do setup TOTP. 10 códigos de uso único. Copiar todos ou baixar .txt. Checkbox obrigatório 'salvei em lugar seguro'.",
    },
  },
  {
    id: "mfaRecovery",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaSetupApp },
    data: {
      step: "03g",
      title: "Usar código de backup",
      href: "/awsales/login",
      note: "Fallback quando o membro já tinha TOTP de outra org mas perdeu acesso ao app. Entra um dos 10 códigos de backup salvos no setup TOTP. Cada código vale uma vez.",
    },
  },
  {
    id: "concluido",
    type: "screen",
    position: { x: COL, y: Y.concluido },
    data: {
      step: "04",
      title: "Conta criada",
      href: "/convite/concluido",
      note: "Resumo de função e grupos. Inviter avisado.",
    },
  },
  {
    id: "plataforma",
    type: "screen",
    position: { x: COL, y: Y.plataforma },
    data: {
      step: "→ plataforma",
      title: "Entrar na plataforma",
      href: "/inicio",
      note: "Home logada — o membro já está dentro da operação.",
    },
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
  { ...edgeBase, id: "e-entrada-linkValido", source: "entrada", target: "linkValido", label: "Clica no link", ...labelProps },
  { ...branchEdge, id: "e-linkValido-landing",   source: "linkValido", target: "landing",       sourceHandle: "bottom", label: "Válido",               ...labelProps },
  { ...branchEdge, id: "e-linkValido-expirado",  source: "linkValido", target: "linkExpirado",  sourceHandle: "right",  label: "Expirado (7d)",        ...labelProps },
  { ...branchEdge, id: "e-linkValido-utilizado", source: "linkValido", target: "linkUtilizado", sourceHandle: "right",  label: "Já utilizado",         ...labelProps },
  { ...branchEdge, id: "e-linkValido-cancelado", source: "linkValido", target: "linkCancelado", sourceHandle: "right",  label: "Cancelado pelo admin", ...labelProps },
  { ...edgeBase, id: "e-landing-metodo", source: "landing", target: "metodo", label: "Aceitar", ...labelProps },
  { ...branchEdge, id: "e-metodo-google",    source: "metodo", target: "google",    sourceHandle: "left",   label: "Google",    ...labelProps },
  { ...branchEdge, id: "e-metodo-microsoft", source: "metodo", target: "microsoft", sourceHandle: "bottom", label: "Microsoft", ...labelProps },
  { ...branchEdge, id: "e-metodo-senha",     source: "metodo", target: "senha",     sourceHandle: "right",  label: "Senha",     ...labelProps },
  { ...edgeBase, id: "e-google-perfil",    source: "google",    target: "perfil" },
  { ...edgeBase, id: "e-microsoft-perfil", source: "microsoft", target: "perfil" },
  { ...edgeBase, id: "e-senha-perfil",     source: "senha",     target: "perfil" },
  { ...edgeBase, id: "e-perfil-policy",   source: "perfil",    target: "policyDec" },

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
  { ...branchEdge, id: "e-mfaVerify-recovery",    source: "mfaVerify",      target: "mfaRecovery",      label: "Usar backup", ...labelProps },
  { ...edgeBase,   id: "e-mfaRecovery-concluido", source: "mfaRecovery",    target: "concluido" },

  { ...edgeBase, id: "e-concluido-plataforma", source: "concluido", target: "plataforma" },
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "01",
    title: "Boas-vindas",
    href: "/convite",
    purpose:
      "Primeira tela depois do clique no magic link. Mostra a organização, quem convidou (com avatar), a função pré-atribuída e os grupos em que o membro já entra. O link já verificou o e-mail — não há código de 6 dígitos.",
    decisions: "Aceitar e continuar → criação da conta.",
  },
  {
    step: "01b",
    title: "Link expirado",
    href: "/convite/link-expirado",
    purpose:
      "Tela condicional fora do fluxo demo. Aparece quando o convite passa de 7 dias sem uso. Diferente do primeiro-acesso (convite comercial), aqui o ponto de contato é o admin da própria organização — quem dispara convite de membro é o admin do cliente. Sem auto-reenvio: o admin reemite manualmente pelo painel de Acesso e Permissões.",
    decisions: 'Falar com o admin → orientação de contato; "Voltar para o login" volta pra "/".',
  },
  {
    step: "01c",
    title: "Link já utilizado",
    href: "/convite/link-utilizado",
    purpose:
      "Tela condicional fora do fluxo demo. Magic link é one-time — se já foi consumido, é provável que a conta tenha sido criada e o membro deva fazer login normal, ou que alguém abriu o e-mail no lugar dele. Direciona pra conversar com o admin da organização.",
    decisions: 'Falar com o admin → orientação de contato; "Ir para o login" leva pra "/".',
  },
  {
    step: "01d",
    title: "Link cancelado",
    href: "/convite/link-cancelado",
    purpose:
      "Tela condicional fora do fluxo demo. Admin removeu o convite antes do uso. A mensagem NÃO revela o motivo do cancelamento — é decisão interna do admin (privacidade da organização). O membro é orientado a conversar com a própria organização, sem detalhes técnicos.",
    decisions: 'Falar com sua organização → orientação genérica; "Voltar para o login" volta pra "/".',
  },
  {
    step: "02",
    title: "Sua conta",
    href: "/convite/conta",
    purpose:
      "Autenticação. Google e Microsoft no topo (caminho preferido — público corporativo); senha como terceira opção. Mesmo padrão do /primeiro-acesso/conta pra manter coerência entre os dois onboardings.",
    decisions: "Escolher Google, Microsoft ou senha → perfil.",
  },
  {
    step: "03",
    title: "Seu perfil",
    href: "/convite/perfil",
    purpose:
      "Nome, cargo, foto e celular. O e-mail vem travado do convite — só o admin pode trocar. Diferente do onboarding de comprador, NÃO há campos de fatura: quem convidou cuida do financeiro.",
    decisions: "Continuar → policy da org?.",
  },
  {
    step: "03b",
    title: "Policy da org?",
    href: "/awsales/login",
    purpose: "Decisão server-side após o perfil: a organização que convidou exige 2FA? O token de sessão é cunhado pela org neste ponto. Mesma decisão usada nos flows de login, primeiro-acesso e organizacao-adicional.",
    decisions: "Org exige 2FA + membro sem TOTP → 'Trava de 2FA'. Membro tem TOTP → 'Verificação MFA'. Sem policy adicional → conta criada.",
  },
  {
    step: "03c",
    title: "Trava de 2FA",
    href: "/awsales/login",
    purpose: "Gate explicando que a organização exige 2FA e o novo membro precisa configurar agora pra continuar. Método único: app autenticador (TOTP). Mesmo componente dos demais flows.",
    decisions: "Configurar agora → tela de setup do app. Já tenho o app → vai pra 'Verificação MFA'. Sair → volta pro login.",
  },
  {
    step: "03d",
    title: "Configurar app autenticador (TOTP)",
    href: "/awsales/login",
    purpose: "Passo 1 de 2 do setup TOTP. QR code grande no centro pra escanear no app autenticador, com o segredo em texto logo abaixo (copy-to-clipboard) pra quem não consegue escanear. Embaixo, input de 6 dígitos pra confirmar.",
    decisions: "Código correto → códigos de backup. Voltar → trava de 2FA.",
  },
  {
    step: "03e",
    title: "Códigos de backup",
    href: "/awsales/login",
    purpose: "Passo 2 de 2 do setup TOTP. Apresenta 10 códigos de backup de uso único em grid de 2 colunas. Ações 'Copiar todos' e 'Baixar .txt'. Callout âmbar com aviso de risco. Checkbox obrigatório 'salvei em lugar seguro' antes do botão liberar.",
    decisions: "Marcar checkbox + Concluir → segue pra 'Conta criada'.",
  },
  {
    step: "03f",
    title: "Verificação MFA",
    href: "/awsales/login",
    purpose: "Caso raro num convite: o membro já tinha TOTP configurado em outra org/contexto. Input de 6 dígitos do app autenticador. Link 'Usar código de backup' como fallback quando o membro perdeu o app.",
    decisions: "Código correto → conta criada. Usar código de backup → 'Usar código de backup'. Sair → volta pro login.",
  },
  {
    step: "03g",
    title: "Usar código de backup",
    href: "/awsales/login",
    purpose: "Fallback de MFA quando o membro perdeu acesso ao app autenticador. Entra um dos 10 códigos de backup salvos no setup TOTP. Cada código é one-shot.",
    decisions: "Código válido → conta criada. Voltar pro app autenticador → 'Verificação MFA'.",
  },
  {
    step: "04",
    title: "Conta criada",
    href: "/convite/concluido",
    purpose:
      "Confirma que a conta está ativa, mostra resumo da função e grupos e informa que quem convidou foi avisado. CTA primário leva direto pra plataforma.",
    decisions: "Entrar na plataforma → /inicio (home logada).",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Updates log — structural changes only. Add new entries at the top.
 * Managed by the `bombardier-update-ux-flow` skill.
 * ──────────────────────────────────────────────────────────────────── */

const updates: FlowUpdate[] = [
  {
    date: "2026-05-29",
    time: "17:14 BRT",
    summary:
      "Braço de 2FA e os 3 erros de link saíram do diagrama pro protótipo clicável: nova rota /convite/seguranca (setup TOTP + códigos de backup) e as telas de link expirado / já utilizado / cancelado agora existem de verdade.",
    tags: ["new-page", "flow-rework"],
  },
  {
    date: "2026-05-28",
    summary:
      "Nova tela 'Usar código de backup' como fallback do 'Verificação MFA' — pro membro que já tinha TOTP de outra org mas perdeu o app. Converge no mesmo 'Conta criada'.",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-27",
    summary:
      "Estados de erro de link no início (expirado, já utilizado, cancelado pelo admin), espelhando o pattern do primeiro-acesso. Sem auto-reenvio: o admin da org reemite pelo painel. Cancelado não revela motivo — decisão interna do admin.",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-27",
    summary:
      "Branch de 2FA por organização entre perfil e conta criada. Org que convidou pode exigir 2FA antes do membro entrar — a regra pega pros dois lados (login e convite), porque quem decide é o super admin da org.",
    tags: ["new-page", "new-branch"],
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

export default function ConviteMembroFlowPage() {
  return (
    <>
      <PageHero
        title="Convite de membro"
        trailing={<FlowUpdatesBadge updates={updates} />}
      >
        Fluxo que um novo membro percorre depois de clicar no magic link
        recebido por e-mail. Boas-vindas, criação de conta, perfil, eventual
        configuração de 2FA (se a org exige) e confirmação — pra que alguém
        convidado pelo admin entre na operação sem fricção.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-2xl -mt-8">
          O magic link serve como verificação — não há código de 6 dígitos.
          Antes das boas-vindas, três ramos condicionais cobrem estados de
          falha do link (expirado, já utilizado, cancelado pelo admin). Após
          o perfil, se a organização que convidou exige 2FA, o membro passa
          pelo setup do TOTP antes de entrar na plataforma. Função e grupos
          vêm pré-definidos pelo inviter; o membro não escolhe seu nível de
          acesso.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo num painel lateral. Caixas tracejadas em âmbar são decisões. Setas âmbar indicam os caminhos de bifurcação."
        >
          <FlowDiagram flow="convite-membro" nodes={NODES} edges={EDGES} height={2080} />
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
              <div className="aw-eyebrow mb-2">Magic link é a verificação</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Não há etapa de código de 6 dígitos como em /primeiro-acesso. O
                próprio link no e-mail já comprova posse da caixa de entrada —
                um clique a menos pra completar o onboarding.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Função vem pré-definida</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Quem convida escolhe a função e os grupos no momento do
                convite. O novo membro vê o que vai receber, mas não altera —
                permissão é responsabilidade do admin, não da pessoa convidada.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Sem contrato e sem pagamento</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                A organização já está com o contrato ativo. O membro não vê
                condições comerciais, não aceita termos comerciais e não
                preenche dados de fatura — entra direto na operação.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Coerência com o buyer</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Mesmo AwOnboardingShell, mesma tipografia, mesmos tokens.
                Quando o admin (que passou por /primeiro-acesso) compara o
                ambiente com o que o time vê, o visual é o mesmo — sem
                surpresas.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Três motivos pra um link falhar</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Magic links de convite são one-time e expiram em 7 dias. Cada
                motivo tem sua própria tela: <b className="font-medium text-[var(--fg-primary)]">expirado</b> orienta
                pedir reenvio ao admin (sem auto-reenvio aqui — quem reemite é
                o admin pelo painel da org), <b className="font-medium text-[var(--fg-primary)]">já utilizado</b> também
                direciona pro admin, e <b className="font-medium text-[var(--fg-primary)]">cancelado</b> não revela
                o motivo do cancelamento (decisão interna do admin) — só
                orienta a conversar com a organização.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">2FA decidido pela org que convidou</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Quem decide se 2FA é obrigatório é o super admin da
                organização. A regra pega pros dois lados: se a org exige
                TOTP no login dos membros existentes, também exige no
                onboarding dos recém-convidados — caso contrário, o convite
                viraria uma porta de entrada que escapa da policy. Membro sem
                TOTP cai no setup; membro multi-org que já tem TOTP só
                verifica.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
