#!/usr/bin/env bash
# scripts/sync-design2.sh — publica um snapshot FILTRADO do main local no repo design2 (PG),
# SEM os arquivos privados que vivem no origin. Padrão: branch datada (nunca sobrescreve main,
# nunca clobbera o PG). O PG mescla a branch via PR.
#
# Uso:
#   ./scripts/sync-design2.sh                 # cria branch datada greg/sync-AAAAMMDD-HHMM
#   ./scripts/sync-design2.sh greg/minha-br   # nome de branch custom
#   ./scripts/sync-design2.sh main            # override (só faz ff limpo; senão rejeita)
set -euo pipefail

# Lista canônica do que é RASTREADO no origin mas NUNCA vai pro working tree do design2.
# Mantida em sincronia com o comentário-âncora no .gitignore.
PRIVATE_PATHS=(
  ".claude/skills" ".claude/settings.json"
  "AGENTS.md" "CLAUDE.md" "AWSALES_CONTEXT.md" "BOMBARDIER.md"
  "scripts/sync-design2.sh"
)
DESIGN2_URL_BASE="github.com/awsales/awsales-nova-vulgata-design.git"
SOURCE_REF="HEAD"
DEST_BRANCH="${1:-greg/sync-$(date +%Y%m%d-%H%M)}"   # side-branch; passe 'main' p/ override

# 0. tree limpo (snapshot vem do estado commitado)
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "✗ Working tree sujo — commit ou stash antes."; exit 1
fi

# 1. token (mesmo mecanismo do mirror hook antigo)
TOKEN="$(gh auth token --user greg_awsales 2>/dev/null || true)"
[[ -z "$TOKEN" ]] && { echo "✗ Token greg_awsales não encontrado (gh auth login)."; exit 1; }
AUTHED="https://greg_awsales:${TOKEN}@${DESIGN2_URL_BASE}"

# 2. fetch design2/main (erros visíveis — repo é privado)
git fetch "$AUTHED" main || { echo "✗ fetch design2 falhou (veja o erro do git acima)."; exit 1; }
BASE="$(git rev-parse FETCH_HEAD)"

# 3. guarda de divergência: design2/main já está no seu histórico local?
if git merge-base --is-ancestor "$BASE" "$SOURCE_REF"; then
  CLEAN=1
else
  CLEAN=0
  echo "⚠️  design2/main NÃO está no seu histórico local — você não integrou o trabalho do PG."
  echo "    Recomendado: git fetch \"\$AUTHED\" main && git merge FETCH_HEAD  (resolva conflitos) e rode de novo."
fi

# 4. árvore filtrada via índice temporário (sem mexer no working tree)
TMP_INDEX="$(mktemp)"; trap 'rm -f "$TMP_INDEX"' EXIT
GIT_INDEX_FILE="$TMP_INDEX" git read-tree "$SOURCE_REF"
for p in "${PRIVATE_PATHS[@]}"; do
  GIT_INDEX_FILE="$TMP_INDEX" git rm -r --cached --ignore-unmatch --quiet -- "$p" >/dev/null 2>&1 || true
done
TREE="$(GIT_INDEX_FILE="$TMP_INDEX" git write-tree)"

# 5. SAFETY: nenhum path privado sobreviveu na árvore (regex com metachars escapados)
for p in "${PRIVATE_PATHS[@]}"; do
  esc="$(printf '%s' "$p" | sed 's/[.[\*^$/]/\\&/g')"
  if git ls-tree -r --name-only "$TREE" | grep -qE "^${esc}(/|\$)"; then
    echo "✗ ABORT: '$p' ainda presente na árvore filtrada. Nada empurrado."; exit 1
  fi
done

# 6. preview + contagem ALTA de deleções (arquivos do PG que este snapshot removeria)
DEL="$(git diff --name-status "$BASE" "$TREE" | grep -cE '^D' || true)"
echo "── Preview: design2/main ($(git rev-parse --short "$BASE")) → $DEST_BRANCH ──"
git diff --stat "$BASE" "$TREE" || true
echo "────────────────────────────────────────────"
if [[ "$DEL" -gt 0 ]]; then
  echo "⚠️  Este snapshot APAGA $DEL arquivo(s) presentes no design2/main."
  [[ "$CLEAN" -eq 0 ]] && echo "    (esperado: integre o PG antes pra não propor remoções)."
fi

# 7. confirmação
read -rp "Empurrar pro design2 como '$DEST_BRANCH'? [y/N] " ans
[[ "$ans" == "y" || "$ans" == "Y" ]] || { echo "Cancelado."; exit 0; }

# 8. snapshot filtrado (squash) parenteado em design2/main → PR mesclável
SUBJECT="$(git log -1 --format='%s' "$SOURCE_REF")"
SNAP="$(git commit-tree "$TREE" -p "$BASE" -m "sync from origin: $SUBJECT")"

# 9. push (sem --force; non-ff rejeita limpo)
if git push "$AUTHED" "${SNAP}:refs/heads/${DEST_BRANCH}"; then
  echo "✓ design2: branch '$DEST_BRANCH' criada/atualizada — abra PR → main no GitHub."
  [[ "$CLEAN" -eq 1 && "$DEL" -eq 0 ]] && \
    echo "  (ff limpo — se quiser direto na main: git push \"\$AUTHED\" ${SNAP}:main)"
else
  echo "✗ Push rejeitado (branch divergiu). Tente outro nome: ./scripts/sync-design2.sh greg/sync-\$(date +%s)"; exit 1
fi
