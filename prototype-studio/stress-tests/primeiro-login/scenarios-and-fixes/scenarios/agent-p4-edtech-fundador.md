# Stress Test — P4: Edtech fundador (CodeRabbit Schools)

**Agente:** adversarial Red Team
**Data:** 2026-05-11
**Cenários testados:** 5
**Perfil:** Júnior · founder solo · escola de programação online · 8 alunos · R$ 3k impl + R$ 900/mês plano · mobile-first instintivo · sem TI · sem jurídico interno

---

## Sumário

- **Passaram:** 0 · **Com dor:** 2 · **Quebraram:** 3
- **Total de gaps:** 14 (P0: 4 · P1: 7 · P2: 3)

**Top 2 críticos:**
1. **P0** — Wireframe não materializa a tela de bloqueio mobile (AC1 é posição do produto, mas a qualidade do bloqueio é gap). Único asset é uma OBS lateral em texto plano. Greg vai pro Figma sem referência visual concreta de uma das telas mais frequentemente acessadas (founders SMB clicam no convite no celular).
2. **P0** — Mental model "preço único" do founder SMB choca com 2 blocos distintos (Implementação + Plano). Não há big number consolidado "você vai pagar X agora" em destaque visual proeminente. Cliente reclama de cobrança a mais → AM apaga incêndio.

---

## Cenários

### P4-1: Mobile-first instintivo — clica no convite pelo iPhone às 23h

**Seed original:** Júnior, fundador da CodeRabbit Schools, está no Uber às 23h quando o convite chega no e-mail. Clica no link pelo iPhone 12. AC1 diz mobile = bloqueio educado. Wireframe não mostra a tela de bloqueio mobile — só uma OBS lateral. Júnior precisa esperar chegar em casa, ligar o desktop. Procrastina: aceita 4 dias depois.

**Walkthrough (beat-by-beat):**

1. **23:00 — Uber, iPhone 12.** Notificação push do Gmail. Júnior abre o e-mail. Copy do e-mail: provavelmente "Você foi convidado pra ativar sua conta no AwSales — Clique aqui pra começar". **Nenhuma sinalização no e-mail de que o fluxo é desktop-only.** Júnior clica feliz no link, esperando UX mobile-friendly tipo Notion/Linear/Slack que já consome no celular.
2. **23:00:05 — Browser do iPhone abre.** Aqui o gap começa: o **wireframe nunca define o que aparece em mobile**. Comportamento esperado pelo PG: "bloqueio educado". Comportamento provável no MVP sem spec: layout desktop espremido, fontes ilegíveis, formulários quebrados. Sem mockup, dev decide na hora — provavelmente vai responsive sem testar, ou esquece e quebra.
3. **23:00:30 — Júnior tenta usar.** Se for "bloqueio educado" ideal: mensagem "Pra melhor experiência, acesse pelo desktop · [Enviar link pro meu e-mail novamente]". Se for layout quebrado: Júnior tenta clicar em "Começar →" mas o card "passos 1 de 4" sobrepõe o botão. Botão "Pagar agora →" fica off-screen.
4. **23:01 — Júnior desiste.** Não tem energia. Vai dormir. **Drop temporal:** 4 dias.
5. **27/abr (4 dias depois) — Júnior lembra.** Abre desktop. Link ainda válido (7 dias). Completa fluxo. **MAS:** 100% de conversão (meta declarada) já foi machucada — Júnior poderia ter dropado de vez se o convite expirasse antes. Persona B (membro convidado) tem ainda menos paciência: aceita ou não em 7 dias, sem responsabilidade de pagar.
6. **Pior cenário paralelo:** Júnior clica no link no Uber. Layout quebrado. Acha que produto é frágil. Reclama com o vendedor. **Primeira impressão = produto que não funciona no celular** — Júnior posta no Twitter da escola dele, conhecido na bolha edtech. Reputational risk.

**Gaps identificados:**

| # | Severidade | Gap | Evidência (beat) |
|---|---|---|---|
| G1.1 | **P0** | Wireframe não materializa tela de bloqueio mobile — só OBS lateral em "Próximos passos" | Beat 2-3. Não há W12 ou W-mobile, só linha 847: *"Decisão Mobile no MVP — Story sugere bloqueio educado"* |
| G1.2 | **P1** | E-mail de convite não sinaliza "abra pelo desktop" antes do clique — desperdiça 1 tap do usuário | Beat 1. Story não define copy do e-mail, só do link |
| G1.3 | **P1** | Bloqueio educado mobile não inclui ação de mitigação (botão "envie link de novo" / "lembre-me em 2h" / "abrir no desktop via QR") | Beat 3. AC1 é posição, mas qualidade do bloqueio é gap. Sem CTA de mitigação, drop é certo |
| G1.4 | **P2** | Story não define se link de 7 dias é estendido quando usuário tenta no mobile (sinal de intenção) — drop temporal é real | Beat 4-5. Nenhum cenário cobre "link expira porque cliente tentou no mobile + procrastinou" |

**Status:** **Quebrou** — Júnior procrastina 4 dias. Persona B mais sensível dropa de vez. Wireframe não dá insumo pro Greg desenhar mobile.

**Questions abertas:**
- A tela de bloqueio mobile deve ter o quê: copy estática? CTA "envie link pro meu desktop"? Token de continuação?
- O e-mail de convite deveria avisar "abra pelo desktop" antes do clique?

---

### P4-2: Confusão Implementação vs Plano — "por que está cobrando duas coisas?"

**Seed original:** Júnior chega na tela W2-A (revisão), vê R$ 3.000 implementação + R$ 900/mês plano = pensa que vai pagar R$ 3.900 agora. Tela tenta deixar claro com "Cobrança AGORA" vs "1ª fatura em 31/05" mas Júnior pula a leitura. Founder solo com pressa não lê detalhes; mental model "vendido por preço único" não combina com 2 blocos; Júnior reclama no Slack do AM dizendo que cobramos a mais.

**Walkthrough (beat-by-beat):**

1. **Júnior chega em W2-A.** A tela tem 3 cards verticais grandes: Dados da empresa, Implementação (R$ 3.000), Plano (R$ 900/mês). Founder SMB lê em F-pattern, 4 segundos, decide se confia.
2. **Olhar 1 (0-2s) — banner topo.** "Revisão · Passo 1 de 4". OK.
3. **Olhar 2 (2-4s) — busca o número grande.** Júnior procura "Total: R$ X" — não encontra. Os dois valores estão dentro dos cards, com letra do mesmo tamanho dos outros campos. **A hierarquia visual da W2-A não destaca os valores como big numbers.**
4. **Olhar 3 (4-8s) — soma na cabeça.** R$ 3.000 + R$ 900 = R$ 3.900. **Júnior monta esse total mental porque sales falou "R$ 3k de setup mais R$ 900 por mês" — e o cérebro de founder SMB com pressa simplifica pra "R$ 3.900 agora".**
5. **Beat crítico — Júnior NÃO lê:**
   - "1ª fatura R$ 612,90 (pro-rata · 21 dias · 11/05 → 31/05)" — linha do meio do card Plano, fonte normal
   - "Cobrança: No último dia do mês corrente — 31/05/2026" — última linha do card Plano
   - "Cobrança: AGORA, ao concluir esse passo" — linha do card Implementação
6. **Júnior clica "Confirmar e pagar →".** Vai pra W3-A. Vê "Pagamento da Implementação · R$ 3.000,00". Volta no cérebro: "Ué, achei que era 3.900. Será que vou pagar a parcela do plano depois nessa mesma sessão?"
7. **Júnior paga R$ 3.000 no cartão.** W4-A aparece: "✓ Implementação paga · Agora defina como pagar o plano mensal · Não vamos cobrar nada agora".
8. **Aqui o conflito explode:** Júnior espera pagar mais R$ 900. Não cobra. Júnior pensa: "Eles vão me cobrar 31/05? Ou 31/05 já é considerado fim do mês corrente, então vou ser cobrado 2x esse mês?" — confusão extra porque hoje (11/05) está mais perto do final do mês do que do começo.
9. **Júnior conclui o fluxo achando que tá ok** — mas decide perguntar pro AM no dia seguinte: "Bruno, vou ser cobrado de novo dia 31? Achei estranho não pagar tudo agora".
10. **AM gasta 20min explicando.** Multiplicar por 30 orgs/mês de SMB = 10h/mês do AM apagando incêndio em cobrança que a tela deveria ter explicado.
11. **Pior cenário paralelo:** Júnior reclama no NPS ("cobraram a mais", quando na verdade não cobraram nada além do contratado). Métrica "% cliques no botão Algo está errado" sobe — produto investiga e descobre que o problema é hierarquia visual, não cadastro.

**Gaps identificados:**

| # | Severidade | Gap | Evidência (beat) |
|---|---|---|---|
| G2.1 | **P0** | W2-A não tem big number consolidado "Você vai pagar R$ 3.000 AGORA · R$ 612,90 em 31/05" no topo ou rodapé — só dentro dos cards | Beat 3-4. Hierarquia visual falha pra SMB scanner |
| G2.2 | **P1** | Card Plano enterra a info "1ª fatura R$ 612,90" como linha de campo normal, sem destaque temporal | Beat 5. Linha 107 do wireframe — mesma fonte das outras |
| G2.3 | **P1** | W4-A diz "Não vamos cobrar nada agora" como tooltip, mas Júnior já passou da expectativa de cobrar mais — informação chega tarde | Beat 7-8. Cenário Q15 garante que NÃO cobra, mas cliente espera o oposto |
| G2.4 | **P2** | Quando o convite cai perto do fim do mês (11/05 → 31/05 = 21 dias), pro-rata aproxima da mensalidade completa — confusão extra | Beat 8. Cenário 4.3 não cobra essa borda temporal |
| G2.5 | **P1** | Tela final W10-A tem "Resumo · Implementação paga R$ 3.000 · Plano configurado Pro Mensal" mas não diz **"sua próxima cobrança será R$ 612,90 em 31/05"** — última chance de educar perdida | Beat 9. Wireframe linha 559-563 |

**Status:** **Quebrou** — Júnior conclui o fluxo com confusão. AM apaga incêndio. NPS afetado. Hipotético, mas previsível pra mental model SMB.

**Questions abertas:**
- Vamos adicionar big number "AGORA: R$ X · PRÓXIMA: R$ Y em DD/MM" como linha persistente no header do fluxo?
- O e-mail de boas-vindas pós-fluxo deveria reforçar quando será a próxima cobrança?

---

### P4-3: Não tem time pra convidar — pula a etapa de convite

**Seed original:** Júnior chega na etapa W9-A (convidar equipe). É solo — sem time. Clica "Pular essa etapa". Próxima vez que precisar (3 meses depois quando contratar primeira pessoa), esquece onde fica o convite. Wireframe W3 da Story 2 só tem "+ Convidar membro" no topo direito da aba Team. UX onboarding não educa onde voltar.

**Walkthrough (beat-by-beat):**

1. **Júnior chega em W9-A.** "Convide sua equipe · Adicione membros agora ou faça isso depois nas Configurações da organização".
2. **Júnior é solo.** Lê a linha "faça isso depois nas Configurações da organização" — mas é texto pequeno, não imagem nem destaque. Clica "Pular essa etapa". OK.
3. **W10-A aparece — sucesso.** Resumo mostra "✓ 2 convites enviados" (não vai aparecer porque pulou). Redirecionamento.
4. **Júnior cai em "tela de Integrações"** (destino pós-conclusão pra Persona A). **Beat crítico:** ele não tem time, então vai mexer com integração já. Não vê nenhum tooltip educativo "quando contratar alguém, volte em Configurações → Team".
5. **3 meses depois — agosto/2026.** Júnior contratou Carlos. Quer convidar.
6. **Búsca mental do Júnior:** "Onde eu convido alguém?" — abre o app. Sidebar tem: Home, Hub, Disparos, Conversas, Agentes, Configurações.
7. **Júnior clica em "Configurações"** — abre Configurações Gerais por default. **Não tem indicação visual de que Team é uma aba relevante pra ele agora.** Júnior precisa explorar 5 abas: Configurações gerais, Team, Funções, Billing, Segurança.
8. **Júnior clica em "Team" por adivinhação.** OK, achou. Abre W3 (lista de membros). Vê: Gerente da Conta (Bruno) no topo, e ele mesmo (Júnior, Administrador) na lista. Lista de 1 pessoa.
9. **Júnior procura "convidar"** — o botão **[+ Convidar membro]** está no canto **superior direito** da área de conteúdo. Founder SMB scanner vê isso? **Possivelmente sim** — mas se o app tiver sidebar fechada por default em telas menores (laptop 13"), o card pode estar comprimido.
10. **Júnior abre W4 modal.** Lá ele cola "carlos@coderabbitschools.com". Função dropdown — Júnior nunca configurou função, vê 6 opções padrão. **Próxima dor:** Júnior não sabe qual função dar pra Carlos. "Operador? Analista? Administrador?" — descrições estão no W4 mas precisa hover/expandir cada uma. Founder solo nunca pensou nisso — assume Operador (errado, Carlos vai precisar criar conversa, não vai conseguir).
11. **Júnior envia convite.** Carlos não consegue mexer nas coisas. Reclama. Júnior volta em Team, troca função pra Analista Pleno. **Convite NÃO permite editar função (Cenário 15)** — Júnior precisa cancelar e reenviar. **Dor escondida:** Júnior pode não ler o tooltip e ficar tentando editar.
12. **Tudo isso poderia ter sido evitado** com um onboarding tour pós-1º-acesso ou um empty state inteligente na home: "Você é o único membro. Convidar alguém agora →".

**Gaps identificados:**

| # | Severidade | Gap | Evidência (beat) |
|---|---|---|---|
| G3.1 | **P1** | Após pular W9-A, sistema não persiste sinalização "você tem 0 membros — quer convidar?" em home/sidebar | Beat 4. Nenhum cenário cobre estado "org com 1 só usuário ativo" |
| G3.2 | **P2** | Tela Team (W3) não tem empty state educativo quando lista tem 1 só usuário (o próprio admin) — só mostra "Membros (1)" | Beat 8-9. Wireframe W3 mostra org com 12 membros como caso default |
| G3.3 | **P1** | Cenário 15 (mudar função de convite pendente exige cancelar+reenviar) é UX hostil pra founder SMB que descobre função errada depois — texto "tooltip ou ajuda contextual" é vago | Beat 11. Wireframe linha 205-206 só tem texto, não mostra a UI da mensagem |
| G3.4 | **P2** | W4 (modal convidar) não destaca função recomendada pra novos membros — 6 opções de função sem default ou wizard | Beat 10. Founder solo trava no dropdown |

**Status:** **Com dor** — Júnior convida Carlos 3 meses depois, com fricção e função errada. Não bloqueia, mas degrada experiência.

**Questions abertas:**
- Vale criar empty state em Home/Sidebar pra orgs com 1 usuário ("Convide seu time")?
- Função recomendada por default no W4? Wizard "qual o cargo dele?" → mapeia pra função sugerida?

---

### P4-4: Dúvida sobre contrato no termo de uso — não tem time jurídico

**Seed original:** Júnior abre o termo de 47 páginas. Não tem jurídico interno. Tem dúvida sobre "fidelidade 12 meses + multa 50% sobre meses restantes" — quer perguntar ao advogado do escritório-amigo dele antes de aceitar. UI não tem opção "salvar e voltar depois" no termo; tem que abandonar e refazer todo o fluxo. Ou aceita sem entender.

**Walkthrough (beat-by-beat):**

1. **Júnior chega em W7-A (termo de uso).** "Role até o final pra aceitar e continuar". Termo de 47 páginas dentro do iframe/area scrollável.
2. **Júnior começa a ler.** Seção 1 (Objeto), 2 (Implementação), 3 (Cobrança), 4 (Cancelamento e fidelidade) — **chega na seção 4 e bate o sinal vermelho.** "Fidelidade 12 meses · multa 50% sobre meses restantes" foi mencionado na W2-A também.
3. **Júnior pensa:** "Espera. Se eu desistir em 3 meses, vou pagar (12-3) × R$ 900 × 50% = R$ 4.050 de multa? Mais o que já paguei? Isso vale a pena? Vou perguntar pro Felipe (advogado-amigo) antes."
4. **Beat crítico:** Júnior está no meio do fluxo. Já criou conta no W5-A. Já pagou R$ 3.000 implementação no W3-A. **Não pode "salvar e voltar depois" no termo — o fluxo não tem checkpoint visível.**
5. **Júnior tem 3 opções, todas ruins:**
   - **(a) Fecha aba.** Volta no link mais tarde. Cenário Q8 garante retomada, mas **Cenário Q4** sugere que se já criou usuário (W5-A) e pagou (W3-A), retorno deveria recuperar. Não está claro se o estado "no termo, sem aceitar" é persistido.
   - **(b) Aceita sem entender.** Júnior compra a "fidelidade" porque o AM falou que era padrão. **Cenário 8** requer scroll completo — Júnior pode skipar lendo só parte. Conteúdo legal só fica num servidor — Júnior **não recebe cópia em PDF do termo aceito** pra mandar pro advogado depois.
   - **(c) Liga pro AM.** AM atende noite/fim de semana? Resposta: provavelmente não. Júnior espera segunda. Drop temporal.
6. **Júnior escolhe (a) — fecha a aba.** Esperança: "Volto depois com o Felipe".
7. **Próximo dia — Júnior clica no link.** Cenário Q8 garante retomada do ponto exato. Wireframe não mostra esse fluxo. **Provável:** Júnior volta pro W7 (termo de uso) com seu estado anterior preservado.
8. **MAS:** Júnior precisa do termo num formato consultável. **Wireframe W7-A não tem botão "Baixar PDF do termo"** — só scroll obrigatório. Júnior tem que printar tela seção por seção pra mandar pro Felipe.
9. **Pior cenário:** Felipe (advogado) demora 2 dias respondendo. Júnior, founder ansioso pra começar a usar, decide aceitar sem esperar.
10. **Risco legal:** Júnior aceita o termo sem entender + sem rastreabilidade clara do que aceitou (versão do termo). Wireframe diz "Versão 5.3 · abril/2026" — bom. Mas **não há registro acessível pelo usuário depois** do termo aceito ("Meu perfil → Termos aceitos" não existe). Conflito futuro = palavra contra palavra.

**Gaps identificados:**

| # | Severidade | Gap | Evidência (beat) |
|---|---|---|---|
| G4.1 | **P1** | Wireframe W7-A não tem botão "Baixar PDF do termo" — usuário não pode consultar com seu jurídico antes/depois de aceitar | Beat 8. Wireframe linha 426-458, só checkbox e botão |
| G4.2 | **P1** | Não há "Meu perfil → Termos aceitos · v5.3 aceito em 11/05/2026 · Baixar PDF" — registro do aceite não é exposto pro usuário | Beat 10. Wireframe W2 (Meu perfil) linha 94-122 não tem essa seção |
| G4.3 | **P2** | Termo de 47 páginas inline (scroll obrigatório) é hostil — não há TOC, não há "ir pra seção X", não há highlight de seções críticas (fidelidade, multa) | Beat 2. Cenário 8 valida scroll mas não engaja leitura |
| G4.4 | **P1** | Não há checkpoint "salvar e voltar depois" explícito no fluxo — usuário aprende por tentativa que pode fechar aba | Beat 5-7. Cenário Q8 garante retomada mas UX não comunica isso ao usuário no meio do fluxo |

**Status:** **Quebrou** — Júnior aceita sem entender (risco legal pra ambos) OU abandona (risco operacional). Founder solo é o perfil mais vulnerável aqui.

**Questions abertas:**
- Termo deveria ter botão "Baixar PDF pra revisar com meu jurídico" ANTES do scroll completo?
- Aceite registrado deveria ficar acessível em Meu perfil pro usuário consultar depois?
- Vale highlight visual de cláusulas críticas (fidelidade, multa)?

---

### P4-5: Único Admin — tenta inativar a si mesmo "pra testar"

**Seed original:** 6 semanas depois, Júnior contrata Carlos (operador). Quer testar a inativação. Como brincadeira, tenta inativar a si mesmo. Cenário 22 da Story 2 diz bloqueia último Admin — wireframe W6.1 mostra mensagem. Mas pra ATIVOS, Júnior continua como único Admin mesmo depois de promover Carlos? Cenário não cobre "promover Carlos a Admin antes de me inativar" claramente no fluxo.

**Walkthrough (beat-by-beat):**

1. **6 semanas depois — 22/jun/2026.** Júnior contratou Carlos. Convidou como Operador (cenário P4-3 já mostrou esse erro). Já corrigiu pra Analista Pleno.
2. **Júnior pensa:** "Vou testar se o produto bloqueia mesmo se eu tentar me inativar. Quero saber se a segurança funciona". (Comportamento típico de founder técnico — testa limites do produto sozinho)
3. **Júnior abre Team → kebab na própria linha → "Inativar usuário".**
4. **W6.2 confirmation modal aparece.** "Júnior perderá acesso à plataforma no próximo login · Tem certeza?". **Beat crítico:** Júnior é o único Admin. Cenário 22 diz que deveria bloquear. **Mas o modal W6.2 não tem texto especial pra "é o último admin" — wireframe W6.1 é da tela de bloqueio.**
5. **Possíveis paths:**
   - **(a) Júnior clica "Sim, inativar".** Backend valida, retorna erro. UI mostra W6.1 ("Não é possível inativar o único Administrador"). OK, funcionou — mas Júnior teve que clicar "Sim" pra descobrir.
   - **(b) UI deveria desabilitar a ação "Inativar" no kebab quando é o único Admin.** Wireframe W3.1 (kebab) mostra "Inativar usuário" sempre presente pra ativos. **Não há indicação de bloqueio preventivo no menu.**
6. **Júnior vê W6.1.** "Atribua a função de Administrador a outro membro antes de mudar essa". OK, mensagem clara. Júnior fecha modal.
7. **Júnior tenta promover Carlos a Admin.** Volta pra Team. Clica no kebab da linha do Carlos. Vê "Visualizar / Editar (função) / Inativar". Clica "Editar (função)".
8. **W6 modal abre.** Função atual: Analista Pleno. Júnior muda pra Administrador. Salva. **Confirmação imediata** (Cenário 4.3, C4.3).
9. **Júnior volta pra própria linha.** Tenta inativar de novo. **AGORA o sistema deve permitir** — não é mais o último Admin.
10. **Beat crítico — efeito colateral inesperado:** Júnior se inativa "pra testar". Sai. Tenta logar de novo no dia seguinte. **Não consegue.** Cenário 21 diz "no próximo login, recebe mensagem 'Sua conta foi inativada'". Júnior precisa do Carlos (agora Admin) pra reativá-lo.
11. **MAS Carlos é Operador funcionando como Admin acidental** — Júnior promoveu sem realmente querer dar admin permanente. Foi pra contornar o bloqueio. **Cenário não cobre "rollback de promoção temporária"**.
12. **Pior cenário paralelo:** Carlos não está disponível (fim de semana, em viagem). Júnior fica trancado da própria conta. Liga pro AM/suporte. Suporte AwSales pode reativar? Cenário 23 diz que admin da ORG reativa — não cobre "suporte AwSales reativa quando todos os Admins da org estão presos/indisponíveis".
13. **Risco real:** founder solo testando inativação como brincadeira → consequência grave de lock-out.

**Gaps identificados:**

| # | Severidade | Gap | Evidência (beat) |
|---|---|---|---|
| G5.1 | **P0** | UI não previne ação no kebab — ação "Inativar usuário" sempre presente, bloqueio só no submit. Founder SMB chega no W6.1 só depois de clicar 2 vezes ("Inativar" → "Sim, inativar") | Beat 4-5. Wireframe W3.1 linha 180-186 lista ações sem condicional |
| G5.2 | **P1** | W6.2 (confirmação de inativar) é genérico — não tem cenário "você é o último admin · isso será bloqueado". Modal deveria avisar ANTES de pedir confirmação | Beat 4. Wireframe linha 381-397 |
| G5.3 | **P1** | Cenário 22 cobre bloqueio mas não cobre **caminho de mitigação completo** ("promova outro admin → tente de novo"). Founder solo não sabe os passos | Beat 6-9. Story 2 linha 250-256 |
| G5.4 | **P0** | Não há lock-out recovery — se único Admin se inativa por engano após promover outro Admin temporário, e esse Admin não está disponível, founder fica preso | Beat 10-12. Nenhum cenário cobre "suporte AwSales reativa Admin via canal externo" |
| G5.5 | **P2** | Sem audit trail de "promoção pra Admin · 22/jun/2026" visível ao founder voltando — Júnior pode esquecer que promoveu Carlos e descobrir 6 meses depois | Beat 8. Audit trail existe (Cenário 17) mas não há notificação preventiva "você tem 2 Admins agora — está OK?" |

**Status:** **Com dor (risco crítico)** — caminho feliz funciona, mas single-Admin recovery não está coberto. Founder SMB é o caso mais vulnerável (não tem co-fundador pra recuperar).

**Questions abertas:**
- UI deveria desabilitar "Inativar" no kebab quando é o único Admin (com tooltip explicativo)?
- AwSales suporte deve ter um canal documentado pra "reativar Admin via comprovação de identidade do CNPJ" pra casos de lock-out?
- Vale notificação proativa "você tem só 1 Admin · isso é um risco · convide um co-admin" no dashboard?

---

## Análise consolidada

**Padrões identificados:**

1. **Wireframe não materializa estados de borda visualmente.** Mobile (P4-1), estados vazios pra org com 1 só usuário (P4-3), single-Admin lock-out (P4-5) — todos descritos em texto mas sem mockup. Greg vai pro Figma sem referência visual concreta.

2. **Founder SMB scanner não combina com cards de mesmo peso visual.** A hierarquia da W2-A trata "valor", "método", "fidelidade", "1ª fatura" como linhas iguais. SMB scanner pula. Big number consolidado é P0.

3. **UX não educa "como voltar e fazer depois"** — pular convite (P4-3), abandonar no termo (P4-4), recuperar de inativação acidental (P4-5). Todos os "depois" assumem que o usuário lembra/sabe onde ir.

4. **Single-Admin é caso ortogonal mal coberto.** Story trata como exception isolada (Cenário 22) mas é o estado **default** pra SMB de 1-3 pessoas. Toda org SMB começa com 1 Admin. Toda org SMB pode ficar com 1 Admin de novo.

5. **Termo legal de 47 páginas é UX hostil pra founder sem jurídico.** Não há PDF, não há TOC, não há highlight de cláusulas críticas, não há registro acessível depois. Risco legal real.

**Recomendação Red Team:** Os 4 gaps P0 são **bloqueantes pra rollout pra SMB** (que é metade do mercado AwSales). Os gaps P1 são **degradação séria mas sobrevível com AM ativo**. P2 são polish.

**Confirma:** Os 5 cenários são todos verossímeis pra o perfil P4. Quebraram 3 dos 5. Os 2 que "passaram com dor" (P4-3, P4-5) têm risco operacional/lock-out grave mas não bloqueio total. Não consegui fazer P4 passar limpo em nenhum cenário — o produto não está pronto pra founder SMB sem TI/jurídico no shape atual.
