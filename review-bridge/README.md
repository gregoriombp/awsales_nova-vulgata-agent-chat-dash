# Bombardier Review Bridge

Servidor LAN que sincroniza os comentários visuais do **Review Mode** (Bombardier)
entre os dispositivos do time. Roda em `http://<seu-ip>:9878`, autenticado por token
compartilhado. Persiste em arquivos JSON locais (`lowdb`).

> **Como subir:** use a skill `/review-bridge` (`.claude/skills/bombardier-review-bridge/SKILL.md`).
> Este README cobre arquitetura, ciclo de vida e API — não o passo a passo de boot.

---

## Lifecycle de um comment

```
                       ┌─────────────────────────────────────┐
                       │                                     │
                       ▼                                     │
  (cria pin/desenho)  open  ──── transition: in_review ─►  in_review
                       │                                     │
                       │ transition: resolve_direct          │ transition: approve
                       │ (user marca como resolvido)         │ (user aprova revisão)
                       │                                     │
                       └─────────►  resolved  ◄──────────────┘
                                       │
                                       │ comments.archive.json
                                       │
                                       ▼
                                  (arquivado — fora da listagem padrão)

  in_review  ── transition: reject ──►  open       (rejeita: volta pra ativo)
  resolved   ── transition: reopen_from_archive ──►  open  (desarquiva)
```

**Resumo:**

- `open` → comment ativo, ninguém ainda alegou resolver.
- `in_review` → algum **agente** ou **usuário** alegou resolver e está aguardando aprovação humana. Vive no mesmo arquivo que os abertos.
- `resolved` → aprovado. **Sai fisicamente** de `comments.json` e vai pra `comments.archive.json`.

A separação física do arquivo arquivo existe para que **agentes que leem o JSON pra contexto** só vejam comments ainda em jogo — sem ler centenas de comments já resolvidos que vazam pra dentro da janela de contexto.

---

## Arquivos de dados

| Arquivo | Conteúdo | Quando ler |
|---|---|---|
| `data/comments.json` | comments com status `open` e `in_review` + identidades dos revisores | sempre |
| `data/comments.archive.json` | comments com status `resolved` (arquivados) | só quando você precisa consultar histórico |

`schemaVersion = 3`. A migração de v2 → v3 acontece automaticamente no boot do bridge:

1. comments com `status: "resolved"` são movidos pro `comments.archive.json`.
2. O campo legado `resolvedBy: string` vira `resolution: { actor, at, summary, ... }`.
3. O campo legado `resolvedAt: number` é mesclado dentro de `resolution.at`.

---

## API HTTP

Base URL: `http://<host>:9878`. Todas as rotas (exceto `/health`) exigem o header:

```
X-Review-Token: <token compartilhado>
```

### Listagem

| Método | Path | Descrição |
|---|---|---|
| `GET` | `/health` | OK, versão, esquema, contagem de subscribers SSE |
| `GET` | `/comments?url=&status=` | Ativos. `status` aceita `open` ou `in_review`. Resolvidos **não saem aqui** |
| `GET` | `/comments/archive?url=&before=&limit=` | Arquivo, paginado por cursor `updatedAt` |
| `GET` | `/comments/:id` | Retorna `{ comment, location: "main" \| "archive" }` |

### Modificação

| Método | Path | Notas |
|---|---|---|
| `PUT` | `/comments/:id` | **Modo upsert** (body é um `ReviewComment` completo) — cria/edita texto, anchor, autor. **Modo transição** (body com `{ transition, actor }`) — ver abaixo |
| `POST` | `/comments/:id/replies` | Adiciona reply. Funciona em comments do main e do arquivo |
| `DELETE` | `/comments/:id` | Remove totalmente (main ou archive) |

### Transitions (modo `PUT /comments/:id` com `transition`)

| `transition` | Efeito | `actor` obrigatório? |
|---|---|---|
| `in_review` | open → in_review, popula `resolution` com a string formatada | sim |
| `approve` | in_review → resolved, move pro archive, popula `resolution.approvedAt/approvedBy` | sim (quem aprovou) |
| `reject` | in_review → open, limpa `resolution`. Replies preservadas | não |
| `resolve_direct` | open → resolved direto (user marcou sem agente intermediário). Move pro archive | sim |
| `reopen_from_archive` | resolved → open, move do archive pro main | não |

Erro `400 { error: "invalid_actor" }` quando o `actor` é exigido e está ausente/malformado.

### Outros

| Método | Path | |
|---|---|---|
| `PUT` | `/identity/:id` | Upsert da identidade do revisor |
| `GET` | `/export` | Snapshot completo: `comments[]` + `archivedComments[]` |
| `POST` | `/import` | Merge de snapshot (skipa IDs duplicados) |
| `GET` | `/events` | SSE: `comment.upserted`, `comment.deleted`, `comment.archived`, `comment.unarchived`, `reply.added`, `hello` |

---

## Como agentes resolvem comments

Quando o usuário pedir "resolve esse aí", **NÃO chame o endpoint legado de upsert**.
Use o transition `in_review` — o usuário aprova ou rejeita depois pelo inbox.

```bash
curl -X PUT "http://<host>:9878/comments/$ID" \
  -H "X-Review-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transition": "in_review",
    "actor": { "kind": "agent", "id": "claude", "name": "Claude" }
  }'
```

Resposta:

```json
{
  "ok": true,
  "location": "main",
  "comment": {
    "id": "cmt-...",
    "status": "in_review",
    "resolution": {
      "actor": { "kind": "agent", "id": "claude", "name": "Claude" },
      "at": 1779800744000,
      "summary": "Resolvido por Claude em 20/05/2026 às 16:05:44."
    },
    ...
  }
}
```

O campo `resolution.summary` é **sempre** uma string no formato:

```
Resolvido por <name> em DD/MM/YYYY às HH:MM:SS.
```

Outros agentes que lerem esse JSON depois saberão exatamente quem alegou resolver e quando. Use timezone do servidor (horário da máquina rodando o bridge).

---

## Como agentes respondem a comments

Use o endpoint de replies quando você tiver uma dúvida, opinião ou pergunta antes de
resolver — o usuário vê a thread inteira no card.

```bash
curl -X POST "http://<host>:9878/comments/$ID/replies" \
  -H "X-Review-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "authorKind": "agent",
    "authorId": "claude",
    "authorName": "Claude",
    "authorColorToken": "var(--aw-purple-600)",
    "text": "Antes de fixar isso, prefere botão primário ou ghost?"
  }'
```

Resposta: `{ "reply": {...}, "location": "main" | "archive" }`.

Replies funcionam em qualquer comment, independente do status (até em arquivados — útil para deixar nota sobre uma decisão antiga).

---

## Como agentes leem só o que importa

| Cenário | Endpoint sugerido |
|---|---|
| Trabalhar nos comments **abertos** da página em que o user está | `GET /comments?url=/caminho/da/pagina&status=open` |
| Revisar a fila do que **você (agente)** já marcou em revisão | `GET /comments?status=in_review` |
| Olhar histórico de uma página específica | `GET /comments/archive?url=/caminho&limit=20` |

> Não busque `GET /comments` sem filtro a menos que você precise mesmo de todos os
> ativos. O archive não vem por padrão — chame `/comments/archive` explicitamente.

---

## Migração v2 → v3

Acontece no boot, idempotente. O que muda:

1. `schemaVersion: 2` → `3` em `data/comments.json` e `data/comments.archive.json`.
2. Status `"resolved"` que estavam no main migram pro archive.
3. `resolvedBy: "Gregorio"` + `resolvedAt: 1779...` viram:
   ```json
   {
     "resolution": {
       "actor": { "kind": "user", "id": "legacy", "name": "Gregorio" },
       "at": 1779...,
       "summary": "Resolvido por Gregorio em DD/MM/YYYY às HH:MM:SS."
     }
   }
   ```
4. Comments sem `resolvedBy` que estavam como `resolved` ganham `actor = { kind: "user", id: "legacy", name: "unknown" }`.

Rollback: a v2 não tinha o conceito de archive, então um downgrade exigiria mesclar
os dois arquivos de volta e reescrever `resolvedBy`/`resolvedAt` como flat strings.
**Não há script automatizado** — guarde backup antes de fazer downgrade.

---

## Troubleshooting

Pra subir o servidor, ver `.claude/skills/bombardier-review-bridge/SKILL.md`. Problemas comuns:

| Sintoma | Causa | Onde checar |
|---|---|---|
| `EADDRINUSE :9878` | porta ocupada | `lsof -i :9878` |
| 401 do `/health` | token errado | comparar `review-bridge/.env` e `.env.local` |
| Frontend não conecta | `NEXT_PUBLIC_*` velho em cache do Next | reiniciar `npm run dev` |
| Outras máquinas não enxergam | firewall do macOS | System Settings → Network → Firewall |
| Comment "some" depois de aprovar | foi pro archive — esperado | `GET /comments/archive` |
| Agente alegou resolver mas user não vê em revisão | falta `actor.kind === "agent"` na request | inspecionar curl |

---

## Convenções de identidade do actor

- `kind: "user"` — revisor humano. O `id` é o `ReviewIdentity.id` (UUID gerado pelo overlay no primeiro uso) e o `name` é o nome que o user escolheu.
- `kind: "agent"` — qualquer cliente automatizado. Use um id estável por tipo de agente (`claude`, `claude-haiku`, `cursor`, etc.) e um `name` legível pra humanos.

Para Claude Code, o padrão recomendado é:

```json
{ "kind": "agent", "id": "claude", "name": "Claude" }
```

Se você é um agente diferente, mude o `id` e `name`. O `colorToken` é opcional em replies — default `var(--fg-tertiary)`.
