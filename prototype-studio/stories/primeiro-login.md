# Story — Fluxo de Primeiro Acesso (Responsável da Org e Membros Convidados)

**Data:** 2026-05-11
**PO:** Guilherme Graham (PG)
**Status:** Pronta pra refinamento técnico / split em sub-stories antes do dev

---

## 1. Cabeçalho

**Nome Sugerido:** Implementar Fluxo de Primeiro Acesso (Responsável da Org: Revisão → Pagamento → Cadastro → Convite de Membros; Membro Convidado: Cadastro → 2FA condicional → Termo)

**Prioridade Sugerida:** 🔴 **Crítica (P0)** — porta de entrada de toda nova organização e de todo novo membro. Qualquer travamento converte direto em receita perdida (10–50 orgs/mês × ticket enterprise) ou em time travado.

**Estimativa de Complexidade:** **18 SP** (∼1,5 semana) — fluxo multi-etapas com 3 integrações de produto (Stripe, WorkOS, provedor de invoice), regras de pagamento condicionais, tela de pendência cadastral e variação pra membro convidado.

**Sugestão de Split:**
- **S1** — Responsável: Revisão + Pagamento + Autenticação básica (senha/SSO) = **8 SP**
- **S2** — Responsável: Termo de uso + 2FA + Convite de membros + invoice adicional = **5 SP**
- **S3** — Membro convidado: Cadastro + 2FA condicional + Termo + redirecionamento = **5 SP**

Confirmar split com Reviewer (Gustavo) antes de quebrar.

---

## 2. Narrativa do Usuário (User Story)

**Persona A — Responsável da organização:**
> Como **executivo ou responsável financeiro** da organização convidada,
> eu quero **clicar no link do convite, revisar o que foi contratado com o time comercial AwSales (dados da empresa, implementação e plano), pagar a implementação no método liberado, confirmar o método de cobrança recorrente do plano (que pode ser distinto da implementação), criar minha conta com segurança (senha ou SSO Google/Microsoft + 2FA) e convidar minha equipe**,
> para que eu **comece a usar o AwSales no mesmo dia, com confiança de que os dados e a cobrança estão corretos e a operação da minha empresa está protegida**.

**Persona B — Membro convidado por um admin da org:**
> Como **membro convidado** por um admin da organização (após a org já estar ativa),
> eu quero **clicar no link do convite, criar minha conta com segurança (senha ou SSO + 2FA condicional) e aceitar o termo de uso**,
> para que eu **acesse a plataforma rapidamente e comece a operar com a função que me foi atribuída — sem precisar passar por etapas de pagamento ou revisão de dados da empresa**.

---

## 3. Contexto e Valor (o "Porquê")

**Cenário Atual:** o onboarding hoje é manual, conduzido pelo time comercial e operações por fora do sistema (planilhas, troca de e-mails, lançamento manual no backoffice legacy). Não há fluxo digital pro cliente revisar dados, pagar e se autenticar. Cada nova org gera horas de operação manual e abre brecha pra erros de cadastro descobertos depois (CNPJ trocado, plano errado, valor divergente).

**Cenário Desejado:** o **time comercial** (vendedor) cria a organização no admin (fora do escopo desta story — assumir que API/admin já estão prontos), anexa o contrato já assinado por fora do sistema, **opcionalmente** atribui um AM/Gerente da Conta nesse momento (ou deixa pra depois), e dispara o convite. O responsável recebe um e-mail, clica no link (válido por 7 dias), confere o que foi cadastrado, **paga a implementação** no método liberado, **confirma o método de cobrança recorrente do plano** (pode ser diferente do método da implementação — ver Cenários 4–4.3), configura sua conta com padrão enterprise de segurança (senha forte ou SSO + 2FA opcional), opcionalmente convida o time, e cai já logado na primeira tela funcional da plataforma (tela de integrações). Toda a jornada deve durar **≤ 5 minutos** com dados em mãos.

**Distinção crítica — Implementação vs Plano:**
- **Implementação:** valor único de setup. **Cobrada AGORA** (à vista se cartão sem parcelamento; entrada à vista + parcelas subsequentes se parcelado; 1º boleto/PIX emitido agora se esse for o método).
- **Plano:** mensalidade recorrente. **NÃO é cobrada no 1º acesso** — apenas confirmada. A 1ª fatura é emitida no **último dia do mês corrente** (regra de fechamento global) com **pro-rata** dos dias usados, no método de cobrança recorrente confirmado pelo responsável (que pode ser **distinto** do método da implementação).

**Impacto:**
- **Receita:** cada org perdida no funil de onboarding ≈ R$ tickets enterprise + LTV; meta de **100% de conversão** convite→ativação assinala que não pode existir bug bloqueante.
- **Operacional:** elimina ∼2–4h de trabalho manual do AM por nova org.
- **Confiança:** primeiro contato funcional do cliente com o produto define percepção de qualidade. Pagamento que falha ou tela travada = sinal de "produto frágil".
- **Compliance:** registro do aceite de termo (data, hora, identidade) dá respaldo legal pra cobranças, multas e régua de inadimplência.

---

## 4. Critérios de Aceite (Gherkin BDD)

### Cenário 1 — Tela de revisão exibe Implementação e Plano lado a lado

**Dado** que o time comercial já criou a organização no admin com **Implementação** e **Plano** configurados (cada um com seus próprios métodos de pagamento liberados),
**E** o convite foi disparado por e-mail com link válido por 7 dias,
**Quando** o responsável clica no link e chega na etapa de revisão,
**Então** a tela exibe **dois blocos distintos**:
- **Bloco Implementação:** valor único, método(s) liberado(s) pra implementação, opções de parcelamento (se cartão),
- **Bloco Plano:** nome do plano, valor mensal, intervalo de cobrança (Mensal/Trimestral/Anual), método(s) liberado(s) pra recorrência (pode ser **múltipla escolha** — mín. 1), limite de uso variável, fidelidade (se houver),
**E** abaixo dos dois blocos, exibe **resumo claro dos 2 momentos de cobrança**: cobrança da **Implementação** (cobrada no próximo passo ao confirmar pagamento) e cobrança da **1ª fatura do plano com pro-rata** (cobrada **em seguida**, num passo separado — com seu próprio método e endpoint Stripe).

### Cenário 2 — Caminho feliz: 2 momentos de pagamento separados (Implementação → Plano)

> 📌 **Atualizado v6 (revisado):** os pagamentos acontecem em **2 momentos separados**, cada um com seu próprio clique de confirmação, seu próprio método (podem ser distintos) e seu próprio endpoint Stripe. Próximas faturas do plano (mês cheio) saem no último dia de cada mês.

**Dado** que o admin liberou **cartão** pra implementação, e **cartão e boleto** pra cobrança do plano,
**Quando** o responsável avança pelos passos,
**Então** ocorre **2 cobranças distintas em momentos separados**:

**Momento 1 — W3-A: Pagamento da Implementação**
- Responsável escolhe método pra **implementação** (entre os liberados pra impl no admin) + parcelamento (se cartão).
- Clica em *"✓ Pagar implementação R$ 12.000,00"*.
- Sistema cobra via **endpoint Stripe da implementação** (charge 1).
- Após confirmação, avança pra W4-A.

**Momento 2 — W4-A: Pagamento da 1ª fatura do plano + método de recorrência**
- Responsável escolhe método pra **cobrança do plano** (entre os liberados pra plano no admin — **pode ser diferente do método da implementação**).
- Sistema exibe valor da 1ª fatura com **pro-rata** já calculado (ex: R$ 1.694,44 = R$ 2.500 × 21 dias ÷ 31 dias).
- Clica em *"✓ Pagar 1ª fatura R$ 1.694,44 e confirmar método"*.
- Sistema cobra via **endpoint Stripe do plano** (charge 2 — independente da implementação) E registra o método como padrão pras próximas faturas recorrentes (mês cheio).
- Após confirmação, avança pra W5-A (criar conta).

**E** o **método pode ser distinto entre os 2 momentos** (ex: implementação no cartão, plano no boleto) — admin libera cada lista independentemente,
**E** cria o usuário com perfil "Responsável" da organização,
**E** ativa a notificação persistente de "Pendência cadastral" apenas se contrato ainda não estiver anexado no admin,
**E** redireciona o usuário logado pra tela de integrações ao final,
**E** o tempo total do fluxo é ≤ 5 minutos com dados em mãos.

### Cenário 3 — Pagamento da Implementação: cartão à vista

**Dado** que o método cartão foi liberado pra implementação no admin,
**Quando** o responsável escolhe cartão à vista,
**Então** o sistema cobra o valor total imediatamente via Stripe,
**E** confirma a cobrança em tempo real antes de avançar pra próxima etapa.

### Cenário 3.1 — Pagamento da Implementação: PIX com confirmação em tempo real

**Dado** que o método PIX foi liberado pra implementação,
**Quando** o responsável escolhe PIX, gera o QR code e paga em até **5 minutos**,
**Então** o sistema confirma o pagamento via webhook do Stripe em tempo real,
**E** libera a próxima etapa sem precisar atualizar a página,
**E** registra a fatura como "Paga" no Stripe.

### Cenário 3.2 — Pagamento da Implementação: Boleto com acesso liberado antecipado

**Dado** que o método boleto foi liberado pra implementação,
**Quando** o responsável escolhe boleto e visualiza/baixa o documento,
**Então** o sistema concede acesso imediato à plataforma (sem aguardar compensação),
**E** exibe aviso visível: *"Boleto da implementação emitido. Acesso liberado até o vencimento. Se o pagamento não for confirmado, o acesso será suspenso conforme régua D+N (ver termos)"*,
**E** a régua humana e automática (D-2, D-1, D, D+1, D+2, D+3 → suspensão) é programada conforme doc de cobrança v5.

### Cenário 4 — Pagamento da Implementação: parcelado no cartão (Momento 1)

**Dado** que o valor da implementação permite parcelamento (até 2x se ≤ R$10k, até 4x se >R$10k, sempre com entrada à vista),
**Quando** o responsável seleciona parcelamento permitido pra implementação (ex: 4x) em W3-A,
**Então** o sistema cobra a **entrada à vista** imediatamente (charge 1 — endpoint Stripe da implementação),
**E** programa as **parcelas subsequentes** pra mesma data do mês seguinte (11/06, 11/07, 11/08),
**E** emite confirmação na tela com cronograma das parcelas da implementação,
**E** avança pra W4-A pra cobrar a 1ª fatura do plano (Momento 2 — independente, ver Cenário 4.1).

### Cenário 4.1 — Pagamento da 1ª fatura do Plano + escolha do método recorrente (Momento 2)

> 📌 **Atualizado v6 (revisado):** W4-A executa **2 ações no mesmo clique**: cobra a 1ª fatura do plano com pro-rata AGORA (endpoint Stripe separado) E registra o método como padrão pras próximas cobranças (mês cheio).

**Dado** que o admin liberou múltiplos métodos pra cobrança do plano (ex: boleto, PIX, cartão),
**Quando** o responsável chega na W4-A após pagar a implementação,
**Então** vê:
- Valor da **1ª fatura do plano (pro-rata)** exibido em destaque (ex: R$ 1.694,44 · 21 dias · de hoje até fim do mês),
- Lista de métodos liberados pra cobrança do plano (pode ser diferente dos liberados pra impl),
**E** o responsável escolhe **1 método** pra cobrança do plano (pode ser o **mesmo da implementação** ou **diferente**),
**E** se cartão for escolhido, oferece atalho *"Usar o mesmo cartão da implementação (final ****)"* ou cadastrar outro,
**E** se boleto/PIX, exibe **prazo de vencimento** já configurado pelo admin,
**E** ao clicar em *"✓ Pagar 1ª fatura R$ 1.694,44 e confirmar método"*:
- **Charge 2 (endpoint Stripe do plano)** dispara cobrança da 1ª fatura com pro-rata,
- Método selecionado é **registrado como padrão** pras próximas cobranças mensais (mês cheio),
**E** próximas cobranças do plano saem no **último dia de cada mês** (mês cheio R$ 2.500,00, primeira em 30/06).

### Cenário 4.2 — Métodos distintos entre Implementação e Plano

**Dado** que o admin liberou **PIX apenas pra implementação** e **boleto apenas pra recorrência do plano**,
**Quando** o responsável avança pelas etapas,
**Então** o sistema **não** permite escolher o mesmo método pra ambos automaticamente — cada bloco exibe apenas seus métodos liberados,
**E** a UI deixa claro qual método foi escolhido pra cada cobrança (implementação vs plano) no resumo final.

### Cenário 4.3 — Pro-rata do Plano calculado e cobrado AGORA (Momento 2, charge separado)

> 📌 **Atualizado v6 (revisado):** pro-rata é **cobrado AGORA** no Momento 2 (W4-A), em **charge separado** da implementação. Não há "Big Number unificado" — cada momento tem seu próprio botão com valor explícito.

**Dado** que o responsável já pagou a implementação (Momento 1, W3-A) e chegou em W4-A,
**Quando** a tela carrega,
**Então** o sistema mostra: *"1ª fatura do plano (pro-rata): R$ {valor_pro_rata} — cobrada AGORA neste passo (correspondente a {N} dias de uso de hoje até fim do mês)"*,
**E** o cálculo segue a regra: `valor_pro_rata = (valor_mensal × dias_uso) ÷ dias_do_mês`,
**E** o botão mostra o valor literal (ex: *"✓ Pagar 1ª fatura R$ 1.694,44 e confirmar método"*),
**E** ao clicar, dispara charge no endpoint Stripe do plano (independente da implementação).

### Cenário 5 — Cartão recusado na Implementação, troca de método

**Dado** que o método "Cartão" e ao menos um outro método (PIX ou Boleto) foram liberados pra **implementação**,
**Quando** o cartão é recusado pelo Stripe (sem limite, fraude, expirado),
**Então** a UI exibe mensagem clara *"Pagamento não autorizado. Tente outro cartão ou escolha [PIX/Boleto]"*,
**E** o usuário pode trocar o método ou tentar outro cartão sem reiniciar o fluxo,
**E** o sistema permite até 3 tentativas consecutivas antes de exigir contato com o time comercial AwSales.

### Cenário 6 — PIX da Implementação não pago em 5 minutos

**Dado** que o responsável gerou o QR code de PIX pra implementação,
**Quando** se passam 5 minutos sem confirmação do pagamento,
**Então** o QR expira e a UI exibe botão *"Gerar novo PIX"*,
**E** o usuário pode regenerar quantas vezes precisar,
**E** o status do método continua disponível pra troca (cartão/boleto), se liberados.

### Cenário 7 — SSO com e-mail diferente do convite

**Dado** que o convite foi enviado pra `joao@empresa.com`,
**Quando** o responsável clica em "Entrar com Google" e autentica com `joao@gmail.com` (ou outro domínio),
**Então** o sistema bloqueia o login,
**E** exibe mensagem: *"Use o e-mail joao@empresa.com pra continuar. SSO disponível apenas pra esse endereço."*

### Cenário 8 — Aceite de Termo de Uso (escopo global por usuário, checkboxes obrigatórios)

> 📌 **Escopo:** termo é aceito **uma vez por usuário e válido pra todas as organizações** onde ele estiver (atual ou futura). Nova versão do termo dispara re-aceite cross-org.
> 📌 **Atualizado v8 · feedback PG 2026-05-12:** leitura/scroll do termo não é obrigatória. O aceite acontece por checkboxes explícitos de ciência e concordância.

**Dado** que o responsável está na etapa de termo de uso pela primeira vez,
**Quando** o documento é exibido,
**Então** o sistema mostra checkboxes obrigatórios:
- *"Li e aceito os Termos de Uso v5.3 da AwSales."*
- *"Estou ciente das regras de cobrança, cancelamento, fidelidade e suspensão descritas no termo."*
- *"Estou ciente do tratamento de dados pessoais conforme LGPD e Política de Privacidade."*
**E** o botão "Aceitar e continuar" permanece **desabilitado** até que todas as caixinhas estejam marcadas,
**E** após aceite, o sistema registra: data ISO, hora, e-mail do usuário, IP, user-agent, **versão do termo (ex: v5.3)**,
**E** registra quais checkboxes foram confirmados e o timestamp do aceite,
**E** o registro fica vinculado ao **usuário globalmente** (não à org),
**E** acessível em "Meu Perfil → Termos aceitos" + disponível pro compilado jurídico em caso de inadimplência futura,
**E** se o mesmo usuário entrar em uma nova org futura, **não precisa reaceitar** a mesma versão.

### Cenário 8.1 — Nova versão do termo força re-aceite cross-org

**Dado** que o usuário já aceitou a versão v5.3 do termo,
**Quando** AwSales publica versão v6.0 (mudança de cláusula contratual),
**Então** o sistema exibe modal de aceite obrigatório no **próximo login** do usuário em qualquer org,
**E** mostra **diff resumido** das mudanças críticas entre v5.3 → v6.0,
**E** mesma regra de checkboxes obrigatórios se aplica,
**E** aceite registrado com nova versão; aceite anterior fica histórico imutável.

### Cenário 9 — Política de Segurança vira pendência em Configurações

> 📌 **Atualizado v7 · feedback PG 2026-05-12:** remover a tela "Política de segurança da sua organização" do primeiro acesso. A definição de 2FA obrigatório não deve bloquear signup/onboarding; vira pendência persistente em Configurações da organização.

**Dado** que o responsável criou conta (senha local ou SSO) e aceitou termo,
**Quando** conclui a etapa de termo de uso,
**Então** o sistema avança direto para W9-A "Convidar equipe",
**E** não exibe a tela W8-A de política de segurança,
**E** cria a organização com `require_2fa_policy_status = PENDING`,
**E** ao entrar em `Configurações → Segurança` o sistema exibe banner: *"Pendência de segurança da organização — Defina se a autenticação em 2 fatores será obrigatória para todos os membros."*,
**E** o banner permanece até um usuário com permissão `Segurança · Editar` escolher uma política.

### Cenário 9.1 — Setup do TOTP do Responsável no PRIMEIRO LOGIN REAL (pós-signup)

> 📌 **Atualizado v7:** depois do W10-A (sucesso), quando o responsável clica em "Entrar agora →" e acessa a plataforma pela primeira vez, o sistema verifica se ele já tem TOTP configurado e aplica a política vigente. Se a política ainda está pendente, não bloqueia o acesso.

**Dado** que o responsável concluiu o W10-A e clicou "Entrar agora →",
**Quando** o sistema processa o primeiro login real (cria sessão WorkOS),
**Então:**
- **Se flag `require_2fa = ON`:** trava o acesso na tela W4-B (modo obrigatório, sem botão "Pular") — exige configurar TOTP antes de chegar na tela de Integrações,
- **Se flag `require_2fa = OFF`:** loga normalmente e redireciona pra Integrações; banner persistente no header sugere "Configure 2FA pra reforçar a segurança da sua conta" com link pra "Meu Perfil → Segurança",
- **Se `require_2fa_policy_status = PENDING`:** loga normalmente e mantém banner de pendência em Configurações,
**E** mesma lógica aplica pra todos os membros convidados em seus primeiros logins.

### Cenário 9.2 — Ativação posterior do 2FA pela Admin trava acesso até reconfiguração

**Dado** que o 2FA da org está desligado e há N sessões ativas e M usuários sem 2FA configurado,
**Quando** qualquer usuário com permissão de Segurança ativa o 2FA da organização em "Configurações → Segurança",
**Então** o sistema exibe modal de confirmação: *"Vai derrubar N sessões ativas. M usuários sem 2FA configurado serão obrigados a configurar no próximo acesso. Continuar?"*,
**E** ao confirmar, **todas as sessões ativas são derrubadas imediatamente**,
**E** o próximo login de **todos os membros** trava na etapa de configuração de TOTP (mesma tela W4-B em modo obrigatório, sem opção de pular),
**E** quem já tinha 2FA configurado loga normalmente após validar o TOTP existente,
**E** a flag `2FA obrigatório` da org passa pra ON e o evento é registrado no audit trail org-wide com contexto ("Felipe ativou 2FA — N sessões derrubadas, M usuários afetados").

### Cenário 9.3 — Desativar 2FA da org (caminho reverso)

**Dado** que o 2FA da org está ativado,
**Quando** usuário com permissão de Segurança desativa,
**Então** o sistema exibe aviso *"Desativar 2FA reduz a segurança da organização. Usuários poderão logar sem TOTP."* com confirmação dupla,
**E** ao confirmar, flag passa pra OFF,
**E** usuários que já têm TOTP configurado mantêm a configuração (TOTP fica opcional, não removido),
**E** evento registrado no audit trail.

### Cenário 10 — Revisão: cliente identifica erro nos dados cadastrados

> 📌 **Escopo MVP:** botão é apenas **informativo** (sem API backend). Integração com sistema de notificação/tickets pro time comercial fica em story futura.

**Dado** que o responsável está na etapa de revisão,
**Quando** identifica divergência (CNPJ, razão social, plano, valor da implementação, valor do plano, etc.),
**Então** o sistema exibe aviso na tela: *"Identificou algo errado? Entre em contato com o time comercial AwSales pra correção — o time vai ajustar e reenviar um novo link de convite."*,
**E** o botão **"Algo está errado?"** abre um alerta/modal apenas **informativo** com o contato do **responsável comercial** (nome + e-mail de quem criou a org no admin, puxados do admin),
**E** se já houver **AM/Gerente da Conta** atribuído, exibe também esse contato como referência adicional,
**E** se nenhum contato estiver atribuído ainda, exibe contato genérico do time AwSales,
**E** o botão **não dispara** notificação, e-mail nem nenhuma ação backend no MVP (apenas UI),
**E** o cliente pode continuar o fluxo se preferir (a divergência fica sob responsabilidade do contato manual com o time).

### Cenário 11 — Convite de outros membros (última etapa, blocos de função + e-mails)

> 📌 **Atualizado v6:** convite agora é organizado em **blocos por função** — cada bloco tem uma função e quantos e-mails precisar (até 20 por bloco). Sem limite de blocos. Idêntico ao W4 da Story 2.

**Dado** que o responsável concluiu pagamento, criação de conta, termo aceito e política de 2FA definida,
**Quando** chega na última etapa "Convidar minha equipe" (W9-A),
**Então** começa com **1 bloco vazio** (função default "Operador", lista de e-mails vazia),
**E** pode adicionar e-mails ao bloco (chips até 20),
**E** pode clicar **"+ Adicionar bloco"** pra criar novos blocos com função distinta,
**E** pode remover blocos (com confirmação se tiver e-mails preenchidos),
**E** o botão final dispara **N convites agrupados por função** (cada e-mail recebe convite com a função do seu bloco),
**E** pode pular toda a etapa,
**E** cada convidado adicional recebe seu próprio fluxo de primeiro acesso (escopo da story de "convite de membros" — não desta),
**E** o responsável pode finalizar e cair direto na tela de integrações.

### Cenário 11.5 — Dados pessoais do Responsável + defaults da Org (W6-A)

> 📌 **Atualizado v6:** idioma e fuso horário são preenchidos pelo Responsável aqui e funcionam como **default da organização** (membros herdam, podem mudar depois).

**Dado** que o responsável passou pelo W5-A (criou conta),
**Quando** chega no W6-A "Conte seus dados",
**Então** preenche:
- **Nome completo** (obrigatório),
- **Cargo** (obrigatório),
- **Telefone** (opcional — útil pra fallback de 2FA),
- **Idioma** (default `pt-BR`, editável) — vira default da organização,
- **Fuso horário** (default `America/Sao_Paulo`, editável) — vira default da organização,
**E** banner informativo: *"Essas preferências valem como default da sua organização também — membros convidados herdam, mas podem mudar em Meu perfil."*,
**E** depois preenche bloco de e-mails adicionais de invoice (ver Cenário 12),
**E** ao continuar, o sistema persiste idioma+fuso tanto no perfil do usuário quanto na configuração da org (campos `org.default_language`, `org.default_timezone`).

### Cenário 12 — Cadastro de e-mails adicionais pra envio de invoice (até 10)

**Dado** que o responsável está na etapa de configuração da conta,
**Quando** opta por adicionar e-mails extras pra envio de invoice,
**Então** pode adicionar até **10 e-mails** sem restrição de domínio,
**E** ao tentar adicionar o 11º, o sistema bloqueia e exibe *"Limite de 10 e-mails atingido"*,
**E** valida formato de e-mail antes de aceitar.

### Cenário 13 — Link expirado (>7 dias)

> 📌 **Escopo MVP:** mesmo padrão do Cenário 10 — informativo, sem API backend. Cliente avisa o time comercial por fora.

**Dado** que o convite foi enviado há mais de 7 dias e não foi utilizado,
**Quando** o responsável clica no link,
**Então** o sistema exibe tela *"Convite expirado. Entre em contato com o time comercial AwSales pra receber um novo link."*,
**E** exibe contato do **responsável comercial** que cadastrou a org (nome + e-mail) na mesma tela,
**E** se houver AM atribuído, exibe também como referência adicional,
**E** o link expirado fica permanentemente inválido.

### Cenário 14 — Link já utilizado

**Dado** que o convite já foi consumido (cadastro completo),
**Quando** o responsável ou qualquer um clica no mesmo link novamente,
**Então** o sistema exibe tela *"Este convite já foi utilizado. Acesse studio.awsales pra logar."* com botão **"Ir para login"**.

### Cenário 15 — Pagamento processado mas conta não criada (recuperação)

**Dado** que o responsável pagou a implementação,
**Quando** ocorre falha técnica antes de concluir criação de conta/2FA,
**Então** ao reentrar com o mesmo link, o sistema reconhece o pagamento já efetuado,
**E** retoma o fluxo do ponto exato onde parou (não cobra novamente),
**E** registra log de retomada pra observabilidade.

---

## 4.10 Fluxo de 1º Acesso do Membro Convidado (Persona B)

> 📌 **Contexto:** Membros são convidados por um admin da org (via story de "Configurações da Organização → Team → Convidar membro"). O fluxo deles **reaproveita** os componentes de autenticação, 2FA e termo da Persona A, **mas pula pagamento e revisão de dados da org** — esses já foram resolvidos pelo responsável.

### Cenário 16 — Caminho feliz do membro convidado

**Dado** que um admin convidou `joao@empresa.com` com a função "Analista Sênior",
**E** o membro recebeu e-mail com link válido por 7 dias,
**Quando** ele clica no link no desktop,
**Então** o sistema apresenta tela de boas-vindas com: nome da organização, ícone, nome de quem convidou, função atribuída,
**E** segue direto pra etapa de autenticação (sem revisão de dados da org, sem pagamento),
**E** após autenticar + coletar dados pessoais + (2FA condicional) + termo, cai logado no **destino apropriado** (ver Cenário 22).

### Cenário 17 — Autenticação do membro: senha local ou SSO

**Dado** que o membro está na etapa de autenticação,
**Quando** escolhe entre **criar senha** ou logar com **SSO Google / SSO Microsoft**,
**Então** o sistema aplica as mesmas regras de senha forte e validação de SSO da Persona A,
**E** o e-mail SSO precisa coincidir com o do convite (bloqueio idêntico ao Cenário 7 da Persona A),
**E** o login social tem os mesmos providers liberados (Google e Microsoft via WorkOS).

### Cenário 18 — Coleta de dados pessoais do membro

**Dado** que o membro autenticou com sucesso,
**Quando** chega na etapa de cadastro pessoal,
**Então** preenche os campos:
- **Nome completo** (obrigatório) — usado em conversas, auditorias e exibição na plataforma,
- **Foto** (opcional, default = avatar com inicial do nome),
- **Telefone** (opcional — útil pra fallback de 2FA futuro),
**E** o e-mail é exibido readonly (vem do convite),
**E** a função é exibida readonly (atribuída pelo admin que convidou),
**E** **idioma e fuso horário NÃO aparecem nesta tela** (atualizado v6) — são herdados do default da organização (configurado pelo responsável em W6-A). Membro pode mudar depois em "Meu perfil" se quiser,
**E** banner informativo: *"Idioma e fuso horário herdam do default da sua organização. Você pode mudar depois em Meu perfil."*

### Cenário 19 — 2FA condicional baseado em flag da org

**Dado** que o membro chegou na etapa de segurança,
**Quando** o sistema verifica a flag `2FA obrigatório` da organização,
**Então:**
- Se a flag está **ON** → o membro **deve** configurar TOTP antes de avançar (mesmo padrão WorkOS da Persona A); não pode pular,
- Se a flag está **OFF** → o membro **pode pular** e configurar depois em "Meu perfil → Segurança",
**E** independente do caminho, o sistema coleta o telefone de fallback se ainda não foi preenchido.

### Cenário 20 — Termo de uso (global por usuário, escopo cross-org)

> 📌 **Atualizado:** mesma regra global da Persona A — aceite é por usuário, válido cross-org.

**Dado** que o membro chega na etapa de termo de uso,
**Quando** o documento é renderizado:
- **Se é primeiro aceite (usuário nunca aceitou nenhuma versão):** botão "Aceito os termos" segue regra de checkboxes obrigatórios (Cenário 8); registra aceite com versão, data, hora, IP, UA.
- **Se já aceitou versão atual em outra org:** sistema **pula a etapa** automaticamente e avança pra próxima — exibe banner *"Você já aceitou os termos de uso v{X} em DD/MM/AAAA"*.
- **Se já aceitou versão anterior:** mostra Cenário 8.1 (re-aceite com diff).
**E** sem aceite válido da versão atual, o membro não consegue concluir o 1º acesso.

### Cenário 21 — Membro não vê notificação de "Pendência cadastral"

**Dado** que a flag de pendência cadastral é uma preocupação organizacional (gerenciada pelo Admin AwSales),
**Quando** o membro convidado loga,
**Então** **não vê** a notificação persistente de "Pendência cadastral" (visível apenas para Administradores da org),
**E** consegue operar normalmente dentro do escopo da sua função.

### Cenário 22 — Redirecionamento pós-conclusão (destino do membro)

**Dado** que o membro completou todas as etapas obrigatórias,
**Quando** o fluxo termina,
**Então** o sistema redireciona pra **primeira tela disponível** conforme a função:
- Se a função tem permissão pra **Dashboard** → cai no Dashboard,
- Senão → cai na **primeira tela permitida** seguindo a ordem da sidebar (Agentes, Conversas, Disparos, etc.),
**E** se a função não tem permissão pra nenhuma tela funcional (caso de borda), exibe estado vazio: *"Sua função ainda não tem permissões atribuídas. Fale com o admin da organização."*.

### Cenário 23 — Link de convite do membro: expirado, já usado, cancelado

**Dado** que o membro tenta usar um link em estado inválido,
**Quando** acessa,
**Então:**
- Link **expirado** (>7 dias) → tela *"Convite expirado. Entre em contato com o admin da sua organização pra receber um novo link."* — botão informativo (sem API backend, igual padrão da Persona A) com referência genérica ("Procure o responsável que te convidou"),
- Link **já utilizado** → tela *"Este convite já foi utilizado. Acesse studio.awsales pra logar."* com botão "Ir para login",
- Link **cancelado** pelo admin → tela *"Convite cancelado. Entre em contato com sua organização."*.

### Cenário 24 — Membro com e-mail em outra org (multi-org)

**Dado** que `joao@empresa.com` já é usuário em outra org da AwSales,
**Quando** aceita o convite na nova org,
**Então** o sistema **não duplica** a conta — vincula o mesmo usuário às duas orgs,
**E** o seletor de organização fica disponível no menu do usuário,
**E** ao logar com SSO da mesma conta Google/Microsoft, o sistema apresenta o seletor de org se houver múltiplas,
**E** funções e dados (nome, foto, telefone, idioma) são **compartilhados entre orgs** no nível do usuário (mas a função e o audit trail são **por org**).

### Cenário 25 — Falha técnica no meio do fluxo do membro (retomada)

**Dado** que o membro completou autenticação mas falhou em alguma etapa subsequente,
**Quando** retorna ao link do convite (ainda dentro dos 7 dias),
**Então** o sistema reconhece a sessão de onboarding e retoma do ponto exato onde parou,
**E** não exige refazer autenticação se a sessão ainda for válida.

---

## 4.11 Persona A Multi-Org (Responsável que já tem conta no AwSales em outras orgs)

> 📌 **Contexto:** CFOs de holdings, grupos e fundadores com múltiplas empresas são frequentemente responsáveis em N orgs simultâneamente. Esse fluxo evita refazer setup do zero quando o usuário já existe no AwSales (WorkOS).

### Cenário 26 — Detecção de usuário existente e fluxo enxuto

**Dado** que `ricardo@vitru.com.br` já é usuário ativo no AwSales (responsável em 4 orgs: Anhanguera, UNIASSELVI, FAMA, Cruzeiro do Sul),
**E** o comercial AwSales criou a 5ª org (Pitágoras) e disparou convite pra o mesmo e-mail,
**Quando** Ricardo clica no link,
**Então** o sistema detecta o usuário pré-existente **antes de renderizar W1-A**,
**E** redireciona pra **variante W1-A.MO** ("Boas-vindas multi-org"):
- Header: *"Olá Ricardo! Você já tem conta no AwSales."*
- Card: *"Você já administra: Anhanguera · UNIASSELVI · FAMA · Cruzeiro do Sul"*
- Subhead: *"Vamos adicionar Pitágoras à sua conta — 3 minutos."*
- Etapas enxutas: **1. Revisão · 2. Pagamento · 3. Confirmação** (sem criação de conta, sem dados pessoais, sem 2FA, sem termo se já aceito).

### Cenário 26.1 — Etapas puladas e o que é reusado

**Dado** que Ricardo está no fluxo multi-org,
**Quando** o sistema decide quais etapas pular,
**Então:**
- **W5-A (criar conta):** pulada — usa sessão WorkOS existente OU pede SSO/senha conhecida pra reautenticar (mesma identidade)
- **W6-A (dados pessoais):** pulada — nome, telefone, idioma, fuso são compartilhados no nível do usuário (visíveis em "Meu Perfil") e reusados; e-mails de invoice da nova org **devem** ser configurados (opcional, pode pular nessa org)
- **W7-A (termo de uso):** pulada se versão atual já foi aceita pelo usuário (ver Cenário 8); re-aceite se versão mudou
- **Política de segurança da nova org:** não aparece no fluxo multi-org; se a nova org nasce sem política definida, cria `require_2fa_policy_status = PENDING` e mostra pendência em Configurações
- **2FA do usuário:** se a nova org já tem `require_2fa = ON` e o usuário ainda não tem TOTP, o setup obrigatório acontece no primeiro login real / entrada na org, fora do fluxo de contratação
- **Apenas Revisão (W2-A) + Pagamento (W3-A + W4-A) + Confirmação são executadas integralmente.**

### Cenário 26.2 — Stripe customer reusado com confirmação

**Dado** que Ricardo tem Stripe customer ativo (das outras 4 orgs),
**Quando** chega na W3-A (pagamento da implementação),
**Então** o sistema **sugere** os cartões previamente cadastrados:
- *"Cartão Itaú corporativo (final 4242) — usado em Anhanguera"*
- *"Cartão Bradesco corporativo (final 8888) — usado em UNIASSELVI"*
- *"Adicionar novo cartão"*
**E** ao selecionar um existente, Stripe cobra usando o token armazenado (sem precisar redigitar dados),
**E** ao adicionar novo, vincula ao Stripe customer existente (não cria customer duplicado),
**E** mesma lógica aplica ao W4-A (recorrência do plano).

### Cenário 26.3 — Acesso direto à org criada (sem redirect pra integrações)

**Dado** que Ricardo concluiu o fluxo multi-org,
**Quando** chega na tela de sucesso,
**Então** redireciona automaticamente pra **dashboard da Pitágoras** (não pra "tela de integrações" como Persona A novo),
**E** o seletor de organização no header mostra todas as 5 orgs (4 antigas + Pitágoras),
**E** Pitágoras vem destacada como "Recém-adicionada".

### Cenário 26.4 — Termo já aceito anteriormente (pula etapa)

**Dado** que Ricardo aceitou termo v5.3 quando entrou na Anhanguera (há 6 meses),
**E** versão atual continua sendo v5.3,
**Quando** entra no fluxo multi-org da Pitágoras,
**Então** etapa W7-A é pulada,
**E** banner informativo na tela de revisão mostra *"Termos de uso v5.3 aceitos em 11/11/2025"*.

### Cenário 26.5 — 2FA obrigatório na nova org mesmo com usuário existente

**Dado** que Ricardo nunca configurou TOTP (não usa 2FA),
**E** a Pitágoras tem flag `2FA obrigatório` ON (definida em Configurações ou pelo admin AwSales antes do convite),
**Quando** Ricardo entra no fluxo multi-org,
**Então** o fluxo de contratação não exibe tela de política de segurança,
**E** ao entrar de fato na org, Ricardo configura TOTP em modo obrigatório antes de acessar o Studio,
**E** o TOTP fica vinculado ao usuário no WorkOS — vale pra todas as 5 orgs no próximo login.

---

## 5. Definição de Pronto (DoD) para QA

- [ ] Fluxo completo testado em **desktop** (mobile fora do escopo MVP — confirmar comportamento mínimo aceitável: bloqueio educado ou layout degradado).
- [ ] Tela de revisão exibe **Implementação** e **Plano** em blocos distintos, com métodos liberados específicos pra cada.
- [ ] Os 3 métodos de pagamento (cartão, PIX, boleto) testados ponta a ponta com Stripe em ambiente de testes — pra **Implementação**.
- [ ] Métodos de cobrança recorrente do **Plano** (cartão / boleto / PIX, múltipla escolha mín. 1) testados na confirmação — sem cobrança imediata.
- [ ] **Métodos distintos** entre Implementação e Plano funcionam (ex: cartão pra impl., boleto pra plano) — admin libera independente, UI respeita.
- [ ] Opção "Usar o mesmo cartão da implementação" funcional quando cartão é selecionado como método recorrente do plano.
- [ ] Parcelamento da implementação testado nos 3 tiers de valor (≤R$10k → 2x; >R$10k → 4x), validando entrada à vista + parcelas subsequentes.
- [ ] Pro-rata do plano calculado corretamente no primeiro ciclo (`valor_mensal × dias_uso ÷ dias_do_mês`) e exibido em W4-A com valor explícito.
- [ ] **2 momentos de pagamento separados** (atualizado v6 revisado): W3-A cobra Implementação (charge 1, endpoint Stripe da impl) → W4-A cobra 1ª fatura do plano pro-rata (charge 2, endpoint Stripe do plano).
- [ ] **Métodos podem ser distintos** entre os 2 momentos — admin libera cada lista independentemente.
- [ ] Cada botão de pagamento mostra **valor literal** com o método escolhido (ex: "Pagar implementação R$ 12.000,00" + "Pagar 1ª fatura R$ 1.694,44 e confirmar método").
- [ ] Próximas faturas do plano programadas pra **último dia do mês** (regra do doc v5), exceto emissão de invoice que segue exceção configurada pelo admin.
- [ ] Idioma+fuso do Responsável em W6-A persistem como **default da organização** (campos `org.default_language`, `org.default_timezone`).
- [ ] Membros (W3-B) **não veem campos idioma/fuso** — herdam do default da org; podem alterar em "Meu perfil" depois.
- [ ] Bloqueio de SSO Google/Microsoft com e-mail divergente do convite validado.
- [ ] Termo de uso: botão de aceite só libera após marcar todas as caixinhas obrigatórias.
- [ ] Registro de aceite (data, hora, e-mail, IP, user-agent) persistido e auditável.
- [ ] Não existe tela W8-A de política de segurança no signup/onboarding.
- [ ] Após aceitar termos, o Responsável avança direto para W9-A "Convidar equipe".
- [ ] Organização criada sem política definida recebe `require_2fa_policy_status = PENDING`.
- [ ] Pendência de política de 2FA aparece em Configurações da organização, não no primeiro login.
- [ ] Setup de TOTP do Responsável acontece no **primeiro login real** apenas se a política vigente exigir.
- [ ] Ativação posterior do 2FA em "Segurança" exibe confirmação ("vai derrubar N sessões"), derruba sessões ativas e força configuração no próximo acesso de todos os membros.
- [ ] Desativação do 2FA da org pede confirmação dupla; usuários com TOTP mantêm configurado mas opcional.
- [ ] Termo de uso aceito é **global por usuário** (cross-org); aceite válido em N orgs sem reaceitar.
- [ ] Nova versão do termo dispara re-aceite obrigatório com diff resumido.
- [ ] Persona A multi-org: detecção de usuário pré-existente antes de W1-A; redirect pra W1-A.MO.
- [ ] Persona A multi-org: etapas W5-A/W6-A/W7-A e a decisão de política de segurança são puladas conforme estado do usuário; apenas Revisão + Pagamento + Confirmação executadas.
- [ ] Stripe customer reusado em multi-org com sugestão de cartões existentes (sem duplicar customer).
- [ ] 2FA obrigatório aplica também em fluxo multi-org se o usuário ainda não tem TOTP.
- [ ] Validação de e-mails adicionais pra invoice: formato + limite de 10.
- [ ] Tempo médio do fluxo medido em testes de usabilidade ≤ 5 minutos.
- [ ] Notificação persistente de "Pendência cadastral" só aparece se contrato não anexado no admin.
- [ ] Botão **"Algo está errado?"** exibe modal informativo com nome + e-mail do AM responsável (puxados do admin), **sem ação backend**.
- [ ] Texto do modal "Algo está errado?" e tela de link expirado revisados com o time comercial (pra garantir que o cliente entenda que precisa contatar o AM por fora).
- [ ] Link expira em 7 dias e fica invalidado após uso ou cancelamento.
- [ ] Link reenviado pelo AM invalida o link anterior.
- [ ] Redirecionamento pós-conclusão cai na tela de integrações.
- [ ] E-mail de confirmação enviado ao responsável após cadastro completo (boas-vindas + comprovante de pagamento).
- [ ] Métricas do funil instrumentadas (cada etapa: chegou, completou, dropou, errou) — definir destino (analytics atual ou novo).
- [ ] Observabilidade: cada step tem log estruturado com identificação do convite, organização e timestamp.

**Fluxo de Membro Convidado (Persona B):**
- [ ] Tela de boas-vindas mostra nome da org, ícone, quem convidou e função atribuída.
- [ ] Fluxo do membro pula etapas de revisão de dados e pagamento.
- [ ] Autenticação reusa componentes da Persona A (senha local, SSO Google, SSO Microsoft).
- [ ] Bloqueio de SSO com e-mail divergente do convite validado pra membro.
- [ ] Coleta de dados pessoais: nome obrigatório; foto/telefone/idioma/fuso opcionais com defaults corretos.
- [ ] 2FA condicional: ON na org → obrigatório; OFF na org → pode pular.
- [ ] Termo de uso aceito por usuário (não herda do responsável). Registro com data, hora, e-mail, IP, user-agent.
- [ ] Notificação "Pendência cadastral" não aparece pra membro (só Admin).
- [ ] Redirecionamento pós-conclusão segue a permissão da função (Dashboard → primeira tela permitida → estado vazio se função sem permissão).
- [ ] Link expirado/usado/cancelado tratado conforme Cenário 23 (mensagens distintas).
- [ ] Multi-org com mesmo e-mail funciona; seletor de org disponível; dados pessoais compartilhados, função e audit trail por org.
- [ ] Retomada de fluxo após falha técnica funciona (Cenário 25).

---

## 6. Cenários de Teste Obrigatórios (QA — BDD de Quebra)

### Cenário Q1: Concorrência — mesmo link aberto em 2 abas

**Dado** que o responsável abre o link em duas abas simultaneamente,
**Quando** completa o pagamento na aba A,
**Então** a aba B detecta a conclusão e exibe estado "Convite já utilizado" sem permitir pagamento duplicado.

### Cenário Q2: Pagamento processado mas Stripe webhook chega tarde

**Dado** que o usuário pagou no cartão,
**Quando** o webhook de confirmação atrasa >30s,
**Então** a UI exibe loader com mensagem *"Confirmando pagamento... isso pode levar até 1 minuto"*,
**E** não permite que o usuário tente pagar de novo enquanto aguarda,
**E** após confirmação, avança automaticamente.

### Cenário Q3: Cartão e Pix gerados em sequência (dupla cobrança)

**Dado** que o usuário inicia Pix, abandona, e volta pra cartão,
**Quando** paga com cartão,
**Então** o sistema cancela/expira o QR Pix imediatamente,
**E** garante que apenas uma cobrança seja efetivada.

### Cenário Q4: Falha do WorkOS após pagamento confirmado

**Dado** que o pagamento foi processado,
**Quando** WorkOS retorna erro ao criar usuário,
**Então** o sistema **não** estorna o pagamento automaticamente,
**E** registra incidente no admin + alerta a engenharia,
**E** exibe ao usuário *"Pagamento confirmado. Estamos finalizando sua conta — entraremos em contato em até 1h"*,
**E** o time comercial / Ops é notificado pra completar manualmente.

### Cenário Q5: Burlar o termo de uso via DevTools

**Dado** que o usuário tenta habilitar o botão "Aceito" via manipulação de DOM sem marcar as caixinhas,
**Quando** tenta avançar,
**Então** o backend valida que os checkboxes obrigatórios foram enviados como confirmações explícitas,
**E** rejeita o avanço se a validação server-side falhar.

### Cenário Q6: Time comercial cancela/edita o convite no meio do fluxo do cliente

**Dado** que o cliente está no meio do fluxo,
**Quando** o time comercial edita dados da org no admin ou cancela o convite,
**Então** o cliente recebe aviso em tempo real (ou ao tentar avançar) *"Suas informações foram atualizadas pelo time AwSales. Reinicie o fluxo no novo link enviado"*,
**E** o fluxo atual é invalidado.

### Cenário Q7: 2FA com app authenticator perdido durante setup

**Dado** que o usuário escaneou o QR mas perdeu acesso ao app antes de confirmar o código,
**Quando** tenta avançar sem confirmar,
**Então** o sistema bloqueia avanço,
**E** oferece botão *"Gerar novo QR"* (mantendo sessão de convite ativa).

### Cenário Q8: Refresh ou fechamento de aba após pagamento

**Dado** que o usuário pagou e fechou a aba antes de criar conta,
**Quando** reabre o link,
**Então** o fluxo retoma do ponto exato (criar conta) sem cobrar de novo,
**E** mantém a sessão de onboarding pelo tempo de validade do link (7 dias).

### Cenário Q9: 11º e-mail de invoice

**Dado** que o usuário já cadastrou 10 e-mails pra invoice,
**Quando** tenta adicionar o 11º,
**Então** o botão "Adicionar" é desabilitado,
**E** exibe contador visível *"10/10 e-mails"*.

### Cenário Q10: Convidar membros antes de pagar (tentativa de pular ordem)

**Dado** que o usuário tenta navegar manualmente pra etapa de convite de membros via URL,
**Quando** ainda não completou pagamento+conta+termo,
**Então** o sistema redireciona pra etapa pendente,
**E** registra tentativa nos logs.

### Cenário Q11: Boleto pago e cartão cobrado depois (dupla cobrança financeira)

**Dado** que o usuário gerou boleto e ganhou acesso,
**Quando** o boleto é pago e o sistema processa a confirmação,
**Então** nenhum método alternativo de cobrança é cobrado pra essa parcela,
**E** o status da fatura no Stripe vai pra "Paga" exatamente uma vez.

### Cenário Q12: Plano sem variável configurado

**Dado** que o time comercial cadastrou a org sem cobrança variável,
**Quando** o cliente completa o fluxo,
**Então** o sistema não exibe nenhuma menção a "uso variável" na revisão nem nas faturas previstas,
**E** o dashboard pós-login não mostra aba/card de uso variável.

### Cenário Q13: Flag de 2FA da org ativada enquanto membro está no meio do fluxo

**Dado** que o membro convidado iniciou o 1º acesso com flag de 2FA OFF na org,
**E** estava na etapa de coleta de dados pessoais,
**Quando** um admin liga a flag de 2FA na org neste exato momento,
**Então** ao avançar pra próxima etapa, o sistema **força** o membro a configurar 2FA antes de concluir,
**E** o fluxo não trava — apenas insere a etapa obrigatória.

### Cenário Q15: Tentativa de cobrança do plano no 1º acesso (deve ser apenas programação)

**Dado** que o responsável confirmou o método de cobrança recorrente do plano,
**Quando** completa o fluxo,
**Então** o sistema **não** dispara cobrança do plano via Stripe naquele momento,
**E** apenas registra o método pra próximo ciclo,
**E** garante que a 1ª fatura do plano só seja emitida no último dia do mês corrente.

### Cenário Q16: Admin libera apenas um método pra implementação que não funciona

**Dado** que o admin liberou **apenas boleto** pra implementação (sem cartão e PIX),
**E** o boleto está com problema de geração no Stripe,
**Quando** o responsável tenta avançar,
**Então** a UI exibe erro claro *"Não foi possível gerar o boleto. Entre em contato com o time comercial AwSales."* com o contato do responsável comercial,
**E** **não** oferece troca de método (porque nenhum outro foi liberado),
**E** o fluxo bloqueia até o time intervir.

### Cenário Q17: Cartão da Implementação ≠ Cartão da Recorrência do Plano

**Dado** que o responsável paga implementação com Cartão A e cadastra Cartão B pra recorrência do plano,
**Quando** o fluxo conclui,
**Então** o Stripe armazena **dois tokens distintos** (um pra cada finalidade),
**E** futuras cobranças do plano usam Cartão B,
**E** futuras parcelas da implementação (se houver) usam Cartão A,
**E** a UI exibe claramente quais cartões estão associados a quê.

### Cenário Q14: Membro convidado pra função que foi deletada antes do aceite

**Dado** que o admin convidou membro com função "Auditor Externo (custom)",
**E** antes do membro aceitar, a função foi deletada pela própria org,
**Quando** o membro clica no link,
**Então** o sistema exibe tela *"O convite foi invalidado porque a função atribuída não existe mais. Entre em contato com o admin da organização."* — informativo, sem API backend,
**E** o convite fica permanentemente inválido.

---

## 7. Resultado Esperado e Métricas de Sucesso

**Métrica Principal:**
- **Taxa de conversão "convite enviado → conta ativada com pagamento"**
- **Baseline:** N/A (fluxo novo — onboarding atualmente manual)
- **Meta:** **100% em 90 dias após o lançamento** (toda org convidada deve concluir o fluxo digital — meta declarada pelo PG)
- **Como medir:** funil de eventos instrumentados (clique no link → revisão → pagamento → conta criada → integrações), agregado no analytics escolhido pelo time produto

**Métricas Secundárias:**
- **Tempo médio do fluxo (Persona A):** meta ≤ 5 min (medido entre primeiro clique no link e chegada na tela de integrações)
- **Tempo médio do fluxo (Persona B — membro):** meta ≤ 2 min (fluxo enxuto, sem pagamento)
- **Taxa de aceite de convite de membro em 7 dias:** meta ≥ 85% (se cair, investigar copy do e-mail / qualidade do convite)
- **Taxa de falha de pagamento na 1ª tentativa:** meta < 5% — qualquer pico investiga: configuração no admin, Stripe, ou problema de UX
- **Distribuição de método de pagamento:** monitorar % cartão / pix / boleto pra calibrar fluxo de caixa
- **Volume mensal de orgs criadas via fluxo:** esperado 10–50/mês inicialmente (sinaliza adoção)
- **Tempo entre envio do convite e clique no link:** se >24h em média, investigar copy do e-mail / canal alternativo (WhatsApp do AM?)
- **% de cliques no botão "Algo está errado?":** se >10%, há problema no setup do AM no admin — sinal de baixa qualidade do convite
- **% de membros que pulam 2FA quando flag da org está OFF:** se >50%, sinal pra promover ativação da flag em campanhas de segurança

**Critério de Rollback / Investigação Urgente:**
Se em 30 dias após lançamento:
- Taxa de conversão < 80% **OU**
- Tempo médio > 10 min **OU**
- Qualquer incidente de **dupla cobrança** ocorrer,
→ **pausar o fluxo digital, voltar ao onboarding manual via AM** e abrir investigação.

---

## Anexos e Referências

- **Doc fonte de regras de cobrança:** [fluxo_cobranca_cancelamento_awsales_v5.docx](../2026-04-08-novo-fluxo-cobranca-cancelamento/fluxo_cobranca_cancelamento_awsales_v5.docx) (v5.3, abril 2026)
- **Comentário do PG (27/abr):** cobrança no último dia do mês pra todas orgs (não mais dia 5/15/25). Só emissão de invoice segue como exceção.
- **IAM/WorkOS:** [docs/domain/iam/](../../apps/awsales-backend/docs/content/docs/domain/iam/)
- **Stack:** Greenfield (AWS-native). Sem detalhe técnico nesta story — produto-only.
- **Figma:** pendente — Greg está aguardando essa story pra produzir layout.
- **Story relacionada:** [stories/team-funcoes-config.md](stories/team-funcoes-config.md) — define o admin que convida membros e a flag de 2FA da org.

---

## Changelog

- **2026-05-11 (v1)** — Versão inicial cobrindo Persona A (Responsável da Org): revisão, pagamento, cadastro, termo, 2FA, convite de membros, invoice.
- **2026-05-11 (v2)** — 2FA da Persona A virou **opcional no 1º acesso** (ativável depois em Segurança; quando ativado, vira obrigatório pra toda a org).
- **2026-05-11 (v3)** — Ampliada pra cobrir Persona B (Membro Convidado) com seção 4.10 (10 cenários), DoD específico, 2 cenários de quebra adicionais (Q13, Q14) e métricas próprias.
- **2026-05-11 (v4)** — Correções de terminologia (**AM → time comercial** onde refere a quem cria a org/dispara convite; AM/Gerente da Conta passa a ser papel de relacionamento contínuo, opcional no momento do convite). Separação explícita **Implementação vs Plano**: implementação é cobrada agora; plano é apenas programado pra cobrança no fechamento do mês com pro-rata. Métodos de pagamento podem ser **distintos** entre Implementação e Plano (Cenários 1, 2, 3, 3.1, 3.2, 4, 4.1, 4.2, 4.3 + Q15, Q16, Q17).
- **2026-05-11 (v5 — pós stress test)** — Endereçados gaps P0 do stress test 2026-05-11:
  - **2FA com força** (Cenário 9 + 9.1 + 9.2 reescritos): flag ON da org torna 2FA obrigatório no 1º acesso (sem botão "Pular"); ativação posterior derruba sessões + força reconfiguração; nova mecânica de desativação.
  - **Termo cross-org** (Cenário 8 + 8.1 + 20 reescritos): aceite é global por usuário, válido pra todas as orgs; nova versão dispara re-aceite com diff.
  - **Persona A multi-org** (nova seção 4.11 + Cenários 26 a 26.5): detecção de usuário pré-existente, fluxo enxuto (3 etapas em vez de 5), reuso de Stripe customer, TOTP cross-org, redirect direto pro dashboard da nova org.
  - DoD ampliado com 8 checks adicionais.
- **2026-05-11 (v6)** — Refinamentos pós-revisão visual dos protótipos:
  - **Pagamento em 2 momentos separados** (Cenário 2, 4, 4.1, 4.3 reescritos): W3-A cobra **só a Implementação** (charge 1, endpoint Stripe da implementação) → W4-A cobra **1ª fatura do plano com pro-rata** + registra método pra recorrência (charge 2, endpoint Stripe do plano, **independente**). Métodos podem ser distintos. Próximas faturas (mês cheio) saem no último dia de cada mês.
  - Cada botão de pagamento mostra valor literal do que está sendo cobrado.
  - **W8-A simplificada** (histórico): no signup, a decisão de política da org foi separada do setup de TOTP. **Substituído pelo v7**, que remove a tela do fluxo.
  - **W9-A blocos** (Cenário 11 reescrito): convite agrupado em blocos por função. Cada bloco com função distinta + até 20 e-mails. Sem limite de blocos.
  - **Idioma + fuso horário** (novo Cenário 11.5 + ajuste no Cenário 18): movido pro responsável (W6-A) como **default da organização**. Membros (W3-B) não veem mais esses campos no signup — herdam, podem mudar em "Meu perfil".
- **2026-05-12 (v7 — feedback PG)** — Removida a tela "Política de segurança da sua organização" do primeiro login/signup. Após o aceite de termos, o responsável vai direto para convite de equipe. A política de 2FA nasce como `PENDING` e aparece como banner de pendência em Configurações da organização, com definição em `Configurações → Segurança`.
- **2026-05-12 (v8 — feedback PG)** — Removida obrigatoriedade de leitura por scroll no termo. W7-A libera avanço por checkboxes obrigatórios de aceite/cobrança/LGPD, com registro explícito das confirmações.

---

## Pendências de Confirmação com PG

1. **Mobile no MVP** — bloqueio educado (*"melhor experiência em desktop"*) ou deixar quebrar?
2. **Analytics/Observabilidade** — qual destino de telemetria pra instrumentar o funil? (Mixpanel? Datadog? Outro?)
3. **Cancelamento de convite pelo AM durante o fluxo do cliente** (Cenário Q6) — suportar real-time no MVP ou aceitar como caso de borda raro?
