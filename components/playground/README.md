# Playground — componentes propostos pela IA

Esta pasta guarda componentes criados dinamicamente pelo **Bombardier** via a tool `create_playground_component` quando nem a paleta nem shadcn têm algo equivalente.

## Ciclo de vida

1. **Gerado** pela IA (cada arquivo `<Name>.tsx` vem com um `<Name>.meta.json` pareado com `approval: "pending"`).
2. **Revisado** por um designer na rota `/bombardier/styleguide/components/playground` (Fase 4: botão "Aprovar" move o arquivo pra `components/ui/` e atualiza a navegação do styleguide).
3. **Aprovado** → entra no DS e pode ser promovido para a paleta editando [lib/bombardier/palette.ts](../../lib/bombardier/palette.ts).

## Regras para componentes do Playground

- **Sem prefixo `Aw`** — reservado para componentes já aprovados.
- Self-contained TSX.
- Apenas `react`, `@/components/ui/*` e Tailwind/CSS vars (`var(--fg-*)`, `var(--bg-*)`, `var(--aw-*)`, `var(--radius-*)`).
- Props tipadas com `type <Name>Props = { ... }`.
- Sem dependências externas novas.

## Não comite no main

Enquanto o fluxo de aprovação não estiver pronto, considere **não comitar** arquivos desta pasta — eles são experimentos locais do designer. Adicione `components/playground/*` ao `.gitignore` do produto se preferir. O `.meta.json` é só para a UI de aprovação.
