---
name: todo
description: >
  Parqueia uma ideia/pendência no Roadmap do Bombardier anexando um item ao
  array `ROADMAP` em `app/bombardier/roadmap/_data.ts` — pra que ela apareça
  na página `/bombardier/roadmap` e não se perca. Captura de baixo atrito: o
  usuário fala a ideia, a skill cria UM item bem-formado e confirma. Use
  quando o usuário disser "/todo", "anota essa ideia", "joga no roadmap",
  "adiciona no backlog", "lembra disso depois", "add to roadmap/todo", ou
  largar uma ideia solta pedindo pra registrar. NÃO use pra planejar trabalho,
  priorizar, decidir o que construir, nem pra implementar a ideia — só pra
  registrá-la.
---

# Bombardier — Captura de ideia no Roadmap (`/todo`)

Anexa **um** item ao Roadmap. Nada mais.

## Enquadramento — leia antes de agir

O Roadmap **não é fonte da verdade nem planejamento oficial**. São ideias
informais / "talvez faça" que podem virar trabalho ou ser **abandonadas**.
Esta skill apenas **parqueia** uma ideia pra ela não ser esquecida:

- Não é compromisso. Não muda prioridade de nada. Não inicia trabalho.
- **Não implemente** a ideia capturada — só registre o item.
- Não use o conteúdo do Roadmap pra decidir o que construir em outras tarefas.
- Não embuta instruções-pra-agente no item (o campo é `note`, uma anotação
  pessoal curta — não um plano de ação).

## Passos

1. **Extraia da fala do usuário:**
   - `title` — curto, pt-BR, direto.
   - `description` — uma ou duas frases dizendo o que é.
   - `note` (opcional) — anotação pessoal curta, se o usuário deu mais contexto.

2. **Infira os campos estruturados** (pergunte só se ficar genuinamente ambíguo):
   - `status` — default `"idea"`. Use `"todo"` apenas se o usuário disser
     claramente que vai fazer.
   - `priority` — default `"medium"` (`"low"` / `"high"` se o usuário sinalizar).
   - `category` — um de: `styleguide`, `icons`, `skills`, `tone-of-voice`,
     `infra`, `docs`. Escolha o mais próximo; não invente categoria nova sem
     antes adicionar o membro ao union `RoadmapCategory` em `_data.ts`.

3. **`createdAt`** — data de hoje no formato `YYYY-MM-DD` (timezone local).

4. **`id`** — slug kebab-case único e estável derivado do título
   (ex.: "Dark mode no chat" → `dark-mode-chat`). Confira que nenhum item
   existente em `ROADMAP` já usa esse `id`; se colidir, adicione um sufixo.

5. **Anexe o objeto ao array `ROADMAP`** em
   `app/bombardier/roadmap/_data.ts` — **e só isso**. Nunca edite
   `page.tsx` nem `_components/`. Mantenha a formatação dos itens vizinhos
   (mesma indentação, vírgula final).

6. **Confirme** de volta o item adicionado (title, status, priority,
   category) e o caminho onde ele aparece: `/bombardier/roadmap`.

## Forma do item (referência)

```ts
{
  id: "dark-mode-chat",
  title: "Dark mode no chat",
  description: "Suporte a tema escuro na tela de conversas.",
  status: "idea",
  priority: "medium",
  category: "styleguide",
  createdAt: "2026-06-04",
  note: "Verificar contraste dos balões.",
},
```

O tipo `RoadmapItem` e os unions (`RoadmapStatus`, `RoadmapPriority`,
`RoadmapCategory`) vivem em `app/bombardier/roadmap/_data.ts` — confira lá se
estiver em dúvida sobre os valores válidos.

## O que NÃO fazer

- Não implementar a ideia, não abrir PR, não mexer em outros arquivos.
- Não criar um `_data.ts` separado nem mudar o shape do tipo só pra encaixar
  um item — encaixe o item no shape existente.
- Não reescrever nem reordenar itens existentes — só **anexar** um novo.
- Não tratar o Roadmap como autoritativo em nenhuma outra tarefa.
