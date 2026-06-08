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

// ── 2FA inline (per-org) — setup à esquerda, verify à direita do spine ──
const MFA_SETUP_X  = 40    // ramo de setup (gate → app → backup)
const MFA_VERIFY_X = 540   // ramo de verificação (verify → recovery)

const Y = {
  entrada:           0,
  metodo:          160,
  decDiscover:     360,   // detecção pelo domínio do e-mail
  credenciais:     520,
  ssoConnectingRow: 520,  // mesma row de credenciais, em SSO_X
  valid:           680,
  verifyRow:       840,   // verify (centre) | erro (ERRO_X) | magicLink (MAGIC_X)
  oauthRow:       1000,   // oauthGoogle | workspaceDec (centre) | oauthMs
  recEmail:       1000,   // tela "Esqueci a senha" (ERRO_X)
  workspace:      1160,
  resetSenha:     1160,   // tela "Definir nova senha" — fora do flow demo (ERRO_X)
  policyDec:      1320,   // decisão de verificação extra por org — checa 2FA per-org
  // ── 2FA inline ──
  mfaGateRow:    1480,   // mfaGate (setup, esquerda) | mfaVerify (direita) — mesma linha
  mfaSetupRow:   1640,   // mfaSetupApp (esquerda) | mfaRecovery (direita) — mesma linha
  mfaBackupRow:  1800,   // mfaBackupCodes (esquerda)
  primeiroAcessoDec: 1980,  // convergência do 2FA
  primeiroAcesso: 2140,
  novaOrgDec:     2140,
  platform:       2300,
  novaOrgConfig:  2300,
}

/* ─────────────────────────────────────────────────────────────────────
 * Nodes
 * ──────────────────────────────────────────────────────────────────── */

export const NODES: Node[] = [
  // ── Centre spine ──────────────────────────────────────────────────
  {
    id: "entrada",
    type: "screen",
    position: { x: COL, y: Y.entrada },
    data: { step: "entrada", title: "Login", href: "/awsales/login?screen=login", note: "Tela inicial: input de email + 'Continuar', com Google e Microsoft abaixo do 'ou'." },
  },
  {
    id: "metodo",
    type: "decision",
    position: { x: COL_D, y: Y.metodo },
    data: { step: "01", title: "Como o usuário escolheu entrar?", question: "Digitou email + Continuar, ou clicou em Google/Microsoft?" },
  },
  {
    id: "decDiscover",
    type: "decision",
    position: { x: COL_D, y: Y.decDiscover },
    data: { step: "01b", title: "É um e-mail de empresa com login corporativo?", question: "O domínio do email digitado está na lista de orgs com login corporativo obrigatório? (mock no front: @awsales.com, @fyntra.com.br)" },
  },
  {
    id: "ssoConnecting",
    type: "screen",
    position: { x: SSO_X, y: Y.ssoConnectingRow },
    data: { step: "01c", title: "Conectando ao login da empresa", href: "/awsales/login?screen=ssoConnecting", note: "Loader 'Te direcionando pro acesso da [Empresa]' antes de cair no login corporativo." },
  },
  {
    id: "credenciais",
    type: "screen",
    position: { x: COL, y: Y.credenciais },
    data: { step: "02", title: "E-mail + senha", href: "/awsales/login?screen=email", note: "Formulário de senha com email pré-preenchido, 'Manter conectado' e atalho de magic link." },
  },
  {
    id: "valid",
    type: "decision",
    position: { x: COL_D, y: Y.valid },
    data: { step: "03", title: "Credenciais válidas?", question: "A senha está correta? (O e-mail já foi validado no passo anterior.)" },
  },
  {
    id: "verify",
    type: "screen",
    position: { x: COL, y: Y.verifyRow },
    data: { step: "04", title: "Verificação por e-mail", href: "/awsales/login?screen=verify", note: "Campo de código de 6 dígitos enviado ao e-mail, com countdown de reenvio." },
  },
  {
    id: "magicLink",
    type: "screen",
    position: { x: MAGIC_X, y: Y.verifyRow },
    data: { step: "04b", title: "Link de acesso enviado", href: "/awsales/login?screen=magicSent", note: "Confirmação do magic link com e-mail destinatário, expiração (15min) e reenvio." },
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
    data: { step: "06", title: "Seletor de organização", href: "/awsales/login?screen=workspace", note: "Lista as orgs do usuário com avatar, nome e meta (cargo/plano)." },
  },
  {
    id: "policyDec",
    type: "decision",
    position: { x: COL_D, y: Y.policyDec },
    data: { step: "06b", title: "A organização exige verificação extra?", question: "A organização exige uma segunda etapa de verificação antes de liberar o acesso? Cada organização tem suas próprias regras de segurança." },
  },
  // ── Verificação em duas etapas (2FA) inline — gate/setup à esquerda, verify/recovery à direita ──
  {
    id: "mfaGate",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaGateRow },
    data: { step: "06c", title: "Ativar verificação em duas etapas", href: "/awsales/login?screen=mfaGate", note: "Gate: a org exige 2FA, configure agora. Botões 'Configurar agora' e 'Já tenho o app'." },
  },
  {
    id: "mfaSetupApp",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaSetupRow },
    data: { step: "06d", title: "Configurar app de verificação", href: "/awsales/login?screen=mfaSetupApp", note: "QR code pra parear o app + campo de 6 dígitos pra confirmar." },
  },
  {
    id: "mfaBackupCodes",
    type: "screen",
    position: { x: MFA_SETUP_X, y: Y.mfaBackupRow },
    data: { step: "06e", title: "Códigos de backup", href: "/awsales/login?screen=mfaBackupCodes", note: "10 códigos de uso único pra guardar." },
  },
  {
    id: "mfaVerify",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaGateRow },
    data: { step: "06f", title: "Confirmar código", href: "/awsales/login?screen=mfaVerify", note: "Campo de 6 dígitos do app de verificação." },
  },
  {
    id: "mfaRecovery",
    type: "screen",
    position: { x: MFA_VERIFY_X, y: Y.mfaSetupRow },
    data: { step: "06g", title: "Usar código de backup", href: "/awsales/login?screen=mfaRecovery", note: "Fallback de quem perdeu o app: um dos códigos salvos." },
  },
  {
    id: "primeiroAcessoDec",
    type: "decision",
    position: { x: COL_D, y: Y.primeiroAcessoDec },
    data: { step: "07", title: "É a primeira vez deste usuário aqui?", question: "O produto verifica se o usuário já tem conta ativa na organização." },
  },
  {
    id: "novaOrgDec",
    type: "decision",
    position: { x: COL_D, y: Y.novaOrgDec },
    data: { step: "08", title: "Tem um plano novo a configurar?", question: "O produto verifica se o usuário comprou um plano novo sem organização configurada." },
  },
  {
    id: "platform",
    type: "screen",
    position: { x: COL, y: Y.platform },
    data: { step: "→ plataforma", title: "Entrou na plataforma", href: "/inicio", note: "Home logada. Se houver org pendente, banner no topo do /inicio lembra de configurar." },
  },
  {
    id: "novaOrgConfig",
    type: "crossflow",
    position: { x: NOVA_ORG_X, y: Y.novaOrgConfig },
    data: { step: "→ org adicional", title: "Organização adicional", href: "/bombardier/styleguide/ux-flows/organizacao-adicional", note: "Contrato + pagamento da nova organização (sem perfil — já existe)." },
  },
  // ── Left corridor — OAuth Google + primeiro-acesso terminal ────────
  {
    id: "oauthGoogle",
    type: "screen",
    position: { x: GOOGLE_X, y: Y.oauthRow },
    data: { step: "02a", title: "Continuar com Google", href: "/awsales/login?screen=login", note: "OAuth 2.0 via Google — o provedor autentica e devolve o usuário com sessão." },
  },
  {
    id: "primeiroAcesso",
    type: "crossflow",
    position: { x: PRIMO_TERM_X, y: Y.primeiroAcesso },
    data: { step: "→ onboarding", title: "Primeiro acesso", href: "/bombardier/styleguide/ux-flows/primeiro-acesso", note: "Backend redireciona para onboarding (perfil, contrato, pagamento)." },
  },
  // ── Right corridor — OAuth Microsoft ──────────────────────────────
  {
    id: "oauthMs",
    type: "screen",
    position: { x: MS_X, y: Y.oauthRow },
    data: { step: "02c", title: "Continuar com Microsoft", href: "/awsales/login?screen=login", note: "OAuth 2.0 via Microsoft — o provedor autentica e devolve o usuário com sessão." },
  },
  // ── Error inline + recovery (ERRO_X column) ───────────────────────
  {
    id: "erro",
    type: "screen",
    position: { x: ERRO_X, y: Y.verifyRow },
    data: { step: "→ inline", title: "Senha incorreta (na própria tela)", href: "/awsales/login?screen=email", note: 'Estado inline da tela de senha: mensagem "Senha incorreta" abaixo do campo, não é tela separada.' },
  },
  {
    id: "recEmail",
    type: "screen",
    position: { x: ERRO_X, y: Y.recEmail },
    data: { step: "B1", title: "Esqueci a senha", href: "/awsales/login?screen=forgot", note: "Campo de e-mail cadastrado que dispara o código e reusa a verificação do login." },
  },
  {
    id: "resetSenha",
    type: "screen",
    position: { x: ERRO_X, y: Y.resetSenha },
    data: { step: "B2", title: "Definir nova senha", href: "/awsales/login?screen=reset", note: "Campos nova senha + confirmar com validação de força (mín. 10 caracteres, bloqueio de senhas vazadas)." },
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

export const EDGES: Edge[] = [
  // ── Entry ──────────────────────────────────────────────────────────
  { ...edgeBase,   id: "e-entrada-metodo",    source: "entrada",    target: "metodo",           label: "Acessar",          ...labelProps },

  // ── Auth method branches (metodo → each method) ────────────────────
  { ...branchEdge, id: "e-metodo-google",     source: "metodo",     target: "oauthGoogle",      sourceHandle: "left",   label: "Google",      ...labelProps },
  { ...branchEdge, id: "e-metodo-discover",   source: "metodo",     target: "decDiscover",      sourceHandle: "bottom", label: "Continuar",   ...labelProps },
  { ...branchEdge, id: "e-metodo-ms",         source: "metodo",     target: "oauthMs",          sourceHandle: "right",  label: "Microsoft",   ...labelProps },

  // ── Detecção por domínio — decide se vai pro login corporativo ou pra senha ────────
  { ...branchEdge, id: "e-discover-sso",      source: "decDiscover", target: "ssoConnecting",   sourceHandle: "right",  label: "E-mail de empresa",  ...labelProps },
  { ...branchEdge, id: "e-discover-cred",     source: "decDiscover", target: "credenciais",     sourceHandle: "bottom", label: "E-mail comum",       ...labelProps },
  // ── Login corporativo já fez a verificação no provedor: pula o seletor + a verificação em duas etapas ──
  { ...edgeBase,   id: "e-sso-primacesso",    source: "ssoConnecting", target: "primeiroAcessoDec", label: "Verificação já feita no provedor", ...labelProps },

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

  // ── Verificação extra por org — 2FA inline (gate/setup à esquerda, verify/recovery à direita) ──
  { ...branchEdge, id: "e-policy-mfagate",     source: "policyDec",     target: "mfaGate",           sourceHandle: "left",   label: "Exige 2FA · ainda não configurou", ...labelProps },
  { ...branchEdge, id: "e-policy-mfaverify",   source: "policyDec",     target: "mfaVerify",         sourceHandle: "right",  label: "Já tem o app de verificação",       ...labelProps },
  { ...branchEdge, id: "e-policy-primacesso",  source: "policyDec",     target: "primeiroAcessoDec", sourceHandle: "bottom", label: "Sem verificação extra",             ...labelProps },

  // ── Ramo de setup: gate → app → backup → convergência ──
  { ...branchEdge, id: "e-mfagate-mfaverify", source: "mfaGate",        target: "mfaVerify",         sourceHandle: "right",  label: "Já tenho o app", ...labelProps },
  { ...edgeBase,   id: "e-mfagate-mfasetup",  source: "mfaGate",        target: "mfaSetupApp",       label: "Configurar", ...labelProps },
  { ...edgeBase,   id: "e-mfasetup-mfabackup", source: "mfaSetupApp",   target: "mfaBackupCodes" },
  { ...edgeBase,   id: "e-mfabackup-primacesso", source: "mfaBackupCodes", target: "primeiroAcessoDec" },

  // ── Ramo de verificação: verify → convergência, com fallback de backup ──
  { ...edgeBase,   id: "e-mfaverify-primacesso",  source: "mfaVerify",   target: "primeiroAcessoDec" },
  { ...branchEdge, id: "e-mfaverify-mfarecovery", source: "mfaVerify",   target: "mfaRecovery",       label: "Usar backup", ...labelProps },
  { ...edgeBase,   id: "e-mfarecovery-primacesso", source: "mfaRecovery", target: "primeiroAcessoDec" },

  // ── Recuperação de senha: verify bifurca por modo (login → workspace, reset → resetSenha) ──
  { ...branchEdge, id: "e-verify-reset",            source: "verify",       target: "resetSenha",         sourceHandle: "right", label: "Recuperação", ...labelProps },

  // ── Post-auth decisions (D7 onboarding | D8 nova org adicional) ──
  { ...crossEdge,  id: "e-primacesso-onboarding", source: "primeiroAcessoDec", target: "primeiroAcesso", sourceHandle: "left",   label: "Primeiro acesso", ...labelProps },
  { ...branchEdge, id: "e-primacesso-novaorgdec", source: "primeiroAcessoDec", target: "novaOrgDec",     sourceHandle: "bottom", label: "Já cadastrado",   ...labelProps },
  { ...crossEdge,  id: "e-novaorgdec-config",     source: "novaOrgDec",        target: "novaOrgConfig",  sourceHandle: "right",  label: "Configurar agora", ...labelProps },
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
    href: "/awsales/login?screen=login",
    purpose: "Ponto de entrada da plataforma. Input de email + 'Continuar' como ação principal. Abaixo do separador 'ou', Google e Microsoft como secundários. Sem affordance de signup direto na tela — quem foi convidado entra pelo link de e-mail do primeiro acesso.",
    decisions: "Digitar email + Continuar → backend (mockado) detecta se o domínio usa SSO empresarial. Senão, vai pra tela de senha com email pré-preenchido. Google ou Microsoft → workspace direto.",
  },
  {
    step: "01b",
    title: "É um e-mail de empresa com login corporativo?",
    href: "/",
    purpose: "Detecção pelo domínio do e-mail (mockada no front): o domínio do email digitado pertence a uma org com login corporativo obrigatório? Mockado: @awsales.com e @fyntra.com.br disparam o login corporativo. Qualquer outro domínio segue pra senha.",
    decisions: "Com login corporativo → tela 'Conectando ao login da empresa'. Sem → tela de senha (email já preenchido).",
  },
  {
    step: "01c",
    title: "Conectando ao login da empresa",
    href: "/awsales/login?screen=ssoConnecting",
    purpose: "Tela de transição com spinner e texto 'Te direcionando pro acesso da [Empresa]'. No mockup, 2 segundos depois entra direto. Leva pro login corporativo da empresa, que faz a verificação de quem é a pessoa.",
    decisions: "Automático após ~2s → entra direto (a verificação extra já foi feita no login corporativo, então pula a segunda etapa).",
  },
  {
    step: "02a / 02c",
    title: "Continuar com Google / Microsoft",
    href: "/awsales/login?screen=login",
    purpose: "Redireciona para o provedor OAuth, que autentica o usuário e o devolve com sessão. Nenhuma senha é digitada na plataforma e o passo de verificação por e-mail é pulado — o próprio provedor já autenticou.",
    decisions: "Autenticação bem-sucedida → seletor de organização ou /inicio (depende de multi-org).",
  },
  {
    step: "02",
    title: "E-mail + senha",
    href: "/awsales/login?screen=email",
    purpose: "Formulário com e-mail, senha (mostrar/ocultar), 'Manter conectado' e link 'Esqueci a senha'. Abaixo do botão Entrar, um link secundário 'Receba um link de acesso no email' permite pular a senha.",
    decisions: "Credenciais corretas → verificação por e-mail. Inválidas → tela de erro. Pedir magic link → tela de link enviado.",
  },
  {
    step: "04",
    title: "Verificação por e-mail",
    href: "/awsales/login?screen=verify",
    purpose: "Código de 6 dígitos enviado ao e-mail informado, com countdown de reenvio. Aceita colar o código direto do clipboard. Aplica-se sempre após e-mail+senha; OAuth e magic link pulam esse passo. A tela é usada tanto pelo login normal quanto pelo 'Esqueci a senha' — o modo (login/recuperação) é passado pelo contexto e decide pra onde o código válido leva.",
    decisions: "Código válido (modo login) → seletor de organização. Código válido (modo recuperação) → 'Definir nova senha'. Trocar e-mail → volta para o ponto de origem (login ou 'Esqueci a senha').",
  },
  {
    step: "04b",
    title: "Link de acesso enviado",
    href: "/awsales/login?screen=magicSent",
    purpose: "Confirma que o link de acesso foi enviado pro e-mail do usuário. Mostra o endereço destinatário em destaque, dica de tempo de expiração (15min) e botão de reenvio com countdown. O usuário sai dessa tela ao clicar no link recebido no e-mail.",
    decisions: "Clica no link no e-mail → seletor de organização (pula verificação por código). Trocar e-mail → volta pra tela de e-mail.",
  },
  {
    step: "05",
    title: "Pertence a mais de uma organização?",
    href: "/",
    purpose: "O produto verifica se o usuário tem acesso a mais de uma org. Transparente — não é uma tela. Quando há só uma org, o seletor é pulado.",
    decisions: "Mais de 1 → seletor de organização. Só 1 → é a primeira vez deste usuário aqui?.",
  },
  {
    step: "06",
    title: "Seletor de organização",
    href: "/awsales/login?screen=workspace",
    purpose: "Lista as orgs do usuário com avatar, nome e meta (cargo/plano). User escolhe uma e segue. Só aparece quando o usuário pertence a mais de uma.",
    decisions: "Selecionar org → a organização exige verificação extra?.",
  },
  {
    step: "06b",
    title: "A organização exige verificação extra?",
    href: "/",
    purpose: "Antes de a pessoa entrar na plataforma pela primeira vez, o produto verifica se a organização exige uma segunda etapa de verificação. Cada organização define suas próprias regras de segurança — quem decide é o admin da org.",
    decisions: "Exige 2FA e ainda não configurou → 'Ativar verificação em duas etapas'. Exige 2FA e já tem o app → 'Confirmar código'. Sem verificação extra → é a primeira vez deste usuário aqui?.",
  },
  {
    step: "06c",
    title: "Ativar verificação em duas etapas",
    href: "/awsales/login?screen=mfaGate",
    purpose: "Gate de 2FA: a organização exige verificação extra e a pessoa ainda não configurou. Explica que ela precisa configurar agora pra continuar. Método: app de verificação no celular — Google Authenticator, 1Password, Authy, similar.",
    decisions: "Configurar agora → 'Configurar app de verificação'. Já tenho o app → 'Confirmar código'.",
  },
  {
    step: "06d",
    title: "Configurar app de verificação",
    href: "/awsales/login?screen=mfaSetupApp",
    purpose: "QR code pra escanear no app de verificação do celular, com o código em texto pra copiar. Campo de 6 dígitos pra confirmar que o app foi pareado.",
    decisions: "Código correto → códigos de backup. Voltar → 'Ativar verificação em duas etapas'.",
  },
  {
    step: "06e",
    title: "Códigos de backup",
    href: "/awsales/login?screen=mfaBackupCodes",
    purpose: "Apresenta 10 códigos de backup de uso único em grid de 2 colunas. Ações 'Copiar todos' e 'Baixar .txt'. Callout âmbar com aviso de risco. Checkbox obrigatório 'salvei em lugar seguro' antes do botão liberar.",
    decisions: "Marcar checkbox + Concluir → é a primeira vez deste usuário aqui?.",
  },
  {
    step: "06f",
    title: "Confirmar código",
    href: "/awsales/login?screen=mfaVerify",
    purpose: "Pra quem já tem o app de verificação configurado em outra organização. Campo de 6 dígitos do app. Link 'Usar código de backup' como fallback.",
    decisions: "Código correto → é a primeira vez deste usuário aqui?. Usar código de backup → 'Usar código de backup'.",
  },
  {
    step: "06g",
    title: "Usar código de backup",
    href: "/awsales/login?screen=mfaRecovery",
    purpose: "Fallback de quem perdeu acesso ao app de verificação. Entra um dos 10 códigos de backup salvos no setup. Cada código é one-shot.",
    decisions: "Código válido → é a primeira vez deste usuário aqui?. Voltar pro app de verificação → 'Confirmar código'.",
  },
  {
    step: "→ inline",
    title: "Senha incorreta (na própria tela)",
    href: "/awsales/login?screen=email",
    purpose: "Estado da tela de e-mail+senha quando as credenciais estão inválidas. Não é tela separada — uma mensagem 'Senha incorreta' aparece embaixo do campo de senha. Mensagem é genérica, não revela se o e-mail existe.",
    decisions: "Tentar novamente → volta ao formulário. Esqueci a senha → tela 'Esqueci a senha'. Magic link → tela de link enviado.",
  },
  {
    step: "07",
    title: "É a primeira vez deste usuário aqui?",
    href: "/",
    purpose: "Após autenticação válida e seleção de org, o produto verifica se o usuário já tem conta ativa nessa org. Decisão transparente.",
    decisions: "Primeiro acesso → redireciona para onboarding completo. Já cadastrado → checagem de organização adicional.",
  },
  {
    step: "08",
    title: "Tem um plano novo a configurar?",
    href: "/organizacao-adicional",
    purpose: "O produto checa se o usuário comprou um plano novo sem organização configurada (ex.: segunda licença pra outro time). Se houver, oferece configurar agora ou adiar — escolher uma org existente e seguir pra plataforma com um lembrete persistente.",
    decisions: "Configurar agora → /organizacao-adicional (contrato + pagamento, sem perfil). Mais tarde → /inicio com banner persistente até configurar.",
  },
  {
    step: "B1",
    title: "Esqueci a senha",
    href: "/awsales/login?screen=forgot",
    purpose: "Usuário informa o e-mail cadastrado. Ao submeter, um código de 6 dígitos é enviado e a tela de verificação por e-mail abre — a MESMA do login. Ou seja, recuperar senha = entrar pelo código por e-mail, sem precisar passar pela tela de senha. Quem esqueceu a senha entra normalmente; redefinir senha em si é uma ação separada disponível depois.",
    decisions: "Enviar → verificação por e-mail (compartilhada com login).",
  },
  {
    step: "B2",
    title: "Definir nova senha",
    href: "/awsales/login?screen=reset",
    purpose: "Tela de redefinição com 2 campos (nova senha + confirmar) e validação de força: mínimo 10 caracteres, frase secreta permitida e bloqueio de senhas vazadas. Alcançada quando o usuário entra no 'Esqueci a senha' e valida o código — verify identifica o modo recuperação e direciona pra cá.",
    decisions: "Salvar → tela de sucesso.",
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
      "Saltos pra outros fluxos ('Primeiro acesso' e 'Organização adicional') viraram nós de outro fluxo — losango roxo com modal de confirmação ao clicar. Antes eram cards comuns; o de org adicional ainda apontava pra rota de produto incompleta. Aresta solta do 2FA (confirmar código → usar backup) reconectada.",
    tags: ["flow-rework"],
  },
  {
    date: "2026-06-01",
    summary:
      "Login corporativo agora pula a verificação em duas etapas no diagrama, alinhando com o protótipo (quem entra pelo login da empresa já fez a verificação no provedor). Google, Microsoft e senha mantêm o 2FA.",
    tags: ["flow-rework"],
  },
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
        title="Login"
        trailing={<FlowUpdatesBadge updates={updates} />}
      >
        Fluxo completo de acesso à plataforma, cobrindo todos os cenários: e-mail&nbsp;+&nbsp;senha
        com verificação por e-mail, OAuth via Google e Microsoft, seletor de organização para quem
        pertence a mais de uma, recuperação de senha, detecção de primeiro acesso e checagem de
        plano novo sem organização configurada.
      </PageHero>

      <div className="max-w-[1400px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Section
          id="flow"
          title="Fluxograma"
          lead="Clique em qualquer tela pra abrir o protótipo num painel lateral — todas vivem em /. Caixas tracejadas em âmbar são decisões. Setas âmbar indicam bifurcações. Google e Microsoft seguem pelos corredores laterais sem cruzar o fluxo central. Na barra embaixo do diagrama dá pra comentar (vai pro review com chip UX Flow), sugerir uma edição ou ver em tela cheia."
        >
          <FlowDiagram flow="login-auth" nodes={NODES} edges={EDGES} height={2240} />
        </Section>

        <Section id="screens" title="Cada tela" lead="Propósito e decisões de cada uma. Todas vivem em /.">
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) overflow-hidden">
            <ul className="m-0 p-0 list-none flex flex-col divide-y divide-(--border-subtle)">
              {screens.map((s) => (
                <li key={s.step + s.title} className="p-5 flex flex-col gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="aw-eyebrow text-(--aw-blue-700)">{s.step}</span>
                    <h3 className="m-0 text-base font-medium text-(--fg-primary)">{s.title}</h3>
                  </div>
                  <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">{s.purpose}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1">
                    <span className="caption">
                      <span className="font-medium text-(--fg-secondary)">Decisões: </span>
                      {s.decisions}
                    </span>
                    <Link href={s.href} className="text-sm font-medium text-(--aw-blue-700) hover:text-(--aw-blue-800) no-underline hover:underline">
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
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Login corporativo sem fricção</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                Quem usa email corporativo de uma org com login corporativo obrigatório pula a tela de senha, a verificação por código e a verificação em duas etapas — a empresa já fez essa verificação no próprio login. O usuário vê apenas uma tela curta 'Te direcionando pro acesso da [Empresa]' antes de entrar direto. No mockup, 2 domínios disparam o login corporativo (awsales.com, fyntra.com.br).
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Verificação por e-mail acontece sempre após senha</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                O código de 6 dígitos é forçado após e-mail+senha — não há gate 'MFA ativo?'. Só pulam quem já foi autenticado por outro meio: Google, Microsoft e magic link.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Magic link como alternativa à senha</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                O link clicado no e-mail entra direto, sem verificação adicional. Reduz fricção pra quem não quer digitar senha e cobre quem esqueceu a senha mas não quer passar pelo fluxo completo de redefinição.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Recuperação reusa o código por e-mail do login</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
                "Esqueci a senha" abre a mesma tela de verificação por e-mail do login. A diferença é o contexto: a tela carrega em modo recuperação e, depois do código válido, direciona pra "Definir nova senha" em vez do seletor de organização. Uma tela só, dois destinos.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <div className="aw-eyebrow mb-2">Configurar nova org pode ser adiado</div>
              <p className="m-0 text-sm text-(--fg-secondary) leading-relaxed">
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
