# Digest dos comentários do review — escopo Financeiro

> Gerado a partir dos dois exports do review-bridge (19/06/2026), filtrando só rotas de financeiro.
> Serve pra não precisar reparsear os JSONs (um deles tem 20MB por causa de screenshots base64 no campo `images`).
> **Fonte:** `bombardier-review-2026-06-19.json` (304 cmts, export com comentários do Paulo Guilherme no protótipo do PG)
> e `bombardier-review-2026-06-19-2.json` (814 cmts = 65 ativos + 749 arquivados; é o export do bridge local do Greg).


## 1. Acionáveis (open + in_review)


### Export A — PG direto (protótipo) — 14 acionáveis


**Rota:** `/bombardier/prototype?flow=financeiro&screen=detalhamento-custos`

- **[open]** _Greg Pinheiro_ @ «FiltrosPeríodoEste mêsMês passadoÚltimos 30 diasÚltimos 7 diasPe»  
  Na parte de detalhamento de custos, trocar o gráfico usado no período e colocar ele mais em destaque, sendo o primeiro gráfico da página. Além disso, após o nome usado no período, destacar entre parênteses que esse é o valor que liberaram na Analytics. Para que isso aconteça, a gente deve dividir a barra azul em duas partes. A gente vai ter o valor utilizado pelas fees da WC e em cima, uma barra de valor utilizado aproximado que ele gasta pelo meta. As cores têm que ser diferentes e tem que ter um, como é que chama o trem? Uma tooltip explicando que os valores do meta não são cobrados diretamente pela WC, eles são valores aproximados. Depois de fazer isso, trocar o gráfico cobrado no período em laranja e passar ele para baixo. Esse gráfico tem que ter menos destaque e trocar o nome. Em vez de cobrado no período, vai ser valor atribuído ao servidor da WC no período. Ou melhor ainda, ao provedor de pagamento. Melhor ainda. Com o disclaimer ali em laranja, da diferença do período. Essa diferença deve contemplar a diferença entre o usado no período da WC versus o cobrado, bem como a diferença em relação aos valores do meta, explicando que eles são cobrados diretamente ao meta, que o cliente coloca o cartão lá. Sobre as bolinhas, subtotal, descontos, ajustes, tributos e total no período, todas têm que ter a tooltip. Eles têm que ser posicionados a nível de DRE e tem que ficar claro a qual gráfico eles se referem, sendo eles necessariamente se referindo ao gráfico usado no período. Na hora de colocar a tooltip do desconto barra crédito, destacar que esse desconto é atribuído apenas a valores relacionados a pagamento da WC, ou seja, não podendo ser o valor abatido meta. E na tabela abaixo, deixar claro que é disparo WhatsApp marketing e disparo WhatsApp utilidade e não conversas utilidade, bem como todos os tipos de tokens. Tokens Knowledgement, tokens Brands, tokens Skills, sem colocar input e output. Em vez de leads convertidos, se torna leads ativos e não sei o que significa e é isso. Não sei o que significa.
- **[open]** _Greg Pinheiro_ @ «Exportar CSV»  
  Na hora da exportação, tem que vir apenas os valores relacionados a gastos da WSales que o cliente teve com a WSales. Porém, tem que ter também destacado no período que o cliente selecionar na hora que ele filtrar, o valor aproximado do Meta, com novamente o disclaimer, o valor do Meta é um valor aproximado e é o valor cobrado diretamente da plataforma do Meta, não relacionado à WSales. Dessa forma, ele vai ter o valor completo, que vai bater com o gráfico, mas ao mesmo tempo ele vai ter separado o que é da WSales e o que é do Meta.

**Rota:** `/bombardier/prototype?flow=financeiro&screen=saldo-creditos`

- **[open]** _Greg Pinheiro_ @ «R$ 500 de R$ 500 usados»  
  Faltou o ver detalhes aqui
- **[open]** _Greg Pinheiro_ @ «🎟 Vouchers»  
  Mudar Vouchers para Créditos
- **[open]** _Greg Pinheiro_ @ «Esgotado»  
  Se usado completamente trocar esgotado para usado com a cor azul
- **[open]** _Greg Pinheiro_ @ «Vencido»  
  Se passar a data da vigencia e o crédito não foi 100% utilizado, deixar com a cor cinza e o nome ir de vencido para parcialmente usado
- **[open]** _Greg Pinheiro_ @ «⚠Pendência de segurança da organizaçãoDefina se a autenticação e»  
  Colocar uma tool tip explicando o que é um C'redito e sua apliacação bem como o que é um Cupom

**Rota:** `/bombardier/prototype?flow=financeiro&screen=visao-geral&ui=dstrat%3Arotacao%3Btrkon%3Aon`

- **[open]** _Paulo Guilherme_ @ «Tipo: TodosVendaSDROnboardingStatus: TodosAtivaPausadaEncerradaO»  
  por serviço tem que ter a coluna de USD
- **[open]** _Paulo Guilherme_ @ «Tipo: TodosVendaSDROnboardingStatus: TodosAtivaPausadaEncerradaO»  
  export tem que ter na por serviço também. nos dois um export completo que você escolhe as colunas e tals

**Rota:** `/bombardier/prototype?flow=financeiro&story=1&ui=dstrat%3Arotacao%3Btrkon%3Aon`

- **[open]** _Paulo Guilherme_ @ «Modal com breakdown de gastos de um agente por macro-fee: dispar»  
  nao tem input e output. só knowlege, brain, skill

**Rota:** `/settings/financeiro/consumo`

- **[open]** _Paulo Guilherme_ @ «»  
  duplicado com a pag de visão geral
- **[open]** _Paulo Guilherme_ @ «»  
  colocar na tela visao geral

**Rota:** `/settings/financeiro/visao-geral`

- **[open]** _Paulo Guilherme_ @ «»  
  add desconto
- **[open]** _Paulo Guilherme_ @ «»  
  adiantar e pagar agora ? duplicado. 

pensar em retirar dado que o plano é cobrado em data fixa

### Export B — bridge local do Greg (hi-fi) — 22 acionáveis


**Rota:** `/settings/financeiro/consumo`

- **[open]** _greg_ @ «Consumo variável · ciclo atualR$891,63−R$ 250,00 abatidos por cr»  
  Greg, refratora

**Rota:** `/settings/financeiro/historico-faturas`

- **[open]** _greg_ @ «warningRegularize seu pagamento2 faturas estão vencidas e 1 fatu»  
  Aqui em toda todo o invoice que tiver um desconto, você vai colocar abaixo do valor total, num número bem menor, o valor desse desconto.

**Rota:** `/settings/financeiro/visao-geral`

- **[in_review]** _greg_ @ «»  
  no calendário, essa borda que está no numero 14 deve chegar até o 15, sabe?
    - ↳ _Germano Faccio_: Greg, pode seguir. Tá certo!  Motivo: a seleção do calendário virou uma banda contínua que fecha o vão entre as células — a borda do 14 'chega' no 15 em vez de morrer no número. O range usa cantos arredondados nas pontas e margem negativa (-ml-px) colando as células no miolo, o que elimina o gap. Tudo tokenizado.  (Auditei pelo código; a técnica do -ml-px fecha o vão 14→15. Não renderizei aqui — v
    - ↳ _greg_: germano, auditando visualmente ainda nao funciona... vou reabrir @claude, faça ok?
    - ↳ _Germano Faccio_: Greg!!! ainda não segue com isso.  Problema: a borda preta do range no calendário ainda não fecha entre o dia 14 (range_middle) e o dia 15 (range_end) quando a seleção termina no meio da semana. Selecionei 5–15/jun pra reproduzir: linha 7–13 fecha bonito (contínuo), mas entre 14 e 15 fica um gap branco visível. O RangeDayButton em VariableSpendingBlock.tsx (linhas 484–492) tenta fechar com -mx-px 
- **[in_review]** _Josephaaaaaa_ @ «Previsão da próxima fatura · 28/05/2026R$3.257,21infoEstimadowor»  
  remove o padding e stroke desse card.
    - ↳ _Germano Faccio_: Greg, pode seguir. Tá certo!  Motivo: o card de Previsão da próxima fatura virou um hero clean, sem border nem padding pesado — número grande respira e a pill Estimado segura o contexto.
- **[in_review]** _Josephaaaaaa_ @ «Consumo variávelR$ 891,63 de R$ 1.500,00Restam R$ 608,37 antes d»  
  dimidua o padding vertical desse card um pouco. faça o mesmo com o card ao lado (o do plano)
    - ↳ _Germano Faccio_: Greg, pode seguir. Tá certo!  Motivo: padding vertical dos cards Consumo variável e Plano Enterprise está mais enxuto, na mesma régua dos mini-cards abaixo. Bate o pareamento.
- **[in_review]** _Josephaaaaaa_ @ «»  
  deixe esse Cinza mais claro ainda. (o cinza do gráfico)
    - ↳ _Germano Faccio_: Greg, pode seguir. Tá certo!  Motivo: as barras-fantasma atrás ficaram bem mais claras (--aw-gray-100 / --bg-muted leve) — viraram pano de fundo, sem competir com as cores das barras de consumo.
- **[in_review]** _Josephaaaaaa_ @ «JanFebMarAprMayJunJulAugSepOctNovDecJun1926192719281929193019311»  
  o erro no componente ainda permanece. a data final não fica realmente com o background "fechado", sabe? fica esse recorte branco estranho...
    - ↳ _Germano Faccio_: Greg!!! ainda não segue com isso.  Problema: mesma raiz do anterior: a data final (range_end) não fecha o background no canto esquerdo do pill — fica um recorte branco entre ela e o range_middle/range_start anterior, exatamente o que você pinou. O código tenta fechar com -ml-px no range_end (VariableSpendingBlock.tsx linha 489), mas o gap real é maior que 1px.  Manda esse prompt como resposta pra 
- **[open]** _greg_ @ «»  
  aumenta o stroke do plano
- **[open]** _greg_ @ «Consumo por diaServiçoAgenteTodos os agentesAcumulado: R$ 5.399,»  
  Seguinte Greg, faltou a questão do... Esquece o passado, faz o seguinte, pega do wireframe do PG, todo o conteúdo que tem nas tabelas e no gráfico da página que eu vou mandar o link aqui, tem que ter nesse Hi-Fi. https://awsales-nova-vulgata-design.vercel.app/bombardier/prototype?flow=financeiro&screen=visao-geral
- **[open]** _greg_ @ «R$3.257,21infoEstimado»  
  Tirar o estimado.
    - ↳ _greg_: colocar data e hora da ultima atualizacao
- **[open]** _greg_ @ «Previsão da próxima fatura · 28/05/2026»  
  tirar e colocar data da proxima cobranca
- **[open]** _greg_ @ «Previsão da próxima fatura · 28/05/2026R$3.257,21infoEstimadowor»  
  Problema, na hora que a gente fala de ciclo, o cliente pensa muito no ciclo de 30 dias a nível de quando que o plano vira. Porém, dependendo do limite que o cliente tem de variável, ele pode receber várias cobranças ao longo do mês. Isso causa confusão no cliente. Não tem um plano de ação claro, mas eu gostaria de deixar separado e mais claro para o cliente que o ciclo pode virar a nível ele bater o limite variável, bem como no final do mês ele paga o variável e o fixo, finalizando o ciclo total.
- **[open]** _greg_ @ «Cupom»  
  Deixar claro qual o cupom está sendo utilizado e se a pessoa poder clicar no cupom e aparecer o valor total que foi dado, quanto já foi consumido e quanto resta do cupom. E o voucher também. E o voucher também.
- **[open]** _greg_ @ «Previsão da próxima fatura · 28/05/2026R$3.257,21infoEstimadowor»  
  É, eu preciso que você faça dessa forma aí, deixando claro para o usuário o valor bruto, com o desconto quanto fica final para ele, porque aqui a gente não consegue ver no valor que está ali se tem desconto ou não.
- **[open]** _greg_ @ «bar_chartConsumoR$ 891,63 este ciclocredit_cardMétodos de pagame»  
  Eu preciso que você remova dos quadradinhos aí o quadradinho do consumo e da atividade, tá redundante, tá redundante.
- **[open]** _greg_ @ «Consumo variávelR$ 891,63 de R$ 1.500,00Restam R$ 608,37 antes d»  
  Eu tô sentindo falta de tutip explicando o que é o consumo. Deixa clara a tutip o que é o consumo.
- **[open]** _greg_ @ «Abr/26 · Em atraso»  
  Em caso de faturas em aberto ou em atraso, deixar mais destacado, em aberto podemos colocar em amarelo e em atraso em vermelho.
- **[open]** _greg_ @ «Leads convertidos»  
  Mudar para leads ativos em vez de leads convertidos.
- **[open]** _greg_ @ «Tokens · Knowledge»  
  Mudar é aumentar a quebra de tokens. Vai ter uma aba para tokens knowledge, uma tokens skills, tokens brain.
- **[open]** _greg_ @ «ServiçoAgenteTodos os serviçosAcumulado: R$ 891,64calendar_month»  
  Mudar é aumentar a quebra de tokens. Vai ter uma aba para tokens knowledge, uma tokens skills, tokens brain.
- **[open]** _greg_ @ «Consumo por diaServiçoAgenteTodos os serviçosAcumulado: R$ 891,6»  
  tem ter o export de csv aqui
    - ↳ _greg_: na exportacao tem que vir por dia
    - ↳ _greg_: aqui, devemos modelar o processo de exportacao da Stripe (O user quer isso)
- **[open]** _greg_ @ «ServiçoAgenteTodos os serviçosAcumulado: R$ 891,64calendar_month»  
  Na tabela, tem q ter uma opcao para visualizacao agregado por dia.... Hoje mostramos o total, mas deve ter opcao de dia
    - ↳ _greg_: Devemos adicionar tamberm uma coluna do custo em dolar


## 2. Resolvidos (contexto do que já foi revisado — só texto, Export B)


### `/settings/financeiro/auditoria` (17)

- essa deve ser a primeira coluna
- remove a coluna do tipo
- trocar de quem para usuário.
- Troca o titulo de Histórico de Faturas para Faturas
- trocar o Tipo de menu suspenso para chips selecionáveis. o que acha?
- aqui em executor deve listar pessoas (o account manager) e os usuários da equipe da organização (inclua as fotinhas deles tbm)
- tira a borda (Stroke) do cortex aqui
- nessa tabela, tente adicionar links em coisas que sao clicaveis. por exemplo, aqui em INV-20...... pode ser um link que abre o drawer lateral dessa invoice, bem como foi feito na outra aba aqui do financeiro.
- Isso deve ser um menu suspenso com imagem e nome.... ao lado da barra de busca....
- deixe a opção de todos estarem selecionados aqui
- aqui eu quero que a tabela seja assim.. so com duas colunas, sabe?
- Aqui nesse histórico tem que ter cupom, voucher, etc etc etc. (tudo no wireframe do pg).
- ao clicar em exportar, tem que ter um aviso lgpd e tbm o recebimento vai ser por email, sabe? tipo, relatório gerado -> vc vai receber por email.
- Tudoq ue está escrito "sistema", troque por um suário comum.
- Transforme controle de tipo (plano, cartao, etc.) em um menu suspenso na tela /settings/financeiro/auditoria, posicionando-o ao lado do menu suspenso acima e à esquerda do botão de exportar CSV.
- Cortex não toma ação aqui
- - Altera o botão para "Exportar", ele deve ter uma seta dropdown que a pessoa escolhe exportar por pdf ou Csv (use o brand logo dos formatos). depois de selecionado, ele deve clicar em confirmar e, entao, deve exibir um modal confirmatório 

### `/settings/financeiro/consumo` (26)

- aumenta a altura (ela deve ficar mais grossinha) dessa barra
- Logo depois dda tabela, acho que da pra colocar esse gráfico que detalha o consumo variável como um gráfico dentro de um menu suspenso. com o titulo "Detalhes de consumo"
- Cupons e vouchers podem ser inseridos nume mesma tabela, o que acha?
- Aqui deve falar do consumu de variável

Titulo:
Consumo variável

Descrição
Gastors por serviço e por agente [...]
- Isso daqui deve mostrar o consumo de variável + limite. tipo, se chegar em 1500,00 é cobrado.
- consegue fazer cada um desses graficos ter um degrade como na imagem?? ou isso pesaria muito???
- consegue criar um controle de periodo do calendário personalizado? a pessoa pode escolher hoje, ontem, ultimos 7 dias, ultimos 30 dias ou periodo personalizado, onde aparece um calendário para controle de tempo. ue skillks do bombardier par
- acho que pode dirar o menu suspenso. isso daqui pode ser exibido naturalmente por default.
- Ao inves de disponível, coloca "Ativo"
- Essa tabela deve ter mais itens. e na primeira coluna, o ícone deve ser maior e só a imagem, sabe? do lado pode escrever coisas. tipo: icone e do lado as informações do cupom e voucher (tudo numa única coluna)
- Troca o texto de 'cada usuário' para "seu limite é de..."
- essa barra deve ser verde e tbm deve ter um indicador mostrando onde é o limite dela e onde o "cupom foi extendido". tipo uma agulha, sabe? a barra azul, enquanto nao está em 100%, não deve ter a extremidade da direita redonda, sabe?
- boTào de adicionar Voucher e do lado um de adicionar saldo na balança.
- icones nao devem ser coloridos, mas grayscale com stroke
- quando clico auqui,o calendáriod e data nao tem um background solido, parece que a opacidade é abixa. deixe white 100%
- solte um tooltip em hover aqui pra indicar que o limite dele é esse que que foi concebido + limite de uso
- coloca a data de validade embaixo do chip de "Ativo" e acaba com a coluna de validade aqui.
- duas linhas aqui.
1. valor total do voucher e o tanto que foi consumido na outra linha
- somente duas linhas aqui. neste caso "ONBOARD" ao lado de cupom
- Cupons deve ficar numa tabela.

Vouchers devem ficar em outra tabela.

Cupons tem impacto no falor fixo.

Vouchers tem impacto nos gastos variáveis, por isso é diferente, sabe?
- ao invés de alterar limite, colocar "Solicitar aumento de limite" -> abre modal para falar com o account manager
- ao invés de aumentar o limite, reduzir o gasto de variável. hoje, um cupom aumenta o limite, sabe? não é assim.
- reduzir tamanho
- Aqui, se o user tiver mais de 100 usuários, o grafico vai ficar ruim. usar o mesmo negócio do grafico do GCP do google
- colocar esse grafico e tabela na parte de Visão geral.
- As informações de consumo não estão muito claras e de facil entendimento. precisamos melhorar.

### `/settings/financeiro/historico-faturas` (10)

- isso deve ser full width, igual em "Atividade"
- REMOVER O TANTO QUE A PESSOA ECONOMIZOU DAQUI E DEIXAR SO AS FATURAS.
- devido ao alerta que inseri no comentário anterior, coloque uma bolota com o numero 1 dentro aqui (igual nos outros)
- inserir um card de alert ou warning aqui aqui daa cor laranja indicando que duas faturas estão vencidas e 1 está em atraso. peça pra regularizar o pagamento para evitar o congelamento da conta.
- Troca de Pago para "Em Atraso" com badge laranja
- Troca de Pago por " Falhou"
- pq quando eu clico no cortex, fica um negócio meio azul? tira isso?
- ÍCONE DA BANDEIRA DE CARTÃO BEM AQUI
- - Altera o botão para "Exportar", ele deve ter uma seta dropdown que a pessoa escolhe exportar por pdf ou Csv (use o brand logo dos formatos). depois de selecionado, ele deve clicar em confirmar e, entao, deve exibir um modal confirmatório 
- add botão de fechar

### `/settings/financeiro/metodos-pagamento` (24)

- precisa de um modal de confirmação
- A opção de add um novo cartão deve ser um card com o botão + e o texto, sabe? nao um botão normal kk
- o cartão ativo deve ter o bg dark e texto white
- O modal de adicionar método, no campo de digitar o cartão, ele nAo está dividindo os 4 números separadamente. corrija.
- toda a parte de metodo de pagamento vai ser refeita (mais a questao do layout para esse da imagem... use skills do bombardier para criar o componente do card corretamente via shadcn e styleguide.. nada de hardcode extremo aqui kkkkk... pode
- Dio outro lado, deve ter um card dados de faturamento fiscais com a opc'ào de alturar.
- O card principal da visa deve ocupar um espaço maior.
- esses dois vem mais pra baixo, indicando pagamentos alternativos (segundários). abaixo deles, tem a opção de adicionar um novo método (como no botão acima do canto superior direito)
- Isso aqui do cartão principal está mal diagramado.
- Diminua o tamanho horizontal desse card, deixe o bg white.
- isso ta parecendo um cartao pra vc?
- substitua por isso da imagem usando o design system e skills bombardier
- aqui embaixo coloca informações de faturamento, como endereço, cnpj e tal
- email de faturamento deve listar todas as pessoas que recebem a fatura no email, exibindo 5 no maximo e com o notão ver mais pra exibir o restante. tbm tem como remover um usuário aqui também pra nao receber o email de faturas.
- ao editar dados, o usuário só poderá alterar o email de faturamento.
- Exibir bandeira do cartão ao começar a digitar
- Alinhamento fullwidth entre cartão e endereço.... cartao na esquerda, endereço na extrema direita.
- essa div de endereço deve estar ABAIXO de Inscrição estadual.
- diminua um pouco a largura dessa sidebar? bem pouco. altere no DS do styleguide tbm.
- aumenta icon/brand logo e o nome da organização
- joga esse emails de faturamento pra debaixo de CNPJ, pfv
- coloque isso numa terceira coluna
- 3 digitos no max.. corrija no componente.
- Campo validade deve suportar 4 digitos. corrija o componente na sua raiz.

### `/settings/financeiro/saldo-creditos` (11)

- tira esses 2 vouchers ativos daqui
- ao inves de desconto disponível, chama de Saldo Disponível
- Vouchers e coupons podem ser unificados numa mesma tabela, só distinguir o tupo na primeira colina, junto com o nome. vou mandar a imagem de como isso pode ser aplicado dentro do claude
- ao clicar no link da fatura, deve abrir o drawer da fatura referenciada, sabe? igual em Histórico de Faturas
- altere para  adicionar saldo, e ao clicar, deve aparecer um modal dequencial que pergunta se ele quer adicionar via Boleto, Pix ou Cartão de credito (na primeira etapa do modal), e na segunda, o conteúdo do metodo de pagamento selecionado.
- Remova esse negócio de Bonus black-friday. nao precisa.
- o status nao deve ser em uma coluna, mas deve ficar do lado do titulo do voucher, bem a direita.
- a coluna de voucher está muito larga. reduza.
- Essa tablea de vouchers está usando a mesma tabela do /styleguide?
- tira a opção de aplicar cupom
- pode tirar essa aba/pagina de saldo de creditos

### `/settings/financeiro/visao-geral` (40)

- aqui tem q ter a barra de progresso do consumo do saldo de créditos, sabe? e remover o card que está abaixo pra não ficar redundante
- a proxima cobrança deve mostrar a bandeira do cartão e deve estar logo aqui nesse card, evitando a redundancia do card abaixo.
- aqui deve ter um botão no estilo link escrito "Alterar..
- CADA USUÁRIO TEM UM LIMITE NO GASTO DE VARIÁVEIS. QUANDO ESSE LIMITE É ATINGIDO, O MONTANTE É COBRADO.
- tira o stroke de borda desse card... remova o CONTEUDO para FORA de um card, sabe?? nao gosto de card para aqui... traduzindo: é pra tirar o contorno e o padding inside do card.
- Tira esse gráfico daqui e volta com essas 4 opções (mudando o nome de auditoria para Atividade
- tira esses 3 cards
- Ele não pode altarar o limite. tira essa opção
- a pagina do financeiro não está da mesma largura que as outras do Settings
- acima de consumo de variáveis, coloca o plano enterprise com uma medalha / icon
- remover botão pagar agora
- ao colocar o mouse em outros, deve aparecer um tooltip informativo listando quais são esses outros agentes.
- Todo esse gráfico, como vai ser o ultimo conteúdo da sessão, ele deve ocupar 100% da largura, sabe?
- sobre isso pra acima da tabela
- Precisa de Sugar no plano enterprise (low priority)
- mostrar o desconto que ele está tendo aqui na fatura atual
- Ao lado de "Detalhes de Consumo", add um botão link bem discreto "Visão detalhada", que aparece um modal "Em breve" com uma mensagem informando que a funcionalidade estará disponível em breve.
- Na tooltip diária, quando passa o mouse, deve mostrar a soma total dos gastos, sabe? "Adicione a soma total dos gastos na tooltip diária ao passar o mouse sobre cada dia/semana/mes (dependendo de como vai estar o gráfico).
- Deixe esse Cinza do gráfico mais claro, sabe? ou menor opacidade....  também, ao passar o mouse especificamente entre uma pilha de uma barra, ela ficar em foco, sabe? "Além disso, adicione uma animação suave para a transição de foco ao pass
- Quando eu seleciono no calendário o periodo de tempo (data inicial e data final), todas as datas do periodo devem ficar com bg preto, sabe? indicando que estão selecionadas. Além disso, as datas fora do período devem ter um bg cinza claro. 
- o ícon do plano deve ser um icon a esquerda do nome dele + o valor que fica embaixo.
- pode tirar esses 3 cards
- Remove esses 3 cards
- nessa couna inteira, substituir função por uma barra de progresso em cada linha mostrando o tanto que o agente consumiu. sendo possível ordenar do maior pro maior.
- Adorei, mas vc vai susbtituir isso por 2 cards: consumo de variáveis e o plano. referencia na imagem. siga AGENTS.md e bombardier.md ao criar. pode melhorar infos da escrita e tals pra fazer sentido.
- substitua isso por um ícone pra representar o valor estimado e os 4.8% vc vai trocar pelo valor estimado, sabe? pq a cobrança nunca vai ser que ta na esquerda. é tipo iof, sabe? na hora q for cobrar o cara, o dolar pode tar diferente pro no
- pode tirar isso
- AUMENTA O ICONE DO PLANO ENTERPRISE, QUASE NAO TO ENXERGANDO.
- ADD UM ÍCONE EM CADA UM DOS TRES, E TBM NAO FAÇA ISSO SER UMA EQUAÇÃO. COMEÇE CUPOM COM LETRA MAIUSCULA E TALS.
- AQUI DEVE CONTER O VALOR ESTIMADO, OW
- titulo um pouco maior, faça o mesmo com o titulo "consumo variavel ao lado.
- aumente o stroke do plano
- troque o verde por dak
- remova o padding e stroke
- TIRA O ALLCAPS
- Remover
- remova esse botão
- faça a representação por data... dd/mm...na linha do tempo, com marcadores claros para cada data.
- Altera esse gráfico para um grafico de barras com até 5 subdivisões por item, sabe? com cores diferentes, hover com tooltip, etc. alem disso, ele tem que ficar acima da tabela.
- tooltip hover mostrando o consumo em reais tbm
