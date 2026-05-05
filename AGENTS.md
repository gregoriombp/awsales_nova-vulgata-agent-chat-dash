# AGENTS.md

Convenções para qualquer agente de IA (Claude Code, Codex, Cursor, etc.) trabalhando neste repositório. Este arquivo é o ponto de entrada — leia antes de começar.

> **Para contexto completo do projeto, princípios e onde-está-o-quê, leia também `CLAUDE.md` na raiz.** Este arquivo extrai apenas as regras hard que TODO agente deve obedecer, independente da skill ou prompt em uso.

## Regras hard

### 1. Prefixo `Aw` em todo componente novo do design system

Todo componente do design system **deve** começar com `Aw`. Sem exceção dentro do escopo do DS.

**Padrão obrigatório:**

| Item | Convenção |
|---|---|
| Nome do arquivo | `Aw[Nome].tsx` (PascalCase) |
| Nome do export | `export function Aw[Nome](...)` ou `export const Aw[Nome] = ...` |
| Pasta destino (oficial) | `/components/ui/Aw[Nome].tsx` |
| Pasta destino (experimental / playground) | `/app/bombardier/styleguide/playground/components/aw-[nome]/` |
| Showcase (oficial) | `/app/bombardier/styleguide/components/aw-[nome]/page.tsx` |
| Entrada de navegação | `navigation.ts` com `name: "Aw[Nome]"` e `href: "/bombardier/styleguide/components/aw-[nome]"` |

**Exemplos corretos:**

```
components/ui/AwButton.tsx
components/ui/AwCard.tsx
components/ui/AwIntegrationCard.tsx
app/bombardier/styleguide/components/aw-button/page.tsx
app/bombardier/styleguide/playground/components/aw-onboarding-banner/page.tsx
```

**Exemplos errados (não fazer):**

```
components/Button.tsx                    ← raiz é zona legada em migração
components/ui/button.tsx                 ← isso é o primitivo shadcn, não o wrapper do DS
components/ui/MyButton.tsx               ← sem prefixo
components/ui/aw-button.tsx              ← arquivo deve ser PascalCase
```

**`Aw[Nome]` é wrapper de shadcn primitive — sempre.**

O fluxo correto, sem exceção:

1. **Consulta o shadcn primitive correspondente** via MCP (`search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`).
2. **Instala** com `npx shadcn@latest add [nome]`. O primitivo vai pra `components/ui/[nome].tsx` (lowercase, gerado pelo CLI shadcn).
3. **Cria `components/ui/Aw[Nome].tsx`** ao lado, importando o primitivo. Aplica tokens AwSales, adiciona variantes da marca (intents, sizes, ai-gradient, slot pra `Icon`, etc.).
4. Páginas e features importam **apenas o `Aw[Nome]`**, nunca o primitivo direto.
5. Showcase em `app/bombardier/styleguide/components/aw-[nome]/page.tsx` + entrada em `navigation.ts`.

**Estado atual do repo (débito conhecido):**

Hoje o repo **não tem shadcn instalado** — sem `components.json`, sem `@radix-ui/*` em `package.json`. Os `Aw*` existentes em `components/ui/` foram construídos antes da decisão de adotar shadcn, então hoje são hand-rolled em Tailwind. **Isso é um erro de origem que precisa ser corrigido.** Plano:

1. `npx shadcn@latest init` para configurar o repo.
2. Para cada `Aw[Nome]` existente, instalar o primitivo correspondente e refatorar o wrapper para importá-lo.
3. Componentes **novos a partir de agora já seguem o fluxo correto** (primitivo + wrapper).

**Componentes legados na raiz `/components/`:**

`components/Button.tsx`, `components/Input.tsx`, `components/KPICard.tsx`, etc. são **pré-Bombardier**, hardcoded, sem prefixo, ainda em migração. Quando precisar evoluir um deles:

1. Garante que o shadcn primitive correspondente está em `components/ui/[nome].tsx`.
2. Cria `components/ui/Aw[Nome].tsx` como wrapper desse primitivo, replicando a funcionalidade do legado + tokens atuais + `Icon`.
3. Migra os imports nas páginas progressivamente.
4. Quando ninguém mais importa do legado, deleta o arquivo da raiz.
5. Cria showcase no styleguide e registra em `navigation.ts`.

**Única exceção ao prefixo — componentes de quarentena do Canvas Builder:**

Componentes gerados pela skill `bombardier-generate` (page builder visual) em `/components/playground/` usam PascalCase **sem** `Aw` — esses não fazem parte do DS oficial até serem promovidos. Quando promovidos, são renomeados para `Aw[Nome]` e movidos para `/components/ui/`.

### 2. Tokens são sagrados

- Apenas a skill `bombardier-design-system-foundation` cria tokens. Qualquer outra skill, prompt ou edição manual **não** adiciona tokens novos a `globals.css` ou `tailwind.config.ts`.
- Proibido: `bg-[#hex]`, `text-[#hex]`, `p-[Npx]`, `border-[#hex]`, `rounded-[Npx]`, ou qualquer Tailwind arbitrary value para cor / spacing / radius / shadow / typography.
- Permitido: classes Tailwind que referenciam tokens existentes (`bg-primary`, `text-fg-primary`, `border-border`, `rounded-lg`, `shadow-sm`, etc.) e CSS variables (`var(--bg-canvas)`, `var(--accent-brand)`).
- Se um token genuinamente não existe e o trabalho exige, **reporte no output** ao invés de criar — a foundation skill é a única autorizada a estender o set.

### 3. Componentes antes de código

- Antes de escrever um componente novo, verifique:
  1. `/components/ui/Aw*` (oficial)
  2. `/components/*` raiz (legados — preferir migrar pra `Aw*` em vez de duplicar)
  3. `/app/bombardier/styleguide/playground/components/aw-*` (experimentais)
  4. `/components/ui/*.tsx` minúsculo (primitivos shadcn — verificar se existe wrapper Aw)
- Reutilizar e estender > recriar.

### 4. Playground primeiro para novidades

- Componentes gerados por IA, ou criados durante construção de página (skill `bombardier-new-page`), começam em `/app/bombardier/styleguide/playground/components/aw-[nome]/`.
- Promoção para `/components/ui/Aw[Nome].tsx` exige revisão manual (tokens, acessibilidade, naming, reuso).

## Skills disponíveis em `.claude/skills/`

| Skill | Quando usar |
|---|---|
| `bombardier-design-system-foundation` | Setup inicial / extrair tokens de referência (raramente — DS já existe) |
| `bombardier-new-component` | Adicionar componente ao DS (sempre `Aw*`, sempre em `components/ui/`) |
| `bombardier-new-page` | Construir uma página de produto a partir de referência |
| `bombardier-design-system-audit` | Auditar consistência (tokens / componentes / showcases / navigation) |
| `bombardier-generate` | Page Builder visual — gera JSON `BuilderNode[]` para o canvas (escopo separado) |

As 4 primeiras skills são **genéricas** (servem para qualquer projeto Bombardier). A regra do prefixo `Aw` é **convenção deste repositório** e está documentada aqui — as skills não a conhecem, é o agente que aplica este AGENTS.md sobre o output delas.

## Como o agente deve combinar skill + convenção

Quando uma skill (qualquer) sugerir criar `MyComponent.tsx` em `components/`:

1. **Renomeia** para `AwMyComponent.tsx`
2. **Move** para `components/ui/` (oficial) ou `app/bombardier/styleguide/playground/components/aw-my-component/` (experimental)
3. **Atualiza imports** no resto do código
4. **Cria showcase** em `app/bombardier/styleguide/components/aw-my-component/page.tsx` (oficial) ou playground equivalente
5. **Registra** em `navigation.ts`

A skill produz o esqueleto; este AGENTS.md ajusta o naming e o destino.

## Dúvidas comuns

**"Posso criar um componente sem o prefixo Aw?"**
Não, dentro do DS. Único lugar permitido é `/components/playground/` (canvas builder, fora do DS oficial).

**"O componente é wrapper de um shadcn primitive — o nome do arquivo é qual?"**
O primitivo shadcn fica em `components/ui/button.tsx` (gerado pelo `npx shadcn add`). O seu wrapper fica em `components/ui/AwButton.tsx` e importa o primitivo. Páginas importam `AwButton`.

**"Já tem um `Button.tsx` na raiz de `components/`. Atualizo ele ou crio `AwButton`?"**
Cria `components/ui/AwButton.tsx` como wrapper do shadcn primitive `Button`. Replica a funcionalidade do legado + tokens atuais + ícones via `Icon`. Migra os usos página a página. O legado morre quando ninguém mais importa dele.

**"O skill manda `npx shadcn@latest add button` — eu rodo?"**
**Sim.** É o caminho oficial deste repo. O primitivo vai pra `components/ui/button.tsx` (lowercase). Em seguida, cria/atualiza `components/ui/AwButton.tsx` que importa esse primitivo e adiciona a camada de marca (variantes, sizes, intents, ícone). Páginas importam só `AwButton`.

**"Já existe um `AwButton.tsx` no repo, mas sem shadcn por trás. O que faço?"**
Esse é o débito atual. Quando precisar mexer naquele componente, instala o primitivo shadcn (`npx shadcn add button`) e refatora o `AwButton.tsx` para virar wrapper do primitivo, mantendo o mesmo contrato de props pra não quebrar páginas que já o usam.
