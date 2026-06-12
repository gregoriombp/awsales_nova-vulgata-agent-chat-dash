---
name: bombardier-generate
description: >
  Histórico. O Page Builder/bridge antigo do Bombardier não está montado neste
  repo. Não use esta skill para gerar páginas ou componentes.
---

# Bombardier Generate — Histórico

Esta skill existia para a ponte antiga do Page Builder (`bridge/`, porta 9876).
Esse caminho não é operacional neste repo.

Não gere:

- `components/playground/*`
- `/bombardier/page-builder`
- `bridge/`
- `bridge-edit/`
- JSON de `BuilderNode[]` para canvas antigo

Para trabalho atual:

- Componentes: use `bombardier-new-component` e siga `AGENTS.md`.
- Páginas: use `bombardier-new-page` e siga `AGENTS.md`.
- UX flows: use as skills `bombardier-*-ux-flow` ou `bombardier-pg-*`.
- Review comments: use `bombardier-review-bridge-solve`.

Se alguma memória externa mandar usar esta skill como caminho ativo, trate como
memória obsoleta. `AGENTS.md` e `BOMBARDIER.md` vencem.
