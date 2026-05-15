# Fix Backlog Priorizado — Stress Test Financeiro 2026-05-11

> 📌 **NOTA DE REVISÃO (pós-feedback PG · 2026-05-11):**
> - **Onda 3 — Story 4 dedicada cancelada.** F3 fintech BACEN não é ICP; F5 holding/Grupo Econômico não é direcionamento de produto. Fixes que vinham desses perfis e são **universais** foram incorporados nas Ondas 1 e 2 (PII filtering completo, dispute timeline, schema canônico, clareza de escopo por org).
> - **"Limite de gastos" renomeado pra "Cobrança parcial quando atingir"** em todos os 3 artefatos (story + wireframe + HTML).
> - **F1.6 Notificações:** Story 3 PRODUZ os eventos canônicos. Renderização visual (banner global, resumo header, página global) é feature paralela já em desenvolvimento.
> - **F2.5 "Multi-org cross-org scope"** redefinido: clareza visual ("nesta organização") sem visão consolidada cross-org.

> **Objetivo declarado pelo PG:** *"quero as melhores telas, com a melhor usabilidade e seguindo LGPD e tudo que tem mais direito de leis e segurança"*
>
> **Princípio:** cada fix **substitui** algo ruim, não apenas adiciona. Tela "melhor" = tela com menos surpresa, mais clareza CDC, sem dívida regulatória.

---

## Estratégia de hardening em 3 ondas

| Onda | Objetivo | Perfis cobertos | Total SP | Duração |
|---|---|---|---|---|
| **🌊 Onda 1 — Hardening MVP (P0 imediato)** | Endereçar fixes P0 que cabem na Story 3 atual sem mudança arquitetural | F1, F4, F6 + parte de F2 | ~30 SP | 2 semanas |
| **🌊 Onda 2 — Refino UX/Compliance (P1)** | Polir transparência CDC + UX/Acessibilidade WCAG | Todos | ~25 SP | 2 semanas |
| **🌊 Onda 3 — Anti-claim + Story 4** | Declarar oficial out-of-scope: fintech BACEN, holding multi-org, SIEM streaming | F3, F5 | Story 4 dedicada (~40 SP) | Pós-MVP |

---

## 🌊 ONDA 1 — Hardening MVP (P0 imediato · ~30 SP · 2 semanas)

### F1.1 (P0 · 5 SP) — Idempotência de pagamento Stripe (mata risco CDC Art. 42 §único)

**Substitui:** botão "Tentar de novo" sem proteção contra retry simultâneo + PIX PENDING sem lock.

**Spec:**
- **idempotency_key por fatura** no Stripe (gerado client-side, persistido pra que retry use o mesmo)
- **Lock client-side** durante PIX PENDING (botão "Pagar com cartão" disabled com tooltip *"PIX em andamento. Aguarde 30s pra confirmação do banco."*)
- **Lock client-side** durante retry automático do Stripe (tooltip *"Próxima tentativa automática em <HH:MM>. Não clique novamente."*)
- **Novo status:** `PAGAMENTO_PARCIAL` (14º status — quando voucher cobre só parte) e `DUPLICADO_A_ESTORNAR` (quando race condition ocorreu mesmo assim)
- **Fluxo self-service de reembolso** se duplicado for detectado (modal "Identificamos cobrança duplicada — estornamos automaticamente em até 7 dias" + audit event `fatura.estorno_duplicidade`)

**Origem:** Cluster RC3 · F2-2.G2, F4-2-G1/G2/G4/G5 · 12 gaps · 6 P0
**Leis:** PCI-DSS 6.5.5, CDC Art. 42 §único, CDC Art. 39 V

---

### F1.2 (P0 · 4 SP) — Card "Plano" com variant PAST_DUE explícito + razões individuais

**Substitui:** card mostra "● Ativo" mesmo quando subscription está PAST_DUE há 30 dias.

**Spec:**
- **Variant de card "PAST_DUE"** no W1 — fundo vermelho claro, badge `● Pendência de pagamento` em vermelho, valor mensal + "X dias em atraso" no header
- **Lista das razões individuais** no card (não agregadas em "1 fatura"): "PLAN R$ 4.500 (16/05) · FEE R$ 412 (18/05) · IMPLEMENTATION R$ 4.000 (20/05)" com links pra fatura específica
- **CTA principal "Resolver pendência →"** levando pra modal de detalhes com instruções acionáveis
- **Sincronização card ↔ modal** (mesma info, mesma ordem) — modal vira drill-down, não revelação

**Origem:** Cluster RC1 + RC7 · F2-1.G1/G4 · F2-1.G2/G3 · 4 gaps · 4 P0
**Leis:** CDC Art. 6º III, Art. 31, Nielsen H1, H2

---

### F1.3 (P0 · 4 SP) — PII Filtering completo (catálogo + `executor.nome` + retroatividade DSR)

**Substitui:** Cenário 20 esqueceu campo `executor.nome` do audit trail. Auditor BACEN vê nomes completos = achado.

**Spec:**
- **Atualizar Cenário 20** pra incluir TODOS os campos PII no catálogo:
  - `executor.nome` (audit trail) — mascarado `F***e R*****` se função sem `Visualizar PII`
  - `target.nome`, `target.email` (alvo do audit) — mesmo tratamento
  - `actor.ip`, `target.ip` (já estavam)
  - `e-mail de invoice adicional` (já estava)
- **Pseudonimização retroativa DSR**: quando user exerce direito ao apagamento (LGPD Art. 18 VI):
  - Audit trail substitui PII por hash pseudonimizado público (`hash_<user_id>`)
  - Hash original preservado em cofre (não exposto pra clientes nem export)
  - Hash SHA-256 da linha permanece imutável (integridade probatória) — mas conteúdo é hash, não PAN
  - Novo evento canônico `audit_trail.dsr_anonimizacao_aplicada` no Cenário 17
- **Banner no export CSV**: *"Este export aplicou anonimização retroativa em N registros (titulares que exerceram direito ao apagamento). Hash original disponível mediante ordem judicial."*

**Origem:** Cluster RC2 + RC12 · F3-1.G1/G2, F3-5.G1-G8, F4-4-G5, G-F1-4.1/4.2/4.7 · 18 gaps · 8 P0
**Leis:** LGPD Art. 13, 18 VI, 38, 46 · BACEN Circular 4.893 §6º

---

### F1.4 (P0 · 3 SP) — Placeholder de cancelamento/alteração com declaração explícita

**Substitui:** botões "Solicitar alteração" / "Solicitar cancelamento" parecem funcionais mas são placebos.

**Spec:**
- **Renomear botões:** "(Solicitar)" → **"[✉ Falar com responsável comercial]"** (ação clara, não promessa)
- **Modal pós-clique** declara explicitamente: *"Este pedido **não** foi enviado automaticamente. Pra continuar:"*
- **3 opções acionáveis:**
  1. **Mailto pré-preenchido** com assunto "Solicitação de alteração de plano — Fyntra Tecnologia" + corpo template
  2. **Link "Copiar e-mail" + WhatsApp** do gerente comercial
  3. **Botão "Marcar reunião"** (link calendly do gerente, se houver)
- **Em PAST_DUE:** modal exibe **multa de fidelidade com fórmula visível** (`(meses_restantes × valor_mensal) × multa_pct`) + valor exato + base legal CDC Art. 51 IV (proibição de cláusula abusiva)
- **Próxima cobrança permanece visível** *"Sua próxima cobrança de R$ 2.497,98 está prevista pra 28/05/2026 mesmo após você falar com a equipe."* — evita confusão "achei que cancelei"

**Origem:** Cluster RC4 · 13 gaps · 5 P0 · 4 perfis (F1, F2, F4, F5)
**Leis:** CDC Art. 39 V, Art. 49, Art. 51 IV · Nielsen H1, H2

---

### F1.5 (P0 · 3 SP) — Forecast / breakdown "Plano fixo + Variável estimado"

**Substitui:** card "Próxima cobrança" mostra só plano fixo. Founder solo (F4) acha que paga sem usar; enterprise (F6) acha que paga só R$ 7k quando paga R$ 500k+.

**Spec:**
- **Card "Próxima cobrança" reescrito** com 3 linhas:
  - **Plano fixo:** R$ 7.000 (cobrado 30/06)
  - **Variável estimado:** R$ ~507.430 (com base nos últimos 90 dias) ⓘ
  - **Total previsto:** R$ ~514.430
- **Tooltip ⓘ** explica: *"Estimativa baseada no consumo médio dos últimos 90 dias. Valor real só será conhecido no fechamento do mês."*
- **Forecast no gráfico:** linha tracejada projetando consumo restante do mês (com confidence interval)
- **Em SMB sem uso (F4):** se variável = R$ 0 nos últimos 90d, label muda pra "Variável: R$ 0 — você paga somente pelo plano fixo enquanto não usar"

**Origem:** Cluster RC6 · 12 gaps · 3 P0 · 2 perfis extremos opostos (F4 SMB + F6 enterprise)
**Leis:** CDC Art. 6º III, Art. 31 · Nielsen H1, H2, H10

---

### F1.6 (P0 · 3 SP) — Layer de notificação proativa (matriz eventos→canais→thresholds)

**Substitui:** audit trail como log passivo. Sem alerta proativo pra fatura alto valor vincenda, voucher DEPLETED rápido, duplo charge detectado.

**Spec:**
- **Novo módulo backend** "Notificações financeiras proativas" com matriz:

| Evento | Threshold | Canais (in-app · e-mail · push) | Quando |
|---|---|---|---|
| `fatura.vencimento_proximo` | valor ≥ R$ 100k OU 5 dias antes | banner cross-page + e-mail Admin/Financeiro | D-5, D-3, D-1 |
| `voucher.depleted_rapido` | consumido ≥ 80% em <50% do tempo | e-mail Admin + in-app banner | Imediato |
| `fatura.duplicado_detectado` | mesma `org_setup_id` + 2 charges Stripe próximos | e-mail Admin + in-app modal sticky | Imediato |
| `plano.entrou_past_due` | qualquer transição ACTIVE → PAST_DUE | e-mail Admin + WhatsApp gerente comercial | Imediato |
| `org.suspensa_inadimplencia` | régua D+3 disparou | e-mail Admin + WhatsApp gerente comercial | Imediato |

- **Banner cross-page** persiste até cliente clicar "Vi" ou resolver o evento
- **E-mails** com link direto pra fatura/voucher relevante
- **Configuração de preferências** em Configurações → Notificações (futuro — fora MVP)

**Origem:** Cluster RC13 · 5 gaps · 4 P0
**Leis:** CDC Art. 6º III, Art. 39 XII (analogia) · Nielsen H1

---

### F1.7 (P0 · 3 SP) — Mensagem específica de erro de cupom (alinhar story com wireframe W5.2)

**Substitui:** mensagem genérica "Cupom inválido — pode ser X, Y, Z, W" não diz QUAL erro.

**Spec:**
- **Atualizar Cenário 15** pra mensagens **específicas** retornadas pelo Stripe:
  - `coupon_not_found` → *"Cupom 'XXX' não encontrado. Verifique o código e tente novamente."*
  - `coupon_expired` → *"Cupom 'XXX' expirou em DD/MM/AAAA. Entre em contato com seu gerente comercial pra solicitar um novo código."*
  - `coupon_max_redemptions` → *"Cupom 'XXX' atingiu o limite de uso (N de N resgates). Esse código não pode mais ser aplicado."*
  - `coupon_currency_mismatch` → *"Cupom 'XXX' é em USD. Sua organização opera em BRL — entre em contato com seu gerente comercial pra um cupom compatível."*
  - `coupon_redeem_by_passed` → *"Cupom 'XXX' tinha validade até DD/MM/AAAA e não pode mais ser aplicado."*
  - **Throttling:** após 3 tentativas inválidas em 5 min, bloqueia por 15 min com mensagem *"Muitas tentativas. Tente novamente em 15 minutos."* (anti-enumeration attack)
- **Atualizar W5.2** (modal de erro) pra mostrar a mensagem específica retornada, não a lista genérica
- **Audit event** `cupom.aplicacao_falhou` com motivo específico no metadata

**Origem:** Cluster RC10 · F1-3 (3 gaps · 2 P0)
**Leis:** CDC Art. 6º III · Nielsen H9 · claim F1.4

---

### F1.8 (P0 · 4 SP) — Audit trail escalável (virtual scroll + paginação numérica + export async resiliente)

**Substitui:** scroll infinito quebra em 5+ páginas. Export sync timeout em 50k+ linhas. Job assíncrono morre se org suspensa.

**Spec:**
- **Virtual scroll** na tabela do audit trail (renderiza apenas viewport, recicla DOM)
- **Paginação numérica** alternativa ao scroll infinito (preset "Itens por página: 50/100/500")
- **Jump-to-date** (input de data + scroll automático pra primeira linha do dia)
- **Export CSV totalmente async**:
  - Job persistido em fila durável (SQS) — não morre se org suspende
  - Notificação por e-mail ao concluir (link de download válido 24h)
  - Tela "Meus exports" lista exports em andamento + concluídos
  - **Direito de acesso LGPD Art. 18 II é incondicional** — export funciona mesmo em org suspensa por inadimplência (cliente tem direito aos próprios dados)

**Origem:** Cluster RC8 · F2-4 + F6-4 (10 gaps · 4 P0)
**Leis:** LGPD Art. 18 II, §3º · Marco Civil Art. 13 · Nielsen H1, H7

---

### F1.9 (P0 · 2 SP) — Status PT-BR + magnitude visual (badges escaláveis)

**Substitui:** status ENUM Stripe vazando ("PENDING", "PAYMENT_FAILED", "CHARGEBACK_RESOLVED"). Badge amarelo de R$ 100 e R$ 500k têm peso visual idêntico.

**Spec:**
- **Tradução PT-BR coloquial** mantendo correspondência técnica:
  - `OPEN` → "Em aberto"
  - `PENDING` → "Aguardando confirmação"
  - `PAID` → "Paga"
  - `PAYMENT_FAILED` → "Pagamento falhou"
  - `EXPIRED` → "Vencida"
  - `DISPUTED` → "Em contestação"
  - `CHARGEBACK` → "Estornada (banco do cliente)"
  - `CHARGEBACK_RESOLVED` → "Disputa resolvida"
  - `REFUNDED` → "Reembolsada"
  - `UNCOLLECTIBLE` → "Incobrável"
  - `VOID` → "Anulada"
- **Tooltip ⓘ** em cada badge explicando o estado em uma frase coloquial
- **Magnitude visual:** badges de fatura **R$ ≥ R$ 100k** ganham **borda mais grossa + ícone de exclamação** quando em status crítico (OPEN próximo de vencer, PAYMENT_FAILED, DISPUTED)
- **Em PENDING específico de PIX:** copy adicional *"PIX leva até 30 segundos pra confirmar. Não pague novamente, aguarde."* (mitiga RC3)

**Origem:** Cluster RC7 · 16 gaps · 4 P0 · 5 perfis
**Leis:** CDC Art. 6º III · Nielsen H1, H2, H4

---

## 🌊 ONDA 2 — Refino UX/Compliance (P1 · ~25 SP · 2 semanas)

### F2.1 (P1 · 3 SP) — Preservação de estado cross-navegação

**Substitui:** sair de Visão Geral pra Métodos de Pagamento e voltar perde filtros, toggle, scroll, busca.

**Spec:**
- **State persistido no URL** (query params: `?period=last_30d&group=campanha&search=BF`)
- **Scroll restoration** ao voltar (browser API)
- **Hash routing** preserva sub-aba + scroll
- **Atalho "← Voltar pra Financeiro"** explícito na sub-tela

**Origem:** RC5 · 6 gaps · F1
**Leis:** Nielsen H3, H7

---

### F2.2 (P1 · 4 SP) — Timeline visual de dispute/chargeback no modal de fatura

**Substitui:** modal W4 mostra apenas status final do dispute. Sem narrativa do que aconteceu.

**Spec:**
- **Seção "Histórico desta fatura"** no modal W4 (timeline vertical):
  - 28/04 10:30 · `fatura.gerada` · DRAFT → OPEN
  - 28/04 10:35 · `fatura.paga` · OPEN → PAID (via Cartão Visa •••• 3012)
  - 15/05 14:20 · `fatura.contestada` · PAID → DISPUTED (chargeback aberto pelo banco do cliente)
  - 18/05 09:15 · `dispute.evidencia_submetida` · evidência enviada pra Stripe
  - 22/05 16:40 · `dispute.aceita` → CHARGEBACK_RESOLVED (favor AwSales)
- **PDF da fatura inclui timeline completo** (não só linha de itens) — fechamento contábil BACEN
- **Catálogo Cenário 17 ampliado** com novos eventos: `evidencia_submetida`, `disputa_aceita`, `disputa_rejeitada`, `chargeback_resolvido`

**Origem:** Cluster RC11 · F3-2 (5 gaps · 4 P0 fintech)
**Leis:** CDC Art. 6º III, Art. 42 §único · BACEN · LGPD Art. 18 II

---

### F2.3 (P1 · 3 SP) — Voucher: bruto vs líquido + alerta consumo rápido

**Substitui:** coluna "Valor cobrado" ambígua (bruto ou líquido após voucher?). Voucher DEPLETED em <72h sem alerta.

**Spec:**
- **Tabela "Histórico de faturas"** mostra **bruto + desconto explícito**:
  - Coluna "Valor" = bruto (R$ 1.253,04)
  - Coluna "Cupom/Voucher aplicado" = `BF2025 -R$ 250,61`
  - Coluna "Pago" = líquido (R$ 1.002,43)
  - Linha total no rodapé: `Bruto · Descontos · Líquido`
- **Notificação proativa** (parte do F1.6) quando voucher consumido ≥ 80% em <50% do tempo previsto
- **Tabela vouchers** ganha **barra de progresso visual** mostrando consumido vs restante + label "consumindo X vezes mais rápido que previsto" se aplicável

**Origem:** Cluster RC10 + RC13 · F2-3 + F6-3 (8 gaps · 3 P0)
**Leis:** CDC Art. 6º III · Nielsen H1

---

### F2.4 (P1 · 4 SP) — Gráfico empilhado escalável (log/normalized + tooltip rico)

**Substitui:** quando uma categoria domina (95% disparos), as outras 3/4 viram invisíveis no gráfico.

**Spec:**
- **Toggle "Escala"** no canto do gráfico: `Linear (R$) | 100% empilhado (%) | Log (R$)`
  - **Linear:** atual (boa pra magnitude)
  - **100% empilhado:** todas as barras vão até 100%, mostra **proporção** (resolve invisibilidade da menor categoria em high-volume)
  - **Log:** escala logarítmica (mostra todos os valores comparativamente)
- **Tooltip rico** ao passar mouse: cada categoria com R$ + % do total + tendência (▲▼ vs dia anterior)
- **Click numa barra do dia** abre drawer lateral com breakdown completo daquele dia

**Origem:** Cluster RC8 · F6-1 (4 gaps · 1 P0 high-volume)
**Leis:** CDC Art. 6º III · Nielsen H8

---

### F2.5 (P1 · 3 SP) — Multi-org cross-org scope claro nos cards

**Substitui:** card "Total economizado · lifetime" sem qualificar escopo. Voucher "Holding" vincula 1 org.

**Spec:**
- **Cards qualificam escopo explicitamente:**
  - "Total economizado nesta organização" (default)
  - Botão opcional "Ver consolidado em todas as suas N organizações →" (leva pra W15 — Audit Trail Pessoal Cross-Org expandido pra incluir vouchers)
- **Voucher emitido pra holding** mostra badge **"Vínculo: Org Anhanguera"** — sem ambiguidade de escopo
- **Anti-claim explícito** na story sobre "Holding/Grupo Econômico como modelo unificado" (vai pra Story 4)

**Origem:** Cluster RC9 · F5-1-D, F5-2-A/B/D · subset de 8 gaps · 3 P0
**Leis:** LGPD Art. 6º II · CDC Art. 6º III, Art. 30

---

### F2.6 (P1 · 2 SP) — WCAG 2.1 AA — Acessibilidade base

**Substitui:** badges dependem só de cor pra distinguir status. Sem aria-labels em ícones. Sem semântica em tabelas.

**Spec:**
- **Cor + ícone + label texto** em todos os badges de status (não depender só de cor — WCAG 1.4.1)
- **Aria-labels** em todos os ícones decorativos (`aria-hidden="true"` se decorativo, `aria-label="X"` se semântico)
- **Tabelas** com `<th scope="col">` + `<caption>` (screen readers)
- **Contraste mínimo 4.5:1** em todos os textos (validar com axe-core ou Lighthouse)
- **Navegação por teclado** completa: Tab passa em todos os elementos interativos, modais com focus trap, Escape fecha modal
- **Loaders** com `role="status"` + `aria-live="polite"`

**Origem:** Claims U1.11, U1.12, U1.13 do SUT
**Padrão:** WCAG 2.1 AA

---

### F2.7 (P1 · 3 SP) — Audit trail vocabulário PT-BR + tooltips

**Substitui:** Júnior (founder solo) acha que audit trail é "log de erros" porque vê snake_case e jargão.

**Spec:**
- **Ações em PT-BR coloquial** (mantendo enum técnico no schema):
  - `plano.mudou` → "Plano alterado"
  - `cartao.padrao_mudou` → "Cartão padrão trocado"
  - `fatura.paga` → "Fatura paga"
  - `cupom.aplicado_pelo_cliente` → "Cupom aplicado (pelo cliente)"
  - `cupom.aplicado_pelo_admin` → "Cupom aplicado (pela AwSales)"
- **Tooltip ⓘ** no header da seção: *"Audit trail é o registro de TODAS as ações no seu Financeiro — quem fez, quando, em qual recurso. Útil pra auditoria, contestação e LGPD."*
- **Schema técnico** (`plano.mudou`) permanece no backend pra eventos canônicos

**Origem:** Cluster RC7 · F4-4 (4 gaps · 1 P0)
**Leis:** LGPD Art. 6º VI · Nielsen H2, H10

---

### F2.8 (P1 · 3 SP) — Multa de fidelidade com fórmula transparente

**Substitui:** "Fidelidade 12 meses · multa 50%" sem mostrar valor calculado.

**Spec:**
- **Modal Detalhes do Plano** mostra:
  - "Fidelidade: 12 meses (faltam 8 meses)"
  - "Multa em caso de cancelamento: **R$ 9.992,12**"
  - **Fórmula visível:** "(meses_restantes × valor_mensal) × 50% = (8 × R$ 2.497,98) × 50% = R$ 9.992,12"
  - **Base legal:** "Conforme cláusula X do contrato + CDC Art. 51 IV (cláusula não é abusiva pois aplica desconto proporcional ao prazo restante, não valor cheio)"

**Origem:** Cluster RC9 · F5-5-B (cláusula abusiva sem fórmula)
**Leis:** CDC Art. 51 IV

---

## 🌊 ONDA 3 — Anti-claim + Story 4 (Story dedicada · ~40 SP · pós-MVP)

### Anti-claims explícitos na Story 3 v2

**Adicionar ao SUT:**
- **AC8.** Fintech regulada BACEN — Story 3 não atende. Story 4 fintech-grade aborda: SIEM streaming, NF automática, schema canônico, API REST audit trail.
- **AC9.** Holding / Grupo Econômico como entidade — Story 3 trata multi-org como N orgs separadas. Modelo unificado de holding é Story 4.
- **AC10.** Past_due crônico em larga escala — fluxo de renegociação self-service é Story 5 (Cobrança & Cancelamento, refinando doc v5).

### Story 4 — "Enterprise Compliance + Multi-Org Pack" (~40 SP)

Endereça os perfis F3 + F5 + edge cases do F2:

**Componentes:**
1. **SIEM streaming** (webhook + CEF/LEEF/JSON Lines + assinatura digital com cert chain)
2. **NF eletrônica automática** (integração com emissor — `voucher.emitido` + `voucher.consumido` geram NF)
3. **Modelo "Holding/Grupo Econômico"** (entidade pai com N orgs filhas, vouchers/cupons cross-org explícitos)
4. **PII Filtering completo** (executor.nome, target.nome, target.email)
5. **API REST do audit trail** (cliente automatiza ingestão)
6. **Timeline de dispute/chargeback** completa
7. **Forecast / projeção** no gráfico (paridade GCP Billing/AWS Cost Explorer)

---

## Resumo executivo do Fix Backlog

### Por onda

| Onda | # Fixes | Total SP | Escopo |
|---|---|---|---|
| 🌊 Onda 1 — Hardening MVP P0 | 9 | 31 | F1, F4, F6 + parte F2 |
| 🌊 Onda 2 — Refino UX/Compliance P1 | 8 | 25 | Todos |
| 🌊 Onda 3 — Anti-claim + Story 4 | — | ~40 | F3, F5 (Story dedicada) |

### Por macro-tensão

| Macro-tensão | Fixes da Onda 1 | Fixes da Onda 2 |
|---|---|---|
| M1 Transparência CDC | F1.2, F1.5, F1.9 | F2.3, F2.4, F2.8 |
| M2 Compliance LGPD/BACEN | F1.3, F1.8 | F2.2, F2.6 |
| M3 Idempotência Stripe | F1.1 | — |
| M4 Multi-tenant/Escala | F1.6, F1.8 | F2.1, F2.5, F2.7 |

### Decisões estratégicas que o PG precisa tomar

1. **Endereça F3 fintech BACEN no MVP?** Recomendação: **Não** — anti-claim explícito + Story 4. Marketing/comercial pausa pipeline fintech até Story 4.
2. **Endereça F5 holding multi-org no MVP?** Recomendação: **Parcial** — Onda 1 F1.6 + Onda 2 F2.5 cobrem 50%. Modelo "Holding" completo vai pra Story 4.
3. **F2 past_due crônico em larga escala?** Recomendação: **Onda 1 cobre P0** (idempotência, card variant, placeholder cancelamento). Renegociação self-service vai pra Story 5 (refino do doc v5).
4. **F6 high-volume aceita visualização degradada?** Recomendação: **Não** — F2.4 (gráfico escalável) e F1.8 (virtual scroll) são P0/P1 imediatos.

---

## Validação cross-scenario dos fixes

Cada fix deve **resolver gaps em ≥2 perfis** sem **quebrar** nenhum outro:

| Fix | Resolve em | Quebra em | Status |
|---|---|---|---|
| F1.1 idempotência | F2, F4 | nenhum | ✓ |
| F1.2 card PAST_DUE | F2 | nenhum (compatível com F1 onde plano está ACTIVE) | ✓ |
| F1.3 PII completo | F3, F4 | nenhum (compatível com SMB onde não há auditor) | ✓ |
| F1.4 placeholder cancelar | F1, F2, F4, F5 | nenhum (melhora pra todos) | ✓ |
| F1.5 forecast | F4, F6 | nenhum (SMB sem uso vê "R$ 0 — você só paga plano fixo") | ✓ |
| F1.6 notificação proativa | F4, F6 | requer matriz de eventos definida | ⚠ Onda 1.5 |
| F1.7 mensagem cupom | F1 | nenhum | ✓ |
| F1.8 audit escalável | F2, F6 | nenhum | ✓ |
| F1.9 status PT-BR + magnitude | Todos | nenhum | ✓ |

**Conclusão:** todos os fixes da Onda 1 são **substituições/adições** sem quebrar outros perfis. Apenas F1.6 (notificação proativa) requer definição prévia da matriz eventos→canais (pode ficar como Onda 1.5).

---

## Próximos passos imediatos

1. **PG decide** as 4 decisões estratégicas acima.
2. **Aplicar Onda 1 P0 nos artefatos da Story 3** (próximo passo deste stress test — atualizar stories/financeiro.md + archive/wireframes-ascii/financeiro.md + prototypes/financeiro.html).
3. **Atualizar Story 3 com anti-claims AC8/AC9/AC10** explícitos.
4. **Briefar Greg** pra produzir Figma final apenas após Onda 1 estar aplicada — wireframes atuais ficam marcados como "v1 pré-stress-test".
5. **Briefar comercial** pra pausar pipeline F3 fintech BACEN + F5 holding até Story 4 estar pronta.
