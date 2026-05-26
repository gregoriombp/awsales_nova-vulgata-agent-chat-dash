# Bombardier Flow Bridge

Servidor LAN que armazena as sugestões de edição feitas nos UX flows do styleguide
(`/bombardier/styleguide/ux-flows/<flow>`). Roda em `http://<seu-ip>:9879`,
autenticado por token compartilhado. Persiste em arquivos JSON locais (`lowdb`).

> **Como subir:** use a skill `/bombardier-flow-bridge`.
> **Como resolver sugestões em lote:** use a skill `/bombardier-flow-bridge-solve`.

Mesmo padrão do `review-bridge/`, adaptado para sugestões de fluxograma.

---

## Lifecycle de uma sugestão

```
                       ┌──────────────────────────────────┐
                       │                                  │
                       ▼                                  │
  (user salva)        open  ── transition: in_review ──► in_review
                       │                                  │
                       │ transition: discard              │ transition: apply     (claude aplicou no código)
                       │ (user descarta direto)           │ transition: discard   (user prefere não aplicar)
                       │                                  │ transition: reject    (volta pra open)
                       │                                  │
                       └────────►  applied / discarded  ◄─┘
                                       │
                                       │ suggestions.archive.json
                                       │
                                       ▼
                                  (arquivado — fora da listagem padrão)

  applied | discarded ── transition: reopen_from_archive ──► open
```

**Resumo:**

- `open` — sugestão criada pelo user, nenhum agente ainda olhou.
- `in_review` — algum agente (geralmente Claude) reivindicou e tá analisando/propondo.
- `applied` — Claude editou os arquivos do flow e o user aprovou; sai do arquivo principal.
- `discarded` — sugestão descartada antes ou depois da revisão; sai do arquivo principal.

A separação física do arquivo é a mesma do review-bridge: agentes que leem o JSON
pra contexto só veem o que ainda está em jogo, sem inundar a janela com sugestões já
aplicadas/descartadas.

---

## Arquivos de dados

| Arquivo | Conteúdo | Quando ler |
|---|---|---|
| `data/suggestions.json` | sugestões `open` e `in_review` | sempre |
| `data/suggestions.archive.json` | sugestões `applied` e `discarded` | só pra histórico |

`schemaVersion = 1`. Sugestões com `applied`/`discarded` que ficarem no arquivo
principal (ex: edição manual) são movidas pro archive no boot — sweep idempotente.

---

## API HTTP

Base URL: `http://<host>:9879`. Todas as rotas (exceto `/health`) exigem:

```
X-Flow-Token: <token compartilhado>
```

### Listagem

| Método | Path | Descrição |
|---|---|---|
| `GET` | `/health` | OK, versão, esquema, paths dos arquivos |
| `GET` | `/suggestions?flow=&status=` | Ativas. `status` aceita `open` / `in_review` (default: ambos). `flow` filtra pelo slug do flow |
| `GET` | `/suggestions/archive?flow=&before=&limit=` | Arquivadas, paginadas por cursor `updatedAt` |
| `GET` | `/suggestions/:id` | Retorna `{ suggestion, location: "main" \| "archive" }` |

### Criação

`POST /suggestions`

```json
{
  "flow": "login-auth",
  "description": "Adicionei bloqueio de conta após 5 tentativas inválidas",
  "authorName": "Greg",
  "nodes": [ /* ReactFlow nodes */ ],
  "edges": [ /* ReactFlow edges */ ]
}
```

Retorna a sugestão criada com `id`, `createdAt`, `status: "open"`.

### Transições

`PUT /suggestions/:id`

| `transition` | De | Pra | Body extra | Quem faz |
|---|---|---|---|---|
| `in_review` | `open` | `in_review` | `actor` | agente que vai analisar |
| `reject` | `in_review` | `open` | — | user (não gostou da proposta) |
| `apply` | qualquer | `applied` (→ archive) | `actor` | user após aprovar a aplicação |
| `discard` | qualquer | `discarded` (→ archive) | `actor` | user ou agente |
| `reopen_from_archive` | `applied` ou `discarded` | `open` (←main) | — | qualquer |

`actor` é sempre `{ kind: "agent" \| "user", id: string, name: string }`.

### Outras

| Método | Path | Notas |
|---|---|---|
| `DELETE` | `/suggestions/:id` | Apaga de vez (não recupera). Use `discard` se quiser preservar histórico. |
| `GET` | `/export` | Snapshot completo (principal + arquivo) — útil pra backup/import futuro. |

---

## Envs

### Server (`flow-bridge/.env`)

```
BOMBARDIER_FLOW_TOKEN=<gerado por openssl rand -hex 32>
BOMBARDIER_FLOW_PORT=9879           # opcional
BOMBARDIER_FLOW_HOST=0.0.0.0        # opcional
```

### Frontend (raiz `.env.local`)

```
NEXT_PUBLIC_BOMBARDIER_FLOW_BRIDGE_URL=http://<hostname>.local:9879
NEXT_PUBLIC_BOMBARDIER_FLOW_TOKEN=<mesmo token>
```

> **Memória do projeto:** preferir `<hostname>.local` (mDNS) em vez de IP cru —
> sobrevive a troca de WiFi sem reconfigurar. Ver `feedback_lan_use_mdns_hostname`.

---

## Como rodar

```bash
# instalar deps (1ª vez)
npm run flow-bridge:install

# subir em dev (watch)
npm run flow-bridge:dev

# subir em prod-ish
npm run flow-bridge
```

Use a skill `/bombardier-flow-bridge` pra automatizar: gera token, descobre IP,
escreve `.env.local`, sobe em background.
