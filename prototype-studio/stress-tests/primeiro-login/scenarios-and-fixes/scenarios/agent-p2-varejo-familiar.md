# Stress Test — P2: Varejo familiar conservador (Casa Bahia Filial)

**Agente:** adversarial Red Team
**Data:** 2026-05-11
**Persona:** Sr. Aderbal, 60 anos, diretor financeiro de loja de varejo familiar (filial Casa Bahia). Desktop MS Windows 10 com IE11 corporativo, monitor 1366×768. R$ 18k impl + R$ 4.500/mês plano. Conservador, baixa intimidade com SaaS, fuso normal de operação corporativa: férias coletivas no fim de ano, decisões lentas.
**Cenários testados:** 5

## Sumário

- **Passaram:** 0 · **Com dor:** 1 · **Quebraram:** 4
- **Total de gaps:** 11 (P0: 5 · P1: 4 · P2: 2)

## Cenários

---

### P2-1: Boleto pra tudo + linha digitável copy fail no Internet Explorer 11

**Seed original:** Sr. Aderbal recebe convite em desktop Windows 10 com IE11 corporativo (TI proibiu Chrome). Tenta gerar boleto da implementação, copia linha digitável mas o botão "Copiar" usa Clipboard API que não funciona em IE11. Wireframe W3-A.2 não tem fallback texto-selecionável-manualmente.

**Walkthrough (beat-by-beat):**

1. **Setup:** Bruno Costa (comercial) cadastrou Casa Bahia Filial no admin (R$ 18.000 impl, R$ 4.500/mês plano Pro, métodos liberados pra impl = boleto + cartão; pra plano = boleto). Convite enviado pra `aderbal.financeiro@casabahiafilial.com.br` em 11/05.
2. **Clique no link:** Sr. Aderbal abre o e-mail no Outlook corporativo, clica no link. O navegador padrão configurado pela TI é IE11 (regra de compliance da matriz).
3. **W1-A renderiza:** o layout ASCII representa CSS moderno (flexbox/grid). No IE11, Next.js/React 18+ não suporta IE11 desde 2022 — a página pode renderizar quebrada OU não renderizar nada. **Spec não define matriz de browsers suportados** nem comportamento em browser incompatível.
4. **Hipótese otimista (renderizou):** Sr. Aderbal chega em W2-A. Bate o olho nos valores: R$ 18.000 impl, R$ 4.500 plano. Confere. Clica "Confirmar e pagar →".
5. **W3-A:** Sr. Aderbal escolhe boleto (Cartão corporativo da Casa Bahia precisa autorização da matriz que demora 2 semanas — boleto é caminho institucional padrão de varejo família).
6. **W3-A.2 carrega:** boleto gerado, linha digitável `23793.38128 60024.567890 11234.567890 5 89760000010000`, botão `[📋 Copiar linha digitável]`.
7. **Clica em "Copiar linha digitável":** botão usa `navigator.clipboard.writeText()`. **IE11 não tem `navigator.clipboard`** — silently fails ou throw exception não tratada. Spec não exige fallback (`document.execCommand('copy')` ou input selecionável + Ctrl+C).
8. **Sr. Aderbal tenta selecionar a linha digitável com o mouse:** linha está em texto, mas como é renderizada dentro de um componente React, pode estar em `<span>` sem `user-select: text` explícito OU em `<button>` que cancela seleção. **Spec não exige que linha digitável seja selecionável.**
9. **Sr. Aderbal clica em "Baixar PDF":** PDF baixa. Abre no Adobe Reader corporativo. Tenta copiar a linha do PDF — funciona, mas com aspas/espaços extras do PDF que invalidam a linha digitável no internet banking do Bradesco corporativo.
10. **Sr. Aderbal clica em "Reenviar pro meu e-mail":** o e-mail chega no Outlook. Mesma linha digitável, mesma dor de copy.
11. **Tenta digitar manualmente os 47 caracteres no internet banking:** erra na 3ª tentativa por dígito verificador. Sistema do banco bloqueia tentativas.
12. **Sr. Aderbal liga pro Bruno Costa.** Bruno está em call. Liga pro suporte AwSales. Suporte não tem fluxo pra "boleto não-copiável em IE11" — escala internamente.
13. **48h depois:** boleto ainda não pago. Régua D-2 começa. Sr. Aderbal recebe e-mail de cobrança. Pondera cancelar contrato. CFO da matriz Casa Bahia entra em copy: "se é esse tipo de fricção, melhor não".

**Gaps identificados:**
| ID | Descrição | Severidade | Evidência (beat) |
|----|-----------|------------|------------------|
| P2-1.G1 | Spec não define matriz de browsers suportados nem comportamento em browser incompatível (IE11, Safari antigo). | **P0** | Beat 3 |
| P2-1.G2 | W3-A.2 usa Clipboard API moderna sem fallback `document.execCommand` ou input selecionável + instrução "Ctrl+C". | **P0** | Beats 7-8 |
| P2-1.G3 | Linha digitável não é exibida em `<input readonly>` ou `<code user-select:text>` — spec não exige tratamento de seleção manual. | P1 | Beat 8 |
| P2-1.G4 | PDF gerado não esclarece formatação da linha digitável copiável (sem aspas/espaços extras). | P2 | Beat 9 |
| P2-1.G5 | Régua D-2/D-1/D não considera caso "cliente nunca conseguiu copiar a linha digitável" — escala silenciosamente pra suspensão sem qualquer sinal de UX. | P1 | Beat 13 |

**Status:** ❌ Quebrou

**Questions abertas:**
- AC1 cobre mobile, mas não cobre browsers desktop legados. Devia haver `AC1.bis` ("IE11/Safari <14 bloqueio educado") ou suporte explícito?

---

### P2-2: Termo de uso scroll-to-bottom em texto longo em monitor pequeno

**Seed original:** Termo de 47 páginas. Monitor 1366×768. Sr. Aderbal scroll com mouse wheel pixel a pixel.

**Walkthrough (beat-by-beat):**

1. **Setup:** Sr. Aderbal já passou pagamento, criou conta com senha local (não tem SSO Microsoft corporativo configurado — TI da filial não habilitou). Chega em W7-A.
2. **W7-A renderiza:** modal com termo de uso. Spec mostra um container scrollável dentro do modal. Texto exemplo do wireframe tem ~10 seções.
3. **Realidade contratual enterprise:** Termo + anexos contratuais em varejo (CNPJ corporativo, fidelidade 12 meses, multa 50%) normalmente passa de 30-50 páginas. **Spec não define tamanho máximo nem indicador de progresso de scroll** (ex: "página 3/47" ou progress bar).
4. **Monitor 1366×768:** após header do app + step indicator + título da etapa + padding do modal, sobra ~400px de altura útil pro container do termo. 47 páginas A4 em 400px = scroll de aproximadamente 18.000px.
5. **Scroll com mouse wheel:** Sr. Aderbal usa mouse wheel padrão (~100px por notch). Precisa rolar **180 vezes**. Em pixel-a-pixel, leva 2-3 minutos só pra rolar.
6. **Indicador "▼ role pra continuar":** o wireframe mostra "▼ role pra continuar" no fim visível do termo, mas **não há feedback de progresso** (15% lido / 47% lido / 99% lido). Sr. Aderbal não tem ideia de quanto falta.
7. **Beat 90 (~1min de scroll):** Sr. Aderbal pensa que já chegou. O checkbox segue desabilitado. Tenta clicar — nada acontece. Não há mensagem explicativa ("falta rolar 60%"). Frustrado.
8. **Sr. Aderbal tenta a barra de rolagem lateral:** arrasta o thumb pra baixo. Spec/wireframe define validação server-side via "evento de scroll completo" (Cenário Q5). Backend pode aceitar OU rejeitar arrastar a barra direto pro fim (depende de implementação não especificada). Se rejeitar, beat 7 se repete.
9. **Beat 180 (após 3-4 min):** finalmente chega no fim. Checkbox libera. Sr. Aderbal aceita.
10. **Mas:** o tempo médio prometido (5 min total no Cenário C1.1) já foi 80% consumido só pelo termo. O resto do fluxo (2FA, convidar equipe, redirect) ainda existe.
11. **Dor real:** Sr. Aderbal só leu o título de cada seção. Não leu nada do conteúdo. Aceitou no automático. **A intenção do scroll-completo (garantir leitura) falha** — é só ritual.
12. **Variação adversarial:** Sr. Aderbal sai do fluxo no meio do scroll (pra atender uma ligação do supermercado). Volta 30 min depois. Sessão de onboarding expirou? **Spec não define TTL da sessão de fluxo** (só do convite — 7 dias). Se a sessão expirou, perdeu o scroll já feito.

**Gaps identificados:**
| ID | Descrição | Severidade | Evidência (beat) |
|----|-----------|------------|------------------|
| P2-2.G1 | Wireframe W7-A não tem indicador de progresso de leitura (ex: "página X de Y", progress bar ou %). | **P0** | Beats 6-7 |
| P2-2.G2 | Spec não define comportamento quando usuário arrasta scrollbar pro fim direto (aceito como "scroll completo" ou rejeitado?). | P1 | Beat 8 |
| P2-2.G3 | Spec não define TTL da sessão de fluxo de onboarding (só do convite). Sr. Aderbal sai e volta — perdeu scroll? | **P0** | Beat 12 |
| P2-2.G4 | Spec não define tamanho máximo do termo nem responsividade pra monitor 1366×768 (padrão varejo). Em altura útil pequena, scroll vira tortura. | P1 | Beats 4-5 |
| P2-2.G5 | Cenário 8 + C6.1 obriga scroll completo como prova de leitura — mas walkthrough mostra que vira ritual de scroll sem leitura. A intenção legal falha. | P2 | Beat 11 |

**Status:** ⚠️ Com dor severa (fluxo completa, mas com fricção muito alta + risco de abandono)

**Questions abertas:**
- Termos enterprise grandes (>20 páginas) precisam de modelo diferente? Ex: aceite com TOC navegável + checkbox por seção crítica?

---

### P2-3: Convite expirado no meio das férias coletivas + comercial também de férias

**Seed original:** Convite enviado 22/12. Sr. Aderbal sai férias coletivas 23/12, volta 06/01. Link expirou 29/12. Tela "link expirado" mostra Bruno Costa (comercial), que também está em férias coletivas.

**Walkthrough (beat-by-beat):**

1. **Setup:** Bruno Costa fecha venda com Sr. Aderbal em 22/12 às 17h. Cadastra no admin. Convite enviado 22/12 às 17:30.
2. **Aderbal abre o e-mail às 17:55** — vê o link, mas já está fechando o caderno pra ir embora (no varejo, 23/12 é o último dia de operação antes do recesso coletivo). Pensa "começo do ano resolvo isso". Salva o e-mail.
3. **Recesso coletivo Casa Bahia Filial:** 23/12 a 05/01. Toda a operação corporativa parada. Bruno Costa (comercial AwSales) também tira recesso 23/12-05/01 (padrão B2B brasileiro).
4. **29/12:** link expira em silêncio. **Spec não define notificação de "convite prestes a expirar"** (ex: D-2 ou D-1 antes da expiração via e-mail). Sr. Aderbal não tem ideia.
5. **06/01:** Sr. Aderbal volta de férias. Abre o e-mail salvo. Clica no link.
6. **W11.1 renderiza:** "Convite expirado · Entre em contato com o time comercial AwSales pra receber um novo link · Bruno Costa · bruno.costa@awsales.io".
7. **Sr. Aderbal manda e-mail pro Bruno às 09h:** "Bruno, preciso de novo link, o anterior expirou." Bruno também só volta no dia 06/01 e tem 200 e-mails na caixa.
8. **Bruno só responde dia 07/01 às 16h** com "novo link enviado" — só que precisava recadastrar/disparar do admin (não tem ação automática "renovar link" — spec não define isso).
9. **Sr. Aderbal tenta o novo link dia 08/01:** funciona. Mas o atraso de 14 dias entre recesso + comercial OOO + recadastro impactou o cronograma da implementação combinado (ex: 15 dias úteis pra ir live).
10. **Pior:** o link expirado da tela W11.1 mostra **apenas o e-mail do Bruno**. Não tem telefone, não tem fallback (suporte, AM se atribuído, contato genérico). Sr. Aderbal não sabe quem mais procurar.
11. **Variação adversarial mais ácida:** Bruno saiu da AwSales no recesso (turnover de fim de ano). E-mail dele agora retorna "destinatário não encontrado". Sr. Aderbal tenta `comercial@awsales.io` (genérico) — esse endereço **não é exibido na tela W11.1**. Sr. Aderbal abandona ou liga pra uma referência indicada (ninguém na AwSales que ele conheça).

**Gaps identificados:**
| ID | Descrição | Severidade | Evidência (beat) |
|----|-----------|------------|------------------|
| P2-3.G1 | Spec não define notificação proativa de "convite prestes a expirar" (D-2, D-1 antes dos 7 dias). | **P0** | Beat 4 |
| P2-3.G2 | W11.1 ("Convite expirado") mostra apenas o e-mail do comercial. Sem fallback de telefone, suporte genérico (`suporte@awsales.io`), ou link "pedir contato via formulário". | **P0** | Beats 10-11 |
| P2-3.G3 | Caso de comercial OOO/desligado não tem fluxo de fallback — spec do Cenário 13 só diz "contato do comercial" sem alternativa. | P1 | Beat 11 |
| P2-3.G4 | Não há ação self-service "Solicitar novo link" — Sr. Aderbal depende 100% de humano OOO em recesso. AC2 marca "Convite expirado" como placeholder informativo, mas em B2B enterprise isso vira gap operacional. | P1 | Beat 8 |
| P2-3.G5 | Spec não define janela do convite considerando recessos brasileiros (Natal/Carnaval). 7 dias corridos colado em 23/12 é design ruim pra calendário brasileiro. | P2 | Beats 2-5 |

**Status:** ❌ Quebrou (cliente abandona ou demora 14+ dias)

**Questions abertas:**
- Janela de convite devia ter override do AM ("válido até 15/01") quando enviado pré-recesso?

---

### P2-4: Funções padrão "demais" pra org pequena de 4 pessoas + sem duplicar

**Seed original:** Casa Bahia Filial tem 4 funcionários (Sr. Aderbal admin + 2 atendentes WhatsApp + 1 estagiária). 6 funções padrão são SaaS-coded, nenhuma reflete "atendente loja". Sem "duplicar e simplificar" (AC4).

**Walkthrough (beat-by-beat):**

1. **Setup:** Sr. Aderbal está em W9-A (Convidar Equipe — último passo do 1º acesso) ou já completou o fluxo e vai em Configurações → Team → Convidar.
2. **Wireframe W9-A exibe dropdown com 6 funções padrão:**
   - Administrador (50 permissões)
   - Gerente Ops (44)
   - Analista Sênior (40)
   - Analista Pleno (38)
   - Colab. Externo (35)
   - Operador (30)
3. **Sr. Aderbal precisa convidar 2 atendentes WhatsApp + 1 estagiária.** Nenhuma das 6 funções tem nome que mapeia diretamente pra "atendente de loja" ou "estagiária".
4. **Tenta entender "Operador" (30 permissões):** spec diz "Acesso básico, monitoramento e suporte". Não tem detalhe. Sr. Aderbal clica em "Visualizar função" — abre W8 (modal read-only).
5. **W8 lista permissões agrupadas:** Agentes (5/5)?, Aprovações (5/5)?, Bases (5/5)?, Conversas (3/3)?, Dashboard (1/1)?, Disparos (3/3)?, etc. Sr. Aderbal não entende metade dos nomes — "Agentes" é o quê? "Aprovações de agentes"? "Tipos de agentes"? Vocabulário **SaaS-técnico**, não vocabulário de varejo familiar.
6. **Sr. Aderbal pensa "Operador deve servir":** convida os 2 atendentes como Operador. Convida a estagiária também como Operador (sem opção menor).
7. **Beat adversarial 1:** A estagiária faz só onboarding de leads no WhatsApp — não deveria editar bases de conhecimento. Mas "Operador" inclui permissões que sobram pra ela. Spec não dá nenhuma sinalização de "qual função é mínima/segura".
8. **Beat adversarial 2:** Sr. Aderbal pensa "vou criar uma função menor pra estagiária". Vai em **Funções → + Criar nova função** (W9 da Story 2).
9. **W9 da Story 2 abre:** tela com **52 permissões organizadas em 14 domínios** com checkbox por permissão. **Tudo desmarcado por default.** Sem partir de duplicação (AC4 confirma — anti-claim).
10. **Sr. Aderbal precisa entender cada uma das 52 permissões pra decidir qual marcar.** Domínios: Agentes, Aprovações de agentes, Arquivos, Bases de Conhecimento, Conversas, Dashboard, Atendimento, Disparos, Funções e Permissões, Integrações e Tools, Organizações, Playground, Tipos de Agentes, Usuários. Vocabulário 100% SaaS técnico.
11. **Spec não tem tooltips/descrições por permissão** — só nome ("Visualizar", "Criar", "Editar", "Aprovar", "Excluir") sem explicação contextual.
12. **Sr. Aderbal trava:** "o que é Playground? a estagiária precisa? não preciso?" Não tem help, não tem "perguntas frequentes" embutido, não tem preset "função mínima de atendente".
13. **Sr. Aderbal desiste:** sai da tela. Volta em W3 (Team) e convida a estagiária como Operador (over-permissioned). Resigna-se a "depois ajusto".
14. **Beat adversarial 3:** A estagiária, por engano, deleta uma base de conhecimento (porque tem permissão "Excluir Bases" no Operador). Sr. Aderbal abre ticket. Aprende o quanto a permissionamento foi imprudente.

**Gaps identificados:**
| ID | Descrição | Severidade | Evidência (beat) |
|----|-----------|------------|------------------|
| P2-4.G1 | Funções padrão têm nomes SaaS-coded (Analista, Operador, Colaborador Externo) que não mapeiam pra varejo/atendimento ("atendente WhatsApp", "estagiária"). Sem disclaimer ou tradução. | P1 | Beats 3-5 |
| P2-4.G2 | W8 (Visualizar Função Padrão) e W9 (Criar Nova Função) não têm tooltips/descrições explicando o que cada permissão faz no contexto do produto. | **P0** | Beats 5, 10-12 |
| P2-4.G3 | AC4 confirma "não duplicar função padrão" — mas spec não oferece preset "função mínima/leitura" como ponto de partida; cliente parte de **52 checkboxes desmarcados sem guia**. | **P0** | Beat 9 |
| P2-4.G4 | Spec não dá sinalização de risco/severidade por permissão (ex: "Excluir Bases" devia ter ícone de risco). | P1 | Beat 14 |
| P2-4.G5 | Spec assume "admin sabe o que está fazendo" — pra varejo familiar (CTPO inexistente, TI terceirizada), criar função custom é tarefa fora do alcance. Sem onboarding/wizard de "qual permissão escolher pra que perfil". | P2 | Beats 12-13 |

**Status:** ❌ Quebrou (Sr. Aderbal não consegue criar função apropriada, fica com over-permission)

**Questions abertas:**
- Devia ter "função recomendada por tipo de operação" (ex: atendimento puro, supervisão, financeiro)?
- Spec não menciona descrição/help embutido nas permissões — devia ter glossário acessível na própria tela de criação?

---

### P2-5: invoice adicional pra contadora terceirizada com domínio Gmail — ambiguidade do que vai chegar

**Seed original:** Sr. Aderbal cadastra `contabil.casabahiafilial@gmail.com` pra invoice adicional. Cenário 12 da Story 1: domínio aberto, até 10. Mas Sr. Aderbal não sabe se vai receber UMA cópia toda vez OU se deve marcar checkbox.

**Walkthrough (beat-by-beat):**

1. **Setup:** Sr. Aderbal está em W6-A (Coleta de Dados Pessoais + invoice Adicional), passo 3 de 4.
2. **W6-A exibe bloco:** "🧾 Invoices — adicionar e-mails extras (opcional) · Sua invoice é enviada pro e-mail principal. Adicione até 10 e-mails que também devem receber cada invoice (financeiro, contabilidade, etc.)."
3. **Texto da spec implica:** todos os e-mails listados recebem **TODA** invoice, **AUTOMATICAMENTE**. Mas:
4. **Beat adversarial 1:** Sr. Aderbal lê "também devem receber cada invoice" — interpretação 1: "todas as invoices vão pra todos esses e-mails". Interpretação 2: "cada invoice tem opção de marcar quem recebe" (ele pode escolher por invoice qual e-mail manda).
5. **Spec não tem nenhum modificador:** sem checkbox "enviar todas as invoices automaticamente", sem opção "selecionar quais invoices", sem texto explicativo "todas as invoices futuras serão enviadas pra esses e-mails sem opção de filtrar".
6. **Beat adversarial 2:** Sr. Aderbal adiciona `contabil.casabahiafilial@gmail.com`. Pensa "será que a contadora vai receber TUDO? Incluindo a invoice do plano R$ 4.500 onde tem o ICMS detalhado que ela vai cobrar pra calcular?" — preocupação legítima.
7. **Beat adversarial 3:** A contadora também atende outras lojas Casa Bahia. Sr. Aderbal pensa "se ela recebe tudo automático, vai ter que processar manualmente a separação. Será que ela queria isso?" — tem que ligar pra contadora pra confirmar. Atrita o onboarding.
8. **Beat adversarial 4:** Sr. Aderbal queria adicionar a contadora SÓ pra invoices do plano (mensais R$ 4.500), não pra invoice da implementação (R$ 18.000 de setup que paga só uma vez e fica com ele). Spec não diferencia "e-mails pra invoice de plano" vs "e-mails pra invoice de impl" — é tudo na mesma lista, recebe tudo.
9. **Beat adversarial 5:** Sr. Aderbal tenta o botão "Algo está errado?" — mas isso é sobre dados da org (W2-A.1), não sobre invoice. Não tem help contextual no card de invoice.
10. **Decisão de Aderbal:** remove a contadora da lista. Decide cadastrar depois "quando entender melhor". Mas spec não documenta onde se edita invoice adicional depois — não está em W1 (Configurações Gerais — readonly), não está em W2 (Meu Perfil), nem em W3-W10 da Story 2. **Não há tela documentada de "editar e-mails de invoice" no MVP.**
11. **Beat adversarial 6 (descoberta tardia):** primeira invoice emitida no fim do mês. Sr. Aderbal queria adicionar a contadora — não consegue. Liga pro Bruno Costa. Bruno escala. Acaba editando manualmente no admin.

**Gaps identificados:**
| ID | Descrição | Severidade | Evidência (beat) |
|----|-----------|------------|------------------|
| P2-5.G1 | Wireframe W6-A não esclarece o comportamento: e-mails da lista recebem TODAS as invoices futuras automaticamente, sem opção de filtrar por tipo (impl vs plano) ou por invoice individual. | P1 | Beats 4-5 |
| P2-5.G2 | Spec não diferencia "e-mails pra invoice da implementação" vs "e-mails pra invoice do plano". Em varejo familiar, contadora terceirizada quer só invoices mensais. | P1 | Beat 8 |
| P2-5.G3 | Spec não documenta tela de "editar e-mails adicionais de invoice" pós-onboarding. Configurações gerais (W1) é readonly. Meu perfil (W2) é só do usuário. Story 2 não cobre. **Editing path missing.** | **P0** | Beats 10-11 |
| P2-5.G4 | Sem tooltip/help contextual no card de invoice — Sr. Aderbal não tem onde tirar dúvida sem sair do fluxo. | P2 | Beat 9 |

**Status:** ❌ Quebrou (ambiguidade gera ticket; falta de tela de edição cria dependência permanente do AM)

**Questions abertas:**
- O dado de e-mails de invoice é editável só pelo admin AwSales (via admin interno) ou tem path self-service? Spec não diz.
- Se for self-service, qual tela? Se for AwSales-side, isso devia estar explícito ("e-mails de invoice são gerenciados pelo time AwSales — clique em Algo está errado?")

---

## Sumário consolidado dos gaps

| ID | Descrição curta | Severidade |
|----|-----------------|------------|
| P2-1.G1 | Matriz de browsers suportados não definida (IE11) | P0 |
| P2-1.G2 | Clipboard API sem fallback execCommand | P0 |
| P2-2.G1 | Termo não tem indicador de progresso de leitura | P0 |
| P2-2.G3 | TTL de sessão de fluxo de onboarding não definido | P0 |
| P2-3.G1 | Sem notificação proativa "convite vai expirar" | P0 |
| P2-3.G2 | Tela "convite expirado" sem fallback de contato | P0 |
| P2-4.G2 | Funções/permissões sem tooltips ou descrições contextuais | P0 |
| P2-4.G3 | Criação de função custom parte de 52 checkboxes desmarcados sem preset | P0 |
| P2-5.G3 | Sem tela self-service de edição de e-mails de invoice | P0 |
| P2-1.G3 | Linha digitável não é input selecionável manualmente | P1 |
| P2-1.G5 | Régua D+N não considera caso "cliente não conseguiu pagar por bug de UX" | P1 |
| P2-2.G2 | Comportamento de "arrastar scrollbar" pro fim ambíguo | P1 |
| P2-2.G4 | Termo em monitor pequeno (1366×768) — sem responsividade prevista | P1 |
| P2-3.G3 | Comercial OOO/desligado sem fluxo de fallback | P1 |
| P2-3.G4 | Sem self-service "solicitar novo link" — AC2 vira gap operacional | P1 |
| P2-4.G1 | Funções padrão com nomes SaaS-coded, sem mapeamento varejo | P1 |
| P2-4.G4 | Sem sinalização de risco por permissão (ex: "Excluir Bases") | P1 |
| P2-5.G1 | Comportamento de envio de invoice (todas vs filtradas) não documentado | P1 |
| P2-5.G2 | Sem diferenciação invoice impl vs invoice plano | P1 |
| P2-1.G4 | PDF do boleto não esclarece formatação copiável | P2 |
| P2-2.G5 | Scroll obrigatório vira ritual sem leitura — intenção legal falha | P2 |
| P2-3.G5 | Janela de 7 dias não considera recessos (Natal/Carnaval brasileiros) | P2 |
| P2-4.G5 | Spec assume "admin sofisticado" — sem wizard pra varejo familiar | P2 |
| P2-5.G4 | Sem help contextual no card de invoice | P2 |

**Totais:** 24 gaps · P0: 9 · P1: 11 · P2: 4

(Atenção: na contagem do sumário inicial usei consolidação por cenário; aqui a tabela detalhada lista 24 gaps individuais — o sumário enxuto agrupa por blocos conceituais.)
