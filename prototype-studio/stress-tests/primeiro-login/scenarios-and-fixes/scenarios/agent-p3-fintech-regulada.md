# Stress Test — P3: Fintech regulada (NeoBank Co.)

**Agente:** adversarial Red Team
**Data:** 2026-05-11
**Cenários testados:** 5
**Perfil:** NeoBank Co. — 200 FTE, fintech BACEN/LGPD/SOC2, procurement + InfoSec rígidas, ferramenta de cofre (1Password), SIEM (Splunk), políticas corporativas formalizadas. Comprador é CEO/COO; aprovação passa por InfoSec, Compliance, Procurement e DPO **ANTES** de operar.

## Sumário

- **Passaram:** 0
- **Com dor:** 1
- **Quebraram:** 4
- **Total de gaps:** 14 (**P0: 6** · **P1: 6** · **P2: 2**)

> Nota especial: pra P3, falhas em LGPD/BACEN/SOC2/InfoSec corporativa são gaps reais — não são reduzidas via AC2 ("API informativa") nem AC6 ("sem SCIM"). InfoSec da NeoBank não aceita "manual workaround com AM" como controle compensatório.

---

## Cenários

### P3-1: 2FA obrigatório org-wide ANTES do 1º acesso do Responsável (CEO Lucas)

**Seed original:** NeoBank é fintech regulada. Política InfoSec exige 2FA obrigatório em TODOS SaaS B2B (lei interna alinhada a circular BACEN 4.893 sobre cibersegurança). Comercial AwSales cadastrou no admin a flag "2FA org-wide = ON" antes mesmo do convite ser disparado. CEO Lucas (responsável) clica no link e... Dor: Story 1 Cenário 9.1 diz "flag ON força no próximo login dos membros" — mas e o PRÓPRIO responsável no 1º acesso?

**Walkthrough (beat-by-beat):**

1. Comercial AwSales cadastra NeoBank no admin com flag `2FA obrigatório` = ON na criação da org. Convite disparado pro CEO Lucas (lucas@neobank.co).
2. Lucas clica no link → cai em **W1-A · Tela de Boas-vindas**. Texto "Etapas: 1. Revisão · 2. Pagamento · 3. Configuração · 4. Convite". **Inconsistência #1**: a flag 2FA está ON mas a etapa 3 não diz "Configuração + 2FA obrigatório" — Lucas não tem sinalização visual de que o fluxo dele inclui 2FA mandatório.
3. Lucas passa por W2-A (revisão), W3-A (pagamento R$ 250k cartão corporativo da NeoBank). InfoSec exige aprovação de procurement antes de qualquer cobrança — Lucas avisa que vai usar PIX após procurement aprovar, mas o sistema é stateless após o pagamento.
4. Lucas chega em W5-A (criar conta — senha local porque SSO bloqueado, ver P3-3). Cria senha forte.
5. Lucas chega em W6-A (dados pessoais), W7-A (termo).
6. Lucas chega em **W8-A · 2FA**. Wireframe mostra textualmente: **`(Pular por agora)   [Ativar 2FA →]`**. **Gap crítico**: o botão "Pular por agora" está presente independentemente da flag `2FA obrigatório` da org. Story 1 Cenário 9.1 fala explicitamente do comportamento da flag em "próximo login dos **membros**" — silencia sobre o responsável no 1º acesso. Story 1 Cenário 9 diz "pode ativar agora ou pular pra ativar depois", sem ressalvar a flag.
7. Como W4-B (membro) tem uma versão condicional ("Não pode pular — sua organização exige 2FA"), mas W8-A (responsável) não tem essa versão condicional — Lucas **consegue clicar em "Pular por agora"**. Sistema deixa.
8. Lucas avança pra W9-A (convidar), W10-A (sucesso). **Lucas está logado SEM 2FA num SaaS que a política da NeoBank exige 2FA**.
9. NeoBank descobre numa auditoria interna do SOC2. CEO da NeoBank teve acesso por X dias sem 2FA → relatório de risco vai pra board, AwSales é classificado como "ferramenta não-conforme" e entra em remediação ou descontinuação.

**Gaps identificados:**

| # | Gap | Severidade | Evidência |
|---|---|---|---|
| G1 | W8-A não respeita flag `2FA obrigatório` da org pro Responsável no 1º acesso — apenas W4-B (membro) tem versão condicional | **P0** | W8-A linha 492: `(Pular por agora)   [Ativar 2FA →]` aparece sempre; story Cenário 9.1 só fala de membros |
| G2 | Story 1 Cenário 9 não tem variante "flag ON" pra Persona A — comportamento indefinido | **P0** | Story linhas 169-176 (Cenário 9) não distingue flag ON/OFF pro responsável |
| G3 | W1-A "Etapas" não sinaliza visualmente que 2FA é obrigatório quando flag ON — Lucas não consegue planejar (ter app authenticator instalado no celular antes de começar) | P1 | W1-A linha 43-46: lista 4 etapas estáticas |
| G4 | Não há campo no admin (story 2 está fora do escopo, mas a flag tem que vir de algum lugar) que distingue "flag ON apenas pra próximos logins" vs "flag ON inclui o responsável no 1º acesso" | P1 | Lacuna no contrato entre admin de comercial e flag da org |

**Status:** **quebrou** — CEO Lucas conclui o fluxo sem 2FA mesmo com flag ON. NeoBank classifica AwSales como não-conforme SOC2/BACEN.

**Questions abertas:**
- Decisão de produto: quando o comercial cadastra a org com flag 2FA ON, isso vale pro responsável também no 1º acesso? PG precisa decidir e fazer a story explicitar.
- W8-A precisa de variante "obrigatório" idêntica à W4-B (sem botão "Pular por agora").

---

### P3-2: Procurement exige invoice pré-pagamento + 5 e-mails específicos + matching contrato

**Seed original:** NeoBank tem procurement que exige invoice emitida ANTES do pagamento (cláusula contratual SOX-like). E invoice precisa chegar em 5 e-mails: financeiro, contábil, jurídico, compliance, controladoria interna. Risco: invoice emitida pós-pagamento → procurement rejeita.

**Walkthrough (beat-by-beat):**

1. Procurement da NeoBank assinou contrato com cláusula "invoice emitida em D-1 do pagamento; valor da invoice deve bater com PO interno; envio a 5 endereços formalizados em anexo".
2. Comercial AwSales cadastrou a NeoBank no admin com "emissão invoice pré-pagamento" marcada — mas isso é **invisível ao cliente**. Em W2-A · Revisão (linha 106), aparece textualmente `Emissão de invoice  Pré-pagamento`. **Bom — informação está exposta**. Lucas vê.
3. Lucas vai pra W3-A · Pagamento. Escolhe boleto pra acomodar prazo de procurement (em vez de cartão imediato).
4. Boleto gerado (W3-A.2). Acesso liberado imediatamente.
5. **Onde a invoice é emitida?** Nem wireframe nem story descrevem **trigger nem timing da invoice pré-pagamento**. Story 1 menciona "Emissão de invoice pré-pagamento" em W2-A mas nenhum AC descreve "invoice é emitida em D-X após boleto gerado" ou "invoice é emitida automaticamente em qual evento". **Lacuna crítica**: o cliente vê a flag mas não sabe **quando esperar a invoice chegar**, **como confirmar que foi emitida**, **e como receber em 5 e-mails**.
6. Lucas avança até W6-A. Encontra campo "🧾 Invoices — adicionar e-mails extras". **Limite de 10 e-mails** (Cenário 12). NeoBank precisa de 5 — tudo bem do ponto de vista do limite. Lucas adiciona financeiro@, contabil@, juridico@, compliance@, controladoria@.
7. **Mas:** Lucas não recebe confirmação de qual e-mail é o "principal" — wireframe linha 406 diz "Sua invoice é enviada pro e-mail principal. Adicione até 10 e-mails que também devem receber cada invoice". **Qual é o e-mail principal?** O de Lucas (lucas@neobank.co)? Lucas é o CEO — ele NÃO deve estar na lista de invoice (compliance interna proíbe CEO de receber documento fiscal individualmente). **Gap**: sem opção de remover o "principal", o CEO sempre recebe invoice.
8. Lucas finaliza o fluxo. **Não há tela nem evento que confirme "invoice emitida"** em lugar nenhum. Acesso ativo, mas procurement ainda não tem a invoice.
9. 3 dias depois, procurement cobra: "cadê a invoice?". Time AwSales emite a invoice manualmente (porque sistema não tem trigger automático claro). Invoice emitida **APÓS** pagamento via boleto — viola a cláusula "pré-pagamento" do contrato. NeoBank pode rejeitar o pagamento na controladoria.
10. **Adicional**: se procurement bater a invoice contra PO interno e o valor da invoice estiver com qualquer divergência (centavos por arredondamento de pro-rata) — rejeição automática. Sistema não tem matching PO→invoice.

**Gaps identificados:**

| # | Gap | Severidade | Evidência |
|---|---|---|---|
| G5 | Trigger, timing e mecanismo de emissão da invoice pré-pagamento não estão especificados na story 1 nem no wireframe — só a flag "Pré-pagamento" aparece em W2-A linha 106 | **P0** | Story 1 não tem AC que descreva quando a invoice é emitida; nenhum cenário Q* cobre |
| G6 | Cliente não tem confirmação visual em-fluxo de que invoice foi emitida (em qual etapa, com qual número, valor exato) | **P0** | W3-A, W3-A.1, W3-A.2 e W10-A não mostram invoice emitida |
| G7 | E-mail "principal" de invoice é o do responsável e não é editável/removível — CEO da NeoBank força violação de segregação interna (CEO recebendo doc fiscal individual) | P1 | W6-A linhas 405-411: "Sua invoice é enviada pro e-mail principal. Adicione até 10..." — principal é implícito |
| G8 | NeoBank não vê o admin AwSales — depende inteiramente de o comercial ter marcado a flag "pré-pagamento" corretamente. Sem mecanismo de auto-validação ou audit visível pro cliente | P1 | Story 1 menciona flag controlada por admin AwSales, sem path de validação cliente-side |
| G9 | Sem matching PO ↔ invoice — procurement precisa conciliar manualmente | P2 | Fora de escopo MVP, mas mata o deal P3 |

**Status:** **quebrou** — NeoBank tem cláusula contratual violada (invoice pós-pagamento via boleto), CEO recebe doc fiscal individual (violação de segregação interna), procurement sem visibilidade.

**Questions abertas:**
- PG: a invoice pré-pagamento é emitida em qual evento exato? Pelo comercial manualmente, pelo sistema automaticamente, no boleto gerado, no PIX confirmado?
- Story 1 precisa de cenário "Confirmação visual de invoice emitida no fluxo".
- Story 1 precisa rever W6-A pra permitir remover o e-mail principal OU explicitar que ele é apenas "cópia" e não destinatário fiscal.

---

### P3-3: SSO bloqueado pela InfoSec — força senha local com regex incompatível com cofre

**Seed original:** InfoSec da NeoBank desabilita SSO terceiro pra ferramentas não-aprovadas. Lucas só usa senha local. Mas política NeoBank exige senhas geradas pelo cofre 1Password com 24 chars + caracteres especiais únicos por SaaS. Risco: wireframe W5-A regra "Mín. 12 chars · 1 maiúscula · 1 número · 1 símbolo" — 1Password gera senha legítima mas se chars especiais fora do regex, sistema rejeita silenciosamente.

**Walkthrough (beat-by-beat):**

1. Lucas chega em W5-A. SSO está disponível na UI (botões Google/Microsoft), mas Lucas sabe que vai dar fail no IDP — InfoSec da NeoBank bloqueia AwSales como destination no Workspace/Entra. **Sem opção em-fluxo de declarar "não vou usar SSO, força senha"** — Lucas tenta SSO **uma vez** porque é curioso.
2. Click em "Continuar com Microsoft" → IDP rejeita autorização (consent denied por policy). Lucas é redirecionado de volta — **wireframe não cobre esse caminho**. Story Cenário 7 só cobre "e-mail divergente". E se o tenant Microsoft do cliente rejeita o app AwSales? Comportamento indefinido.
3. Lucas volta pra W5-A. Pula pra criar senha local. Abre 1Password. NeoBank tem template "SaaS — 24 chars com símbolos = `!@#$%^&*()_+-=[]{}|;:,.<>?/~`".
4. 1Password gera: `Xn4!{Bq#7@Mz[6$Pv}9~Lc&`. Lucas cola.
5. **Wireframe W5-A linha 357 só lista REGRAS de senha**, não revela o **regex** de validação. Sistema valida em 3 dimensões: mín 12 (✓), 1 maiúscula (✓), 1 número (✓), 1 símbolo. Mas **quais símbolos são aceitos**? Se o regex backend for `[!@#$%&*]` (comum em SaaS pra evitar problemas de escape em queries SQL/JSON), os chars `{`, `}`, `[`, `]`, `~`, `,`, `.`, `<`, `>`, `?`, `/`, `:`, `;`, `(`, `)`, `_`, `+`, `-`, `=`, `|` podem **não contar como "símbolo"** ou pior, podem ser **rejeitados** com erro genérico "senha não atende requisitos".
6. **Cenário tipo A**: sistema **rejeita silenciosamente** porque `{`, `[`, `~` não fazem parte do regex permitido. Lucas recebe "Senha não atende requisitos" — **sem dizer qual char falhou**. Lucas testa 3-4 variações, frustração escala. Vai abrir ticket com AwSales.
7. **Cenário tipo B (pior)**: sistema **aceita** a senha mas o storage faz HTML-escape ou sanitização agressiva. Lucas faz logout, tenta logar — senha "incorreta" porque o servidor armazenou versão escapada. **Conta inacessível.**
8. **Cenário tipo C**: Política da NeoBank exige troca de senha a cada 90 dias. Wireframe W2 "Meu perfil" linha 117 mostra "Alterar senha" mas não há story que descreva **expiração compulsória, histórico de senhas, rotação**. SaaS B2B regulado precisa disso pra SOC2.

**Gaps identificados:**

| # | Gap | Severidade | Evidência |
|---|---|---|---|
| G10 | Regex de "símbolo" aceito não está documentado no wireframe W5-A nem na story — risco de incompatibilidade silenciosa com cofres corporativos | **P0** | W5-A linha 357: "Mín. 12 chars · 1 maiúscula · 1 número · 1 símbolo" sem detalhe |
| G11 | Comportamento de IDP rejeitando authorize (não "e-mail divergente", mas "tenant policy denial") não está coberto no Cenário 7 — só "e-mail diferente" | P1 | Story 1 Cenário 7 linhas 155-160 |
| G12 | Sem expiração compulsória de senha, histórico de senhas anteriores e política de rotação — requisito básico SOC2/ISO 27001 pra ferramenta B2B regulada | **P0** | Story 1 + Story 2 não mencionam policy de senha além do regex inicial |
| G13 | Sem opção em-fluxo de "minha empresa não permite SSO" — UI sempre mostra SSO em destaque ("recomendado pra empresas"), pode causar fricção/distração | P2 | W5-A linhas 345-352 |

**Status:** **quebrou** — Lucas e VP financeira ficam travados na criação de senha por incompatibilidade silenciosa de regex; sem policy de rotação, qualquer auditoria interna sinaliza não-conformidade.

**Questions abertas:**
- Qual regex exato pra "símbolo" aceito? Documentar e expor (com lista visível tipo "Caracteres permitidos: !@#$%&*+-_=").
- Política de expiração compulsória de senha entra no MVP ou em story de Segurança separada?
- AwSales tem como detectar "tenant Microsoft rejeitou consent" e dar mensagem específica pro usuário?

---

### P3-4: Audit trail — InfoSec exige streaming SIEM imediato (<60s)

**Seed original:** NeoBank tem SIEM (Splunk) que ingere audit trails de todos SaaS via webhook. InfoSec exige CADA evento crítico (login, falha de login, mudança permissão, criação função, inativação) entregue ao SIEM em <60s. Story 2 lista o audit trail mas não fala de webhook/streaming. Wireframe W5 só mostra visualização in-app + export CSV manual.

**Walkthrough (beat-by-beat):**

1. NeoBank InfoSec onboarda AwSales no SIEM. Pede ao comercial AwSales: "preciso da URL do webhook do audit trail pra apontar pro nosso Splunk + schema dos eventos + chave de assinatura HMAC".
2. Comercial AwSales consulta a engenharia. **Story 2 Cenário 17-19 cobre apenas visualização in-app + filtros + export CSV manual**. Não há **AC** de:
   - Streaming via webhook
   - SIEM connector (Splunk, Datadog, Sentinel)
   - Schema CEF/LEEF/JSON canônico
   - Assinatura HMAC ou mTLS
   - Retry policy quando webhook do cliente falha
3. InfoSec reage: "sem streaming SIEM em <60s, AwSales não passa por avaliação de risco. Só aceitamos como controle compensatório CSV export **diário** se o time de Compliance assinar exceção — e nesse caso, AwSales tem que estar no inventário de 'ferramentas com risco aceito'".
4. Lucas (CEO) escala pro time AwSales. Comercial promete "no roadmap em 6 meses". NeoBank congela contrato em "POC restrito a 5 usuários, sem dados sensíveis".
5. **Em paralelo**: NeoBank tenta usar o **export CSV manual** (W5 linha 313 `[📥 Exportar CSV]`) pra alimentar Splunk via cron. Story 2 Q8 diz "exportação grande é assíncrona com janela de download 24h". **Mas:** sem API de export programática, sem assinatura criptográfica do CSV, sem schema versionado — Splunk não consegue parsear de forma confiável. AC6 ("sem SCIM/API programática") amplifica o problema.
6. **Pior caso**: Compliance da NeoBank precisa correlacionar evento de "login falhou" do AwSales com tentativa de phishing detectada em outra ferramenta. Sem streaming, correlação só acontece **24h depois** (após cron de CSV) — janela de detecção de incidente excede SLA BACEN (4h).
7. Retenção: Story 2 pendência #3 diz "retenção 5+ anos, definir com jurídico" — **assumption, não AC**. NeoBank pede compromisso contratual (não pendência).

**Gaps identificados:**

| # | Gap | Severidade | Evidência |
|---|---|---|---|
| G14 | Sem webhook/streaming de audit trail eventos pra SIEM externo — único caminho é visualização in-app + CSV manual | **P0** (pra P3 fintech) / P1 (pra outros) | Story 2 Cenários 17-19 + W5 só mostram in-app e CSV |
| G15 | Schema dos eventos não está documentado (campos canônicos, formato CEF/LEEF/JSON, versionamento) — cliente não consegue parsear de forma confiável | P1 | Story 2 Cenário 17 linhas 202-211: descrição em prosa, sem schema formal |
| G16 | Retenção do audit trail é **pendência** ("5+ anos a definir") em vez de **AC obrigatório** — vira risco contratual com clientes regulados que exigem compromisso formal | P1 | Story 2 Pendência #3 linha 497 |
| G17 | Sem API de export programática (AC6 explicitamente exclui) — cliente não automatiza ingestão | P2 | AC6 do SUT |

**Status:** **quebrou** — InfoSec da NeoBank bloqueia avaliação de risco; AwSales fica em "POC restrito sem dados sensíveis"; pra desbloquear, requer roadmap explícito de streaming + schema + retenção contratualizada.

**Questions abertas:**
- Webhook/streaming de audit trail entra no MVP, em uma story de "Compliance Integrations" pós-MVP, ou só sob demanda enterprise?
- Schema canônico dos eventos precisa ser desenhado antes do dev — quem define? (Sugestão: design técnico antes do split em sub-stories.)
- Retenção do audit trail vira AC com número fixo (ex: 5 anos por LGPD/BACEN) ou pendência permanente?

---

### P3-5: Funções customizadas — modelo CISO/CRO/DPO + Segregação de Funções BACEN

**Seed original:** NeoBank quer 4 funções custom: CISO (vê tudo, edita nada), CRO (só dashboard + audit trail), Compliance Officer (vê audit trail + bases + termo aceito), DPO (só dados pessoais + audit trail). Política BACEN exige segregação — Admin NÃO pode ver dados que o DPO vê e vice-versa. Risco: modelo "1 função por usuário" + funções com 50+ permissões mutuamente exclusivas → CISO real tem que ser Admin pra ver tudo, mas Admin também tem ESCRITA.

**Walkthrough (beat-by-beat):**

1. NeoBank designou 4 papéis humanos com segregação de funções BACEN:
   - **CISO** — auditoria contínua, **read-only** em TODOS os domínios (incluindo audit trail, funções, integrações, agentes, bases).
   - **CRO (Chief Risk Officer)** — apenas dashboard agregado + audit trail consolidado.
   - **Compliance Officer** — audit trail + bases (pra ver o que foi carregado pra IA) + visualização de termos aceitos.
   - **DPO** — **apenas dados pessoais** (visualizar usuários da org com PII) + audit trail.
2. Admin do tenant (Lucas) vai em "Configurações → Funções → Criar nova função". Acessa W9.
3. **CISO**: precisa de "Visualizar" em **todos os 14 domínios** listados em W9 (linhas 510-535). Lucas marca [✓] Visualizar em cada domínio. **Funciona em tese**, mas: **a permissão "Visualizar Funções e Permissões" (1/1) permite ver as funções, mas a permissão "Aprovar"/"Comentar"/"Encaminhar" em Aprovações não tem variante "Visualizar Aprovações dos OUTROS"** — domínios mistos não diferenciam "visualizar próprio" de "visualizar de toda a org". CISO precisa ver TUDO de TODO MUNDO, não só dos próprios recursos.
4. **Gap latente**: o catálogo de permissões agrupado por domínio (W5 linha 290-294) lista permissões como "Visualizar", "Criar", "Editar", "Aprovar", "Excluir" — mas **escopo é implícito**. Não há "Visualizar **própria** vs Visualizar **da org inteira**". Pra função CISO real, precisa de visibilidade horizontal completa.
5. **CRO**: "Dashboard (1/1)" tem apenas "Visualizar" — OK. Mas audit trail consolidado: Story 2 Cenário 17 mostra audit trail **por usuário** (W5 linha 295 "Audit Trail" dentro do "Visualizar usuário"). **Não há audit trail consolidado da org inteira** — gap pra CRO.
6. **Compliance Officer**: precisa ver "termo de uso aceito por cada usuário". Wireframe W5 mostra apenas dados básicos + permissões + audit trail individual. **Não há visualização de "termos aceitos por usuário"** como atributo navegável.
7. **DPO**: precisa de "Visualizar dados pessoais dos usuários da org" — mas **NÃO** Agentes, Bases, Disparos, etc. (princípio do menor privilégio LGPD). W9 lista "Usuários (0/1)" como **uma única permissão** ("Visualizar"). Marcar essa única check → DPO ganha visualização básica, MAS:
   - **DPO precisa ver dados sensíveis** (telefone, IP no audit trail, IDs externos) que estão hoje **acoplados** ao "Visualizar usuário". Admin também vê. Sem segregação real.
   - **Admin "visualiza tudo" também vê o que DPO vê** → BACEN não aceita. Não há "Admin com visualização de PII suprimida".
8. **1 função por usuário (Story 2 Cenário 20 + C4.3 do SUT)**: Lucas é CEO mas também é gerente de produto. Pra "ver tudo + editar agentes" tem que ser Admin. Mas Admin sob BACEN não pode acumular leitura de PII + escrita de produção. **Forçado a violar segregação**.
9. **Último admin (C4.4 / Cenário 22)**: NeoBank quer designar Lucas como CISO (read-only) e Beatriz como CFO/Admin. Mas se Beatriz sair de férias, ninguém pode inativar/criar funções → operação trava. **Sem conceito de "ao menos 2 admins" requerido** pra orgs reguladas.
10. **W9 sem busca/filtro de permissões** — com ~52 permissões (linha 508 "7/52 selecionadas"), pra criar a função "CISO" Lucas precisa rolar 14 domínios e marcar 14 "Visualizar". UX dolorida, propenso a erro humano (esquecer 1 = CISO cego pra 1 área = falha de auditoria).

**Gaps identificados:**

| # | Gap | Severidade | Evidência |
|---|---|---|---|
| G18 | Catálogo de permissões não tem distinção "visualizar próprio" vs "visualizar da org inteira" — impossível modelar CISO (visibilidade horizontal sem escrita) | **P0** | W9 linhas 510-535: permissões sem escopo de "horizontalidade" |
| G19 | Audit trail é **por usuário** apenas — não há audit trail consolidado da org inteira | **P0** | W5 linhas 273-316; Story 2 Cenários 17-19 todos em escopo individual |
| G20 | Não há "Visualizar termo aceito" como permissão/atributo navegável — Compliance Officer cego | P1 | Wireframe + story não cobrem |
| G21 | Admin com permissão de escrita NÃO pode ter visualização de PII suprimida — sem segregação Admin vs DPO | **P0** | C4.4 + 1 função por usuário + sem permission-level PII filtering |
| G22 | Modelo "1 função por usuário" (C4.3) impede composição de papéis necessária em orgs reguladas — força acúmulo indevido de privilégios | P1 | C4.3 do SUT |
| G23 | Sem requisito de "ao menos 2 admins" pra orgs reguladas — risco operacional se admin único sai de férias/desliga | P2 | C4.4 fala só do último admin não-inativável |
| G24 | W9 sem busca/filtro/template entre 52 permissões — UX dolorida pra orgs com muitas funções custom | P2 | W9 linhas 506-538 |

**Status:** **quebrou** — modelo de permissões + audit trail individual + 1-função-por-usuário não suporta segregação de funções BACEN. NeoBank precisaria de workarounds operacionais (ex: criar 4 usuários técnicos separados pra Lucas com 4 contas distintas) — fricção e risco. InfoSec recusa.

**Questions abertas:**
- O catálogo de permissões pode evoluir pra ter "escopo de visualização" (próprio vs org)? Quando?
- Audit trail consolidado da org inteira (cross-usuário) entra no MVP ou em story futura?
- Aceitar "1 usuário pode ter N funções" como evolução pós-MVP, ou manter 1-1 estritamente?
- Adicionar "PII filtering" como permissão separada (mascarar telefone/IP no visualizar usuário) pra Admins não-DPO?

---

## Endurecimento adicional — onde forcei a barra

Em todos 5 cenários, evitei contar como gap aquilo que cai em AC1-AC8 (mobile, API, edição de permissão individual, duplicar padrão, editar função de convite pendente, SCIM, cancelamento de plano, idioma). Onde a NeoBank exige conformidade regulatória (LGPD/BACEN/SOC2), tratei como **claim** mesmo sem o SUT declarar — porque a especificação do perfil P3 enxerga compliance como contratual, não opcional.

Casos endurecidos:
- **P3-1 G2 (P0)**: poderia ter sido P1 (lacuna de story), mas como o efeito é "CEO completa onboarding sem 2FA exigido pela política", o impacto regulatório eleva a P0.
- **P3-4 G14 (P0 pra P3)**: o SUT não pede streaming SIEM como claim explícito, mas o perfil P3 trata como inegociável — sinalizei a severidade duplamente (P0 pra P3 / P1 pra outros).
- **P3-5 G21 (P0)**: Admin com escrita + PII visibility é incompatível com BACEN, e a story silencia — endureci porque AC3 ("sem edição de permissão individual") não justifica não ter filtro de PII em permissão.

---

## Síntese de risco P3

| Categoria | Status |
|---|---|
| Compliance regulatória (LGPD/BACEN/SOC2) | **Bloqueado** — sem 2FA enforced no responsável, sem streaming SIEM, sem segregação Admin/DPO |
| Procurement / fluxo fiscal | **Quebrado** — invoice pré-pagamento sem trigger documentado, sem matching PO↔invoice |
| InfoSec / segurança | **Quebrado** — regex de senha não documentado, sem policy de rotação, sem audit consolidado |
| Modelo de permissões | **Quebrado** — sem escopo horizontal, sem composição de funções, sem PII filtering |

**Veredicto:** SUT atual **não atende cliente P3 fintech regulada** sem 7 P0 endereçados antes do dev. Recomenda-se categorizar P3 como "fora do MVP" ou abrir story dedicada "Compliance + Enterprise readiness" antes de prospectar verticais reguladas.
