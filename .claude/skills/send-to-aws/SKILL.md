---
name: send-to-aws
description: Publica um snapshot FILTRADO do repo local no design2 (repo da awsales/PG) rodando scripts/sync-design2.sh — SEM os arquivos privados (skills, AGENTS.md, settings, o próprio script). Faz dry-run, monta um relatório (branch alvo, +add/~mod/−del, divergência), pede confirmação no chat, empurra pra uma branch datada e reporta o resultado + próximo passo (PR). Use quando o usuário disser "/send-to-aws", "manda pro pg", "envia pro design2", "sincroniza com a awsales", "atualiza o repo do pg", "manda meu trabalho pro PG".
---

# /send-to-aws — manda o trabalho pro repo do PG (design2), sem os arquivos privados

Envia o estado atual do repo pro `design2` (`awsales/awsales-nova-vulgata-design`) via
`scripts/sync-design2.sh`, **removendo os arquivos privados** (`.claude/`, `AGENTS.md`,
`CLAUDE.md`, `BOMBARDIER.md`, `AWSALES_CONTEXT.md`, o próprio script). **Nunca** sobrescreve
`design2/main` nem usa `--force`: cria uma **branch datada** que o PG mescla via PR.

> Contexto do porquê: ver a memória `project-remotes-mirror`. O script é a fonte da verdade da
> lógica de filtro/segurança — esta skill só o **dirige** e formata o relatório.

## Passos

1. **Pré-checagem.** `git status --porcelain`. Se houver saída (tree sujo), **PARE** e peça pro
   usuário commitar ou stashar — o snapshot vem do estado **commitado**, não do working tree.

2. **Dry-run (não empurra nada).** Rode:
   ```
   ./scripts/sync-design2.sh --dry-run
   ```
   Faz fetch do design2, monta a árvore filtrada, roda a asserção de SAFETY e imprime o relatório
   (procure a linha `SUMMARY branch=… base=… clean=… add=… mod=… del=…`). Se o script sair com
   erro (token ausente, fetch falhou, path privado vazou), **relate o erro literal e PARE** — não
   tente contornar.

3. **Relatório no chat.** Apresente enxuto, a partir do output do dry-run:
   - branch de destino + base (`design2/main @ <sha>`)
   - estado: **ff limpo** ou **DIVERGIU**
   - contagem **+add / ~mod / −del** — destaque o **−del** em negrito se `del > 0` (são arquivos
     que o PG tem e que esse snapshot removeria)
   - confirmação de que os privados foram removidos (assert passou)
   - se `del > 0` ou DIVERGIU: avise que o ideal é **integrar o PG antes**
     (`git fetch <design2> main && git merge FETCH_HEAD`, resolver conflitos) e rodar de novo.

4. **Confirmação.** Use **AskUserQuestion** (ou pergunta direta) pra confirmar a publicação.
   Mostre o resumo (branch + contagens) na pergunta. Só prossiga com **sim explícito**.
   Se `del > 0`, deixe a opção "integrar o PG primeiro" bem visível e trate-a como a recomendada.

5. **Publicar.** Rode:
   ```
   ./scripts/sync-design2.sh --yes [branch-opcional]
   ```
   Passe um nome de branch **só** se o usuário pediu um específico; senão use o default datado.
   **Nunca** passe `main` a menos que o usuário peça explicitamente E o dry-run mostre
   `clean=1 del=0`.

6. **Resultado.** Relate a branch criada no `design2` e o próximo passo: **abrir o PR → main** no
   GitHub do `awsales`. Se o push foi **rejeitado** (divergência de última hora), relate e sugira
   rodar de novo com outro nome de branch (o script já sugere o comando).

## Regras

- **NUNCA** `--force`. **NUNCA** empurre direto pra `main` por conta própria.
- Não filtre arquivos manualmente nem edite a `PRIVATE_PATHS` no meio do fluxo — o script cuida do
  strip e tem uma asserção que falha-fechado se algo privado escapar.
- Se o usuário pedir "manda direto, sem perguntar", ainda assim rode o **dry-run** primeiro e mostre
  o relatório (1 linha do SUMMARY basta) antes do `--yes` — a contagem de deleções é a salvaguarda.
