# Stress Test — P6: Logística com TI terceirizada (TransExpress)

**Agente:** adversarial Red Team
**Data:** 2026-05-11
**Cenários testados:** 5

## Sumário

- Passaram: 0 · Com dor: 1 · Quebraram: 4
- Total de gaps: **18** (P0: 7 · P1: 8 · P2: 3)

**Top 2 críticos:**
1. **P6-3 — Régua D+3 inflexível mesmo quando o boleto está em compensação no prazo do cliente:** TransExpress paga em D+30 do vencimento (política interna), mas o boleto sai com vencimento em 7 dias e a régua suspende em D+3 do vencimento. Resultado: cliente paga no prazo combinado com o financeiro dele e é suspenso. Não há ponto no fluxo pra negociar vencimento nem reconhecer um boleto "em compensação por política do cliente". W3-A.2 não tem nenhum mecanismo de extensão.
2. **P6-2 — SSO via WorkOS falha silenciosamente em browser corporativo com popup blocker estrito:** Wireframe W5-A mostra `[Continuar com Google Workspace]` mas não documenta o que acontece se o popup é bloqueado. Sem fallback documentado (full-page redirect, "abrir em nova aba"), nem mensagem de erro. Bloqueio total de SSO sem feedback = abandono ou ticket.

---

## Cenários

### P6-1: Procurement do TransExpress demora 12 dias — link expira, comercial AwSales demora a reenviar

**Seed original:** Comercial AwSales fechou venda com TransExpress (R$ 28k impl + R$ 7k/mês). Dispara convite pra `julia.lima@transexpress.com.br` (Tech Manager). Procurement do TransExpress trava o contrato por 12 dias. Julia só consegue clicar no link no dia 11. Link expira em 7 dias → tela `W11.1` mostra "expirado". Julia precisa contatar Bruno Costa (comercial AwSales) por e-mail. Bruno demora 2 dias úteis pra reenviar. Total perdido entre venda e ativação real: 13 dias.

**Walkthrough (beat-by-beat):**

1. **Beat 1 — Convite disparado dia 0:** Bruno Costa cria a org no admin, anexa o contrato, configura plano e impl, dispara convite pra `julia.lima@transexpress.com.br`. E-mail entra na inbox do trabalho dela.

2. **Beat 2 — Julia clica no dia 11:** Procurement do TransExpress finalmente liberou o contrato pra ela executar. Ela abre o e-mail (talvez tenha sido arquivado por ela ou caiu em spam por 11 dias) e clica no link. Browser corporativo abre.

3. **Beat 3 — `W11.1` (Link expirado) é renderizado:** Tela mostra "Convite expirado. O link expirou após 7 dias sem uso. Entre em contato com o time comercial AwSales pra receber um novo link." + card com Bruno Costa + e-mail.

4. **Beat 4 — Julia copia o e-mail e abre cliente de e-mail:** Não há botão "solicitar novo link" (anti-claim AC2). Ela copia o e-mail, abre Outlook, escreve manualmente "Olá Bruno, o link expirou…". Manda no fim do expediente, sexta-feira.

5. **Beat 5 — Bruno só vê na segunda-feira:** Bruno está em outras vendas; e-mail entra na fila dele. Lê só na terça (D+11+2 úteis = ~D+13 corridos). Vai ao admin, regenera convite, dispara de novo.

6. **Beat 6 — Julia recebe o novo e-mail e clica:** Ativa a org com sucesso, mas o tempo entre venda e ativação foi 13 dias. Implementação só começa a ser executada depois — TransExpress já estava cobrando a Awsales por delay.

**Gaps identificados:**

| # | Severidade | Gap | Evidência (beat) |
|---|---|---|---|
| G1 | **P0** | **Sem botão de "Solicitar novo link" mesmo informativo direto na tela `W11.1`** — o card só mostra nome+e-mail do Bruno; Julia tem que copiar manualmente e abrir cliente externo. Fricção alta num momento de frustração. Bastaria um `mailto:bruno.costa@awsales.io?subject=Convite expirado — TransExpress&body=Olá Bruno…` pré-preenchido. | Beat 4 |
| G2 | **P0** | **Sem SLA visível pro reenvio do convite no lado AwSales** — a régua de tempo de resposta do comercial NÃO é desenhada em lugar nenhum. Nem na tela do cliente ("você terá resposta em X horas úteis") nem no fluxo interno do Bruno (notificação prioritária, alerta, contador). | Beat 5 |
| G3 | **P1** | **7 dias é curto demais pra enterprise com procurement:** baseline de SUT herdado da Story 1 (Cenário 13) sem evidência empírica. Enterprise B2B com procurement típicamente leva 10-15 dias. Sugestão: tornar TTL configurável pelo comercial (padrão 7d, opção 14d/30d pra ciclos longos) ou alongar default pra 14d. | Beat 3 |
| G4 | **P1** | **Tela `W11.1` não diferencia "expirado por tempo" de "expirado por reenvio":** o copy é o mesmo. Se Julia recebe o e-mail antigo depois de Bruno ter reenviado, ela cai na mesma tela e fica confusa — ainda mais que vai existir um e-mail novo no Outlook. | Beat 3 |
| G5 | **P2** | **Nenhum lembrete automático pro cliente nos dias 5/6/7** — wireframe não mostra trigger de e-mail automático tipo "Seu convite expira em 2 dias". | Beat 1-3 |

**Status:** Quebrou. 5 gaps (2 P0, 2 P1, 1 P2).

**Questions abertas:**
- Comercial tem dashboard/alerta com convites expirados ainda não reenviados?
- O TTL deve ser configurável por org/segmento ou é fixo 7 dias?

---

### P6-2: TI terceirizada bloqueia popup do WorkOS — SSO falha silenciosamente

**Seed original:** Julia clica `[Continuar com Google]` no W5-A. Browser corporativo (Edge gerenciado por TI terceirizado) tem popup blocker estrito → janela OAuth nunca abre. Wireframe não mostra fallback. Julia fica olhando tela parada por 2 minutos antes de tentar de novo. Sem mensagem de erro → ticket.

**Walkthrough (beat-by-beat):**

1. **Beat 1 — Julia chega em `W5-A`:** Acabou de completar pagamento (cartão funcionou). Vê "Crie sua conta — Você está sendo cadastrado como julia.lima@transexpress.com.br" com botão `[Continuar com Google Workspace]` e `[Continuar com Microsoft]`. TransExpress usa Google Workspace, então ela escolhe Google.

2. **Beat 2 — Click — popup bloqueado:** Edge corporativo configurado pelo TI terceirizado (que é lento e não atende ticket) bloqueia popups por default. Click no botão dispara `window.open()` que o browser silenciosamente recusa. Nenhum diálogo aparece pra usuário. Apenas uma micro-notificação no canto superior do browser que Julia não percebe.

3. **Beat 3 — Tela do AwSales fica idêntica:** A página W5-A continua exatamente como estava. Não há loader. Não há toast. Não há mensagem "popup bloqueado". O botão `[Continuar com Google]` está clicável de novo, mas Julia não sabe se clicou ou não.

4. **Beat 4 — Julia clica de novo, mais 3 vezes:** Cada click dispara um popup que é bloqueado. Edge não notifica de novo (geralmente browsers notificam só uma vez). Julia tenta refresh.

5. **Beat 5 — Refresh derruba o estado (?):** Se o refresh quebrar o estado do fluxo de onboarding (não há evidência clara de retomada de `W5-A` no wireframe — só Cenário 25 e Q8 mencionam retomada após pagamento ou refresh, mas não de qual passo exato), Julia tem ainda mais confusão.

6. **Beat 6 — Julia tenta senha local em vez de SSO:** Funciona. Mas como TI terceirizado da TransExpress tem política "não criar senhas locais — use SSO sempre", Julia agora violou política interna. Vai precisar deletar a conta e refazer com SSO depois quando o TI desbloquear o popup. Mais 5 dias.

**Gaps identificados:**

| # | Severidade | Gap | Evidência (beat) |
|---|---|---|---|
| G6 | **P0** | **Sem detecção/mensagem de popup bloqueado em `W5-A`:** wireframe não tem estado "popup bloqueado, clique aqui pra abrir em nova aba" nem usa redirect full-page como alternativa (padrão moderno do WorkOS suporta `redirect_uri` direto sem popup). Falha silenciosa = UX terrível em corporativo. | Beat 2-4 |
| G7 | **P0** | **Sem opção de fallback OAuth via full-page redirect:** WorkOS suporta nativamente popup OU redirect. Wireframe assume popup. Em browser gerenciado com popup blocker estrito, deveria detectar e cair pra redirect automaticamente OU exibir "Seu browser bloqueou o popup — [Tentar em nova aba] ou [Continuar com redirect]". | Beat 2-3 |
| G8 | **P1** | **Sem mensagem educativa sobre como liberar popup:** copy auxiliar tipo "Se nada aconteceu ao clicar, seu browser pode estar bloqueando o popup. Como liberar: …" não existe. Cliente enterprise com TI terceirizada não consegue auto-resolver. | Beat 3-4 |
| G9 | **P1** | **Recovery após refresh em meio do fluxo de "criar conta" não é claro:** Cenário 25 fala em retomada, mas wireframe não desenha visualmente que ao voltar pro link, ela cai exatamente em W5-A (ou se cai em W6-A pulando autenticação). Não há indicação visual "você está retomando seu fluxo". | Beat 5 |
| G10 | **P2** | **Conflito entre escolha SSO local não documentada:** se Julia criar conta com senha local "por necessidade técnica" e depois quiser migrar pra SSO, não há fluxo desenhado pra migração ("vincular conta a SSO depois"). | Beat 6 |

**Status:** Quebrou. 5 gaps (2 P0, 2 P1, 1 P2).

**Questions abertas:**
- WorkOS SDK do Awsales usa popup ou redirect por default? Suporta detecção `popup === null`?
- Política de senha local pode ser desabilitada por org (forçar SSO)?

---

### P6-3: Boleto pra impl vence em 7 dias, TransExpress paga em D+30 do vencimento → SUSPENSO no prazo do cliente

**Seed original:** TransExpress paga boletos só em D+30 do vencimento (política financeira interna inflexível). Boleto liberado pelo comercial vence em 7 dias. Julia gera, paga em D+30 → SUSPENSA. Régua D+3 do doc v5 dispara automático.

**Walkthrough (beat-by-beat):**

1. **Beat 1 — Julia escolhe Boleto em `W3-A`:** Cartão do TransExpress tem limite 10k (insuficiente pra R$ 28k impl). PIX corporativo precisa de aprovação de 3 níveis no banco do TransExpress (impraticável). Boleto é o único caminho.

2. **Beat 2 — `W3-A.2` mostra boleto gerado:** "Vencimento 18/05/2026 (em 7 dias). Valor R$ 28.000,00." Linha digitável + PDF + linha "Importante: Seu acesso já foi liberado. Se o pagamento não for confirmado até o vencimento, sua conta será suspensa em D+3 (3 dias úteis após o vencimento). Régua: D-2 / D-1 / D / D+1 / D+2 / D+3 → suspensão automática."

3. **Beat 3 — Julia lê e tenta negociar inline:** Não há campo "Negociar vencimento" nem "Solicitar prazo estendido". Ela tem dois caminhos: continuar mesmo assim e tentar resolver com o financeiro do TransExpress (impossível, política é política), OU sair do fluxo e contatar Bruno por e-mail (igual P6-1, sem botão).

4. **Beat 4 — Julia segue o fluxo (continuar):** Clica `[Continuar →]`. Acesso liberado, ela completa o onboarding, convida o time, faz tudo. TransExpress paga em D+30 (15/06/2026, política rígida).

5. **Beat 5 — D = 18/05 chega, sem pagamento:** Régua dispara: D-2 (16/05) → notificação Admin. D-1 (17/05). D (18/05) → vencimento. D+1, D+2 → cobrança escalada. D+3 (21/05 útil) → **suspensão automática**.

6. **Beat 6 — TransExpress suspenso 25 dias antes de pagar:** A empresa está PAGANDO no prazo dela. 25 dias de operação parada. Ticket alto pro AwSales (perda de cliente enterprise, dano reputacional, escalonamento).

7. **Beat 7 — Bruno reverte manualmente — mas o fluxo não tem instrução clara:** Bruno precisa intervir antes do D+3, mas não há sinalização clara no admin pro time comercial saber que esse cliente específico negocia D+30. Tudo vira escalation por Slack.

**Gaps identificados:**

| # | Severidade | Gap | Evidência (beat) |
|---|---|---|---|
| G11 | **P0** | **Vencimento de 7 dias é hardcoded no boleto da impl, sem campo "Negociar prazo" no fluxo:** `W3-A.2` mostra "Vencimento em 7 dias" como fato consumado. Não há mecanismo do cliente solicitar 30/45 dias antes de gerar. Cliente enterprise com política rígida = suspenso garantido. | Beat 2-3 |
| G12 | **P0** | **Sem flag/configuração "boleto com prazo estendido" no admin pro comercial:** quando Bruno cadastra a org, não há campo "prazo de boleto custom" (7d padrão, opção 15/30/45). Bruno tem que tratar tudo manualmente fora do sistema. | Beat 1 |
| G13 | **P0** | **Régua D+3 inflexível sem mecanismo de "snooze por negociação"** mesmo após escalation pro comercial: Bruno reverter manualmente exige intervenção operacional repetida. Bastaria um botão "Pausar régua até [data]" no admin. | Beat 6-7 |
| G14 | **P1** | **Wireframe não mostra contato comercial em `W3-A.2` ("Boleto gerado"):** mesmo aviso "Se pagamento não for confirmado…" não vincula a um caminho de ação. Se Julia perceber o conflito de prazo nesse ponto, ela não sabe como pedir mudança. | Beat 3 |
| G15 | **P1** | **Aviso da régua D+3 é apresentado tarde demais (depois do boleto gerado):** deveria ser exibido ANTES da geração do boleto, em `W3-A` (seleção de método), pra que o cliente saiba o que vai acontecer e decida com info completa. | Beat 1-2 |
| G16 | **P1** | **Sem sinalização visual no admin pro Bruno saber que TransExpress é "caso especial":** quando rola D-2/D-1, alerta vai genérico. Bruno não tem "tag" indicando "esse cliente tem política D+30". | Beat 5-7 |

**Status:** Quebrou catastroficamente. 6 gaps (3 P0, 3 P1).

**Questions abertas:**
- Vencimento de boleto deve ser configurável por org no admin?
- Régua D+3 deve ter snooze por org/AM?
- Existe campo "política de pagamento do cliente" no admin pra documentação?

---

### P6-4: Audit trail de Julia (que sumiu) — Bárbara entra 2 meses depois

**Seed original:** Julia pediu demissão sem aviso 2 meses após setup. Substituta Bárbara chega. TransExpress quer saber tudo que Julia fez. Story 2 Cenário 21 — inativação preserva histórico. Bárbara é convidada como Admin. Pra abrir audit trail de Julia (inativa), kebab da linha de Julia → "Visualizar" → modal abre. OK. Mas Bárbara não sabe que Julia existe na lista porque filtro default = ativos. Wireframe não desenha toggle "incluir inativos".

**Walkthrough (beat-by-beat):**

1. **Beat 1 — Bárbara aceita convite e loga:** Fluxo Persona B sem incidente. Cai em Dashboard (Admin tem permissão).

2. **Beat 2 — Bárbara vai em "Configurações → Team":** Tela `W3`. Vê a lista de membros, busca Julia.

3. **Beat 3 — Julia não aparece na lista:** Aqui há ambiguidade no wireframe `W3`. O exemplo mostrado inclui Lucas Reis com status `✕ Inativo`, o que SUGERE que inativos aparecem por default. Mas o filtro "[Status ▾]" não tem default explicitado — pode estar setado em "Ativos + Convites" ou "Todos". Bárbara digita "Julia" na busca.

4. **Beat 4 — Se filtro default = "Todos", Julia aparece com `✕ Inativa`:** OK, Bárbara clica em Visualizar. Modal `W5` abre. Vai até seção "Audit Trail". Filtra período "Últimos 90 dias" (porque Julia foi inativada há 2 meses). Filtra tipo de ação. Busca recurso.

5. **Beat 4-alt — Se filtro default = "Ativos", Julia NÃO aparece:** Bárbara busca "Julia" e a lista fica vazia. Não há mensagem "0 resultados pra ativos. Tentar com inativos?" nem toggle visível. Bárbara conclui que Julia "não existia" e abre ticket com AwSales.

6. **Beat 5 — Audit trail mostra ações até 2 meses atrás:** Pela story (Pendência 3), retenção é "5+ anos" mas é "definir em conjunto com jurídico". Sem definição firme, pode estar curta. Bárbara filtra "últimos 90 dias" — vê só primeiros 30 dias do trabalho dela. Pra cobrir os 60 dias inativa, tem que escolher "Customizado" e digitar data fim explícita.

7. **Beat 6 — Bárbara tenta exportar CSV:** Modal `W5` tem `[📥 Exportar CSV]`. Q8 diz que pra >10k linhas vai assíncrono. Julia foi power user — provavelmente >10k eventos. Onde Bárbara recebe o CSV? E-mail? Notificação in-app? Wireframe não mostra.

**Gaps identificados:**

| # | Severidade | Gap | Evidência (beat) |
|---|---|---|---|
| G17 | **P0** | **Filtro "Status" em `W3` (Team) não tem default explicitado nem toggle visível "incluir inativos":** A coluna Status mostra "Lucas Reis ✕ Inativo", sugerindo default = "Todos", mas nada confirma. Se default for "Ativos", Bárbara nem encontra Julia. Wireframe precisa: (a) explicitar default; (b) tornar toggle "Mostrar inativos" óbvio no nível da lista, não escondido no dropdown. | Beat 3-4 |
| G18 | **P1** | **Quando busca retorna 0 resultados, não há sugestão "Tentar incluir inativos?":** UX comum em listas filtradas. Empty state genérico vira beco sem saída pro caso de auditoria de quem saiu. | Beat 4-alt |
| G19 | **P1** | **Wireframe `W5` (Visualizar usuário) não mostra estado pra usuário INATIVO:** o exemplo mostra "Ana Cavalcante · ● Ativa · Gerente de Operações". Não há variante mostrando como fica visualmente quando o usuário é inativo (badge, cor, ações desabilitadas como "Editar função"). | Beat 4 |
| G20 | **P2** | **Sem onde recebe o CSV exportado (assíncrono):** Q8 fala em "notifica quando pronto" mas wireframe não desenha onde aparece a notificação nem se vai pro e-mail ou só in-app. Bárbara pode achar que o export falhou. | Beat 6 |

**Status:** Com dor moderada — fluxo passa se filtro default = "Todos", quebra se = "Ativos". 4 gaps (1 P0, 2 P1, 1 P2).

**Questions abertas:**
- Default do filtro Status em `W3` é "Ativos" ou "Todos"?
- Onde Bárbara recebe a notificação do CSV assíncrono pronto?

---

### P6-5: Bárbara convida batch de 20 motoristas com 1 e-mail malformado no meio

**Seed original:** TransExpress quer convidar 20 motoristas. Bárbara cola lista do Excel. Um dos e-mails tem espaço no final (`motorista17@transexpress.com.br `). Cenário Q5 diz "chip não criado, erro inline". Mas e os 19 chips já criados? Bárbara não vê o erro porque está olhando o final da lista. Tenta enviar → bloqueio do submit. Mensagem clara sobre QUAL chip está malformado não existe.

**Walkthrough (beat-by-beat):**

1. **Beat 1 — Bárbara abre `W4` (Convidar membros):** Modal abre. Função escolhida: "Operador" (motoristas). Bárbara vai colar a lista de 20 do Excel.

2. **Beat 2 — Como funciona o paste de 20 e-mails de uma vez?** Wireframe diz "Digite e-mail e Enter…" implicando entrada por chip individual. Não documenta paste multi-linha. Bárbara vai ter que copiar cada um? Ou existe parse de cola? **Gap silencioso.**

3. **Beat 3 — Assumindo paste funciona com vírgula/quebra de linha:** 19 chips criados, 1 falha por causa do espaço final (`motorista17@transexpress.com.br `). Erro inline embaixo do input.

4. **Beat 4 — Bárbara não percebe o erro:** A lista tem ~10 linhas de chips quebrando. O erro inline está no fundo. Bárbara olha pra cima, conferindo os primeiros nomes. Vê 19 chips, conta visualmente, "acho que tá tudo".

5. **Beat 5 — Bárbara clica `[Enviar convites]`:** Comportamento ambíguo no wireframe:
   - **Opção A:** Botão é desabilitado quando há input não-parseado pendente. OK.
   - **Opção B:** Botão envia os 19 válidos e ignora o input pendente sem aviso. Bárbara não saberia que motorista17 não foi convidado até ele reclamar.
   - **Opção C:** Bloqueia o submit com modal "Há e-mail inválido no input — verifique antes de enviar". Acionável.
   - Wireframe não mostra qual é o comportamento real.

6. **Beat 6 — Mesmo após enviar, sem confirmação clara de "20 enviados":** Não há toast/modal pós-envio mostrando "19 convites enviados, 1 inválido foi ignorado". Bárbara assume sucesso silencioso.

7. **Beat 7 — Motorista17 nunca recebe convite:** Dois dias depois, supervisor de logística reclama "cadê fulano?". Bárbara volta no Team, vê 19 com "Convite enviado", percebe falta o 17.

8. **Beat 8 — Bárbara reenvia individualmente:** OK, mas processo manual desnecessário. Tempo perdido + ruído operacional.

**Gaps identificados:**

| # | Severidade | Gap | Evidência (beat) |
|---|---|---|---|
| G21 | **P0** | **Wireframe `W4` não documenta comportamento de paste multi-linha:** O input é "Digite e-mail e Enter". Não há indicação de como colar 20 e-mails do Excel (vírgula, ponto-e-vírgula, nova linha, tab). Comportamento real depende de implementação não-especificada. | Beat 2 |
| G22 | **P0** | **Sem trim automático de whitespace ao criar chip:** Q5 diz "e-mail malformado → chip não criado", mas a falha real é validação stricta sem trim. Trim de espaços antes da validação é prática padrão e teria evitado o problema 100%. | Beat 3 |
| G23 | **P1** | **Erro inline embaixo do input fica fácil de não ver com lista longa:** com 19 chips ocupando várias linhas, erro de uma linha abaixo do input vira ruído. Deveria haver sumário acima do botão de submit: "1 e-mail inválido — verifique antes de enviar". | Beat 4 |
| G24 | **P1** | **Comportamento do submit com input pendente não é definido:** wireframe não esclarece se botão é desabilitado, se ignora pendente, ou se bloqueia com modal. Cada uma das 3 opções tem implicação UX muito diferente. | Beat 5 |
| G25 | **P1** | **Sem confirmação pós-envio quantificada:** "X convites enviados, Y inválidos ignorados" não é desenhado. Toast/modal final ausente. | Beat 6 |

**Status:** Quebrou. 5 gaps (2 P0, 3 P1).

**Questions abertas:**
- Paste multi-linha é suportado oficialmente? Com qual separador?
- Trim automático de whitespace é aplicado antes de validação?

---

## Notas finais

- 4 dos 5 cenários quebraram catastroficamente (P6-1, P6-2, P6-3, P6-5). Apenas P6-4 passou com dor moderada (dependente de qual é o default do filtro Status).
- Perfil P6 expõe principalmente fricções de **enterprise com ciclos lentos**: procurement de 12 dias, TI terceirizada com policies rígidas, financeiro com prazos próprios, e operações de batch sem cuidado UX.
- 3 gaps P0 críticos giram em torno de **inflexibilidade temporal**: TTL de convite (7d), vencimento de boleto (7d) e régua de suspensão (D+3). Todos três deveriam ser configuráveis por org/contrato.
- 2 gaps P0 em SSO+popup expõem que o fluxo assume browser pessoal, não corporativo gerenciado.
- 1 gap P0 em paste/trim expõe que validação está sendo strict-first em vez de forgiving-first.

**Recomendações estratégicas:**
1. Tornar TTL de convite, vencimento de boleto e régua de suspensão **configuráveis no admin** pelo comercial (com defaults seguros).
2. Adicionar **fallback de full-page redirect** no SSO via WorkOS quando popup é bloqueado.
3. Aplicar **trim + lowercase** automático em todos os inputs de e-mail antes de validação.
4. Explicitar **comportamento de paste multi-linha** + sumário de erros acima do botão de submit.
5. Definir **default do filtro Status** em Team como "Ativos + Convites + Inativos (toggle visível)".
