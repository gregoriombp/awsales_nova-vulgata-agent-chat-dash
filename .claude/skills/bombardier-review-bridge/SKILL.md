---
name: bombardier-review-bridge
description: >
  Sobe o servidor local do Bombardier Review Mode (review-bridge) pra
  sincronizar comentários entre revisores na mesma LAN. Cobre: instalar
  deps se precisar, gerar token de auth se não existir, descobrir o IP
  local da máquina, escrever as duas envs do frontend (URL + token) no
  .env.local, iniciar o servidor em background, e validar que /health
  responde com schema v3. Use quando o usuário pedir
  "/bombardier-review-bridge", "subir o review-bridge", "iniciar bridge
  de review", "ligar o servidor de comentários", "começar review com o
  time", "abrir review-bridge", "/review-bridge", ou similares.
  Não usar para resolver comentários — pra isso, ver
  `bombardier-review-bridge-solve`.
---

# Bombardier Review Mode — Subir o Bridge

Esta skill prepara tudo pro **review-bridge** (servidor Express + lowdb em
`review-bridge/`) rodar localmente em LAN. Ela NÃO resolve comentários — só
sobe a infra. Pra resolver/aprovar/responder em lote, use a skill irmã
`bombardier-review-bridge-solve`.

> **Arquitetura, lifecycle, API completa e exemplos curl pra agentes:**
> sempre consulte `review-bridge/README.md`. Esse arquivo descreve o
> esquema atual (v3: `open | in_review | resolved`), o split físico
> `comments.json` (ativos) / `comments.archive.json` (arquivados), e
> todas as transitions/endpoints.

## Pré-checagem (sempre rodar primeiro)

Antes de qualquer ação, confirme em paralelo:

1. `review-bridge/package.json` existe → senão **abortar** com mensagem
   pedindo pra rodar a etapa de scaffolding do servidor (não recrie aqui).
2. `review-bridge/node_modules/` existe → se não, anotar que vai precisar
   instalar.
3. `review-bridge/.env` existe → se não, anotar que vai precisar gerar.
4. `.env.local` existe na raiz → necessário pra escrever as envs do frontend.

## Passos

### 1. Instalar deps (se precisar)

```bash
npm run review-bridge:install
```

Pula se `review-bridge/node_modules/` já existe.

### 2. Gerar token (se precisar)

Se `review-bridge/.env` não existe:

```bash
TOKEN=$(openssl rand -hex 32)
echo "BOMBARDIER_REVIEW_TOKEN=$TOKEN" > review-bridge/.env
```

Se já existe, **leia** o valor de `BOMBARDIER_REVIEW_TOKEN` no arquivo —
não regenere (invalidaria configs já distribuídas pro time).

### 3. Escanear o IP de LAN da máquina (interface ativa)

> **Decisão do projeto (atualizada 2026-06):** usar o **IP da interface ativa**
> — a rede onde a máquina está conectada agora — em vez de `<hostname>.local`
> ou `0.0.0.0`. Como esta skill re-escaneia toda vez que sobe o bridge, trocar
> de WiFi/LAN é só rodar a skill de novo. Ver `feedback_lan_use_active_ip`.

```bash
# macOS — interface do default route, depois o IPv4 dela
IFACE="$(route -n get default 2>/dev/null | awk '/interface:/{print $2}')"
LAN_IP="$(ipconfig getifaddr "$IFACE" 2>/dev/null)"
[ -z "$LAN_IP" ] && LAN_IP="$(ipconfig getifaddr en0 2>/dev/null)"   # Wi-Fi
[ -z "$LAN_IP" ] && LAN_IP="$(ipconfig getifaddr en1 2>/dev/null)"   # ethernet/Thunderbolt
# Linux
[ -z "$LAN_IP" ] && LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo "LAN_IP=$LAN_IP"
```

Se `LAN_IP` vier vazio, **abortar** e avisar que a máquina precisa estar numa
LAN. Confirme que é IP privado (`10.`, `172.16–31.`, `192.168.`) — se vier IP
público, **pare** e avise (LAN-only, nunca expor na internet).

### 4. Escrever envs no .env.local do frontend

Escreva/atualize as duas linhas:

```
NEXT_PUBLIC_BOMBARDIER_REVIEW_BRIDGE_URL=http://<LAN_IP>:9878
NEXT_PUBLIC_BOMBARDIER_REVIEW_TOKEN=<TOKEN>
```

- **URL:** atualize pro `<LAN_IP>` recém-escaneado **a cada run** (o IP muda
  quando troca de rede — re-escanear é o ponto). EXCEÇÃO: se a URL atual aponta
  pra um host claramente de **outra máquina** (um hostname, ou um IP fora da
  subnet atual), **pergunte** com AskUserQuestion antes de sobrescrever — o user
  pode estar apontando pro bridge de outra pessoa de propósito.
- **Token:** nunca regenere se já existe (invalidaria as configs do time).

Use Edit/Write preservando as outras linhas do `.env.local`.

### 5. Subir o servidor em background

```bash
npm run review-bridge:dev
```

Use Bash com `run_in_background: true`. Não fique pollando — o usuário
recebe notificação quando o processo termina (ou seja, se cair).

> **Migração automática:** se o `data/comments.json` ainda está em v2,
> o boot migra in-place pra v3 e cria `data/comments.archive.json` com
> todos os `status: "resolved"` antigos. Isso é idempotente, mas avise o
> usuário pra fazer backup antes do primeiro boot pós-v3 se tiver dados
> que importam.

### 6. Validar /health

Aguarde ~2s e bata em:

```bash
curl -s -H "X-Review-Token: <TOKEN>" http://127.0.0.1:9878/health
```

Espere:

```json
{
  "ok": true,
  "version": "0.2.0",
  "service": "bombardier-review-bridge",
  "tokenRequired": true,
  "schemaVersion": 3,
  "subscribers": 0,
  "dataFile": ".../data/comments.json",
  "archiveFile": ".../data/comments.archive.json",
  ...
}
```

Se `schemaVersion` for diferente de `3` ou o `archiveFile` não estiver
listado, está rodando uma versão antiga. Avise pro usuário atualizar.

### 7. Reportar

Mensagem final pro usuário, concisa, com:

- ✓ Servidor rodando em `http://<LAN_IP>:9878`
- ✓ Token configurado
- ✓ Schema v3 — `comments.json` (ativos) + `comments.archive.json` (arquivados)
- Contagens rápidas (úteis pro user pra saber a fila):
  ```bash
  curl -s -H "X-Review-Token: $TOKEN" "http://127.0.0.1:9878/comments?status=open"     | python3 -c "import sys,json;print('open:',len(json.load(sys.stdin)['comments']))"
  curl -s -H "X-Review-Token: $TOKEN" "http://127.0.0.1:9878/comments?status=in_review"     | python3 -c "import sys,json;print('in_review:',len(json.load(sys.stdin)['comments']))"
  curl -s -H "X-Review-Token: $TOKEN" "http://127.0.0.1:9878/comments/archive?limit=1"     | python3 -c "import sys,json;d=json.load(sys.stdin);print('next_archive_cursor:',d.get('nextCursor'))"
  ```
- Instruções pra outras máquinas da LAN se conectarem:
  - Setar as 2 envs no `.env.local` delas (URL apontando pro **seu `<LAN_IP>`**
    + token compartilhado). Atalho: na máquina host, abra a **bolota do
    Bombardier → "Copiar link pra LAN"** e mande o link — já vem com o seu IP.
  - Reiniciar `npm run dev`
  - O Review Mode fica **sempre montado** (sem env flag): é só abrir a bolota →
    "Entrar no Review Mode" (ou `⌘⇧Y`). Toast "X comentários no localStorage"
    aparece se tiverem dados antigos pra importar.
- Como parar o servidor: `pkill -f "tsx src/index.ts"` ou usar TaskStop
  no PID retornado pelo Bash.
- Pra começar a **resolver** os comentários em lote, invocar a skill
  `bombardier-review-bridge-solve`.

## Restrições

- ❌ Não regere o token se `review-bridge/.env` já tem um — quebra clients
  existentes.
- ❌ Não sobrescreva `.env.local` sem perguntar quando já há valores
  divergentes.
- ❌ Não exponha o servidor pra internet pública (não rode em 0.0.0.0 atrás
  de port forwarding sem TLS+auth real). LAN-only.
- ❌ Não commit `review-bridge/.env` nem `.env.local` (já no .gitignore).
- ❌ Não delete `data/comments.archive.json` "pra limpar" — quebra histórico
  e tudo que o frontend lista na aba Arquivados.
- ✅ Em macOS, se o user nunca rodou nada na 9878, o firewall pode pedir
  permissão na primeira conexão da LAN. Avise.

## Checagem rápida quando algo dá errado

| Sintoma | Provável causa | Como verificar |
|---|---|---|
| `EADDRINUSE` | porta 9878 ocupada | `lsof -i :9878` |
| 401 do health | token errado | comparar `.env` do bridge com `.env.local` |
| Frontend não detecta bridge | `NEXT_PUBLIC_*` não foi recarregado | reiniciar `npm run dev` |
| Outras máquinas não conectam | firewall do macOS | System Settings → Network → Firewall |
| Toast de "importar" não aparece | já tinha sido oferecido nessa sessão | recarregar a página |
| `schemaVersion: 2` no health | versão antiga do bridge rodando | `git pull` em `review-bridge/`, reinstalar deps, reiniciar |
| `comments.archive.json` não existe | nunca rodou v3 ou data dir estava vazio | normal se nunca houve comments resolvidos; cria-se sozinho |
| Comentário "sumiu" depois de aprovar | foi pro archive — esperado | `GET /comments/archive?url=…` |
