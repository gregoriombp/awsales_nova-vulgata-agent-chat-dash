#!/usr/bin/env bash
# scripts/distill-memory.sh
# Lê os SEUS transcripts do Claude Code DESTE repo e converte pra Markdown legível,
# pra você revisar e colar os destaques (a "memória destilada") no chat.
#
# RODA NO SEU MAC. Não faz push, não toca no git. A saída vai pra FORA do repo
# (~/awsales-memory-raw), porque conversa pode ter segredo colado — nunca versionar.
#
#   bash scripts/distill-memory.sh
#
set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
OUT="$HOME/awsales-memory-raw"        # FORA do repo de propósito
mkdir -p "$OUT"

# O Claude Code guarda os transcripts em ~/.claude/projects/<caminho-do-repo-com-dashes>/
enc="$(printf '%s' "$ROOT" | sed 's#/#-#g')"
PROJ="$HOME/.claude/projects/$enc"

if [ ! -d "$PROJ" ]; then
  echo "Não achei transcripts deste repo em:"
  echo "  $PROJ"
  echo
  echo "Veja o que existe e ache a pasta certa com:"
  echo "  ls ~/.claude/projects/"
  echo "(Se a 'memória' for da extensão nativa do Cursor, ela não fica aqui — me avise.)"
  exit 0
fi

count=0
for j in "$PROJ"/*.jsonl; do
  [ -e "$j" ] || continue
  out="$OUT/$(basename "${j%.jsonl}").md"
  if command -v jq >/dev/null 2>&1; then
    jq -r '
      select(.message.content != null)
      | ((.message.role // .type) | ascii_upcase) as $who
      | (if (.message.content|type) == "string" then .message.content
         else ([.message.content[]? | .text // empty] | join("\n")) end) as $txt
      | select($txt != "")
      | "### " + $who + "\n" + $txt + "\n"
    ' "$j" 2>/dev/null > "$out" || cp "$j" "$out"
  else
    cp "$j" "$out"   # sem jq: copia o .jsonl cru (ainda legível)
  fi
  count=$((count + 1))
  echo "  ✓ $(basename "$out")"
done

echo
echo "Pronto: $count arquivo(s) em  $OUT"
echo "⚠️  Pode conter segredos colados em conversas — por isso fica FORA do repo."
echo
echo "Próximo passo: abra os .md em $OUT, copie os DESTAQUES (decisões, convenções,"
echo "preferências que você quer que o agente lembre) e cole no chat. Eu transformo"
echo "em docs/agent-memory.md (rastreado no origin, stripado do design2)."
