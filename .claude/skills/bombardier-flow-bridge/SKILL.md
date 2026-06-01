---
name: bombardier-flow-bridge
description: >
  Sobe o servidor local do Bombardier Flow Bridge — guarda as sugestões
  de edição dos UX flows do styleguide (/bombardier/styleguide/ux-flows).
  Cobre: instalar deps, gerar token de auth, descobrir hostname mDNS da
  máquina, escrever as duas envs do frontend (URL + token) no .env.local,
  iniciar o servidor em background e validar /health. Use quando o
  usuário pedir "/bombardier-flow-bridge", "subir o flow-bridge", "ligar
  o servidor de sugestões", "iniciar bridge dos flows", "/flow-bridge",
  ou similares. Não usar para resolver sugestões em lote — pra isso, use
  a skill irmã `bombardier-flow-bridge-solve`.
---

# Bombardier Flow Bridge — Subir o servidor

Esta skill prepara tudo pro **flow-bridge** (servidor Express + lowdb em
`flow-bridge/`) rodar localmente em LAN. NÃO resolve sugestões — só sobe
a infra. Pra ler/aplicar sugestões em lote, use a skill irmã
`bombardier-flow-bridge-solve`.

> **Arquitetura, lifecycle, API completa:** sempre consulte
> `flow-bridge/README.md`. Mesmo padrão do `review-bridge/`, adaptado pra
> sugestões de fluxograma (status: open / in_review / applied / discarded).

## Pré-checagem (sempre rodar primeiro)

Confirme em paralelo:

1. `flow-bridge/package.json` existe → senão **abortar** com mensagem
   pedindo pra rodar a etapa de scaffolding (não recrie aqui).
2. `flow-bridge/node_modules/` existe → se não, anotar que vai instalar.
3. `flow-bridge/.env` existe → se não, anotar que vai gerar token.
4. `.env.local` existe na raiz → necessário pra escrever as envs do frontend.

## Passos

### 1. Instalar deps (se precisar)

```bash
npm run flow-bridge:install
```

Pula se `flow-bridge/node_modules/` já existe.

### 2. Gerar token (se precisar)

Se `flow-bridge/.env` **não existe**:

```bash
TOKEN=$(openssl rand -hex 32)
echo "BOMBARDIER_FLOW_TOKEN=$TOKEN" > flow-bridge/.env
```

Se já existe, **leia** o valor de `BOMBARDIER_FLOW_TOKEN` no arquivo —
não regenere (invalidaria configs já distribuídas pro time).

### 3. Descobrir hostname mDNS da máquina

> **Memória do projeto:** preferir `<hostname>.local` (mDNS) em vez de
> IP cru — sobrevive a troca de WiFi sem reconfigurar.
> Ver `feedback_lan_use_mdns_hostname`.

```bash
# macOS / Linux
HOSTNAME_MDNS="$(hostname -s).local"
```

Se o usuário tiver mDNS quebrado (raríssimo), fallback pra IP de LAN:
- macOS: `ipconfig getifaddr en0` (Wi-Fi) ou `en1`
- Linux: `hostname -I | awk '{print $1}'`

### 4. Escrever envs no .env.local

Apenas se as duas linhas abaixo **não existem** no `.env.local`. Se
existem com valor diferente, **pergunte** com AskUserQuestion antes de
sobrescrever (pode ser que esteja apontando pro bridge de outra máquina
propositalmente).

```
NEXT_PUBLIC_BOMBARDIER_FLOW_BRIDGE_URL=http://<hostname>.local:9879
NEXT_PUBLIC_BOMBARDIER_FLOW_TOKEN=<TOKEN>
```

Use Edit/Write apropriadamente, preservando linhas existentes do `.env.local`.

### 5. Subir o servidor em background

```bash
npm run flow-bridge:dev
```

Use Bash com `run_in_background: true`. Não pollar — o usuário recebe
notificação quando o processo termina.

### 6. Validar /health

```bash
sleep 1
curl -s http://localhost:9879/health | python3 -m json.tool
```

Deve retornar `ok: true`, `service: bombardier-flow-bridge`,
`tokenRequired: true`, `schemaVersion: 1`. Se não responder, ler o output
do background pra ver se o boot deu erro.

### 7. Confirmar pro usuário

Resumo em 3 bullets:
- ✅ Servidor no ar em `http://<hostname>.local:9879`
- ✅ Token gerado (ou reutilizado): `<primeiros 8 chars>…`
- ✅ Frontend configurado: recarregue qualquer página de `/bombardier/styleguide/ux-flows/*` pra ver o botão "Sugerir edição" ativo

Se o dev server do Next já estiver rodando (caso comum no projeto), avise
que ele precisa ser **reiniciado** pra carregar as novas envs `NEXT_PUBLIC_*`.

## Troubleshooting

| Sintoma | Causa | Como contornar |
|---|---|---|
| Botão "Sugerir edição" aparece desabilitado | envs `NEXT_PUBLIC_*` não foram carregadas pelo Next | reiniciar `npm run dev` |
| Erro "Flow bridge não configurado" no UI | mesmo motivo acima ou envs faltando | conferir `.env.local` + reiniciar Next |
| Erro "Token inválido" | token no `.env.local` ≠ token no `flow-bridge/.env` | reler ambos arquivos, alinhar |
| Outras máquinas da LAN não conectam | mDNS bloqueado no router OU firewall do macOS bloqueando porta 9879 | testar com `IP` direto, depois liberar firewall ou usar IP no env |
