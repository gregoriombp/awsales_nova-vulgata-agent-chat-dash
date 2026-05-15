# SUT Definition — Story 3 Financeiro (Visão Geral + Saldo de Créditos + Audit Trail)

**Data:** 2026-05-11
**Modo:** completo (90 min, 6 agentes paralelos)
**Objetivo declarado pelo PG:** *"quero as melhores telas, com a melhor usabilidade e seguindo LGPD e tudo que tem mais direito de leis e segurança"*

## SUT

3 artefatos da Story 3 (Financeiro):

- `stories/financeiro.md` — 20 cenários BDD + 12 cenários de quebra + DoD + métricas
- `archive/wireframes-ascii/financeiro.md` — 8 wireframes ASCII (W1 Visão Geral, W2 Modal Plano + variant PAST_DUE, W3 Modal Campanha, W4 Modal Fatura, W5 Saldo Créditos + variants, W6 Métodos de pagamento, W7 Audit Trail completo, W8 Modal LGPD)
- `prototypes/financeiro.html` — 11 telas/estados interativos com toggle Por serviço/Por campanha e audit trail contextual

Stories irmãs (vinculadas):
- `stories/primeiro-login.md` (Story 1 — pagamento da implementação + plano)
- `stories/team-funcoes-config.md` (Story 2 — catálogo de permissões + backend de audit trail reusado)

Doc backend de referência: `apps/awsales-backend/docs/content/docs/domain/billing/`

## Claims testáveis — LENTE TRIPLA

> Todos os cenários do stress test vão ser avaliados sob 3 lentes adversariais em **cada beat** do walkthrough:
> 1. **🔧 Funcional** — o produto entrega o que promete? Quebra técnica?
> 2. **⚖️ Compliance** — viola alguma lei aplicável (LGPD, PCI-DSS, BACEN, Marco Civil, CDC)?
> 3. **🎯 UX/Acessibilidade** — gera fricção, frustração, ambiguidade? Atende heurísticas de Nielsen e WCAG?

### Claims funcionais

| # | Claim | Baseline observável |
|---|---|---|
| **F1.1** | Visão Geral sem redundâncias (tabela meio pagamento removida, status duplicado eliminado) | Walkthrough não encontra info duplicada |
| **F1.2** | Toggle `Por serviço | Por campanha` controla gráfico + tabela simultaneamente | Mudar toggle re-renderiza ambos em <500ms |
| **F1.3** | 13 status de fatura sincronizados com Stripe | Cada status do invoice-lifecycle.mdx renderiza corretamente |
| **F1.4** | Cupons (3 status) + Vouchers (5 status) com aplicação self-service | Cliente digita código → valida via Stripe → sucesso/erro específico |
| **F1.5** | Audit trail contextual por sub-aba + reusa backend Story 2 S4 | Visão Geral filtra plano/cartão/fatura · Créditos filtra cupom/voucher |
| **F1.6** | Plano readonly no MVP — todas mudanças via admin AwSales | Botões "Solicitar alteração/cancelamento" são placeholders informativos |
| **F1.7** | Filtro de data com 10 presets + customizado, sincroniza tudo | Mudar período atualiza gráfico + tabela + cards sincronizadamente |
| **F1.8** | Soma da tabela detalhada bate com card "Gastos variáveis utilizados" nos 2 modos | Total agregado bate em "Por serviço" E "Por campanha" |

### Claims de Compliance ⚖️

| # | Lei/Norma | Claim | Baseline observável |
|---|---|---|---|
| **C1.1** | **LGPD Art. 6º** (princípios) | Tratamento de dados financeiros é finalístico, transparente, mínimo necessário | Nenhum dado pessoal exibido além do necessário pra função |
| **C1.2** | **LGPD Art. 9º** (consentimento) | Aviso explícito antes de export de dados pessoais | Modal LGPD obrigatório com checkbox de ciência antes de download |
| **C1.3** | **LGPD Art. 18 II** (direito de acesso) | Titular pode acessar TODOS os dados financeiros próprios | Audit trail pessoal cross-org acessível em "Meu Perfil" (Story 2 W15) |
| **C1.4** | **LGPD Art. 38** (relatório de impacto) | Eventos críticos de tratamento ficam auditáveis 5 anos | Retenção declarada + hash SHA-256 do CSV pra integridade probatória |
| **C1.5** | **LGPD Art. 46** (segurança) | Dados protegidos contra acesso não autorizado | PII Filtering por permissão + cartão sempre mascarado |
| **C1.6** | **PCI-DSS 3.4** | PAN (Primary Account Number) nunca exibido completo | UI mostra apenas `last4` + `brand` + `exp` — mesmo com PII permitido |
| **C1.7** | **PCI-DSS 6.5** (segurança no input) | Cartão NÃO digitado em campos AwSales — sempre via Stripe Elements (iframe hosted) | Modal "Adicionar cartão" abre Stripe Elements iframe, não input local |
| **C1.8** | **BACEN Circular 4.893** (cibersegurança fintech) | Cliente regulado tem export pra SIEM + 2FA obrigatório + segregação de funções | Coberto pela Story 2 S4 + Story 3 (export CSV; SIEM streaming = pós-MVP declarado) |
| **C1.9** | **Marco Civil Internet Art. 13** | Logs de acesso preservados ≥ 6 meses | Audit trail retenção 5 anos cobre folgadamente |
| **C1.10** | **CDC Art. 6º III** (informação clara e adequada) | Cliente tem visibilidade total de cobranças, descontos, prazos | Big Number + cupom/voucher visível na fatura + breakdown por campanha |
| **C1.11** | **CDC Art. 39 V** (cobrança abusiva) | Cobrança bate com contrato (sem surpresa) | Soma de campanhas == card de gastos utilizados |
| **C1.12** | **CDC Art. 42 §único** (cobrança indevida) | Cliente vê exatamente o que foi cobrado e pode contestar | Modal "Ver detalhes da fatura" com line items + cupom + hash do PDF |

### Claims de UX/Acessibilidade 🎯

| # | Padrão | Claim | Baseline observável |
|---|---|---|---|
| **U1.1** | **Nielsen H1** (Visibilidade do estado do sistema) | Status de fatura, plano, voucher, cupom visíveis em badges coloridos com ícones | Cada estado tem cor + ícone distinguíveis |
| **U1.2** | **Nielsen H2** (Match mental model) | Vocabulário do cliente, não do produto técnico (ex: "Em aberto" ≠ "OPEN") | Status traduzidos pra português coloquial mantendo correspondência técnica |
| **U1.3** | **Nielsen H3** (User control & freedom) | Cliente pode cancelar/voltar de qualquer ação sem perder estado | Voltar do modal não perde filtros, toggle não recarrega filtros |
| **U1.4** | **Nielsen H4** (Consistência) | Mesmo componente (audit trail, modal LGPD, cupom badge) parece igual em todo lugar | Audit trail Story 2 e Story 3 visualmente idênticos |
| **U1.5** | **Nielsen H5** (Prevenção de erros) | Confirmação dupla antes de ações destrutivas (remover cartão padrão, desativar 2FA) | Modal de confirmação com texto + checkbox + botão danger |
| **U1.6** | **Nielsen H6** (Recognition over recall) | Cliente vê opções, não precisa lembrar comandos (presets de data) | 10 presets de data + customizado |
| **U1.7** | **Nielsen H7** (Flexibilidade) | Atalhos pra power users (busca, filtros multi-select, export) | Disponíveis em todas as tabelas |
| **U1.8** | **Nielsen H8** (Design minimalista) | Sem redundâncias (feedback do cliente atendido) | Tabela "Meio pagamento" removida, status único |
| **U1.9** | **Nielsen H9** (Recuperação de erros) | Mensagens de erro específicas e acionáveis | Erro de cupom inválido lista 4 motivos possíveis |
| **U1.10** | **Nielsen H10** (Help & docs) | Tooltips contextuais explicam termos técnicos (ⓘ em cards) | ⓘ em "Total economizado", "Limite variável", "Próxima cobrança" |
| **U1.11** | **WCAG 2.1 AA — Contraste** | Texto e ícones têm contraste mínimo 4.5:1 | Cor de status badges não depende SÓ de cor (tem ícone também) |
| **U1.12** | **WCAG 2.1 AA — Navegação por teclado** | Todos os elementos interativos acessíveis via Tab | Toggle, botões, links, modais navegáveis sem mouse |
| **U1.13** | **WCAG 2.1 AA — Leitura por screen reader** | Aria-labels em ícones, status semântico, tabelas com cabeçalho | `<th>`, `aria-label` em ícones, `role="status"` em loaders |

## Anti-claims (fora do escopo)

- **AC1.** Mudança de plano self-service (cliente solicita upgrade/downgrade pela UI sem admin) — placeholder informativo no MVP.
- **AC2.** Cancelamento de plano self-service — escopo Story de Cancelamento (doc v5).
- **AC3.** Webhook/streaming SIEM (Splunk/Datadog) — pós-MVP confirmado.
- **AC4.** Mobile-first — desktop only no MVP (Story 1 AC1 herdado).
- **AC5.** Idioma além de PT-BR — defaults brasileiros.
- **AC6.** Customização do limite variável pelo cliente — só admin AwSales muda.
- **AC7.** Match PO ↔ NF (procurement) — fora do MVP, mencionado no stress test anterior P3.

## Escopo de teste derivado

Stress test cobre **6 perfis financeiros distintos × 5 cenários adversariais por perfil = 30 cenários**. Cada cenário é **walkthrough beat-by-beat** com **3 lentes adversariais** aplicadas em cada beat:
1. 🔧 Funcional (quebra técnica)
2. ⚖️ Compliance (viola lei aplicável?)
3. 🎯 UX/Acessibilidade (gera fricção, ambiguidade, exclusão?)

Cada gap identificado é classificado por:
- **Severidade** (P0/P1/P2)
- **Lente** (Funcional/Compliance/UX)
- **Lei aplicável** (se Compliance — LGPD Art. X, PCI-DSS Y.Y, BACEN Circular Z, CDC Art. W)
