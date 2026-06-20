# Diagnóstico — "os comentários do review sumiram na Vercel do PG"

**Data:** 19/06/2026 · **Status:** os comentários **NÃO se perderam** (ver §Conclusão).

## O sintoma
O PG ligou: os comentários que o time lançou durante a group review **não apareceram** no deploy dele na
Vercel. Ele perguntou se o Greg tinha **exportado o JSON**. Hipótese do Greg: como o review-bridge dele
estava rodando **local**, os comentários "na tela do PG" podem ter ido parar **no servidor local do Greg**,
não no do PG.

## Investigação (código real, os dois repos)
Repos: `awsales_nova-vulgata-agent-chat-dash` (Greg) e `PG_awsales-nova-vulgata-design-main-2` (PG, referência).

1. **Arquitetura do bridge.** É um servidor Express local (`review-bridge/src/index.ts`, porta **9878**) que
   persiste em arquivos JSON via lowdb (`review-bridge/src/store.ts` → `review-bridge/data/comments.json` +
   `comments.archive.json`). O cliente posta via `components/bombardier-review/storage/remoteBridge.ts`.

2. **Resolução do endpoint (o ponto-chave).**
   - **Greg:** `remoteBridge.ts` usa a `baseUrl` fixa do build (`return \`${this.baseUrl}${path}\``).
     O `.env.local` aponta `NEXT_PUBLIC_BOMBARDIER_REVIEW_BRIDGE_URL=http://127.0.0.1:9878`.
   - **PG:** o `remoteBridge.ts` dele resolve em runtime pra `window.location.hostname:port` (melhoria que o
     PG adicionou) e o store do PG tem suporte a **Supabase** (`SupabaseReview`) — que o do Greg **não tem**.
     No deploy da Vercel do PG, sem a URL do bridge / sem Supabase configurado, ele cai pra **localStorage**.

3. **Persistência.** Escrita em arquivo no FS do servidor. No deploy da Vercel isso **não persiste** (FS
   efêmero/read-only; sobrevive no máximo em `/tmp` até o próximo cold start/redeploy).

4. **Prova material.** O store local do Greg tem **65 ativos + 749 arquivados = 814**, que bate **exatamente**
   com o Export B (`bombardier-review-2026-06-19-2.json`, 65 + 749). Autores no store local:
   `greg`, `Greg`, `Josephaaaaaa`, `Jordan`. Pra um único export conter **vários autores**, tem que haver um
   **store compartilhado** — e esse store é o **bridge local do Greg** (`127.0.0.1:9878`).
   - O servidor ainda tem um **loopback check** (rejeita request não-localhost com 403 `local_only`), então
     ninguém postou "de fora" pra máquina do Greg pela rede. A leitura consistente é: o time comentou
     **através da máquina do Greg** (ele dirigindo / tela compartilhada), com a identidade do revisor
     alternando — por isso vários nomes caíram no mesmo store local.

## Conclusão
**A hipótese do Greg está essencialmente correta.** Os comentários da reunião foram capturados pelo
**review-bridge local do Greg** (local-first, endpoint cravado em `127.0.0.1:9878`), e **não** pelo deploy
do PG. O deploy do PG não recebeu porque (a) não está plugado num backend durável (sem URL do bridge no build,
Supabase não configurado) e (b) o FS da Vercel é efêmero.

**Importante: nada foi perdido.** A cópia canônica vive em:
- `review-bridge/data/comments.json` + `comments.archive.json` (máquina do Greg), e
- os exports JSON que o Greg já tem (`bombardier-review-2026-06-19*.json`).

→ **Ação imediata:** mandar o export pro PG (é exatamente o que ele pediu). Os comentários estão a salvo.

## Pra não repetir (quando o time for revisar junto de novo)
Escolher **um** backend durável e configurá-lo no build de quem hospeda:
- Usar o **Supabase** que o repo do PG já suporta (setar as envs no deploy), **ou**
- Apontar `NEXT_PUBLIC_BOMBARDIER_REVIEW_BRIDGE_URL` pra um host estável (não `127.0.0.1`) no build da Vercel, **ou**
- Manter o fluxo local-first **assumido**: uma pessoa hospeda o bridge, todo mundo comenta na tela dela, e o
  **export JSON é o artefato oficial** distribuído depois (foi o que aconteceu — só faltou combinar).
- Cuidado com **mixed-content** (site HTTPS → `http://localhost`): navegador moderno bloqueia, então deploy
  hospedado **não** consegue falar com bridge local sem gambiarra. Por isso o caminho durável é Supabase/host estável.
