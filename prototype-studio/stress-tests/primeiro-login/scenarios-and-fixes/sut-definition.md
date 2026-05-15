# SUT Definition — Wireframes Primeiro Login + Configurações da Organização

**Data:** 2026-05-11
**Modo:** completo (90 min, 6 agentes paralelos)

## SUT

Conjunto de **2 wireframes ASCII** que materializam visualmente as **2 user stories** do fluxo end-to-end de onboarding e gestão da organização no AwSales:

- `archive/wireframes-ascii/primeiro-login.md` — 15 telas Persona A (Responsável da Org) + 6 telas Persona B (Membro Convidado) + estados de erro de link
- `archive/wireframes-ascii/team-funcoes-config.md` — 11 telas principais cobrindo Configurações Gerais + Meu Perfil + Team (lista, convite, visualizar com audit trail, editar, inativar) + Funções (lista, visualizar padrão, criar, editar custom, deletar)

Stories de origem (vinculadas):
- `stories/primeiro-login.md` (v4)
- `stories/team-funcoes-config.md`

## Claims testáveis (precisam passar)

| # | Claim | Baseline de passagem (qualitativo, observável no walkthrough) |
|---|---|---|
| **C1.1** | Persona A (Responsável) completa o fluxo de 5 etapas em ≤5 min com dados em mãos; meta 100% de conversão convite→org ativa | Walkthrough chega à tela de Integrações sem o usuário abrir ticket nem sair do fluxo |
| **C1.2** | Persona B (Membro) completa o fluxo de 2 etapas em ≤2 min; meta ≥85% de aceite em 7 dias | Walkthrough chega à primeira tela permitida pela função sem fallback humano |
| **C2.1** | Implementação cobrada AGORA via Stripe (cartão à vista/parcelado, PIX 5min, boleto com acesso antecipado) | Cobrança imediata acontece; valor exato bate com revisão; acesso liberado conforme método |
| **C2.2** | Plano apenas programado pra cobrança no último dia do mês com pro-rata correto | Pro-rata = `valor × dias_uso / dias_do_mês` é exibido antes da confirmação; nenhuma cobrança no 1º acesso |
| **C2.3** | Métodos Implementação e Plano podem ser distintos; Stripe armazena tokens separados | Cartão A pra impl + Cartão B pra plano funciona sem mistura |
| **C2.4** | Parcelamento por tier: ≤R$10k → 2x; >R$10k → 4x; sempre entrada à vista | Limite respeitado; cronograma exibido antes de pagar |
| **C3.1** | SSO Google+Microsoft via WorkOS, com bloqueio se e-mail SSO ≠ e-mail do convite | Tentativa de SSO com e-mail divergente exibe modal de bloqueio claro |
| **C3.2** | 2FA opcional no 1º acesso da org; ativação posterior em Segurança vira obrigatória pra todos | Walkthrough do membro mostra "pode pular" se OFF e "obrigatório" se ON |
| **C3.3** | Multi-org com mesmo e-mail (1 usuário → N orgs); seletor de organização disponível | Aceitar convite numa 2ª org não duplica usuário; seletor aparece no menu |
| **C4.1** | Funções customizadas isoladas por org; sem limite de membros nem funções | Org A criar função "X" não afeta Org B; criar 100ª função/membro não bloqueia |
| **C4.2** | Funções padrão são read-only; custom é criada do zero (sem duplicar padrão) | Tentar editar função padrão é bloqueado; criação parte de lista vazia |
| **C4.3** | 1 usuário tem 1 função; mudança aplica imediatamente | Trocar função afeta permissões no próximo request gated |
| **C4.4** | Último Administrador não pode ser inativado nem ter função trocada pra não-admin | Tentativa exibe bloqueio com mensagem clara |
| **C4.5** | Deletar função custom com usuários ativos é bloqueado com link pros usuários afetados | Modal de bloqueio aparece com lista de usuários |
| **C5.1** | Audit trail por usuário/por org cobre eventos críticos (login, falhas, ações em recursos) | Cada ação adversarial do walkthrough aparece no audit trail com executor + alvo + recurso + timestamp + IP |
| **C5.2** | Audit trail filtra por período, tipo de ação, busca por recurso; pagina 50 inicial; exporta CSV (assíncrono se grande) | Filtros funcionam; export não trava UI mesmo com >10k linhas |
| **C6.1** | Termo de uso aceito por usuário (mesmo membros), com botão liberado só após scroll ao final (validado server-side) | Tentativa de burlar via DOM é rejeitada; registro persiste data/hora/IP/UA |
| **C6.2** | Pendência cadastral é notificação persistente, visível só pra Admin | Membro não vê o alerta; Admin vê até contrato anexado |
| **C6.3** | E-mails adicionais de invoice: até 10, domínio aberto | 11º bloqueia; e-mails inválidos rejeitados inline |
| **C7.1** | Link expira em 7 dias; reenvio invalida link anterior | Link velho retorna tela "convite invalidado" após reenvio |
| **C7.2** | Retomada de fluxo após falha técnica não cobra de novo | Stripe não duplica charge; sistema reconhece pagamento existente |
| **C7.3** | Cartão recusado → até 3 tentativas + troca de método inline | UI permite trocar cartão ou método sem reiniciar fluxo |
| **C7.4** | PIX expira em 5 min, regenera quantas vezes precisar | Botão "Gerar novo PIX" aparece após expiração |
| **C8.1** | Pós-login: Responsável → tela de Integrações; Membro → primeira tela permitida pela função (Dashboard se permitido) | Redirect pra tela útil, não pra erro/estado vazio bruto |
| **C8.2** | Botões "Algo está errado?" e "Convite expirado" são informativos (sem API backend no MVP) | Cliquei → modal com contato; nenhuma ação backend disparada |

## Anti-claims (fora do escopo — não geram gap)

- **AC1.** Mobile no MVP — sugestão é bloqueio educado. Cenários de UX em mobile não são gap.
- **AC2.** API de "Reportar divergência" e "Solicitar novo link" não existem no MVP — placeholders informativos. Cenários que esperam ação backend são strawman.
- **AC3.** Edição de permissão individual fora da função não é suportada — só por função.
- **AC4.** Duplicar função padrão como ponto de partida não é suportado no MVP.
- **AC5.** Mudança de função em convite pendente exige cancelar + reenviar (não tem "editar função" direto).
- **AC6.** Acesso programático/SCIM não é escopo (só UI manual).
- **AC7.** Cancelamento de plano/refund dentro do fluxo de 1º acesso não é suportado (vai pelo fluxo de cancelamento da Story de Cobrança v5, fora daqui).
- **AC8.** Idiomas além de PT-BR no MVP — defaults brasileiros são assumidos.

## Escopo de teste derivado

Stress test cobre **6 perfis de cliente enterprise × 5 cenários adversariais por perfil = 30 cenários**. Cada cenário é uma **jornada end-to-end** atravessando os 2 wireframes (cliente paga → cria conta → entra → gerencia time/funções → caso adversarial). Eixo único combinando vertical+persona+complexidade-de-pagamento porque essas dimensões correlacionam em B2B enterprise — separá-las gera combinações inviáveis.
