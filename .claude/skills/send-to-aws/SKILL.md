---
name: send-to-aws
description: Publishes Greg's prototype to design2 (the awsales/PG repo) via scripts/sync-design2.sh — token-cheap, does NOT re-analyze the PG repo. PG's territory is already fixed in the script (PRESERVE_PATHS); everything that isn't PG's belongs to Greg and gets pushed, ADDITIVELY (never deletes what only PG has). Runs as atomic commits on a new branch and opens the PR. Use when the user says "/send-to-aws", "manda pro pg" (send it to PG), "envia pro design2" (push to design2), "sincroniza com a awsales" (sync with awsales), "atualiza o repo do pg" (update the PG repo), or "manda meu trabalho pro PG" (send my work to PG).
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

## Autoria (Vercel) — sempre pela conta da AwSales

Os commits enviados ao design2 são **sempre** autorados pela conta **`greg_awsales`**
(`Greg <greg+awsales@awsales.io>`), **nunca** pelo git identity pessoal do Greg
(`gregmatuzalem@gmail.com`). Se forem pelo e-mail pessoal, o check da Vercel falha com
*"No GitHub account was found matching the commit author email"* e o PR fica vermelho.

Isso já está embutido no script (`AWSALES_AUTHOR_NAME` / `AWSALES_AUTHOR_EMAIL`, aplicados
via env só nos `commit-tree`): **não mexe no git config local**, então depois do envio a
identidade pessoal do Greg continua intacta — não há nada a "restaurar". Um assert fail-closed
aborta o push se qualquer commit sair com outro e-mail. Se o token sumir/expirar, o script já
pede `gh auth login -u greg_awsales`; rode isso e mande de novo.

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
