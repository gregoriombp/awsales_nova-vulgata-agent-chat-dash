# Fix Backlog Priorizado — Stress Test 2026-05-11

> **Princípio:** dashboards/wireframes raramente falham por falta de informação — falham por falta de hierarquia. Toda proposta abaixo **substitui** ou **complementa** algo no SUT, sem inflar matriz de telas além do necessário. Fixes são agrupados por **macro-tensão** (não por cluster) pra forçar resposta estrutural, não pontual.

---

## Macro-tensão M1 — Caminho feliz síncrono single-tenant vs realidade enterprise async/multi-org

> Os wireframes desenham 1 usuário, 1 org, 1 fluxo, 1 vez. Realidade enterprise = multi-aba + multi-org + procurement lento + estados async.

### F1.1 (P0) — Adicionar contrato de "estados assíncronos" ao SUT como regra horizontal

**Substitui:** silêncio nas telas durante operações longas (3DS, export CSV, OAuth popup, regeneração de PIX, geração de boleto, criação de função).

**Spec proposta:**
- **Toda operação síncrona com latência potencial >2s** deve ter loader + texto "Aguardando confirmação do seu banco/sistema (pode levar até X min). Não feche essa aba."
- **Toda operação assíncrona** (export CSV grande, geração de invoice) deve ter: confirmação de envio + tela "Meus exports/processos" + notificação in-app + e-mail quando pronto + janela de download/retenção.
- **Toda recovery após refresh** deve mostrar banner "Continuando de onde você parou em [etapa]" no topo da tela.

**Aplica em:** W3-A (3DS), W3-A.1 (PIX), W3-A.2 (boleto), W5-A (OAuth popup), W7-A (termo scroll), W5 da Story 2 (export CSV), W9 da Story 2 (criação de função no fluxo de 1º acesso).

**Escopo:** novo wireframe **"W-Async — Estados de operação assíncrona"** (1 wireframe horizontal cobrindo loader + tela de "meus processos" + notificação).

**Origem dos gaps:** RC1 inteiro · 13 gaps · 8 P0

---

### F1.2 (P0) — Wireframe "Persona A multi-org" (usuário pré-existente em nova org)

**Substitui:** assumption implícita de "1ª vez" em W1-A (Persona A).

**Spec proposta:**
- Detecção server-side de e-mail existente no WorkOS antes de renderizar W1-A.
- Se existe: nova variante **"W1-A.MO — Boas-vindas a CFO multi-org"** com:
  - "Olá Ricardo! Você já tem conta no AwSales — vamos adicionar mais uma organização."
  - Card mostrando "Você já administra: Anhanguera, UNIASSELVI, FAMA, Cruzeiro do Sul"
  - Botão "Adicionar Pitágoras à minha conta"
  - Skip de W5-A (criação de senha/SSO) e W6-A (dados pessoais) — reusa o que existe
  - Mostra apenas: revisão dos dados da nova org → pagamento → termo (com decisão explícita: aceita o termo pra essa nova org × herança) → 2FA (reusa TOTP existente se WorkOS suporta) → entrar

**Decisões necessárias do PG/jurídico:**
- Termo de uso: **por usuário** (uma vez) ou **por usuário×org** (cada org)? Recomendação: por org (já que org é contrato distinto).
- TOTP: WorkOS suporta MFA factor compartilhado entre tenants ou exige re-enrollment? (decisão técnica)
- Stripe customer: reuso cross-org sim, payment method pode ser sugerido (com confirmação explícita).

**Origem dos gaps:** P5-1 (todos os 6 gaps) — 3 P0

---

### F1.3 (P0) — Wireframe "Mobile educated block" com mitigação

**Substitui:** OBS lateral "AC1 mobile = bloqueio educado" sem materialização visual.

**Spec proposta — novo wireframe W-Mobile:**
```
┌──────────────────────────┐
│   [Logo AwSales]         │
│                          │
│   📱 → 🖥                  │
│                          │
│   Pra melhor experiência │
│   abra esse link no      │
│   computador.            │
│                          │
│   Quer que a gente te    │
│   ajude?                 │
│                          │
│   [📧 Enviar link de novo│
│      pro meu e-mail]     │
│                          │
│   [⏱ Lembre em 2 horas]  │
│                          │
│   Convite válido por     │
│   mais 6 dias            │
└──────────────────────────┘
```

**Comportamento:**
- Detecta user-agent mobile → renderiza W-Mobile em vez do fluxo desktop.
- "Lembre em 2 horas" = e-mail automático com link novo após 2h.
- "Enviar link de novo" = re-dispatch imediato (validação anti-spam de 1 por hora).

**Origem dos gaps:** G1.1 (P4-1), G1.2 (P4-1), G1.3 (P4-1) — 1 P0, 2 P1

---

### F1.4 (P1) — Seletor de organização no header de Persona A (se usuário autenticado)

**Substitui:** header do fluxo público sem seletor mesmo quando usuário já está logado em outras orgs.

**Spec:**
- Se Persona A já tem session WorkOS ativa em N orgs → header de W1-A a W10-A mostra avatar + nome do usuário + dropdown com orgs ativas + "Você está adicionando: Pitágoras" como contexto persistente.
- Trocar de org via dropdown salva estado do onboarding em curso e abre outra aba pra org clicada (preserva fluxo da Pitágoras pendente).

**Origem dos gaps:** P5-3-A, P5-3-B, P5-3-C — 1 P0, 2 P1

---

### F1.5 (P0) — Continuidade entre Story 1 e Story 2 (especialmente "Criar nova função" durante 1º acesso)

**Substitui:** descontinuidade W9-A (Story 1 convidar equipe) → W9 (Story 2 criar função).

**Spec:**
- Dropdown de função em W9-A deve ter `+ Criar nova função` (idêntico ao W4 modal da Story 2).
- Clicar abre **modal sobreposto** (não navega pra outra tela) com mesma UI de W9 (Story 2 criar função).
- Ao salvar, modal fecha e função criada vira selecionada no dropdown — **chips de e-mail digitados são preservados**.
- Estado persistido server-side por `org_setup_id` pra resistir a refresh/close-tab.

**Origem dos gaps:** G-P1-3.1, G-P1-3.2, G-P1-3.3 (P4-3 também) — 3 P0

---

## Macro-tensão M2 — Strict + rigid + invisible como princípio de validação enterprise

> Validação strict, feedback invisível, tempos rígidos hardcoded. Em B2B enterprise, isso é abandono garantido.

### F2.1 (P0) — Normalização de e-mail antes de strict equality (alias + sub-domínio + trim + lowercase)

**Substitui:** strict equality cru em W5-A.1 (bloqueio SSO) e validação de chips em W4 da Story 2.

**Spec:**
- Pipeline de normalização de e-mail (server + client): `trim()` → `lowercase()` → strip de aliases `+xxx@` (sem ignorar a regra completamente — pode ser opt-in por org via admin) → check de domínio aliasado pelo Google Workspace/Microsoft Entra (lookup de `mx`+`txt` records, ou allowlist explícita no admin: "domínios deste cliente: `fyntra.com`, `fyntra.io`").
- Quando alias é normalizado, **exibe pro usuário** "Reconhecemos `+enterprise` como alias do seu e-mail principal — continuando."
- Modal W5-A.1 ganha campo "Se sua empresa usa aliases ou subdomínios, [✉ Contate seu admin]" com mailto pré-preenchido.

**Origem dos gaps:** G-P1-2.1, G-P1-2.3, G22, G23 — 4 P0

---

### F2.2 (P0) — Documentar regex de senha + policy de rotação explícita

**Substitui:** W5-A "Mín. 12 chars · 1 maiúscula · 1 número · 1 símbolo" como copy genérica.

**Spec:**
- Expor caracteres exatos aceitos como símbolo: lista visível "**Caracteres aceitos:** `!@#$%^&*()_+-=[]{}|;:,.<>?/~`"
- Validação backend e frontend usam o MESMO regex (sem divergência silenciosa).
- Mensagem de erro específica: "A senha não pode conter o caractere `'` — use um dos aceitos abaixo."
- **Story dedicada** "Segurança da Org" cobrindo: expiração compulsória (90d enterprise / sem expiração SMB — configurável no admin), histórico de senhas (últimas 5 não reutilizáveis), rotação obrigatória após reset.

**Origem dos gaps:** G10, G12 — 2 P0

---

### F2.3 (P0) — TTL configurável por contrato/org (link de convite + boleto + régua)

**Substitui:** valores hardcoded "7 dias", "5 minutos", "D+3" em wireframes/stories.

**Spec:**
- **Admin AwSales (comercial) define:** "Janela de aceite do convite (dias corridos)" — default 7d, opções 7/14/30. Pra contratos enterprise com procurement, default 14d.
- **Admin AwSales define:** "Vencimento do boleto da impl (dias)" — default 7d, opções 7/15/30/45.
- **Admin AwSales define:** "Régua de suspensão (D+N)" — default D+3, opções D+3/D+10/D+30. Pra clientes com política de pagamento D+30 (logística, varejo, financeiro centralizado), AM customiza.
- **Notificações proativas** geradas automaticamente em D-3, D-1, D (cliente + comercial AwSales no mesmo loop).
- "Snooze por negociação" no admin pra Bruno/AM pausar régua quando sabe que cliente paga em D+30.

**Origem dos gaps:** P2-3.G1, P2-3.G5, G3 (P6-1), G5 (P6-1), G11-G13 (P6-3) — 4 P0

---

### F2.4 (P0) — Fallback de OAuth quando popup é bloqueado

**Substitui:** silêncio total quando `window.open()` é bloqueado em W5-A.

**Spec:**
- Detecção JS: `const popup = window.open(...); if (!popup || popup.closed) { ...fallback... }`
- Fallback: redirect full-page (WorkOS suporta nativamente) com botão visível "Continuar com Google em nova aba" ou "Continuar via redirecionamento (recomendado pra browser corporativo)".
- Mensagem auxiliar: "Seu browser bloqueou o popup? Use a opção 'redirecionar' acima — funciona igual."

**Origem dos gaps:** G6, G7, G8 (P6-2) — 2 P0

---

### F2.5 (P1) — Trim + paste multi-linha + sumário de erros em convite batch

**Substitui:** validação chip-a-chip sem trim e sem sumário consolidado.

**Spec (W4 modal de convite):**
- Trim automático: ao criar chip, `e-mail.trim().toLowerCase()` antes de validar.
- Paste multi-linha: aceitar separadores `,`, `;`, `\n`, `\t`, espaço. Documentar na placeholder: "Cole até 20 e-mails separados por vírgula, ponto-e-vírgula ou enter."
- Sumário acima do botão `[Enviar convites]`: "✓ 19 e-mails válidos · ✕ 1 inválido (motorista17@... — espaço no final)". Botão desabilitado enquanto houver inválidos OU oferece "Enviar 19 válidos e ignorar inválidos".

**Origem dos gaps:** G21-G25 (P6-5) — 2 P0

---

## Macro-tensão M3 — Compliance + governança como pendência vs realidade B2B regulada

> Compliance regulatória aparece como pendência (Story 2 #3 "5+ anos a definir") em vez de AC obrigatório. Cliente regulado precisa de compromisso contratual.

### F3.1 (P0) — 2FA obrigatório respeita flag da org pro Responsável no 1º acesso

**Substitui:** W8-A sempre tem botão "Pular por agora" — viola SOC2/BACEN quando flag está ON.

**Spec:**
- W8-A ganha variante condicional idêntica à W4-B: se org tem `require_2fa = true`, **remove botão "Pular por agora"** e adiciona texto "Sua organização exige 2FA pra todos os logins — configure agora pra continuar."
- Adicionar no admin do comercial: campo "2FA obrigatório vale também pro 1º acesso do Responsável?" (default = YES pra não vazar inconsistência).
- Story 1 Cenário 9 ganha variante explícita "Flag ON · Responsável".

**Origem dos gaps:** G1, G2 (P3-1) — 2 P0

---

### F3.2 (P0) — Audit trail: meta-audit + LGPD-aware export + cross-org access

**Substitui:** W5 da Story 2 com botão `[📥 Exportar CSV]` sem feedback nem governança.

**Spec — sub-story "Audit Trail enterprise":**
- **Meta-audit:** exportação de dados pessoais é evento auditável (registrado no audit trail do executor).
- **Aviso LGPD inline:** modal de confirmação antes do export: "Esse CSV contém dados pessoais sob LGPD. Você será responsável pelo manuseio. ☐ Estou ciente."
- **Hash SHA-256 do CSV** entregue junto pra integridade probatória.
- **CSV inclui coluna `organization_id` + `organization_name`** mesmo em export single-org (preparação pra consolidação multi-org).
- **Audit trail cross-org da Holding:** novo wireframe **W-Audit-Holding** dentro de "Meu perfil" → "Minhas ações em todas as organizações" (pra CFOs multi-org). Endereça LGPD data subject request cross-org.
- **Audit trail consolidado da org:** novo wireframe **W-Audit-Org** acessível via Configurações → Segurança → "Audit Trail da Organização" (pra CRO/CISO ver tudo, não user-by-user).

**Origem dos gaps:** G-P1-4.1-4.6, P5-5 (todos), G19 (P3-5) — 7 P0

---

### F3.3 (P0) — Permissões com escopo "próprio vs org" + PII filtering

**Substitui:** catálogo W9 de 52 permissões sem distinção horizontal/vertical.

**Spec:**
- Cada permissão ganha **escopo explícito**: "Visualizar (próprio)" vs "Visualizar (toda a org)". Pra papéis de auditoria/CISO, "Visualizar (toda a org)" é o que importa.
- Nova permissão **PII Filtering**: "Visualizar dados pessoais de usuários" (separada de "Visualizar usuários"). Admin sem essa permissão vê só nome + e-mail mascarado.
- **Story dedicada** "Permissões enterprise readiness" cobrindo: escopo, PII filtering, segregação de funções BACEN (Admin NÃO pode acumular escrita + PII), e templates por vertical (CISO, DPO, CRO, Compliance Officer).

**Origem dos gaps:** G18, G19, G20, G21, G22 (P3-5) — 5 P0

---

### F3.4 (P0) — Webhook/streaming de audit trail pra SIEM (pré-requisito enterprise regulado)

**Substitui:** ausência total de mecanismo de streaming.

**Spec — backlog enterprise (não-MVP):**
- Webhook configurável por org no admin Awsales: URL + chave HMAC + retry policy.
- Schema canônico JSON (versionado) com campos: `event_id`, `timestamp`, `org_id`, `actor`, `action`, `target`, `target_id`, `ip`, `user_agent`, `metadata`.
- Suporte a Splunk HEC / Datadog / Microsoft Sentinel via connector específico.
- Marcado como **"Enterprise readiness — pós-MVP"** pra deixar explícito.

**Decisão estratégica:** considerar gating de P3 fintech regulada até essa story estar pronta.

**Origem dos gaps:** G14, G15, G16 (P3-4) — 1 P0

---

### F3.5 (P1) — Funções padrão com vocabulário multi-vertical + tooltips em permissões

**Substitui:** 6 funções padrão SaaS-coded fixas + 52 permissões sem tooltips.

**Spec:**
- Tooltip em cada permissão explicando "O que essa permissão libera + Risco associado" (ex: "Excluir Bases → ⚠ Ação destrutiva, sem desfazer").
- Funções padrão ganham **subtítulo de vertical**: "Analista Sênior · perfil técnico/operacional" — orienta cliente leigo.
- **Story dedicada** "Function Wizard" (pós-MVP): wizard "Qual o cargo dessa pessoa?" → mapeia pra função sugerida (atendente loja → Operador; analista júnior → Analista Pleno; etc.).
- Adicionar AC explicit: "Funções padrão suportam descrição customizável por org pelo Admin (pra remapear vocabulário sem criar custom)".

**Origem dos gaps:** P2-4 (todos), G3.4 (P4-3) — 1 P0 (G2), 3 P1

---

### F3.6 (P1) — invoice: trigger explícito de emissão + tela self-service de e-mails invoice

**Substitui:** flag "Emissão de invoice pré-pagamento" sem trigger documentado, sem confirmação ao cliente, e sem self-service de edição.

**Spec:**
- Story 1 ganha AC explícito: "Quando flag = Pré-pagamento, invoice é emitida [evento exato: ex: 'na geração do boleto' ou 'no 1º clique de Confirmar e pagar']."
- Tela final do fluxo (W10-A) mostra "invoice #XXXX emitida em DD/MM/AAAA — Baixar PDF" com link clicável.
- **Story 2 ganha sub-tela** em Configurações Gerais ou Billing: "E-mails adicionais pra invoice" — editável pelo Admin (ou usuário com permissão de Billing). Operações: adicionar, remover, marcar/desmarcar "principal" (com warning se desmarcar e CEO é o único).
- Sub-secção sobre "invoice de Implementação vs invoice de Plano" — opção de e-mails distintos por tipo de fatura (Sr. Aderbal caso).

**Origem dos gaps:** G5, G6, G7 (P3-2), P2-5 (todos) — 3 P0

---

## Macro-tensão transversal — UX scanner SMB vs hierarquia neutra

> Founder SMB com pressa lê em F-pattern de 4-8s. Tela W2-A trata "valor", "método", "fidelidade", "1ª fatura" como linhas iguais — gera confusão "preço único vs duas cobranças".

### F4.1 (P0) — Big Number consolidado em W2-A + W10-A

**Substitui:** valores Implementação e Plano enterrados em cards de mesmo peso visual.

**Spec — banner persistente no topo do fluxo (W2-A em diante):**
```
┌─────────────────────────────────────────────────────┐
│ 💰 Você vai pagar agora: R$ 12.000,00  (Implementação)│
│ 📅 Próxima cobrança: R$ 1.694,44 em 31/05/2026 (Plano)│
└─────────────────────────────────────────────────────┘
```

**Aplica em:**
- W2-A (Revisão): banner fixed-top antes dos 3 cards (org/impl/plano).
- W3-A (Pagamento): banner mantém visível "AGORA R$ 12k" durante todo o passo.
- W4-A (Plano): banner muda pra "AGORA ✓ pago · PRÓXIMA: R$ 1.694,44 em 31/05".
- W10-A (Sucesso): banner final "✓ Implementação paga · ⏱ Próxima cobrança: R$ 1.694,44 em 31/05/2026". Adicionar e-mail de boas-vindas com mesma linha.

**Origem dos gaps:** G2.1-G2.5 (P4-2), P4-2 inteiro — 1 P0, 4 P1

---

### F4.2 (P1) — Boleto: linha digitável copiável universalmente + extensão PDF + matriz de browsers

**Substitui:** botão "Copiar linha digitável" usando Clipboard API sem fallback, IE11 falha.

**Spec:**
- Linha digitável renderizada em `<input readonly type="text">` selecionável universalmente.
- Botão `[📋 Copiar]` tenta Clipboard API; se falha, faz `input.select() + document.execCommand('copy')` (compat IE11+).
- Toast pós-copy: "Linha digitável copiada — cole no seu internet banking".
- Spec adiciona **matriz de browsers suportados** explícita: Chrome/Firefox/Safari/Edge últimas 2 versões + IE11 com bloqueio educado se não suportado.

**Origem dos gaps:** P2-1 inteiro — 2 P0 (G1, G2)

---

### F4.3 (P1) — Termo de uso: progresso de leitura + download PDF + registro persistente

**Substitui:** termo de 47 páginas com scroll obrigatório sem progresso, sem PDF, sem registro acessível.

**Spec — refactor de W7-A:**
- Header do modal: "Termo de Uso · Versão 5.3 · 11 mai 2026" + **progress bar** mostrando "Você leu: 23% (página 11 de 47)".
- TOC navegável à esquerda do modal (versão desktop ≥1024px) com seções clicáveis: "Objeto", "Cobrança", "Cancelamento e Fidelidade", "Pendência Cadastral".
- Botão `[📥 Baixar PDF do termo]` permanente no header pra consultar offline com jurídico.
- Mobile-first sm: TOC vira dropdown colapsado, progress bar fica em top.
- Pós-aceite: PDF + hash de versão + data/hora/IP ficam acessíveis em "Meu Perfil → Termos aceitos" (nova sub-tela).

**Origem dos gaps:** P2-2 inteiro, P4-4 inteiro — 2 P0 (G1, G3), 5 P1

---

### F4.4 (P1) — Recovery operacional (lock-out de Admin único + dupla cobrança em link reenviado)

**Substitui:** silêncio absoluto em paths de exception.

**Spec:**
- **UI preventiva em W3.1 (kebab):** se ação "Inativar" vai bloquear (único Admin), **desabilita** o item do menu com tooltip "Você é o único Admin — não pode inativar a si mesmo. Promova outro Admin antes."
- **W6.2 (confirmação de inativar):** detecta caso "único Admin" e mostra texto adicional: "Atenção: você é o único Administrador. Antes de inativar, promova outro membro a Administrador."
- **Lock-out recovery:** documentar canal "Suporte AwSales reativa Admin via comprovação CNPJ" no copy de W11.3 (link cancelado) e na tela de inativação do último Admin.
- **Link reenviado + pagamento já feito:** before-state explícito antes de invalidar link anterior — sistema verifica `payment_intent.succeeded` no Stripe pra `org_setup_id`. Se houve pagamento, **NÃO invalida automaticamente** — escalation pro AM com banner "Pagamento de R$ X já efetuado, conciliar antes de invalidar".

**Origem dos gaps:** P4-5 inteiro, P5-2-D, P5-2-E — 3 P0, 2 P1

---

## Resumo do Fix Backlog

| ID | Fix | Severidade | Macro | Esforço estimado |
|---|---|---|---|---|
| F1.1 | Contrato de estados assíncronos | **P0** | M1 | 5 SP (1 wireframe horizontal + AC pra cada async) |
| F1.2 | Wireframe Persona A multi-org | **P0** | M1 | 8 SP (decisão termo+TOTP+stripe + 1 wireframe novo) |
| F1.3 | Wireframe Mobile educated block | **P0** | M1 | 3 SP |
| F1.4 | Seletor de org no header Persona A | P1 | M1 | 3 SP |
| F1.5 | Continuidade cross-story (criar função inline) | **P0** | M1 | 5 SP |
| F2.1 | Normalização de e-mail (alias + trim) | **P0** | M2 | 5 SP |
| F2.2 | Regex de senha documentado + policy rotação | **P0** | M2 | 5 SP (+ story de Segurança) |
| F2.3 | TTL configurável (link + boleto + régua) | **P0** | M2 | 8 SP (admin + lógica + notif) |
| F2.4 | Fallback OAuth full-page redirect | **P0** | M2 | 3 SP |
| F2.5 | Trim + paste multi-linha + sumário erros | P1 | M2 | 3 SP |
| F3.1 | 2FA obrigatório respeita flag pro Responsável | **P0** | M3 | 2 SP (variante de W8-A) |
| F3.2 | Audit trail: meta-audit + LGPD + cross-org | **P0** | M3 | 13 SP (story dedicada) |
| F3.3 | Permissões com escopo + PII filtering | **P0** | M3 | 13 SP (story dedicada) |
| F3.4 | Webhook/streaming SIEM (gate pra fintech) | **P0** | M3 | 21 SP — **pós-MVP** |
| F3.5 | Tooltips em permissões + função wizard | P1 | M3 | 5 SP |
| F3.6 | invoice: trigger explícito + tela self-service | P1 | M3 | 5 SP |
| F4.1 | Big Number consolidado em W2-A + W10-A | **P0** | M4 | 3 SP |
| F4.2 | Boleto universal (input + fallback) + matriz browsers | P1 | M4 | 3 SP |
| F4.3 | Termo: progresso + PDF + registro acessível | P1 | M4 | 5 SP |
| F4.4 | Recovery operacional (lock-out + dupla cobrança) | **P0** | M4 | 5 SP |

**Totais:**
- **P0:** 12 fixes
- **P1:** 8 fixes
- **Esforço total:** ~118 SP (~6-8 semanas de trabalho dedicado)
- **MVP enxuto (só P0):** ~75 SP (~4-5 semanas)
- **Pós-MVP (F3.4 isolado):** ~21 SP

---

## Validação cross-scenario dos fixes

> Cada fix proposto deve **resolver gaps em ≥2 perfis** sem **quebrar** nenhum outro cenário. Validação:

| Fix | Resolve em perfis | Quebra em perfis | Status |
|---|---|---|---|
| F1.1 (async states) | P1, P2, P4, P6 | nenhum | ✓ |
| F1.2 (multi-org Persona A) | P5 | nenhum | ✓ |
| F1.3 (mobile block) | P4 | nenhum | ✓ |
| F1.4 (seletor org) | P5 | nenhum | ✓ |
| F1.5 (continuidade cross-story) | P1, P4 | nenhum | ✓ |
| F2.1 (normalização e-mail) | P1, P6 | nenhum (opt-in) | ✓ |
| F2.2 (senha + rotação) | P3 | nenhum (default permissivo SMB) | ✓ |
| F2.3 (TTL configurável) | P2, P6 | nenhum (defaults seguros) | ✓ |
| F2.4 (fallback OAuth) | P6 | nenhum | ✓ |
| F2.5 (trim/paste) | P6 | nenhum | ✓ |
| F3.1 (2FA Persona A) | P3 | nenhum | ✓ |
| F3.2 (audit trail enterprise) | P1, P3, P5 | nenhum | ✓ |
| F3.3 (permissões escopo) | P3 | requer revisão de Story 2 cap 4.4 (funções padrão) | ⚠ revisar |
| F3.4 (SIEM) | P3 | nenhum (gated pós-MVP) | ✓ |
| F3.5 (tooltips funções) | P2, P4 | nenhum | ✓ |
| F3.6 (invoice) | P2, P3 | nenhum | ✓ |
| F4.1 (Big Number) | P2, P4 | nenhum | ✓ |
| F4.2 (boleto universal) | P2 | nenhum | ✓ |
| F4.3 (termo PDF + progresso) | P2, P4 | nenhum | ✓ |
| F4.4 (recovery operacional) | P4, P5 | nenhum | ✓ |

**Conclusão:** todos os fixes são **substituições/adições** sem quebrar outros perfis. F3.3 exige revisão coordenada de Story 2 — não é break, é evolução.

---

## Decisões estratégicas que o PG precisa tomar antes do dev

1. **P3 fintech regulada está no escopo do MVP?** Se sim, F3.1-F3.4 são bloqueantes (~50 SP adicionais). Se não, definir explicitamente "P3 fora do MVP" e remover da pipeline comercial até que tenha "Enterprise Readiness" como release.

2. **P5 grupo multi-org está no escopo?** Se sim, F1.2 + F3.2 cross-org são bloqueantes (~25 SP). Se não, aceitar perda de holdings.

3. **Termo de uso: aceite por usuário (uma vez) ou por usuário×org (cada org)?** Decisão jurídica que precisa ser feita ANTES de F1.2.

4. **TTL de convite default:** mudar de 7d pra 14d como default (mantendo 7d como opção)?

5. **Audit trail retention:** definir AGORA com jurídico — 5 anos (LGPD genérica)? 10 anos (regulação financeira)? Sem essa definição, F3.2 fica em pendência.

6. **2FA obrigatório vale pro 1º acesso do Responsável quando flag está ON?** (default sugerido: SIM)
