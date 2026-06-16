---
name: send-to-aws
description: Publica o protótipo do Greg no design2 (repo da awsales/PG) via scripts/sync-design2.sh — barato em token, NÃO reanalisa o repo do PG. O território do PG já está fixo no script (PRESERVE_PATHS); tudo o que não é dele é do Greg e sobe, de forma ADITIVA (nunca apaga o que só o PG tem). Roda em commits atômicos numa branch nova e abre o PR. Use quando o usuário disser "/send-to-aws", "manda pro pg", "envia pro design2", "sincroniza com a awsales", "atualiza o repo do pg", "manda meu trabalho pro PG".
---

# /send-to-aws — manda o protótipo pro repo do PG (design2)

Este repo era do Greg; o PG foi alterando por conta própria. O **território do PG já está
localizado e fixo** em `PRESERVE_PATHS` no `scripts/sync-design2.sh` (review-bridge, prototype-studio,
supabase, app/auth, app/knowledge-os, flow-bridge, deps…). **Você não precisa analisar o repo do
PG** — o script só compara localmente e manda o seu delta. É barato em token.

Regra mental: **tudo o que não é do PG é seu e sobe.** O sync é **aditivo** (nunca apaga o que só
o PG tem), **nunca** toca PRESERVE (fica a versão dele), **nunca** vaza PRIVATE (`.claude/`,
`AGENTS.md`, etc.), **nunca** empurra pra `design2/main` nem usa `--force`. Sempre **branch + PR**.
O script tem asserts fail-closed — se algo violar isso, ele aborta e nada é empurrado.

## Fluxo padrão (barato)

1. **Confere rápido (sem escrever nada):**
   ```
   ./scripts/sync-design2.sh --dry-run
   ```
   Imprime 1 linha `SUMMARY …` + o bloco `MANIFEST-BEGIN…END` (os arquivos que vão). Se sair com
   erro (token/fetch), **relate o erro literal e pare**. Se o manifest vier vazio: **nada a enviar**.

2. **Mostra ao usuário** o resumo (1–2 linhas): branch alvo, `+add/~mod`, e que o resto fica
   intacto (PG-only preservados). Confirme com ele (a menos que ele já tenha dito "manda").

3. **Publica:**
   ```
   ./scripts/sync-design2.sh --yes
   ```
   Sem mais nada, o script **agrupa em commits atômicos por área** sozinho, cria a branch e **abre
   o PR**. Relate a branch, o nº de commits e o **link do PR** (`✓ PR aberto: …`).

## Quando quiser mensagens de commit curadas (opcional)

Em vez do agrupamento automático, gere um plano TSV (1 commit por linha:
`<mensagem>\t<arquivo>\t<arquivo>…`, todo arquivo do MANIFEST em exatamente um grupo) e rode:
```
./scripts/sync-design2.sh --yes --commits <plano.tsv> [--branch greg/nome]
```

## Notas

- `--branch greg/nome` só se o usuário pediu um nome; senão o default é datado.
- `--locate-pg` lista o território do PG (use de vez em quando pra ver se ele criou pasta nova que
  valha adicionar em `PRESERVE_PATHS` — mas o modo aditivo já protege mesmo sem isso).
- `--prune` só se o usuário quiser propagar deleções dele (o script só apaga arquivos que o PG não
  tocou desde o fork). Não use por padrão.
- Snapshot vem do **HEAD commitado** — se for publicar com tree sujo, o script para; peça pra
  commitar/stashar antes (o `--dry-run` e o `--locate-pg` rodam mesmo com tree sujo).
- **Não** edite `PRIVATE_PATHS`/`PRESERVE_PATHS` no meio do fluxo. Se um assert disparar, relate e
  pare — não tente contornar.
