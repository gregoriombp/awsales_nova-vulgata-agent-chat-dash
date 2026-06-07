# Memory Base — wizard de criação (plano de telas)

> **Plano de telas** do fluxo "Criar base de conhecimento". Alinhado a
> [`memory-base-vision.md`](./memory-base-vision.md) (3 camadas) e
> [`memory-base-rework.md`](./memory-base-rework.md). Escrito 2026-06-07.
>
> **Fonte:** Figma `Flow library (AW) (Copy)` — fileKey `kyFJJwEav0sf2EDD5JSEmH`,
> página `929:29942` (🟡 Memory base › Flow). Lido via MCP (desktop).

---

## Decisão de forma: **wizard full-screen, NÃO modal**

A criação é um **wizard que ocupa a tela inteira** (como no Figma), não modal. O
`CreateBaseModal` (2 passos) no código é um **v0 stopgap** — substituir pelo
wizard full-screen. Padrão de referência no repo: **Agent Studio**
(`app/agent-studio/new/page.tsx`) — etapas + animação por etapa + progresso.
Rota sugerida: `/memory-base/new`.

---

## O fluxo REAL do Figma — 6 etapas (com ramos)

| Etapa | Tela (Figma) | node-id | Conteúdo |
|------|--------------|---------|----------|
| 1 | **Nome** | `1249:85612` | Nome da base |
| 2 | **Objetivo** | `1478:140529` | Pra que serve (Vendas, Suporte…) |
| 3 | **Tipo de segmento** | `1478:140532` | Segmento de negócio |
| 4 | **Tipo de envio de dados** | `1478:140535` | Como os dados entram |
| 5 | **Produto** — `Novo produto` `1478:140548` / `Produto existente` `1480:33612` | ramo | cadastra/seleciona produto |
| 5 | **Catálogo** — `Novo catálogo` `1480:33961` / `Catálogo existente` `1481:32104` | ramo | **upload da base de produtos (XLS)** ⬅️ a tela que faltava |
| 6 | **Playbook** — `Novo playbook` `1481:32312` / `Playbook existente` `1481:32340` | ramo | cadastra/seleciona playbook |
| → | **Base de conhecimento** | `1481:116162` | base criada (detalhe + tour) |

Índice/lista: `Página inicial` `1241:79626` (o `container` `1241:83691` é a tela de lista).

**Observação:** cada etapa 5/6 tem ramo **"novo" vs "existente"** (cadastrar do
zero ou reusar um já existente). Isso multiplica as telas.

---

## Proposta de simplificação (reduzir telas sequenciais)

São **6 etapas + ramos** = muita tela em sequência. Enxugar:

**De 6 telas → 3 telas:**

| Nova etapa | Funde | Por quê |
|-----------|-------|---------|
| **1. Identidade & objetivo** | Nome + Objetivo + Tipo de segmento + Tipo de envio (etapas 1-4) | São campos curtos (texto + selects). Cabem numa tela só de "classificação", como no `CreateBaseModal` atual. |
| **2. Fontes-âncora** | Produto + Catálogo (XLS) + Playbook (etapas 5-6) | Uma tela só de upload com 3 blocos (produto, catálogo/XLS, playbook), cada um com "novo/existente" inline. Era o pedido: "uma única tela pro playbook e o produto". |
| **3. Revisão & criar** | — | Resumo + "Criar base" → vai pra `/memory-base/[id]`. |

- O ramo **novo/existente** vira um toggle/segmented dentro de cada bloco da
  tela 2 (não uma tela própria).
- Fontes extras (URL, snippet, integrações) **não** entram no wizard — acontecem
  depois, dentro da base ("Adicione Fontes").

---

## O que existe vs. o que falta

| Item | Estado |
|------|--------|
| Criar base (nome + classificação) | ✅ modal **v0** (`CreateBaseModal`) |
| Round-trip (base aparece na lista) | ✅ |
| Upload de arquivos genérico | ✅ (`SendFileModal`, já no styleguide) |
| **Wizard full-screen** `/memory-base/new` | ❌ a construir |
| **Tela "Fontes-âncora"** (produto + catálogo XLS + playbook, com novo/existente) | ❌ a construir |
| **Upload base de produtos (XLS) → catálogo** | ❌ a construir (a tela que faltava) |
| Tela de revisão & criar | ❌ a construir |

---

## Recomendação de execução

Não dá pra construir tudo de uma vez. Ordem:

1. **UX flow no styleguide** — `/bombardier/styleguide/ux-flows/criar-base-de-conhecimento`
   (skill `bombardier-create-ux-flow`): documenta as 6 etapas + ramos do Figma E
   a versão enxuta de 3 telas, como "a desenvolver". Vive no produto.
2. **Construir o wizard** `/memory-base/new` (full-screen, padrão Agent Studio)
   na versão enxuta de 3 telas. Migrar o gatilho "Criar base" do modal pro wizard.
3. **Aposentar** o `CreateBaseModal` (v0).

> Node-ids acima são do arquivo **Copy** (`kyFJJwEav0sf2EDD5JSEmH`). Pra puxar o
> conteúdo de uma etapa, pegar o artboard **dentro** da seção `(Etapa N)` (as
> seções são só rótulos).
