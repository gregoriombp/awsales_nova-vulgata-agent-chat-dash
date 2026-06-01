#!/usr/bin/env bash
# scripts/sync-design2.sh — publica um snapshot FILTRADO do main local no repo design2 (PG),
# SEM os arquivos privados que vivem no origin. Padrão: branch datada (nunca sobrescreve main,
# nunca clobbera o PG). O PG mescla a branch via PR.
#
# Uso:
#   ./scripts/sync-design2.sh                 # interativo: relatório + confirma + empurra (branch datada)
#   ./scripts/sync-design2.sh --dry-run       # só o relatório; NÃO empurra (usado pela skill /send-to-aws)
#   ./scripts/sync-design2.sh --yes           # empurra sem perguntar (skill usa após confirmação no chat)
#   ./scripts/sync-design2.sh greg/minha-br   # nome de branch custom (combina com --yes/--dry-run)
#   ./scripts/sync-design2.sh main --yes      # override p/ main (só ff limpo; senão rejeita)
set -euo pipefail

# Lista canônica do que é RASTREADO no origin mas NUNCA vai pro working tree do design2.
# Cobre o diretório .claude/skills/ INTEIRO — qualquer skill ali (incl. globais copiadas) é
# removida do design2 automaticamente. Mantida em sincronia com o comentário-âncora no .gitignore.
PRIVATE_PATHS=(
  ".claude/skills" ".claude/settings.json"
  "AGENTS.md" "CLAUDE.md" "AWSALES_CONTEXT.md" "BOMBARDIER.md"
  "scripts/sync-design2.sh"
)
DESIGN2_URL_BASE="github.com/awsales/awsales-nova-vulgata-design.git"
SOURCE_REF="HEAD"

# --- args: flags + nome de branch posicional ---
DRY_RUN=0; ASSUME_YES=0; DEST_BRANCH=""
for arg in "$@"; do
  case "$arg" in
    -n|--dry-run) DRY_RUN=1 ;;
    -y|--yes)     ASSUME_YES=1 ;;
    -h|--help)    sed -n '2,11p' "$0"; exit 0 ;;
    -*)           echo "✗ flag desconhecida: $arg"; exit 1 ;;
    *)            DEST_BRANCH="$arg" ;;
  esac
done
[[ -z "$DEST_BRANCH" ]] && DEST_BRANCH="greg/sync-$(date +%Y%m%d-%H%M)"

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
if git merge-base --is-ancestor "$BASE" "$SOURCE_REF"; then CLEAN=1; else CLEAN=0; fi

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

# 6. contagens add/mod/del (del = arquivos do PG que este snapshot removeria)
NS="$(git diff --name-status "$BASE" "$TREE" || true)"
ADD="$(printf '%s\n' "$NS" | grep -cE '^A' || true)"
MOD="$(printf '%s\n' "$NS" | grep -cE '^M' || true)"
DEL="$(printf '%s\n' "$NS" | grep -cE '^D' || true)"
SHORT_BASE="$(git rev-parse --short "$BASE")"
SHORT_HEAD="$(git rev-parse --short "$SOURCE_REF")"
SUBJECT="$(git log -1 --format='%s' "$SOURCE_REF")"
[[ "$CLEAN" -eq 1 ]] && STATE="ff limpo (você tem todo o trabalho do PG)" \
                     || STATE="DIVERGIU (design2 tem commits que você não tem)"

# 7. RELATÓRIO
echo "═══ sync-design2 — relatório ═══"
echo "  Origem:   $SHORT_HEAD  \"$SUBJECT\""
echo "  Destino:  design2 → branch '$DEST_BRANCH'"
echo "  Base:     design2/main @ $SHORT_BASE"
echo "  Estado:   $STATE"
echo "  Mudanças: +${ADD} add   ~${MOD} mod   -${DEL} del"
echo "  Privados: removidos OK (assert passou)"
[[ "$DEL" -gt 0 ]] && echo "  ⚠️  APAGA $DEL arquivo(s) presentes no design2/main — revise! (integre o PG antes: git fetch <design2> main && git merge FETCH_HEAD)"
echo "  SUMMARY branch=$DEST_BRANCH base=$SHORT_BASE clean=$CLEAN add=$ADD mod=$MOD del=$DEL"
echo "════════════════════════════════"

# 8. dry-run para aqui (a skill /send-to-aws usa isto pra montar o relatório no chat)
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "DRY-RUN: nada empurrado. Rode sem --dry-run (ou com --yes) pra publicar."; exit 0
fi

# 9. confirmação (pulada com --yes)
if [[ "$ASSUME_YES" -ne 1 ]]; then
  read -rp "Empurrar pro design2 como '$DEST_BRANCH'? [y/N] " ans
  [[ "$ans" == "y" || "$ans" == "Y" ]] || { echo "Cancelado."; exit 0; }
fi

# 10. snapshot filtrado (squash) parenteado em design2/main → PR mesclável
SNAP="$(git commit-tree "$TREE" -p "$BASE" -m "sync from origin: $SUBJECT")"

# 11. push (sem --force; non-ff rejeita limpo)
if git push "$AUTHED" "${SNAP}:refs/heads/${DEST_BRANCH}"; then
  echo "✓ design2: branch '$DEST_BRANCH' criada/atualizada — abra PR → main no GitHub."
  [[ "$CLEAN" -eq 1 && "$DEL" -eq 0 ]] && \
    echo "  (ff limpo — se quiser direto na main: git push \"\$AUTHED\" ${SNAP}:main)"
else
  echo "✗ Push rejeitado (branch divergiu). Tente outro nome: ./scripts/sync-design2.sh greg/sync-\$(date +%s) --yes"; exit 1
fi
