#!/usr/bin/env bash
# scripts/sync-design2.sh — publica o MEU protótipo no repo design2 (PG) de forma ADITIVA.
#
# O design2 divergiu MUITO do meu repo (o PG tem dirs inteiros que eu não tenho:
# prototype-studio/, supabase/, app/auth/, app/knowledge-os/, etc., e está à frente no
# review-bridge). Snapshot de árvore inteira APAGARIA tudo isso. Este script NÃO faz isso.
#
# Em vez disso ele calcula o DELTA REAL de conteúdo (design2/main ↔ meu HEAD) e aplica só
# os arquivos onde o MEU conteúdo de fato difere — como uma série de COMMITS ATÔMICOS numa
# branch nova baseada em design2/main — e abre um PR. Garantias fail-closed:
#   • NUNCA apaga arquivo que só o PG tem (modelo aditivo; deleção só com --prune e mesmo
#     assim só de arquivos que o PG não mexeu desde o fork).
#   • NUNCA toca nos caminhos PRESERVE (review-bridge inteiro + package.json/lock = versão do PG).
#   • NUNCA vaza os caminhos PRIVATE (skills, AGENTS.md, settings, este script…).
#   • NUNCA empurra pra design2/main nem usa --force. Sempre branch + PR.
#
# O território do PG fica fixo em PRESERVE_PATHS (abaixo) — localizado 1x; não precisa reanalisar
# o repo dele toda vez. "Tudo o que não é do PG é meu e sobe." Saída enxuta por padrão (1 linha
# SUMMARY); sem --commits, agrupa em commits atômicos por área sozinho — barato em token.
#
# Uso:
#   ./scripts/sync-design2.sh --yes                # PADRÃO: commits atômicos auto por área + PR (1 linha de saída)
#   ./scripts/sync-design2.sh --dry-run            # relatório + MANIFEST do que iria; NÃO escreve nada
#   ./scripts/sync-design2.sh                      # interativo: confirma antes de publicar
#   ./scripts/sync-design2.sh --commits PLAN.tsv   # commits atômicos com mensagens curadas (a skill gera)
#   ./scripts/sync-design2.sh greg/minha-br --yes  # nome de branch custom
#   ./scripts/sync-design2.sh --no-pr              # cria/empurra a branch mas não abre o PR
#   ./scripts/sync-design2.sh --locate-pg          # lista o território do PG (p/ revisar PRESERVE_PATHS)
#   ./scripts/sync-design2.sh --prune              # TAMBÉM propaga MINHAS deleções (só de arquivos
#                                                  # que o PG não tocou desde o fork) — use com cuidado
set -euo pipefail

# ── Caminhos PRIVATE: rastreados no origin (agentes cloud) mas NUNCA vão pro design2.
#    Mantida em sincronia com o comentário-âncora no .gitignore.
PRIVATE_PATHS=(
  ".claude/skills" ".claude/settings.json" ".mcp.json"
  "AGENTS.md" "CLAUDE.md" "AWSALES_CONTEXT.md" "BOMBARDIER.md"
  "scripts/sync-design2.sh"
  "docs/cursor-rules"
  ".cursor" ".agents" "cursor-import" ".codex"
)

# ── TERRITÓRIO DO PG (PRESERVE): este repo era meu; o PG foi mexendo por conta própria.
#    Tudo AQUI fica SEMPRE na versão dele — eu nunca toco. Tudo o que NÃO está aqui é meu e sobe.
#    Mesmo assim o sync é ADITIVO: nunca apago arquivo do PG fora desta lista (a lista é só pra
#    proteger os casos em que nós DOIS temos o mesmo arquivo e ele está à frente). Localizado 1x
#    comparando design2/main ↔ meu HEAD — rode `./scripts/sync-design2.sh --locate-pg` p/ reconferir.
PRESERVE_PATHS=(
  # review-mode / bridge — o PG está à frente (auth, backend Supabase dele)
  "review-bridge"                      # servidor do review-bridge
  "app/bombardier/review-bridge"       # UI in-app do review
  # lib/bombardier-review: o PG está à frente em ALGUNS arquivos (store.ts = backend Supabase
  # dele; + hooks/commentAssist/elementAnchor/useVoiceTranscription). Preservo SÓ esses — os
  # módulos novos do Greg (agents/skills/commandParse/agentSettingsStore/mobbin/…) sobem normal,
  # senão o build do design2 quebra com "Module not found" (consumidores sem suas dependências).
  "lib/bombardier-review/store.ts"
  "lib/bombardier-review/hooks.ts"
  "lib/bombardier-review/commentAssist.ts"
  "lib/bombardier-review/elementAnchor.ts"
  "lib/bombardier-review/useVoiceTranscription.ts"
  "components/bombardier-review"       # provider/canvas do review
  # subsistemas que são só do PG (eu nem tenho)
  "prototype-studio"                   # studio inteiro do PG
  "supabase"                           # migrations/config do PG
  "flow-bridge"                        # eu aposentei; o PG mantém
  "app/auth"                           # auth real do PG
  "app/knowledge-os"                   # knowledge-os do PG
  "lib/flow-signoff" "lib/notify" "lib/supabase" "lib/bombardier-team.ts"
  "middleware.ts"
  "public/onboarding"
  "scripts/agent-pin.mjs" "scripts/migrate-bridge-to-supabase.mjs"
  "docs/greg-onboarding.md" "docs/review-mode-prod.md"
  # settings: o PG estendeu shared.tsx (adicionou ApiKey/API_KEYS p/ a página de API dele).
  # A versão dele é SUPERSET da minha (só somou no topo) — preservo p/ não derrubar o API_KEYS,
  # senão a api/page.tsx dele quebra o build ("Export API_KEYS doesn't exist").
  "app/settings/(sections)/_components/shared.tsx"
  # deps — o PG tem supabase etc. no manifesto; não clobbero
  "package.json" "package-lock.json"
)

DESIGN2_URL_BASE="github.com/awsales/awsales-nova-vulgata-design.git"
DESIGN2_REPO="awsales/awsales-nova-vulgata-design"
DESIGN2_BASE_BRANCH="main"
SOURCE_REF="HEAD"

# ── AUTORIA dos commits enviados ao design2. PRECISA bater com uma conta do GitHub
#    (a conta greg_awsales), senão o check da Vercel falha:
#    "No GitHub account was found matching the commit author email".
#    Por isso NÃO usamos o git identity pessoal do Greg (gregmatuzalem@gmail.com) — usamos
#    o e-mail público/verificado da conta greg_awsales. Aplicada SÓ nos commit-tree abaixo,
#    via env (GIT_AUTHOR_*/GIT_COMMITTER_*): o git config local continua sendo o pessoal do
#    Greg, então não há nada a "restaurar" depois. Pode sobrescrever via env se mudar.
AWSALES_AUTHOR_NAME="${AWSALES_AUTHOR_NAME:-Greg}"
AWSALES_AUTHOR_EMAIL="${AWSALES_AUTHOR_EMAIL:-greg+awsales@awsales.io}"

# ── args ──────────────────────────────────────────────────────────────────────
DRY_RUN=0; ASSUME_YES=0; PRUNE=0; OPEN_PR=1; DEST_BRANCH=""; COMMITS_FILE=""; LOCATE_PG=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--dry-run) DRY_RUN=1 ;;
    -y|--yes)     ASSUME_YES=1 ;;
    --prune)      PRUNE=1 ;;
    --no-pr)      OPEN_PR=0 ;;
    --locate-pg)  LOCATE_PG=1 ;;
    --commits)    shift; COMMITS_FILE="${1:-}"; [[ -z "$COMMITS_FILE" ]] && { echo "✗ --commits exige um arquivo"; exit 1; } ;;
    --branch)     shift; DEST_BRANCH="${1:-}" ;;
    -h|--help)    sed -n '2,30p' "$0"; exit 0 ;;
    -*)           echo "✗ flag desconhecida: $1"; exit 1 ;;
    *)            DEST_BRANCH="$1" ;;
  esac
  shift
done
[[ -z "$DEST_BRANCH" ]] && DEST_BRANCH="greg/sync-$(date +%Y%m%d-%H%M)"

# helper: $1 é prefixo de algum item de uma lista passada como demais args?
path_in_list() { local p="$1"; shift; local q; for q in "$@"; do [[ "$p" == "$q" || "$p" == "$q"/* ]] && return 0; done; return 1; }

# 0. tree limpo (o snapshot vem do estado COMMITADO) — exigido só ao publicar
if [[ "$DRY_RUN" -ne 1 && "$LOCATE_PG" -ne 1 ]] && { ! git diff --quiet || ! git diff --cached --quiet; }; then
  echo "✗ Working tree sujo — commit ou stash antes (o snapshot vem do HEAD)."; exit 1
fi

# 1. token greg_awsales (git over https) — mesmo mecanismo do mirror antigo
TOKEN="$(gh auth token --user greg_awsales 2>/dev/null || true)"
[[ -z "$TOKEN" ]] && { echo "✗ Token greg_awsales não encontrado (gh auth login -u greg_awsales)."; exit 1; }
AUTHED="https://greg_awsales:${TOKEN}@${DESIGN2_URL_BASE}"

# 2. fetch design2/main
git fetch "$AUTHED" "$DESIGN2_BASE_BRANCH" || { echo "✗ fetch design2 falhou (veja o erro acima)."; exit 1; }
BASE="$(git rev-parse FETCH_HEAD)"
MB="$(git merge-base "$BASE" "$SOURCE_REF" 2>/dev/null || true)"

# --locate-pg: imprime o território do PG (pastas/arquivos que existem no design2 e não em mim).
# Use de vez em quando p/ ver se o PG criou pasta nova que valha adicionar em PRESERVE_PATHS.
if [[ "$LOCATE_PG" -eq 1 ]]; then
  echo "═══ território do PG (existe no design2/main @ $(git rev-parse --short "$BASE"), não no meu HEAD) ═══"
  comm -23 \
    <(git ls-tree -r --name-only "$BASE"        | awk -F/ 'NF>=2{print $1"/"$2}NF==1{print $1}' | sort -u) \
    <(git ls-tree -r --name-only "$SOURCE_REF"  | awk -F/ 'NF>=2{print $1"/"$2}NF==1{print $1}' | sort -u)
  echo "── compare com PRESERVE_PATHS no topo deste script; o que não estiver lá ainda é protegido"
  echo "   pelo modo ADITIVO (nunca apago), mas adicionar deixa o relatório honesto."
  exit 0
fi

# 3. estado de divergência
if [[ -n "$MB" ]] && git merge-base --is-ancestor "$BASE" "$SOURCE_REF"; then CLEAN=1; else CLEAN=0; fi

# 4. DELTA real de conteúdo: design2/main ↔ meu HEAD (só onde o conteúdo difere de fato)
#    A = só eu tenho · M = ambos têm e difere · D = só o PG tem (candidato a deleção)
TO_SEND=()        # "A"/"M" <TAB> path  → arquivos que vou aplicar (minha versão)
SKIP_PRESERVE=()  # mudei, mas é PRESERVE → fica a do PG
SKIP_PRIVATE=()   # mudei, mas é PRIVATE → nunca vaza
DEL_CAND=()       # D, fora de PRIVATE/PRESERVE → o PG tem e eu não
while IFS=$'\t' read -r st path; do
  [[ -z "${st:-}" ]] && continue
  st="${st:0:1}"
  case "$st" in
    A|M)
      if   path_in_list "$path" "${PRIVATE_PATHS[@]}";  then SKIP_PRIVATE+=("$path")
      elif path_in_list "$path" "${PRESERVE_PATHS[@]}"; then SKIP_PRESERVE+=("$path")
      else TO_SEND+=("$st"$'\t'"$path"); fi ;;
    D)
      if path_in_list "$path" "${PRIVATE_PATHS[@]}" || path_in_list "$path" "${PRESERVE_PATHS[@]}"; then :
      else DEL_CAND+=("$path"); fi ;;
  esac
done < <(git diff --name-status "$BASE" "$SOURCE_REF")

# 4b. com --prune: deleção só de arquivos que o PG NÃO tocou desde o fork (BASE:f == MB:f)
PRUNE_DEL=()
if [[ "$PRUNE" -eq 1 && -n "$MB" ]]; then
  for f in "${DEL_CAND[@]+"${DEL_CAND[@]}"}"; do
    base_blob="$(git rev-parse --quiet --verify "$BASE:$f" 2>/dev/null || true)"
    mb_blob="$(git rev-parse --quiet --verify "$MB:$f" 2>/dev/null || true)"
    [[ -n "$base_blob" && "$base_blob" == "$mb_blob" ]] && PRUNE_DEL+=("$f")
  done
fi

ADD=0; MOD=0
for e in "${TO_SEND[@]+"${TO_SEND[@]}"}"; do
  if [[ "${e:0:1}" == "A" ]]; then ADD=$((ADD+1)); else MOD=$((MOD+1)); fi
done
SHORT_BASE="$(git rev-parse --short "$BASE")"
SHORT_HEAD="$(git rev-parse --short "$SOURCE_REF")"
SUBJECT="$(git log -1 --format='%s' "$SOURCE_REF")"
[[ "$CLEAN" -eq 1 ]] && STATE="ff limpo (você tem todo o histórico do PG)" \
                     || STATE="DIVERGIU (design2 tem ${MB:+commits} que você não tem) — modo ADITIVO protege o PG"

# 5. RELATÓRIO — enxuto por padrão (1 linha SUMMARY). MANIFEST detalhado só no --dry-run.
echo "SUMMARY branch=$DEST_BRANCH base=$SHORT_BASE clean=$CLEAN add=$ADD mod=$MOD preserve=${#SKIP_PRESERVE[@]} pgonly_preservados=${#DEL_CAND[@]} prune=$([[ $PRUNE -eq 1 ]] && echo ${#PRUNE_DEL[@]} || echo 0)"
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "  origem $SHORT_HEAD \"$SUBJECT\" → design2/main @ $SHORT_BASE · $STATE"
  echo "MANIFEST-BEGIN"
  for e in "${TO_SEND[@]+"${TO_SEND[@]}"}"; do printf '%s\n' "$e"; done
  for f in "${PRUNE_DEL[@]+"${PRUNE_DEL[@]}"}"; do printf 'D\t%s\n' "$f"; done
  echo "MANIFEST-END"
fi

if [[ ${#TO_SEND[@]} -eq 0 && ${#PRUNE_DEL[@]} -eq 0 ]]; then
  echo "✓ Nada a enviar — design2 já está em dia com o seu protótipo nesses caminhos."; exit 0
fi

# 6. dry-run para aqui
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "DRY-RUN: nada empurrado. Rode sem --dry-run (ou com --yes) pra publicar."; exit 0
fi

# 7. confirmação
if [[ "$ASSUME_YES" -ne 1 ]]; then
  read -rp "Criar branch '$DEST_BRANCH' no design2 (+${ADD}/~${MOD}) e abrir PR? [y/N] " ans
  [[ "$ans" == "y" || "$ans" == "Y" ]] || { echo "Cancelado."; exit 0; }
fi

# ── lista de TODOS os caminhos aprovados (manifest) — guarda fail-closed ───────
#    (newline-delimited p/ rodar no bash 3.2 do macOS — sem associative arrays)
APPROVED_LIST=""
for e in "${TO_SEND[@]+"${TO_SEND[@]}"}"; do APPROVED_LIST+="${e#*$'\t'}"$'\n'; done
for f in "${PRUNE_DEL[@]+"${PRUNE_DEL[@]}"}"; do APPROVED_LIST+="$f"$'\n'; done
is_approved() { printf '%s' "$APPROVED_LIST" | grep -qxF -- "$1"; }

# 8. monta os GRUPOS de commit (atômicos). De um plano (--commits) ou auto por área.
#    Formato do plano (TSV): <mensagem> \t <arquivo> \t <arquivo> …  (1 commit por linha)
GROUP_MSGS=(); GROUP_FILES=()   # GROUP_FILES[i] = lista de arquivos separada por \n
if [[ -n "$COMMITS_FILE" ]]; then
  [[ -f "$COMMITS_FILE" ]] || { echo "✗ plano de commits não encontrado: $COMMITS_FILE"; exit 1; }
  PLAN_FILES=""
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" ]] && continue
    msg="${line%%$'\t'*}"; rest="${line#*$'\t'}"
    files=""
    while [[ "$rest" != "$msg" && -n "$rest" ]]; do
      f="${rest%%$'\t'*}"
      is_approved "$f" || { echo "✗ ABORT: plano referencia arquivo fora do manifest: '$f'"; exit 1; }
      files+="$f"$'\n'; PLAN_FILES+="$f"$'\n'
      [[ "$rest" == *$'\t'* ]] && rest="${rest#*$'\t'}" || rest=""
    done
    GROUP_MSGS+=("$msg"); GROUP_FILES+=("$files")
  done < "$COMMITS_FILE"
  # todo arquivo aprovado precisa estar em algum grupo
  while IFS= read -r k; do
    [[ -z "$k" ]] && continue
    printf '%s' "$PLAN_FILES" | grep -qxF -- "$k" || { echo "✗ ABORT: arquivo do manifest fora do plano: '$k'"; exit 1; }
  done < <(printf '%s' "$APPROVED_LIST")
else
  # auto: agrupa por área e emite uma mensagem convencional por grupo
  area_of() { case "$1" in
      app/bombardier/styleguide/*) echo "styleguide";;
      app/bombardier/*)            echo "bombardier";;
      app/settings/*)              echo "settings";;
      app/*)                       echo "app";;
      components/ui/*)             echo "components/ui";;
      components/*)                echo "components";;
      lib/*)                       echo "lib";;
      public/*)                    echo "assets";;
      docs/*)                      echo "docs";;
      *)                           echo "${1%%/*}";;
    esac; }
  # pares "área \t arquivo", preservando ordem de aparição
  PAIRS=""
  for e in "${TO_SEND[@]+"${TO_SEND[@]}"}"; do f="${e#*$'\t'}"; PAIRS+="$(area_of "$f")"$'\t'"$f"$'\n'; done
  for f in "${PRUNE_DEL[@]+"${PRUNE_DEL[@]}"}"; do PAIRS+="$(area_of "$f")"$'\t'"$f"$'\n'; done
  while IFS= read -r a; do
    [[ -z "$a" ]] && continue
    files="$(printf '%s' "$PAIRS" | awk -F'\t' -v a="$a" '$1==a{print $2}')"
    n="$(printf '%s\n' "$files" | grep -c .)"
    GROUP_MSGS+=("sync($a): ${n} arquivo(s) do protótipo do Greg")
    GROUP_FILES+=("$files"$'\n')
  done < <(printf '%s' "$PAIRS" | cut -f1 | awk 'NF && !seen[$0]++')
fi

# 9. constrói a cadeia de commits atômicos via plumbing (sem tocar no working tree)
TMP_INDEX="$(mktemp)"; trap 'rm -f "$TMP_INDEX"' EXIT
GIT_INDEX_FILE="$TMP_INDEX" git read-tree "$BASE"     # parte da árvore COMPLETA do PG
PREV="$BASE"
overlay_file() {  # aplica a MINHA versão (ou remove) de $1 no índice temporário
  local f="$1"
  if git cat-file -e "$SOURCE_REF:$f" 2>/dev/null; then
    local line mode rest sha
    line="$(git ls-tree "$SOURCE_REF" -- "$f")"   # "<mode> blob <sha>\t<path>"
    mode="${line%% *}"; rest="${line#* blob }"; sha="${rest%%$'\t'*}"
    GIT_INDEX_FILE="$TMP_INDEX" git update-index --add --cacheinfo "${mode},${sha},${f}"
  else
    GIT_INDEX_FILE="$TMP_INDEX" git update-index --force-remove -- "$f" 2>/dev/null || true
  fi
}
for i in "${!GROUP_MSGS[@]}"; do
  while IFS= read -r f; do [[ -n "$f" ]] && overlay_file "$f"; done <<<"${GROUP_FILES[$i]}"
  TREE="$(GIT_INDEX_FILE="$TMP_INDEX" git write-tree)"
  if [[ "$TREE" == "$(git rev-parse "$PREV^{tree}")" ]]; then continue; fi   # grupo vazio → pula
  # autoria = conta greg_awsales (env-scoped: NÃO mexe no git config pessoal do Greg)
  PREV="$(GIT_AUTHOR_NAME="$AWSALES_AUTHOR_NAME"   GIT_AUTHOR_EMAIL="$AWSALES_AUTHOR_EMAIL" \
          GIT_COMMITTER_NAME="$AWSALES_AUTHOR_NAME" GIT_COMMITTER_EMAIL="$AWSALES_AUTHOR_EMAIL" \
          git commit-tree "$TREE" -p "$PREV" -m "${GROUP_MSGS[$i]}")"
done
TIP="$PREV"
[[ "$TIP" == "$BASE" ]] && { echo "✗ Nada commitado (todos os grupos vazios)."; exit 1; }

# 10. SAFETY pós-build: a branch só pode tocar o que foi aprovado, nunca PRESERVE/PRIVATE
while IFS=$'\t' read -r st path; do
  [[ -z "${path:-}" ]] && continue
  if [[ "${st:0:1}" == "D" && "$PRUNE" -ne 1 ]]; then
    echo "✗ ABORT: deleção inesperada de '$path' sem --prune. Nada empurrado."; exit 1
  fi
  if path_in_list "$path" "${PRIVATE_PATHS[@]}"; then
    echo "✗ ABORT: caminho PRIVATE '$path' vazou pra árvore. Nada empurrado."; exit 1; fi
  if path_in_list "$path" "${PRESERVE_PATHS[@]}"; then
    echo "✗ ABORT: caminho PRESERVE '$path' foi modificado. Nada empurrado."; exit 1; fi
  if ! is_approved "$path"; then
    echo "✗ ABORT: '$path' mudou mas não está no manifest aprovado. Nada empurrado."; exit 1; fi
done < <(git diff --name-status "$BASE" "$TIP")

# 10b. SAFETY de autoria: todo commit novo precisa estar com o e-mail da conta greg_awsales
#      (senão a Vercel rejeita: "No GitHub account was found matching the commit author email").
BAD_AUTHOR="$(git log --format='%ae' "${BASE}..${TIP}" | grep -vxF "$AWSALES_AUTHOR_EMAIL" | head -1 || true)"
if [[ -n "$BAD_AUTHOR" ]]; then
  echo "✗ ABORT: commit autoria '$BAD_AUTHOR' ≠ '$AWSALES_AUTHOR_EMAIL'. Nada empurrado."; exit 1
fi

# 11. push da branch (sem --force; non-ff rejeita limpo)
if ! git push "$AUTHED" "${TIP}:refs/heads/${DEST_BRANCH}"; then
  echo "✗ Push rejeitado (a branch '$DEST_BRANCH' já existe e divergiu). Rode com outro --branch."; exit 1
fi
N_COMMITS="$(git rev-list --count "${BASE}..${TIP}")"
echo "✓ design2: branch '$DEST_BRANCH' criada com $N_COMMITS commit(s) atômico(s)."

# 12. abre o PR (a menos que --no-pr)
if [[ "$OPEN_PR" -eq 1 ]]; then
  PR_TITLE="sync(protótipo do Greg): $SUBJECT"
  PR_BODY="$(printf 'Sync ADITIVO do protótipo do Greg sobre design2/main @ %s.\n\n- +%d novos / ~%d modificados (só onde o conteúdo difere)\n- review-bridge e deps: PRESERVADOS (versão do PG)\n- %d arquivo(s) que só o PG tem: intactos\n\n%d commit(s) atômico(s). Revisar e mesclar.\n\n🤖 gerado por scripts/sync-design2.sh' "$SHORT_BASE" "$ADD" "$MOD" "${#DEL_CAND[@]}" "$N_COMMITS")"
  PR_URL="$(GH_TOKEN="$TOKEN" gh pr create --repo "$DESIGN2_REPO" --base "$DESIGN2_BASE_BRANCH" \
            --head "$DEST_BRANCH" --title "$PR_TITLE" --body "$PR_BODY" 2>/dev/null || true)"
  if [[ -z "$PR_URL" ]]; then
    PR_URL="$(curl -fsS -X POST -H "Authorization: token ${TOKEN}" -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/${DESIGN2_REPO}/pulls" \
      -d "$(printf '{"title":%s,"head":%s,"base":%s,"body":"sync aditivo do protótipo do Greg — %d commits atômicos"}' \
            "\"${PR_TITLE//\"/\\\"}\"" "\"${DEST_BRANCH}\"" "\"${DESIGN2_BASE_BRANCH}\"" "$N_COMMITS")" \
      2>/dev/null | grep -oE '"html_url": *"[^"]*/pull/[0-9]+"' | head -1 | sed -E 's/.*"(https[^"]+)"/\1/' || true)"
  fi
  if [[ -n "$PR_URL" ]]; then echo "✓ PR aberto: $PR_URL"
  else echo "⚠️  Branch no ar, mas não consegui abrir o PR automaticamente. Abra manualmente: https://github.com/${DESIGN2_REPO}/compare/${DESIGN2_BASE_BRANCH}...${DEST_BRANCH}?expand=1"; fi
else
  echo "  (--no-pr) Abra o PR: https://github.com/${DESIGN2_REPO}/compare/${DESIGN2_BASE_BRANCH}...${DEST_BRANCH}?expand=1"
fi
