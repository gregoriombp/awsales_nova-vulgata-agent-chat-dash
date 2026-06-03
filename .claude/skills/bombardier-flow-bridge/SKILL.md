---
name: bombardier-flow-bridge
description: >
  [OBSOLETO] O editor de UX flows do styleguide virou serverless — as
  sugestões agora vão pra uma rota same-origin (/api/flow-suggestions) que
  grava em flow-bridge/data/suggestions.json, sem servidor separado, sem
  token, sem env. Não há mais nada pra "subir". Use esta skill só quando o
  usuário pedir "/bombardier-flow-bridge", "subir o flow-bridge", "ligar o
  servidor de sugestões", "iniciar bridge dos flows", "/flow-bridge" — pra
  explicar que não precisa mais e redirecionar. Pra aplicar sugestões em
  lote, use `bombardier-flow-bridge-solve`.
---

# Bombardier Flow Bridge — não precisa mais subir nada

O fluxo de sugestões dos UX flows (`/bombardier/styleguide/ux-flows/*`)
**não depende mais de um servidor separado**. Cutover feito: o botão
"Sugerir edição" está **sempre ativo** e o "Salvar" grava direto via uma
rota do próprio Next.

- **Rota:** `app/api/flow-suggestions/` (GET/POST/PUT/DELETE), mesma origem
  do app, **sem auth**.
- **Persistência:** `flow-bridge/data/suggestions.json` (+
  `suggestions.archive.json`) — os mesmos arquivos de antes, então o
  histórico continua e a skill `bombardier-flow-bridge-solve` segue lendo
  daí.
- **"Copiar prompt"** continua como fallback 100% client-side (cola no chat).

## O que fazer quando te chamarem

Se o usuário pedir pra "subir o flow-bridge":

1. Explique que **não precisa mais** — o editor é serverless agora.
2. Confirme que o dev server do time (`npm run dev`) está no ar — é onde a
   rota `/api/flow-suggestions` vive. Se sim, está tudo pronto: abra
   qualquer `/bombardier/styleguide/ux-flows/*` e use "Sugerir edição".
3. Pra aplicar sugestões que já chegaram, aponte pra
   `bombardier-flow-bridge-solve`.

> O servidor Express em `flow-bridge/` foi **aposentado** (continua no repo
> só porque é dono da pasta `data/`). O `dev` script **não** o sobe mais, e
> as envs `NEXT_PUBLIC_BOMBARDIER_FLOW_*` ficaram sem uso.
