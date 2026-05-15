# Agent F3 — Red Team Multi-Org · Personas F7 + F8

**Data:** 2026-05-12
**SUT:** Cenários 24.1–24.6 (catálogo de funções padrão tenant + internas) — `stories/team-funcoes-config.md` v3.2
**Lentes:** 🔧 Funcional · ⚖️ Compliance · 🎯 UX
**Eixo adversarial:** quebrar o catálogo multi-org (holding consolidada + agência multi-conta)
**Status anti-claim:** AC1 (holding) e AC2 (agência) declaram cross-org como **fora de MVP**. Este relatório documenta gaps mesmo assim, marcados explicitamente como `📌 fora MVP — anti-claim AC1/AC2`. Mitigações UX que **não quebram AC1/AC2** ficam destacadas no final.

---

## PERSONA F7 — José Pereira · Sócio-Administrador · Grupo Pereira (Atacarejo)

**Contexto detalhado:**
- 58 anos, sócio majoritário do Grupo Pereira (5 CNPJs distintos, ARR consolidado R$ 180MM).
- Cada CNPJ é 1 org no AwSales — todas pagas, todas ativas, todas com José como `org-admin`.
- Plano consolidado: R$ 41k/mês fixo + variável (≈R$ 18k/mês em mensageria) = R$ 59k/mês.
- Tempo médio dele no AwSales: 12min/dia, geralmente 7h da manhã antes de ir pra rede.
- **Stack mental:** José pensa "Grupo Pereira" como UMA empresa, não como 5. Os 5 CNPJs existem por razão fiscal/tributária (Lucro Real vs Presumido vs Simples por unidade). Comercialmente é o mesmo grupo, mesmo CRM, mesmas campanhas, mesmo time.

| CNPJ | Org slug | ARR | Plano | MRR | Status hoje |
|---|---|---|---|---|---|
| Pereira Atacado LTDA | `pereira-atacado` | R$ 50MM | Enterprise | R$ 12k | Active |
| Pereira Varejo LTDA | `pereira-varejo` | R$ 30MM | Pro | R$ 4k | Active |
| Pereira Distrib LTDA | `pereira-distrib` | R$ 80MM | Enterprise | R$ 20k | Active |
| Pereira E-commerce LTDA | `pereira-ecommerce` | R$ 8MM | Starter | R$ 1k | **PAST_DUE** (8 dias) |
| Pereira Premium Foods LTDA | `pereira-premium` | R$ 12MM | Pro | R$ 4k | Active |

---

### BEAT 1 — Login e seleção inicial de org

José abre `studio.awsales.io` pelo Chrome do iPad às 6h53. Faz login com `jose@pereira.com.br`. WorkOS valida, 2FA via SMS.

**O que ele vê:** seletor de org modal — 5 cards listados alfabeticamente: Pereira Atacado / Distrib / E-commerce / Premium / Varejo. Cada card mostra nome + logo + plano. **Nada indica que `pereira-ecommerce` está PAST_DUE.** Nada indica MRR. Nada indica última visita. José clica em "Pereira Atacado" (a primeira, hábito).

- 🔧 Funcional: o seletor não diferencia status de billing entre orgs. Se José tivesse 1 org suspensa por falta de pagamento, ele só descobre depois de entrar. Selecionou Atacado mas o problema está na E-commerce.
- ⚖️ Compliance: ausente — PAST_DUE não é dado regulado. Mas ausência de sinal "sua E-commerce tá vencendo" é falha de notificação por dever de informar (CDC Art. 6º III "informação adequada e clara"). 📌 fora MVP — anti-claim AC1.
- 🎯 UX: cinco cards genéricos. Sem hierarquia, sem ordenação por uso, sem indicador de saúde. José trata as 5 orgs como UMA empresa e o produto força ele a ESCOLHER uma — atrito mental significativo no primeiro toque do dia.

---

### BEAT 2 — José quer MRR consolidado das 5 orgs

Quinta-feira, José vai a uma reunião com o CFO do grupo às 8h. Quer abrir o AwSales pra falar "tá custando X o mês inteiro do grupo". Entra na Pereira Atacado → Financeiro → vê R$ 12k. Anota. Volta ao seletor. Pereira Varejo → R$ 4k. Anota. Distrib → R$ 20k. E-commerce → **403/banner de bloqueio porque PAST_DUE**. Premium → R$ 4k. Trocou de org 5x, fez 5 navegações idênticas, copiou 4 números no Notes do iPad, somou na calculadora. **Tempo total: 8m23s.** Saiu pra reunião irritado.

- 🔧 Funcional: não existe `GET /studio/billing/summary?orgs=[]` consolidado. Cada org é uma chamada isolada, autenticada por sessão da org atual. Cenário 24.4 (carteira do AM) mostra que o modelo já entende "agregar MRR de N orgs" — mas é privilégio interno, não cliente. 📌 fora MVP — anti-claim AC1.
- ⚖️ Compliance: nenhum issue direto. Mas dado consolidado precisa ser tratado se sai do produto (planilhas Excel circulando com MRR + variável — risco trivial de leak).
- 🎯 UX: 8 minutos pra responder "quanto eu gasto?" é horrível. Pior: ação errada de troca-troca aumenta probabilidade de erro humano (ver Beat 4).

---

### BEAT 3 — Alerta de PAST_DUE da Pereira E-commerce não chegou no canal certo

`pereira-ecommerce` entrou em PAST_DUE há 8 dias. José tem `notification:read` em todas as 5 orgs. Cada org notifica **seu próprio Admin** — José É o Admin das 5. Recebeu 5 emails distintos (1 por org) só pra Pereira Atacado nas últimas 2 semanas (renovação Enterprise, cupom, audit export). **Email da E-commerce sobre PAST_DUE caiu no spam ou foi ignorado entre os 47 outros emails do AwSales/semana.** José só descobre no Beat 2.

- 🔧 Funcional: notificação é scoped por org (cenário 14 da Story 2 — `notification:resend` é por org). Não existe agregador "todas as orgs do mesmo membership-email mandam pra inbox unificada". 📌 fora MVP — anti-claim AC1.
- ⚖️ Compliance: PAST_DUE → suspensão em D+15 → dado pessoal de leads continua processado **sem base contratual válida**. LGPD Art. 7º: "tratamento somente nas hipóteses". Se a base é "execução de contrato" e o contrato está em mora não resolvida, a base se enfraquece. Risco real de ANPD. **P0 latente.**
- 🎯 UX: 5 inboxes (1 por org dentro do produto) + 1 email channel + 1 sistema bancário = 7 lugares pra acompanhar. José vai churnar mentalmente antes de churnar comercialmente.

---

### BEAT 4 — José acidentalmente dispara campanha na org errada

Domingo de manhã. José quer disparar uma push de "Promoção dia das mães" pra base do **varejo de bairro** (Pereira Varejo). Loga, seletor abre em Pereira Atacado (default = última usada = última que ele acessou na reunião do Beat 2). **Não nota** que está no Atacado. Vai em Campanhas → criar dispatch → escolhe a campanha "Mães 2026", base de leads completa, clica "Disparar em massa". Modal de confirmação aparece: "Confirmar disparo pra **18.420 leads** na campanha **Mães 2026**?". Não há indicação da **org** no modal. José confirma. **Disparou pra base B2B do atacadão** — leads que não esperavam comunicação de "varejo de bairro". Custou R$ 1.840 em mensageria. Gerou 312 opt-outs em 2h. Suporte detonado.

- 🔧 Funcional: modal de confirmação ⚡ (Cenário 24.1 marca `dispatch:schedule` como ação sensível, mas não obriga que org seja exibida no modal). Header tem badge de org, mas hábito visual ignora. Erro humano facilitado pela arquitetura.
- ⚖️ Compliance: opt-outs gerados por mensagem indevida → LGPD Art. 18 (direito de oposição) + CDC Art. 39 V (publicidade abusiva). Em volume, gatilha investigação. **P0.** Note: não é gap da AC1 porque o problema (modal sem org) é **dentro de 1 org** — é gap puro da UI de confirmação sensível.
- 🎯 UX: badge de org no header é insuficiente como ancoragem cognitiva pra ações destrutivas. José ficou furioso. Liga pro AM querendo desconto. **Risco de churn de R$ 41k/mês × 12 = R$ 492k ARR perdido** por causa de 1 falha de UI.

---

### BEAT 5 — José pede ao AM "me dá uma visão única, eu sou um grupo só"

Segunda-feira, ligação com Larissa (AM responsável pelas 5 orgs do Pereira). José: "olha, ou vocês me dão UMA tela pra ver tudo, ou eu vou pro Salesforce. Não dá pra trocar de org toda hora, tô perdendo dinheiro com erro". Larissa abre `adm.awsales › Minha Carteira` e **VÊ exatamente o dashboard consolidado que José pediu** — MRR somado dos 5, status de billing dos 5, alertas centralizados. **A AwSales TEM a feature. Só não pra cliente.**

- 🔧 Funcional: existe assimetria de capability — Cenário 24.4 dá ao AM agregação de MRR/churn/NPS da carteira; cliente B2B com N orgs do mesmo grupo econômico não tem equivalente. Backend tem o agregado, frontend não expõe. 📌 fora MVP — anti-claim AC1.
- ⚖️ Compliance: nenhum issue direto, mas é caso de **transparência assimétrica** — AwSales sabe mais sobre o grupo Pereira do que o próprio Pereira. Inversão de poder informacional em B2B levanta sobrancelha.
- 🎯 UX: a frustração do cliente é proporcional à percepção de "tem, mas é só pra vocês". Risco reputacional alto. AM tenta consolar com export Excel manual. Larissa vai gastar 40min/mês de tempo de AM fazendo o que devia ser self-service. Custo operacional escondido.

---

### BEAT 6 — Auditor externo do grupo pede log de "tudo que José fez nas 5 orgs"

Maio: auditoria fiscal Federal pede log de ações administrativas executadas por sócio (rastreio de instruções financeiras autorizadas). José fala "tá no AwSales, peguem com a Larissa". José abre 5 vezes Privacy & Compliance → Audit Trail, exporta CSV de cada uma. **Cada exportação dispara modal LGPD ⚡** (Cenário 24.1, `audit:financeiro:export`). Gera 5 hashes diferentes, 5 CSVs com `organization_id` distinto. José tem que concatenar em Excel. Já há indício de comportamento que viola a obrigação de manter integridade documental — quem garante que ele não escondeu uma linha?

- 🔧 Funcional: a Story 2 cobre export pessoal cross-org no Cenário 23 ("Meu Perfil → Minhas ações em todas as organizações" — linha 807 do doc). Mas isso é **escopo da Story 2**, está marcado como `[ ]` aberto. Não está implementado. 📌 fora MVP — anti-claim AC1.
- ⚖️ Compliance: integridade probatória de log fica frágil quando o cliente faz concatenação manual. Lei Geral de Processo Administrativo (Lei 9.784/99) + Receita Federal pedem cadeia de custódia documental. 5 CSVs separados + Excel cliente-side **quebra** essa cadeia. **P1 com componente legal real.**
- 🎯 UX: 5 modais LGPD + 5 exports + 5 hashes + Excel = experiência de "produto não confia em mim" repetida 5 vezes. Cliente fica com sensação ruim mesmo quando produto está protegendo ele.

---

## PERSONA F8 — Larissa Andrade · Operadora Sênior · Agência Mistura

**Contexto detalhado:**
- 31 anos, 4 anos na Agência Mistura. Gerencia 8 contas-cliente como operadora principal + suporte em outras 6.
- A Mistura tem 30 contratos ativos no AwSales (30 orgs separadas) — modelo "white-label operacional": cliente final é Admin, Mistura tem 2 operadores Operator (Larissa + Pedro).
- Cada conta cliente paga R$ 2.5k–8k/mês. ARR da Mistura via AwSales: R$ 1.8MM. Comissão da Mistura: 18% sobre o variável.
- Stack mental dela: **clientes são tabs**. Trabalha com 5–8 abas Chrome abertas em paralelo, troca de contexto a cada 8min em média.
- Já errou 3x em 2 anos disparando ação na org errada (incidentes documentados internamente). 2 viraram desconto pra cliente.

| Cliente (org) | Vertical | Plano | MRR |
|---|---|---|---|
| Bistrô Pasquale | Alimentos | Pro | R$ 4k |
| Escola Phoenix | Educação | Pro | R$ 4k |
| Clínica Vida+ | Saúde | Enterprise | R$ 12k |
| Petshop Doglândia | Pet | Starter | R$ 1k |
| Casa do Atleta | Sportwear | Pro | R$ 4k |
| Beleza Pura | Cosmético | Pro | R$ 4k |
| MoveOn Academia | Fitness | Starter | R$ 1k |
| Edu+ Cursos | Educação | Pro | R$ 4k |

---

### BEAT 1 — Larissa abre 5 abas, cada uma logada em uma org diferente

8h30 segunda. Larissa abre Chrome, restaura sessão de sexta. 5 abas: Bistrô / Phoenix / Vida+ / Pasquale / Edu+. Cada aba tem `studio.awsales.io/{org-slug}/dashboard`. Cookie de sessão. Aba 1 está em `pereira-... ` digo, `bistrô-pasquale`. Aba 2 está em `escola-phoenix`. Header de cada aba mostra **o mesmo logo do AwSales** + um badge pequeno com nome da org no canto superior esquerdo.

- 🔧 Funcional: sessão é compartilhada entre abas via cookie. Trocar org numa aba **propaga pras outras** ou cada aba mantém seu org-contexto via URL? Documento não especifica. Se cookie é dominante, trocar org na aba 1 vai "redirecionar" aba 2 ao recarregar = comportamento imprevisível. 📌 fora MVP — anti-claim AC2.
- ⚖️ Compliance: se cookie agrega org-state cross-tab, ação numa aba pode acabar autenticando ação na URL de outra → confusion attack interna (não é exploit externo, mas é erro operacional acionável). LGPD Art. 46 (segurança técnica adequada).
- 🎯 UX: 5 favicons idênticos + 5 badges minúsculos = identificação visual sub-ótima. Larissa usa **título da aba do Chrome** ("Studio · Bistrô Pasquale") como pista — mas se truncar fica "Studio · Bistr...".

---

### BEAT 2 — Larissa cola conteúdo do Bistrô na aba da Phoenix sem perceber

9h12. Cliente Bistrô Pasquale mandou texto novo via WhatsApp pra prompt do agente "Atendimento Reservas". Larissa Ctrl+C no WhatsApp, vai pra "aba do bistrô" (acha ela), Agentes → Atendimento Reservas → editar prompt → Ctrl+V. Salva. **Estava na aba da Escola Phoenix.** Acabou de sobrescrever o prompt do agente da escola (que dava info sobre matrículas) com texto sobre **reservas de mesa pro happy hour**. Próximos 47 leads da Phoenix recebem "olá! Quer reservar mesa pro happy hour?" quando perguntam sobre vestibular.

- 🔧 Funcional: `agent:edit_prompt` (Cenário 24.1) NÃO é marcado como ⚡ sensível. **Não tem modal de confirmação.** Salvar sobrescreve direto. Operator (Larissa) tem permissão. Não há sanity-check tipo "esse prompt mudou drasticamente o tom — confirmar?".
- ⚖️ Compliance: comunicação fora de propósito declarado → LGPD Art. 6º I (finalidade). Lead da Phoenix consentiu receber info de educação, não de bar. Risco direto. **P0.**
- 🎯 UX: catastrófico. **Esse é o cenário núcleo do gap AC2** — agência opera em N orgs com altíssimo risco de cross-contaminação. Custo da correção: Mistura perde o cliente Phoenix (R$ 4k/mês × 24m = R$ 96k LTV perdido).

---

### BEAT 3 — Pedro disparou massa pra cliente errado, Larissa investiga audit

13h. Pedro (parceiro de Larissa na Mistura) avisa: "acho que disparei a campanha de Black Friday do Petshop pro pessoal da Beleza Pura, mas não tenho certeza". Larissa abre Privacy & Compliance → Audit Trail → filtra por `actor: pedro@mistura.com.br`. **Resultado: vazio.** Por quê? Porque audit é scoped pela org atual (Beleza Pura). Pedro disparou estando logado em Beleza Pura → audit aparece SÓ na audit da Beleza Pura. Larissa precisa trocar pra cada uma das 8 orgs dela + Pedro fazer o mesmo nas 6 dele = 14 trocas pra encontrar o evento.

- 🔧 Funcional: não existe audit cross-org pra operador da agência. Cenário 23 (Meu Perfil → ações em todas) atende ao **usuário olhando suas próprias ações** — Larissa não pode olhar audit do Pedro cross-org. Isso é correto por compliance, mas operacionalmente bloqueia troubleshooting interno da agência. 📌 fora MVP — anti-claim AC2.
- ⚖️ Compliance: o desenho está bom (segregação). Mas no contexto agência, gera "buraco operacional" que aumenta tempo de descoberta de incidente. LGPD Art. 48 (comunicação de incidente em prazo razoável) — quanto maior o tempo de descoberta, maior risco de descumprimento.
- 🎯 UX: 14 trocas de org só pra rastrear 1 ação. Larissa desiste, escreve pro suporte AwSales, demora 2h pra ter resposta. Cliente Beleza Pura é notificado tarde.

---

### BEAT 4 — Convite do Pedro foi feito 30x (uma por org), Pedro sai da Mistura

Pedro pediu demissão. Larissa precisa revogar acesso dele em 30 orgs. **Cenário 24.2 — `membership:unlink` é por org.** Não existe "tirar Pedro de todas as orgs onde a Mistura opera". Larissa abre planilha interna (Notion da Mistura) com lista de orgs. Loga em cada uma, Configurações → Equipe → procura Pedro → Inativar. **Custo: 30 trocas de org × 2min/cada = 1h.** Em uma dessas 30, ela esquece. Pedro continua acessando Casa do Atleta por 11 dias até alguém perceber. Pedro nunca abusou, mas o risco residual é real.

- 🔧 Funcional: ausência de "agência como entidade" no modelo faz com que offboarding de operador da agência seja N operações independentes. AwSales não tem conceito de "tenant group" pra agência. 📌 fora MVP — anti-claim AC2.
- ⚖️ Compliance: ex-funcionário com acesso ativo 11 dias = LGPD Art. 46 + ANPD Resolução 2/2022 (gestão de acessos). **P1 grave.** Se Pedro extraía PII durante esses 11 dias → notificação de incidente obrigatória.
- 🎯 UX: Larissa esquecer é o **esperado**, não o excepcional. 30 ações repetitivas têm taxa de erro humano comprovada em literatura HCI (≥3% por ação). Aqui é 30 × 3% = ~60% de probabilidade de pelo menos 1 esquecimento.

---

### BEAT 5 — Larissa quer apresentar performance ao dono da Mistura

Sexta 18h. Reunião com o sócio da Mistura. Ele quer "performance do mês das 30 contas — quanto disparou, quanto converteu, quanto custou pra cliente, quanto a gente recebe". Larissa: planilha manual. Loga em 30 orgs, vai em Dashboard → captura métrica de disparos + conversão. **30 capturas de tela. Mais 30 capturas do Financeiro.** Junta tudo num Google Slides. **3h de trabalho.** Sócio olha 5min e fala "tá bom".

- 🔧 Funcional: ausência de dashboard "agência ↔ orgs operadas" — não existe esse conceito de entidade. Mistura quer ser **partner com painel próprio**, AwSales só tem **tenant**. 📌 fora MVP — anti-claim AC2.
- ⚖️ Compliance: nenhum issue direto. Mas 30 capturas circulando em PowerPoint = leak surface grande. Mistura não tem DLP. Risco de imagem com dados de cliente vazando.
- 🎯 UX: 3h/semana × 4 semanas × 12 meses = 144h/ano de tempo de Larissa em trabalho que devia ser SQL. R$ 50/h × 144 = R$ 7.2k/ano de custo escondido **por funcionário da agência**. Mistura tem 6 funcionários = R$ 43k/ano de desperdício escondido.

---

### BEAT 6 — Cliente Vida+ pede pra Mistura "sair" — Larissa precisa de offboarding clean

Cliente Clínica Vida+ decidiu internalizar marketing. Liga pra Mistura: "obrigada, vamos descer o degrau, contratei time interno". Mistura precisa: (a) entregar todos os artefatos (agentes, KB, campanhas, leads), (b) remover Larissa+Pedro da org, (c) garantir que Vida+ tem governança limpa pós-saída. **Catálogo atual:** Vida+ Admin precisa fazer `membership:unlink` em Larissa + Pedro. Mistura precisa exportar conversas/leads? `conversation:export` está bloqueado pra Operator (matriz Cenário 24.2). **Larissa não consegue extrair tudo o que produziu.** Vai pedir pro Admin do cliente. Cliente já tá frio, leva 9 dias pra fazer. Mistura perde know-how.

- 🔧 Funcional: matriz não distingue "Operator interno do cliente" vs "Operator da agência parceira". Larissa é Operator igual ao funcionário direto do cliente — não pode exportar conversas (matriz tem `—` pra Operator em `conversation:export`). Faz sentido pra cliente direto, ruim pra agência. 📌 fora MVP — anti-claim AC2.
- ⚖️ Compliance: zona cinzenta. **Quem é controlador dos dados produzidos pela campanha**? Cliente Vida+? Mistura como operadora? Não documentado. LGPD exige clareza de papéis (controlador vs operador) — Story 2 não endereça. **P1.**
- 🎯 UX: saída quebrada → review ruim → boca a boca negativo. Mistura é canal de aquisição da AwSales (vende AwSales pra clientes novos). Quebrar offboarding queima parceria. Risco de canal.

---

## Gap Register

| Gap ID | Persona | Lente | Descrição | Severidade | Status |
|---|---|---|---|---|---|
| **G7.1** | F7 | 🎯 | Seletor de org não mostra MRR / status de billing / última visita — escolha cega quando há >2 orgs | P2 | gap real (UX seletor, não cross-org) |
| **G7.2** | F7 | 🔧⚖️ | PAST_DUE notificado por email scoped a 1 org perde-se entre outras notificações do mesmo email; risco LGPD ao manter processamento sem base contratual válida | P0 latente | 📌 fora MVP — AC1 |
| **G7.3** | F7 | 🔧🎯 | Modal de confirmação ⚡ (`dispatch:schedule`) NÃO exibe nome da org — facilita disparo cross-org acidental | P0 | **gap real (dentro 1 org, UI sensível)** |
| **G7.4** | F7 | 🎯 | MRR/billing consolidado de holding requer 5 trocas de org + soma manual (8min para 5 orgs) | P1 | 📌 fora MVP — AC1 |
| **G7.5** | F7 | ⚖️🎯 | AwSales tem dashboard consolidado (Carteira do AM) mas não expõe pro cliente → assimetria informacional B2B | P1 | 📌 fora MVP — AC1 |
| **G7.6** | F7 | ⚖️ | Export de audit cross-org pra fins fiscais quebra cadeia de custódia (5 CSVs + Excel manual) — Cenário 23 está aberto `[ ]` | P1 | 📌 fora MVP — AC1 (mas linha 807 está aberta) |
| **G8.1** | F8 | 🔧🎯⚖️ | `agent:edit_prompt` NÃO está marcado ⚡ — operador da agência sobrescreve prompt na org errada (cross-contaminação) | **P0** | **gap real (catálogo 24.1 — falta ⚡)** |
| **G8.2** | F8 | 🔧 | Comportamento de sessão entre abas (cookie vs URL) não está especificado — trocar org numa aba pode propagar | P1 | gap real de spec (Cenário 19 do doc?) |
| **G8.3** | F8 | 🔧 | Audit trail scoped por org sem agregador "minhas ações em todas as orgs onde sou Operator" (Cenário 23 cobre `actor=self`, não troubleshooting de parceiro/colega) | P2 | 📌 fora MVP — AC2 |
| **G8.4** | F8 | ⚖️🔧 | Offboarding de funcionário da agência exige N×`membership:unlink` (1 por org) — taxa de esquecimento ~60% em 30 ops | **P0** | 📌 fora MVP — AC2 (mas Story 2 deveria endereçar batch unlink) |
| **G8.5** | F8 | 🎯 | Dashboard "agência ↔ clientes operados" não existe; 144h/ano/funcionário em coleta manual | P2 | 📌 fora MVP — AC2 |
| **G8.6** | F8 | ⚖️ | Papel agência (controlador vs operador LGPD) indefinido + Operator-agência não pode exportar conversas pra offboarding limpo | P1 | 📌 fora MVP — AC2 (mas tem componente jurídico real) |

**Gaps "reais" (não cobertos por AC1/AC2):** G7.1, **G7.3 (P0)**, **G8.1 (P0)**, G8.2.

---

## Recomendação — Mitigações UX sem quebrar AC1/AC2

Tudo abaixo é melhoria de **UX da troca de org / clareza de contexto** — não introduz consolidação cross-org (preserva AC1/AC2):

### Tier 1 (P0, entra no MVP)

1. **G7.3 + G8.1 — Modal ⚡ exibe org de forma estridente.** Toda confirmação de ação ⚡ (`dispatch:schedule`, `agent:publish`, `agent:edit_prompt`, `campaign:approve`, `cortex:reindex`, `subscription:write`, `legal_hold:write`, `audit:financeiro:export`, etc.) deve renderizar o nome da org **com cor da org + sigla curta** no topo do modal, em fonte ≥18pt. Exemplo:
   > **Você está em: [PEREIRA-ATACADO]**
   > Confirmar disparo pra 18.420 leads na campanha **Mães 2026**?
   Custo: pequeno (props no componente modal). Mata cross-contaminação em N persons.
2. **G8.1 — Marcar `agent:edit_prompt` como ⚡** no Cenário 24.1. Edição de prompt é a ação de mais alto risco operacional pra agência (sobrescreve comportamento de produção). Adicionar ⚡ obriga modal de confirmação + audit. Custo de produto: 0 (já é audited, só adiciona modal).
3. **Org color tag persistente** — cada org cliente recebe uma cor primária assignada no onboarding (palette de 12 cores). Header, breadcrumb, badge no modal, e até **borda da janela do navegador via theme-color** usam essa cor. Larissa identifica visualmente "tô na laranja (Phoenix) vs verde (Bistrô)" em 200ms vs ler texto em 2s.

### Tier 2 (entra Story 2 ou Story 3)

4. **Org switcher com health signals** — seletor de org mostra: nome + cor + última visita + status de billing (✓/⚠️/🔴 PAST_DUE) + qty de alertas pendentes. Não consolida nada — só **antecipa** sinal individual. Resolve G7.1 e dá ancoragem cognitiva.
5. **"Recentemente acessadas" — top 3 no seletor.** Não muda o modelo de isolamento. Apenas reduz tempo de seleção.
6. **Audit "Minhas ações em todas as organizações" (linha 807) — fechar `[ ]`.** Já está no escopo da Story 2, basta priorizar. Resolve G7.6 com integridade probatória (1 export hash-firmado vs 5 manuais).

### Tier 3 (proposta de feature nova, fora desta story — mas registrar)

7. **Confirmação extra após troca de org recente.** Se usuário trocou de org há <30s e está executando ação ⚡, modal usa cor de alerta + frase "Você trocou de org há poucos segundos — confirmar org atual antes de prosseguir?". Custo baixo, mitiga G7.3/G8.1 em cima.
8. **Batch unlink interno (admin-api)** — pra casos como offboarding de funcionário de agência, Super Admin pode operar via admin-api `DELETE /admin/users/{id}/memberships?orgs=[]`. Não é UI do cliente, mas dá ferramenta operacional ao Suporte L2 / AM pra resolver G8.4 via ticket. Custo: endpoint backend, sem UI.
9. **Sinalizar "Organização X tem N pendências"** no badge do menu pessoal (canto superior direito). Quando José abre o avatar dele, vê os 5 logos das orgs onde é membro + um badge vermelho na E-commerce indicando PAST_DUE. Notificação **personal**, não consolidada por org. Resolve G7.2 sem violar AC1.

### O que NÃO recomendar (preservar AC1/AC2)

- **Não** criar entidade "Grupo Econômico" ou "Tenant Group".
- **Não** criar dashboard agregado de MRR cross-org pro cliente.
- **Não** criar "agência" como tenant pai com 30 orgs filhas.

Isso entra em Story Enterprise Multi-Org (não existe ainda). Documentar G7.4/G7.5/G8.5/G8.6 como **input pro backlog** dessa story futura — não desfazer a decisão atual de AC1/AC2, mas registrar a dor pra quando o produto subir nesse degrau.

---

## Síntese

- **2 P0 reais que MERECEM entrar nesta Story 2:** G7.3 (modal sem org) + G8.1 (edit_prompt sem ⚡). Custo de implementação baixíssimo, evita incidente de comunicação fora de finalidade (LGPD).
- **6 gaps `fora MVP — AC1/AC2`** documentados pra alimentar futura Story Enterprise Multi-Org. Não invalidam AC1/AC2 hoje, mas mostram a **temperatura da dor** quando o cliente cresce (PG conhece pessoalmente o José Pereira do mundo real — não é hipotético).
- **3 mitigações de Tier 1 (org color + nome em modal ⚡ + edit_prompt como ⚡)** matam 80% do risco operacional sem mexer no modelo multi-tenant.
- AC1/AC2 **seguram** se o produto adicionar essas mitigações UX. Sem elas, AC1/AC2 vão segurar até o primeiro incidente de R$ 50k+ — daí o ticket vai pra Marcelo e a regra muda.
