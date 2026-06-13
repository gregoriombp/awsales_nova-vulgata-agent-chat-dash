---
name: bombardier-foundation-update
description: >
  Atualiza INCREMENTALMENTE os tokens de foundation do design system AwSales em
  app/globals.css (cor, tipografia, spacing, radius, shadow, motion) — aditivo,
  revisado, SEM rebootstrap e SEM reescrever o arquivo. Mantém os canais @theme
  (utility) e :root (var) + dark em sincronia. Use quando o usuário pedir
  "adicionar token", "estender a escala de tipo/spacing", "criar token pra X",
  "tokenizar esses valores", "preencher os degraus que faltam", "atualizar a
  foundation sem refazer o DS". NÃO é bootstrap a partir de referência visual —
  pra isso use bombardier-design-system-foundation.
---

# Bombardier — Foundation Update (incremental)

Use para ADICIONAR ou AJUSTAR tokens numa foundation que **já existe** — nunca
para rebootstrap. Irmã da `bombardier-design-system-foundation` (que faz bootstrap
a partir de uma referência e pode reescrever o `globals.css`). Estas duas são as
únicas skills autorizadas a mexer em token.

`AGENTS.md` é a fonte de verdade. Se algo aqui conflitar, siga o `AGENTS.md`.

## Hard rules

- **Nunca** reescreva/rescaffold o `globals.css`. Só edição cirúrgica do bloco de
  tokens; não toque em CSS que não seja token.
- **Aditivo por padrão.** Não remova nem renomeie token em uso (isso é breaking).
- **Dois canais em sincronia:** o `@theme` (gera as utility classes do Tailwind v4)
  e o espelho em `:root` / `--aw-*` (consumo por `var()`), incluindo o override do
  dark mode. Um token novo entra nos dois quando se aplica aos dois.
- Não cria cor fora das 10 famílias `aw-*`; nada de hex solto.
- Token novo entra no vocabulário de `docs/component-map.md` e, quando fizer
  sentido, ganha exemplo na foundation page correspondente.

## Workflow

1. Leia `AGENTS.md` e o bloco de tokens atual em `app/globals.css`.
2. **Audite o que já existe** — não duplique um token que já cobre o valor, e veja
   se já há um sistema semântico (ex.: as utilities `body-*`/`display-*`/`caption`/
   `aw-eyebrow`) antes de criar um paralelo.
3. **Classifique cada mudança:**
   - **safe** (aplica direto): adicionar token novo que não altera nada existente;
     alias; doc. Zero mudança visual.
   - **needs review** (propõe + espera ok): mudar o valor de um token em uso, ou
     redefinir uma escala (tipo/cor/radius) — tem impacto visual.
   - **breaking** (só com ok explícito): remover/renomear token em uso.
4. Aplique as **safe**; para needs-review/breaking, mostre o delta e espere aprovação.
5. Sincronize `@theme` + `:root` + dark.
6. Valide: `npm run typecheck`, `npm run ds:check`, e verificação visual
   (Playwright) sempre que algum valor **em uso** mudar.
7. Atualize `docs/component-map.md` (vocabulário de tokens).

## Output

- tokens adicionados / alterados / intocados (com px ou valor)
- classificação de cada um (safe / needs review / breaking)
- mudanças arriscadas puladas (aguardando ok)
- validações rodadas
