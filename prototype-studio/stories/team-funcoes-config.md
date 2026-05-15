# Story — Configurações da Organização: Team, Funções e Configurações Gerais

**Data:** 2026-05-11
**Versão:** v3.4 (menu da conta + logout)
**PO:** Guilherme Graham (PG)
**Status:** Pronta pra refinamento técnico / split em sub-stories antes do dev
**Story relacionada:** [stories/primeiro-login.md](stories/primeiro-login.md) — reusa fluxo de 1º acesso pra convites de membros

---

## 1. Cabeçalho

**Nome Sugerido:** Implementar "Configurações da Organização" — Configurações Gerais, Team, Funções, **Segurança** (com Audit Trail org-wide e PII Filtering)

**Prioridade Sugerida:** 🔴 **Crítica (P0)** — sem essa tela o cliente não consegue gerir o próprio time depois do 1º acesso. Bloqueia auto-serviço, mantém dependência do AM/Ops e expõe a empresa a riscos de compliance LGPD/SOC2.

**Estimativa de Complexidade:** **21 SP** (~2 semanas) — quatro subáreas com modelos próprios (org settings, membros/convites, funções+permissões dinâmicas, segurança+audit trail), mais conformidade LGPD (retenção, meta-audit, PII filtering, cross-org).

**Sugestão de Split:**
- **S1** — Configurações Gerais + Perfil do usuário (próprio) = **3 SP**
- **S2** — Team (lista + convite + visualizar + editar função + inativar) com audit trail por usuário = **5 SP**
- **S3** — Funções (lista + criar nova + editar custom + deletar) + PII Filtering como permissão = **5 SP**
- **S4** — Segurança (2FA org toggle + Política senha) + Audit Trail Geral da Org (cross-user) + LGPD compliance (retenção 5 anos, meta-audit, hash CSV, cross-org subject request) = **8 SP**

Confirmar split com Reviewer (Gustavo).

**Dependências:**
- Story de **Primeiro Login** (mesmo fluxo é reusado pra ativar convites de membros — sem pagamento).
- API de **Funções/Permissões dinâmicas** (greenfield — assumir pronta).
- API de **Audit Trail** (greenfield — confirmar se já existe; se não, é dependência crítica).

---

## 2. Narrativa do Usuário (User Story)

> Como **Administrador (ou usuário com permissão correspondente) da organização**,
> eu quero **gerenciar dados básicos da minha empresa, convidar e inativar membros, criar funções customizadas com permissões granulares e mascaramento de PII, definir políticas de segurança (2FA obrigatório, senha) e auditar tudo que aconteceu na minha organização**,
> para que eu **opere o time com autonomia, mantenha o controle de acesso adequado, atenda compliance LGPD/SOC2/BACEN com rastreabilidade probatória — sem depender do time AwSales pra cada ajuste**.

E, como **qualquer usuário membro da organização**,
eu quero **editar meu próprio perfil (nome, foto, dados básicos) e consultar minhas próprias ações (audit trail pessoal cross-org)**,
para que **meus dados estejam corretos e eu possa atender requisição LGPD do meu titular de dados quando precisar**.

---

## 3. Contexto e Valor (o "Porquê")

**Cenário Atual:** após o 1º acesso (story anterior), o cliente fica sem ferramenta auto-serviço pra gerir time, funções e dados da empresa. Qualquer ajuste (convidar pessoa, mudar função, atualizar logo) precisa passar pelo AM — gargalo operacional + risco de divergência entre o que está no admin AwSales e o que o cliente "acha que está".

**Cenário Desejado:** dentro de "Configurações da organização", o cliente tem 5 abas (das quais 3 entram nesta story: **Configurações gerais**, **Team**, **Funções** — **Financeiro** e Segurança são stories à parte — ver [stories/financeiro.md](stories/financeiro.md)). Lá ele:
- Visualiza os dados que o AM cadastrou (razão social, CNPJ, segmento, porte) e **edita apenas o ícone da empresa**;
- Reporta divergência nos demais dados via botão **informativo** ("Algo está errado?" — sem API backend no MVP, igual padrão da story de 1º acesso);
- Convida novos membros (chips de e-mail + função, limite 20 e-mails por submit), reenviando ou cancelando convites pendentes;
- Visualiza cada membro com **audit trail** completo das ações dele na plataforma;
- Edita a função de um membro (1 função por usuário) ou inativa (preservando histórico);
- Cria funções customizadas com permissões granulares (sem partir de duplicação);
- Edita o próprio perfil (nome, foto, dados básicos do sistema).

**Impacto:**
- **Operacional:** elimina ∼80% das chamadas pro AM por ajuste de time/permissão.
- **Compliance/auditoria:** audit trail dá rastreabilidade legal — quem fez o quê, quando, em qual recurso. Insumo crítico pra incidentes, contestações e LGPD.
- **Segurança:** controle granular de funções reduz risco de over-permission (problema clássico em multi-tenant).
- **Autonomia do cliente enterprise:** mantém o padrão da concorrência (qualquer SaaS sério tem isso).

---

## 4. Critérios de Aceite (Gherkin BDD)

### 4.1 Configurações Gerais

#### Cenário 1 — Visualizar dados da organização

**Dado** que o usuário com permissão acessa "Configurações da organização → Configurações gerais",
**Quando** a tela carrega,
**Então** exibe (somente leitura): razão social, CNPJ, segmento, porte, plano contratado, data de criação da org,
**E** exibe (editável): **ícone da empresa** (logo) + botão **"Algo está errado?"**.

#### Cenário 2 — Editar logo da organização

**Dado** que o usuário tem permissão pra editar configurações gerais,
**Quando** clica em "Trocar ícone" e faz upload de uma imagem,
**Então** o sistema aceita PNG / JPG / SVG, até **2 MB**, mínimo **200×200px**,
**E** exibe preview antes de confirmar,
**E** salva e propaga o novo ícone pra todas as telas que mostram a org (sidebar, header, etc.) em até 1 minuto.

#### Cenário 3 — Reportar divergência nos dados (informativo)

> 📌 **Escopo MVP:** botão é apenas informativo (sem API backend), padrão idêntico à story de 1º acesso.

**Dado** que o usuário identifica erro nos dados readonly (CNPJ, razão social, segmento, porte, plano),
**Quando** clica em **"Algo está errado?"**,
**Então** o sistema abre modal informativo com aviso *"Esses dados são gerenciados pelo time AwSales. Entre em contato com seu responsável pela conta pra correção."* + nome e e-mail do **Gerente da Conta** (se já estiver atribuído pelo admin),
**E** se ainda não houver Gerente da Conta atribuído, exibe contato genérico do time AwSales.

### 4.2 Perfil do próprio usuário

#### Cenário 4 — Editar perfil próprio

**Dado** que qualquer membro acessa seu próprio perfil (avatar no canto superior → "Meu perfil"),
**Quando** edita campos básicos,
**Então** pode alterar: **foto**, **nome**, **telefone**, **idioma**, **fuso horário**, **senha** (se login local),
**E** **não** pode alterar: e-mail (gerenciado via convite/SSO), função (gerenciado por Administrador), data de criação.

#### Cenário 4.1 — Menu da conta no rodapé da sidebar (incluindo "Sair") ⭐

> 📌 **Origem v3.4 (2026-05-12):** o card de usuário no rodapé da sidebar do Studio (`Avatar + Nome + Função`, à esquerda do `[▾]`) é o ponto único de acesso à conta — abre dropdown com ações pessoais e logout. PG sinalizou que esse comportamento estava implícito mas não documentado.

**Dado** que qualquer membro autenticado vê o card de usuário fixado no rodapé da sidebar com `Avatar`, `Nome`, `Função atual nesta org` e ícone `▾`,
**Quando** clica em qualquer parte do card,
**Então** abre um dropdown acima do card com 4 itens (ordem fixa):
1. **👤 Meu perfil** — abre tela do Cenário 4 (editar dados pessoais)
2. **🔁 Trocar organização** — abre seletor de organizações (lista as orgs onde o user é membro · click troca contexto; estado preservado do Cenário 14 do Quick-flow)
3. **⚙ Configurações** — atalho pras configurações da organização atual (= clicar "Configurações" na sidebar)
4. **🚪 Sair** (em vermelho, sob divisor) — encerra a sessão

**E** comportamento do dropdown:
- Click fora fecha o menu
- `Esc` fecha o menu
- Em sidebar **colapsada** (modo rail), o dropdown abre **lateralmente à direita** do card de usuário (pop-out), preservando a navegabilidade

#### Cenário 4.2 — Sair da conta (logout) ⭐

**Dado** que o usuário clica em **🚪 Sair** no dropdown do Cenário 4.1,
**Quando** o sistema processa o logout,
**Então:**
1. Exibe **confirmação modal**: *"Sair da sua conta? Você será desconectado e levado pra tela de acesso."* com botões `[Cancelar]` `[Sair]`
2. Se cancela → fecha o modal, sessão preservada
3. Se confirma:
   - Revoga **session token** no WorkOS (chamada server-side `POST /studio/auth/logout`)
   - Limpa cookies de sessão (httpOnly, secure)
   - Limpa estado client-side de sessão (`localStorage` keys que pertencem à sessão atual; **preserva** preferências de UI como sidebar colapsada e estados de protótipos)
   - Registra evento `auth.logout` no audit trail da org com `{ user_id, session_id, logout_method: 'explicit' }`
   - Redireciona pra **`/login`** (ou `/primeiro-login`/`#w1-a` no protótipo) com flag de aviso *"Você foi desconectado com sucesso."*

**E** se houver **sessão ativa em outra aba** do mesmo browser, ela é invalidada na próxima requisição (token revogado server-side; aba detecta 401 e redireciona pra login).

#### Cenário 4.3 — Sair multi-org (usuário tem N orgs) ⭐

**Dado** que o usuário é membro de mais de 1 organização (sessão single sign-on cross-org),
**Quando** clica em **🚪 Sair**,
**Então** a confirmação esclarece: *"Você será desconectado de **TODAS as N organizações** vinculadas a esta conta (`pg@awsales.io`). Pra trocar de organização sem deslogar, use **🔁 Trocar organização**."* com botões `[Cancelar]` `[Sair de todas]`

**E** se confirma "Sair de todas": logout completo (mesmo fluxo do Cenário 4.2), audit trail registra o evento **em cada uma das orgs** afetadas com `{ ..., scope: 'global' }`.

### 4.3 Team — Lista de membros

#### Cenário 5 — Visualização padrão da lista

**Dado** que o usuário acessa a aba **Team**,
**Quando** a tela carrega,
**Então** exibe seção **"Gerente da Conta"** no topo (se atribuído pelo admin — pode aparecer vazia/oculta se ainda não houver),
**E** exibe abaixo a lista de membros com colunas: Nome, E-mail, Status, Função, Data de entrada, menu de ações (...),
**E** ordenação default **alfabética por nome**,
**E** ações disponíveis no menu (...) variam conforme **permissão dinâmica do usuário logado**.

#### Cenário 6 — Busca e filtros

**Dado** que o usuário está na lista de membros,
**Quando** digita no campo "Pesquisar",
**Então** a lista filtra em tempo real por **nome ou e-mail** (contém, case-insensitive),
**E** o filtro lateral permite filtrar por **função** (multi-select).

#### Cenário 7 — Status do membro

**Dado** que a lista mostra membros em diferentes estados,
**Então** os status possíveis são:
- **Ativo** — verde, conta criada e operacional;
- **Inativo** — cinza/vermelho, foi inativado por admin;
- **Convite enviado** — amarelo, convite válido aguardando 1º acesso;
- **Convite expirado** — laranja, passaram 7 dias sem aceite (pode ser **reenviado** pelo menu da linha).

#### Cenário 8 — Sem limite de membros na org

**Dado** que a org não tem limite contratual de usuários,
**Quando** o admin convida o N-ésimo membro,
**Então** o sistema permite sem bloqueio (sem cap por plano).

### 4.4 Convite de membros

#### Cenário 9 — Enviar convite com blocos por função

> 📌 **Atualizado v3:** convite agora é organizado em **blocos** — cada bloco tem uma função e seu próprio conjunto de e-mails. Permite convidar pessoas com funções diferentes em um único envio. Sem limite de blocos.

**Dado** que o admin clica em **"Convidar membro"**,
**Quando** chega no modal W4 (Convidar membros),
**Então** começa com **1 bloco vazio** (função default "Operador", e-mails vazios),
**E** pode preencher chips de e-mail (até 20 por bloco) + selecionar uma função pra o bloco,
**E** pode clicar **"+ Adicionar bloco"** pra criar blocos adicionais (sem limite),
**E** cada bloco pode ter função distinta + sua própria lista de até 20 e-mails,
**E** pode remover blocos (com confirmação se houver e-mails preenchidos),
**E** ao clicar "Enviar convites", o sistema dispara **N convites agrupados por função** — cada e-mail recebe convite com a função do seu bloco,
**E** cada convite aparece na lista de membros com status **"Convite enviado"** + função correspondente,
**E** o link de convite expira em **7 dias** (mesma regra do 1º acesso da org),
**E** cada convidado completa o **fluxo de 1º acesso do membro** (idêntico ao do responsável da org, **sem etapas de pagamento e revisão de dados** — apenas: senha/SSO → coleta de dados básicos → 2FA se a org tiver flag ativada → termo de aceite → entra logado).

#### Cenário 10 — Limite de 20 e-mails por bloco (não por submit)

> 📌 **Atualizado v3:** o limite é **por bloco**, não global. Cliente pode ter múltiplos blocos com até 20 e-mails cada.

**Dado** que o admin tenta adicionar o 21º chip de e-mail num bloco,
**Quando** pressiona Enter,
**Então** o sistema bloqueia o 21º com mensagem *"Limite de 20 e-mails por bloco. Crie outro bloco com a mesma função pra mais e-mails."*,
**E** os outros blocos podem ter seus próprios 20 e-mails independente.

#### Cenário 10.1 — E-mail repetido em blocos diferentes (conflito de função)

**Dado** que o admin colocou `joao@empresa.com` no Bloco 1 (Analista Sênior) e também no Bloco 2 (Operador),
**Quando** clica "Enviar convites",
**Então** o sistema bloqueia o envio com mensagem clara: *"joao@empresa.com aparece em 2 blocos com funções diferentes. Qual função usar?"*,
**E** oferece resolução inline: escolher entre as funções dos blocos OU remover de um deles.

#### Cenário 11 — E-mail já é membro da mesma org

**Dado** que o admin tenta convidar `joao@empresa.com` que já é membro,
**Quando** confirma o convite,
**Então** o sistema bloqueia esse e-mail específico (os outros do batch seguem), e exibe aviso na UI: *"joao@empresa.com já é membro desta organização."*.

#### Cenário 12 — E-mail é usuário em outra org da AwSales

**Dado** que o e-mail já existe em outra organização AwSales,
**Quando** o convite é aceito,
**Então** o sistema permite **multi-org** com o mesmo e-mail,
**E** o usuário pode trocar de org no menu de usuário (seletor de organização),
**E** cada org tem suas próprias funções/permissões isoladas.

#### Cenário 13 — Reenviar convite

**Dado** que existe um convite pendente ou expirado,
**Quando** o admin clica no menu (...) da linha e seleciona **"Reenviar convite"**,
**Então** o sistema invalida o link anterior,
**E** gera um novo link válido por 7 dias,
**E** dispara novo e-mail pro convidado,
**E** o status na lista volta pra "Convite enviado".

#### Cenário 14 — Cancelar convite

**Dado** que existe um convite pendente,
**Quando** o admin clica no menu (...) e seleciona **"Cancelar convite"**,
**Então** o sistema invalida o link,
**E** remove a linha da lista,
**E** se o convidado tentar usar o link, recebe tela *"Convite cancelado. Entre em contato com sua organização."*.

#### Cenário 15 — Mudar função de um convite pendente

**Dado** que o admin quer mudar a função de um convite ainda não aceito,
**Quando** abre o menu (...) na linha do convite,
**Então** **não existe** ação direta de "Editar função" pra convites pendentes,
**E** o admin precisa **cancelar** e **enviar novo convite** com a função correta,
**E** o aviso disso é exibido no fluxo (tooltip ou ajuda contextual).

### 4.5 Visualizar usuário (com audit trail)

#### Cenário 16 — Modal de visualização (com PII mascarado se função não permite)

**Dado** que o admin clica em "Visualizar" no menu (...) de um membro,
**Quando** o modal abre,
**Então** exibe dados do usuário: foto, nome, **e-mail/telefone (sujeitos a mascaramento PII — ver Cenário 38)**, data de criação, função,
**E** exibe seção **"Permissões"** com todas as permissões da função agrupadas por domínio (Agentes, Aprovações, Arquivos, Bases de Conhecimento, Conversas, Dashboard, Atendimento, Disparos, Funções e Permissões, Integrações e Tools, Organizações, Playground, Tipos de Agentes, Usuários, **Segurança**) — **somente leitura**,
**E** exibe nova seção **"Audit Trail"** do usuário (ver cenários 17–19) — com IPs também sujeitos a mascaramento,
**E** exibe botão **"Editar"** no rodapé (apenas se a função do executor permite).

#### Cenário 17 — Audit Trail: o que é registrado

**Dado** que o modal de visualização carrega o audit trail do usuário,
**Quando** a aba/seção é renderizada,
**Então** exibe lista cronológica reversa (mais recente primeiro) com cada evento contendo:
- **Timestamp** (data + hora ISO local),
- **Ação executada** (ex: "Criou agente X", "Aprovou disparo Y", "Editou base de conhecimento Z", "Convidou usuário W", "Inativou usuário V", "Logou", "Falha de login", "Mudou senha"),
- **Recurso afetado** (link clicável quando aplicável),
- **Origem** (IP + user-agent resumido).

#### Cenário 18 — Audit Trail: filtros e busca

**Dado** que o audit trail tem muitos eventos,
**Quando** o admin precisa investigar uma ação específica,
**Então** pode filtrar por **período** (últimas 24h / 7 dias / 30 dias / customizado),
**E** filtrar por **tipo de ação** (multi-select agrupado por domínio),
**E** buscar por **palavra-chave** no nome do recurso afetado.

#### Cenário 19 — Audit Trail: paginação e exportação

**Dado** que o histórico pode ser longo,
**Quando** o admin rola até o final da lista,
**Então** o sistema carrega o próximo bloco (paginação por scroll infinito ou "Carregar mais"),
**E** o admin pode **exportar** o audit trail filtrado em **CSV** (para uso em auditoria/compliance).

### 4.6 Editar usuário

#### Cenário 20 — Trocar função

**Dado** que o admin clica em "Editar" (menu ou modal),
**Quando** o modal/tela de edição abre,
**Então** o **único campo editável** é a **função** (1 função por usuário, dropdown com todas as funções padrão + custom),
**E** os demais campos do perfil só podem ser editados pelo próprio usuário (em "Meu perfil"),
**E** ao salvar, a função muda imediatamente,
**E** o evento é registrado no audit trail do usuário alvo **e** do admin que fez a alteração.

### 4.7 Inativar / Reativar

#### Cenário 21 — Inativar usuário

**Dado** que o admin clica em **"Inativar usuário"** no menu (...),
**Quando** confirma a inativação,
**Então** o usuário **permanece logado na sessão atual**,
**E** no **próximo login**, recebe mensagem *"Sua conta foi inativada. Entre em contato com seu administrador."* e não consegue acessar,
**E** o histórico completo do usuário é **preservado** (audit trail, conversas, recursos criados),
**E** o status na lista vira **"Inativo"**,
**E** o menu (...) da linha passa a oferecer **"Reativar"**.

#### Cenário 22 — Bloqueio de inativação do último Administrador

**Dado** que existe apenas 1 usuário com função "Administrador" ativo na org,
**Quando** o admin tenta inativar a si mesmo (ou outro tenta inativar esse último admin),
**Então** o sistema bloqueia a ação,
**E** exibe mensagem: *"Não é possível inativar o único Administrador da organização. Atribua a função de Administrador a outro membro antes."*.

#### Cenário 23 — Reativar usuário

**Dado** que um usuário está inativo,
**Quando** o admin clica em **"Reativar"**,
**Então** o usuário volta pra status **"Ativo"**,
**E** mantém a função anterior,
**E** consegue logar normalmente no próximo acesso (com 2FA se a flag da org estiver ativa),
**E** o evento é registrado no audit trail.

### 4.8 Funções

#### Cenário 24 — Listagem de funções

**Dado** que o admin acessa a aba **Funções**,
**Quando** a tela carrega,
**Então** exibe lista com colunas: Função, # Permissões, # Usuários ativos, Criado por (nome+data se custom; "Padrão do sistema" se padrão),
**E** funções padrão exibem ícone de **olho** (somente visualização) — **não editáveis, não deletáveis**,
**E** funções customizadas exibem menu de ações (editar, deletar).

#### Cenário 24.1 — Catálogo canônico de permissões (grupos visuais + ações) ⭐

> 📌 **Origem v3.2:** ponte entre a UX atual da neo (grupos colapsáveis "Agentes / Campanhas / Bases de Conhecimento / ..." com sub-ações CRUD) e a nova arquitetura de domínios do backend (`apps/awsales-backend/docs/content/docs/domain/` — 10 domínios mais granulares). PG decidiu **preservar o padrão visual da neo** (cliente acha intuitivo) mas **reescrever as ações** pra refletir o backend novo (granular onde precisa, CRUD onde basta). Slug `account-manager` continua reservado a internos (env-role WorkOS).

**Princípios de mapeamento UX ↔ backend:**
1. **Grupo visual** = entidade que o cliente entende (Agentes, Campanhas, Bases de Conhecimento). Aparece no UI como card colapsável (Cenário 26).
2. **Ação dentro do grupo** = `Visualizar / Criar / Editar / Excluir` por default + ações específicas quando o backend expõe ação **sensível ou semanticamente diferente** (`Publicar versão`, `Aplicar cupom`, `Treinar base`, `Aprovar campanha`, `Exportar CSV`, `Disparar massa`).
3. **Slug técnico** mapeia 1+ rotas backend do `studio-api/` — UI lê esta tabela como source-of-truth pra montar o checkbox-grid.
4. **Permissão "Gerenciar"** da neo (acesso à tela) **NÃO existe** no modelo novo — quem tem `Visualizar` acessa a tela; ações de escrita são gates separados.

**Mapeamento neo → novo:**

| Grupo neo (legacy) | Grupo novo (UI) | Domínios backend que cobre |
|---|---|---|
| Agentes | **Agentes** | `domain/agents/*` |
| Tipos de Agentes | (mesclado em Agentes) | `domain/agents/agents-config` |
| Bases de Conhecimento | **Bases de Conhecimento** | `domain/cortex/*` (memory + knowledge) |
| Campanhas + Aprovações + Disparos | **Campanhas** | `domain/agents/agent-actions` + `domain/messaging/sending` (dispatch) |
| Central de Atendimento | **Atendimento** | `domain/agents/escalation` + `domain/messaging/channels` |
| Conversas + conversation product context | **Conversas** | `domain/messaging/*` |
| Arquivos | **Arquivos** | (storage cross-domain — anexos de mensagem, KB) |
| Dashboard | **Dashboard** | `domain/cortex/*` (insights) + `domain/lead/features-api` |
| Playground | **Playground** | `domain/agents/agent-runtime` (modo dev) |
| Integrações e Tools | **Integrações** | `domain/integration-hub/*` |
| Funções e Permissões | **Funções e Permissões** | `domain/iam/rbac` + `domain/iam/identity-provider` |
| Usuários | **Equipe** | `domain/iam/multi-tenancy` (membership, invitation) |
| Organizações | **Organização** | `domain/iam/identity-provider` (org settings) |
| — (não existia) | **Financeiro** | `domain/billing/*` |
| — (não existia) | **Privacy & Compliance** | `domain/privacy-compliance/*` |
| — (não existia) | **Leads** | `domain/lead/*` |
| — (não existia) | **Notificações** | `domain/notification/*` |
| — (não existia) | **Offboarding** | `domain/offboarding/*` |

**Catálogo completo (grupo visual · ação · slug técnico):**

**▸ Agentes** — Biblioteca e configuração de agentes de IA
- Visualizar (`agent:read`, `session:read`)
- Criar (`agent:write`)
- Editar prompts (`agent:edit_prompt`)
- Publicar versão ⚡ (`agent:publish`) — ação sensível: torna agente ativo em produção
- Gerenciar bindings (Tools / KB) (`agent_binding:write`)
- Excluir (`agent:delete`)

**▸ Bases de Conhecimento** — Cortex / memória dos agentes
- Visualizar (`cortex:read`)
- Criar / editar base (`cortex:write`)
- Treinar / reindexar ⚡ (`cortex:reindex`) — ação custosa: dispara job de embeddings
- Promover artifact pra produção ⚡ (`cortex:model:promote`)
- Exportar dados analíticos (`cortex:export`)
- Excluir base (`cortex:delete`)

**▸ Campanhas** — Criação, aprovação e disparo de campanhas
- Visualizar (`campaign:read`)
- Criar / editar campanha (`campaign:write`)
- Aprovar campanha ⚡ (`campaign:approve`) — gate de governança antes de disparar
- Disparar em massa ⚡ (`dispatch:schedule`) — ação custosa: consome variável
- Cancelar disparo (`dispatch:cancel`)
- Excluir campanha (`campaign:delete`)

**▸ Conversas** — Histórico e atendimento de conversas
- Visualizar conversas (`conversation:read`)
- Enviar mensagem única (`message:send`)
- Visualizar elegibilidade outbound (`outbound_eligibility:read`)
- Exportar conversa (`conversation:export`) — sensível: vaza PII se não houver gate de Privacy

**▸ Atendimento (Central)** — Fila humana, tickets, escalation
- Visualizar fila (`escalation:read`)
- Atender ticket (`escalation:assign`)
- Escalar conversa pra humano (`escalation:write`)
- Gerenciar equipes / operadores (`escalation:team:write`)

**▸ Arquivos** — Mídia e documentos anexos
- Visualizar (`storage:read`)
- Upload (`storage:write`)
- Excluir (`storage:delete`)

**▸ Integrações & Tools** — Integration Hub
- Visualizar conexões (`integration:connection:read`)
- Conectar provedor ⚡ (`integration:connection:write` + OAuth) — escrita sensível
- Testar conexão (`integration:connection:test`)
- Obter credenciais ⚡ (`integration:credential:read`) — **só Admin**, expõe secret
- Desconectar (soft-delete) (`integration:connection:delete`)
- Listar catálogo de provedores (`integration:catalog:read`)

**▸ Playground** — Ambiente de testes (modo dev de agentes)
- Acessar Playground (`agent_runtime:dev`)
- Simular dispatch sem cobrar (`dispatch:simulate`)

**▸ Leads** — Base de leads, perfil, features
- Visualizar perfil (`lead:read`)
- Atualizar memória / notas (`lead:write_memory`)
- Consultar features (RFM, engagement) (`lead:feature:read`)
- Exportar features pra ML/MAB (`lead:feature:export`)
- Resolver identidade (channel binding) (`lead:identity:write`)
- Gerenciar opt-out / compliance (`lead:compliance:write`)

**▸ Dashboard** — Visão geral, métricas, insights
- Visualizar dashboard operacional (`dashboard:read`)
- Visualizar insights Cortex (`cortex:insights:read`)
- Criar Analysis Job (`cortex:analysis:write`)
- Acessar observabilidade técnica (`cortex:observability:read`)

**▸ Financeiro** — Billing, faturas, cupons, vouchers
- Visualizar assinatura e faturas (`subscription:read`, `invoice:read`)
- Pagar / reemitir fatura ⚡ (`invoice:pay`)
- Visualizar cupom / voucher (`coupon:read`, `voucher:read`)
- Aplicar código de cupom (`coupon:apply`)
- Gerenciar métodos de pagamento ⚡ (`payment_method:write`)
- Definir método padrão (`payment_method:set_default`)
- Audit Trail Financeiro · Visualizar (`audit:financeiro:read`)
- Audit Trail Financeiro · Exportar CSV ⚡ (`audit:financeiro:export`) — gera modal LGPD

**▸ Privacy & Compliance** — LGPD, audit, DSAR
- Visualizar logs de auditoria (`audit:read`)
- Visualizar consentimentos (`consent:read`)
- Revogar consentimento ⚡ (`consent:revoke`)
- Definir políticas de retenção (`retention:write`)
- Abrir DSAR — Art. 18 LGPD (`dsar:write`)
- Visualizar status de DSAR (`dsar:read`)
- Aplicar Legal Hold ⚡ (`legal_hold:write`) — suspende disposal
- Visualizar PII completo ⚡ (`pii:read`) — desmascara `executor.nome/email`, `target.nome/email`, `actor.ip`
- Exportar com redação (`export:read`)

**▸ Notificações** — Histórico e templates
- Visualizar histórico (`notification:read`)
- Reenviar notificação (`notification:resend`)
- Configurar preferências da org (`notification:preferences:write`)
- Gerenciar templates customizados (`notification:template:write`)

**▸ Equipe (Usuários)** — Membros e convites
- Visualizar membros (`membership:read`)
- Convidar membros (`invitation:write`)
- Reenviar convite (`invitation:resend`)
- Revogar convite (`invitation:revoke`)
- Inativar / reativar membro (`membership:unlink`)

**▸ Funções e Permissões** — RBAC da org
- Visualizar funções (`role:read`)
- Criar / editar funções customizadas ⚡ (`role:write`)
- Excluir função customizada (`role:delete`)
- Listar permissões do sistema (`permission:read`)

**▸ Organização** — Dados da empresa cliente
- Visualizar organização (`organization:read`)
- Editar organização (logo, dados básicos) (`organization:write`)
- Gerenciar contrato (`organization_contract:write`)

**▸ Offboarding** — Ciclo de saída
- Solicitar cancelamento ⚡ (`offboarding:request`)
- Visualizar solicitações (`offboarding:read`)
- Reativar dentro do grace period (`offboarding:reactivate`)

**Legenda:**
- ⚡ = ação **sensível ou custosa** — UI mostra confirmação extra (modal) + sempre gera evento de audit trail mesmo se a permissão estiver ativa.
- Permissões sem ⚡ são CRUD comum, gate de permissão é suficiente.

**Notas críticas:**
1. **"Gerenciar" da neo legacy NÃO virou permissão no novo modelo.** Quem tem `Visualizar` acessa a tela; ações de escrita são gates separados. Mais granular, menos surpresa.
2. O slug `account-manager` (env-role WorkOS, doc `iam/rbac/roles.mdx`) é **reservado a internos `@awsales.io`** — **não aparece** no checkbox-grid do Cenário 26 (Studio API filtra fora).
3. **Permissões cruzam UI ↔ backend** — uma única permissão pode gatear 1+ rotas REST (`role:write` cobre `POST /studio/roles` + `PATCH /studio/roles/{id}`). Mapeamento exato em `apps/awsales-backend/docs/content/docs/studio-api/permission/`.

#### Cenário 24.2 — Funções padrão do tenant (cliente) ⭐

> 📌 **Origem v3.1:** decisão de produto do PG — toda nova org já nasce com 6 funções padrão prontas pra atribuir, mais o `studio-admin` (env-role WorkOS, dono da org). Cliente pode customizar criando novas, mas não edita as padrão (read-only no Cenário 25).

**Dado** que toda organização recém-criada já recebe o conjunto de funções abaixo,
**Então** o seed inicial cria essas 6 funções padrão (não-editáveis) **além** do env-role `studio-admin` que o owner recebe via invitation:

| Função (slug) | Persona-alvo | Resumo |
|---|---|---|
| **Admin** (`org-admin`) | Sócio-administrador / dono operacional | Tudo do tenant: IAM, Financeiro completo, Agentes, Integrações, Privacy, Offboarding. Não vê dados de outras orgs. |
| **Manager** (`org-manager`) | Líder de operação / supervisor | Convida e inativa membros (não cria funções), opera Agentes/Mensagens/Leads, vê Financeiro mas não troca cartão, não acessa Privacy/Legal Hold. |
| **Operator** (`org-operator`) | Operação de campanha · SDR · atendente | Atua na execução: cria dispatch, atende conversas, edita prompts dos próprios agentes, escala. Não cria agente novo, não gerencia integrações, não vê Financeiro. |
| **Analyst** (`org-analyst`) | Time de dados / RevOps | Read-only operacional + exporta features Cortex/Lead. Sem escrita em Agentes/Mensagens. |
| **Viewer** (`org-viewer`) | Auditor interno / stakeholder leitura | Read-only de tudo que **não** é PII (membros, conversas mascaradas, faturas mascaradas, audit sem PII). |
| **DPO** (`org-dpo`) | Encarregado de dados (LGPD Art. 41) | Permissões completas de Privacy: PII, DSAR, Legal Hold, retenção, audit trail completo. Não opera Agentes/Mensagens. |

**E** matriz de permissões (agrupada pelos grupos visuais do Cenário 24.1 · ✓ tem · — não tem · 👁 read-only):

| Grupo · Ação | Admin | Manager | Operator | Analyst | Viewer | DPO |
|---|---|---|---|---|---|---|
| **Agentes** · Visualizar | ✓ | ✓ | ✓ | ✓ | 👁 | ✓ |
| **Agentes** · Criar / Editar prompts | ✓ | ✓ | ✓ (próprios) | — | — | — |
| **Agentes** · Publicar versão ⚡ | ✓ | ✓ | — | — | — | — |
| **Agentes** · Gerenciar bindings (Tools/KB) | ✓ | ✓ | — | — | — | — |
| **Bases de Conhecimento** · Visualizar | ✓ | ✓ | ✓ | ✓ | 👁 | ✓ |
| **Bases de Conhecimento** · Criar / Editar / Treinar ⚡ | ✓ | ✓ | — | — | — | — |
| **Bases de Conhecimento** · Exportar analíticos | ✓ | ✓ | — | ✓ | — | — |
| **Campanhas** · Visualizar | ✓ | ✓ | ✓ | ✓ | 👁 | ✓ |
| **Campanhas** · Criar / Editar | ✓ | ✓ | ✓ | — | — | — |
| **Campanhas** · Aprovar campanha ⚡ | ✓ | ✓ | — | — | — | — |
| **Campanhas** · Disparar em massa ⚡ | ✓ | ✓ | ✓ | — | — | — |
| **Conversas** · Visualizar | ✓ | ✓ | ✓ | ✓ | 👁 mascarado | ✓ |
| **Conversas** · Enviar mensagem única | ✓ | ✓ | ✓ | — | — | — |
| **Conversas** · Exportar | ✓ | — | — | ✓ | — | ✓ |
| **Atendimento** · Atender ticket / Escalar | ✓ | ✓ | ✓ | — | — | — |
| **Arquivos** · Visualizar / Upload | ✓ | ✓ | ✓ | ✓ | 👁 | — |
| **Integrações** · Listar / Testar | ✓ | ✓ | 👁 | ✓ | 👁 | — |
| **Integrações** · Conectar provedor ⚡ | ✓ | ✓ | — | — | — | — |
| **Integrações** · Obter credenciais ⚡ | ✓ | — | — | — | — | — |
| **Playground** · Acessar / Simular | ✓ | ✓ | ✓ | ✓ | — | — |
| **Leads** · Visualizar perfil | ✓ | ✓ | ✓ | ✓ | 👁 mascarado | ✓ |
| **Leads** · Atualizar memória/notas | ✓ | ✓ | ✓ | — | — | — |
| **Leads** · Exportar features pra ML | ✓ | ✓ | — | ✓ | — | — |
| **Leads** · Compliance / opt-out | ✓ | ✓ | — | — | — | ✓ |
| **Dashboard** · Visualizar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Dashboard** · Criar Analysis Job | ✓ | ✓ | — | ✓ | — | — |
| **Financeiro** · Visualizar | ✓ | ✓ | — | ✓ | 👁 mascarado | ✓ |
| **Financeiro** · Pagar / Trocar cartão ⚡ | ✓ | — | — | — | — | — |
| **Financeiro** · Aplicar cupom | ✓ | ✓ | — | — | — | — |
| **Financeiro** · Audit · Exportar CSV ⚡ | ✓ | — | — | — | — | ✓ |
| **Privacy** · Visualizar audit / PII ⚡ | ✓ | — | — | — | — | ✓ |
| **Privacy** · DSAR / Legal Hold ⚡ | — | — | — | — | — | ✓ |
| **Notificações** · Visualizar / Reenviar | ✓ | ✓ | ✓ | ✓ | 👁 | ✓ |
| **Equipe** · Convidar / Inativar membros | ✓ | ✓ | — | — | — | — |
| **Funções e Permissões** · Criar/Editar ⚡ | ✓ | — | — | — | — | — |
| **Organização** · Editar dados básicos | ✓ | — | — | — | — | — |
| **Offboarding** · Solicitar cancelamento ⚡ | ✓ | — | — | — | — | — |

#### Cenário 24.3 — Funções internas AwSales (operador da plataforma) ⭐

> 📌 **Origem v3.1:** decisão de produto do PG — formalizar as funções do **lado AwSales** que aparecem em `adm.awsales` (admin-api) + carteira de clientes do Gestor de Conta + papel do Playbooker em implantações. Mapeado contra `iam/rbac/environment-vs-organization.mdx` (env-roles vs org-roles) + `iam/multi-tenancy/account-managers.mdx` (relação 1:N AM ↔ Org).

**Dado** que internos `@awsales.io` operam a plataforma via `adm.awsales` (com `access:admin`) e podem entrar em orgs cliente (com `access:studio` quando atribuídos),
**Então** os perfis internos seedados são:

| Função interna (slug) | Tipo | Escopo | Resumo do papel |
|---|---|---|---|
| **Super Admin** (`awsales-super-admin`) | Environment | Plataforma inteira (todas as orgs + admin-api) | Acesso total. Único que cria/edita env-roles via WorkOS, atribui AM, define produtos/preços globais, opera webhooks Stripe, executa effectuation de offboarding, age em qualquer org com auditoria completa. **Toda ação cross-org sai em audit trail global.** |
| **Gestor de Conta** (`account-manager`) ⭐ | Environment (slug **reservado** WorkOS) | **Carteira** — N orgs onde é o AM atribuído (`organization.account_manager_id = user.id`) | Onboarding comercial, retenção, offboarding negociado, reativação no grace period. Vê e age **apenas nas orgs da sua carteira**. Não pode se atribuir a uma org sozinho — Super Admin atribui. Não some da org via Studio API (slug protegido). Recebe notificação automática em cancellation request + retention deadline. |
| **Playbooker** (`awsales-playbooker`) ⭐ | Environment + atribuição contextual | Orgs onde foi convidado pelo AM responsável | Implanta playbooks: cria/configura agentes, KB/Cortex, integrações, fluxos de mensagens, dispatches piloto. **Acesso técnico restrito** — não vê Financeiro, não toca em IAM da org cliente, não acessa PII completo (a menos que a org ative explicitamente). Saída registrada em audit trail interno. |
| **Suporte L2** (`awsales-support-l2`) | Environment | Read-only em qualquer org + write em tickets internos | Atende chamados de cliente. Vê conversas, leads, faturas mascaradas, audit trail sem PII. Não age sobre dados do cliente — só registra ticket e escala. |
| **Engenharia · On-call** (`awsales-engineering`) | Environment | Plataforma (técnico) | Operação técnica: webhooks falhos, reprocessamento de eventos, leitura de observabilidade Cortex, integração-hub. Não vê PII, não opera Financeiro nem IAM da org. |

**E matriz internos × permissões críticas:**

| Permissão crítica | Super Admin | Gestor de Conta | Playbooker | Suporte L2 | Eng. On-call |
|---|---|---|---|---|---|
| Acesso cross-org (todas as orgs) | ✓ | apenas carteira | apenas atribuídas | ✓ (read-only) | ✓ |
| Atribuir AM em Organization | ✓ | — | — | — | — |
| Editar env-roles (WorkOS) | ✓ | — | — | — | — |
| Visualizar PII de cliente | ✓ (logado) | ✓ (logado, escopo carteira) | — (default) | — | — |
| Criar/editar agentes na org cliente | ✓ | — | ✓ | — | — |
| Operar Financeiro do cliente | ✓ | ✓ (cobrança, cupom) | — | — | — |
| Executar effectuation de offboarding | ✓ | ✓ (proposta) | — | — | — |
| Reprocessar webhook / event replay | ✓ | — | — | — | ✓ |
| Aplicar Legal Hold cross-org | ✓ | — | — | — | — |

#### Cenário 24.4 — Carteira do Gestor de Conta (escopo de visibilidade) ⭐

> 📌 **Regra:** carteira = conjunto de orgs onde `organization.account_manager_id = user.id` (relação 1:N, doc `iam/multi-tenancy/account-managers.mdx`). Não há join table — o vínculo é direto na Organization.

**Dado** que o Gestor de Conta acessa `adm.awsales`,
**Quando** abre o seletor de orgs ou qualquer lista cross-org,
**Então:**
- **Default view** mostra **apenas as orgs da carteira** (X orgs onde ele é AM), com badge "Sua carteira (N)" no header.
- Toggle **`Mostrar todas as orgs da plataforma`** existe mas **gera evento de audit** `am.cross_carteira_access` ao ser ativado — uso justificado deve ser registrado no campo de "motivo" obrigatório.
- Notificações automáticas chegam **só pelas orgs da carteira**:
  - `cancellation_request.opened` → AM da org notificado
  - `retention_deadline.approaching` (D-3 / D-1) → AM da org
  - `retention_deadline.expired` → AM da org
- Métricas agregadas da carteira (MRR somado, churn risk, NPS, tickets abertos) ficam no dashboard `adm.awsales › Minha Carteira`.

**E** ao atribuir/transferir AM (apenas Super Admin via admin-api):
- Org antiga libera o vínculo, AM antigo perde acesso na próxima sessão.
- Evento `organization.account_manager_changed` registrado com `previous_am_id` + `new_am_id` + ator + motivo.
- Pré-condição de offboarding do AM: todas as orgs da carteira já reatribuídas (regra do doc canônico).

#### Cenário 24.5 — Playbooker · atribuição contextual e desligamento ⭐

**Dado** que o Playbooker é um interno técnico responsável por implantar playbooks (configurar agents, KB, integrações),
**Quando** entra numa org cliente,
**Então:**
- **Atribuição** é feita pelo Gestor de Conta da org via fluxo `adm.awsales › Carteira › Org X › Solicitar Playbooker` — gera convite interno + audit `playbooker.assigned` com `due_date` (data prevista de fim da implantação).
- **Acesso técnico** ativo: criar/editar agentes, conectar integrações, configurar Cortex/KB, simular dispatches em modo dev.
- **Bloqueios explícitos**: Financeiro (todas as ações), IAM (gerenciamento de funções/membros do tenant), Privacy (PII completo, DSAR, Legal Hold), Offboarding.
- **Desligamento automático** na `due_date` (ou manual antes) → evento `playbooker.unassigned` + acesso revogado + relatório de entrega gerado pra carteira do AM.
- **Toda ação** do Playbooker numa org cliente aparece no audit trail da própria org com `actor_type: AwSales · Playbooker · {nome}` (transparência regulatória — o cliente sempre sabe quem mexeu).

#### Cenário 24.6 — Visibilidade dos perfis internos para o cliente final ⭐

**Dado** que o cliente (tenant) abre Audit Trail ou aba Team,
**Então:**
- **Gerente da Conta** (1 atribuído à org) aparece no topo da aba Team com nome + e-mail + foto (Cenário 31). Cliente sabe quem é o AM responsável.
- **Playbooker** ativo (se houver) aparece numa **seção separada "Implantação técnica"** abaixo do AM com período da implantação (D-início → due_date) e nome + e-mail.
- **Super Admin / Suporte L2 / Eng. On-call** **não** aparecem na aba Team — só no audit trail quando agem (rastreabilidade sem listagem).
- **Toda ação de qualquer interno** numa org cliente sempre aparece no audit trail dessa org com `actor_type: AwSales · {função} · {nome}` (sem exceção, sem ocultação — CDC Art. 6º III + LGPD Art. 6º VI).



**Dado** que o admin clica no olho de uma função padrão,
**Quando** a tela/modal abre,
**Então** exibe a lista completa de permissões agrupadas por domínio,
**E** não permite alteração nem duplicação (no MVP).

#### Cenário 26 — Criar nova função

**Dado** que o admin clica em **"+ Criar nova função"**,
**Quando** a tela de criação abre (tela própria, não modal — confirmado pelo PG),
**Então** exibe campos: **Nome da função** (obrigatório, único na org), **Descrição** (opcional),
**E** lista todas as permissões do sistema agrupadas por domínio (mesmo agrupamento da tela "Visualizar usuário") com checkbox por permissão,
**E** **não permite partir de duplicação** de outra função (cliente monta do zero),
**E** ao salvar, a função aparece na lista com "Criado por: {nome do admin} em {data}".

#### Cenário 27 — Editar função custom

**Dado** que o admin clica em "Editar" numa função custom,
**Quando** altera permissões e salva,
**Então** as mudanças se aplicam **imediatamente** a todos os usuários daquela função,
**E** sessões ativas continuam (validação acontece no próximo request gated por permissão),
**E** o evento é registrado em audit trail global (não no de usuário específico — afeta vários).

#### Cenário 28 — Deletar função custom

**Dado** que o admin clica em "Deletar" numa função custom,
**Quando** confirma,
**Então** se a função **não tem usuários ativos** → deleta direto,
**E** se a função **tem usuários ativos** → o sistema bloqueia e exibe modal *"Esta função tem N usuários ativos. Reatribua-os a outra função antes de deletar."* com link pros usuários afetados.

#### Cenário 29 — Sem limite de funções customizadas

**Dado** que a org pode criar quantas funções precisar,
**Quando** o admin cria N+1 funções,
**Então** o sistema permite sem bloqueio.

#### Cenário 30 — Isolamento multi-tenant de funções

**Dado** que orgs diferentes podem ter funções customizadas com mesmo nome,
**Quando** o admin da Org A cria função "Auditor Externo",
**Então** isso **não afeta** outras orgs,
**E** cada org enxerga apenas suas próprias funções (padrão + custom da própria org).

### 4.8.7 Hardening pós stress-test (Onda 1) ⭐⭐⭐

> 📌 **Origem v3.3:** stress test 2026-05-12 ([`stress-tests/funcoes/report.md`](stress-tests/funcoes/report.md)) identificou 91 gaps em 8 clusters por root cause. Esta seção endereça os **33 gaps P0** que bloqueiam GA Enterprise. Fix backlog detalhado em [`stress-tests/funcoes/scenarios-and-fixes/fix-backlog.md`](stress-tests/funcoes/scenarios-and-fixes/fix-backlog.md).

#### Cenário 24.7 — Função padrão `org-financeiro` ⭐

> 📌 **F1.1 fix · cluster RC1:** confirmado em 3 personas adversárias (contador externo, CFO interno, AM). Manager era curto (não troca cartão), Admin era overkill (vê tudo operacional). Cliente enterprise sempre tem CFO/contador separado da operação.

**Dado** que toda organização recém-criada recebe a função `org-financeiro` no seed,
**Então** as permissões são:
- ✓ Financeiro · Visualizar / Pagar / Reemitir fatura / Aplicar cupom / Audit Trail · Visualizar + Exportar CSV
- ✓ Métodos de pagamento · Gerenciar / Definir padrão
- ✓ Contrato · Visualizar (`organization_contract:read`)
- ✓ Dashboard · Visualizar gasto consolidado por campanha (`dashboard:read`)
- ✓ Equipe · Visualizar membros (`membership:read`) — pra atribuir owner de fatura
- — Agentes / Conversas / Leads / Privacy / Integrações / Bases de Conhecimento / Campanhas — **nenhuma**

**E** essa função aceita `access_expires_at` (Cenário 24.11) — usada tanto por CFO interno (sem TTL) quanto por contador externo (TTL padrão 90 dias renovável).

#### Cenário 24.8 — Função padrão `org-integrator` ⭐

> 📌 **F1.1 fix · cluster RC1:** dev freelance / integrador técnico não cabia em nenhuma das 6 funções originais. Operator vaza PII (conversas/leads), Manager vaza Financeiro, Analyst não conecta integração.

**Dado** que toda organização recém-criada recebe a função `org-integrator` no seed,
**Então** as permissões são:
- ✓ Integrações · Listar conexões / Conectar provedor (OAuth) / Testar conexão / Desconectar
- ✓ Playground · Acessar / Simular dispatch SEM cobrar (modo sandbox `dispatch:simulate`)
- ✓ Notificações · Visualizar histórico (pra debugar webhooks)
- ✓ Dashboard · Acessar observabilidade técnica (`cortex:observability:read`)
- ✗ **Integrações · Obter credenciais** (`integration:credential:read`) — permanece restrito ao Admin (regra técnica)
- — Conversas / Leads (mesmo mascarado) / Financeiro / Agentes operacionais / Privacy / IAM — **nenhuma**

**E** essa função **força** `access_expires_at` com preset máximo 12 meses no convite.

#### Cenário 24.9 — Função padrão `org-auditor-externo` ⭐

> 📌 **F1.1 fix · cluster RC1:** DPO da matriz é cargo formal LGPD Art. 41 (revoga consentimento, aplica Legal Hold). Atribuir DPO padrão a auditor externo é **irregularidade regulatória**. Auditor externo precisa de leitura + export, sem mandato pra agir.

**Dado** que toda organização recém-criada recebe a função `org-auditor-externo` no seed,
**Então** as permissões são:
- ✓ Privacy · Visualizar logs de auditoria / consentimentos / status de DSAR / PII completo (leitura)
- ✓ Privacy · Exportar com redação
- ✓ Financeiro · Audit Trail · Visualizar + Exportar CSV
- ✓ Conversas · Visualizar (com tag `actor_type: auditor_externo` no audit pra rastreabilidade)
- ✗ **Privacy · Revogar consentimento / Aplicar Legal Hold / Abrir DSAR write** — bloqueados (DPO formal só)
- — Agentes / Integrações / IAM / Leads compliance write — **nenhuma**

**E** essa função **força** `access_expires_at` com preset máximo 24 meses no convite + categoria estruturada de motivo no convite ("Auditoria LGPD" / "SOC 2" / "ISO 27001" / "Investigação Específica").

#### Cenário 24.10 — Matriz de permissões expandida (9 funções padrão) ⭐

> 📌 **Atualização do Cenário 24.2:** matriz original tinha 6 funções; agora 9 (Admin · Manager · Operator · Analyst · Viewer · DPO · Financeiro · Integrator · Auditor Externo).

**Dado** que o cliente atribui função no convite (Cenário 9),
**Então** dispõe das 9 padrão acima + customizadas (Cenários 26-30). Adições à matriz do Cenário 24.2:

| Grupo · Ação | Financeiro | Integrator | Auditor Externo |
|---|---|---|---|
| **Agentes** · Visualizar | — | — | — |
| **Bases de Conhecimento** · Visualizar | — | — | — |
| **Campanhas** · Visualizar | — | — | — |
| **Conversas** · Visualizar | — | — | ✓ (com tag) |
| **Atendimento** · Atender | — | — | — |
| **Arquivos** · Visualizar | — | — | — |
| **Integrações** · Listar/Testar | — | ✓ | — |
| **Integrações** · Conectar provedor ⚡ | — | ✓ | — |
| **Integrações** · Obter credenciais ⚡ | — | — | — |
| **Playground** · Acessar/Simular | — | ✓ | — |
| **Leads** · Visualizar perfil | — | — | — |
| **Dashboard** · Visualizar | ✓ (gasto) | ✓ (técnico) | — |
| **Financeiro** · Visualizar/Pagar | ✓ | — | — |
| **Financeiro** · Aplicar cupom | ✓ | — | — |
| **Financeiro** · Audit · Exportar CSV ⚡ | ✓ | — | ✓ |
| **Privacy** · Visualizar audit/PII ⚡ | — | — | ✓ |
| **Privacy** · DSAR/Legal Hold ⚡ | — | — | — |
| **Notificações** · Histórico/Reenviar | ✓ | ✓ | — |
| **Equipe** · Convidar/Inativar | — | — | — |
| **Funções** · Criar/Editar ⚡ | — | — | — |
| **Organização** · Editar dados básicos | — | — | — |

#### Cenário 24.11 — `access_expires_at` em convites externos ⭐

> 📌 **F1.2 fix · cluster RC2:** conceito de `due_date` só existia pra Playbooker interno. Externos (contador, dev, auditor) ficavam com acesso perpétuo até alguém revogar.

**Dado** que o Admin cria um convite (Cenário 9 expandido),
**Então** novo campo **"Acesso até"** aparece com dropdown:
- 30 dias
- 90 dias (default pra `org-integrator`)
- 6 meses (default pra `org-auditor-externo`)
- 1 ano
- 2 anos (máx pra `org-auditor-externo`)
- Indefinido (default pra funções internas Admin/Manager/Operator/Analyst/Viewer/DPO/Financeiro)

**E** schema: `invitation.access_expires_at` (DATETIME) + `membership.access_expires_at` (herdado),

**E** scheduler diário (`access_expiration_scheduler`, timezone `America/Sao_Paulo`) marca `membership.status = INACTIVE` quando `access_expires_at < now()` + dispara evento `membership.auto_expired`,

**E** e-mail de aviso pro Admin em **D-7 e D-1** antes da expiração: *"O acesso de Carlos Tavares (TPF Contábil · org-financeiro) expira em 7 dias (28/05/2026). Deseja renovar?"* com CTA `[Renovar 90 dias]` `[Confirmar desligamento]`,

**E** audit do cliente registra: `membership.expired` (visível) com `previous_status` + `expires_at` + ator do convite original.

#### Cenário 24.12 — Scheduler de desligamento do Playbooker (atualiza Cenário 24.5) ⭐

> 📌 **F1.3 fix · cluster RC2:** Cenário 24.5 dizia "desligamento automático na due_date" sem mecanismo. Implementação real spec'ada aqui.

**Dado** que a `due_date` do Playbooker chegou,
**Quando** o EventBridge scheduler (`playbooker_revocation_scheduler`, intervalo 60min, timezone `America/Sao_Paulo`) executa,
**Então:**
- Filtra `playbooker_assignment WHERE due_date <= now() AND status = 'ACTIVE'`
- Marca cada um como `revoked` com `revoked_at = now()` e `revoked_reason = 'auto_expired_at_due_date'`
- Revoga membership na org cliente
- Dispara evento canônico `playbooker.unassigned` (consumido por feature de Notificações)
- Atraso tolerável: ≤ 60 min (próxima execução do scheduler)

**E** notificação proativa pro AM responsável em **D-7 / D-3 / D-1**: *"Implantação na Saraiva Livros termina em 7 dias (30/04/2026). Confirma entrega ou solicita extensão?"* com CTA `[Confirmar entrega]` `[Solicitar extensão de N dias]`,

**E** **re-atribuição pós-due_date requer opt-in do cliente** — Admin do cliente recebe notificação *"AM Bruno Costa solicita re-atribuição do Playbooker Lucas Almeida por mais 7 dias. Motivo: 'demonstração comercial pra prospect Pereira'. Aceitar?"*. Sem aceite explícito do cliente, bloqueia.

#### Cenário 24.13 — Cobertura temporária de AM (`am.coverage_assigned`) ⭐

> 📌 **F1.3 fix · cluster RC2:** AM Bruno saiu de férias 18/05-03/06. Hoje, único caminho é reatribuir definitivamente as 50 orgs pra Ana (substituta), o que polui o audit do cliente.

**Dado** que o AM titular vai se ausentar temporariamente,
**Quando** ele (ou seu manager) marca "Férias / Licença / Substituição" via `adm.awsales › Meu Perfil › Cobertura`,
**Então** preenche: data início + data fim + AM substituto (dropdown filtrado por @awsales.io ativos),

**E** o sistema cria **eventos `am.coverage_assigned`** (distinto de `account_manager_changed`) para **todas as orgs da carteira do titular** com `coverage_starts_at` + `coverage_ends_at` + `coverage_reason` + `substitute_user_id`,

**E** o substituto recebe notificações da carteira do titular durante o período,

**E** dashboard "Minha Carteira" do substituto mostra **2 seções**: "Carteira própria (N orgs)" + "Cobertura temporária (M orgs, até DD/MM)",

**E** cache RBAC tem **TTL ≤ 60s** (em vez de "próxima sessão") — quando titular retorna, acessos do substituto se encerram em ≤ 1 minuto,

**E** audit do cliente: `am.coverage_started` + `am.coverage_ended` visíveis (cliente sabe que AM substituto agiu durante X período).

#### Cenário 24.14 — Workflow de aprovação (`approval_request` + inbox + 4-eyes) ⭐

> 📌 **F1.4 fix · cluster RC3:** permissões `campaign:approve` e `agent:publish` estavam listadas sem feature subjacente (sem inbox, sem SLA, sem 4-eyes financeiro).

**Dado** que a org configurou `campaign_requires_approval = true` (config em Configurações Gerais),
**Quando** alguém com `campaign:write` cria/edita uma campanha,
**Então** o sistema cria automaticamente um `approval_request` com:
- `entity_type = 'campaign'`
- `entity_id`
- `submitted_by` + `submitted_at`
- `assignee` = lista de users com `campaign:approve` na org
- `sla_deadline = submitted_at + 3 business days`
- `status = 'PENDING'`

**E** lifecycle: `PENDING → APPROVED / REJECTED / EXPIRED` (auto após SLA).

**E** **Inbox "Pendências de aprovação"** em Studio › Configurações › Pendências:
- Lista approval_requests pendentes ordenadas por urgência (`sla_deadline` ascendente)
- Filtros: tipo (campanha/agente) · submitter · prazo
- Cada item: botões `[Aprovar]` `[Rejeitar com motivo]` `[Ver detalhes →]`
- Audit registra: `approval.approved` / `approval.rejected` com aprovador + motivo

**E threshold financeiro (4-eyes SOX-like):** se `campaign.estimated_value > org.config.approval_threshold` (default R$ 50k):
- Exige **2 aprovações** (Manager + Financeiro) — cada aprovação cria um `approval_signature`
- Campanha só dispara quando `approval_request.signatures.count >= 2 AND distinct_roles`

**E** notificações D-2 / D-1 / D-0 pro aprovador via Notificações canal,

**E** mesmo padrão se aplica a `agent:publish` em orgs com `agent_requires_approval = true` (vertical regulada como Hospital Care).

#### Cenário 24.15 — Tela cliente-facing "Acessos AwSales na minha organização" ⭐

> 📌 **F1.5 fix · cluster RC4:** Cenário 24.6 prometia "toda ação interna aparece no audit trail" mas não havia tela onde o cliente VER isso. ~540 incursões cross-org sem trilha cliente-visível em 18 meses no estimado do stress test.

**Dado** que o usuário com permissão `Privacy · Visualizar logs de auditoria` (default: Admin + DPO + Auditor Externo) acessa Studio › Configurações › Segurança,
**Quando** clica em **"Acessos AwSales na minha organização"**,
**Então** abre tela com lista cronológica de **todas as incursões internas** na org com colunas:
- Timestamp
- Função do interno (Super Admin / AM / Playbooker / Suporte L2 / Eng. On-call)
- Nome + e-mail do interno
- **Granularidade da ação**: "Acessou módulo Conversas" vs "Leu CPF de Maria Silva (lead_id #1234)" vs "Editou prompt do agente Vendas-WhatsApp"
- Tipo: leitura · escrita · admin-api
- Justificativa estruturada (categoria + ticket/processo + descrição — capturado em F1.7)
- Canal de instrução do cliente (se aplicável)

**E** filtros: período, função do interno, tipo (leitura/escrita), criticidade,

**E** export CSV com mesma cadeia de custódia da Story 3 Cenário 16 (modal LGPD + hash SHA-256 + finalidade obrigatória — F2.6),

**E** **botão "Questionar este acesso"** em cada linha — abre DSR formal (LGPD Art. 18) com ticket pro DPO AwSales + obrigação de resposta em 15 dias,

**E** retenção: **20+ anos** (não os 5 anos padrão LGPD — matriz contratual + judicial pra ações de internos AwSales).

#### Cenário 24.16 — Audit WORM + admin-api propaga pro audit do tenant ⭐

> 📌 **F1.6 fix · cluster RC4:** logs editáveis pelo Super Admin quebram ISO 27001 A.12.4.2. Admin-api podia bypassar audit do tenant (operações sem UI não propagavam).

**Dado** que toda escrita no audit trail acontece via storage WORM (write-once-read-many),
**Então:**
- Tecnologia: DynamoDB com `attribute_not_exists(eventId)` condition expression OU S3 Object Lock OU Aurora com triggers `BEFORE UPDATE/DELETE` que rejeitam
- Nenhum role (nem Super Admin) tem permissão de `UPDATE` / `DELETE` na tabela de audit
- Tentativa de modificação retorna erro + dispara alerta interno P1

**E** middleware `tenantAuditPropagation` no admin-api:
- Para cada rota que toca dados de org X, automaticamente publica evento no audit da org X via SQS
- Header `x-acting-org-id` obrigatório em requests admin-api que afetam org cliente
- Sem header → request rejeitada (HTTP 400)

**E** **reads cross-org também geram audit** quando interno entra em org alheia:
- Granularidade: módulo acessado + objeto lido (ID) + campos sensíveis lidos
- Exemplo: `actor.role = 'support_l2'` + `action = 'pii.read'` + `target = 'lead_id:1234'` + `fields = ['cpf', 'email']`

**E hash chain entre eventos consecutivos:** cada evento N tem `prev_event_hash = SHA-256(event[N-1])` — auditor externo (ou ANPD) valida cadeia ininterrupta. Quebra na chain dispara alerta automático.

#### Cenário 24.17 — Justificativa obrigatória pro Super Admin (paridade com AM) ⭐

> 📌 **F1.7 fix · cluster RC7:** AM tinha motivo obrigatório no toggle cross-carteira (Cenário 24.4); Super Admin não tinha freio análogo. Inversão clássica: quem pode mais é menos auditado.

**Dado** que o Super Admin tenta agir numa org cliente,
**Quando** clica em qualquer ação que toca dados do cliente,
**Então** modal de justificativa abre com campos **obrigatórios**:
- **Categoria** (dropdown estruturado — não texto livre):
  - Incidente técnico
  - Solicitação do controlador (cliente pediu)
  - Investigação interna
  - Treinamento / onboarding de novo interno
  - Migração / manutenção
  - Outro (requer descrição extra)
- **Ticket/processo** (obrigatório se categoria = "Solicitação do controlador"):
  - `whatsapp:CEO-magalu-2026-05-19T14:30` (formato canal:identificador:timestamp)
  - `linear:AWPROD-1234`
  - `e-mail:msg-id-xxx@awsales.io`
  - `slack:thread-link-xxx`
- **Descrição** (texto livre, mínimo 200 caracteres)

**E** sem justificativa preenchida → ação bloqueada com modal *"Justificativa obrigatória para acesso cross-org. LGPD Art. 39: operador segue instruções documentadas do controlador."*,

**E** justificativa anexada ao evento de audit e visível na tela cliente-facing F1.5,

**E** **paridade com toggle cross-carteira do AM** (Cenário 24.4): refina pra usar mesmas categorias estruturadas em vez de texto livre.

#### Cenário 24.18 — Modal ⚡ com nome da org + dupla confirmação ⭐

> 📌 **F1.8 fix · cluster RC6:** disparo cross-org acidental documentado (Larissa da Agência Mistura — R$ 1.840 + 312 opt-outs). Modal ⚡ não exibia qual org seria afetada.

**Dado** que o usuário clica em qualquer ação marcada ⚡ (disparar campanha · publicar agente · trocar cartão · conectar provedor · etc — ver Cenário 24.1),
**Quando** o modal abre,
**Então** **no header do modal**:
- Nome da org em fonte ≥ 18pt + **cor primária da org** (org color tag — F2.4)
- Logo da org
- Tipo de ação ("Disparar campanha 'Black Friday Lead' pra 50 leads")
- Resumo de impacto ("R$ 1.840 estimado + consome 1 voucher")

**E** **dupla confirmação:**
- Primeiro: checkbox `[ ] Confirmo que estou na organização Phoenix Tech` (não pré-marcado)
- Segundo: botão `[Disparar agora]` só fica ativo após checkbox marcado
- Cancel `[Voltar]` disponível em qualquer momento

**E** ação registrada no audit com `confirmacao_dupla.checkbox_at` + `confirmacao_dupla.confirm_at` + delay entre eles (analytics pra detectar "ainda no piloto automático"),

**E** marcação ⚡ aplicada também ao `agent:edit_prompt` (Cenário 24.1) — endereça cross-contaminação de prompts entre orgs (Larissa).

#### Cenário 24.19 — `agent_owner_id` e ownership de campanha ⭐

> 📌 **F1.9 fix · cluster RC5:** matriz dizia "Editar prompts (próprios)" pra Operator mas não definia ownership. SDR Mariana editaria prompt de agente criado pelo Admin? Indefinido.

**Dado** que cada agente e campanha tem ownership explícito,
**Então** schema:
- `agent.owner_id` (UUID, FK user) — pode mudar via ação Admin
- `agent.created_by` (UUID, FK user, imutável)
- `agent.team_id` (UUID, FK team, nullable — quando ownership é coletivo)
- Idem `campaign.owner_id` + `campaign.created_by` + `campaign.team_id`

**E** permissões com "próprios" no nome têm gate específico:
- `agent:edit_prompt` (Operator) gate = `agent.owner_id == current_user.id OR agent.team_id IN current_user.teams`
- `dispatch:schedule` (Operator) gate = `campaign.owner_id == current_user.id OR campaign.team_id IN current_user.teams`
- Manager / Admin não têm restrição de ownership (overridem)

**E** tela "Meus agentes" / "Minhas campanhas" filtra por ownership ou time,

**E** **transferência de ownership** é ação de Admin documentada no audit como `agent.ownership_transferred` (de X pra Y por motivo Z).

#### Cenário 24.20 — Offboarding de funcionário interno + pseudonimização no audit do cliente ⭐

> 📌 **F2.8 fix · cluster RC2 — antecipado pra Onda 1:** Lucas Playbooker demitido em 25/05 aparece com nome real no audit do cliente Saraiva pra sempre. Direito do ex-empregado (LGPD aplicável).

**Dado** que um funcionário interno AwSales é desligado (offboarding HR),
**Quando** o evento `internal_user.offboarded` é registrado com `offboarded_at`,
**Então** scheduler diário (`internal_offboarding_anonymization_scheduler`) verifica após **30 dias**:
- Atualiza retroativamente o audit do cliente substituindo `actor.name` por `AwSales · {função} · ex-funcionário (pseudo: hash_{8chars})`
- Hash original preservado em **cofre interno** (acessível só via ordem judicial, LGPD Art. 16 retenção legal)
- `actor.email` real → `ex-{hash}@anonymized.local`

**E** o **hash SHA-256 da linha do audit permanece imutável** (chain do Cenário 24.16) — o que muda é o conteúdo dos campos PII, não a linha inteira,

**E** novo evento canônico `audit.internal_offboarding_anonymization_applied` registra `n_records_affected` + `authorized_by_dpo`,

**E** acessos do ex-funcionário em qualquer org cliente são automaticamente revogados em **D+0 do offboarding** (não D+30 — anonimização é cosmética; revogação é imediata).

---

### 4.9 Gerente da Conta

#### Cenário 31 — Gerente da Conta no topo da aba Team

**Dado** que o admin AwSales atribuiu um Gerente da Conta pela admin interna,
**Quando** o cliente abre a aba Team,
**Então** a seção destacada no topo exibe nome + e-mail + foto desse Gerente,
**E** o cliente **não pode alterar** essa atribuição (somente AwSales via admin),
**E** se nenhum Gerente foi atribuído ainda, a seção fica **oculta ou exibe estado vazio** ("Aguardando atribuição pela AwSales").

#### Cenário 32 — Apenas 1 Gerente da Conta por org

**Dado** que cada org tem **no máximo 1** Gerente da Conta,
**Quando** o admin AwSales altera o Gerente,
**Então** o anterior é substituído (não acumula).

### 4.10 Segurança da Organização (nova aba)

> 📌 **Escopo:** quarta aba de "Configurações da Organização" cobrindo políticas de segurança e visão consolidada do audit trail org-wide. Acesso gated por permissão "Segurança" (nova permissão da função).

#### Cenário 33 — Aba Segurança: visão geral

**Dado** que o usuário com permissão `Segurança · Visualizar` acessa `Configurações → Segurança`,
**Quando** a aba carrega,
**Então** exibe 3 blocos verticais:
- **2FA Obrigatório:** status atual (`PENDING` / `OFF` / `ON`) + texto explicativo + contador "N usuários sem 2FA configurado"
- **Política de Senha:** rotação obrigatória (default 90d enterprise / sem expiração SMB — configurável; histórico das últimas 5 senhas não-reutilizáveis)
- **Audit Trail Geral:** link "Ver audit trail completo da organização →" + preview com últimos 5 eventos

#### Cenário 33.1 — Banner de pendência da política de 2FA

> 📌 **Feedback PG 2026-05-12:** a tela "Política de segurança da sua organização" saiu do primeiro login. A definição aparece como pendência em Configurações.

**Dado** que a organização foi criada com `require_2fa_policy_status = PENDING`,
**Quando** qualquer usuário com acesso a Configurações entra nas configurações da organização,
**Então** o sistema exibe banner no topo:
*"Pendência de segurança da organização — Defina se a autenticação em 2 fatores será obrigatória para todos os membros."*,
**E** o banner tem CTA "Definir agora" levando para `Configurações → Segurança`,
**E** na aba Segurança o bloco de 2FA mostra status **Ainda não definido**,
**E** o usuário com permissão `Segurança · Editar` pode escolher entre:
- **Manter opcional** — remove a pendência e registra `require_2fa = OFF`;
- **Obrigar 2FA para todos** — remove a pendência e registra `require_2fa = ON`;
**E** a escolha é registrada no audit trail org-wide.

#### Cenário 34 — Toggle 2FA Obrigatório (referencia Story 1 Cenário 9.1)

**Dado** que a flag `2FA obrigatório` está OFF e há N sessões ativas e M usuários sem TOTP,
**Quando** usuário com permissão `Segurança · Editar` ativa o toggle,
**Então** o sistema exibe modal de confirmação: *"Vai derrubar N sessões ativas. M usuários sem 2FA configurado serão obrigados a configurar no próximo acesso. Continuar?"*,
**E** ao confirmar, **derruba todas as sessões ativas + força configuração de TOTP no próximo login** (mesma mecânica da Story 1 Cenário 9.1),
**E** evento registrado no audit trail org-wide com contexto completo (N sessões, M usuários).

#### Cenário 35 — Audit Trail Geral da Org: visão e filtros

**Dado** que o usuário com permissão `Segurança · Audit Trail · Visualizar` acessa "Ver audit trail completo da organização",
**Quando** a tela carrega,
**Então** exibe **tabela com todos os eventos da org** (cross-user), ordenação cronológica reversa por default,
**E** cada linha contém: Timestamp · Usuário (executor) · Ação · Recurso afetado · Origem (IP/UA — sujeitos a mascaramento PII se função não permite),
**E** filtros disponíveis no topo:
- **Período** (24h / 7d / 30d / 90d / customizado)
- **Usuário** (multi-select com autocomplete)
- **Feature/Domínio** (Agentes, Bases, Conversas, Disparos, Configurações, Segurança, etc.)
- **Tipo de ação** (Login, Falha de login, Mudança de senha, Criação, Edição, Exclusão, Exportação, etc.)
- **Busca livre** por nome do recurso afetado
**E** paginação por scroll infinito (50 eventos iniciais).

#### Cenário 36 — Export CSV do Audit Trail Geral (LGPD compliance)

**Dado** que o usuário aplica filtros e clica em `[📥 Exportar CSV]`,
**Quando** o export é solicitado,
**Então** o sistema:
- Exibe **modal LGPD obrigatório**: *"Este export contém dados pessoais sob a LGPD. Você é responsável pelo manuseio e descarte adequado. ☐ Estou ciente."*
- Se export estimado < 1000 linhas → gera síncrono (download imediato)
- Se export ≥ 1000 linhas → gera **assíncrono** com tela de progresso ("Seu export está sendo gerado · você será notificado quando estiver pronto") + notificação in-app + e-mail quando pronto + tela "Meus Exports" pra rebaixar dentro da janela de 24h
- Gera **hash SHA-256 do CSV** e exibe junto ao link de download pra integridade probatória
- CSV inclui **colunas obrigatórias**: `event_id`, `timestamp_iso`, `organization_id`, `organization_name`, `user_id`, `user_email`, `action`, `target_type`, `target_id`, `target_name`, `ip`, `user_agent`, `metadata_json`
**E** o próprio ato de exportar é **meta-auditado** (Cenário 37).

#### Cenário 37 — Meta-Audit: exportação é evento auditável

**Dado** que usuário exporta audit trail,
**Quando** o export é concluído com sucesso,
**Então** o sistema registra **automaticamente** no próprio audit trail org-wide o evento:
- Ação: `audit_trail.exported`
- Executor: usuário que clicou
- Metadata: filtros aplicados (período, usuários, features, busca), volume de linhas exportadas, hash SHA-256 do CSV
**E** esse meta-evento aparece nas próximas listagens — visível pra outros admins que possam querer auditar quem está acessando dados sensíveis.

#### Cenário 38 — PII Filtering: permissão separada que controla visualização de dados pessoais

> 📌 **Conformidade LGPD/BACEN:** Admin com escrita NÃO automaticamente vê PII. Permissão de PII é separada e pode ser dada só pra papéis de Compliance/DPO/RH.

**Dado** que a função "Administrador" não tem a permissão `Usuários · Visualizar PII`,
**Quando** o admin abre modal "Visualizar usuário" (Cenário 16) ou exporta audit trail,
**Então** os campos sensíveis são **mascarados** automaticamente:
- E-mail: `f***e@empresa.com` (3 primeiros + 1 último)
- Telefone: `+55 (**) ****-0000`
- IPs no audit trail: `200.4.*.*`
- User-agent: visível normal (não é PII)
**E** os campos não-sensíveis (nome, foto, função, data de criação, ação, recurso) ficam visíveis normalmente,
**E** o CSV exportado também aplica mascaramento por linha — colunas de PII vêm mascaradas se executor não tem a permissão.

#### Cenário 39 — Função custom DPO sem ser Admin

**Dado** que o admin quer criar função "DPO" com acesso a dados pessoais sem permissão de escrita,
**Quando** vai em `Funções → + Criar nova função`,
**Então** seleciona:
- `Usuários · Visualizar` (lista de membros)
- `Usuários · Visualizar PII` (dados pessoais sem máscara)
- `Segurança · Audit Trail · Visualizar` (audit trail completo)
- `Segurança · Audit Trail · Exportar` (export CSV)
**E** NÃO seleciona nenhuma permissão de escrita em outros domínios,
**E** ao atribuir essa função a um usuário, ele vê PII desmascarado MAS não pode editar nada,
**E** Admin sem `Visualizar PII` continua vendo dados mascarados — segregação de funções respeitada (BACEN compatível).

#### Cenário 40 — Retenção do Audit Trail: 5 anos (LGPD)

**Dado** que eventos do audit trail são gerados continuamente,
**Quando** sistema aplica política de retenção,
**Então:**
- Eventos ficam **disponíveis na UI e exportação por 5 anos** a partir da data do evento
- Eventos com mais de 5 anos podem ser **arquivados em storage frio** (acessível sob demanda via ticket com AwSales)
- Eventos com mais de 10 anos são **removidos definitivamente** (conforme política LGPD de minimização)
- Cliente recebe aviso 30 dias antes de qualquer arquivamento/remoção em massa.

#### Cenário 41 — Audit Trail Pessoal Cross-Org (LGPD Data Subject Request)

> 📌 **Conformidade LGPD:** todo titular de dados tem direito a acessar dados pessoais armazenados sobre ele. Cross-org é obrigatório.

**Dado** que o usuário Ricardo (CFO multi-org em 5 orgs Vitru) acessa "Meu Perfil → Minhas ações em todas as organizações",
**Quando** a tela carrega,
**Então** o sistema agrega eventos do audit trail de **todas as orgs** onde Ricardo está como usuário ativo ou inativo (mesmo `user_id` global),
**E** mostra mesma estrutura do audit trail org-wide (filtros: período, org, feature, tipo) com coluna extra **Organização**,
**E** permite exportação CSV consolidada com coluna `organization_id` + `organization_name`,
**E** o export passa pelos mesmos controles LGPD (modal de ciência, hash SHA-256, meta-audit),
**E** essa funcionalidade existe **independente da permissão `Audit Trail · Visualizar`** — todo titular pode acessar SEUS PRÓPRIOS dados, mas só os próprios (não vê audit trail de outros usuários da org).

#### Cenário 42 — Audit Trail Inline em features (escopo de outras stories)

> 📌 **Nota de escopo:** cada tela de feature do produto (Agentes, Bases de Conhecimento, Conversas, Integrações, Disparos, etc.) terá audit trail inline mostrando "quem fez o quê **neste recurso**". Isso é escopo das **stories de cada feature**, não desta — mas todas consomem do **mesmo backend** que alimenta o audit trail geral e por usuário desta story.

**Dado** que toda story de feature do produto vai precisar implementar audit trail inline,
**Quando** uma story de feature for desenvolvida,
**Então** ela deve:
- Reusar o backend do audit trail definido nesta story (S4)
- Aplicar mesmas regras de PII filtering (Cenário 38)
- Aplicar mesmas regras de retenção (Cenário 40)
- Registrar eventos no formato canônico (`event_id`, `timestamp_iso`, `org_id`, `user_id`, `action`, `target_type`, `target_id`, etc.)

Essa story (S4 — Segurança + Audit Trail) é a **fundação técnica** pra que features futuras tenham audit consistente.

---

## 5. Definição de Pronto (DoD) para QA

- [ ] Configurações gerais: visualização de todos os campos readonly + edição funcional do logo (PNG/JPG/SVG, 2MB, 200×200).
- [ ] Logo propaga em ≤ 1 min pra todas as telas que mostram a org.
- [ ] Botão "Algo está errado?" exibe modal informativo (sem ação backend) com contato do Gerente da Conta (se atribuído).
- [ ] Perfil próprio: usuário edita foto, nome, telefone, idioma, fuso, senha (se login local). Não edita e-mail, função, data de criação.
- [ ] Lista de Team: busca por nome/e-mail funcional, filtro por função funcional, ordenação alfabética default.
- [ ] Status na lista: Ativo / Inativo / Convite enviado / Convite expirado — visualmente distintos.
- [ ] Convite: chips de e-mail com limite 20, 1 função aplicada a todos do batch.
- [ ] Reenvio e cancelamento de convite funcionando — link antigo invalidado.
- [ ] Mudança de função num convite pendente exige cancelar + reenviar (UX clara).
- [ ] E-mail já membro da mesma org → bloqueio com aviso, outros do batch seguem.
- [ ] Multi-org com mesmo e-mail funciona — seletor de organização disponível.
- [ ] Convidado completa fluxo de 1º acesso de membro (reaproveita story de 1º acesso, sem pagamento/revisão).
- [ ] Modal de visualizar usuário mostra dados + permissões agrupadas + audit trail completo.
- [ ] Audit trail filtra por período, tipo de ação, palavra-chave.
- [ ] Audit trail paginado e exportável em CSV.
- [ ] Edição de função muda imediatamente; evento registrado no audit trail do alvo e do executor.
- [ ] Inativação preserva histórico, derruba só no próximo login, menu vira "Reativar".
- [ ] Último Administrador ativo não pode ser inativado.
- [ ] Funções padrão são read-only; funções custom podem ser criadas (sem duplicação de existente), editadas e deletadas.
- [ ] Deletar função custom com usuários → bloqueio com link pros usuários afetados.
- [ ] Sem limite de membros nem de funções customizadas.
- [ ] Isolamento multi-tenant de funções validado.
- [ ] Gerente da Conta exibido no topo se atribuído; oculto/estado vazio caso contrário.
- [ ] Permissões dinâmicas: o que cada usuário vê e pode fazer depende exclusivamente da função atribuída.
- [ ] Observabilidade: cada ação relevante (convidar, editar função, inativar, criar/editar/deletar função) gera log estruturado + entrada no audit trail.

**Segurança + Audit Trail Geral + LGPD (S4):**
- [ ] Aba "Segurança" implementada com 3 blocos (2FA Obrigatório · Política de Senha · Audit Trail Geral).
- [ ] Banner de pendência da política de 2FA aparece em Configurações enquanto `require_2fa_policy_status = PENDING` e some após a definição.
- [ ] Política de 2FA não é definida no primeiro login; responsável cai direto do termo de uso para convite de equipe.
- [ ] Toggle 2FA Obrigatório: ON exibe modal "vai derrubar N sessões + M sem 2FA", derruba imediatamente, força configuração no próximo acesso.
- [ ] Política de senha configurável (rotação 90d enterprise / sem expiração SMB; histórico 5 senhas).
- [ ] Audit Trail Geral exibe tabela cross-user com filtros (período, usuário, feature/domínio, tipo de ação, busca).
- [ ] Paginação por scroll infinito (50 iniciais).
- [ ] Export CSV pequeno (<1000 linhas) síncrono; grande (≥1000) assíncrono com notificação + tela "Meus Exports".
- [ ] Modal LGPD obrigatório antes de exportar ("contém dados pessoais sob LGPD").
- [ ] CSV inclui colunas `event_id`, `timestamp_iso`, `organization_id`, `organization_name`, `user_id`, `user_email`, `action`, `target_type`, `target_id`, `target_name`, `ip`, `user_agent`, `metadata_json`.
- [ ] Hash SHA-256 do CSV exibido junto ao link de download.
- [ ] Meta-audit: export gera evento `audit_trail.exported` automaticamente no audit trail.
- [ ] Permissão `Usuários · Visualizar PII` separada de `Usuários · Visualizar` (PII mascarado se não tem).
- [ ] Mascaramento aplica em: e-mail (`f***e@empresa.com`), telefone (`+55 (**) ****-0000`), IPs do audit trail (`200.4.*.*`).
- [ ] Mascaramento aplica em UI (modal Visualizar usuário, audit trail) e em CSV exportado.
- [ ] Retenção de audit trail: 5 anos disponível na UI/export; 5-10 anos em storage frio sob demanda; >10 anos remoção definitiva com aviso 30d.
- [ ] "Meu Perfil → Minhas ações em todas as organizações": agregação cross-org de audit trail pessoal pra atender LGPD data subject request.
- [ ] Export cross-org pessoal segue mesmos controles LGPD (modal, hash, meta-audit).
- [ ] Função custom DPO testada: pode ver PII desmascarado e exportar audit trail sem ter permissões de escrita em outros domínios.
- [ ] Backend de audit trail é fundação técnica reusada por stories futuras de features (eventos no formato canônico).

---

## 6. Cenários de Teste Obrigatórios (QA — BDD de Quebra)

### Q1: Convite duplicado em lote

**Dado** que o admin coloca o mesmo e-mail duas vezes no batch de 20,
**Quando** envia,
**Então** o sistema deduplica antes de enviar (manda 1 convite só).

### Q2: Inativar próprio usuário sendo único Admin

**Dado** que o admin tenta se autoinativar e é o único Administrador,
**Quando** clica em inativar,
**Então** sistema bloqueia (cenário 22), nenhuma alteração ocorre.

### Q3: Mudar função do último admin pra função sem permissão de admin

**Dado** que existe apenas 1 Administrador,
**Quando** alguém tenta trocar a função dele pra "Analista Pleno",
**Então** sistema bloqueia *"Atribua a função de Administrador a outro membro antes."*.

### Q4: Função custom deletada enquanto usuário está logado

**Dado** que um usuário com função "X" está logado,
**Quando** a função "X" é deletada (após reatribuição dos usuários),
**Então** se ainda houver sessão ativa do antigo usuário com função X (no janela curta entre reatribuição e delete), o próximo request retorna 403 com mensagem clara.

### Q5: Convite pra e-mail malformado no chip

**Dado** que o admin digita um e-mail inválido,
**Quando** pressiona Enter,
**Então** o chip não é criado e o input exibe erro inline.

### Q6: Edição simultânea da mesma função custom

**Dado** que 2 admins editam a mesma função custom ao mesmo tempo,
**Quando** ambos salvam,
**Então** o sistema aplica **last-write-wins** com aviso ao perdedor *"Esta função foi atualizada por {nome} em {timestamp}. Recarregue e tente novamente."*.

### Q7: Audit trail de usuário com 100k eventos

**Dado** que um usuário antigo tem histórico extenso,
**Quando** o admin abre a aba de audit trail,
**Então** carrega apenas a primeira página (ex: 50 eventos) em ≤ 1s,
**E** paginação carrega blocos sob demanda.

### Q8: Exportar audit trail muito grande em CSV

**Dado** que o admin filtra audit trail com >10k linhas,
**Quando** clica em "Exportar CSV",
**Então** o sistema gera o CSV de forma assíncrona (não trava UI) e notifica quando pronto,
**E** disponibiliza download por janela limitada (ex: 24h).

### Q9: Logo com formato inválido

**Dado** que o admin tenta subir um GIF / WebP / arquivo >2MB,
**Quando** seleciona o arquivo,
**Então** o sistema bloqueia client-side com mensagem clara,
**E** mesmo se passar pelo client, o backend valida e rejeita.

### Q10: Convite expirado tentado pelo convidado

**Dado** que o link de convite passou de 7 dias,
**Quando** o convidado clica,
**Então** exibe tela *"Convite expirado. Entre em contato com sua organização."* (igual ao padrão da story de 1º acesso),
**E** o admin pode reenviar pelo menu (...).

### Q11: Reenviar convite invalida link anterior em uso

**Dado** que o convidado abriu o link antigo numa aba mas ainda não completou,
**Quando** o admin reenvia o convite,
**Então** ao tentar finalizar pela aba antiga, o convidado recebe *"Convite invalidado. Verifique seu e-mail pra novo link."*.

### Q12: Permissão removida da função enquanto usuário usa o recurso

**Dado** que o admin remove a permissão "Editar Agentes" da função "Analista Sênior",
**Quando** um analista sênior estava editando um agente naquele momento,
**Então** ao salvar, recebe 403 com mensagem *"Você não tem mais permissão pra editar este recurso."*.

### Q13: Audit trail registra a si mesmo

**Dado** que o admin executa qualquer ação auditável,
**Quando** a ação é gravada,
**Então** o evento aparece no audit trail do **alvo** (se houver alvo distinto) e do **executor** (própria timeline),
**E** os campos "executor" e "alvo" são claramente distinguidos.

### Q14: Multi-org seletor

**Dado** que o usuário tem acesso a 3 orgs,
**Quando** troca de org pelo seletor,
**Então** a sessão muda de contexto sem precisar deslogar,
**E** funções e permissões atualizam pra função dele na nova org.

### Q15: Nome de função custom duplicado

**Dado** que existe função "Auditor Externo",
**Quando** o admin tenta criar outra com mesmo nome,
**Então** sistema bloqueia com *"Já existe uma função com este nome."*.

### Q16: PII mascarado tentativa de burla via API

**Dado** que usuário não tem `Usuários · Visualizar PII`,
**Quando** tenta acessar dados pelo endpoint direto (não-UI),
**Então** o backend aplica o mesmo mascaramento server-side (defesa em profundidade — não confia só na UI),
**E** retorna `403 Forbidden` se o campo é solicitado explicitamente sem permissão.

### Q17: Audit trail export com >100k linhas (limite máximo)

**Dado** que o filtro selecionado gera >100k linhas,
**Quando** usuário clica "Exportar CSV",
**Então** o sistema bloqueia com mensagem clara: *"Export muito grande (100k+ linhas). Aplique mais filtros (período menor, usuário específico, etc.) e tente novamente."*,
**E** sugere filtros automáticos pra reduzir o volume.

### Q18: 2FA toggle ligado por engano (recovery)

**Dado** que admin ligou 2FA obrigatório por engano e nenhum usuário tem TOTP configurado,
**Quando** o admin tenta desligar logo em seguida,
**Então** sistema permite desligar (Cenário 9.2 da Story 1),
**E** sessões derrubadas continuam derrubadas (não rollback automático — usuários precisam relogar mas sem TOTP forçado),
**E** evento de desativação registrado no audit trail.

### Q19: Cross-org audit trail pessoal com org cancelada

**Dado** que Ricardo tem audit trail em 5 orgs e 1 delas (Pitágoras) é cancelada/encerrada,
**Quando** Ricardo acessa "Minhas ações em todas as organizações",
**Então** eventos da org cancelada **aparecem** com label *"Pitágoras (Encerrada em DD/MM)"*,
**E** retenção de 5 anos vale igual mesmo após encerramento da org,
**E** export inclui org encerrada com flag `organization_status = 'encerrada'`.

---

## 7. Resultado Esperado e Métricas de Sucesso

**Métrica Principal:**
- **% de orgs ativas que gerenciam o próprio time sem abrir ticket com AM**
- **Baseline:** 0% (hoje tudo passa pelo AM)
- **Meta:** **80% em 60 dias** após o lançamento
- **Como medir:** comparar volume de convites/inativações via fluxo digital vs. tickets no AM por mês

**Métricas Secundárias:**
- **Tempo médio pra convidar um membro:** meta ≤ 30s (do clique em "Convidar" até envio)
- **Adoção de funções customizadas:** % de orgs que criam ao menos 1 função custom em 90 dias — sinaliza maturidade do RBAC
- **Uso do audit trail:** consultas/mês por org (sinaliza valor pra compliance) + exportações CSV/mês
- **Taxa de convites aceitos em 7 dias:** meta ≥ 85% (se cair, investigar copy do e-mail ou UX do link)
- **# de cliques no botão "Algo está errado?"** (Configurações gerais): se >5% das orgs/mês, problema sistêmico de cadastro inicial
- **Tempo médio pra criar uma função custom:** meta ≤ 3 min — sinal de usabilidade da tela

**Critério de Rollback / Investigação Urgente:**
Se em 30 dias:
- Taxa de convites aceitos < 50% **OU**
- Audit trail apresentar **inconsistência** (eventos faltando, dados errados) **OU**
- Vazamento entre orgs (função/membro de Org A aparecendo na Org B),
→ **pausar a feature de funções customizadas e audit trail**, voltar ao fluxo gerenciado pelo AM, abrir investigação imediata.

---

## Pendências de Confirmação com PG (atualizadas pós stress test)

1. **Edição de perfil próprio** — listei: foto, nome, telefone, idioma, fuso horário, senha. Falta algo (cargo? aniversário?) ou sobra algo (idioma/fuso podem vir depois)?
2. **Webhook/Streaming SIEM (F3.4)** — confirmado como **pós-MVP**. Sai em story futura "Enterprise SIEM Integration" quando primeiro cliente regulado pedir contratualmente.
3. **Permissão "Segurança" granular** — quebrei em sub-permissões (`Visualizar`, `Editar`, `Audit Trail · Visualizar`, `Audit Trail · Exportar`). Funciona ou prefere agrupar?
4. **Política de senha SMB vs Enterprise** — propus "sem expiração SMB / 90d enterprise" como default por porte da org. Ajusta no admin AwSales?
5. **Audit trail inline em features** — confirmado como escopo de cada story de feature (Agentes, Bases, etc.), consumindo do mesmo backend definido aqui (S4). Cenário 42 deixa isso explícito.

---

## Anexos e Referências

- **Story relacionada:** [stories/primeiro-login.md](stories/primeiro-login.md) — fluxo de 1º acesso é reusado pra membros convidados (sem pagamento).
- **Stack:** Greenfield (AWS-native). Sem detalhe técnico nesta story — produto-only.
- **IAM/WorkOS:** [docs/domain/iam/](../../apps/awsales-backend/docs/content/docs/domain/iam/) — referência pra autenticação, SSO e 2FA.
- **Mockups Figma:** pendente — Greg está aguardando essa story pra produzir layout final.

---

## Changelog

- **2026-05-12 (v3.4 — menu da conta no rodapé da sidebar + logout)** — Adicionados **Cenários 4.1, 4.2, 4.3** na seção 4.2 (Perfil do próprio usuário) cobrindo:
  - Dropdown no card de usuário do rodapé da sidebar com 4 itens (Meu perfil · Trocar organização · Configurações · Sair).
  - Fluxo de logout (confirmação + revogação WorkOS server-side + clear de cookies/session storage + audit `auth.logout` + redirect pra tela de acesso).
  - Comportamento multi-org: "Sair" desloga de **todas** as orgs vinculadas à conta; pra trocar de org sem deslogar usa "🔁 Trocar organização".
  - Protótipo: implementado em `assets/shell.js` (`wireUserMenu` + `logoutUser`) + `assets/shell.css` (estilos `.sidebar-user-menu` e `.user-menu-item.danger`).

- **2026-05-12 (v3.3 — Hardening Onda 1 do stress test 2026-05-12)** — Endereçados os **33 gaps P0** (8 clusters por root cause) identificados em [`stress-tests/funcoes/report.md`](stress-tests/funcoes/report.md). Nova seção **4.8.7 Hardening pós stress-test (Onda 1)** com 14 cenários novos (24.7-24.20):
  - **3 funções padrão novas no seed** (Cenários 24.7-24.9): `org-financeiro` (CFO/contador), `org-integrator` (dev/freelance), `org-auditor-externo` (auditor LGPD externo com TTL obrigatório). Total: **9 funções padrão tenant** (era 6).
  - **Cenário 24.10:** matriz de permissões expandida pras 9 funções.
  - **Cenário 24.11 (`access_expires_at`):** TTL em convites externos · scheduler diário · aviso D-7/D-1 · audit `membership.auto_expired`. Endereça RC2 (cluster temporalidade).
  - **Cenário 24.12 (scheduler Playbooker):** EventBridge scheduler 60min · timezone São Paulo · re-atribuição pós-due_date com opt-in do cliente. Endereça RC2.
  - **Cenário 24.13 (cobertura temporária AM):** evento `am.coverage_assigned` distinto de `account_manager_changed` · cache RBAC TTL ≤ 60s · audit visível. Endereça RC2.
  - **Cenário 24.14 (workflow de aprovação):** entidade `approval_request` · inbox de pendências · 4-eyes financeiro por threshold · SLA D-2/D-1/D-0. Endereça RC3.
  - **Cenário 24.15 (tela cliente-facing "Acessos AwSales na minha org"):** lista cronológica · granularidade leitura vs escrita · botão "Questionar este acesso" · retenção 20+ anos. Endereça RC4.
  - **Cenário 24.16 (audit WORM + admin-api propaga):** storage WORM · middleware `tenantAuditPropagation` · reads cross-org geram audit · hash chain entre eventos. Endereça RC4.
  - **Cenário 24.17 (justificativa obrigatória Super Admin):** paridade com AM · categorias estruturadas · captura de canal de instrução LGPD Art. 39. Endereça RC7.
  - **Cenário 24.18 (modal ⚡ com nome da org + dupla confirmação):** identificação visual + check obrigatório · `agent:edit_prompt` ganha marcação ⚡. Endereça RC6.
  - **Cenário 24.19 (`agent_owner_id` + ownership de campanha):** schema explícito · gate de "próprios" definido · transferência via Admin auditada. Endereça RC5.
  - **Cenário 24.20 (offboarding de funcionário interno):** pseudonimização retroativa no audit do cliente após 30 dias · revogação imediata D+0 · hash em cofre interno LGPD Art. 16. Endereça RC2/RC4.
  - Total de fixes Onda 1 aplicados: **9** (40 SP). Onda 2 (refino UX/workflow · 9 fixes · 34 SP) e Onda 3 (Story Enterprise Compliance Pack · pós-MVP) ficam no fix backlog ([`stress-tests/funcoes/scenarios-and-fixes/fix-backlog.md`](stress-tests/funcoes/scenarios-and-fixes/fix-backlog.md)) pra próximas iterações.

- **2026-05-11 (v1)** — Versão inicial após sessão de refinamento com PG, mockups das telas Team / Convidar / Visualizar / Funções, e respostas do interrogatório do PO.
- **2026-05-11 (v3)** — Refinamentos pós-revisão visual dos protótipos:
  - **Modal de convite com blocos** (Cenário 9 reescrito + Cenário 10 atualizado + novo Cenário 10.1): convite agora é agrupado em blocos por função (cada bloco com sua função + até 20 e-mails). Sem limite de blocos. Conflito de e-mail entre blocos com funções diferentes detectado e resolvido inline.
  - Wireframe W4 (modal Convidar) + HTML prototype alinhados com blocos.
  - Conexão com Story 1 Cenário 11 (convite de equipe no signup) — mesmo padrão de blocos aplicado.

- **2026-05-11 (v2 — pós stress test)** — Endereçados gaps P0 de compliance LGPD/SOC2 e multi-org do stress test:
  - **Nova aba "Segurança"** com seção 4.10 inteira (Cenários 33–42): toggle 2FA org-wide (referencia Story 1 9.1), política de senha (rotação + histórico), Audit Trail Geral org-wide com filtros (período, usuário, feature, tipo, busca), export CSV com modal LGPD obrigatório + hash SHA-256, meta-audit, retenção 5 anos.
  - **PII Filtering** como permissão separada (`Usuários · Visualizar PII`) — Admin sem essa permissão vê e-mail/telefone/IP mascarados. Aplica em UI e CSV exportado. Habilita modelo BACEN-compliant (DPO sem ser Admin).
  - **Audit Trail Pessoal Cross-Org** (Cenário 41) — todo usuário pode acessar suas próprias ações em todas as orgs (LGPD data subject request).
  - **Audit Trail Inline em features** (Cenário 42) — escopo declarado fora desta story; backend desta é fundação técnica reusada por stories de Agentes, Bases, Conversas, etc.
  - Estimativa subiu de 13 SP → **21 SP**; split em 4 sub-stories (S1 Config Gerais · S2 Team · S3 Funções+PII · S4 Segurança+Audit+LGPD).
  - Prioridade subiu de **P1 → P0** (compliance LGPD/SOC2 já é demanda contratual de clientes em pipeline).
  - DoD ampliado com 20 checks adicionais cobrindo Segurança/PII/LGPD.
  - 4 cenários de quebra adicionados (Q16 burla PII via API, Q17 export 100k+, Q18 toggle 2FA recovery, Q19 audit cross-org com org encerrada).
