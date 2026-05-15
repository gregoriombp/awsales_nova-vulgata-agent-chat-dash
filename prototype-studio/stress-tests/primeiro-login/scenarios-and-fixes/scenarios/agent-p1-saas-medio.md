# Stress Test — P1: SaaS médio (Fyntra Tecnologia)

**Agente:** adversarial Red Team
**Data:** 2026-05-11
**Cenários testados:** 5
**Perfil:** Fyntra Tecnologia, 50 FTE, CTO técnico (Felipe Rezende) · Plano Pro R$ 2.500/mês + Impl. R$ 12k

## Sumário

- Passaram: 0
- Passaram com dor: 1
- Quebraram: 4
- Total de gaps: 17 (P0: 6 · P1: 8 · P2: 3)

**Top 2 críticos:**
1. **G-P1-1.1 (P0):** 3DS challenge longo + abertura de aba paralela com PIX → Stripe pode confirmar 2 charges; W3-A.1 (PIX) e W3-A (cartão) não coordenam idempotência cross-method visível pro usuário. Cenário 7.2 da story C7.2 diz "retomada de fluxo não cobra de novo" mas o caso é simultaneidade, não retomada.
2. **G-P1-3.1 (P0):** Atalho "+ Criar nova função" no W9-A (convidar equipe do 1º acesso) descarta os 8 e-mails já digitados — wireframe não desenha retorno preservando estado, e Story 1 não faz referência cruzada à criação de função. W4 (modal de Configurações) diz "preferencialmente sem perder" mas no fluxo do 1º acesso isso some.

## Cenários

---

### P1-1: Pagamento misto + Stripe 3DS challenge + corrida com PIX (dupla cobrança potencial)

**Seed original:** Felipe Rezende, CTO da Fyntra (R$ 12k implementação + Plano Pro R$ 2.500/mês), seleciona cartão pra impl (parcela em 4x) e quer cadastrar OUTRO cartão pra recorrência do Plano (corporate da empresa). No 3DS challenge da 1ª cobrança a impressão digital biométrica do banco demora 47s; usuário acha que travou e abre nova aba, paga via PIX. Dor potencial: dupla cobrança (3DS conclui + PIX confirma) — Stripe gera 2 charges ou Cenário Q2 não cobre 3DS de fato.

**Walkthrough (beat-by-beat):**

1. **Setup:** Felipe abre o link de convite no Chrome, conclui W1-A → W2-A (revisão dos dados). CNPJ confere, valor R$ 12.000 confere, Plano Pro confere. Clica `[Confirmar e pagar →]`.
2. **Ação (W3-A):** Seleciona Cartão, digita o número do Itaú corporate, preenche CVV, valida, escolhe "4x — R$ 3.000,00 (entrada hoje + 3 parcelas)". Clica `[Pagar agora →]`.
3. **SUT processa:** Stripe dispara `setup_intent` + `payment_intent` em modo `requires_action` porque o banco emissor (Itaú) exige 3DS2. Frontend abre overlay/iframe Stripe Elements (que o wireframe não desenha explicitamente — assumindo padrão Stripe).
4. **Banco emissor:** Tela do banco pede aprovação biométrica via app. Felipe abre o Itaú no celular, mas tem timeout de digital local (3 tentativas falham, então pede senha de 6 dígitos). Esse processo demora 47s.
5. **Percepção do usuário:** Spinner do Stripe + overlay 3DS no desktop ficam parados visualmente. Felipe acha que "travou" — wireframe W3-A não mostra nenhum estado intermediário do tipo "Aguardando confirmação do seu banco (até 5 min, não feche essa aba)". O único feedback é o estado padrão do iframe Stripe, fora do controle do wireframe.
6. **Ação paralela:** Felipe abre o link de convite NUMA NOVA ABA (link ainda válido — não foi marcado como "usado"), passa por W1-A → W2-A novamente e em W3-A escolhe **PIX**. QR é gerado (W3-A.1).
7. **Felipe paga o PIX:** R$ 12.000,00 transferidos no Itaú app. Stripe webhook confirma payment via PIX. Frontend da aba 2 avança pra W4-A automaticamente.
8. **3DS conclui em paralelo:** No background, Felipe (sem perceber) clicou "Confirmar" no app do banco antes. Stripe confirma o `payment_intent` do cartão. Charge 2 registrada na Stripe.
9. **O que aconteceu:**
   - **Charge #1 (PIX):** R$ 12.000 confirmada. Acesso liberado pela aba 2.
   - **Charge #2 (Cartão entrada):** R$ 3.000 da entrada à vista confirmada na aba 1, mais 3 parcelas de R$ 3.000 agendadas pros próximos meses.
   - Felipe paga R$ 12.000 (PIX) + R$ 3.000 (entrada cartão) + 3× R$ 3.000 agendados = **R$ 24.000 cobrados de fato no fim do ciclo**.
   - O backend não detecta a duplicidade porque: (a) o link de convite ficou válido durante o pagamento concorrente — Story 1 não define momento de invalidação do link; (b) os 2 `payment_intent` são pra a mesma `org_setup_id` mas Stripe não enxerga duplicidade entre métodos distintos.
10. **Refund manual:** Felipe descobre a dupla cobrança 30 dias depois ao ver fatura do cartão e fala com o comercial. Story AC7 diz "cancelamento/refund no 1º acesso fora de escopo" — fica em terra de ninguém.

**Gaps identificados:**

| ID | Descrição | Severidade | Evidência (beat) |
|----|-----------|------------|------------------|
| G-P1-1.1 | Wireframe W3-A não trata simultaneidade cross-method (3DS pendente + nova aba PIX). Link de convite continua válido durante pagamento em curso — não há lock por `org_setup_id`. Stripe gera 2 charges em métodos distintos. C7.2 cobre "retomada após falha", não simultaneidade ativa. | P0 | #6, #8, #9 |
| G-P1-1.2 | W3-A não desenha estado "Aguardando confirmação do banco (3DS)" com guidance ("não feche a aba — pode levar até 5 min"). Iframe Stripe nu pode ser interpretado como travado. | P1 | #5 |
| G-P1-1.3 | Multi-tab no fluxo de 1º acesso: nenhum tratamento explícito de sessão única no convite. Wireframes assumem fluxo linear single-tab. | P1 | #6 |
| G-P1-1.4 | Parcelamento + entrada: regra de tier (≤R$10k → 2x, >R$10k → 4x) é exibida em W2-A e W3-A, mas a "entrada hoje + 3 parcelas mensais" não deixa explícito que **se houver duplicidade as parcelas futuras já estão calendárizadas e precisam ser canceladas no Stripe** — risco de cliente acreditar que refund da entrada resolve. | P2 | #9 |
| G-P1-1.5 | C8.2 / AC2 dizem "Algo está errado?" é informativo. Pra dupla cobrança o cliente não tem caminho dentro do produto pra resolver — só por canal externo. Wireframe W10-A "Sucesso" não detecta inconsistência (foi acessado via aba que pagou via PIX). | P1 | #9, #10 |

**Status:** ❌ Quebrou

**Questions abertas (não gaps):**
- Q1.1: Qual é o TTL real do `payment_intent` 3DS na configuração do Stripe? (afeta probabilidade real do gap acontecer)
- Q1.2: O backend tem idempotência key por `org_setup_id`? Não está documentado em nenhuma story.

---

### P1-2: SSO Google Workspace com e-mail aliasado/sub-domínio (bloqueio incompreensível)

**Seed original:** Felipe (CTO) recebeu convite em `felipe.rezende@fyntra.com` mas o IdP Google Workspace dele faz `+enterprise` aliasing e o auth retorna `felipe.rezende+enterprise@fyntra.com`. Bloqueio dispara mas o usuário não entende qual é o e-mail "certo". Dor potencial: bloqueio do Cenário 7 não cobre aliases de e-mail nem outros domínios suprimidos no Workspace (sub-domínio `fyntra.io` mapeado em `fyntra.com`).

**Walkthrough (beat-by-beat):**

1. **Setup:** Bruno (comercial AwSales) cadastrou Felipe como responsável com e-mail `felipe.rezende@fyntra.com` (e-mail principal da Workspace).
2. **Ação inicial:** Felipe recebe o e-mail no inbox `felipe.rezende@fyntra.com`, clica no link. W1-A → W2-A → W3-A (paga R$ 12k via PIX em 2 min, sem dor).
3. **W5-A — Criação de conta:** Vê SSO destacado como "recomendado pra empresas". Clica `[ 🔵 Continuar com Google ]`.
4. **Pop-up Google:** Felipe seleciona a conta Google que ele usa diariamente — mas na Workspace da Fyntra, todos os e-mails da diretoria têm alias `+enterprise` aplicado automaticamente nas APIs Google (configuração administrativa do Workspace pra rastrear traffic origem). OAuth retorna `email_verified: true, email: felipe.rezende+enterprise@fyntra.com`.
5. **SUT processa:** Backend compara strict equality entre `felipe.rezende+enterprise@fyntra.com` (do OAuth) e `felipe.rezende@fyntra.com` (do convite). Não bate. Dispara modal W5-A.1.
6. **W5-A.1 mostra:**
   - "Você está tentando entrar com: `felipe.rezende+enterprise@fyntra.com`"
   - "Mas o convite foi enviado pra: `felipe.rezende@fyntra.com`"
   - "Use o e-mail corporativo pra continuar."
   - Botão `[Tentar dnv]`
7. **Confusão do usuário:** Felipe não tem ideia do que é `+enterprise` — não é coisa dele, é da TI. Ele tenta de novo, escolhe a mesma conta Google (não tem outra), volta pro mesmo erro. 3 vezes. Não há nenhum caminho alternativo — só "Tentar dnv".
8. **Felipe tenta senha local:** Volta pra W5-A, cria senha local. Funciona. Mas agora Felipe tem conta local quando a Fyntra TINHA POLICY EXPLÍCITA de "todos os logins via SSO Workspace". Ele criou um shadow account fora da governance da empresa.
9. **Cenário expandido (sub-domínio):** Caso paralelo — outro membro tem alias `joao@fyntra.io` que é redirect pra `joao@fyntra.com`. Convite foi enviado pra `joao@fyntra.com` (e-mail canônico do Workspace) mas o OAuth retorna `joao@fyntra.io` porque é o e-mail primário do perfil Google dele. Mesmo bloqueio, mesma falta de saída.
10. **O que aconteceu:**
    - Bloqueio W5-A.1 dispara como esperado, mas mensagem é incompreensível pro CTO (não pra TI). Nenhum hint do tipo "se sua empresa usa aliases, contate seu admin de TI" ou "esse é o e-mail bruto que o Google retornou — pode ser um alias".
    - Fallback de senha local viola policy enterprise — mas wireframe não tem flag "essa org exige SSO obrigatório" pra Persona A.
    - Sub-domínio mapeado é caso real e legítimo do Workspace e gera mesmo bloqueio sem caminho de saída.

**Gaps identificados:**

| ID | Descrição | Severidade | Evidência (beat) |
|----|-----------|------------|------------------|
| G-P1-2.1 | W5-A.1 não trata aliases (`+suffix`) — strict equality bloqueia legítimos. Não há toggle de "normalização de alias" nem hint educativo. | P0 | #5, #6, #7 |
| G-P1-2.2 | Wireframes do 1º acesso não suportam policy "SSO obrigatório" pra Persona A — sempre permite fallback de senha local. Cria shadow account fora da governance. | P0 | #8 |
| G-P1-2.3 | Sub-domínios mapeados no Workspace (`fyntra.com` ↔ `fyntra.io`) também caem no mesmo strict equality — wireframe W5-A.1 não distingue alias de domínio diferente. C3.1 ("e-mail SSO ≠ e-mail do convite") é interpretada como strict mas o caso enterprise real é mais nuance. | P0 | #9 |
| G-P1-2.4 | W5-A.1 só oferece `[Tentar dnv]` — sem ação alternativa ("Falar com TI", "Falar com comercial", "Usar e-mail diferente"). Não cumpre C8.2 nesse caso porque o modal de "Algo está errado?" não está acessível desse ponto do fluxo. | P1 | #7 |
| G-P1-2.5 | Wireframes do convite do Bruno (comercial) não validam o e-mail antes de enviar — não há check do tipo "esse domínio responde como Workspace?" pra avisar o comercial de configurar SSO certo. (limitado pela seed — pode ser fora de escopo do MVP de wireframe). | P2 | #1 |

**Status:** ❌ Quebrou

**Questions abertas (não gaps):**
- Q2.1: WorkOS (provider declarado) normaliza alias `+suffix` na resposta? Comportamento depende de configuração de cada cliente WorkOS.
- Q2.2: Pra Persona A é admissível ter senha local sempre disponível como fallback, ou existe policy "SSO obrigatório no 1º acesso"?

---

### P1-3: Time ativo cria função custom durante o 1º acesso (perde 8 e-mails digitados)

**Seed original:** No último passo do fluxo (convidar equipe), Felipe quer convidar 8 desenvolvedores como "Engenheiro AwSales" — função que ainda não existe. Clica "+ Criar nova função" no dropdown e... a tela de criação de função abre em outro contexto. Dor potencial: fluxo perde os 8 e-mails já digitados no campo de convite; W4 de Configurações diz "preferencialmente" sem perder, mas wireframe não desenha o retorno.

**Walkthrough (beat-by-beat):**

1. **Setup:** Felipe concluiu W1-A → W8-A. Está em W9-A (Convidar Equipe — último passo). Quer convidar 8 devs específicos como "Engenheiro AwSales", função que ele precisa criar do zero.
2. **Ação:** Felipe digita 8 e-mails apertando Enter entre eles:
   - `dev1@fyntra.com`, `dev2@fyntra.com`, ..., `dev8@fyntra.com`
   - Cada um vira chip; contador mostra "8/20 convites".
3. **SUT processa:** Felipe expande o dropdown "Função pra todos os convidados". Vê 6 padrões (Administrador, Gerente Ops, Analista Sênior, Analista Pleno, Colab. Externo, Operador) e... wireframe W9-A não desenha a opção `+ Criar nova função` neste dropdown. Mas a Story 1 implica que existe (Story 2 W4 modal de convite tem `+ Criar nova função`).
4. **Caso A — não tem `+ Criar nova função` em W9-A:** Felipe não consegue criar função custom durante o 1º acesso. Ele tem que escolher um padrão "Operador" (que dá 30 permissões, sem permissão de algumas features que devs precisam) ou pular o convite e fazer depois em Configurações. **Gap de capacidade no fluxo 1º acesso.**
5. **Caso B — tem `+ Criar nova função` (assumindo paridade com W4 da Story 2):** Felipe clica `+ Criar nova função`. Wireframe W9 da Story 2 abre em "tela própria" (não modal). Mas Felipe está em fluxo de onboarding sem sidebar (W9-A não tem sidebar, é fluxo público).
6. **Conflito de contexto:** Tela W9 de Configurações pressupõe usuário logado com sidebar. O 1º acesso não está logado completamente (só completou senha/SSO mas não terminou onboarding). Wireframe W9-A não desenha o retorno — não tem breadcrumb tipo `« Criar função / voltar pra convidar equipe`.
7. **Felipe preenche função:** Nome "Engenheiro AwSales", descrição, marca 12 permissões dos domínios Agentes, Bases, Conversas, Dashboard, Playground. Clica `[Criar função]`.
8. **Pós-criação:** Para onde vai? Wireframe não desenha o retorno. 3 cenários possíveis:
   - 8a. Volta pra W9-A com função criada selecionada e 8 chips preservados → **funciona** (mas wireframe não confirma).
   - 8b. Volta pra W9-A com função criada selecionada e 8 chips PERDIDOS → **gap** (precisa redigitar 8 e-mails, frustrante).
   - 8c. Vai pra W7 (Lista de Funções de Configurações) — fora do fluxo de onboarding → **quebra total** (Felipe precisa reachar o convite novamente, mas link já foi consumido).
9. **Cenário ainda pior:** Felipe digita 8 e-mails, clica `+ Criar nova função`, no meio da criação fecha aba sem querer (Ctrl+W). Onde reabre? W9-A perdeu state, função em criação não foi salva. Story 1 Cenário 14 só fala de "retomada após falha de pagamento" — não cobre retomada após falha no convite/função.
10. **O que aconteceu:**
    - W9-A não tem `+ Criar nova função` desenhado — descontinuidade entre stories.
    - Mesmo se tivesse, o retorno não é desenhado e o estado dos chips não é garantido.
    - Felipe acaba pulando o passo do convite, terminando o onboarding sem 8 devs, e tendo que ir pra Configurações depois — UX fragmentado, ROI de "convidar agora" perdido.

**Gaps identificados:**

| ID | Descrição | Severidade | Evidência (beat) |
|----|-----------|------------|------------------|
| G-P1-3.1 | W9-A (Convidar Equipe no 1º acesso) não desenha `+ Criar nova função` no dropdown, contradizendo W4 de Configurações que tem o atalho. Inconsistência cross-story. | P0 | #3, #4 |
| G-P1-3.2 | Mesmo assumindo que existe, wireframe não desenha o retorno preservando os chips de e-mail digitados. W4 modal de Configurações diz "preferencialmente sem perder" mas em W9-A do 1º acesso nem isso aparece. | P0 | #6, #8b |
| G-P1-3.3 | W9 (Criar nova função, tela própria) assume usuário logado com sidebar. No fluxo de 1º acesso o usuário não está em estado autenticado completo — wireframe não trata essa transição de chrome (sem sidebar → com sidebar). | P1 | #5, #6 |
| G-P1-3.4 | Sem recovery se aba fechar/falhar no meio da criação de função durante o 1º acesso. Story 1 só trata retomada de pagamento (C7.2). | P1 | #9 |
| G-P1-3.5 | Felipe foi forçado a pular convite por falta de função adequada — métrica C1.1 ("100% de conversão convite→org ativa") atinge mas C1.2 e métrica de "% de orgs com time convidado no D1" caem. | P2 | #10 |

**Status:** ❌ Quebrou

**Questions abertas (não gaps):**
- Q3.1: O dropdown de W9-A foi omitido por simplificação visual do wireframe ou por decisão de produto (criar função só em Configurações)?
- Q3.2: Existe estado "onboarding em curso" pro usuário que justifica chrome diferente do app autenticado?

---

### P1-4: Audit trail LGPD — exportação de 47k eventos durante incidente

**Seed original:** 2 meses depois, Felipe (Admin) precisa exportar audit trail completo de 1 funcionário recém-desligado (suspeita de exfiltração de base de conhecimento) pra entregar pro DPO da empresa. Audit trail tem 47k eventos no período. Dor potencial: exportação CSV assíncrona demora; Cenário 19 da Story 2 diz "janela limitada 24h" mas wireframe W5 da Story 2 só mostra botão "Exportar CSV" sem feedback de geração ou notificação.

**Walkthrough (beat-by-beat):**

1. **Setup:** Felipe (Administrador da Fyntra) é alertado pelo Security que um dev (Lucas Reis, recém-desligado) baixou arquivos da base de conhecimento "Estratégia 2026" na manhã do desligamento. DPO pede audit trail completo dos últimos 90 dias do usuário pra incidente formal LGPD.
2. **Ação:** Felipe vai em Configurações / Team. Busca "Lucas Reis", encontra `[LR] Lucas Reis · ✕ Inativo` na lista W3. Clica no menu kebab `…` → `Visualizar`.
3. **Modal W5 abre:** Mostra dados de Lucas + permissões (read-only, da função anterior) + bloco "Audit Trail" com filtros (Período / Tipo de ação / Buscar recurso afetado).
4. **Filtra período:** Felipe muda "Período: 7 dias ▾" pra "Últimos 90 dias". O modal precisa carregar de novo. Audit trail tem 47k eventos no período (Lucas era um operador heavy).
5. **SUT processa:** Wireframe W5 mostra "Carga paginada (50 itens iniciais, carregar mais sob demanda)" — Cenário Q7. Felipe vê 50 eventos. Para extrair os 47k pra entregar pro DPO, ele precisa do CSV. Clica `[📥 Exportar CSV]`.
6. **O que acontece:** Wireframe W5 só desenha o botão. Não desenha:
   - Modal de confirmação de export (escopo? só os filtrados? todos? período?).
   - Feedback de geração ("export em andamento, vai durar ~3 min").
   - Notificação quando pronto (e-mail? in-app? notification bell?).
   - Tela de "Meus exports" pra rebaixar depois.
   - Janela de validade do download.
7. **C5.2 do SUT:** "export assíncrono se grande" — sim, é o que se espera. Mas wireframe é silencioso sobre QUALQUER aspecto disso. Felipe clicou e... fica olhando.
8. **Cenário concorrente:** Em paralelo, o DPO da Fyntra também é Admin e tentou exportar mesmo audit trail (não combinaram). Dois exports concorrentes do mesmo período — sistema duplica trabalho? Coalesce? Wireframe não diz.
9. **Cenário 24h depois:** Felipe recebe link de download por e-mail. Clica. Link expirou? Wireframe não tem "janela limitada 24h" desenhada. Story 2 Cenário 19 menciona "janela limitada 24h" mas W5 não materializa. Felipe precisa pedir export de novo — mais 3 min de espera, mais ruído.
10. **Cenário sensível (LGPD):** O CSV exportado tem 47k linhas com timestamps, IPs, recursos afetados — dado pessoal sob LGPD. Wireframe W5 não desenha:
    - Aviso "esse export contém dados pessoais — manuseie conforme LGPD".
    - Registro do próprio export no audit trail (meta-audit: "Felipe exportou audit trail de Lucas em DD/MM HH:MM:SS").
    - Hash/checksum do CSV pra integridade probatória (DPO vai precisar provar que o arquivo não foi adulterado).
11. **O que aconteceu:**
    - Botão exporta, talvez funciona — mas UX é totalmente vazia. Felipe não sabe se clicou de novo, se duplica, se vai receber, se vai expirar.
    - LGPD requer track de quem exportou dados pessoais (princípio de accountability) — wireframe não desenha o meta-event.
    - Cenário de incidente com prazo (DPO precisa de resposta em até 72h pra ANPD se for breach) fica sem confiança no produto.

**Gaps identificados:**

| ID | Descrição | Severidade | Evidência (beat) |
|----|-----------|------------|------------------|
| G-P1-4.1 | W5 só desenha botão `[📥 Exportar CSV]` sem nenhum dos sub-estados: confirmação de escopo, feedback de geração, notificação, "meus exports", janela de download. C5.2 promete export assíncrono mas wireframe não materializa. | P0 | #6, #7 |
| G-P1-4.2 | Janela limitada 24h do download não está desenhada em wireframe — só está mencionada na story. Sem estado visível, cliente perde acesso silenciosamente. | P1 | #9 |
| G-P1-4.3 | Sem meta-audit: exportação de dados pessoais é evento crítico LGPD e deve aparecer no audit trail do executor. C5.1 lista "eventos críticos" mas não cita export. | P1 | #10 |
| G-P1-4.4 | Sem aviso LGPD/sensibilidade no download ("contém dados pessoais"). Pra cliente B2B com DPO formal, isso é compliance básico. | P1 | #10 |
| G-P1-4.5 | Sem coalesce/dedup de exports concorrentes — wireframe não trata 2 admins exportando o mesmo period simultaneamente. | P2 | #8 |
| G-P1-4.6 | Cenário "carregar mais" do audit trail (Q7) é OK pra browse mas inviável pra extrair 47k linhas — wireframe não oferece visão de tabela completa com scroll virtualizado, só botão "Carregar mais" sequencial. | P1 | #5 |

**Status:** ❌ Quebrou

**Questions abertas (não gaps):**
- Q4.1: Story 2 Cenário 19 cita "janela limitada 24h" — qual é a fonte oficial? Confirmar com PG/legal antes do dev.
- Q4.2: Hash de integridade do CSV é requisito legal pra produção de evidência ou nice-to-have?

---

### P1-5: 2FA da org ligado por Admin com sessões ativas em pleno trabalho

**Seed original:** Felipe ativa 2FA da org num momento em que 8 devs estão logados ativos editando agentes. Wireframe diz "sessões ativas não são derrubadas" — Felipe espera que SIM derrube (porque é uma decisão de segurança crítica). Dor potencial: semântica enterprise quebrada — segurança que só vale "no próximo login" é vista como negligente em fintech/saúde; aqui é SaaS mas ainda vale como sinal de design.

**Walkthrough (beat-by-beat):**

1. **Setup:** Fyntra está com 12 membros ativos. 8 devs estão logados em pleno trabalho — Camila editando agente de SDR, João carregando base de conhecimento, etc. Felipe (Admin) recebe notificação do Security de que houve tentativa de phishing apontando pro AwSales na semana passada — quer ligar 2FA imediato.
2. **Ação:** Felipe vai em Configurações / Segurança. Wireframe W1 da Story 2 lista a aba Segurança no menu lateral mas não desenha o conteúdo. Assumindo flow padrão: toggle "Exigir 2FA pra todos os membros" → `[Ativar]`.
3. **SUT processa:** Backend marca `org.require_2fa = true`. Toggle vira verde. Toast: "2FA da organização ativado. Pra todos os membros, será obrigatório no próximo login."
4. **Mental model do Felipe:** Felipe (CTO técnico, ex-fintech) acredita que ativar 2FA é decisão crítica de segurança — semelhante a "fechou cofre, todo mundo refaz login". Ele assume que sessões ativas vão ser derrubadas e os devs vão refazer login com 2FA. Não vão.
5. **O que efetivamente acontece:** Os 8 devs continuam trabalhando normalmente, sem 2FA configurado. Wireframe W4-B diz "Mesmo cenário do Q13: se a flag for ligada no meio do fluxo, força a etapa" — mas isso é pra **convite em curso**, não pra **sessão ativa**.
6. **Cenário phishing real:** Se atacante já tinha credentials de algum dev na sessão ativa (cookie roubado), ele continua dentro do AwSales durante toda a janela da sessão (depende do TTL — wireframe não cita TTL de sessão). 2FA ativado só fecha a porta pra **próximo login**, não pra ataque em curso.
7. **Conflito com mental model de Persona A:** CTO técnico vai querer:
   - 7a. Toggle 2FA com modal de confirmação "Deseja derrubar sessões ativas agora? [✓] Sim, derrubar / [ ] Não, só próximo login" — escolha do admin.
   - 7b. Visibilidade de "X sessões ativas — derrubar agora?" antes/depois de ativar.
   - 7c. Audit trail mostrando "Felipe ativou 2FA da org — 8 sessões ativas afetadas no próximo login".
8. **Wireframe W4-B explícito:** "Mesmo cenário do Q13: se a flag for ligada no meio do fluxo, força a etapa." Só fala de fluxo de onboarding. **Não trata sessão ativa pós-onboarding**.
9. **Cenário do dev:** Camila, no meio de editar agente, recebe... nada. Continua editando. Salva. Faz logout no fim do dia. Ao tentar logar amanhã, é forçada a configurar 2FA (W4-B). Acha estranho que ninguém avisou — wireframe não desenha nenhuma notificação prévia ou banner persistente pros devs ("Sua org ativou 2FA — configure antes do próximo login").
10. **O que aconteceu:**
    - Comportamento documentado ("sessões ativas não derrubadas") é coerente com decisão de produto mas **não atende mental model de segurança enterprise**.
    - Falta de **opção** pro Admin (CTO técnico espera controle: "deixar como está" ou "derrubar agora").
    - Falta de **notificação proativa** pros devs ativos antes do próximo login.
    - Falta de **registro audit trail** do impacto da ação.
    - Para fintech/saúde, isso é blocker; para SaaS médio (Fyntra), é dor pesada mas não bloqueia adoção.

**Gaps identificados:**

| ID | Descrição | Severidade | Evidência (beat) |
|----|-----------|------------|------------------|
| G-P1-5.1 | Ativação de 2FA da org não oferece opção de "derrubar sessões ativas agora" — Admin não tem controle sobre janela de exposição. Decisão hardcoded contrária ao mental model de segurança enterprise. | P1 | #7a, #10 |
| G-P1-5.2 | Sem notificação proativa pros membros ativos antes do próximo login. Toggle muda comportamento de auth no próximo login sem warning prévio. | P1 | #9 |
| G-P1-5.3 | Wireframe da aba Segurança não foi desenhado nesta entrega — só listado no menu. Cenário Q13 (W4-B) só cobre fluxo de onboarding em curso. Story 2 declarou Segurança como aba mas sem materialização. | P0 | #2 |
| G-P1-5.4 | Sem visibilidade de "X sessões ativas no momento" pro Admin no toggle de 2FA — informação crítica pra decisão. | P2 | #7b |
| G-P1-5.5 | Audit trail (C5.1) deve registrar ativação de 2FA da org com contexto ("8 sessões ativas afetadas no próximo login") — wireframe W5 mostra eventos genéricos sem evidência de captura deste tipo. | P1 | #7c |

**Status:** ⚠️ Passou com dor

**Justificativa do status:** Comportamento "sessões ativas não derrubadas" é **decisão de produto explícita** documentada nas wireframes e Story 2. Não é gap de design — é gap de **opcionalidade**. Para o perfil P1 (SaaS médio, não fintech/saúde) é dor pesada mas não bloqueia adoção. Para perfis com regulação mais pesada (P3/P4 prováveis) viraria P0. Aqui passa com dor porque Felipe consegue trabalhar em volta (forçar logout manual de cada dev via "Inativar + Reativar" — workaround ugly mas funcional).

**Questions abertas (não gaps):**
- Q5.1: TTL de sessão na aplicação? Wireframes não citam. Afeta diretamente janela de exposição em qualquer mudança de policy.
- Q5.2: Existe endpoint admin "kill all sessions" no roadmap futuro? Se sim, esse gap é só "ainda não chegou", se não, é decisão.

---

## Padrões adversariais identificados

**1. Wireframes silenciosos sobre estados assíncronos.** P1-1 (3DS pendente) e P1-4 (export CSV) compartilham padrão: backend faz algo de longo prazo, wireframe não desenha estado intermediário, usuário fica sem feedback. C5.2 e C7.2 prometem comportamento mas wireframes não materializam.

**2. Strict equality em campos enterprise-sensitive.** P1-2 (e-mail) é caso clássico: regra simples na story → mil exceções no enterprise real (aliases, sub-domínios, mapeamento Workspace). C3.1 é correta como regra mas precisa de operadores além de `=`.

**3. Descontinuidade cross-wireframe.** P1-3 mostra que W9-A da Story 1 e W4 da Story 2 falam da mesma capacidade ("criar nova função") com tratamento diferente. P1-5 mostra Segurança como aba listada mas não materializada.

**4. Decisões de produto sem opcionalidade enterprise.** P1-5 (2FA não derruba sessão) é decisão coerente mas vira gap quando CTO técnico espera controle granular. Pra perfis mais regulados é blocker.

**5. Compliance LGPD subdesenhado.** P1-4 mostra que export de dados pessoais precisa de track de quem exportou, hash de integridade, janela de retenção — wireframes mostram só o botão. Pra B2B com DPO formal isso vira issue de auditoria.

## Validação anti-claims

- AC1 (mobile): nenhuma seed dependeu de mobile — OK.
- AC2 (placeholders "Algo está errado?" / "Convite expirado"): G-P1-2.4 não pede backend, pede saída visual alternativa — válido.
- AC3 (edição individual): nenhuma seed tentou editar permissão individual — OK.
- AC4 (duplicar padrão): nenhuma seed pediu — OK.
- AC5 (mudar função em convite pendente): nenhuma seed tocou — OK.
- AC6 (SCIM/programático): nenhuma seed tocou — OK.
- AC7 (cancelamento/refund no 1º acesso): G-P1-1.5 cita mas como observação, não como gap pedindo refund — gap é falta de visibilidade do problema, não a feature de refund.
- AC8 (idiomas além PT-BR): nenhuma seed dependeu — OK.

Nenhum gap registrado depende de feature explicitamente anti-claim.
