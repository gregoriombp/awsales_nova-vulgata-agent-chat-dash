# Memory Base — wizard de criação (plano COMPLETO de telas)

> Plano de telas do wizard "Criar base de conhecimento". Lido do Figma
> `Flow library (AW) (Copy)` — fileKey `kyFJJwEav0sf2EDD5JSEmH`, página
> `929:29942` (🟡 Memory base › Flow). **Status: APROVADO (enxuta 3 telas + loading)
> — em construção.** Alinhado a [`memory-base-vision.md`](./memory-base-vision.md).
>
> **Decisão (2026-06-07):** wizard enxuto — (1) Nome, (2) Classificação
> [Objetivo + Tipo de segmento + Envio], (3) Fontes-âncora [Produto + Catálogo/XLS
> + Playbook, toggle novo/existente] → Loading → base criada. Nome na 1ª tela;
> loading mantido; fontes decorativas. Envio = 2 cards: **Padrão** vs **Catálogo** (CSV/lote).

---

## Forma & chrome (do Figma)

- **Full-screen, NÃO modal.** Wizard ocupa a tela inteira, rota `/memory-base/new`.
- **Chrome = dashboard completo:** `AwSidebar` **expandida** à esquerda (com
  "Memory base" ativo), conteúdo numa **coluna central única**.
- **Cada etapa:** título grande + subtítulo + conteúdo + rodapé com
  **‹ Voltar** (secundário, esquerda) e **Avançar ›** (preto, direita). Na
  última etapa o botão vira **Criar base**.
- **Dois padrões de conteúdo:**
  - **Card grid** (classificação): cards selecionáveis com ícone + label; o
    selecionado fica preto. Single-select.
  - **Fonte** (produto/catálogo/playbook): botões **Novo / Existente** + cards
    expansíveis listando arquivos, com **Adicionar fontes**.

---

## As telas (fluxo real do Figma)

| # | Tela | node-id | Conteúdo |
|---|------|---------|----------|
| 01 | **Homepage** (lista) | `2121:19937` | A lista de bases. Botão "Criar base" entra no wizard. |
| 02 | **Intro / Identidade** | `1026:34541` | Ícone da base (biblioteca, chip preto) + **nome** da base centralizado. É onde a base ganha nome/identidade. |
| 03 | **Objetivo** | `969:70038` | "Qual o objetivo da sua base de conhecimento?" — card grid: **Vendas · Onboarding · Suporte e Atendimento · CS / Lançamento · Captação de Lead**. |
| 04 | **Tipo de segmento** | `969:70637` | "Qual o tipo de segmento?" — card grid: **Educação · Produto físico · Serviços**. |
| 05 | **Envio de dados** | `969:71646` | "Tipo de envio de dados" — card grid (mesmo padrão). Como os dados chegam. |
| 06 | **Produtos** | `1480:32015` | "Selecione produtos já utilizados… ou crie novos." Botões **Novo produto / Produto existente** + cards expansíveis (ex.: "Fyntra analytics (4) · usado por 2 bases") com linhas de arquivo (PDF) + **Adicionar fontes**. |
| 07 | **Catálogo** | `1030:187732` | "Selecione um catálogo… ou crie um novo." Card do catálogo (ex.: "Fyntra catalog" → `fyntra_analytics.csv · 100.000 produtos · 10 categorias") + **Remover catálogo**. **É o upload da base de produtos (XLS/CSV).** |
| 08 | **Playbook** | `1063:37103` | "Insira fontes… ou selecione o playbook de outra base." Tooltip explica o que é playbook. Linha "Arquivos" + select. Botão final = **Criar base**. |
| 09 | **Loading** | `961:76779` | "Construindo sua base de conhecimento…" + sparkle. A IA arquiteta a base e gera os briefings/knowledge layers. |
| 10 | **Base criada** | — | Cai em `/memory-base/[id]` — detalhe com tour + Adicione Fontes. |
| 11 | **Fontes de conhecimento** | `969:7822` | View de fontes dentro da base (pós-criação). |

**Sequência:** 01 → (Criar base) → 02 Intro → 03 Objetivo → 04 Tipo → 05 Envio →
06 Produtos → 07 Catálogo → 08 Playbook → (Criar base) → 09 Loading → 10 Base criada.

São **~8 telas sequenciais** de input. Os ramos novo/existente das telas 06-08
são inline (botões dentro da própria tela, não telas separadas).

---

## Proposta de simplificação (a decidir com você)

São muitas telas em sequência. Proposta de enxugar mantendo o essencial:

| Enxuta | Funde | Conteúdo |
|--------|-------|----------|
| **1. Identidade** | Intro (02) | Nome da base (+ ícone). Foco único. |
| **2. Classificação** | Objetivo + Tipo de segmento + Envio (03-05) | Os 3 card-grids numa tela só (Objetivo como grid principal; segmento e envio compactos). |
| **3. Fontes-âncora** | Produtos + Catálogo + Playbook (06-08) | 3 blocos numa tela só, cada um com toggle Novo/Existente. O catálogo carrega o XLS/CSV. |
| **4. Loading** | (09) | "Construindo sua base…" (mantém — é o momento da IA). |
| **→ Base criada** | (10) | `/memory-base/[id]`. |

Resultado: **3 telas de input + loading**, em vez de ~8.

### Decisões em aberto (preciso de você antes de codar)
1. **Enxugar pra 3 telas** (acima) ou **manter as 8 do Figma** fiel? Ou um meio-termo (ex.: classificação em 1 tela, mas produto/catálogo/playbook separados)?
2. **Intro (02):** é tela de digitar o nome, ou o nome é digitado antes (na lista) e a Intro é só um "splash" de identidade? (No Figma aparece já preenchida "Fyntra produtos".)
3. **Loading (09):** mantém a tela de loading animada antes de cair na base?
4. As fontes (produto/catálogo/playbook) no protótipo são **decorativas** (sem backend) — ok subir XLS/PDF só como enfeite client-side, como o resto do repo?

---

## O que existe vs. o que falta

| Item | Estado |
|------|--------|
| Lista + round-trip + menu ⋯ | ✅ |
| Modal de criação v0 (`CreateBaseModal`) | ✅ (a aposentar pelo wizard) |
| Helper `lib/memory-base/create.ts` | ✅ criado (createMemoryBase compartilhado) |
| UX flow no styleguide | ✅ (`ux-flows/criar-base-de-conhecimento`) |
| **Wizard full-screen `/memory-base/new`** | ❌ a construir (depende da decisão acima) |
| Card-grid picker (classificação) | ❌ |
| Blocos de fonte (produto/catálogo/playbook) | ❌ |
| Tela de loading | ❌ |

---

## Plano de execução (após aprovação)

1. **Você decide** as 4 questões acima (principalmente: 3 telas enxutas vs. 8 fiéis).
2. Construir `/memory-base/new` no chrome do dashboard (sidebar + coluna central),
   com stepper, card-grid e blocos de fonte conforme a decisão.
3. Repontar "Criar base" (lista) pro wizard; aposentar o `CreateBaseModal` v0.
4. Atualizar o UX flow do styleguide se a estrutura mudar.

> Node-ids do arquivo **Copy** (`kyFJJwEav0sf2EDD5JSEmH`). Desktop Figma precisa
> estar com esse arquivo na aba ativa pro MCP ler.
