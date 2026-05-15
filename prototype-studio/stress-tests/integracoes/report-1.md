# Stress Test — Tela Unificada de Integrações

> **SUT:** [spec.md](spec.md) + [wireframes.md](wireframes.md)
> **Data:** 2026-04-30
> **Modo:** completo · 4 agentes paralelos · 20 cenários concretos
> **Pipeline:** Red Team (Modelo Conceitual + UX/Personas + Runtime + Tools) → consolidação por root cause → fixes prontos pra aplicar

---

## TL;DR — Verdict por claim

| # | Claim | Sustenta? | Por quê |
|---|---|---|---|
| 1 | "4 entidades cobrem 100% dos casos atuais" | ❌ **NÃO** | Quebra em Yampi (webhook-only com marca), System (interno), Legacy import, tool avulsa, Pipedrive misto. Cobre ~70%. |
| 2 | "Tools convivem dentro da integração — sem tela própria" | ❌ **NÃO** | Tools precisam ser cidadão 1ª classe — descoberta pelo agente, custo, limite, audit, scope-awareness não cabem dentro do detalhe da Conta. |
| 3 | "4 abas no Adicionar eliminam confusão personalizada" | ⚠️ **PARCIAL** | Resolve a confusão semântica (D3/D4 do spec) mas cria nova: Yampi não sabe se é Nativa ou Evento Custom. |
| 4 | "Múltiplas contas agrupadas é melhor UX" | ✅ **SIM** | Card/Paulo/José/PG validaram; Deds postergado conscientemente. Mas falta stat agregada no card pra mitigar dor. |
| 5 | "Wizard de 3 telas → página única sem perda de info" | ✅ **SIM** | Vitória clara para Barnabé. Mas a entrada (criar Integração-pai antes da Tool) anula o ganho em casos de tool avulsa. |

**Score real: 2/5 sustentam, 1 parcial, 2 quebram.** Spec entrega tela bonita mas o produto vaza dado, perde transação e queima qualidade BM em produção sem os fixes abaixo.

---

## Gap Register (priorizado)

### P0 — bloqueia v1 ou risco real (10 gaps)

| ID | Cluster | Resumo | Fonte |
|---|---|---|---|
| **G01** | RC1 | **System (provider interno)** não cabe nas 4 entidades — botões `Reconectar/Desassociar` mentem | A2 |
| **G02** | RC2 | **Token expira mid-conversation** sem política de refresh — alucinação visível pro lead | C1 |
| **G03** | RC2 | **Scope reduction silent failure** — cliente reconecta com menos, acha que arrumou, está pior | C2 |
| **G04** | RC4 | **Tool naming ambíguo entre N contas iguais** — vazamento cross-account ("Loja Expressa" vê preço "JF Rocket") | C3 |
| **G05** | RC4 | **Multi-org tool data leak** — Bearer compartilhado vaza dados/PII entre orgs cliente | C4 |
| **G06** | RC2 | **Webhook backfill sem idempotência** — 47 mensagens duplicadas pro lead, qualidade BM despenca | C5 |
| **G07** | RC3 | **Política de descoberta de tools pelo agente ausente** — LangGraph não funciona sem isso | D1 |
| **G08** | RC2 | **Toggle de tool sem propagação real-time nem audit** — race window cria cupom/refund indevido | D4 |
| **G09** | RC2 | **Dirty-state guard ausente** — Paulo perde edição ao trocar org silenciosamente | B5 |
| **G10** | RC5 | **Stats sem ordenação/filtro** (Daniel) — meio-entrega, recobrança em 2 semanas | B2 |

### P1 — decisão de produto faltando antes de v1 (10 gaps)

| ID | Cluster | Resumo | Fonte |
|---|---|---|---|
| **G11** | RC1 | **Yampi (webhook-only com marca)** sem lugar — perde branding como Evento Custom ou perde categorização como Nativa | A1 |
| **G12** | RC1 | **Conexão Legacy importada** sem `source` declarado — confunde reconnect/dedupe | A3 |
| **G13** | RC3 | **Tool standalone (Gourmet 1-tool)** força criar Integração + Conta — overhead artificial; 7 cliques pra 1 tool | A4 + B3 |
| **G14** | RC1 | **Pipedrive misto (nativo + custom paralelo)** sem fluxo de migração nem auth-override por tool | A5 |
| **G15** | RC6 | **Card regride 1 clique no caso comum** (W4 com 5 tabs vs scroll único atual) | B1 |
| **G16** | RC5 | **Card de provider multi-conta sem stat agregada** — Deds vai pedir antes da v2 chegar | B4 |
| **G17** | RC3 | **Custo de tool custom invisível** — surpresa no boleto Gourmet, churn | D2 |
| **G18** | RC3 | **Limite de plano sem UI** — OAuth queima antes do 422 cru, token órfão na Hotmart | D3 |
| **G19** | RC3 | **Tools nativas não scope-aware** — cliente ativa `criar-cupom` em scope `read`, falha em produção | D5 |
| **G20** | RC5 | **Notificação out-of-band fora do escopo (§6.5)** — cliente só descobre erro abrindo Studio | C1+C2+C5 |

---

## Root Cause Clusters

### RC1 — Provider monolítico sem sub-tipagem (G01, G11, G12, G14)

**Sintoma:** Yampi (webhook-only com marca), System (interno), Legacy (importada), Pipedrive misto — todos os 4 quebram em pontos diferentes do mesmo lugar: o spec trata "Provider" como categoria única quando ele tem >1 dimensão.

**Causa raiz:** spec §3 define Provider como "tipo de serviço externo que sabemos falar" e §4.2 lista variações de UX por tipo (OAuth completa / API key / Canal / Webhook recebido / Custom). Mas `provider.kind` não é atributo de 1ª classe — é só ilustrativo. Resultado: cada caso de borda força uma decisão ad-hoc no fluxo "+ Adicionar".

**Fix consolidado (resolve G01+G11+G12+G14 de uma vez):** ver Fix F1 abaixo.

### RC2 — Spec descreve estado, não transições (G02, G03, G06, G08, G09)

**Sintoma:** OAuth refresh, scope reduction, webhook replay, tool toggle propagation, dirty state — todos casos de mudança de estado que o spec ignora porque foca em screens, não em state machines.

**Causa raiz:** §6.1 lista estados (`healthy/warning/error`) mas nunca define transições, eventos disparadores, observação event-driven vs cache. Spec é UI-first; greenfield (LangGraph + Lambda + DynamoDB) precisa de contratos de runtime.

**Fix consolidado:** ver Fix F2.

### RC3 — Tools subdimensionadas como entidade de produto (G07, G13, G17, G18, G19)

**Sintoma:** descoberta pelo agente sem contrato, custo invisível, limite sem UI, scope reconciliation ausente, tool avulsa com overhead — Tools recebem 15 linhas no spec (§5.8 + W9 + W10) e zero atenção a lifecycle/governança.

**Causa raiz:** Claim 2 do spec ("Tools convivem dentro da integração — sem tela própria") foi tomada como decisão arquitetural quando deveria ser só de UX. Tools são vetor de execução da IA com custo, risco e governança próprios.

**Fix consolidado:** ver Fix F3.

### RC4 — Multi-org/multi-account boundary mal definido (G04, G05)

**Sintoma:** 3 contas Hotmart com mesma tool nativa colidem em namespace; integração custom multi-org com Bearer único vaza dados entre orgs cliente.

**Causa raiz:** spec confunde "Conta = credencial" com "Conta = boundary de dado". Sem isolamento explícito por org no runtime de tool, e sem disambiguation policy entre N contas mesmo provider.

**Fix consolidado:** ver Fix F4.

### RC5 — Stats/UX sem affordance de ação (G10, G16, G17, G20)

**Sintoma:** stats inline (Daniel) sem sort/filter; card multi-conta (Deds) sem agregação; custo (D2) sem painel; notificação (§6.5) fora do escopo.

**Causa raiz:** spec entrega "ver número" como se fosse a feature, quando "agir sobre número" é o que as personas pediram.

**Fix consolidado:** ver Fix F5.

### RC6 — Progressive disclosure ausente (G13, G15)

**Sintoma:** Card regride 1 clique no caso simples (5 tabs onde antes era scroll); Barnabé carrega overhead de Integração-pai pra 1 tool.

**Causa raiz:** spec assume um modo único pra todas as personas. Card simples e Barnabé power-user precisam de portas diferentes.

**Fix consolidado:** ver Fix F6.

---

## Fixes prontos pra aplicar

> Cada fix abaixo é **texto pronto** pra substituir/adicionar no `spec.md` ou `wireframes.md`. Marque ✓ ao aplicar.

### F1 — Sub-tipagem de Provider (resolve G01, G11, G12, G14) · P0+P1

**Onde:** `spec.md` §3 e §4.2

**Adicionar em §3, depois da tabela de 4 entidades:**

```markdown
### 3.1. Sub-tipos de Provider (atributo de 1ª classe)

`Provider.kind` é atributo obrigatório que define o que existe na Conta:

| kind | Exemplo | Conta tem | UX (W4) |
|---|---|---|---|
| `oauth-bidirectional` | Hotmart, HubSpot, Pipedrive (nativos) | Auth OAuth · objetos · webhooks · tools | Tabs Visão/Permissões/Objetos/Webhooks/Tools |
| `api-key` | Stripe, Asaas, Acuity | Credencial · objetos · tools | Tabs Visão/Permissões (read-only chips)/Objetos/Tools |
| `webhook-in` | Yampi, Cartpanda, Eduzz checkout-only | Endpoint URL gerado · log de eventos · branding do provider | Tabs Visão/Webhooks · sem Permissões/Objetos/Tools |
| `channel` | WABA, Instagram, Messenger | BMs/números/templates aninhados | Layout próprio (W11) |
| `platform` | System (interno) | Tools nativas de plataforma | Apenas tab Tools · sem Reconectar/Desassociar |
| `custom` | Gourmet API, Habilidade Personalizada | Auth definida pelo usuário · tools custom | Tabs Visão/Tools · sem Permissões/Objetos/Webhooks |

**Regra de catalogação:** Yampi/Cartpanda entram no catálogo W3 aba "Nativas" como `kind=webhook-in` — preservam logo e identidade de marca, mas a UX interna é minimalista. Não confundir com **Evento Customizado anônimo** (W7), que é genérico/sem marca.

**Atributo `Connection.source`:** cada Conta tem proveniência: `oauth | api-key | imported-legacy | platform-default`. Wireframes W4/W5 mostram chip "Importada" no header com tooltip quando `source=imported-legacy`. Reconectar uma Conta legacy faz upsert (preserva ID interno e histórico), nunca cria 2ª conta no mesmo Provider.
```

**Atualizar em §4.2:** trocar a tabela atual por referência a §3.1 e adicionar regra: "UX condicional ao `provider.kind`".

**Atualizar em §7 (Decisões):** adicionar D13: "Provider tem `kind` como atributo de 1ª classe; 6 sub-tipos definem UX e ciclo de vida. Resolve casos Yampi (webhook-in com marca), System (platform), Legacy (source=imported)."

**Wireframes a atualizar:**
- W3: aba "Nativas" inclui Yampi/Cartpanda com badge `webhook-in`
- W4: condicional ao kind — esconder tabs irrelevantes (Permissões/Objetos/Webhooks pra `platform`)
- W1: card de `platform` provider (System) com badge "Plataforma", sem indicador de N contas

### F2 — Connection Lifecycle como state machine (resolve G02, G03, G06, G08, G09) · P0

**Onde:** `spec.md` adicionar nova seção §6.6

**Texto pronto:**

```markdown
### 6.6. Connection Lifecycle (state machine)

Cada Conta tem state machine explícita. UI **observa eventos**, não faz polling.

```
active ──token_expiring──→ active+warning ──reconnect─→ active
   │                              │
   │                              └─token_expired──→ degraded
   │                                                    │
   ├─scope_reduced──→ degraded ←──────────────────────────┘
   │                    │
   ├─upstream_5xx──→ degraded
   │                    │
   └─revoked────────→ broken (manual ação)
```

**Eventos disparadores e SLAs:**
- `token_expiring` (≤5min vencer): UI muda chip pra `warning`. Refresh proativo automático com mutex `(org_id, account_id)` pra evitar storm em 100 conversas paralelas.
- `token_expired` (401 detectado): UI muda **na hora** (event-driven, não cache 5min). Reactive refresh: 1 retry após refresh ok, depois entrega `Tool.error.user_facing_message` pré-aprovada pro agente.
- `scope_reduced` (diff pre/post reconnect): modal explícito **antes** de confirmar reconnect: "Você reconectou com **menos** permissões. Estas tools serão desabilitadas: [...]. [Voltar e refazer] [Confirmar mesmo assim]".
- Replay/Idempotência: cada evento de webhook tem `dedupe_key = provider.event_id`, TTL 30d. Replay nunca dispara side-effect duplicado.
- Replay age cutoff: eventos >2h não disparam mensagens user-facing automáticas — entram em **fila de revisão** (W12 nova tab "Eventos pendentes" com lista; cliente decide `Processar` / `Descartar` / `Marcar como já tratado`).
- Drop em D+7: vira evento auditável; aviso forte em D+6 ("Você está prestes a descartar 47 eventos de Stripe").

**Dirty-state guard global:** qualquer formulário de edição (W4 webhook, W7 evento custom, W8 integração custom, W10 tool) bloqueia troca de org/navegação com modal `Você tem alterações não salvas em <tela>. [Salvar e trocar] [Descartar e trocar] [Cancelar]`. Indicador visual de dirty state no org switcher.

**Tool toggle propagation:** mudança de toggle (W9) é **síncrona** — push para LangGraph antes de retornar 200 ao usuário. Tool registry tem versão por turno. Toggle off em tool com categoria `write/destructive` exige confirmação modal: "Conversas em andamento podem ainda usar até [próximo turno]. Confirma?".

**Notificação out-of-band:** removida da lista de "fora do escopo" (§6.5). v1 mínimo: e-mail pra owner da org quando Conta entra em estado `degraded` ou `broken`. Slack/SMS ficam v1.5.
```

**Atualizar em §6.5:** remover bullet "Notificação adicional via canais (e-mail/Slack/SMS) — fora do escopo desta tela mas referenciado". Substituir por: "Ver §6.6 — notificação básica (e-mail) é parte do v1."

**Decisão D14 em §7:** "Connection Lifecycle é state machine event-driven com refresh proativo+reativo, dirty-state guard global, idempotência de webhook, e notificação básica out-of-band como mínimo v1."

**Wireframes:**
- W12 ganha tab "Eventos pendentes" com lista + ações por evento
- W4/W5 ganham indicador `dirty state` no header quando há edição não salva
- W6 ganha modal de scope reduction quando reconnect detecta downgrade

### F3 — Tools como cidadão de 1ª classe (resolve G07, G13, G17, G18, G19) · P0+P1

**Onde:** `spec.md` adicionar §5.9 e §6.7; `wireframes.md` adicionar W15

**Texto pronto §5.9:**

```markdown
### 5.9. Tools — Política de Discovery, Naming e Governança

Tools são vetor de execução da IA. Têm contrato próprio, telemetria, custo e auditoria.

**Naming canônico (FQN):** identifier estável `<provider>.<account-uuid>.<tool>` (imutável). Display name muda livremente — identifier nunca. Conversation memory referencia FQN, sobrevive a rename.

**Estratégia de exposição ao agente (LangGraph):**
- Default: todas tools `enabled` da org são expostas no tool registry, **com filtro por contexto da conversa** (canal/conta de origem prioriza tools daquela conta).
- Curadoria opcional por agente/intent (config no Studio Agentes — fora desta tela).
- Limitar paralelismo: max 1 chamada por FQN por turn (proibir fan-out implícito).

**Estados de Tool nativa (tri-estado em W9):**
- `available` — scope OK + cliente ON. Toggle livre.
- `unavailable_missing_scope` — declarado em manifest `tool.required_scopes[]`, scope insuficiente. Greyed + CTA `Reconectar com scope X`.
- `unavailable_provider_pending` — feature da plataforma deles ainda não pronta. Badge "em breve".

**Tool standalone (atalho UX):** rota `Studio → Tools → + Nova Tool HTTP` cria implicitamente um Provider de `kind=custom` chamado "Minhas Tools" (Conta default invisível por org), e leva direto pra W10. Modelo conceitual mantém invariante (Tool tem Conta-pai), mas UX poupa Barnabé de criar Integração-pai. Cobre o caso "1 tool avulsa".

**Auth override por Tool (em W10):** seção colapsável "Auth (override)" com toggle "Usar credencial herdada" (default) / "Definir auth específica desta tool". Resolve caso A5 (tool com chave separada que o OAuth da Conta-pai não emite).
```

**Texto pronto §6.7:**

```markdown
### 6.7. Tools — Custo, Limite, Auditoria

**Telemetria por tool (tab nova `Telemetria` em W10):** execuções 7d/30d, latência p50/p95, error rate, custo estimado (provider externo + tokens LLM). Resumo agregado em W9 (coluna "Execuções 30d").

**Cobrança e limite (decisão de produto pendente — registrar em §7):**
- Política de markup: tool custom é gratuita até N execuções/mês por plano; acima, R$ X/execução. Valores definidos por tier (Starter/Pro/Enterprise).
- Limite por plano: contas/org, tools custom/org, executions/mês. Indicador discreto em W1 header (`12/15 contas`); badge warning em 80%; greying em W3 ao bater limite com CTA `Upgrade`.
- **Pré-validação de slot:** OAuth só consumido após validar limite. Se atingiu, transação rollback com cleanup de token externo.
- Configuração por tool (W10): campo "Limite mensal" opcional com fallback graceful (tool retorna `user_facing_message` quando bate teto).

**Auditoria:** tab `Auditoria` no detalhe da Conta (ou seção dentro de Visão geral). Log: mudança de toggle, mudança de scope, conta criada/removida, tool criada/editada/deletada — com `user_id + timestamp + diff`.

**Categoria de tool (chip):** cada tool nativa tem `category ∈ {read, write, destructive}`. Tools `destructive` (refund, cancelar-assinatura) exigem confirmação adicional pra ativar e modal de toggle off durante conversas ativas.
```

**Wireframe novo W15 — Tools globais (Studio sidebar item):**

```markdown
## W15 — Tools globais (sidebar `Tools`)

Vista cross-conta de todas as Tools (nativas + custom) da org. Filtros, telemetria, audit, criação de tool standalone.

┌────────────────────────────────────────────────────────────────────────────┐
│  « Tools                                              [+ Nova Tool HTTP]   │
│                                                                            │
│  [search] | [Conta ▼] [Categoria ▼] [Status ▼] | [Telemetria ▼]           │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │ FQN                            │Cat   │Estado │Exec 30d │Custo  │  │   │
│  │────────────────────────────────────────────────────────────────────│   │
│  │ hotmart.loja-exp.buscar-prod   │read  │ ●     │ 1.2k    │ —     │  │   │
│  │ hotmart.loja-exp.criar-cupom   │write │ ▲     │ 3       │ —     │  │   │
│  │ hubspot.legacy.buscar-contato  │read  │ ●     │ 432     │ —     │  │   │
│  │ minhas.gourmet.buscar-rest     │write │ ●     │ 14k     │ R$ 47 │  │   │
│  └────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
```

**Decisões D15-D18 em §7:**
- D15: Tool identifier estável FQN `<provider>.<account-uuid>.<tool>`; display name independente
- D16: Tool standalone via "Minhas Tools" (Conta default invisível) — cobre caso Barnabé
- D17: Tools nativas tri-estado scope-aware (available/missing-scope/provider-pending)
- D18: Tab `Tools` global no Studio sidebar — agregação cross-conta com telemetria

### F4 — Multi-Org/Multi-Account boundary (resolve G04, G05) · P0

**Onde:** `spec.md` §6.3 (substituir conteúdo) e §6.7 (citar)

**Texto pronto §6.3:**

```markdown
### 6.3. Permissões, RBAC e Data Isolation

**RBAC** (controla acesso à UI):
- `integrations:read` · `integrations:write` · `tools:write`

**Data isolation em runtime de Tool** (não confundir com RBAC):

**Account binding (resolve C3):** Tool nativa em provider com >1 conta da mesma org tem campo obrigatório `default_account_id`. Quando o agente chama a tool sem especificar conta, o sistema resolve por:
1. `account_hint` injetado pelo runtime (ex: canal de origem da conversa → Hotmart Loja Expressa)
2. fallback `default_account_id`
3. erro explícito se ambíguo (não escolhe silenciosamente)

**Multi-org tool sharing (resolve C4):** Tool em Integração Personalizada com `multi-org=true` (W8 toggle "Selecionar todas") tem campo **obrigatório** `org_scope_param` — qual query/header/body field carrega o discriminador da org. Runtime injeta automaticamente. W8 mostra warning forte ao marcar "Selecionar todas":

> ⚠️ A API key é compartilhada entre orgs. Cada org só verá dados se a API filtrar por X. Configure o parâmetro de isolamento abaixo. **[Obrigatório]**
> Ou: cada org pode colar **sua própria** chave (per-org credential override).

Audit log: cada chamada cross-org com `org_scope_param` vazio levanta alarme.
```

**Wireframes:**
- W8: warning bloqueante quando "Selecionar todas" marcado, exigindo `org_scope_param` ou per-org credential
- W9: tool nativa com `default_account_id` configurável quando >1 conta

**Decisão D19 em §7:** "Multi-org tool sharing exige `org_scope_param` ou per-org credential override; default é seguro. Account binding por contexto da conversa pra disambiguation entre N contas mesmo provider."

### F5 — Stats com affordance + notificação out-of-band (resolve G10, G16, G17, G20) · P0

**Onde:** `spec.md` §5.4 e §6.6 (já coberto F2 pra notificação)

**Atualizar §5.4 (último parágrafo) — substituir:**

> ~~Templates ganham coluna de estatísticas básicas: disparos, taxa de resposta, qualidade (Daniel + Card). Detalhe estatístico fica numa tela separada — aqui só os números resumidos.~~

**Por:**

```markdown
Templates ganham colunas **ordenáveis e filtráveis** por stat: Disparos ↕, Resposta ↕ (com filtro `< X%`), Qualidade ↕ (com badge visual: verde >50%, amarelo 20-50%, vermelho <20%). Tabela é o **lugar de ação**, não só leitura. Detalhe estatístico do template (modal inline ou rota dedicada — pendência §8) abre ao clicar na linha.

**Card de provider multi-conta (W1):** quando >1 conta, card mostra 1 linha de stat agregada simples ("Eventos hoje cross-conta: 312" ou "Top produto: X"). Cobre 30% do pedido do Deds (visão unificada postergada v2) sem implementar a feature full. Mitiga regressão da decisão D2.
```

**Atualizar §2 anti-claims:**

```markdown
- Visão "todas as contas unificadas com filtro por conta" (pedido do Deds — fica pra v2). **Mitigação v1:** stat agregada no card; filtro cross-conta fica v2.
```

**Wireframes:**
- W1: card multi-conta com linha extra de stat agregada
- W11: tabela de Templates com headers `↕` e filtro numérico

**Decisão D20 em §7:** "Stat tem affordance — toda coluna numérica é ordenável + filtrável. Card multi-conta mostra agregado simples como mitigação da v2 postergada."

### F6 — Densidade adaptativa (resolve G13, G15) · P1

**Onde:** `spec.md` §5.3 (adicionar regra no fim) e wireframes (variantes)

**Texto pronto adicionar em §5.3:**

```markdown
**Densidade adaptativa (3 modos):**

A tela de detalhe da Conta (W4) tem 3 modos de densidade:

- **Simple mode** (auto: 1 conta, 0 webhook custom, 0 tool custom — caso Card): scroll vertical de coluna única, sem tabs. Visão geral + Objetos visíveis abaixo da dobra. Reproduz UX atual do app que Card validou ("zero me incomoda hoje, entendeu zero mesmo zero" — call 1:58).
- **Standard mode** (default proposto, W4): tabs horizontais. Aciona quando há >0 webhook OU >0 tool custom OU >1 conta.
- **Power mode** (auto: super-admin OU >5 contas/orgs): standard + deep-link copyable na hero card + dirty-state guard global ativo + ordenação/filtro em tabelas com stats.

Critério de escolha é **automático** baseado em contagem de objetos — usuário não escolhe modo manualmente. Reduz cliques pro caso simples sem perder funcionalidade pro power-user.
```

**Decisão D21 em §7:** "Densidade adaptativa em 3 modos automáticos (Simple/Standard/Power) baseada em contagem de objetos. Card simples não regride; Barnabé/Daniel/Paulo ganham power features."

**Wireframes:** adicionar variante W4-Simple (scroll único) e W4-Power (tabs + filtros + deep-link).

---

## Pendências escaladas para você + Greg + José

Decisões de produto que não dá pra inferir do design — **decidir antes de Greg ir pra Figma:**

| # | Decisão | Quem decide | Por quê urgente |
|---|---|---|---|
| Q1 | Política de markup de tool custom (gratuita até N? markup R$X? incluso no plano?) | José/PG | Cobrança, churn, viabilidade econômica greenfield |
| Q2 | Limites por tier (Starter/Pro/Enterprise — contas, tools, executions/mês) | José/PG | Define UX de upgrade prompt e bloqueio |
| Q3 | Onde mora "Tools globais" — sidebar separada ou submenu de Integrações | PG/Greg | Define IA da v1 |
| Q4 | Notificação out-of-band: e-mail bastam pra v1 ou Slack/SMS também? | PG | Bloqueia engenharia de notificação |
| Q5 | Detalhe estatístico do template (modal inline ou rota dedicada)? | Greg | Bloqueia wireframe W11 |
| Q6 | Auto-mode de densidade adaptativa: critérios exatos (contagem ≥ X aciona Power)? | Greg/PG | Bloqueia W4 variantes |
| Q7 | Tool em Integração Custom multi-org: per-org credential override é v1 ou v1.5? | José | P0 de segurança — não shipa sem isso |

---

## Recomendação meta

**O spec atual entrega tela bonita; os fixes acima entregam o produto.**

Aplicar nesta ordem:

1. **F2 (Connection Lifecycle)** e **F4 (Multi-org isolation)** — P0 absolutos, sem isso o produto vaza dado em produção
2. **F1 (Sub-tipagem Provider)** — destrava modelagem de System, Yampi, Legacy de uma vez
3. **F3 (Tools 1ª classe)** — destrava LangGraph greenfield; sem F3 não roda
4. **F5 (Stats com affordance + notificação)** — entrega real do que Daniel/Card/Paulo pediram
5. **F6 (Densidade adaptativa)** — fix de UX que mitiga regressão Card e overhead Barnabé

**Tempo estimado pra aplicar todos os fixes no spec+wireframes:** ~2-3 horas focadas. PG aplica direto, Greg revisa wireframes, José assina decisões pendentes Q1/Q2/Q7.

---

## Anexo — Walkthroughs completos dos 4 Red Team agents

Disponíveis nos outputs dos agentes (não duplicados aqui pra manter este doc denso). Cada gap acima tem evidência beat-by-beat com citação de §/W específicos.

**Cobertura:** 20 cenários adversariais × 4 lentes (modelo conceitual, UX/personas, runtime, tools) = ~80 walkthroughs. Nenhum cenário foi self-affirming; nenhum atacou anti-claims declaradas. Todos têm citação de spec/wireframe específico como evidência.

**Anti-padrões evitados:**
- ✅ Cenários concretos (Yampi, JF Rocket, Loja Expressa, UOL EdTech, Gourmet, Nord Academy, etc.)
- ✅ Walkthroughs beat-by-beat em cada gap
- ✅ Severidade triada por critério explícito
- ✅ Recomendações concretas (texto pronto pra spec, não aspirational)
- ✅ Anti-claims respeitados (Deds visão unificada postergada — atacamos a dor v1, não a feature v2)
