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
 * Left corridor:  GOOGLE_X / PRIMO_TERM_X  (x < 0)
 * Right corridor: MFA_X, ERRO_X, MS_X      (x > 500)
 *
 * Google and Microsoft are placed at the SAME ROW as primeiroAcessoDec
 * (oauthMfaRow), then metodo connects them via long corridor edges that
 * stay outside the centre spine — no diagonal crossings.
 * ──────────────────────────────────────────────────────────────────── */

const COL   = 280    // ScreenNode  centre x
const COL_D = 260    // DecisionNode centre x

const GOOGLE_X     = -200  // OAuth Google  (far-left corridor)
const MFA_X        = 500   // MFA screen    (right of centre, no crossing with "Sem MFA" vertical)
const ERRO_X       = 720   // Error + recovery chain
const MS_X         = 1000  // OAuth Microsoft (far-right corridor)
const PRIMO_TERM_X = -200  // "Primeiro acesso" terminal (below Google)
const NOVA_ORG_X   = 540   // "Configurar org adicional" terminal (right of platform)

const Y = {
  entrada:           0,
  metodo:          160,
  credenciais:     360,
  valid:           520,
  errMfaRow:       680,   // mfaDec (centre) | erro (ERRO_X)
  oauthMfaRow:     880,   // oauthGoogle | mfa (MFA_X) | oauthMs
  recEmail:        840,   // recovery chain starts just below erro
  primeiroAcessoDec: 1060,
  recSent:        1000,
  novaSenha:      1160,
  primeiroAcesso: 1240,
  novaOrgDec:     1240,
  senhaRedef:     1320,
  platform:       1440,
  novaOrgConfig:  1440,
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes
 * ──────────────────────────────────────────────────────────────────── */

const NODES: Node[] = [
  // ── Centre spine ──────────────────────────────────────────────────
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: { step: "entrada", title: "Login", href: "#", note: "Tela inicial. Escolher método ou recuperar senha." },
  },
  {
    id: "metodo",
    type: "decision",
    position: { x: COL_D, y: Y.metodo },
    data: { step: "01", title: "Método de acesso", question: "Como o usuário quer entrar na plataforma?" },
  },
  {
    id: "credenciais",
    type: "screen",
    position: { x: COL, y: Y.credenciais },
    data: { step: "02", title: "E-mail + senha", href: "#", note: "Inserir e-mail e senha cadastrados na plataforma." },
  },
  {
    id: "valid",
    type: "decision",
    position: { x: COL_D, y: Y.valid },
    data: { step: "03", title: "Credenciais válidas?", question: "E-mail e senha conferem com os dados cadastrados?" },
  },
  {
    id: "mfaDec",
    type: "decision",
    position: { x: COL_D, y: Y.errMfaRow },
    data: { step: "04", title: "MFA ativo?", question: "A conta tem autenticação de dois fatores habilitada?" },
  },
  {
    id: "mfa",
    type: "screen",
    position: { x: MFA_X, y: Y.oauthMfaRow },
    data: { step: "05", title: "Verificação MFA", href: "#", note: "Código de 6 dígitos via app autenticador ou SMS." },
  },
  {
    id: "primeiroAcessoDec",
    type: "decision",
    position: { x: COL_D, y: Y.primeiroAcessoDec },
    data: { step: "06", title: "Primeiro acesso?", question: "Backend verifica se o usuário já tem conta ativa na organização." },
  },
  {
    id: "novaOrgDec",
    type: "decision",
    position: { x: COL_D, y: Y.novaOrgDec },
    data: { step: "07", title: "Nova organização para configurar?", question: "Backend verifica se o usuário comprou um plano novo sem organização configurada." },
  },
  {
    id: "platform",
    type: "screen",
    position: { x: COL, y: Y.platform },
    data: { step: "→ plataforma", title: "Entrou na plataforma", href: "/inicio", note: "Home logada. Se houver org pendente, banner no topo do /inicio lembra de configurar." },
  },
  {
    id: "novaOrgConfig",
    type: "screen",
    position: { x: NOVA_ORG_X, y: Y.novaOrgConfig },
    data: { step: "→ org adicional", title: "Configurar plano adicional", href: "/organizacao-adicional", note: "Contrato + pagamento (sem perfil — já existe)." },
  },
  // ── Left corridor — OAuth Google + primeiro-acesso terminal ────────
  {
    id: "oauthGoogle",
    type: "screen",
    position: { x: GOOGLE_X, y: Y.oauthMfaRow },
    data: { step: "02a", title: "OAuth Google", href: "#", note: "OAuth 2.0 via conta Google corporativa." },
  },
  {
    id: "primeiroAcesso",
    type: "screen",
    position: { x: PRIMO_TERM_X, y: Y.primeiroAcesso },
    data: { step: "→ onboarding", title: "Fluxo de primeiro acesso", href: "/bombardier/styleguide/ux-flows/primeiro-acesso", note: "Backend redireciona para onboarding (perfil, contrato, pagamento)." },
  },
  // ── Right corridor — OAuth Microsoft ──────────────────────────────
  {
    id: "oauthMs",
    type: "screen",
    position: { x: MS_X, y: Y.oauthMfaRow },
    data: { step: "02c", title: "OAuth Microsoft", href: "#", note: "OAuth 2.0 via conta Microsoft / Azure AD." },
  },
  // ── Error + recovery chain (ERRO_X column) ────────────────────────
  {
    id: "erro",
    type: "screen",
    position: { x: ERRO_X, y: Y.errMfaRow },
    data: { step: "→ erro", title: "Erro de login", href: "#", note: 'Credenciais inválidas. Clique em "Esqueci a senha" ou tente novamente.' },
  },
  {
    id: "recEmail",
    type: "screen",
    position: { x: ERRO_X, y: Y.recEmail },
    data: { step: "B1", title: "Inserir e-mail", href: "#", note: "Usuário informa o e-mail cadastrado para receber o link." },
  },
  {
    id: "recSent",
    type: "screen",
    position: { x: ERRO_X, y: Y.recSent },
    data: { step: "B2", title: "E-mail enviado", href: "#", note: "Link de redefinição enviado. Usuário acessa o e-mail externamente." },
  },
  {
    id: "novaSenha",
    type: "screen",
    position: { x: ERRO_X, y: Y.novaSenha },
    data: { step: "B3", title: "Nova senha", href: "#", note: "Tela aberta pelo link. Usuário define e confirma a nova senha." },
  },
  {
    id: "senhaRedef",
    type: "screen",
    position: { x: ERRO_X, y: Y.senhaRedef },
    data: { step: "B4", title: "Senha redefinida", href: "#", note: "Sucesso. Redireciona automaticamente para a tela de Login." },
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
  // ── Entry ──────────────────────────────────────────────────────────
  { ...edgeBase,   id: "e-entrada-metodo",    source: "entrada",    target: "metodo",           label: "Acessar",          ...labelProps },

  // ── Auth method branches (metodo → each method) ────────────────────
  // left/right corridor edges stay outside the centre spine (x<260 and x>500)
  { ...branchEdge, id: "e-metodo-google",     source: "metodo",     target: "oauthGoogle",      sourceHandle: "left",   label: "Google",         ...labelProps },
  { ...branchEdge, id: "e-metodo-cred",       source: "metodo",     target: "credenciais",      sourceHandle: "bottom", label: "E-mail + senha", ...labelProps },
  { ...branchEdge, id: "e-metodo-ms",         source: "metodo",     target: "oauthMs",          sourceHandle: "right",  label: "Microsoft",      ...labelProps },

  // ── Email+senha path ───────────────────────────────────────────────
  { ...edgeBase,   id: "e-cred-valid",        source: "credenciais",target: "valid" },
  { ...branchEdge, id: "e-valid-mfadec",      source: "valid",      target: "mfaDec",           sourceHandle: "bottom", label: "Corretas",   ...labelProps },
  { ...branchEdge, id: "e-valid-erro",        source: "valid",      target: "erro",             sourceHandle: "right",  label: "Inválidas",  ...labelProps },

  // ── MFA branch — right exits avoid the "Sem MFA" vertical line ─────
  { ...branchEdge, id: "e-mfadec-mfa",        source: "mfaDec",     target: "mfa",              sourceHandle: "right",  label: "MFA ativo",  ...labelProps },
  // "Sem MFA" goes straight down the centre spine (x=380), never crossing mfa at x=500-700
  { ...branchEdge, id: "e-mfadec-primacesso", source: "mfaDec",     target: "primeiroAcessoDec",sourceHandle: "bottom", label: "Sem MFA",    ...labelProps },

  // ── Convergence at primeiroAcessoDec ──────────────────────────────
  { ...edgeBase,   id: "e-google-primacesso", source: "oauthGoogle",target: "primeiroAcessoDec" },
  { ...edgeBase,   id: "e-mfa-primacesso",    source: "mfa",        target: "primeiroAcessoDec" },
  { ...edgeBase,   id: "e-ms-primacesso",     source: "oauthMs",    target: "primeiroAcessoDec" },

  // ── Post-auth decisions (D6 → onboarding | D7 → configurar org adicional ou plataforma) ──
  { ...branchEdge, id: "e-primacesso-onboarding", source: "primeiroAcessoDec", target: "primeiroAcesso", sourceHandle: "left",   label: "Primeiro acesso", ...labelProps },
  { ...branchEdge, id: "e-primacesso-novaorgdec", source: "primeiroAcessoDec", target: "novaOrgDec",     sourceHandle: "bottom", label: "Já cadastrado",   ...labelProps },
  { ...branchEdge, id: "e-novaorgdec-config",     source: "novaOrgDec",        target: "novaOrgConfig",  sourceHandle: "right",  label: "Configurar agora", ...labelProps },
  { ...branchEdge, id: "e-novaorgdec-platform",   source: "novaOrgDec",        target: "platform",       sourceHandle: "bottom", label: "Mais tarde",      ...labelProps },

  // ── Recovery chain (ERRO_X corridor, fully self-contained) ─────────
  { ...branchEdge, id: "e-erro-recemail",     source: "erro",       target: "recEmail",         label: "Esqueci a senha", ...labelProps },
  { ...edgeBase,   id: "e-recemail-recsent",  source: "recEmail",   target: "recSent" },
  { ...edgeBase,   id: "e-recsent-novasenha", source: "recSent",    target: "novaSenha",        label: "Clica no link",   ...labelProps },
  { ...edgeBase,   id: "e-novasenha-redef",   source: "novaSenha",  target: "senhaRedef" },
  // senhaRedef is a terminal — redirect to Login is documented in text, not drawn
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "entrada",
    title: "Login",
    href: "#",
    purpose: "Ponto de entrada da plataforma. Apresenta as opções de autenticação e o link de recuperação de senha. Nenhuma sessão existe ainda.",
    decisions: "Escolher método: Google, Microsoft ou e-mail + senha. Ou acessar recuperação de senha.",
  },
  {
    step: "02a / 02c",
    title: "OAuth Google / Microsoft",
    href: "#",
    purpose: "Fluxo OAuth 2.0 gerenciado pelo provedor. O usuário é redirecionado, autentica e retorna com token. Nenhuma senha é digitada na plataforma.",
    decisions: "Autenticação bem-sucedida → verificação de primeiro acesso.",
  },
  {
    step: "02",
    title: "E-mail + senha",
    href: "#",
    purpose: "Formulário de credenciais nativas. Usuários convidados recebem uma senha temporária no e-mail de convite e a usam aqui.",
    decisions: "Credenciais corretas → verificar MFA. Inválidas → tela de erro.",
  },
  {
    step: "04",
    title: "MFA ativo?",
    href: "#",
    purpose: "Verificação server-side se a conta tem 2FA habilitado. Acontece de forma transparente após validação das credenciais.",
    decisions: "MFA ativo → código de verificação. Sem MFA → verificação de primeiro acesso.",
  },
  {
    step: "05",
    title: "Verificação MFA",
    href: "#",
    purpose: "Código de 6 dígitos via app autenticador ou SMS. Só aparece quando 2FA está configurado na conta.",
    decisions: "Código válido → verificação de primeiro acesso. Inválido → erro inline na mesma tela.",
  },
  {
    step: "→ erro",
    title: "Erro de login",
    href: "#",
    purpose: "Mensagem genérica sem revelar se o e-mail existe. Múltiplas tentativas podem bloquear temporariamente a conta.",
    decisions: "Tentar novamente → volta ao formulário. Esqueci a senha → fluxo de recuperação.",
  },
  {
    step: "06",
    title: "Primeiro acesso? (backend)",
    href: "#",
    purpose: "Após qualquer autenticação válida (OAuth ou e-mail+senha), o backend verifica se o usuário já tem conta ativa. Decisão transparente — o usuário não vê nenhuma tela extra.",
    decisions: "Primeiro acesso → redireciona para onboarding completo. Já cadastrado → segue para a checagem de organização adicional.",
  },
  {
    step: "07",
    title: "Nova organização para configurar? (backend + escolha)",
    href: "/organizacao-adicional",
    purpose: "Após confirmar que o usuário já é cadastrado, o backend checa se ele comprou um plano novo sem organização configurada (ex.: segunda licença pra outro time). Se houver, oferece configurar agora ou adiar — escolher uma org existente e seguir pra plataforma com um lembrete persistente.",
    decisions: "Configurar agora → /organizacao-adicional (contrato + pagamento, sem perfil). Mais tarde → /inicio com banner persistente até configurar.",
  },
  {
    step: "B1–B4",
    title: "Recuperação de senha",
    href: "#",
    purpose: "Inserir e-mail → confirmação de envio → link no e-mail (ação externa) → nova senha → sucesso. Link expira em 30 minutos. Após redefinir, redireciona para Login.",
    decisions: "Senha definida → Senha redefinida (terminal) → redirect automático para Login.",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Updates log — structural changes only. Add new entries at the top.
 * Managed by the `bombardier-update-ux-flow` skill.
 * ──────────────────────────────────────────────────────────────────── */

const updates: FlowUpdate[] = [
  {
    date: "2026-05-26",
    summary:
      "Adicionada decisão D7 após o 'Já cadastrado': se o usuário comprou um plano novo sem organização configurada, oferece configurar agora (→ /organizacao-adicional) ou adiar (entra na plataforma com banner persistente).",
    tags: ["new-page", "new-branch"],
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────────────────────────────── */

export default function LoginAuthFlowPage() {
  return (
    <>
      <PageHero
        title="Login e autenticação"
        trailing={<FlowUpdatesBadge updates={updates} />}
      >
        Fluxo completo de acesso à plataforma, cobrindo todos os cenários: OAuth via Google
        e Microsoft, e-mail com senha, verificação MFA, recuperação de senha, detecção
        automática de primeiro acesso e checagem de plano novo sem organização configurada.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-2xl -mt-8">
          Três caminhos de autenticação partem da tela de Login: OAuth Google (corredor
          esquerdo), e-mail&nbsp;+&nbsp;senha com validação e MFA (espinha central), e OAuth
          Microsoft (corredor direito). Todos convergem na decisão de primeiro acesso — se
          for a primeira vez, o backend redireciona para o onboarding completo; caso
          contrário, o backend ainda checa se o usuário comprou um plano novo sem
          organização configurada e oferece configurá-la agora ou adiar pra mais tarde
          (banner persistente no /inicio). A cadeia de recuperação de senha (B1–B4) corre
          de forma independente no corredor direito.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo. Caixas tracejadas em âmbar são decisões. Setas âmbar indicam bifurcações. OAuth Google e Microsoft seguem pelos corredores laterais sem cruzar o fluxo central."
        >
          <FlowDiagram flow="login-auth" nodes={NODES} edges={EDGES} height={1640} />
        </Section>

        <Section id="screens" title="Cada tela" lead="Propósito, decisões e link direto pro protótipo de cada uma.">
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
                    <Link href={s.href} className="text-sm font-medium text-[var(--aw-blue-700)] hover:text-[var(--aw-blue-800)] no-underline hover:underline">
                      Abrir protótipo →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="design-notes" title="Decisões de design" lead="Por que o fluxo está estruturado desse jeito.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">OAuth como caminho preferido</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Google e Microsoft aparecem como primeiras opções. O público-alvo (times de vendas B2B) já usa SSO corporativo. Menos fricção de entrada, zero reuso de senha fraca.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Primeiro acesso detectado pelo backend</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Após qualquer autenticação válida o backend verifica se o usuário já tem conta ativa. Funciona igual para OAuth e e-mail+senha — o usuário convidado recebe uma senha temporária no convite.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">MFA é verificação server-side</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                O nó de decisão MFA representa uma checagem automática do servidor, não uma escolha do usuário. A tela de código só aparece quando 2FA está configurado na conta.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Recuperação retorna ao login</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Após redefinir a senha, o usuário é redirecionado para Login — não entra direto na plataforma. Garante que a nova credencial funciona antes de criar a sessão.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Configurar nova org pode ser adiado</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Comprar um plano novo não força o usuário a reconfigurar imediatamente. Ele pode entrar na plataforma escolhendo uma organização existente e o /inicio mostra um banner persistente lembrando da pendência. Reduz pressão no cenário comum de compra apressada de plano em nome do time.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
