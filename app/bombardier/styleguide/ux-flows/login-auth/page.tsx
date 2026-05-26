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
 * Centre spine: COL / COL_D
 * Left corridor:  GOOGLE_X / PRIMO_TERM_X  (x < 0)
 * Right corridor: ERRO_X, MS_X             (x > 500)
 *
 * Google and Microsoft sit on the SAME ROW as workspaceDec — their
 * convergence edges stay horizontal and never cross the centre spine.
 * ──────────────────────────────────────────────────────────────────── */

const COL   = 280    // ScreenNode  centre x
const COL_D = 260    // DecisionNode centre x

const GOOGLE_X     = -200  // OAuth Google  (far-left corridor)
const ERRO_X       = 720   // Error + recovery chain (right corridor)
const MS_X         = 1000  // OAuth Microsoft (far-right corridor)
const PRIMO_TERM_X = -200  // "Primeiro acesso" terminal (below Google)
const NOVA_ORG_X   = 540   // "Configurar org adicional" terminal (right of platform)

const MAGIC_X = -200  // Magic link screen (left corridor, level with verify)

const Y = {
  entrada:           0,
  metodo:          160,
  credenciais:     360,
  valid:           520,
  verifyRow:       680,   // verify (centre) | erro (ERRO_X) | magicLink (MAGIC_X)
  oauthRow:        840,   // oauthGoogle | workspaceDec (centre) | oauthMs
  recEmail:        840,   // tela "Esqueci a senha" (ERRO_X)
  workspace:      1000,
  resetSenha:     1000,   // tela "Definir nova senha" — fora do flow demo (ERRO_X)
  primeiroAcessoDec: 1160,
  primeiroAcesso: 1320,
  novaOrgDec:     1320,
  platform:       1480,
  novaOrgConfig:  1480,
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
    data: { step: "entrada", title: "Login", href: "/", note: "Tela inicial em /. Mostra três botões lado a lado: e-mail, Google e Microsoft. Link 'Esqueci a senha' aparece depois, na tela de e-mail." },
  },
  {
    id: "metodo",
    type: "decision",
    position: { x: COL_D, y: Y.metodo },
    data: { step: "01", title: "Qual botão?", question: "O usuário clicou em qual dos três botões da tela inicial?" },
  },
  {
    id: "credenciais",
    type: "screen",
    position: { x: COL, y: Y.credenciais },
    data: { step: "02", title: "E-mail + senha", href: "/", note: "Formulário com e-mail, senha (com mostrar/ocultar), 'Manter conectado' e 'Esqueci a senha'." },
  },
  {
    id: "valid",
    type: "decision",
    position: { x: COL_D, y: Y.valid },
    data: { step: "03", title: "Credenciais válidas?", question: "E-mail e senha conferem com os dados cadastrados?" },
  },
  {
    id: "verify",
    type: "screen",
    position: { x: COL, y: Y.verifyRow },
    data: { step: "04", title: "Verificação por e-mail", href: "/", note: "Código de 6 dígitos enviado ao e-mail informado. Countdown de reenvio. Cola direto via clipboard." },
  },
  {
    id: "magicLink",
    type: "screen",
    position: { x: MAGIC_X, y: Y.verifyRow },
    data: { step: "04b", title: "Link de acesso enviado", href: "/", note: "Tela de confirmação após pedir magic link. Mostra o e-mail destinatário, tempo de expiração (15min) e reenvio com countdown." },
  },
  {
    id: "workspaceDec",
    type: "decision",
    position: { x: COL_D, y: Y.oauthRow },
    data: { step: "05", title: "Pertence a mais de uma organização?", question: "O usuário tem acesso a mais de uma organização?" },
  },
  {
    id: "workspace",
    type: "screen",
    position: { x: COL, y: Y.workspace },
    data: { step: "06", title: "Seletor de organização", href: "/", note: "Lista as orgs do usuário com avatar, nome e meta (cargo/plano). Escolher uma e continuar." },
  },
  {
    id: "primeiroAcessoDec",
    type: "decision",
    position: { x: COL_D, y: Y.primeiroAcessoDec },
    data: { step: "07", title: "Primeiro acesso?", question: "Backend verifica se o usuário já tem conta ativa na organização." },
  },
  {
    id: "novaOrgDec",
    type: "decision",
    position: { x: COL_D, y: Y.novaOrgDec },
    data: { step: "08", title: "Nova organização para configurar?", question: "Backend verifica se o usuário comprou um plano novo sem organização configurada." },
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
    position: { x: GOOGLE_X, y: Y.oauthRow },
    data: { step: "02a", title: "Continuar com Google", href: "/", note: "OAuth 2.0 via Google. Provedor autentica e o usuário volta autenticado." },
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
    position: { x: MS_X, y: Y.oauthRow },
    data: { step: "02c", title: "Continuar com Microsoft", href: "/", note: "OAuth 2.0 via Microsoft. Provedor autentica e o usuário volta autenticado." },
  },
  // ── Error inline + recovery (ERRO_X column) ───────────────────────
  {
    id: "erro",
    type: "screen",
    position: { x: ERRO_X, y: Y.verifyRow },
    data: { step: "→ inline", title: "Erro de senha (inline)", href: "/", note: 'Mensagem "Senha incorreta" aparece embaixo do campo de senha, na própria tela de credenciais. Não é tela separada. Usuário pode tentar de novo, clicar em "Esqueci minha senha" ou usar magic link.' },
  },
  {
    id: "recEmail",
    type: "screen",
    position: { x: ERRO_X, y: Y.recEmail },
    data: { step: "B1", title: "Esqueci a senha", href: "/", note: "Usuário informa o e-mail cadastrado. Submeta envia código de 6 dígitos por e-mail e reusa a tela de verificação do login." },
  },
  {
    id: "resetSenha",
    type: "screen",
    position: { x: ERRO_X, y: Y.resetSenha },
    data: { step: "B2 (fora do demo)", title: "Definir nova senha", href: "/", note: "Tela com campos nova senha + confirmar, validação de força (8 caracteres, maiúscula, número). Não é alcançada pelo flow demo — só via link real de redefinição enviado por e-mail." },
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
  { ...branchEdge, id: "e-metodo-google",     source: "metodo",     target: "oauthGoogle",      sourceHandle: "left",   label: "Google",         ...labelProps },
  { ...branchEdge, id: "e-metodo-cred",       source: "metodo",     target: "credenciais",      sourceHandle: "bottom", label: "E-mail + senha", ...labelProps },
  { ...branchEdge, id: "e-metodo-ms",         source: "metodo",     target: "oauthMs",          sourceHandle: "right",  label: "Microsoft",      ...labelProps },

  // ── Email+senha path ───────────────────────────────────────────────
  { ...edgeBase,   id: "e-cred-valid",        source: "credenciais",target: "valid" },
  { ...branchEdge, id: "e-valid-verify",      source: "valid",      target: "verify",           sourceHandle: "bottom", label: "Corretas",   ...labelProps },
  { ...branchEdge, id: "e-valid-erro",        source: "valid",      target: "erro",             sourceHandle: "right",  label: "Inválidas",  ...labelProps },

  // ── Magic link branch — sai da tela de credenciais como alternativa à senha ──
  { ...branchEdge, id: "e-cred-magiclink",     source: "credenciais", target: "magicLink", label: "Receber link no email", ...labelProps },

  // ── Convergence at workspaceDec (OAuth e magic link pulam verify; e-mail+senha passa por verify) ──
  { ...edgeBase,   id: "e-verify-workspacedec",   source:"verify",      target: "workspaceDec" },
  { ...edgeBase,   id: "e-magiclink-workspacedec",source:"magicLink",   target: "workspaceDec" },
  { ...edgeBase,   id: "e-google-workspacedec",   source:"oauthGoogle", target: "workspaceDec" },
  { ...edgeBase,   id: "e-ms-workspacedec",       source:"oauthMs",     target: "workspaceDec" },

  // ── Workspace decision: >1 org passa pelo seletor; 1 só pula direto ──
  { ...branchEdge, id: "e-workspacedec-workspace", source: "workspaceDec", target: "workspace",          sourceHandle: "bottom", label: "Mais de 1 org", ...labelProps },
  { ...branchEdge, id: "e-workspacedec-primacesso",source: "workspaceDec", target: "primeiroAcessoDec",  sourceHandle: "left",   label: "Só 1 org",      ...labelProps },
  { ...edgeBase,   id: "e-workspace-primacesso",   source: "workspace",    target: "primeiroAcessoDec" },

  // ── Post-auth decisions (D7 onboarding | D8 nova org adicional) ──
  { ...branchEdge, id: "e-primacesso-onboarding", source: "primeiroAcessoDec", target: "primeiroAcesso", sourceHandle: "left",   label: "Primeiro acesso", ...labelProps },
  { ...branchEdge, id: "e-primacesso-novaorgdec", source: "primeiroAcessoDec", target: "novaOrgDec",     sourceHandle: "bottom", label: "Já cadastrado",   ...labelProps },
  { ...branchEdge, id: "e-novaorgdec-config",     source: "novaOrgDec",        target: "novaOrgConfig",  sourceHandle: "right",  label: "Configurar agora", ...labelProps },
  { ...branchEdge, id: "e-novaorgdec-platform",   source: "novaOrgDec",        target: "platform",       sourceHandle: "bottom", label: "Mais tarde",      ...labelProps },

  // ── Recovery: erro inline → "Esqueci a senha" → reusa verify do login ──
  { ...branchEdge, id: "e-erro-recemail",     source: "erro",       target: "recEmail",         label: "Esqueci a senha", ...labelProps },
  { ...edgeBase,   id: "e-recemail-verify",   source: "recEmail",   target: "verify",           label: "Enviado",          ...labelProps },
  // resetSenha is out-of-flow — not connected to the main path
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "entrada",
    title: "Login",
    href: "/",
    purpose: "Ponto de entrada da plataforma em /. Três botões lado a lado: e-mail (primeiro), Google e Microsoft. Nenhuma sessão existe ainda.",
    decisions: "Escolher entre e-mail+senha, Google ou Microsoft.",
  },
  {
    step: "02a / 02c",
    title: "Continuar com Google / Microsoft",
    href: "/",
    purpose: "Redireciona para o provedor OAuth, que autentica o usuário e o devolve com sessão. Nenhuma senha é digitada na plataforma e o passo de verificação por e-mail é pulado — o próprio provedor já autenticou.",
    decisions: "Autenticação bem-sucedida → seletor de organização ou /inicio (depende de multi-org).",
  },
  {
    step: "02",
    title: "E-mail + senha",
    href: "/",
    purpose: "Formulário com e-mail, senha (mostrar/ocultar), 'Manter conectado' e link 'Esqueci a senha'. Abaixo do botão Entrar, um link secundário 'Receba um link de acesso no email' permite pular a senha. Validação via zod.",
    decisions: "Credenciais corretas → verificação por e-mail. Inválidas → tela de erro. Pedir magic link → tela de link enviado.",
  },
  {
    step: "04",
    title: "Verificação por e-mail",
    href: "/",
    purpose: "Código de 6 dígitos enviado ao e-mail informado, com countdown de reenvio. Aceita colar o código direto do clipboard. Aplica-se sempre após e-mail+senha; OAuth e magic link pulam esse passo.",
    decisions: "Código válido → seletor de organização ou /inicio. Trocar e-mail → volta para 'Esqueci a senha'.",
  },
  {
    step: "04b",
    title: "Link de acesso enviado",
    href: "/",
    purpose: "Confirma que o link de acesso foi enviado pro e-mail do usuário. Mostra o endereço destinatário em destaque, dica de tempo de expiração (15min) e botão de reenvio com countdown. O usuário sai dessa tela ao clicar no link recebido no e-mail.",
    decisions: "Clica no link no e-mail → seletor de organização (pula verificação por código). Trocar e-mail → volta pra tela de e-mail.",
  },
  {
    step: "05",
    title: "Pertence a mais de uma organização?",
    href: "/",
    purpose: "Decisão server-side: o usuário tem acesso a mais de uma org? Transparente — não é uma tela. Quando há só uma org, o seletor é pulado.",
    decisions: "Mais de 1 → seletor de organização. Só 1 → primeiro acesso?.",
  },
  {
    step: "06",
    title: "Seletor de organização",
    href: "/",
    purpose: "Lista as orgs do usuário com avatar, nome e meta (cargo/plano). User escolhe uma e segue. Só aparece quando o usuário pertence a mais de uma.",
    decisions: "Selecionar org → primeiro acesso?.",
  },
  {
    step: "→ inline",
    title: "Erro de senha (inline)",
    href: "/",
    purpose: "Estado da tela de e-mail+senha quando as credenciais estão inválidas. Não é tela separada — uma mensagem 'Senha incorreta' aparece embaixo do campo de senha. Mensagem é genérica, não revela se o e-mail existe.",
    decisions: "Tentar novamente → volta ao formulário. Esqueci a senha → tela 'Esqueci a senha'. Magic link → tela de link enviado.",
  },
  {
    step: "07",
    title: "Primeiro acesso? (backend)",
    href: "/",
    purpose: "Após autenticação válida e seleção de org, o backend verifica se o usuário já tem conta ativa nessa org. Decisão transparente.",
    decisions: "Primeiro acesso → redireciona para onboarding completo. Já cadastrado → checagem de organização adicional.",
  },
  {
    step: "08",
    title: "Nova organização para configurar? (backend + escolha)",
    href: "/organizacao-adicional",
    purpose: "Backend checa se o usuário comprou um plano novo sem organização configurada (ex.: segunda licença pra outro time). Se houver, oferece configurar agora ou adiar — escolher uma org existente e seguir pra plataforma com um lembrete persistente.",
    decisions: "Configurar agora → /organizacao-adicional (contrato + pagamento, sem perfil). Mais tarde → /inicio com banner persistente até configurar.",
  },
  {
    step: "B1",
    title: "Esqueci a senha",
    href: "/",
    purpose: "Usuário informa o e-mail cadastrado. Ao submeter, um código de 6 dígitos é enviado e a tela de verificação por e-mail abre — a MESMA do login. Ou seja, recuperar senha = entrar via OTP, sem precisar passar pela tela de senha. Quem esqueceu a senha entra normalmente; redefinir senha em si é uma ação separada disponível depois.",
    decisions: "Enviar → verificação por e-mail (compartilhada com login).",
  },
  {
    step: "B2 (fora do demo)",
    title: "Definir nova senha",
    href: "/",
    purpose: "Tela de redefinição com 2 campos (nova senha + confirmar) e validação de força em 3 regras: 8 caracteres, uma maiúscula, um número. Não é alcançada pelo flow demo — só via link real enviado por e-mail (futuro).",
    decisions: "Salvar → tela de sucesso.",
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
      "Recuperação de senha sincronizada com o código real: o que era uma cadeia de 4 telas (B1→B4) virou uma tela só ('Esqueci a senha'), que reusa a verificação por e-mail do login. Telas 'E-mail enviado' e 'Senha redefinida' removidas — não existem no produto. 'Definir nova senha' fica como ramo fora do flow demo (só alcançada via link real de redefinição). Nó 'Erro de login' renomeado pra 'Erro de senha (inline)' porque é estado inline da tela credenciais, não tela separada.",
    tags: ["flow-rework", "removed-page"],
  },
  {
    date: "2026-05-26",
    summary:
      "Magic link adicionado como alternativa à senha. Abaixo do botão 'Entrar' na tela de e-mail, um link 'Receba um link de acesso no email' manda um link de acesso pro e-mail do usuário e abre a tela 'Link de acesso enviado'. Ao clicar no link recebido, o usuário entra direto no seletor de organização — pula a verificação por código. Implementado em components/auth/screens/MagicSentScreen.tsx.",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-26",
    summary:
      "Flow sincronizado com a auth real do produto: a decisão 'MFA ativo?' foi removida (verificação por e-mail é sempre forçada após senha) e o nó 'Verificação MFA' virou 'Verificação por e-mail' (código de 6 dígitos, não app autenticador). Adicionados o seletor de organização e a decisão 'Pertence a mais de uma organização?' — que já existem no produto. OAuth Google/Microsoft pula a verificação por e-mail porque o próprio provedor autentica. Todos os href apontam pra '/' (todas as subscreens vivem em /).",
    tags: ["flow-rework", "new-page", "new-branch"],
  },
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
        Fluxo completo de acesso à plataforma, cobrindo todos os cenários: e-mail&nbsp;+&nbsp;senha
        com verificação por e-mail, OAuth via Google e Microsoft, seletor de organização para quem
        pertence a mais de uma, recuperação de senha, detecção de primeiro acesso e checagem de
        plano novo sem organização configurada.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-2xl -mt-8">
          A tela inicial em <code className="text-[var(--fg-primary)]">/</code> oferece três
          caminhos: Google (corredor esquerdo), e-mail&nbsp;+&nbsp;senha (espinha central) e
          Microsoft (corredor direito). Na tela de e-mail+senha, abaixo do botão Entrar, ainda há
          a opção de pedir um magic link no e-mail em vez de digitar a senha. Quem usa senha sempre
          passa pela verificação por código de 6 dígitos. OAuth e magic link pulam essa etapa —
          o próprio provedor ou o link já autenticam. Todos convergem no seletor de organização:
          se o usuário pertence a mais de uma org, escolhe uma; se não, passa direto. Em seguida
          vêm as decisões de primeiro acesso e plano novo pendente. "Esqueci a senha" reusa a
          verificação por e-mail do login — quem esqueceu entra via OTP, sem precisar redefinir
          a senha primeiro.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Todas as telas vivem em /. Caixas tracejadas em âmbar são decisões. Setas âmbar indicam bifurcações. Google e Microsoft seguem pelos corredores laterais sem cruzar o fluxo central."
        >
          <FlowDiagram flow="login-auth" nodes={NODES} edges={EDGES} height={1680} />
        </Section>

        <Section id="screens" title="Cada tela" lead="Propósito e decisões de cada uma. Todas vivem em /.">
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
                      Abrir em / →
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
              <div className="aw-eyebrow mb-2">Três caminhos equivalentes na entrada</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Tela inicial mostra e-mail, Google e Microsoft lado a lado, sem hierarquia. E-mail vem primeiro porque cobre quem ainda não configurou OAuth. Os botões de OAuth são corporativos (Google Workspace, Microsoft Azure) — não aparecem rotulados como tal, é só "Continuar com Google" e "Continuar com Microsoft".
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Verificação por e-mail acontece sempre após senha</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Após validar e-mail+senha, um código de 6 dígitos é enviado ao e-mail e a tela de verificação aparece. Não é condicional. OAuth e magic link pulam essa etapa porque o provedor (ou o próprio link) já autentica.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Magic link como alternativa à senha</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Abaixo do botão Entrar, na tela de e-mail+senha, um link discreto 'Receba um link de acesso no email' permite pular a senha. O link clicado no e-mail entra direto — sem verificação adicional. Reduz fricção pra quem não quer digitar senha, e cobre quem esqueceu a senha mas não quer passar pelo fluxo completo de redefinição.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Seletor de organização só com mais de uma</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Quem pertence a mais de uma org escolhe qual usar antes de entrar. Quem tem só uma vai direto — o seletor não aparece. Em ambos os casos a decisão de primeiro acesso vem depois.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Recuperação reusa o OTP do login</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Quem esqueceu a senha não precisa redefinir antes de entrar: o "Esqueci a senha" abre a mesma tela de verificação por e-mail que o login. Recuperar = entrar via OTP. Redefinir a senha em si vira uma ação opcional que o usuário pode fazer depois, dentro da plataforma.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">Configurar nova org pode ser adiado</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Comprar um plano novo não força a configurar imediatamente. O usuário pode entrar na plataforma escolhendo uma organização existente, e o /inicio mostra um banner persistente lembrando da pendência. Reduz pressão no cenário comum de compra apressada de plano em nome do time.
              </p>
            </div>
          </div>
        </Section>

        <FlowUpdatesHistorySection updates={updates} />
      </div>
    </>
  )
}
