# Stress Test Financeiro — F3: Fintech BACEN (NeoBank Co.)

**Agente:** adversarial Red Team com lente tripla (🔧 Funcional · ⚖️ Compliance · 🎯 UX)
**Perfil:** NeoBank Co. — fintech regulada BACEN, 200 FTE, CEO Lucas, auditoria mensal obrigatória, dispute aberto em INV-2026-03-1234 (R$ 50k), Splunk como SIEM, procurement exige NF por consumo.
**Data:** 2026-05-11
**Cenários testados:** 5
**Framing:** Cliente regulado tem ZERO tolerância pra falha de compliance. BACEN audita mensalmente, multa por gap fica entre R$ 50k–500k. Endurecemos especialmente em LGPD, BACEN Circular 4.893, PCI-DSS, segregação de funções.

## Sumário
- **Passaram:** 0 · **Com dor:** 1 · **Quebraram:** 4
- **Total de gaps:** 27 (P0: 11 · P1: 12 · P2: 4)
- **Por lente:** Funcional 8 · Compliance 14 · UX 5
- **Gaps "fora do MVP mas mata o deal F3":** 4 (todos marcados explicitamente)

**Veredito:** **deal-breaker em 4 dos 5 cenários** pro perfil F3. Para fintech regulada BACEN, a Story 3 no estado atual **não passa em due diligence de compliance**. Os 4 gaps que matam o deal mesmo "fora do MVP": (a) SIEM streaming inexistente, (b) NF/recibo fiscal automático em consumo de voucher, (c) PII Filtering não aplicado em executor do audit trail, (d) ausência de evidência de segregação de funções entre admin AwSales e cliente.

---

## Cenários

### F3-1: Dashboard precisa segregar dados PII vs não-PII por permissão (segregação BACEN)

**Seed original:** Lucas (CEO, função "Administrador" sem `Visualizar PII`) entra no Financeiro. Vê tabela de campanhas — mas cada campanha vincula a um usuário criador. Coluna "Criado por" do audit trail mostra nomes completos. Tela cumpre PII Filtering? Lentes: ⚖ LGPD Art. 46 + BACEN segregação, F (PII filter aplicado server-side), U (mascaramento visualmente consistente — não muda layout, só conteúdo).

**Walkthrough (beat-by-beat com 3 lentes):**

**Beat 1.** Lucas faz login e abre `Configurações → Financeiro`. Tela carrega W1 com cards (Plano, Fatura atual, Limite, Utilizados, Próx. cobrança).
- 🔧 **Funcional:** OK — carrega normalmente. PERO: A Story 3 só lista PII Filtering pra "e-mails de invoice adicionais" e "IPs no audit trail" (Cenário 20). Não há menção de PII em "nome de executor do audit trail", "nome do criador da campanha", nem em tabelas de gestores de cobrança. Lucas tem `Financeiro · Visualizar` mas NÃO tem `Visualizar PII`. Backend está retornando dados completos? Aplicando filter server-side? Não há especificação.
- ⚖️ **Compliance:** **GAP** — LGPD Art. 46 exige medidas técnicas adequadas; BACEN Circular 4.893 §6º exige segregação de funções com evidência auditável. O ato de "ver quem fez o quê" no audit trail É tratamento de dado pessoal (nome + IP + ação). Sem PII Filtering no executor do audit, Lucas vê nomes completos de operadores AwSales (Bruno Costa, Ana A.) — informação que ele não precisa pra função e que viola o princípio da finalidade (LGPD Art. 6º II).
- 🎯 **UX:** **GAP** — não há feedback visual de que algo foi mascarado. Em fintechs BACEN, INDICAR "este campo está restrito por sua permissão" é essencial pra que o auditor saiba o que NÃO está vendo (Nielsen H1).

**Beat 2.** Lucas clica em "Por campanha". Tabela mostra "Black Friday Lead", "Recuperação CRM" — mas o backend não foi documentado pra mostrar criador. Story silencia sobre quem criou cada campanha.
- 🔧 **Funcional:** **GAP** — Story 3 não define se a tabela de campanhas tem coluna "Criado por". Wireframe W1 não tem. Mas é informação CRÍTICA pra fintech (rastreabilidade BACEN). Se for adicionada depois sem PII filter, é regressão.
- ⚖️ **Compliance:** **GAP** — BACEN exige rastreabilidade do criador da campanha (quem definiu trigger, target, mensagem). Se a tela não mostra, fintech tem que pegar via export. Se mostra, vira PII e precisa de filter.
- 🎯 **UX:** OK — não tem campo, não tem problema visual.

**Beat 3.** Lucas rola até o Audit Trail no rodapé. Vê eventos: "Sistema · webhook · fatura.paga", "Cliente · Felipe R. · cartao.padrao_mudou", "AwSales · Bruno C. · plano.mudou".
- 🔧 **Funcional:** **GAP CRÍTICO** — wireframe W7 mostra nomes completos ("Felipe Rezende", "Bruno Costa", "Maria R.") + e-mails subjacentes (Cenário 17 cita "Cliente · Felipe Rezende"). Não há indicação de que isto seja mascarado quando função do executor (Lucas) não tem PII. Story 3 Cenário 20 NÃO inclui "executor do audit trail" na lista de campos com PII Filtering aplicado.
- ⚖️ **Compliance:** **GAP CRÍTICO** — LGPD Art. 46 + Art. 6º II (finalidade) + BACEN segregação. Lucas (CEO sem PII) está vendo nomes completos de TODOS que atuaram. Isto é tratamento desnecessário e viola princípio do mínimo necessário. Para fintech regulada BACEN, este é o tipo de achado que vira multa em auditoria. Em ambiente Stripe, há precedente de mascaramento por papel: dashboards Stripe expõem só iniciais (B.C.) pra perfis ops, não pra perfis admin.
- 🎯 **UX:** **GAP** — mesmo se backend mascarar, wireframe não tem padrão visual definido pra "este nome está mascarado". Deveria ser "B.C." ou "Operador AwSales #4231" consistentemente, com tooltip explicando.

**Beat 4.** Lucas clica em "Exportar CSV" do audit trail. Modal LGPD aparece (W8). Lucas marca checkbox e exporta.
- 🔧 **Funcional:** **GAP** — CSV exportado contém os mesmos campos da tela. Se tela mostra nomes completos (gap acima), CSV também mostra. Pior: CSV não tem cabeçalho indicando "campo X foi mascarado por permissão".
- ⚖️ **Compliance:** **GAP** — CSV exportado vai pro Splunk/SIEM externo, ampliando o espectro de exposição. LGPD Art. 9º exige que o sujeito do dado seja informado. Operadores AwSales (que aparecem como executores) não consentiram que seus dados pessoais fossem exportados pra sistema externo do cliente. Há base legal? Não está documentada.
- 🎯 **UX:** OK — modal de ciência funciona.

**Beat 5.** Lucas tenta achar uma view "anônima" do audit (sem nomes). Não existe. Não há toggle "ocultar executor".
- 🔧 **Funcional:** **GAP** — falta toggle/view alternativa.
- ⚖️ **Compliance:** **GAP** — princípio LGPD da minimização exige opção de tratamento mínimo.
- 🎯 **UX:** **GAP** — Nielsen H3 (controle do usuário) e H7 (flexibilidade pra power user).

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei | Evidência |
|---|---|---|---|---|---|
| F3-1.G1 | Compliance | PII Filtering não cobre "executor do audit trail" — Lucas (sem PII) vê nomes completos de operadores AwSales | **P0** | LGPD Art. 6º II, Art. 46 + BACEN Circular 4.893 §6º | Story 3 Cenário 20 lista PII apenas pra "e-mails de invoice adicionais" + "IPs do audit" — não inclui campo `executor`; W7 mostra "Bruno Costa", "Felipe Rezende" sem mascaramento |
| F3-1.G2 | Funcional | Backend não declarado pra aplicar PII filter server-side em audit trail — risco de vazamento via DevTools | **P0** | LGPD Art. 46 (medidas técnicas) | Story 3 não especifica que API retorna dados pré-mascarados pra perfis sem PII (vs frontend mascarar) |
| F3-1.G3 | UX | Não há indicação visual de "campo mascarado por permissão" — auditor BACEN não sabe o que não está vendo | **P1** | Nielsen H1 (visibilidade do estado) | W7 wireframe sem placeholder pra estado mascarado |
| F3-1.G4 | Funcional | Coluna "Criado por" da campanha indefinida — story silencia se aparece ou não na tabela | **P1** | rastreabilidade BACEN | Cenário 5.2 lista colunas Nome/Tipo/Status/Valor/Ações, sem "Criado por"; ambíguo |
| F3-1.G5 | Compliance | CSV exportado replica vazamento — Lucas exporta nomes pra sistema externo sem base legal documentada pra operadores AwSales | **P1** | LGPD Art. 9º (consentimento de exposição) | Modal W8 não menciona que dados de terceiros (operadores) estão sendo expostos |
| F3-1.G6 | UX | Falta toggle "view anônima" pra auditoria sem PII | **P2** | Nielsen H3, H7 | Não previsto em W1 nem W7 |

**Status:** **QUEBROU** — não passa em due diligence LGPD/BACEN. Gap raiz é Story 3 Cenário 20 ter um catálogo INCOMPLETO de campos com PII Filtering.

---

### F3-2: Fatura DISPUTED + chargeback ganho — exibição clara da resolução

**Seed original:** Cliente NeoBank teve dispute aberto em fatura `INV-2026-03-1234` (R$ 50k). Após resolução, Stripe muda pra `CHARGEBACK_RESOLVED` (a favor da AwSales). UI mostra status — mas onde aparece a NARRATIVA do que aconteceu (data abertura → data resolução → motivo aceito)? Lentes: ⚖ CDC Art. 6º III (transparência total da disputa), F (timeline de eventos no modal de fatura), U (Nielsen H1 visibilidade do estado completo).

**Walkthrough (beat-by-beat com 3 lentes):**

**Beat 1.** Lucas abre Histórico de faturas. Vê linha "Mar/26 · Custos variáveis · 28/03 · — · R$ 50.000 · — · Cartão Visa •••• 3012 · ● CHARGEBACK_RESOLVED · …".
- 🔧 **Funcional:** **GAP** — Story 3 Cenário 8.1 lista os 13 status, incluindo CHARGEBACK_RESOLVED, mas wireframe W1 do histórico de faturas não tem espaço pra exibir status compostos. Badge será "CHARGEBACK_RESOLVED" como string? Existe tradução PT-BR ("Chargeback Resolvido a Favor")? Cenário 8.1 manda traduzir mas não fornece labels.
- ⚖️ **Compliance:** **GAP** — CDC Art. 6º III exige informação clara, adequada e ostensiva. Badge "CHARGEBACK_RESOLVED" em inglês ou em jargão técnico viola "linguagem clara". Lucas, sendo CEO regulado, precisa de DESCRIÇÃO acionável ("Chargeback resolvido a favor da AwSales em 22/04/2026"), não código.
- 🎯 **UX:** **GAP** — Nielsen H2 (match mental model). Cliente não conhece "CHARGEBACK_RESOLVED" como termo. Cor verde poderia confundir com "PAID" (mesmo verde no Cenário 8.1).

**Beat 2.** Lucas clica em "Ver detalhes" da fatura. Modal W4 abre. Mostra cabeçalho com status, line items, descontos, total, hash.
- 🔧 **Funcional:** **GAP CRÍTICO** — W4 NÃO TEM timeline de eventos. Para uma fatura DISPUTED → CHARGEBACK_RESOLVED, é absolutamente necessário ver: data de abertura do dispute, motivo declarado, evidência submetida, data de resolução, justificativa aceita. Story 3 Cenário 9 lista campos do modal (header, line items, cupom, total, hash, botão PDF) — sem timeline.
- ⚖️ **Compliance:** **GAP CRÍTICO** — CDC Art. 6º III + CDC Art. 42 §único (cobrança indevida com direito a contestação). Para fintech, BACEN exige documentação de cada disputa em arquivos contábeis 5 anos. Se a UI não expõe a timeline, Lucas precisa de export manual via suporte = handoff = entropia (e violação CDC).
- 🎯 **UX:** **GAP** — Nielsen H1 (visibilidade do estado completo do sistema). Modal mostra "PAID" ou "CHARGEBACK_RESOLVED" como ponto, não como processo. Cliente regulado precisa de processo.

**Beat 3.** Lucas precisa baixar a evidência pra arquivar no compliance. Clica em "📥 Baixar PDF da fatura".
- 🔧 **Funcional:** **GAP** — PDF inclui line items + total + hash. Mas não inclui timeline de eventos do dispute (que aparece no audit trail, mas separado). Cliente precisa de UM documento único pra arquivo contábil BACEN.
- ⚖️ **Compliance:** **GAP** — LGPD Art. 18 II (direito de acesso) + CDC Art. 6º III. PDF deveria conter toda a história da fatura. Hoje, separa.
- 🎯 **UX:** **GAP** — workflow forçado: cliente precisa baixar PDF + exportar CSV de audit trail + cruzar manualmente. Nielsen H8 (minimalismo) e H7 (flexibilidade) violados.

**Beat 4.** Lucas vai pro Audit Trail tentar achar a timeline.
- 🔧 **Funcional:** **GAP** — Story 3 Cenário 17 lista `fatura.contestada` e `fatura.chargeback` como eventos. Mas NÃO LISTA: `fatura.chargeback_resolvido_a_favor`, `fatura.evidencia_submetida`, `fatura.disputa_aceita_pelo_banco`. Catálogo de eventos é incompleto pra ciclo de chargeback Stripe.
- ⚖️ **Compliance:** **GAP** — BACEN exige cadeia completa de eventos pra auditoria. Faltam eventos.
- 🎯 **UX:** **GAP** — cliente abre audit, busca por "INV-2026-03-1234", encontra `fatura.contestada` (28/03) e `fatura.chargeback` (10/04) — mas não encontra `fatura.chargeback_resolvido` (22/04). Sem evento, status do Stripe mudou silenciosamente. Não há retroalimentação visual no audit.

**Beat 5.** Lucas tenta entender o valor financeiro: R$ 50k foi DEBITADO temporariamente do nosso lado durante o dispute? Foi devolvido? Houve juros?
- 🔧 **Funcional:** **GAP** — Story 3 não trata fluxo financeiro de dispute. Stripe debita o valor durante chargeback aberto e devolve quando ganha. NeoBank precisa registrar contabilmente: débito em 10/04, crédito em 22/04. Onde está esse cash flow timeline?
- ⚖️ **Compliance:** **GAP** — BACEN Circular 4.893 + práticas contábeis pedem rastreabilidade do cash flow. Ausência de timeline = compliance bloqueia fechamento contábil mensal.
- 🎯 **UX:** **GAP** — Lucas sai da UI frustrado e abre ticket pro suporte. Workflow gera entropia (handoff humano = perda de informação).

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei | Evidência |
|---|---|---|---|---|---|
| F3-2.G1 | Funcional | Modal de fatura W4 não tem timeline de eventos do dispute/chargeback | **P0** | CDC Art. 6º III | Story 3 Cenário 9 lista apenas header + line items + cupom + total + hash + PDF; sem timeline |
| F3-2.G2 | Compliance | PDF baixado não inclui histórico de dispute — viola direito de acesso pleno | **P0** | LGPD Art. 18 II + CDC Art. 6º III | Story 3 não menciona conteúdo do PDF além de line items |
| F3-2.G3 | Funcional | Catálogo de eventos (Cenário 17) não cobre chargeback_resolvido, evidencia_submetida, disputa_aceita | **P0** | BACEN rastreabilidade | Cenário 17 lista apenas `fatura.contestada` e `fatura.chargeback` |
| F3-2.G4 | Compliance | Ausência de timeline de cash flow (débito Stripe durante dispute → devolução) bloqueia fechamento contábil BACEN | **P0** | BACEN Circular 4.893 + práticas contábeis | Story 3 não trata fluxo financeiro de dispute |
| F3-2.G5 | UX | Status badges em jargão técnico (CHARGEBACK_RESOLVED) violam linguagem clara | **P1** | CDC Art. 6º III + Nielsen H2 | Cenário 8.1 manda traduzir mas não fornece labels PT-BR |
| F3-2.G6 | UX | Workflow forçado: cliente precisa cruzar PDF + CSV audit + ticket suporte pra fechar mês | **P1** | Nielsen H7, H8 | Não há vista consolidada de "tudo sobre esta fatura" |

**Status:** **QUEBROU** — fechamento contábil mensal de fintech BACEN não roda. Gap raiz é tratar "fatura" como objeto estático, não como processo com histórico.

---

### F3-3: Voucher pré-pago pra BACEN compliance (recibo emitido fiscalmente)

**Seed original:** NeoBank tem voucher de R$ 100k vigente até 31/12. Procurement exige recibo fiscal pra cada R$ consumido (registro contábil). Sistema gera audit event `voucher.consumido` mas não emite NF/recibo automático. Procurement contesta. Lentes: F (integração com sistema NF), ⚖ BACEN registro contábil + CDC nota fiscal eletrônica, U (visibilidade do recibo no audit trail).

**Walkthrough (beat-by-beat com 3 lentes):**

**Beat 1.** Voucher R$ 100k é emitido pela AwSales pra NeoBank. Lucas vê na sub-aba "Saldo de Créditos": "Voucher Q2 · ACTIVE · R$ 100.000,00 · utilizado R$ 0 · restante R$ 100.000 · expira 31/12".
- 🔧 **Funcional:** OK — wireframe W5 cobre.
- ⚖️ **Compliance:** **GAP** — voucher pré-pago de R$ 100k é uma transação financeira que deveria emitir NF de antecipação na emissão (recibo de aporte). Story 3 Cenário 17 lista evento `voucher.emitido` no audit, mas NÃO há gatilho pra NF. Procurement BACEN não aceita aporte sem NF.
- 🎯 **UX:** **GAP** — Lucas não vê referência ao recibo/NF do aporte na linha do voucher.

**Beat 2.** NeoBank gasta R$ 200 em disparos. Sistema debita do voucher (estado vai pra `ACTIVE` com R$ 99.800 restante). Audit registra `voucher.consumido R$ 200`.
- 🔧 **Funcional:** **GAP CRÍTICO** — Story 3 Cenário 17 confirma o evento `voucher.consumido (X reais debitados de uma fatura específica)`, mas NÃO há trigger pra emissão de NF/recibo fiscal a cada consumo. Doc backend `apps/awsales-backend/docs/content/docs/domain/billing/` (não consultado, mas inferido pela estrutura) precisaria ter um domínio `fiscal/` integrado — não está mapeado na Story.
- ⚖️ **Compliance:** **GAP CRÍTICO** — BACEN Circular 4.893 + Lei 8.846/94 (NF eletrônica) + Decreto 7.962/13 (e-commerce e serviços online) exigem documento fiscal pra cada operação. Procurement NeoBank contesta cada consumo. Sem NF automática, fintech tem que abrir ticket interno pra cada uso → entropia + handoff → impossível em escala (NeoBank consome dezenas de vezes por dia).
- 🎯 **UX:** **GAP** — audit trail mostra "voucher.consumido R$ 200" mas não tem coluna/campo "NF emitida #" nem link pra download de recibo.

**Beat 3.** Procurement de NeoBank pede pra Lucas exportar todos os consumos do voucher pra registrar contabilmente.
- 🔧 **Funcional:** **GAP** — export CSV de audit trail não tem campo "NF associada" porque NF não existe. Procurement precisa de cada linha vinculada a documento fiscal.
- ⚖️ **Compliance:** **GAP** — registro contábil BACEN exige documento fiscal pra cada movimentação. Sem ele, escrituração é considerada irregular → multa em auditoria.
- 🎯 **UX:** **GAP** — Lucas exporta CSV, procurement rejeita, Lucas abre ticket, fim do dia perdido.

**Beat 4.** AC7 explicita "Match PO ↔ NF (procurement) — fora do MVP". MAS pro F3 fintech, isso É o deal.
- 🔧 **Funcional:** Anti-claim conhecido, mas pra fintech regulada é P0.
- ⚖️ **Compliance:** Gap fora do MVP — **classificado "mata o deal F3"**.
- 🎯 **UX:** N/A.

**Beat 5.** Lucas tenta achar uma config "Emissão de NF automática" em algum lugar das Configurações.
- 🔧 **Funcional:** **GAP** — não existe. Nem na Story 3 nem como link pra Story futura.
- ⚖️ **Compliance:** N/A.
- 🎯 **UX:** **GAP** — Nielsen H6 (recognition over recall). Cliente não tem onde clicar pra pedir o que precisa.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei | Evidência |
|---|---|---|---|---|---|
| F3-3.G1 | Compliance | Voucher emitido R$ 100k não gera NF de antecipação | **P0** | BACEN + Lei 8.846/94 NF eletrônica | Cenário 17 evento `voucher.emitido` não menciona NF |
| F3-3.G2 | Compliance | Voucher consumido (cada uso) não emite NF/recibo fiscal automático | **P0** **fora do MVP mas mata o deal F3** (AC7) | BACEN Circular 4.893 + Decreto 7.962/13 | Story 3 evento `voucher.consumido` no audit; nenhuma menção a integração fiscal; AC7 confirma "Match PO ↔ NF fora do MVP" |
| F3-3.G3 | Funcional | Export CSV de audit trail não tem campo "NF associada" | **P1** | rastreabilidade contábil | Wireframe W7 + meta-export Story 2 S4 não preveem coluna fiscal |
| F3-3.G4 | UX | Audit trail não mostra link/ID de NF na linha do evento `voucher.consumido` | **P1** | Nielsen H1 (visibilidade de estado) | W7 mostra "Sistema · webhook · voucher.consumido · Crédito Q2 · R$ 250 debitados" sem NF |
| F3-3.G5 | UX | Não há config "Emissão de NF automática" em Configurações | **P2** | Nielsen H6 | Story 3 silencia |

**Status:** **QUEBROU** — procurement NeoBank rejeita o produto. Gap raiz é Story 3 tratar voucher como crédito interno (Stripe), não como ativo financeiro do cliente que precisa de documento fiscal. AC7 documenta a lacuna mas é P0 pra perfil regulado.

---

### F3-4: Audit Trail — InfoSec exige eventos críticos exportados em formato CEF/LEEF pra SIEM

**Seed original:** NeoBank tem Splunk. Compliance pede streaming SIEM em <60s (gap conhecido P0 P3 do stress test anterior). MVP só tem CSV manual. Lucas exporta CSV — mas Splunk não parseia formato exportado (sem schema canônico documentado, sem assinatura HMAC). Lentes: ⚖ BACEN Circular 4.893 cibersegurança, F (schema canônico + assinatura), U (cliente sem dev backend não consegue automatizar).

**Walkthrough (beat-by-beat com 3 lentes):**

**Beat 1.** Lucas configura no Splunk uma rotina pra ingerir audit trail diariamente. Precisa do schema CSV.
- 🔧 **Funcional:** **GAP** — Story 3 Cenário 19 diz "Reusa backend da Story 2 S4 (mesmo schema, retenção 5 anos, meta-audit, hash CSV)". MAS o "schema canônico" não está documentado num lugar acessível ao cliente (versão pública, com tipos, ordem, formato de timestamp).
- ⚖️ **Compliance:** **GAP** — BACEN Circular 4.893 exige interoperabilidade de logs com sistemas de cibersegurança do banco. Sem schema documentado, cliente não consegue integrar.
- 🎯 **UX:** **GAP** — Nielsen H10 (help & docs). Não há documentação técnica linkada na UI ("Como integrar este CSV com seu SIEM →").

**Beat 2.** Lucas exporta CSV. Modal LGPD W8 aparece, marca, exporta. Recebe arquivo.
- 🔧 **Funcional:** **GAP** — formato CSV (Story 2 S4) é proprietário. Splunk parseia bem CEF, LEEF, JSON Lines. CSV exige config customizada de field extraction.
- ⚖️ **Compliance:** **GAP** — assinatura HMAC mencionada na Story 2 S4 (hash SHA-256 do CSV) mas pra Splunk validar integridade precisaria de **assinatura por linha** (formato CEF tem isso nativo).
- 🎯 **UX:** **GAP** — formato CSV exige que NeoBank tenha um dev pra escrever parser. Empresa de 200 FTE tem dev, mas isso vira projeto interno de 2 sprints.

**Beat 3.** AC3 da Story 3 confirma "Webhook/streaming SIEM (Splunk/Datadog) — pós-MVP confirmado".
- 🔧 **Funcional:** Gap **fora do MVP mas mata o deal F3**. Compliance pede <60s.
- ⚖️ **Compliance:** **GAP CRÍTICO** — BACEN Circular 4.893 §10 exige detecção e resposta a incidentes em tempo hábil. "Em tempo hábil" pra cibersegurança bancária = <60s, não 24h.
- 🎯 **UX:** N/A.

**Beat 4.** Lucas tenta achar um endpoint REST pra puxar eventos via API (em vez de CSV manual).
- 🔧 **Funcional:** **GAP** — Story 3 não menciona API pública pra audit trail. Story 2 S4 também silencia.
- ⚖️ **Compliance:** **GAP** — fintech regulada precisa de programatic access pra escala (não é viável CSV manual diário).
- 🎯 **UX:** **GAP** — power user (InfoSec NeoBank) precisa de hook automático, não download manual.

**Beat 5.** Lucas tenta validar hash do CSV. Recebe arquivo + hash SHA-256 em algum metadado.
- 🔧 **Funcional:** **GAP** — Story 2 S4 menciona hash mas Story 3 não documenta ONDE o hash aparece (no header do CSV? em arquivo separado? como header HTTP do download?).
- ⚖️ **Compliance:** **GAP** — pra hash ter valor probatório, precisa estar assinado pela AwSales (signature + cert chain). Hash sozinho não comprova autoria.
- 🎯 **UX:** **GAP** — cliente recebe hash mas não sabe o que fazer com ele.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei | Evidência |
|---|---|---|---|---|---|
| F3-4.G1 | Compliance | SIEM streaming inexistente — fintech BACEN exige detecção em tempo hábil (<60s) | **P0** **fora do MVP mas mata o deal F3** (AC3) | BACEN Circular 4.893 §10 (resposta a incidentes) | AC3 da Story 3 confirma "pós-MVP" |
| F3-4.G2 | Funcional | CSV em formato proprietário — Splunk/Datadog preferem CEF/LEEF/JSON Lines | **P0** | BACEN interoperabilidade + ISO 27001 | Story 2 S4 reusa CSV; nenhum formato alternativo documentado |
| F3-4.G3 | Funcional | Schema canônico do CSV não documentado publicamente — cliente não pode integrar sem dev backend | **P0** | BACEN Circular 4.893 + Nielsen H10 | Story 3 Cenário 19 cita reuso de Story 2 S4 sem link pra schema |
| F3-4.G4 | Funcional | Não há API REST pública pra audit trail — cliente preso a CSV manual | **P0** | escalabilidade pra fintech | Story 3 não menciona API |
| F3-4.G5 | Compliance | Hash SHA-256 sem assinatura digital da AwSales (cert chain) — sem valor probatório forense | **P1** | LGPD Art. 38 (integridade probatória) | Story 2 S4 menciona hash; sem signature |
| F3-4.G6 | UX | Cliente recebe hash mas não sabe validar — falta doc "Como verificar integridade" | **P2** | Nielsen H10 | Sem link pra documentação |

**Status:** **QUEBROU** — InfoSec NeoBank veta o produto. Gap raiz é o MVP tratar audit trail como feature de UI, não como API de cibersegurança.

---

### F3-5: NeoBank quer evidência de SEGREGAÇÃO DE FUNÇÕES (CISO ≠ Admin)

**Seed original:** Lucas atribui função "CISO Read-Only" (custom criada na Story 2) pra um auditor externo. Auditor entra no Financeiro — vê faturas mas não vê PII (cartão completo, e-mails de NF mascarados). MAS o auditor vê audit trail completo incluindo "Felipe.rezende@fyntra.com mudou cartão" — nome completo do executor. Lentes: ⚖ LGPD Art. 46 + BACEN segregação, F (PII Filtering aplica em executor do audit também), U (mascaramento consistente).

**Walkthrough (beat-by-beat com 3 lentes):**

**Beat 1.** Lucas (Admin org) cria função "CISO Read-Only" na Story 2 — com permissões `Financeiro · Visualizar` + `Financeiro · Audit Trail · Visualizar` + `Financeiro · Audit Trail · Exportar`, SEM `Visualizar PII`.
- 🔧 **Funcional:** OK (assumindo Story 2 ter criado o catálogo).
- ⚖️ **Compliance:** OK — segregação proposta corretamente.
- 🎯 **UX:** OK.

**Beat 2.** Auditor externo (vamos chamar Carlos) entra com função "CISO Read-Only". Acessa Financeiro.
- 🔧 **Funcional:** **GAP** — Story 3 + Story 2 não declaram explicitamente que PII Filtering é aplicado SERVER-SIDE pra cada response API. Risco de frontend ser único enforcement (DevTools quebra).
- ⚖️ **Compliance:** **GAP** — LGPD Art. 46 (medidas técnicas adequadas) exige enforcement em camada não-bypassable.
- 🎯 **UX:** OK.

**Beat 3.** Carlos vê histórico de faturas. Coluna "Forma de pagamento" mostra "Cartão Visa •••• 3012".
- 🔧 **Funcional:** OK — PCI-DSS aplica mascaramento universal (Cenário 20 EXCEÇÃO PCI-DSS).
- ⚖️ **Compliance:** OK.
- 🎯 **UX:** OK.

**Beat 4.** Carlos rola até audit trail. Vê: "Cliente · Felipe Rezende · cartao.padrao_mudou · Era: •••• 8888 → Novo: •••• 3012 · Origem: 200.4.1.5".
- 🔧 **Funcional:** **GAP CRÍTICO** — Nome "Felipe Rezende" deveria ser mascarado pra Carlos (sem PII), conforme princípio de segregação. Mas Cenário 20 da Story 3 lista PII Filtering APENAS pra "e-mails de invoice adicionais" + "IPs no audit trail financeiro" + "EXCEÇÃO PCI" pra cartão. NÃO lista campo `executor.nome` do audit trail.
- ⚖️ **Compliance:** **GAP CRÍTICO** — LGPD Art. 46 + BACEN segregação. Carlos é AUDITOR EXTERNO. Não pode saber NOMES de quem operou — princípio da minimização. Em fintech, auditor recebe pseudonimização (Felipe Rezende → "Operador FYN-7723"). UI hoje expõe nome completo.
- 🎯 **UX:** **GAP** — Inconsistência forte (Nielsen H4): IP é mascarado, e-mail é mascarado, MAS NOME não é. Carlos pergunta "por que IP sim e nome não?". Engenheiro responde "porque o catálogo não previu".

**Beat 5.** Carlos vê: "Sistema · webhook · fatura.paga". Aqui não tem nome humano, então OK.
- 🔧 **Funcional:** OK.
- ⚖️ **Compliance:** OK.
- 🎯 **UX:** OK.

**Beat 6.** Carlos quer evidenciar pra BACEN que NeoBank tem segregação de funções implementada na AwSales. Pede screenshot do Financeiro com sua função "CISO Read-Only".
- 🔧 **Funcional:** **GAP** — Screenshot mostra audit trail com nomes completos = NÃO há segregação evidenciada. Acabou de provar o oposto pra BACEN.
- ⚖️ **Compliance:** **GAP CRÍTICO** — BACEN audita esta evidência. Fintech recebe achado. Multa.
- 🎯 **UX:** N/A.

**Beat 7.** Carlos exporta CSV do audit trail. CSV repete vazamento.
- 🔧 **Funcional:** **GAP** — CSV deveria também aplicar mascaramento conforme perfil de quem exportou.
- ⚖️ **Compliance:** **GAP** — LGPD Art. 18 II (direito de acesso adequado à finalidade) + Art. 46.
- 🎯 **UX:** **GAP** — Inconsistência (H4) entre tela e export.

**Beat 8.** Lucas vai pra Story 2 → Auditoria de Funções, quer ver "quais permissões a função CISO Read-Only tem ativas".
- 🔧 **Funcional:** Story 3 não menciona — supõe-se Story 2.
- ⚖️ **Compliance:** **GAP** — pra evidenciar segregação BACEN, fintech precisa de RELATÓRIO de "matriz de funções × permissões × pessoas atribuídas" exportável. Story 3 não cobre.
- 🎯 **UX:** N/A pra Story 3.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei | Evidência |
|---|---|---|---|---|---|
| F3-5.G1 | Compliance | PII Filtering NÃO se aplica ao campo `executor.nome` do audit trail — CISO Read-Only vê nomes completos (mesmo gap raiz F3-1 mas em contexto crítico de auditoria externa) | **P0** | LGPD Art. 46 + BACEN segregação | Cenário 20 lista PII só pra `email_invoice_adicional` e `IP audit` |
| F3-5.G2 | Funcional | Mascaramento não aplicado server-side garantido — risco DevTools | **P0** | LGPD Art. 46 medidas técnicas | Story 3 não declara enforcement camada API |
| F3-5.G3 | UX | Inconsistência: IP mascarado, e-mail mascarado, mas NOME exposto — auditor questiona | **P0** | Nielsen H4 (consistência) | W7 mostra nomes completos enquanto Cenário 20 mascara outros campos |
| F3-5.G4 | Compliance | Screenshot pra evidenciar segregação BACEN prova o OPOSTO — feature gera achado em auditoria | **P0** | BACEN Circular 4.893 §6º segregação de funções | Cadeia de gaps acima |
| F3-5.G5 | Compliance | CSV exportado replica vazamento de nomes (regressão da minimização) | **P0** | LGPD Art. 18 II + Art. 46 | Story 2 S4 + Story 3 não tratam mascaramento condicional no export |
| F3-5.G6 | Funcional | Falta pseudonimização (Felipe Rezende → "Operador FYN-7723") pra perfis sem PII | **P1** | LGPD Art. 13 (anonimização/pseudonimização) | Sem padrão proposto |
| F3-5.G7 | Compliance | Falta relatório exportável "matriz funções × permissões × pessoas atribuídas" pra evidenciar segregação | **P1** **fora do MVP mas mata o deal F3** | BACEN evidência probatória | Story 3 não cobre (Story 2 escopo) |
| F3-5.G8 | UX | Sem indicação visual "este campo foi mascarado por sua função" — auditor não sabe o que falta ver | **P2** | Nielsen H1 | W7 sem placeholder |

**Status:** **QUEBROU** — feature gera achado em auditoria BACEN. Pior cenário: cliente USA o produto e PIORA sua posição regulatória. Gap raiz: Cenário 20 tem catálogo INCOMPLETO de campos PII Filtering — campo `executor.nome` foi esquecido.

---

## Análise consolidada

### Top 3 gaps críticos (em ordem de mortalidade pro deal F3)

1. **F3-1.G1 + F3-5.G1 (gap raiz comum):** PII Filtering não inclui `executor.nome` do audit trail. Esta é a "joia da coroa" do achado — vaza informação de operadores e violou BACEN segregação simultaneamente. Fix: adicionar `executor.nome` ao catálogo de PII Filtering (Cenário 20) + pseudonimização opcional.

2. **F3-3.G2:** Voucher consumido não emite NF/recibo fiscal automático. Mata procurement. AC7 documentou que está fora do MVP — pra F3 isto É o deal. Fix: domínio fiscal/ no backend + integração com emissor de NF eletrônica.

3. **F3-2.G1+G2+G3:** Modal de fatura sem timeline de eventos de dispute/chargeback + PDF sem histórico + catálogo de eventos incompleto. Fechamento contábil mensal não roda. Fix: timeline embutida no modal W4 + ampliar Cenário 17 + PDF consolidado.

### Padrões observados

- **Tema central:** Story 3 tem catálogos INCOMPLETOS. Catálogo de PII Filtering (Cenário 20) esqueceu `executor.nome`; catálogo de eventos (Cenário 17) esqueceu chargeback_resolvido + evidencia_submetida; catálogo de status (Cenário 8.1) não tem labels PT-BR documentados; catálogo de integrações fiscais não existe.
- **Anti-claim AC3 e AC7 são P0 reais pro perfil F3.** "Pós-MVP" é uma decisão de produto válida mas a Story precisa **declarar explicitamente** que este perfil de cliente NÃO É ATENDIDO no MVP — pra não vender e fracassar.
- **Cadência de descoberta:** Lucas (Admin), Felipe (operador) e Carlos (auditor externo) interagem com a mesma UI. A Story trata "permissão por papel" mas não testa "consistência entre papéis na mesma feature".

### Quem usa, o que vê (matriz de exposição)

| Papel | Vê PII em executor? | Vê NF? | Vê timeline dispute? | Tem API/SIEM? |
|---|---|---|---|---|
| Admin org (Lucas) | **SIM** (gap) | Não | Não (gap) | Não (gap) |
| CISO Read-Only (Carlos) | **SIM** (gap CRÍTICO) | Não | Não (gap) | Não (gap) |
| Operador (Felipe) | **SIM** (gap) | Não | Não (gap) | N/A |

Para fintech regulada, esta matriz É a evidência que BACEN audita.

---

## Confirmação

Arquivo salvo em: `/Users/guilhermegraham/awsales/prototype-studio/stress-tests/financeiro/scenarios-and-fixes/scenarios/agent-f3-fintech-bacen.md`
