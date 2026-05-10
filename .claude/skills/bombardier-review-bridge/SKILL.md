---
name: bombardier-review-bridge
description: >
  Sobe o servidor local do Bombardier Review Mode (review-bridge) pra
  sincronizar comentários entre revisores na LAN. Cobre: instalar deps se
  precisar, gerar token de auth se não existir, descobrir o IP local da
  máquina, escrever as duas envs do frontend (URL + token) no .env.local,
  iniciar o servidor em background, e validar que /health responde. Use
  quando o usuário pedir "subir o review-bridge", "iniciar bridge de
  review", "ligar o servidor de comentários", "começar review com o time",
  "abrir review-bridge", "/review-bridge", ou similares.
---

# Bombardier Review Mode — Subir o Bridge

Esta skill é específica do projeto AwSales/Bombardier e prepara tudo pro
review-bridge rodar localmente, espelhando o padrão do `bridge-edit/` mas
sem dependência do Claude Agent SDK. Ela assume que a etapa 2 do Review
Mode já foi implementada (pasta `review-bridge/` com `package.json`, scripts
no root, e `RemoteBridgeReview` no frontend).

## Pré-checagem (sempre rodar primeiro)

Antes de qualquer ação, confirme em paralelo:

1. `review-bridge/package.json` existe → senão **abortar** com mensagem
   pedindo pra rodar a etapa 2 do plano (não tente recriar o servidor aqui).
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
não regenere (ia invalidar configs já distribuídas pro time).

### 3. Descobrir IP local (LAN)

macOS: `ipconfig getifaddr en0` (Wi-Fi) ou `en1`. Se vazio, tente
`ipconfig getifaddr en1`.
Linux: `hostname -I | awk '{print $1}'`.

Se nada retornar IP de LAN válido (10.*, 192.168.*, 172.16-31.*),
pergunte ao usuário com AskUserQuestion qual IP usar.

### 4. Escrever envs no .env.local do frontend

Apenas se as duas linhas abaixo **não existem** no `.env.local`. Se já
existem com valor diferente, **pergunte** com AskUserQuestion antes de
sobrescrever (pode ser que o user esteja apontando pro bridge de outra
máquina propositalmente).

```
NEXT_PUBLIC_BOMBARDIER_REVIEW_BRIDGE_URL=http://<IP>:9878
NEXT_PUBLIC_BOMBARDIER_REVIEW_TOKEN=<TOKEN>
```

Use Edit/Write apropriadamente, preservando linhas existentes.

### 5. Subir o servidor em background

```bash
npm run review-bridge:dev
```

Use Bash com `run_in_background: true`. Não fique pollando — o usuário
recebe notificação quando o processo termina (ou seja, se cair).

### 6. Validar /health

Aguarde ~2s e bata em:

```bash
curl -s -H "X-Review-Token: <TOKEN>" http://127.0.0.1:9878/health
```

Espere `{"ok":true,"tokenRequired":true,...}`. Se falhar, abortar com
diagnóstico (porta ocupada? token vazio?).

### 7. Reportar

Mensagem final pro usuário, concisa, com:

- ✓ Servidor rodando em `http://<IP>:9878`
- ✓ Token configurado
- Quantos comentários já estão no banco (campo `subscribers` é 0 pois
  ninguém conectou ainda; pra contagem real use `/comments` com o token)
- Instruções pra outras máquinas da LAN se conectarem:
  - Setar as 2 envs no `.env.local` delas (URL apontando pro **seu IP** +
    token compartilhado)
  - Reiniciar `npm run dev`
  - Abrir o overlay com `⌘⇧Y` — toast "X comentários no localStorage"
    aparece se tiverem dados antigos pra importar
- Como parar o servidor: `pkill -f "tsx src/index.ts"` ou usar TaskStop
  no PID retornado pelo Bash.

## Restrições

- ❌ Não regere o token se `review-bridge/.env` já tem um — quebra clients
  existentes.
- ❌ Não sobrescreva `.env.local` sem perguntar quando já há valores
  divergentes.
- ❌ Não exponha o servidor pra internet pública (não rode em 0.0.0.0 atrás
  de port forwarding sem TLS+auth real). LAN-only.
- ❌ Não commit `review-bridge/.env` nem `.env.local` (já no .gitignore).
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
