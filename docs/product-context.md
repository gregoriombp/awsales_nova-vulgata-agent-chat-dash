# Contexto do produto e do builder

> Documento de orientação. Não substitui as fontes canônicas:
> [`AGENTS.md`](../AGENTS.md), [`AWSALES_CONTEXT.md`](../AWSALES_CONTEXT.md),
> [`BOMBARDIER.md`](../BOMBARDIER.md) e
> [`docs/component-map.md`](./component-map.md).

Este arquivo existe para dar a uma pessoa ou agente novo uma leitura rápida do
que é o produto, o que é o Bombardier e como começar sem abrir dez arquivos ao
mesmo tempo.

Use como mapa inicial. Quando precisar de regra, decisão de implementação ou
vocabulário completo, siga os links acima.

## Em 2 minutos

Este repo é um Product Builder para a plataforma AwSales 2.0, hoje apresentada
como Aswork. Ele não é o backend de produção. Ele é a fonte de verdade visual e
comportamental: telas navegáveis, componentes reais, fluxos de UX, estados e
interações que orientam a implementação final.

Bombardier é o ambiente de construção dentro do repo. Ele junta o design system,
os projetos importados do Figma, os UX flows, o Review Mode, o Live Edit Mode e
as filas que agentes usam para resolver comentários ou pedidos.

## Aswork / AwSales

Aswork é uma camada de força de trabalho artificial para operações de receita.
O nome AwSales ainda aparece no repo por histórico de produto, rotas antigas e
pela convenção `Aw*` do design system.

O posicionamento do produto:

- infraestrutura autônoma de vendas e atendimento;
- agentes de IA que constroem conhecimento, executam transações e se otimizam
  por receita;
- Service-as-a-Software: trabalho executado, não só licença de software.

O produto não deve ser tratado como chatbot, workflow tool ou dashboard de
vendas. A diferença central é resultado: mover lead, resolver ticket, recuperar
receita, atualizar sistema, disparar ação.

## Bombardier

Bombardier é o método e a área do repo onde o produto é desenhado em código.

Principais superfícies:

- `/bombardier` — hub das ferramentas.
- `/bombardier/styleguide` — design system vivo.
- `/bombardier/projects` — flows do Figma importados como projetos navegáveis.
- `/bombardier/styleguide/ux-flows` — fonte editável dos fluxos de UX.
- `/bombardier/ux-flow` — viewer/hub de fluxos.
- `/bombardier/review-bridge` — pendências de review e sugestões.
- `/bombardier/design-system-tweaks` — exploração controlada de foundations.

O Bombardier existe para evitar a distância entre "desenhar" e "implementar".
As telas são montadas com os mesmos componentes que documentam o design system.

## Design system

O design system oficial vive em `components/ui/Aw*`.

Regra prática:

- telas importam `Aw*`;
- shadcn fornece primitivos quando apropriado;
- o wrapper `Aw*` é a API oficial do produto;
- tokens vêm de `app/globals.css`;
- ícones de produto usam `Icon` com Material Symbols.

Antes de criar qualquer tela ou componente, leia
[`docs/component-map.md`](./component-map.md). Ele responde "preciso de X, uso
qual componente?".

## shadcn

shadcn é usado como camada de primitivos, não como design system final.

O fluxo esperado para componente novo é:

1. Procurar se já existe um `Aw*`.
2. Se fizer sentido, instalar o primitivo shadcn em `components/ui/[nome].tsx`.
3. Criar ou atualizar `components/ui/Aw[Nome].tsx`.
4. Documentar no styleguide.
5. Registrar em `app/bombardier/styleguide/navigation.ts`.

Exemplo:

```txt
components/ui/button.tsx
components/ui/AwButton.tsx
```

As páginas de produto devem importar `AwButton`, não o `button` cru.

## Módulos principais do produto

### Agent Studio

Área para criar, configurar, testar e publicar agentes.

Rotas principais:

- `/agent-studio`
- `/agent-studio/new`
- `/agent-studio/[id]`

Conceitos importantes:

- agente;
- Agent Core;
- prompt;
- checkpoint;
- base de conhecimento;
- AOPs;
- follow-up;
- atendimento humano;
- playground;
- insights;
- preferências.

### Memory Base

Área onde o cliente transforma materiais crus em conhecimento usado pelos
agentes.

Modelo:

```txt
Memory Base
  Base de conhecimento
    Fonte
      Knowledge Layers
```

Rotas principais:

- `/memory-base`
- `/memory-base/new`
- `/memory-base/[id]`

O repo é preview de UX/UI: boa parte do estado é mock ou `localStorage`.

### Integrações e tools

Integrações são conexões com sistemas externos. Tools são ações que agentes
podem executar a partir dessas conexões.

Rotas:

- `/integrations`
- `/integrations/[instanceId]`
- `/integrations/custom`
- `/tools`
- `/tools/new`

Categorias modeladas incluem checkouts, CRMs, agendas, formulários, IA,
marketplaces, assinaturas e comunicação.

### Canais

Canais são onde o agente atende.

Rotas:

- `/canais`
- `/canais/whatsapp`
- `/canais/instagram`
- `/canais/messenger`

WhatsApp é o canal mais completo no protótipo, com conta, número e template de
primeira mensagem.

### Onboarding

Fluxos principais:

- `/primeiro-acesso`
- `/convite`
- `/organizacao-adicional`
- `/inicio`

A home logada orienta o usuário a conectar canais, convidar equipe, abrir
Memory Base, testar no Playground, ativar agente e criar AOPs.

### Settings e operação

`/settings` redireciona para `/settings/perfil`.

Áreas relevantes:

- perfil;
- organização;
- segurança;
- equipe e permissões;
- financeiro;
- consumo e custos;
- métodos de pagamento;
- histórico de faturas;
- notificações;
- aparência;
- zona de perigo.

## Voz e escrita

Há duas vozes:

- site e marca vendem;
- produto resolve.

Na interface, prefira texto instrucional, direto e útil. Explique o que algo
faz, por que existe e o que acontece ao clicar. Evite slogan, exagero e texto
promocional dentro do produto.

Produto bom aqui não tenta parecer inteligente. Ele ajuda o usuário a entender:

1. o que o agente sabe;
2. por que ele sabe;
3. como esse conhecimento vira ação.

## Como começar do zero

1. Rode `npm install`.
2. Rode `npm run dev`.
3. Abra `/bombardier`.
4. Abra `/bombardier/styleguide`.
5. Leia `docs/component-map.md`.
6. Abra `/inicio`.
7. Abra `/agent-studio`.
8. Abra `/memory-base`.
9. Abra `/integrations` e `/tools`.
10. Use Review Mode pela bolota do Bombardier quando precisar comentar uma tela.

Se a pessoa estiver criando interface, a ordem correta é:

```txt
component-map -> Aw* existente -> página/tela -> review
```

Não comece criando componente novo. Comece entendendo o que já existe.

## Para agentes

Antes de editar qualquer coisa:

1. Leia [`AGENTS.md`](../AGENTS.md).
2. Leia [`docs/component-map.md`](./component-map.md).
3. Para contexto de produto, leia [`AWSALES_CONTEXT.md`](../AWSALES_CONTEXT.md).
4. Para superfícies do builder, leia [`BOMBARDIER.md`](../BOMBARDIER.md).

Resumo operacional:

- regras vivem em `AGENTS.md`;
- produto e voz vivem em `AWSALES_CONTEXT.md`;
- mapa do Bombardier vive em `BOMBARDIER.md`;
- decisão de componente começa em `docs/component-map.md`;
- styleguide vivo está em `/bombardier/styleguide`.

## O que este arquivo não faz

Este arquivo não cria regra nova.

Ele também não deve virar enciclopédia paralela. Se uma informação precisa ser
obrigatória para agentes, ela pertence ao `AGENTS.md`. Se é contexto profundo de
produto, pertence ao `AWSALES_CONTEXT.md`. Se é operação do builder, pertence ao
`BOMBARDIER.md`.
