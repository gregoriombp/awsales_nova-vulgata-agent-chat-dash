# Bombardier

Mapa operacional do Bombardier neste repo. Este arquivo é curto de propósito:
documentação antiga de Page Builder, Playground/quarentena e bridges LAN confundia
agentes e foi removida.

## Fontes de Verdade

- `AGENTS.md`: regras obrigatórias para agentes, componentes, tokens, stack e skills.
- `AWSALES_CONTEXT.md`: contexto de produto, vocabulário e módulos da AwSales/Aswork.
- `README.md`: como rodar o projeto e onde encontrar as superfícies principais.
- `/bombardier/styleguide`: fonte viva do design system renderizada no produto.

Se houver conflito, `AGENTS.md` vence este arquivo, skills e memória externa.

## Superfícies Atuais

| Superfície | Status | Uso |
|---|---|---|
| `/bombardier/styleguide` | ativo | Foundations, tokens, componentes `Aw*`, padrões e UX flows. |
| `/bombardier/styleguide/ux-flows` | ativo | Fluxos navegáveis mantidos no repo. |
| `/bombardier/styleguide/review` | ativo | Inbox dos comentários do Review Mode. |
| `/bombardier/projects` | ativo | Workbench para projetos/telas importados e build requests. |
| Review Mode overlay | ativo | Comentários visuais com pin/free-draw, ligados pelo Bombardier Dot ou `Cmd+Shift+Y`. |

## Removido ou Histórico

Estas superfícies não são caminho operacional neste repo:

- `bridge/` na porta `9876`.
- `bridge-edit/`.
- `/bombardier/page-builder`.
- `/bombardier/styleguide/components/playground`.
- Quarentena `components/playground/` para componentes de IA.

Não recrie essas estruturas sem pedido explícito. O produto `/app/playground` é uma
rota de produto separada e não significa Playground do design system.

## Bridges Atuais

### Review Bridge

`npm run dev` prepara o token, sincroniza `.env.local` com `review-bridge/.env`,
sobe o Next em `127.0.0.1:3000` e mantém o Review Bridge em
`127.0.0.1:9878`.

O Review Bridge é uma fila local para agentes resolverem comentários. Não é
colaboração LAN. Não rode em `0.0.0.0`, não faça port forwarding e não exponha a
porta `9878` na rede.

### Flow Suggestions

Sugestões de UX Flow usam a rota same-origin `/api/flow-suggestions`. O diretório
`flow-bridge/data/` é apenas persistência local/legado; não há servidor Express do
Flow Bridge para iniciar.

## Como Agentes Devem Usar Este Arquivo

1. Leia `AGENTS.md` primeiro.
2. Use este arquivo apenas para saber o que existe ou não existe no Bombardier atual.
3. Ignore memórias ou docs antigos que mencionem LAN, `bridge/`, `bridge-edit/`,
   Page Builder ou Playground/quarentena como caminhos ativos.
4. Não leia diretórios ignorados como `.next/`, `.agents/`, `.claude/worktrees/`,
   `node_modules/`, `review-bridge/data/` ou `flow-bridge/data/` para entender a
   arquitetura.

## Higiene de Contexto

Memória de agente é útil só quando curta, estável e subordinada ao repo. Decisões
temporárias, status de sprint, planos de entrega, links de LAN e workarounds antigos
devem ficar fora das regras canônicas. Quando uma memória externa divergir deste
repo, atualize ou ignore a memória.
