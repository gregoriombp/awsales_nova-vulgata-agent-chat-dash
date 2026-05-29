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
const SSO_X   = 540   // SSO connecting screen (right of credenciais, level with credenciais)
const MFA_SETUP_X  = -200  // Cadeia "Trava → setup TOTP → backup codes" (left corridor)
const MFA_VERIFY_X = 540   // Tela "Verificação MFA" (right corridor)

const Y = {
  entrada:           0,
  metodo:          160,
  decDiscover:     360,   // HRD: domínio tem SSO?
  credenciais:     520,
  ssoConnectingRow: 520,  // mesma row de credenciais, em SSO_X
  valid:           680,
  verifyRow:       840,   // verify (centre) | erro (ERRO_X) | magicLink (MAGIC_X)
  oauthRow:       1000,   // oauthGoogle | workspaceDec (centre) | oauthMs
  recEmail:       1000,   // tela "Esqueci a senha" (ERRO_X)
  workspace:      1160,
  resetSenha:     1160,   // tela "Definir nova senha" — fora do flow demo (ERRO_X)
  policyDec:      1320,   // decisão "Policy da org?" — checa 2FA per-org
  mfaBranchRow:   1480,   // mfaGate (MFA_SETUP_X) | mfaVerify (MFA_VERIFY_X)
  mfaSetupApp:    1640,
  mfaBackupCodes: 1800,
  primeiroAcessoDec: 1960,
  primeiroAcesso: 2120,
  novaOrgDec:     2120,
  platform:       2280,
  novaOrgConfig:  2280,
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
    data: { step: "entrada", title: "Login", href: "/", note: "Tela inicial. Input de email + botão 'Continuar'. Abaixo do separador 'ou', Google e Microsoft como opções secundárias." },
  },
  {
    id: "metodo",
    type: "decision",
    position: { x: COL_D, y: Y.metodo },
    data: { step: "01", title: "Que ação fez?", question: "Digitou email + Continuar, ou clicou em Google/Microsoft?" },
  },
  {
    id: "decDiscover",
    type: "decision",
    position: { x: COL_D, y: Y.decDiscover },
    data: { step: "01b", title: "Domínio tem SSO empresarial?", question: "O domínio do email digitado está na lista de orgs com SSO obrigatório? (mock no front: @awsales.com, @fyntra.com.br)" },
  },
  {
    id: "ssoConnecting",
    type: "screen",
    position: { x: SSO_X, y: Y.ssoConnectingRow },
    data: { step: "01c", title: "Conectando ao SSO", href: "/", note: "Loader 'Te direcionando pro acesso da [Empresa]'. Mock: 2 segundos e vai pro workspace selector. Em produção, redirect pro IdP corporativo." },
  },
  {
    id: "credenciais",
    type: "screen",
    position: { x: COL, y: Y.credenciais },
    data: { step: "02", title: "E-mail + senha", href: "/", note: "Email pré-preenchido a partir do HRD. Senha (com mostrar/ocultar), 'Manter conectado' e 'Esqueci a senha'. Abaixo do botão Entrar, link 'Receba um link de acesso no email'." },
  },
  {
    id: "valid",
    type: "decision",
    position: { x: COL_D, y: Y.valid },
    data: { step: "03", title: "Credenciais válidas?", question: "A senha está correta? (E-mail já foi validado no HRD.)" },
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
    id: "policyDec",
    type: "decision",
    position: { x: COL_D, y: Y.policyDec },
    data: { step: "06b", title: "Policy da org?", question: "A organização escolhida exige SSO ou 2FA? O token é cunhado pela própria org neste ponto." },
  },
  // ── MFA branch — setup chain (left) e verify (right) ───────────────
  {
    id: "mfaGate",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBranchRow },
    data: { step: "06c", title: "Trava de 2FA", href: "/awsales/login", note: "Gate quando a org exige 2FA e o usuário ainda não configurou. Método único por enquanto: app autenticador (TOTP). Botões 'Configurar agora' e 'Já tenho o app configurado'. Não há opção de pular." },
  },
  {
    id: "mfaVerify",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaBranchRow },
    data: { step: "06f", title: "Verificação MFA", href: "/awsales/login", note: "Para usuários que já têm TOTP configurado. Input de 6 dígitos do app autenticador. Link 'Usar código de backup' como fallback." },
  },
  {
    id: "mfaSetupApp",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaSetupApp },
    data: { step: "06d", title: "Configurar app autenticador", href: "/awsales/login", note: "Passo 1 de 2 do setup TOTP. QR code pra escanear no Google Authenticator / 1Password / Authy + segredo em texto pra copiar manualmente. Input de 6 dígitos pra confirmar." },
  },
  {
    id: "mfaBackupCodes",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBackupCodes },
    data: { step: "06e", title: "Códigos de backup", href: "/awsales/login", note: "Passo 2 de 2 do setup TOTP. 10 códigos de uso único. Copiar todos ou baixar .txt. Checkbox obrigatório 'salvei em um lugar seguro' antes de continuar." },
  },
  {
    id: "mfaRecovery",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaSetupApp },
    data: { step: "06g", title: "Usar código de backup", href: "/awsales/login", note: "Fallback quando o usuário perdeu acesso ao app autenticador. Entra um dos 10 códigos de backup salvos no setup TOTP. Cada código vale uma vez." },
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
    data: { step: "B2", title: "Definir nova senha", href: "/", note: "Tela com campos nova senha + confirmar, validação de força (8 caracteres, maiúscula, número). Alcançada quando o usuário entra no fluxo 'Esqueci a senha' e valida o código de 6 dígitos — verify identifica o modo reset e vem pra cá." },
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
  { ...branchEdge, id: "e-metodo-google",     source: "metodo",     target: "oauthGoogle",      sourceHandle: "left",   label: "Google",      ...labelProps },
  { ...branchEdge, id: "e-metodo-discover",   source: "metodo",     target: "decDiscover",      sourceHandle: "bottom", label: "Continuar",   ...labelProps },
  { ...branchEdge, id: "e-metodo-ms",         source: "metodo",     target: "oauthMs",          sourceHandle: "right",  label: "Microsoft",   ...labelProps },

  // ── HRD branch — domínio decide se vai pra SSO ou pra senha ────────
  { ...branchEdge, id: "e-discover-sso",      source: "decDiscover", target: "ssoConnecting",   sourceHandle: "right",  label: "Domínio com SSO",  ...labelProps },
  { ...branchEdge, id: "e-discover-cred",     source: "decDiscover", target: "credenciais",     sourceHandle: "bottom", label: "Domínio livre",    ...labelProps },
  { ...edgeBase,   id: "e-sso-workspacedec",  source: "ssoConnecting", target: "workspaceDec" },

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
  { ...branchEdge, id: "e-workspacedec-policy",    source: "workspaceDec", target: "policyDec",          sourceHandle: "left",   label: "Só 1 org",      ...labelProps },
  { ...edgeBase,   id: "e-workspace-policy",       source: "workspace",    target: "policyDec" },

  // ── Policy da org? — 2FA per-org ─────────────────────────────────
  { ...branchEdge, id: "e-policy-mfaGate",         source: "policyDec",    target: "mfaGate",            sourceHandle: "left",   label: "Org exige 2FA · user sem TOTP", ...labelProps },
  { ...branchEdge, id: "e-policy-mfaVerify",       source: "policyDec",    target: "mfaVerify",          sourceHandle: "right",  label: "User tem TOTP",                 ...labelProps },
  { ...branchEdge, id: "e-policy-primacesso",      source: "policyDec",    target: "primeiroAcessoDec",  sourceHandle: "bottom", label: "Sem policy adicional",          ...labelProps },

  // ── Setup chain: gate → app → backup → fim ───────────────────────
  { ...branchEdge, id: "e-mfaGate-already",        source: "mfaGate",      target: "mfaVerify",          label: "Já tenho o app", ...labelProps },
  { ...edgeBase,   id: "e-mfaGate-setup",          source: "mfaGate",      target: "mfaSetupApp",        label: "Configurar",     ...labelProps },
  { ...edgeBase,   id: "e-mfaSetup-backup",        source: "mfaSetupApp",  target: "mfaBackupCodes" },
  { ...edgeBase,   id: "e-mfaBackup-primacesso",   source: "mfaBackupCodes", target: "primeiroAcessoDec" },
  { ...edgeBase,   id: "e-mfaVerify-primacesso",   source: "mfaVerify",    target: "primeiroAcessoDec" },
  { ...branchEdge, id: "e-mfaVerify-recovery",     source: "mfaVerify",    target: "mfaRecovery",        label: "Usar backup",  ...labelProps },
  { ...edgeBase,   id: "e-mfaRecovery-primacesso", source: "mfaRecovery",  target: "primeiroAcessoDec" },

  // ── Recuperação de senha: verify bifurca por modo (login → workspace, reset → resetSenha) ──
  { ...branchEdge, id: "e-verify-reset",            source: "verify",       target: "resetSenha",         sourceHandle: "right", label: "Recuperação", ...labelProps },

  // ── Post-auth decisions (D7 onboarding | D8 nova org adicional) ──
  { ...branchEdge, id: "e-primacesso-onboarding", source: "primeiroAcessoDec", target: "primeiroAcesso", sourceHandle: "left",   label: "Primeiro acesso", ...labelProps },
  { ...branchEdge, id: "e-primacesso-novaorgdec", source: "primeiroAcessoDec", target: "novaOrgDec",     sourceHandle: "bottom", label: "Já cadastrado",   ...labelProps },
  { ...branchEdge, id: "e-novaorgdec-config",     source: "novaOrgDec",        target: "novaOrgConfig",  sourceHandle: "right",  label: "Configurar agora", ...labelProps },
  { ...branchEdge, id: "e-novaorgdec-platform",   source: "novaOrgDec",        target: "platform",       sourceHandle: "bottom", label: "Mais tarde",      ...labelProps },

  // ── Recovery: erro inline → "Esqueci a senha" → verify (em modo reset) → resetSenha ──
  { ...branchEdge, id: "e-erro-recemail",     source: "erro",       target: "recEmail",         label: "Esqueci a senha", ...labelProps },
  { ...edgeBase,   id: "e-recemail-verify",   source: "recEmail",   target: "verify",           label: "Enviado",          ...labelProps },
]

/* ─────────────────────────────────────────────────────────────────────
 * Screen docs
 * ──────────────────────────────────────────────────────────────────── */

const screens = [
  {
    step: "entrada",
    title: "Login",
    href: "/",
    purpose: "Ponto de entrada da plataforma. Input de email + 'Continuar' como ação principal. Abaixo do separador 'ou', Google e Microsoft como secundários. Sem affordance de signup direto na tela — quem foi convidado entra pelo link de e-mail do primeiro acesso.",
    decisions: "Digitar email + Continuar → backend (mockado) detecta se o domínio usa SSO empresarial. Senão, vai pra tela de senha com email pré-preenchido. Google ou Microsoft → workspace direto.",
  },
  {
    step: "01b",
    title: "Domínio tem SSO empresarial?",
    href: "/",
    purpose: "Decisão server-side (mockada no front): o domínio do email digitado pertence a uma org com SSO obrigatório? Mockado: @awsales.com e @fyntra.com.br disparam SSO. Qualquer outro domínio segue pra senha.",
    decisions: "Com SSO → tela 'Conectando ao SSO da [Empresa]'. Sem SSO → tela de senha (email já preenchido).",
  },
  {
    step: "01c",
    title: "Conectando ao SSO",
    href: "/",
    purpose: "Tela de transição com spinner e texto 'Te direcionando pro acesso da [Empresa]'. No mockup, 2 segundos depois pula pro workspace. Em produção, redirect pro IdP corporativo (Okta, Azure AD, etc).",
    decisions: "Automático após ~2s → seletor de organização.",
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
    purpose: "Código de 6 dígitos enviado ao e-mail informado, com countdown de reenvio. Aceita colar o código direto do clipboard. Aplica-se sempre após e-mail+senha; OAuth e magic link pulam esse passo. A tela é usada tanto pelo login normal quanto pelo 'Esqueci a senha' — o modo (login/recuperação) é passado pelo contexto e decide pra onde o código válido leva.",
    decisions: "Código válido (modo login) → seletor de organização. Código válido (modo recuperação) → 'Definir nova senha'. Trocar e-mail → volta para o ponto de origem (login ou 'Esqueci a senha').",
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
    decisions: "Selecionar org → policy da org?.",
  },
  {
    step: "06b",
    title: "Policy da org?",
    href: "/",
    purpose: "Decisão server-side após a escolha de organização: a org exige 2FA? O usuário já tem TOTP configurado? O token de sessão é cunhado por org neste ponto, com as exigências de segurança daquela org específica.",
    decisions: "Org exige 2FA + user sem TOTP → 'Trava de 2FA'. User tem TOTP → 'Verificação MFA'. Sem policy adicional → primeiro acesso?.",
  },
  {
    step: "06c",
    title: "Trava de 2FA",
    href: "/awsales/login",
    purpose: "Gate explicando que a organização exige 2FA e o usuário precisa configurar agora pra continuar. Método único por enquanto: app autenticador (TOTP) — Google Authenticator, 1Password, Authy, similar. Pré-selecionado por padrão.",
    decisions: "Configurar agora → tela de setup do app. Já tenho o app configurado → vai pra 'Verificação MFA' (caso raro de quem importou TOTP de outro lugar). Sair → volta pro login.",
  },
  {
    step: "06d",
    title: "Configurar app autenticador (TOTP)",
    href: "/awsales/login",
    purpose: "Passo 1 de 2. QR code grande no centro pra escanear no app autenticador, com o segredo em texto logo abaixo (copy-to-clipboard) pra quem não consegue escanear. Embaixo, input de 6 dígitos pra confirmar que o app foi configurado corretamente.",
    decisions: "Código correto → códigos de backup. Voltar → trava de 2FA.",
  },
  {
    step: "06e",
    title: "Códigos de backup",
    href: "/awsales/login",
    purpose: "Passo 2 de 2. Apresenta 10 códigos de backup de uso único em grid de 2 colunas. Ações 'Copiar todos' e 'Baixar .txt'. Callout âmbar com aviso de risco. Checkbox obrigatório 'salvei em lugar seguro' antes do botão liberar.",
    decisions: "Marcar checkbox + Concluir → fim do setup, continua o flow pra primeiro acesso?.",
  },
  {
    step: "06f",
    title: "Verificação MFA",
    href: "/awsales/login",
    purpose: "Para usuários que já configuraram TOTP em sessão anterior. Input de 6 dígitos do app autenticador, centralizado. Link 'Usar código de backup' como fallback quando o usuário perdeu acesso ao app.",
    decisions: "Código correto → primeiro acesso?. Usar código de backup → 'Usar código de backup' (fallback com 10 códigos one-shot). Sair → volta pro login.",
  },
  {
    step: "06g",
    title: "Usar código de backup",
    href: "/awsales/login",
    purpose: "Fallback do MFA quando o usuário perdeu acesso ao app autenticador. Entra um dos 10 códigos de backup gerados no setup TOTP. Cada código é one-shot — uma vez usado, é invalidado.",
    decisions: "Código válido → primeiro acesso?. Voltar pro app autenticador → 'Verificação MFA'.",
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
    step: "B2",
    title: "Definir nova senha",
    href: "/",
    purpose: "Tela de redefinição com 2 campos (nova senha + confirmar) e validação de força em 3 regras: 8 caracteres, uma maiúscula, um número. Alcançada quando o usuário entra no 'Esqueci a senha' e valida o OTP — verify identifica o modo recuperação e direciona pra cá.",
    decisions: "Salvar → tela de sucesso.",
  },
]

/* ─────────────────────────────────────────────────────────────────────
 * Updates log — structural changes only. Add new entries at the top.
 * Managed by the `bombardier-update-ux-flow` skill.
 * ──────────────────────────────────────────────────────────────────── */

const updates: FlowUpdate[] = [
  {
    date: "2026-05-29",
    time: "17:02 BRT",
    summary:
      "SSO empresarial agora pula o 2FA do app: o IdP já fez o MFA, então o login via SSO vai direto ao workspace sem challenge extra. Social pessoal e senha mantêm o 2FA.",
    tags: ["flow-rework"],
  },
  {
    date: "2026-05-28",
    summary:
      "Nova tela 'Usar código de backup' como fallback do MFA — sai do 'Verificação MFA' quando o usuário perdeu acesso ao app autenticador, converge no mesmo 'primeiro acesso?' do caminho normal.",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-28",
    summary:
      "Verificação por e-mail agora bifurca por contexto: vinda do login segue pro seletor de organização, vinda de 'Esqueci a senha' segue pra 'Definir nova senha' (resetSenha entra no fluxo, antes estava órfã).",
    tags: ["flow-rework", "new-branch"],
  },
  {
    date: "2026-05-28",
    summary:
      "Link 'Ainda não tem conta? Primeiro acesso' removido do rodapé da tela inicial. Convidado entra apenas pelo link recebido por e-mail.",
    tags: ["integration"],
  },
  {
    date: "2026-05-27",
    summary:
      "Branch de 2FA por organização após o seletor: decisão 'Policy da org?' com 3 saídas — setup TOTP (gate → app autenticador → códigos de backup), verificação pra quem já tem app, e bypass quando a org não exige.",
    tags: ["new-page", "new-branch"],
  },
  {
    date: "2026-05-26",
    summary:
      "HRD (detecção por domínio) na tela inicial. Os 3 botões viraram: input de email + Continuar como ação principal; Google e Microsoft ficam abaixo do separador 'ou' como secundários. Quando o usuário continua, o domínio do email decide o caminho: @awsales.com ou @fyntra.com.br dispara a tela 'Conectando ao SSO da [Empresa]' (loader 2s → workspace); qualquer outro domínio vai pra tela de senha com email já preenchido. Mockup no front (lista de domínios em components/auth/_types.ts); em produção, o backend resolveria por DNS.",
    tags: ["flow-rework", "new-page", "new-branch"],
  },
  {
    date: "2026-05-26",
    summary:
      "Link 'Ainda não tem conta? Primeiro acesso' aparece agora no rodapé da tela inicial e leva pra /primeiro-acesso. A cópia já existia em _copy.ts mas estava órfã. Fecha o ciclo com o flow de primeiro-acesso, que sempre apontou pra esse link a partir da tela de Login.",
    tags: ["integration"],
  },
  {
    date: "2026-05-26",
    summary:
      "Botões 'Continuar com Google' e 'Continuar com Microsoft' agora funcionam (clicar leva pro seletor de organização). Antes eram só decorativos.",
    tags: ["integration"],
  },
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
          A tela inicial em <code className="text-[var(--fg-primary)]">/</code> agora começa por um
          input de email + Continuar (HRD). Quando o usuário continua, o domínio decide o caminho:
          se for uma empresa com SSO obrigatório (mock: @awsales.com, @fyntra.com.br) o usuário
          vê uma tela curta 'Conectando ao SSO da [Empresa]' e cai no seletor de organização. Caso
          contrário, vai pra tela de senha com email já preenchido. Google e Microsoft seguem como
          opções secundárias abaixo do separador 'ou'. Quem usa senha passa pela verificação por
          código de 6 dígitos; OAuth, SSO e magic link pulam essa etapa. Todos convergem no seletor
          de organização. "Esqueci a senha" reusa a verificação por e-mail do login — quem esqueceu
          entra via OTP, sem precisar redefinir a senha primeiro.
        </p>

        <Section
          id="flow"
          title="Fluxograma"
          lead="Todas as telas vivem em /. Caixas tracejadas em âmbar são decisões. Setas âmbar indicam bifurcações. Google e Microsoft seguem pelos corredores laterais sem cruzar o fluxo central."
        >
          <FlowDiagram flow="login-auth" nodes={NODES} edges={EDGES} height={2440} />
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
              <div className="aw-eyebrow mb-2">Entrada por email + HRD</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Tela inicial é input de email + Continuar (não 3 botões). O domínio decide o caminho: empresa com SSO obrigatório dispara tela rápida 'Conectando ao SSO da [Empresa]'; domínio livre vai pra tela de senha. Google e Microsoft ficam abaixo do 'ou' como opções secundárias. Sem signup direto na tela — primeiro acesso entra pelo link recebido no e-mail de convite.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">SSO empresarial sem fricção</div>
              <p className="m-0 text-sm text-[var(--fg-secondary)] leading-relaxed">
                Quem usa email corporativo de uma org com SSO obrigatório pula a tela de senha e a verificação por código. O usuário vê apenas uma tela curta 'Te direcionando pro acesso da [Empresa]' antes de cair no workspace. No mockup, 2 domínios disparam SSO (awsales.com, fyntra.com.br) — em produção, é o backend que resolve por DNS.
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
                "Esqueci a senha" abre a mesma tela de verificação por e-mail do login. A diferença é o contexto: a tela carrega em modo recuperação e, depois do OTP válido, direciona pra "Definir nova senha" em vez do seletor de organização. Uma tela só, dois destinos.
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
