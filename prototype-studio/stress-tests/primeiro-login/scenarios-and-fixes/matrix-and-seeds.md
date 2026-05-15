# Matriz e Seeds — Stress Test 2026-05-11

## Matriz

**Eixo único:** Perfil de Cliente Enterprise (6 categorias combinando vertical + persona + complexidade de pagamento)

**Sub-eixo (dentro de cada perfil):** 5 cenários adversariais cobrindo as 5 dores canônicas — pagamento, auth, governança/team, audit/compliance, recuperação/borda

**Total:** 6 × 5 = 30 cenários

| Perfil | Vertical | Persona dominante | Particularidade |
|---|---|---|---|
| **P1 — SaaS médio com CTO técnico** | SaaS | CTO técnico curioso | Fluxo enxuto, cartão pra tudo, time pequeno e ativo |
| **P2 — Varejo familiar conservador** | Varejo | Diretor financeiro 60+ | Boleto pra tudo, sem SSO corporativo, baixa fluência digital |
| **P3 — Fintech regulada** | Fintech | Procurement + InfoSec rígida | 2FA obrigatório org-wide, TI restritiva, compliance LGPD/BACEN |
| **P4 — Edtech fundador faz tudo** | Edtech | Founder solo | Mobile-first instintivo, ansioso, dúvida no contrato |
| **P5 — Grupo multi-org (holding)** | Educação (holding) | CFO de 5 marcas | Multi-org com mesmo CFO/CNPJs diferentes, métodos mistos |
| **P6 — Logística com TI terceirizada** | Logística | TI terceirizada lenta | Procrastina, link expira, retoma fora do prazo |

---

## Seeds — 30 cenários

> **Convenção:** cada seed = 1-3 linhas com **cliente nomeado + números específicos + ação adversarial + dor potencial**.

---

### P1 — SaaS médio (Fyntra Tecnologia, 50 FTE, CTO técnico)

**P1-1 · Pagamento misto + Stripe 3DS challenge no meio:**
Felipe Rezende, CTO da Fyntra (R$ 12k implementação + Plano Pro R$ 2.500/mês), seleciona cartão pra impl (parcela em 4x) e quer cadastrar OUTRO cartão pra recorrência do Plano (corporate da empresa). No 3DS challenge da 1ª cobrança a impressão digital biométrica do banco demora 47s; usuário acha que travou e abre nova aba, paga via PIX. **Dor potencial:** dupla cobrança (3DS conclui + PIX confirma) — Stripe gera 2 charges ou Cenário Q2 não cobre 3DS de fato.

**P1-2 · SSO Google Workspace com e-mail aliasado:**
Felipe (CTO) recebeu convite em `felipe.rezende@fyntra.com` mas o IdP Google Workspace dele faz `+enterprise` aliasing e o auth retorna `felipe.rezende+enterprise@fyntra.com`. Bloqueio dispara mas o usuário não entende qual é o e-mail "certo". **Dor potencial:** bloqueio do Cenário 7 não cobre aliases de e-mail nem outros domínios suprimidos no Workspace (sub-domínio `fyntra.io` mapeado em `fyntra.com`).

**P1-3 · Time ativo cria função custom durante o 1º acesso:**
No último passo do fluxo (convidar equipe), Felipe quer convidar 8 desenvolvedores como "Engenheiro AwSales" — função que ainda não existe. Clica "+ Criar nova função" no dropdown e... a tela de criação de função abre em outro contexto. **Dor potencial:** fluxo perde os 8 e-mails já digitados no campo de convite; W4 de Configurações diz "preferencialmente" sem perder, mas wireframe não desenha o retorno.

**P1-4 · Audit trail e LGPD — exportação durante incidente:**
2 meses depois, Felipe (Admin) precisa exportar audit trail completo de 1 funcionário recém-desligado (suspeita de exfiltração de base de conhecimento) pra entregar pro DPO da empresa. Audit trail tem 47k eventos no período. **Dor potencial:** exportação CSV assíncrona demora; Cenário 19 da Story 2 diz "janela limitada 24h" mas wireframe W5 da Story 2 só mostra botão "Exportar CSV" sem feedback de geração ou notificação.

**P1-5 · 2FA da org ligado por Admin → derruba session dos devs no meio do trabalho:**
Felipe ativa 2FA da org num momento em que 8 devs estão logados ativos editando agentes. Wireframe diz "sessões ativas não são derrubadas" — Felipe espera que SIM derrube (porque é uma decisão de segurança crítica). **Dor potencial:** semântica enterprise quebrada — segurança que só vale "no próximo login" é vista como negligente em fintech/saúde; aqui é SaaS mas ainda vale como sinal de design.

---

### P2 — Varejo familiar (Casa Bahia Filial, diretor financeiro 60+)

**P2-1 · Boleto pra tudo + linha digitável copy fail no Internet Explorer 11:**
Sr. Aderbal (60 anos, diretor financeiro da Casa Bahia Filial, R$ 18k impl + R$ 4.500/mês plano), recebe convite em DESKTOP MS Windows 10 com IE11 corporativo (TI proibiu Chrome). Tenta gerar boleto da implementação, copia linha digitável mas o botão "Copiar" usa Clipboard API que não funciona em IE11. **Dor potencial:** wireframe W3-A.2 não tem fallback texto-selecionável-manualmente; cliente abandona ou usa celular pessoal (mobile NÃO suportado MVP).

**P2-2 · Termo de uso scroll-to-bottom em texto longo:**
Sr. Aderbal abre o termo. Documento tem 47 páginas (contrato enterprise + anexos). Em monitor 1366×768 (padrão corporativo varejo), scroll dentro do modal demora ~3 minutos e ele tem que rolar com mouse wheel pixel a pixel. **Dor potencial:** Cenário 8 + Q5 obrigam scroll completo server-side; UX em monitor pequeno + senior user vira atrito real; Sr. Aderbal fica frustrado e nem aceita.

**P2-3 · Convite expirado no meio das férias de fim de ano:**
Convite enviado em 22/12. Sr. Aderbal saiu de férias coletivas dia 23/12. Volta dia 06/01. Link expirou em 29/12. **Dor potencial:** tela de "link expirado" mostra contato comercial (Bruno Costa) que TAMBÉM estava de férias coletivas. Cenário 13 da Story 1 não cobre fallback quando o próprio comercial está OOO; Sr. Aderbal abandona ou liga pra suporte que não sabe do convite.

**P2-4 · Funções padrão "demais" pra org pequena de varejo (4 pessoas):**
Casa Bahia Filial tem 4 funcionários — Sr. Aderbal (admin), 2 atendentes WhatsApp e 1 estagiária. As 6 funções padrão (Administrador, Gerente de Ops, Analista Sênior/Pleno, Colaborador Externo, Operador) são SaaS-coded; nenhuma reflete "atendente loja". Sr. Aderbal tenta entender qual escolher pros atendentes. **Dor potencial:** wireframe W4 da Story 2 lista 6 funções com 30-50 permissões cada — para 4 pessoas é overwhelming. Sem opção "duplicar e simplificar" (anti-claim AC4), Sr. Aderbal monta função custom no zero — vai errar permissões.

**P2-5 · invoice adicional pra contadora terceirizada com domínio Gmail:**
Sr. Aderbal cadastra `contabil.casabahiafilial@gmail.com` como e-mail adicional pra invoice. Cenário 12 da Story 1 diz "domínio aberto, até 10". Tudo bem. Mas Sr. Aderbal não sabe se a contadora vai receber UMA cópia toda vez OU se deve marcar algum checkbox. **Dor potencial:** wireframe W6-A da Story 1 não esclarece se é cópia automática de toda invoice ou só ocasional; ambiguidade vira ticket no comercial.

---

### P3 — Fintech regulada (NeoBank Co., 200 FTE, procurement + InfoSec rígida)

**P3-1 · 2FA obrigatório org-wide ANTES do 1º acesso do Responsável:**
NeoBank é uma fintech regulada. Política InfoSec exige 2FA obrigatório em TODOS os SaaS B2B. O comercial AwSales cadastrou no admin a flag "2FA org-wide = ON" antes mesmo do convite ser disparado. CEO Lucas (responsável) clica no link e... **Dor potencial:** Story 1 Cenário 9.1 diz "flag ON força no próximo login dos membros" — mas e o PRÓPRIO responsável no 1º acesso? O wireframe W8-A oferece "Pular por agora" — viola política da NeoBank. Tem que ser obrigatório no setup inicial se a flag estiver ON.

**P3-2 · Procurement exige invoice pré-pagamento + 5 e-mails diferentes:**
NeoBank tem departamento de procurement que exige invoice emitida ANTES do pagamento (cláusula contratual). E precisa que a invoice chegue em 5 e-mails: financeiro, contábil, jurídico, compliance, controladoria interna. **Dor potencial:** O wireframe e a story dizem "emissão invoice pré-pagamento" é uma EXCEÇÃO do admin. Quem confere que está marcada? Procurement não vê o admin. Risco: invoice emitida pós-pagamento → procurement rejeita o pagamento.

**P3-3 · SSO bloqueado pela InfoSec — força login local com senha gerada pelo cofre:**
InfoSec da NeoBank desabilita SSO terceiro pra ferramentas não-aprovadas. Lucas e sua VP só podem usar senha local. Mas a política da NeoBank exige senhas geradas pelo cofre 1Password com 24 chars + caracteres especiais únicos por SaaS. **Dor potencial:** wireframe W5-A regra "Mín. 12 chars · 1 maiúscula · 1 número · 1 símbolo" — 1Password gera senha legítima mas se chars especiais fora do regex, sistema rejeita silenciosamente.

**P3-4 · Audit trail — InfoSec exige eventos em formato SIEM imediatos:**
NeoBank tem SIEM (Splunk) que ingere audit trails de todos os SaaS via webhook. InfoSec exige que CADA evento crítico (login, falha de login, mudança de permissão, criação de função, inativação) seja entregue ao SIEM em <60s. **Dor potencial:** Story 2 Cenário 17 lista o audit trail mas não fala de webhook/streaming. Wireframe W5 só mostra visualização in-app + export CSV manual. Sem streaming/webhook = não atende NeoBank.

**P3-5 · Funções customizadas — modelo CISO/CRO/Compliance Officer + Segregação de Funções:**
NeoBank quer criar 4 funções custom específicas: CISO (vê tudo, edita nada — só visualização), CRO (Chief Risk — só dashboard + audit trail), Compliance Officer (vê audit trail + bases de conhecimento + termo aceito), DPO (só dados pessoais + audit trail). Política BACEN exige **segregação de funções** — Admin NÃO pode ver dados que o DPO vê, e vice-versa. **Dor potencial:** o modelo "1 função por usuário" + funções com 50+ permissões mutuamente exclusivas → CISO real tem que ser Admin pra ver tudo, mas Admin também tem permissão de ESCRITA. Stress test: o catálogo de permissões agrupado por domínio (Agentes, Aprovações, etc.) atende segregação BACEN?

---

### P4 — Edtech fundador faz tudo (CodeRabbit Schools, founder solo)

**P4-1 · Mobile-first instintivo — clica no convite pelo iPhone às 23h:**
Júnior, fundador da CodeRabbit Schools (escola de programação online, 8 alunos, R$ 3k impl + R$ 900/mês plano), está no Uber às 23h quando o convite chega no e-mail. Clica no link pelo iPhone 12. **Dor potencial:** AC1 diz mobile = bloqueio educado. Wireframe não mostra a tela de bloqueio mobile — só uma OBS lateral. Júnior precisa esperar chegar em casa, ligar o desktop. Ele PROCRASTINA: aceita 4 dias depois.

**P4-2 · Confusão Implementação vs Plano — "por que está cobrando duas coisas?":**
Júnior chega na tela W2-A (revisão), vê **R$ 3.000 implementação** + **R$ 900/mês plano** = pensa que vai pagar R$ 3.900 agora. Tela tenta deixar claro com "Cobrança AGORA" vs "1ª fatura em 31/05" mas Júnior pula a leitura. **Dor potencial:** founder solo com pressa não lê detalhes; mental model "vendido por preço único" não combina com 2 blocos; Júnior reclama no Slack do AM dizendo que cobramos a mais.

**P4-3 · Não tem time pra convidar — pula a etapa de convite:**
Júnior chega na etapa W9-A (convidar equipe). Ele é solo — sem time. Clica "Pular essa etapa". **Dor potencial:** próxima vez que ele precisar (3 meses depois quando contratar primeira pessoa), ele esquece onde fica o convite. Wireframe W3 da Story 2 só tem "+ Convidar membro" no topo direito da aba Team. UX onboarding não educa onde voltar.

**P4-4 · Dúvida sobre contrato no termo de uso — não tem time jurídico:**
Júnior abre o termo de 47 páginas. Não tem jurídico interno. Ele tem dúvida sobre "fidelidade 12 meses + multa 50% sobre meses restantes" — quer perguntar ao advogado do escritório-amigo dele antes de aceitar. **Dor potencial:** UI não tem opção "salvar e voltar depois" no termo; ele tem que abandonar e refazer todo o fluxo. Ou aceita sem entender.

**P4-5 · Único Admin — tenta inativar a si mesmo "pra testar":**
6 semanas depois, Júnior contrata Carlos (operador). Quer testar a inativação. Como brincadeira, tenta inativar a si mesmo. **Dor potencial:** Cenário 22 da Story 2 diz que bloqueia o último Admin — wireframe W6.1 mostra a mensagem. Mas pra ATIVOS, Júnior continua como único Admin mesmo depois de promover Carlos? Cenário não cobre "promover Carlos a Admin antes de me inativar" claramente no fluxo.

---

### P5 — Grupo multi-org (Holding Vitru, CFO em 5 marcas)

**P5-1 · CFO Ricardo cadastra a 5ª org com e-mail já usado em outras 4:**
Ricardo (CFO da Holding Vitru) é responsável em **5 orgs distintas** (Anhanguera, UNIASSELVI, FAMA, Cruzeiro do Sul, Pitágoras). Recebe convite pra 5ª org com mesmo e-mail `ricardo@vitru.com.br`. **Dor potencial:** Story 1 Cenário 24 + Story 2 Cenário 12 dizem "multi-org permitido" — mas no momento do 1º acesso, sistema reconhece que o e-mail já tem conta? Aplica SSO existente sem refazer setup? Ou trata como novo usuário e gera duplicação no WorkOS?

**P5-2 · Métodos de pagamento diferentes em cada org (centralizado financeiro):**
Holding Vitru tem regra: implementação pode ser cartão (Ricardo aprova até R$ 50k), mas plano recorrente TEM que ser boleto (passa pelo financeiro centralizado). Em 4 orgs já está assim. Na 5ª, comercial AwSales liberou só cartão pra recorrência — Ricardo só descobre na hora. **Dor potencial:** wireframe W4-A não mostra "outros métodos não estão liberados, contate seu comercial pra adicionar" — Ricardo fica preso. Cenário 16 (Q16) cobre "único método falha" mas não "método desejado não foi liberado".

**P5-3 · Seletor de organização — Ricardo logado, troca de org perde o passo onde estava:**
Ricardo está no meio do convite da 5ª org. Recebe mensagem urgente de outra org (UNIASSELVI) — troca pelo seletor. Resolve. Volta pra 5ª org. **Dor potencial:** Cenário 25 da Story 1 diz "retoma de onde parou" — mas o seletor é da Story 2 (W11.1). Cross-story: o fluxo de 1º acesso (não-autenticado ainda?) suporta troca de org via seletor? Ricardo está numa zona cinzenta de auth.

**P5-4 · Funções customizadas iguais em 5 orgs — sem propagação:**
Holding criou função "Auditor Interno do Grupo" com 18 permissões na Anhanguera. Cada nova org precisa recriar do zero (Story 2 Cenário 26 — sem duplicar). Ricardo tem que recriar 4 vezes mais. **Dor potencial:** custo de manutenção; risco de drift entre funções com mesmo nome em orgs diferentes (mudança de permissão BACEN obriga refletir em todas). Cenário 30 garante isolamento — mas isolamento ≠ desejável aqui.

**P5-5 · Audit trail consolidado entre 5 orgs — Ricardo quer ver atividade dele agregada:**
Como CFO de 5 orgs, Ricardo quer relatório mensal de TODAS as suas ações em TODAS as orgs (pra prestação de contas no conselho). **Dor potencial:** wireframe W5 (Visualizar usuário) tem audit trail por org. Ricardo entra em 5 modais separados pra ver tudo. Exportação CSV é por org. Sem visão cross-org → ele exporta 5 CSVs e consolida no Excel manualmente.

---

### P6 — Logística com TI terceirizada (TransExpress, TI lenta)

**P6-1 · Procurement do TransExpress demora 12 dias pra aprovar contrato — link expira:**
Comercial AwSales fechou venda com TransExpress (R$ 28k impl + R$ 7k/mês plano). Dispara convite pra `julia.lima@transexpress.com.br` (gerente de Tech responsável). Procurement do TransExpress trava o contrato por 12 dias — Julia só consegue acessar o link no dia 11. **Dor potencial:** Link expira em 7 dias. Julia clica → tela "expirado" → contato comercial. Comercial AwSales (já fechou outras vendas no meio tempo) demora 2 dias pra reenviar. Total perdido: 13 dias. Cenário 13 mostra a tela de expiração mas a régua de tempo de resposta do comercial não é desenhada.

**P6-2 · TI terceirizada bloqueia popup do WorkOS — SSO falha silenciosamente:**
Julia clica "Continuar com Google Workspace" no W5-A. Browser corporativo TransExpress (Edge gerenciado pelo TI terceirizado) tem popup blocker estrito → janela do OAuth nunca abre. **Dor potencial:** wireframe não mostra fallback "popup bloqueado, clique aqui pra abrir em nova aba"; Julia fica olhando tela parada por 2 minutos antes de tentar de novo. Sem mensagem de erro = ticket.

**P6-3 · Boleto pra impl com vencimento em 30 dias (TransExpress paga em D+30):**
Política de pagamento do TransExpress: boletos só pagos em D+30 do vencimento. Mas o boleto que o comercial liberou vence em 7 dias. Julia entra, gera, paga no D+30 → SUSPENSA. **Dor potencial:** régua D+3 do doc v5 dispara automático; Julia perde acesso quando a empresa dela está PAGANDO no prazo dela. Wireframe W3-A.2 mostra "vencimento em 7 dias" inflexível; sem campo "negociar vencimento" no fluxo.

**P6-4 · Audit trail de Julia (que sumiu) — TI nova chega 3 meses depois:**
Julia pediu demissão sem aviso 2 meses após o setup. Substituta Bárbara chega. TransExpress quer saber tudo que Julia fez. **Dor potencial:** Julia foi inativada (Story 2 Cenário 21 — preserva histórico). Mas Bárbara é convidada como Admin novo. Pra abrir o audit trail de Julia (que já é inativa), o menu kebab da Julia mostra "Visualizar" → modal abre com permissões + audit trail. OK. Mas Bárbara não sabe que Julia existe na lista (filtro default = só ativos?). Wireframe não desenha o toggle "incluir inativos".

**P6-5 · Convite duplicado batch de 20 com 1 e-mail malformado no meio:**
TransExpress quer convidar 20 motoristas de uma vez. Bárbara cola lista do Excel — um dos e-mails tem espaço no final (`motorista17@transexpress.com.br `). **Dor potencial:** Cenário Q5 diz "chip não criado, erro inline" — mas e os 19 chips que JÁ foram criados antes do erro? Bárbara não vê o erro porque está olhando o final da lista. Tenta enviar → bloqueio do submit. Sem mensagem clara de qual chip está malformado.
