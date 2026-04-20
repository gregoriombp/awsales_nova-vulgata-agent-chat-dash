# Bombardier bridge

Ponte HTTP local entre a UI do Bombardier (rodando no navegador) e o seu Claude Code autenticado.

Cada designer roda esta ponte na **própria máquina**. Prompts e imagens usam a sua conta Claude (Pro/Max/Team/API) — nada passa pelo servidor do produto.

## Instalação (primeira vez)

Da raiz do repositório:

```bash
npm run bridge:install
```

(Ou, manualmente: `cd bridge && npm install`.)

## Uso

```bash
# da raiz do repositório
npm run bridge

# ou diretamente
cd bridge && npm start
```

A ponte escuta em `http://localhost:9876`. Se a porta estiver ocupada:

```bash
BOMBARDIER_BRIDGE_PORT=12345 npm run bridge
```

Com a ponte ativa, abra o Bombardier (`http://localhost:3000/bombardier/page-builder`). A UI detecta automaticamente e mostra o status de conexão no chat da direita.

## Status atual — Fase 1 (scaffold)

- [x] `/health` — responde com metadata e status do Claude
- [x] CORS liberado para `localhost:3000` e `:3001`
- [ ] **Fase 2** — Claude Agent SDK (usa sua auth existente do `claude` CLI)
- [ ] **Fase 3** — Tools: `match_aw`, `search_shadcn`, `create_playground_component`
- [ ] **Fase 4** — Upload de imagem + aprovação de componentes no Playground

## Por que não há API key aqui

A ponte **não gerencia chaves**. Na Fase 2, o Claude Agent SDK vai usar a sessão já autenticada do seu `claude` CLI (execute `claude login` se ainda não fez). Isso significa:

- Sua conta, seu plano, seu consumo.
- Zero segredos compartilhados entre a equipe.
- Prompts nunca tocam o servidor do produto.
