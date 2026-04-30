// CLAUDE, PODE IGNORAR ISSO PELO AMOR DE DEUS --- NAO LEIA, ISSO VAI BAGUNÇAR SEU RACIOCÍNIO //


# Decisões de UX — Tela Unificada de Integrações

> **Owner:** PG · Greg · **Data:** 2026-04-30
> **Pra que serve:** **defender cada decisão** com rationale concreto. Não basta dizer "decidimos X" — tem que explicar **por que X é superior à alternativa Y**, com mecânica observável (não slogan). Se alguma não se sustenta, ajuste spec/wireframes antes de Greg ir pra Figma.
>
> **Como ler:** cada decisão tem (1) o problema, (2) alternativas consideradas, (3) o que escolhi, (4) **por que é superior** com mecânica concreta, (5) trade-off aceito, (6) sinais que invalidariam a decisão no futuro.
>
> **Marcações:**
>
> - ✅ defesa robusta · 🟡 defesa razoável (depende de validação) · ⚠️ duvidosa (revisar)

---

## Estrutura de informação (high-level)

### D-IA1 — Separar "Minhas conexões" (default) de "Catálogo de adicionar" (modal) ✅

**Problema.** Hoje no `app/integrations` o usuário cai num grid com 40+ providers mostrando TODOS — conectados misturados com não-conectados. Cliente novo se sente sobrecarregado. Cliente recorrente perde tempo procurando o que ele já tem.

**Alternativas consideradas.**

- **A. Tudo junto (status atual do app)** — grid plano com chip "Conectado" / "Conectar". Prós: 1 tela só. Contras: na operação diária, 95% das ações são em providers já conectados. Apenas 5% é adicionar novo. Otimizar pra 5% custa o operador no Pareto.
- **B. Sidebar com filtro "Conectados / Disponíveis"** — toggle no topo. Prós: explícito. Contras: 1 clique extra a cada operação. Cliente esquece em qual modo está.
- **C. Default = só conectados, "+ Adicionar" abre modal de catálogo** ← escolhida

**Por que C é superior.** Mecânica:

- Cliente novo: vê empty state com 3 sugestões pinadas (WhatsApp, Hotmart, HubSpot). Direto ao "+ Adicionar". Adiciona, fecha modal, volta pro Pareto.
- Cliente recorrente: abre tela, vê 9 conexões dele. Sem ruído de 30 providers que ele nunca vai usar.
- A escolha "modal pra adicionar" é o pattern dominante em SaaS do setor (Slack, Linear, Zapier, Make) — usuário já sabe ler.

**Trade-off.** Modal de adicionar é mais um nível de profundidade. Cliente vai descobrir "+ Adicionar" no primeiro uso, mas não é instantâneo se nunca usou ferramenta similar.

**Quando reconsiderar.** Se telemetria mostrar que >30% dos cliques abrem o modal e voltam sem adicionar nada (=cliente entrou pra "ver o que tem"), revisitar. Solução possível: empty state mais rico ou "highlight" temporário do botão adicionar.

---

### D-IA2 — Catálogo agrupado por `category`, não por `authType` ✅

**Problema.** O catálogo tem 26+ providers. Algum critério de agrupamento é necessário ou vira lista plana.

**Alternativas consideradas.**

- **A. Por `authType`** (OAuth / API key / Webhook only) — Prós: alinhado com fluxo de criação. Contras: usuário pensa "preciso de um CRM", não "preciso de OAuth". Mistura Hotmart com HubSpot na mesma seção (ambos OAuth) — agrupamento sem valor mental.
- **B. Por popularidade / "Recomendados pra você"** — Prós: discoverability. Contras: enviesa cedo, dificulta achar o nicho. Sem dados ainda pra calibrar.
- **C. 4 abas inventadas (Nativa / Canal / Evento Custom / Integração Custom)** — minha primeira proposta no rascunho. Prós: tipo da integração visível. Contras: **nomenclatura inventada por mim**, não casa com taxonomia real do dev (7 categories). Greg/Tury/Jordan ficariam com 2 vocabulários.
- **D. Filtros horizontais pelas 7 `category` reais (checkout/crm/form/meeting/members_area/marketplace/action)** ← escolhida

**Por que D é superior.** Mecânica:

- Vocabulário do operador casa com vocabulário do backend — zero tradução. Quando cliente pergunta "tem checkout?", operador filtra "Checkout" e responde direto.
- Quando dev adiciona um provider novo no seed-data, ele já cai na categoria certa sem precisar atualizar a UI.
- 7 categorias × ~3-5 providers cada = densidade visual ok, sem precisar paginar.

**Trade-off.** "Action" é categoria muito genérica (só Clint hoje). Pode crescer ou virar dump pra coisas que não cabem em outro lugar. **Aceitar e revisitar quando tiver 5+ providers em "action".**

**Quando reconsiderar.** Se chegar a 50+ providers totais, agrupar por categoria ainda funciona mas filtro vai precisar de busca obrigatória. Manter D com busca prominente cobre.

---

### D-IA3 — Tools tem rota dedicada na sidebar (não só dentro da conexão) ✅

**Problema.** Tools podem viver "dentro de uma conexão Hotmart" (subset) ou "ser vetor de execução da IA da org" (cross-cutting). Onde mora?

**Alternativas consideradas.**

- **A. Só dentro da conexão (tab Tools no W4)** — Prós: hierarquia clara. Contras: cliente com 5+ conexões perde rastreio. Pra ver "tudo que a IA pode fazer", tem que abrir 5 telas. Stress test G07 mostrou que LangGraph descobre tools globalmente — visão fragmentada esconde o real.
- **B. Só na sidebar global** — Prós: visão única. Contras: ao olhar o Hotmart, cliente quer ver "as tools dessa Hotmart" sem ir em outra tela. Subset por conexão também faz sentido.
- **C. Ambos** ← escolhida — tab Tools dentro da conexão (subset) + sidebar Tools global (cross-conexão)

**Por que C é superior.** Mecânica:

- A tab Tools dentro da conexão responde "**o que essa Hotmart pode fazer pela IA?**" — escopo da conexão.
- A sidebar Tools responde "**o que a IA da minha org pode fazer no total, e quem tá gastando?**" — escopo do org. Inclui telemetria, custo, audit que não cabem na conexão.
- Não é duplicação, é zoom diferente do mesmo dado (mesma `IntegrationToolAction` em 2 contextos).

**Trade-off.** 2 lugares onde Tool aparece = potencial confusão. Mitigado por: tab da conexão NÃO tem audit/cross-cutting (clareza de subset); sidebar mostra **chip da conexão-pai** em cada linha (clareza de origem).

**Quando reconsiderar.** Se telemetria mostrar que clientes quase nunca abrem a sidebar Tools (acessam só pela conexão), pode-se reduzir Sidebar a um link/breadcrumb sem rota dedicada.

---

### D-IA5 — Organização é contexto global do Studio, não filtro de tela ✅

**Problema.** Cliente Mamba é multi-org (UOL EdTech, JF Rocket, Nord Academy, etc.). Hoje no neo, a tela de Integrações tem dropdown `Org: UOL EdTech ▼` no topo — usuário troca org dentro de cada tela. O resto do produto também tem suas próprias maneiras de mudar contexto. **Inconsistência cara.**

**Alternativas consideradas.**

- **A. Filtro de org local em cada tela** (status atual neo) — Prós: usuário pode olhar Integrações de uma org sem trocar contexto global. Contras: cada tela do Studio tem seu próprio filtro — usuário não sabe se "está em UOL" significa o mesmo em Integrações, Conversas e Campanhas. Estado fragmentado entre telas.
- **B. Org como contexto global no menu lateral / header do Studio** ← escolhida — todo o Studio (Integrações, Conversas, Campanhas, Tools, etc.) reflete a org ativa selecionada no switcher global.

**Por que B é superior.** Mecânica:

- 1 fonte de verdade pra "qual org estou olhando" — switcher único no menu lateral / header.
- Telas internas não precisam de filtro próprio. Componente de tela mais leve, menos código duplicado.
- Cross-Studio coerente: usuário troca pra "JF Rocket" e o produto inteiro reflete — Integrações, Conversas, Campanhas, Métricas. Sem dúvida sobre "estou vendo dado de qual org?".
- Pattern dominante em SaaS multi-tenant moderno (Linear, Vercel, Stripe Dashboard) — usuário acostumado.
- Reduz superfície de bug: se o filtro local mente, dado vaza entre orgs visualmente. Contexto global elimina essa classe de bug.

**Trade-off.** Usuário que quer comparar 2 orgs (Integrações da UOL × da JF Rocket) tem que trocar contexto, voltar, comparar mental. **Aceitar — caso de uso super raro pra Pareto.** Mitigação eventual: power tool de "comparação cross-org" como feature futura, fora desta tela.

**Implicação cascata.** Por D-IA5 ser global do Studio (não decisão da tela de Integrações), eu **não desenho o switcher** aqui — só especifico que ele existe e que minhas telas não duplicam o filtro. Onde o switcher fica visualmente é decisão do design system do Studio.

**Quando reconsiderar.** Sem motivo específico. Decisão arquitetural do Studio inteiro — alterar exigiria refactor cross-produto.

---

### D-IA4 — WhatsApp tem layout próprio (não cabe no W4 com tabs) ✅

**Problema.** WhatsApp tem **3 níveis aninhados** (WABA → telefones → templates) e features cross-WABA (vars fixas, templates em massa). Forçar isso no pattern de tabs do W4 (Visão / Permissões / Objetos / Webhooks / Tools) ou amarra ou mente.

**Alternativas consideradas.**

- **A. Forçar no W4** — adicionar tab "Telefones" e "Templates" junto com Visão/Permissões/Objetos. Prós: 1 pattern só. Contras: WhatsApp só tem `ChannelAccount` no Messaging domain, não tem `IntegrationConnection` — vocabulário não bate. "Permissões" não faz sentido pra WhatsApp (Meta-managed). "Objetos" também não.
- **B. Layout próprio** ← escolhida

**Por que B é superior.** Mecânica:

- Backend já separou: WhatsApp é **Messaging domain**, demais providers são **Integration Hub**. UX seguir essa separação reflete a estrutura real.
- A complexidade interna do WABA (multi-telefone, multi-template, vars fixas globais, templates em massa) precisa de espaço próprio. Forçar em tabs no W4 ia exigir tabs aninhadas — pattern que confunde.
- O usuário entra pelo grid de Integrações (W1) e clica no card WhatsApp — a transição pro layout próprio é natural ("ah, esse é diferente"). Mantém entrada unificada sem amarrar saída.

**Trade-off.** 2 patterns de detalhe (W4 standard + W11 WhatsApp). Mitigado por: ambos compartilham o **mesmo header de conexão** (logo, nome, status, ações), e a divergência é só no corpo. Greg implementa header como componente compartilhado.

**Quando reconsiderar.** Se Email ou SMS chegarem com complexidade similar (múltiplos endpoints, templates), eles também ganham layout próprio — não merge com W4. Se complexidade for menor, podem cair no W4.

---

## Multi-conta

### D-MC1 — Múltiplas conexões agrupadas dentro do card do provider ✅

**Problema.** Cliente JF Rocket tem 3 contas Hotmart (JF Rocket, Loja Expressa, Caixa Preta). Como mostrar no grid?

**Alternativas consideradas.**

- **A. 3 cards Hotmart separados no grid** — Prós: cada um tem sua identidade visível. Contras: 1 cliente com 3 Hotmarts ocupa 3 slots. 1 cliente com 5 Hotmarts ocupa 5 slots. Pra cliente com 18 BMs (Deds/UOL EdTech) o grid vira lista densa. **Paulo: "fica poluído visualmente falando, três Hotmart aí".**
- **B. Visão "tudo unificado com filtros"** — caso do Deds. Prós: enterprise gosta. Contras: caso de uso do Deds, fora do Pareto. Stress test G16 já registrou.
- **C. 1 card Hotmart com lista das N conexões dentro** ← escolhida

**Por que C é superior.** Mecânica:

- Pareto: maioria dos clientes tem 1 conta por provider. Card único = grid limpo.
- Cliente com 3 Hotmarts: 1 card mostra "Hotmart · 3 conexões · JF Rocket ● · Loja Expressa ● · Caixa Preta ▲" — densidade adequada, sem perder identidade individual.
- Pattern já validado: WABA atual usa esse modelo (1 card "WhatsApp · 3 BMs"). Operador (Card, Paulo) já sabe ler.
- **Validação direta na call:** Card, Paulo, José, PG votaram em agrupar. Deds queria visão unificada — outlier (Greg classificou "avant-garde").

**Trade-off.** Pra cliente com **muitas** conexões num provider (>10 Hotmarts num cliente enterprise), o card do grid fica alto. Mitigação: card mostra os 3 primeiros + "ver mais 7", drilldown em W5 lista todas com filtros.

**Quando reconsiderar.** Se chegarmos em clientes com 50+ conexões num provider, o card vira inviável e a visão "lista plana cross-conta" do Deds passa a fazer sentido. Hoje fica v2.

---

### D-MC2 — Sidebar lateral só aparece quando >1 conexão 🟡 -- avaliar se será uma sidebar mesmo

**Problema.** No detalhe da conexão, mostrar a lista de conexões sempre ou só quando há mais de 1?

**Alternativas consideradas.**

- **A. Sempre** — Prós: consistência visual. Contras: cliente com 1 conexão Hotmart vê uma sidebar com 1 item — desperdício de espaço, ruído.
- **B. Só quando >1** ← escolhida

**Por que B é superior.** Mecânica:

- Pareto: maioria das conexões são únicas no provider. Sidebar fixa = ruído pro Pareto.
- Quando aparece: cliente entende imediatamente "ah, tenho mais de um, e posso navegar entre eles". Affordance só aparece quando tem função.

**Trade-off.** Layout muda entre "1 conexão" e "2 conexões" — pequena descontinuidade visual ao adicionar a 2ª. Mitigado por: ao adicionar, transição é animada (sidebar slide-in).

**Quando reconsiderar.** Não vejo motivo. Decisão simples e robusta.

---

### D-MC3 — Visão "tudo cross-conexão unificado" postergada pra v2 🟡

**Problema.** Deds (UOL EdTech, 18 BMs, 3 Hotmarts) pediu: "ver todos os templates de todas as wabas num lugar só, com filtros por conta/produto". É um caso de uso real e cresce com cliente enterprise.

**Alternativas consideradas.**

- **A. Implementar v1** — Prós: cobre Deds. Contras: stress test G16 — Deds é outlier por enquanto, custo eng não compensa pra clientes médios.
- **B. Postergar v2 sem mitigação** — Contras: Deds vai pedir de novo no primeiro mês de uso.
- **C. Postergar v2 com mitigação parcial** ← escolhida — card multi-conexão mostra **1 stat agregada** ("Eventos hoje cross-conexão: 312"). Cobre ~30% do pedido sem implementar a feature full.

**Por que C é superior.** Mecânica:

- Cliente médio (Card, Paulo) não pediu — não paga custo eng pra entregar pra eles.
- Deds vê o número agregado no card → reduz dor da fragmentação ("ah, sei o total, posso clicar pra detalhar"). Resolve 30% sem 100% do esforço.
- Mantém porta aberta pra v2 (visão unificada com filtros) sem committed.

**Trade-off.** Stat agregada não responde "quais templates de todas as wabas tem qualidade ALTA". Deds vai navegar 3 wabas pra responder. Aceitar e revisitar v2.

**Quando reconsiderar.** Se >2 clientes enterprise pedirem visão unificada nos primeiros 90 dias, promover pra v1.5.

---

## Card de provider (W1)

### D-CARD1 — Card sem descrição **genérica** (mantida) + D-CARD4 (apelido editável) ✅

**Problema.** Hoje no app cada card mostra "Capture transações e eventos do checkout Hotmart" — texto genérico que repete em todos os 11 checkouts. **Mas:** Paulo na call sugeriu que descrições poderiam ser "editáveis pela própria pessoa" — sutileza que a primeira versão da decisão perdeu.

**Alternativas consideradas.**

- **A. Manter descrição genérica** — Contras: Paulo: "acaba virando bagulho repetitivo".
- **B. Remover descrição** — Prós: card limpo. Contras: cliente perde affordance de "anotar contexto" sobre essa conexão específica ("Hotmart - cliente Acme - operação SP").
- **C. Remover genérica + adicionar campo apelido editável (D-CARD4)** ← escolhida

**Por que C é superior.** Mecânica:

- Sem descrição genérica → card limpo no Pareto (cliente que não preenche apelido tem card mínimo).
- Com apelido editável → cliente power (Paulo super-admin com 47 orgs Mamba) pode anotar "Loja Expressa - cliente JF - SP" embaixo do nome.
- Default vazio = invisível pro Pareto, útil pro super-admin. Sem regressão pra ninguém.
- Pattern Linear/Notion tem "description" customizável por instância (não só nome técnico).

**Trade-off.** Mais 1 campo no schema da Connection (`userDescription`, max 140 chars, opcional). Custo backend baixo.

**Quando reconsiderar.** Se telemetria mostrar que ninguém preenche, reduzir affordance (esconder no detail view). Provavelmente power user vai usar.

---

### D-CARD4 — Apelido editável por conexão (`userDescription`) ✅ — nova após Stress Test 2

**Problema.** Paulo na call: "esses descritivos podem ser de integrações personalizadas... menos personalizados, algo do tipo. Pra pessoa se orientar, mas é isso. Própria pessoa colocaria talvez. Inclusive dentro da própria integração." A primeira versão da D-CARD1 só removeu — perdeu a sutileza de "editável".

**Alternativas consideradas.**

- **A. Sem campo (D-CARD1 v1)** — Contras: cliente perde affordance de contexto.
- **B. Reaproveitar `name` (nome da conexão)** — Contras: nome técnico (ex: "Hotmart Loja Expressa") é diferente de contexto livre ("cliente JF - operação SP"). Misturar = ruído.
- **C. Campo `userDescription` opcional (max 140 chars)** ← escolhida

**Por que C é superior.** Mecânica:

- `name` continua sendo nome técnico curto (UNIQUE por org+provider).
- `userDescription` é texto livre, opcional, default vazio.
- Aparece em W1 card (linha extra abaixo do nome quando preenchido) e em W4 header (chip pequeno).
- Editável inline (clica e edita).

**Trade-off.** Mais 1 input no W13 (criar conexão). Mitigado: campo opcional, com placeholder "Apelido (opcional) — ex: cliente JF, operação SP".

**Quando reconsiderar.** Se virar lugar de spam ou texto longo (cliente cola JSON, link, etc.), endurecer validação ou limitar.

---

### D-CARD2 — Card multi-conexão tem 1 linha de stat agregada 🟡

**Problema.** Mitigação parcial pro Deds (D-MC3). Implementação: o que mostrar?

**Alternativas consideradas.**

- **A. Soma de eventos hoje** — Prós: número direto. Contras: pode ser zero em conexão recém-criada, não diferencia "tô calmo" de "tô morto".
- **B. Top objeto cross-conexão** (ex: "Top produto: Marco Zero") — Prós: insight. Contras: cálculo pesado, depende de dado de venda.
- **C. Soma + top, alternados/concatenados** ← escolhida

**Por que C é superior.** Mecânica:

- "Eventos hoje: 312 · Top: Marco Zero" — 2 dimensões no mesmo espaço, linha única. Operador pega na olhada.
- Diferencia conexão saudável ativa (eventos altos, top conhecido) de conexão zumbi (eventos = 0 ou top vazio).

**Trade-off.** Calcular "top objeto cross-conexão" exige join de IntegrationObject + agregação de eventos por external_id. **Pode ser caro pro backend** — depende de Tury validar viabilidade. Se inviável, fallback pra A (só soma).

**Quando reconsiderar.** Se backend não consegue fazer "top" performático, virar A. Se Deds pedir mais info ainda, promover v2.

⚠️ **Pendência:** validar com Tury se "top objeto cross-conexão" cabe no contrato de listagem ou se precisa endpoint próprio. Marcar como Q7 no spec se não estiver.

---

### D-CARD3 — Status agregado mostra o pior entre as N conexões ✅

**Problema.** Card multi-conexão tem 3 status individuais (●●▲ por exemplo). Como o card resume?

**Alternativas consideradas.**

- **A. Mostrar todos** — Prós: completo. Contras: já mostrado na linha das conexões.
- **B. Status médio** — Prós: equilíbrio. Contras: "média" entre healthy e error não tem sentido.
- **C. Pior status agregado** ← escolhida

**Por que C é superior.** Mecânica:

- Operador olha o grid pra encontrar problemas. "Pior" garante que conexão problemática nunca passa despercebida porque outra está ok.
- Cliente com 3 Hotmarts, 1 caída: card mostra ▲, atenção imediata.
- Pattern de "agregação pessimista" é padrão em monitoring (alertas Datadog, Grafana, etc.) — usuário acostumado.

**Trade-off.** Quando 1 conexão está ▲ entre 2 healthy, cliente vê o ▲ no card mas o agregado de eventos pode ser ok. Se ele só olha o card e ignora a linha das conexões, pensa que tudo está mal. **Mitigado:** chip no card mostra "▲ 2 de 3 ok" — o "2 de 3 ok" deixa explícito.

**Quando reconsiderar.** Não há motivo. Pattern testado em outros tools.

---

## Detalhe da conexão (W4/W5)

### D-DET1 — Tabs condicionais ao `authType` × `capabilities` ✅

**Problema.** Provider `webhook_only` (Hubla) não tem permissões/escopos pra mostrar. Provider `api_key` (DMG) não tem webhook bidirecional. Renderizar todas as tabs em vazio mente sobre o que tem.

**Alternativas consideradas.**

- **A. Sempre 5 tabs (Visão / Permissões / Objetos / Webhooks / Tools)** — Prós: consistência visual. Contras: tab vazia confunde ("cadê a info?"). Cliente clica e fica frustrado.
- **B. Tabs condicionais ao `authType` × `capabilities`** ← escolhida

**Por que B é superior.** Mecânica:

- Hubla (webhook_only): mostra Visão + Webhooks. **Não mostra Permissões** porque não há OAuth scope. **Não mostra Objetos** porque não há `supportsApiPull`.
- DMG (api_key + webhook): mostra Visão + Permissões (read-only chip) + Objetos + Tools.
- HubSpot (oauth + tudo): mostra todas as 5.
- Princípio: **cada tab existe se há algo real pra mostrar**. Tab vazia é dívida.

**Trade-off.** Layout muda entre providers. Mitigado: tab Visão é sempre a 1ª, padroniza entrada. Operador entende "menos abas = menos coisa nesse provider".

**Ajuste pós-Stress Test 2:** Daniel pediu literal: "consegui colocar escopo de escrita e webhook no mesmo aplicativo da Hubspot — gostaria que fosse parecido lá". Pra providers com **scopes-de-recv** (HubSpot, RD CRM, Pipedrive — `oauth_authorization_code` que recebe webhooks via OAuth scope), tabs **Permissões e Webhooks viram unificadas em uma tab "Configuração"** com seções colapsáveis. Pra providers que separam estritamente (Hotmart só `client_credentials` sem OAuth de leitura, ou `webhook_only` sem scope), tabs ficam separadas como antes.

**Quando reconsiderar.** Se clientes pedirem "tabs fantasma" pra entender o que TERIA se reconectasse com mais escopos, considerar tab desabilitada com tooltip "Reconecte pra liberar".

---

### D-DET2 — Densidade adaptativa em 3 modos automáticos (Simple/Standard/Power) ✅

**Problema.** Card (1 Hotmart, 0 tool custom) e Deds (18 BMs, 3 Hotmarts, 50+ tools) precisam de telas diferentes. Forçar 1 layout regride alguém.

**Alternativas consideradas.**

- **A. Layout único** — regride Card (5 tabs onde antes era scroll único) ou regride Deds (sem filtros/deep-link).
- **B. Toggle manual de densidade** — Prós: usuário controla. Contras: descobribilidade ruim — power user nem sempre acha o toggle. Card simples nem precisa decidir.
- **C. Detecção automática** ← escolhida — 3 modos baseados em contagem de objetos.

**Por que C é superior.** Mecânica:

- Card (1 conexão · 0 custom · não-canal) → modo **Simple**: scroll único, sem tabs, reproduz UX do app que ele já validou ("zero me incomoda").
- Daniel (10 templates, 1 BM) → modo **Standard**: tabs horizontais. Ganha sort/filter sem ter que pedir.
- Deds (3 Hotmarts, super-admin) → modo **Power**: tabs + deep-link copyable + dirty-state guard global + sort/filter em todas as tabelas.
- Critério é objetivo (contagens), não subjetivo. Sem decisão do usuário = sem fricção.

**Trade-off.** Critério "automático" pode pegar mal pra alguém na fronteira (4 conexões, role tools:write). **Mitigação:** Q6 do spec pede toggle manual disponível em settings como fallback. Critério auto é default; manual é escape.

**Quando reconsiderar.** Se telemetria mostrar usuários em Standard que querem Power frequentemente, baixar threshold pra acionar Power mais cedo.

---

### D-DET3 — Status interno × saúde × status Meta separados, não chip único ✅

**Problema.** Hoje no app o WhatsApp mostra "Status: Ativo" mesmo quando a BM da Meta caiu. Paulo: "ele não volta pro WhatsApp... fica com o status ativo ali em cima". Junta vários sinais num chip — confunde.

**Alternativas consideradas.**

- **A. Chip combinado único** — pega o "pior" dos 3. Prós: visual simples. Contras: cliente não sabe **o que** está mal. "Status: Erro" não diz "AWsales perdeu acesso" vs "Meta suspendeu".
- **B. 3 chips separados (status interno · saúde · status Meta)** ← escolhida

**Por que B é superior.** Mecânica:

- Status interno (`active`/`expired`/`revoked`/`error`) responde **"a credencial nossa funciona?"**.
- Saúde (`healthy`/`degraded`/`unreachable`) responde **"a API do provider está respondendo?"**.
- Status Meta (Approved/Rejected/Under review/Throttling) responde **"a Meta está deixando você usar?"**.
- Cada uma tem ação diferente: Reconectar / Esperar / Submeter pra revisão. Confundir = ação errada.

**Trade-off.** Mais ruído visual no header. Mitigado: chip secundário só aparece quando ≠ default. Conexão saudável tem só 1 chip "● Ativo". Conexão problema tem 2-3.

**Quando reconsiderar.** Sem motivo. Foi a queixa direta de Paulo na call — não quero reproduzir o bug.

---

## Tools

### D-TOOL1 — Tools convivem dentro da conexão E têm rota global ✅

Já argumentado em **D-IA3** acima.

---

### D-TOOL2 — Tool nativa tem toggle on/off (cliente decide se IA pode usar) ✅ -- Ao criar

**Problema.** Hotmart oferece tool `criar-cupom`. Cliente não quer que IA crie cupom sem aprovação. Hoje não há controle.

**Alternativas consideradas.**

- **A. Todas as tools nativas sempre ativas** — Prós: zero config. Contras: cliente perde controle. IA pode criar cupom em conversa onde não devia.
- **B. Cliente cria tool custom, ignora nativa** — Contras: redundante. Custom precisa endpoint manual quando o backend já tem.
- **C. Toggle on/off por tool nativa, default depende da categoria** ← escolhida

**Por que C é superior.** Mecânica:

- Tools `read` (busca, lista) — default ON. Inofensivas, ativar por default reduz fricção.
- Tools `write` (criar cupom, atualizar contato) — default OFF. Cliente decide ativar consciente.
- Tools `destructive` (refund, cancelar) — default OFF + modal de confirmação ao ativar.
- Decisão de categoria vem do backend (`actionCategory`), não inventada na UI.

**Trade-off.** Cliente que liga toda Hotmart espera que tudo funcione — descobre que tools `write` estão OFF e pode reclamar. Mitigado: na primeira ativação, banner de boas-vindas explica "Tools que modificam dados começam desativadas — ative o que IA pode usar".

**Quando reconsiderar.** Se telemetria mostrar que ninguém ativa tools `write` (cliente não descobre), considerar prompt mais ativo no detalhe da conexão.

---

### D-TOOL3 — Tools nativas tri-estado scope-aware ✅

**Problema.** Cliente conectou Hotmart com escopo `read` apenas. Tool nativa `criar-cupom` (write) não funciona — mas está listada. Cliente ativa, IA tenta usar, falha em produção.

**Alternativas consideradas.**

- **A. Mostrar todas as tools sempre, deixar falhar em runtime** — Contras: lead recebe "desculpa, não consegui criar cupom", reputação cai. Cliente acha que é bug nosso.
- **B. Esconder tools sem scope** — Prós: limpa. Contras: cliente não sabe que **poderia** ter `criar-cupom` se reconectasse com mais escopos. Perde discoverability.
- **C. Tri-estado: `available` / `unavailable_missing_scope` / `unavailable_provider_pending`** ← escolhida

**Por que C é superior.** Mecânica:

- `available` ●: cliente ativa/desativa livremente.
- `unavailable_missing_scope` ▲: greyed + texto "scope `write` não concedido" + CTA `Reconectar com escopos`. **Mostra possibilidade sem permitir falha**.
- `unavailable_provider_pending` ◐: badge "em breve". Reduz expectativa quando AwSales ainda não suporta.
- Discoverability + safety: cliente vê que existe, sabe como liberar, não consegue ativar errado.

**Trade-off.** Mais densidade visual em W9 (3 estados, não 2). Mitigado: legenda no rodapé da tabela explica.

**Quando reconsiderar.** Sem motivo. Pattern padrão em ferramentas com permissões (Notion, Figma).

---

### D-TOOL4 — Categoria de tool reduzida pra 3 visíveis (read / write / destructive) ✅

**Problema.** Backend tem 7 valores em `actionCategory` (`read`, `search`, `write`, `post_sale`, `support`, `sync`, `mutation`). Pra cliente decidir on/off + nível de gating, esses 7 viram ruído cognitivo.

**Alternativas consideradas.**

- **A. Mostrar os 7 do backend** — Prós: precisão. Contras: cliente leigo não diferencia `sync` de `mutation` rapidamente.
- **B. 3 visíveis (read / write / destructive)** ← escolhida — UI mapeia.

**Por que B é superior.** Mecânica:

- `read` = qualquer coisa que **só consulta** (`read`, `search`).
- `write` = qualquer coisa que **modifica** sem perda (`write`, `sync`, `post_sale`, `mutation` quando não-destrutivo).
- `destructive` = perda de dado / efeito irreversível (`mutation` quando destrói, alguns `post_sale` específicos).
- Mapping 7→3 fica numa tabela simples na UI. Cliente vê 3 chips coloridos — verde/amarelo/vermelho.
- Decisão de gating (modal de confirmação, default off) opera nas 3 — simples.

**Trade-off.** Perde nuance entre `sync` (atualiza dado) e `post_sale` (efeito comercial). Pra power user que quer ver, drawer de detalhe da tool mostra a categoria backend bruta.

**Quando reconsiderar.** Se cliente reclamar que precisa diferenciar `read` de `search` pra decidir on/off, considerar 4 níveis. Provavelmente não vai acontecer.

---

### D-TOOL5 — ~~Nova Tool HTTP em página única~~ **REVERTIDA pelo Stress Test 2**

> ⛔ **Decisão revertida em 2026-04-30 (segundo round).** Substituída por **D-TOOL6** abaixo. Razão: cliente cria tool às cegas, IA falha em produção com lead real. "Página única" foi resposta certa pra Barnabé reclamar de 3 telinhas, mas perdeu o ponto — Barnabé queria menos fricção pra criar **tool funcional**, não menos fricção em config. Pattern correto vem de Retool/Make/Zapier: split-pane com teste live obrigatório.

### D-TOOL6 — Nova Tool HTTP em split-pane com teste obrigatório ✅ (substitui D-TOOL5)

**Problema.** Cliente Barnabé cria tool HTTP custom pra Gourmet API. No spec D-TOOL5 anterior, página única com seções colapsáveis. **Cliente preenche endpoint, body, mapeamento — clica Criar — descobre erro só quando IA chama em produção com lead real.** Pattern de mercado (Retool, Make, Zapier, Postman) tem teste obrigatório antes de salvar.

**Alternativas consideradas.**

- **A. Página única com seções colapsáveis (D-TOOL5 anterior)** — Prós: tudo visível, sem wizard. Contras: cliente cria tool sem testar, IA quebra em produção. Tools que vão pra prod sem dry-run = "ship to prod direto" — pattern fraco vs iPaaS sério.
- **B. Wizard com teste no fim** — Prós: testa antes de salvar. Contras: regride pra "três telinhas pequenas" do Barnabé.
- **C. Split-pane (config + teste live ao lado)** ← escolhida — pattern Retool/Make/Postman

**Por que C é superior.** Mecânica:

- **Esquerda (config):** Identificação · Endpoint · Headers · Body · Mapeamento (scroll vertical, seções colapsáveis OK).
- **Direita (teste/preview):** input simulado · botão `[Run test]` · raw response JSON expandível · drag-to-map nos campos do response.
- **Salvar como rascunho (`draft`)** — sem teste obrigatório.
- **Activate exige teste verde** — pattern Zapier "no save without test pass".
- **Auto-mapping vira fluxo principal**, não CTA escondido: cliente roda → response volta → clica em campos pra mapear → mapping populado.
- **Versão visível no header:** "Editando v2 (v1 ativa, 1.247 execuções/30d)". Salvar = nova versão, não overwrite — proteção contra quebrar IA em produção.
- **cURL import já existia** — manter.

**Trade-off.** Split-pane exige redesign maior do W16. Custo eng: alto (componente de teste live é novo). Mitigado: pattern Retool/Postman tem componentes prontos no mercado pra inspirar.

**Quando reconsiderar.** Se telemetria mostrar que cliente sempre dispensa teste e salva direto, considerar tornar opcional. Provavelmente não vai acontecer — cliente sofisticado quer testar.

---

## Adicionar integração

### D-ADD1 — Filtro por `category` no topo, não 4 abas inventadas ✅

Já argumentado em **D-IA2** acima.

---

### D-ADD2 — 1 drawer com campos condicionais por `authType`, não 4 fluxos diferentes ✅

**Problema.** Cada `authType` precisa de inputs diferentes. Como organizar?

**Alternativas consideradas.**

- **A. 4 telas/drawers separados (1 por authType)** — Prós: cada um focado. Contras: 4× código UX. Cliente clica "+ Adicionar" → escolhe provider → caí num dos 4 drawers — decisão acumulada que não precisa.
- **B. 1 drawer com campos condicionais** ← escolhida

**Por que B é superior.** Mecânica:

- Cliente seleciona o provider no catálogo. UI sabe o `authType` daquele provider.
- Drawer abre com **só os campos que aquele authType precisa** — `oauth_authorization_code` mostra "[Conectar →]"; `api_key` mostra input + "[Conectar]"; `client_credentials` mostra 2 inputs + "[Testar][Conectar]"; `webhook_only` mostra só nome + "[Criar]".
- 1 drawer = 1 componente de código, 4 variantes de campo. Manutenção concentrada.

**Trade-off.** Drawer "muda" entre providers (campos somem/aparecem). Pode ser visualmente surpreendente. Mitigado: cada variante é simples (max 3-4 campos), transição rápida.

**Quando reconsiderar.** Se algum authType crescer em complexidade (ex: OAuth com PKCE custom), pode justificar drawer dedicado. Não é o caso hoje.

---

### D-ADD3 — Webhook secret aparece UMA VEZ na criação, com aviso explícito ✅

**Problema.** Provider `webhook_only` (Hubla) precisa de secret pro cliente colar lá. Backend só retorna na criação — não recupera depois.

**Alternativas consideradas.**

- **A. Mostrar normalmente, deixar cliente copiar quando quiser** — Contras: backend não suporta. Secret é hash não-recuperável após criação.
- **B. Secret sempre visível** — Contras: violação de princípio de menor exposição. Risco de leak.
- **C. Modal pós-criação UMA VEZ + aviso forte** ← escolhida

**Por que C é superior.** Mecânica:

- Após criar conexão Hubla: modal cheio de tela com URL + secret, copy buttons grandes, e aviso "⚠️ O secret só aparece agora. Salve num lugar seguro antes de fechar."
- Cliente é forçado a interagir (clicar [Salvei, fechar]).
- Se perder, fluxo é claro: deletar conexão e recriar (gera novo secret). Backend não tem regenerate-secret pra evitar duplicação acidental.

**Trade-off.** Cliente que perde o secret tem que recriar a conexão. **Aceitar — alinhamento com prática de segurança.**

**Quando reconsiderar.** Se backend adicionar endpoint `regenerate-secret` (sem deletar), UI ganha botão "Regenerar". Não muda decisão D-ADD3.

---

## Stats e observabilidade

### D-STAT1 — Stats têm affordance (sort + filter por coluna numérica) ✅

**Problema.** Daniel pediu stats inline em templates (disparos, taxa de resposta, qualidade). Implementação naïve = mostrar números na tabela. Mas Daniel vai querer **agir** — ordenar pelos piores, filtrar pelos abaixo de threshold.

**Alternativas consideradas.**

- **A. Stats só decoração (números na tabela, sem interação)** — Contras: Daniel teria que exportar Excel pra ordenar. Volta pra fluxo manual.
- **B. Cada stat numérica é ordenável + filtrável** ← escolhida

**Por que B é superior.** Mecânica:

- Coluna `Resposta` tem `↕` no header — clica ordena ASC/DESC.
- Filtro numérico inline ("Resposta < 20%") esconde tudo acima.
- Default sort: pelos piores (Resposta ASC) — mostra o que precisa de atenção primeiro.
- Daniel não exporta Excel. Aje na tabela.

**Trade-off.** Backend precisa expor stats já calculadas (não só os IDs). Endpoint de listagem fica mais pesado. **Mitigação:** stats agregadas (30d) podem vir cached, refresh em background.

**Quando reconsiderar.** Sem motivo. Daniel pediu agency, não decoração.

---

### D-STAT2 — Click em template/objeto abre drawer lateral, não nova tela ✅

**Problema.** Cliente quer detalhe estatístico de 1 template (gráfico hora-a-hora, lista de campanhas). Como mostrar?

**Alternativas consideradas.**

- **A. Modal centralizado** — Prós: foco. Contras: modal pesado em tabela rica = tira contexto da lista. Daniel quer comparar templates entre si.
- **B. Rota dedicada (`/templates/<id>`)** — Prós: URL compartilhável. Contras: tira completamente do contexto da lista. Daniel perde "qual eu tava comparando".
- **C. Drawer lateral (40% direita, slide-in)** ← escolhida

**Por que C é superior.** Mecânica:

- Drawer aparece à direita. Tabela à esquerda continua visível (60% da largura).
- Daniel clica numa linha → drawer abre. Clica em outra → drawer atualiza, mantém aberto. Pode comparar A→B→C sem fechar.
- URL compartilhável via query param `?template=<id>` — drawer hidrata pelo param.

**Trade-off.** Drawer limita largura do gráfico (40% da tela em desktop). Mobile vira modal centralizado (responsive).

**Quando reconsiderar.** Se cliente pedir análise super densa (heatmap por hora × dia, 7 dias × 24h), considerar promover pra rota dedicada. Drawer fica pra detalhe rápido.

---

## Estados e mensagens

### D-EST1 — Estados de conexão refletem `status` × `lastHealthStatus` real ✅

Já argumentado em **D-DET3** acima.

---

### D-EST2 — Banner forte quando conexão entra em `expired`/`revoked`/`error` ✅

**Problema.** Card pediu na call: "se a integração caiu, mano tem que ser um aviso muito forte".

**Alternativas consideradas.**

- **A. Chip discreto no header** — Contras: cliente pode não ver, conversão acumula erro silencioso.
- **B. Banner full-width vermelho no topo + CTA** ← escolhida

**Por que B é superior.** Mecânica:

- Banner ocupa atenção visual. Cliente que abriu a tela por outro motivo vê o problema imediato.
- CTA `[Reconectar agora]` no banner — 1 clique resolve.
- Mostra **última atividade antes da falha** + **eventos perdidos** (com idempotência do backend) — cliente entende o que aconteceu.

**Trade-off.** Visualmente "ruidoso" — proposital. Mitigado: banner some quando estado volta a `active`.

**Quando reconsiderar.** Sem motivo. Pedido direto de Card.

---

### D-EST3 — Notificação out-of-band (e-mail v1) ao entrar em estado de erro ✅

**Problema.** Cliente só descobre erro abrindo Studio. Para crítico (Stripe revoked, BM caída), atraso de horas/dias custa transação ativa.

**Alternativas consideradas.**

- **A. Sem notificação v1** — postergar. Contras: stress test marcou como P0. Reincide o problema atual.
- **B. E-mail + Slack + WhatsApp v1** — Prós: cobertura. Contras: Slack/WhatsApp dependem de integração do cliente. WhatsApp via nossa BM pode falhar paradoxalmente quando a BM dele caiu.
- **C. Só e-mail v1** ← escolhida — Slack/SMS v1.5.

**Por que C é superior.** Mecânica:

- E-mail é universal — todo cliente tem.
- Implementação trivial — Domain Notification consome `IntegrationConnectionStatusChanged`.
- Não depende de outra integração que pode estar falhando.
- Arquitetura extensível: adicionar Slack/WhatsApp/SMS depois sem refazer a notificação core.

**Trade-off.** Cliente pode demorar pra ver e-mail (caixa entupida). **Aceitar v1.** Mitigação: assunto do e-mail é forte ("⚠️ Integração X parou de funcionar — ação necessária").

**Quando reconsiderar.** Se >20% dos clientes não ler o e-mail dentro de 1h da queda, promover Slack/WhatsApp pra v1.5.

---

## UX puro

### D-UX1 — Dirty-state guard ao trocar contexto global (org) ou navegar ✅

**Problema.** Paulo (PG super-admin) edita webhook config, **troca de org no switcher global do Studio** sem salvar — perde alterações silenciosamente. Por D-IA5, troca de org muda contexto cross-Studio inteiro — perda é mais drástica que "sair da tela": **o produto inteiro recarrega**.

**Alternativas consideradas.**

- **A. Sem guard** — perde alterações ao trocar. Cliente xinga.
- **B. Auto-save** — Prós: nunca perde. Contras: salva config quebrada antes de validar. Backend sofre. Cliente não tem chance de descartar voluntariamente.
- **C. Modal de confirmação ao trocar org / navegar com dirty state** ← escolhida

**Por que C é superior.** Mecânica:

- Antes de trocar org no switcher global, modal: "Você tem alterações não salvas em [tela]. [Salvar e trocar] [Descartar e trocar] [Cancelar]".
- "Salvar e trocar" tenta save antes de mudar contexto; se save falha, cancela troca e fica na tela com erro.
- Indicador visual **no switcher de org global do Studio** (dot vermelho) quando há dirty state em **qualquer tela aberta**.
- Pattern padrão em editor (VSCode, Figma, Notion) — usuário acostumado.

**Implicação D-IA5.** Como org é contexto global, esse guard precisa ser **componente do Studio**, não da tela de Integrações. Esta tela só **declara** que tem dirty state via API global ("estou editando, me proteja"). O switcher consome esse sinal.

**Trade-off.** Cliente que sabe que quer descartar tem 1 clique extra. Aceitar.

**Quando reconsiderar.** Sem motivo. Bug direto reportado por Paulo.

---

### D-UX2 — Quota visível no header do W1 e W3 ✅

**Problema.** Cliente atinge limite do plano ao tentar adicionar 16ª conexão. Hoje não há indicação prévia — descobre pelo erro 422 depois de já consumir OAuth no provider.

**Alternativas consideradas.**

- **A. Sem indicação** — Contras: token OAuth órfão na Hotmart, cliente confuso.
- **B. Indicação no W3 (catálogo) só** — Contras: cliente entra no catálogo já comprometido, não enxergou no W1.
- **C. W1 header + W3 inline + bloqueio antes de OAuth** ← escolhida

**Por que C é superior.** Mecânica:

- W1 header: `Integrações · 9/15 conexões`. Cliente vê desde a tela inicial.
- Badge warning amarelo em 80% (12/15) — antes de doer.
- W3 catálogo: aviso inline "⚠️ Adicionar mais 1 fica no limite".
- Em 100%, botão Conectar fica greyed com tooltip "Limite atingido — fazer upgrade".
- **Pré-validação no backend:** OAuth só consumido após validar slot. Se atingiu limite, transação rollback antes de redirect — sem token órfão.

**Trade-off.** Numbers visíveis o tempo todo podem dar sensação de "limite apertado" quando cliente está em 5/15. Mitigado: badge só aparece em ≥80%.

**Quando reconsiderar.** Sem motivo.

---

## WhatsApp / WABA

### D-WA1 — WhatsApp tem layout próprio (não cabe no W4) ✅

Já argumentado em **D-IA4** acima.

---

### D-WA2 — Vars fixas + Templates em massa como atalhos cross-WABA no header ✅

**Problema.** Duas features que **transcendem uma WABA** (existem no nível do org). Onde botar?

**Alternativas consideradas.**

- **A. Cards no grid junto das WABAs** — Contras: misturam features com instâncias (WABA é dado, vars fixas é função). Confunde mental model.
- **B. Sub-rota separada (`/whatsapp/avancado`)** — Contras: descobribilidade ruim. Cliente não chega lá.
- **C. 2 cards de atalho horizontais no topo do W11** ← escolhida (e é o pattern atual do app que funciona)

**Por que C é superior.** Mecânica:

- Cards de atalho ocupam ~80px de altura, antes do grid de WABAs. Sempre visíveis sem scroll.
- Visual diferente do card de WABA — borda mais clara, ícone de função (não logo de plataforma). Não confunde com WABA.
- Pattern já validado pelo app atual — operadores acostumados.

**Trade-off.** Espaço vertical no header (perdemos ~80px que seria pra WABAs). Aceitar — header de atalho carrega valor.

**Quando reconsiderar.** Se chegarem 4+ atalhos cross-WABA, virar dropdown ou sub-menu. Hoje 2 cabem bem.

---

### D-WA3 — Caso 1 WABA + 1 telefone pula a lista, vai direto pro detalhe ✅

**Problema.** Cliente Card tem 1 WABA com 1 telefone. Forçar ele passar por uma lista com 1 item é regressão.

**Alternativas consideradas.**

- **A. Sempre mostra lista** — regride Card.
- **B. Skip da lista quando 1 elemento** ← escolhida

**Por que B é superior.** Mecânica:

- Cliente clica em "WhatsApp" no W1 → cai direto no W11b (detalhe da WABA única).
- Quando ele cria a 2ª WABA, próxima visita cai no W11 (lista) automaticamente.
- Mesmo princípio da densidade adaptativa do W4 — não regride o Pareto.

**Trade-off.** Cliente que quer **adicionar** uma 2ª WABA precisa achar o botão. Mitigado: header da W11b tem "[+ Adicionar conta]" sempre visível.

**Quando reconsiderar.** Sem motivo. Decisão simétrica à D-MC2 (sidebar só quando >1).

---

## Decisões adicionadas após Stress Test 2 (2026-04-30)

### D-IA6 — cmd+K do Studio declarado como dependência v1 ✅

**Problema.** Paulo (super-admin Mamba, 47 orgs) gasta 4-5 cliques pra navegar entre integrações cross-org. Daniel (CS 30+ clientes) sofre o mesmo. Pattern Linear/Notion/Stripe tem cmd+K cross-tudo — ausente no Studio sem declaração explícita.

**Alternativas consideradas.**

- **A. Não declarar (deixar pro design system decidir)** — Contras: Studio sai sem cmd+K, esta tela perde alavanca pra super-admin sem aviso.
- **B. Declarar como dependência v1** ← escolhida

**Por que B é superior.** Mecânica:

- Esta tela depende de cmd+K pra escalar pro super-admin. Implementação fica no design system, mas **declaração** força conversa cross-team.
- Conexões e Tools são tipos pesquisáveis no overlay global do Studio.
- Cross-org search no cmd+K resolve "buscar 'Hotmart Loja Expressa' em qualquer org" (Paulo).

**Trade-off.** Tela depende de feature externa. Mitigado: declaração explícita em §3 do spec + issue cross-team em Linear com owner do design system.

---

### D-IA7 — Wizard de onboarding com importação legacy + templates por vertical ✅

**Problema.** Empty state (W2) atual é passivo: copy + CTA + 3 sugestões hardcoded (WhatsApp, Hotmart, HubSpot). Pattern Linear/HubSpot tem wizard guiado de 3-4 passos com importação. AwSales vende "plug AWsales e ganha departamento" — empty state passivo entrega "ferramenta vazia, descubra".

**Alternativas consideradas.**

- **A. Manter empty state passivo (W2 atual)** — Contras: TTV ruim, cliente novo perde tempo escolhendo.
- **B. Wizard guiado de 3-4 passos** ← escolhida

**Por que B é superior.** Mecânica:

- Passo 1: "De onde você está vindo? AwSales legado / outra ferramenta / nada"
- Passo 2: "Qual seu vertical? Ed-tech / E-commerce / Service / SaaS / Outro" → gera kit recomendado
- Passo 3: Conectar primeira (com import se selecionou legacy)
- Passo 4: Ativar primeira IA (link pra Agentes)
- **Templates por vertical:** "Kit Ed-tech" = WhatsApp + Hotmart + Calendly + tool nativa "agendar especialista". 1 clique configura todas.

**Trade-off.** Wizard exige design + dev (não trivial). Mas é a maior alavanca de redução de TTV.

**Quando reconsiderar.** Se telemetria mostrar wizard com taxa alta de "skip", considerar simplificar.

---

### D-IA8 — Migração legacy é feature v1 (banner W1 + tela W18) ✅

**Problema.** 100% dos clientes Mamba atuais têm conexões no app legacy. Spec original ignorava. Big-bang silencioso = pânico operacional + cliente recria 12 conexões = re-auth Hotmart, re-auth HubSpot, re-cola webhooks no Hubla. Fricção altíssima.

**Alternativas consideradas.**

- **A. Big-bang sem migração** — Contras: cliente recria tudo. Inviável.
- **B. Coexistência indefinida (app + Studio)** — Contras: fragmenta operação, dado divergente.
- **C. Migração explícita com tela W18** ← escolhida

**Por que C é superior.** Mecânica:

- **Banner persistente em W1** quando há conexões legacy não-migradas: "Você tem 12 conexões na versão anterior. [Ver e migrar →]"
- **Tela W18 dedicada** lista as conexões legacy com status "Não migrada / Migrada / Falhou". Botão "Migrar X" por linha + "Migrar todas".
- **Migração mantém URL de webhook estável** (cliente Hubla não recola nada) — backend faz aliasing por baixo.
- Pra OAuth: oferece "manter token atual" se compatível, ou pede "re-autorizar" com 1 clique.

**Trade-off.** Custo eng grande no backend (alias de webhooks, refresh OAuth). Mas **não-fazer = não-migrar**. Não é UX opcional.

**Quando reconsiderar.** Sem motivo. Sem migração, Mamba não troca.

---

### D-EST4 — Banner de onboarding pós-criação ✅

**Problema.** Card conecta Hotmart, faz compra teste, vê "Eventos hoje: 0", não sabe se está OK. **Não diferencia "não chegou porque Hotmart não disparou" vs "chegou mas algo bloqueou nosso lado" vs "tem que configurar URL no painel Hotmart".** Abre ticket. Pattern recorrente em todo provider OAuth+webhook.

**Alternativas consideradas.**

- **A. Sem onboarding (status atual)** — Contras: tickets explodem.
- **B. Sandbox / test mode separado** — Prós: pattern Stripe. Contras: caro (ambiente staging duplo).
- **C. Banner de onboarding contextual + send test event** ← escolhida

**Por que C é superior.** Mecânica:

- Banner aparece quando `lastWebhookReceivedAt = null` E conexão tem `<24h`.
- Mostra: URL do webhook + secret prominentes (copy-button grande), checklist específico do provider, botão `[Enviar evento de teste]` (dispara payload sintético com flag `test=true`), status ao vivo "Aguardando primeiro evento real..." → "Recebido em X" quando chega.
- Banner some quando primeiro webhook real chega.
- Sem ambiente staging duplo — flag `test=true` no evento é suficiente.

**Trade-off.** Backend precisa aceitar payload sintético (não bloquear por validação OAuth do provider real). Custo médio.

**Quando reconsiderar.** Sem motivo. Resolve gap recorrente de TODA conexão OAuth+webhook (Hotmart, HubSpot, RD, Pipedrive, Calendly...).

---

### D-TOOL7 — Replicar tool em N orgs (paridade com Templates em massa) ✅

**Problema.** D-WA2 tem "Templates em massa" (replica template em N WABAs). **Tools não tem equivalente.** Super-admin Mamba (47 orgs) cria tool perfeita em org A, quer aplicar nas 46 outras. Sem replicação cross-org, recria 46x. Inviável.

**Alternativas consideradas.**

- **A. Sem replicação (status anterior)** — Contras: super-admin Mamba não escala.
- **B. Marketplace público de tools** — Prós: reuso amplo. Contras: anti-claim explícito do spec (v2). Complexidade alta.
- **C. Replicar entre orgs sob mesma conta-mãe (Mamba)** ← escolhida

**Por que C é superior.** Mecânica:

- Visível só pra super-admin. Em qualquer linha de tool **custom** no W15, drawer ganha botão `[Replicar em outras orgs]`.
- Modal análogo ao W11e-2 (Templates em massa): multi-select de orgs sob a mesma conta-mãe + modo ("Réplica independente" v1, ou "Manter sincronizado" v1.5) + confirmação.
- Backend cria N cópias com `organizationId` diferente, mesmo schema/endpoint.

**Trade-off.** Adiciona escopo. Backend precisa entender "tool template" vs "tool instance". Mas simétrico à decisão já tomada pra templates — se templates custou X de eng, tools custa similar.

**Quando reconsiderar.** Se nenhum cliente Mamba-style pedir, postergar v1.5.

---

### D-WA4 — Modo Simple-WhatsApp (densidade adaptativa também no header) ✅

**Problema.** D-DET2 tem 3 modos (Simple/Standard/Power) **só pro corpo** da tela. WhatsApp **sempre** cai em Standard (3 tabs Conta/Telefones/Templates) por D-WA1. **Card (1 BM, 1 telefone, status saudável) tem regressão visível** — modo Simple não cobre canais.

**Alternativas consideradas.**

- **A. Manter sem modo Simple no WhatsApp** — Contras: Card regride do app que ele aprovou ("zero me incomoda").
- **B. Eliminar tabs do WhatsApp em todos os casos** — Contras: Daniel/Deds power users perdem estrutura.
- **C. Densidade adaptativa também no WhatsApp (Simple-WhatsApp acionado por contagem)** ← escolhida

**Por que C é superior.** Mecânica:

- Aciona automaticamente quando: 1 WABA · 1 telefone · status saudável (interno=active, Meta!=Rejected) · 0 templates pendentes.
- Header compacto: nome WABA · status combinado (1 chip) · número de telefone visível.
- Sem 3 tabs (Conta · Telefones · Templates) — scroll único: lista compacta de templates com sort/filter + último evento + ações (Adicionar telefone / Configurar templates).
- BM ID e Business Portfolio ID em "ver mais" colapsado.
- Quando cliente adiciona 2º telefone OU 2ª WABA OU template fica pendente, transição automática pro modo Standard (W11b atual).

**Trade-off.** Daniel pediu BM ID + telefones inline no header — modo Simple-WhatsApp esconde Business Portfolio. Mitigado: Daniel raramente atende cliente Card-style (1 BM 1 telefone) — pra clientes com múltiplas BMs cai em Standard que mostra tudo.

**Quando reconsiderar.** Se Card-style começar a virar exceção (todos os clientes têm 2+ BMs), reduzir threshold de Simple ou virar opt-in.

---

### D-ADD4 — Affordance "+ Webhook customizado" e "+ Integração Customizada" no header W3 ✅

**Problema.** Q1 (webhook customizado avulso) e Q2 (tool standalone) eram pendências de modelagem backend. **Mas a UX não pode esperar decisão arquitetural** — caso real do app legacy regride sem caminho. Se backend resolve com provider seed, flag custom, ou tipo separado — UX é a mesma.

**Alternativas consideradas.**

- **A. Esperar Q1+Q2 fecharem antes de definir UX** — Contras: bloqueia v1 indefinidamente.
- **B. Affordances explícitas no header W3, independente do backend** ← escolhida

**Por que B é superior.** Mecânica:

- Header do W3 (catálogo) ganha 2 botões secundários sempre visíveis: `[+ Webhook customizado]` e `[+ Integração Customizada]`.
- `+ Webhook customizado` → drawer W13 variante webhook_only **sem provider catalogado**. Cliente dá nome, gera URL+secret, fim. Cobre Q1.
- `+ Integração Customizada` → drawer W13 variante api_key **sem provider catalogado**. Cliente dá nome, escolhe tipo de auth, cola credencial. Após criar, vai pro W4 e cria tool dentro (W16). Cobre Q2.
- Backend pode resolver de 3 maneiras diferentes — UX não muda.

**Trade-off.** Cliente novo pode confundir "Webhook customizado" com "conectar Hubla via webhook" (ambos webhook_only). Mitigado: copy explícita "Não tem o seu provider? Crie um webhook customizado pra mandar dados do seu sistema".

**Quando reconsiderar.** Sem motivo. Resolve P0 sem depender de decisão backend.

---

## Decisões revisitadas após Stress Test 2

⚠️ **3 decisões ajustadas/revertidas:**

- **D-TOOL5** REVERTIDA → substituída por D-TOOL6 (split-pane com teste obrigatório)
- **D-CARD1** AJUSTADA → mantém "sem descrição genérica" + adiciona D-CARD4 (apelido editável)
- **D-DET1** AJUSTADA → tabs Permissões+Webhooks unificadas em "Configuração" pra providers com scopes-de-recv (HubSpot/RD/Pipedrive)

---

## Resumo executivo

**32 decisões totais** após Stress Test 2 (era 25). Todas com defesa concreta (mecânica, não slogan).

**Distribuição por força:**

- 28 ✅ defesa robusta
- 3 🟡 defesa razoável (D-MC3, D-CARD2, D-IA7 wizard depende de telemetria de TTV)
- 1 ⛔ revertida (D-TOOL5 → D-TOOL6)

**Mudanças do Stress Test 2:**

- 7 decisões novas: D-IA6 (cmd+K), D-IA7 (wizard), D-IA8 (migração legacy), D-CARD4 (apelido), D-EST4 (banner onboarding), D-TOOL6 (split-pane substitui D-TOOL5), D-TOOL7 (replicar tools), D-WA4 (Simple-WhatsApp), D-ADD4 (affordances Q1/Q2)
- 3 decisões ajustadas: D-CARD1 (sutileza apelido), D-DET1 (HubSpot pattern juntar Permissões+Webhooks)
- 1 reversão: D-TOOL5 (página única → split-pane)

**Decisões sob risco se backend não cooperar:**

- D-CARD2 — depende de "top objeto cross-conexão" ser performático (Q7 pendência)
- D-WA1 (header WABA mostrar status Meta) — depende de Q6 (campo `providerStatus` existir)

**Decisões que mais geraram debate na call:**

- D-MC1 (multi-conta agrupada) — Deds queria diferente, todos os outros validaram
- D-DET3 (status separado) — Paulo apontou bug direto
- D-TOOL5 (página única) — Barnabé reclamou explicitamente

**Decisões que são respostas diretas a feedback de operador real:**

- D-CARD1 (sem descrição genérica) — Paulo
- D-DET3 (status separado) — Paulo
- D-STAT1 (stats com affordance) — Daniel
- D-STAT2 (drawer lateral) — Daniel
- D-EST2 (banner forte) — Card
- D-TOOL5 (página única tool) — Barnabé
- D-MC1 (multi-conta agrupada) — Card + Paulo + José + PG
- D-UX1 (dirty-state guard) — Paulo

**Decisões que vieram do stress test (não eram óbvias):**

- D-DET2 (densidade adaptativa) — sem isso, Card regrediria 1 clique
- D-IA3 (Tools rota dedicada) — sem isso, cliente com 5+ conexões perde rastreio
- D-TOOL3 (tri-estado scope-aware) — sem isso, cliente ativa tool que falha em produção
- D-UX2 (quota visível) — sem isso, OAuth queima antes do erro 422

**Decisões alinhadas com domain-contracts do dev (não inventei):**

- D-IA2 (filtro por category) — vocabulário backend
- D-DET1 (tabs condicionais) — `authType` × `capabilities` reais
- D-ADD2 (1 drawer condicional) — 4 authTypes reais
- D-ADD3 (webhook secret uma vez) — backend constraint
- D-WA1 (WhatsApp layout próprio) — boundary Messaging vs Integration Hub

**Decisões arquiteturais do Studio (fora desta tela mas que ela respeita):**

- D-IA5 (org como contexto global) — Studio inteiro, não só Integrações

