# SUT: Catálogo de Funções Padrão da Story 2 (Cenários 24.1-24.6)

**Fonte:** `prototype-studio/stories/team-funcoes-config.md` (versão 3.2 — pós ajuste UX neo)
**Data de leitura:** 2026-05-12
**Lentes:** 🔧 Funcional · ⚖️ Compliance · 🎯 UX

---

## Claims testáveis

| # | Claim | Baseline de passagem |
|---|---|---|
| **C1** | 6 funções padrão tenant (Admin / Manager / Operator / Analyst / Viewer / DPO) cobrem 95%+ dos perfis reais de cliente B2B BR | Pra cada persona adversária, existe **1 função do conjunto** que cobre as ações que ela precisa sem exigir customização (criar role custom). Custom só pra casos exóticos (≤5%). |
| **C2** | A matriz do Cenário 24.2 atribui permissões coerentes (não há gap "Manager precisa X mas só Admin tem" pra ações de operação normal) | Walkthrough de cada persona faz ações esperadas sem topar em 403 nem ter que escalar pra Admin. |
| **C3** | Catálogo de 15 grupos visuais (Agentes/BC/Campanhas/Conversas/Atendimento/Arquivos/Integrações/Playground/Leads/Dashboard/Financeiro/Privacy/Notificações/Equipe/Funções/Organização/Offboarding) cobre 100% das ações que aparecem nas docs de backend (`apps/awsales-backend/docs/content/docs/domain/`) | Cada rota dos `studio-api/` em `studio-api/` está gated por 1 permissão deste catálogo. Zero ações órfãs. |
| **C4** | 5 funções internas AwSales (Super Admin / Gestor de Conta / Playbooker / Suporte L2 / Eng. On-call) segregam responsabilidades operacionais (segregation of duties) | Walkthrough de persona "interno mal-intencionado / negligente" não consegue cometer ação cross-domain inesperada (ex: AM aplicar Legal Hold, Playbooker tocar Financeiro, Suporte L2 ver PII). |
| **C5** | Carteira do Gestor de Conta isola escopo cross-org corretamente (`organization.account_manager_id = user.id`) | AM vê **só sua carteira** por default; toggle "ver todas" gera evento de audit obrigatório com motivo. Notificações de cancellation_request / retention_deadline chegam apenas pelas orgs da carteira. |
| **C6** | Playbooker tem acesso técnico revogável com bloqueios explícitos (sem Financeiro / IAM-do-tenant / PII completo / Offboarding) + desligamento automático na `due_date` | Walkthrough simulando "Playbooker termina implantação" verifica que acessos são revogados na due_date sem ação manual; cliente cliente vê o Playbooker no audit trail mesmo após desligamento. |
| **C7** | Toda ação de qualquer interno (Super Admin / AM / Playbooker / Suporte L2 / Eng. On-call) numa org cliente sempre aparece no audit trail da org com `actor_type: AwSales · {função} · {nome}` | Cenário "Super Admin entra numa org pra debugar problema" produz registro visível **na audit trail da própria org**, não só num audit interno separado. CDC Art. 6º III + LGPD Art. 6º VI. |
| **C8** | Cliente entende o catálogo na UX (Cenário 26 — checkbox-grid agrupado por grupo visual) sem precisar de glossário externo | Persona "Admin novato" consegue criar 1 função custom em ≤5 min sem ler doc externa, escolhendo as 4-6 permissões corretas pra perfil "Auditor LGPD externo". |
| **C9** | Permissão "Gerenciar" da neo legacy NÃO virou permissão no novo modelo (só Visualizar gate acesso à tela) | Nenhuma das 30+ permissões do Cenário 24.1 tem ação "Gerenciar" sozinha. UI consistente: quem tem Visualizar acessa a tela; escrita é gate separado. |
| **C10** | Slug `account-manager` é reservado a internos `@awsales.io` e não aparece no checkbox-grid pro cliente (Studio API filtra fora) | Walkthrough "Admin do cliente lista funções disponíveis pra atribuir num convite" não retorna `account-manager` no dropdown. |

---

## Anti-claims (fora de escopo declarado)

- **AC1.** **Holding/Grupo Econômico como entidade unificada** — modelo atual é multi-tenant: cada org é isolada, usuário troca via seletor. Cenário "consolidar financeiro de 5 CNPJs de uma holding numa única view" **NÃO é gap** (validado na Story 3 Financeiro).
- **AC2.** **Agência de marketing operando N contas como N produtos** — modelo trata cada cliente da agência como org separada, agência loga em N orgs. Cenário "agência quer dashboard único pra ver 30 clientes" **NÃO é gap** (mesmo motivo de AC1).
- **AC3.** **Verticais reguladas (fintech BACEN, saúde HIPAA)** — Story 2 cobre LGPD + CDC + PCI-DSS universais. Cenário fintech "precisa SIEM streaming, Circular 4.893 § 6º" **NÃO é gap pra esta story** — sai pra Story Enterprise Compliance Pack (já documentado na Story 3 AC8).
- **AC4.** **Customização cross-org de permissões pelo cliente** — funções customizadas são scoped por org (Cenário 30 existente). Cenário "cliente quer criar 1 função global pra usar em 3 orgs" **NÃO é gap**.
- **AC5.** **Plano de gerenciamento de Super Admin / Eng. On-call via UI do cliente** — esses perfis são gerenciados via WorkOS console + admin-api interna. Cliente não vê nem edita. Walkthrough "cliente quer remover Super Admin do audit dele" não cabe.

---

## Escopo de teste derivado

Dado as claims C1-C10:

- **Eixo principal — Personas adversárias (11 personas):**
  1. **Contador externo** (acesso temporário, só Financeiro)
  2. **CFO interno do cliente** (Financeiro completo + visão estratégica + sem acesso operacional)
  3. **Dev/integrador técnico** (Integration Hub + webhooks + sem cliente final)
  4. **SDR sênior** (Conversas / Leads / Campanhas em escala)
  5. **Gerente de operação** (Manager candidato, mas com nuances de aprovação)
  6. **Auditor LGPD externo** (perfil DPO temporário, pode revogar consentimento?)
  7. **Holding multi-org** (sócio em 5 CNPJs — UX de trocar org)
  8. **Agência de marketing multi-conta** (gerencia 30 clientes)
  9. **AM com 50 orgs na carteira** (escala da carteira)
  10. **Playbooker que termina implantação** mas acessos não são revogados
  11. **Super Admin agindo em org de cliente sem audit visível**

- **Eixo secundário — Lentes (3):** 🔧 Funcional / ⚖️ Compliance / 🎯 UX (cada walkthrough cobre as 3)

- **Distribuição em agentes:** 5 agentes paralelos × ~2 personas cada = 10-11 walkthroughs. 11ª persona vai num agente que sobra.

