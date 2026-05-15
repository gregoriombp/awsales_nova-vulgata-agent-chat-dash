# Stress Test 2026-05-11 — Folder Index

> Stress test adversarial Red Team das 2 wireframes do fluxo end-to-end de onboarding e gestão da org no AwSales.

**Relatório principal:** [../stress-tests/primeiro-login/report.md](../stress-tests/primeiro-login/report.md)

---

## Arquivos

| Arquivo | Conteúdo | Step |
|---|---|---|
| [sut-definition.md](sut-definition.md) | SUT, claims (25), anti-claims (8), baselines de passagem | Step 1 |
| [matrix-and-seeds.md](matrix-and-seeds.md) | Matriz 6×5 (perfis × cenários) com 30 seeds adversariais concretos | Step 2-3 |
| `scenarios/agent-p1-saas-medio.md` | Walkthroughs beat-by-beat P1 (Fyntra) — 17 gaps | Step 4 |
| `scenarios/agent-p2-varejo-familiar.md` | Walkthroughs P2 (Casa Bahia Filial) — 24 gaps | Step 4 |
| `scenarios/agent-p3-fintech-regulada.md` | Walkthroughs P3 (NeoBank Co.) — 14 gaps | Step 4 |
| `scenarios/agent-p4-edtech-fundador.md` | Walkthroughs P4 (CodeRabbit Schools) — 14 gaps | Step 4 |
| `scenarios/agent-p5-grupo-multiorg.md` | Walkthroughs P5 (Holding Vitru) — 14 gaps | Step 4 |
| `scenarios/agent-p6-logistica-terceirizada.md` | Walkthroughs P6 (TransExpress) — 25 gaps | Step 4 |
| [gaps-consolidated.md](gaps-consolidated.md) | 12 clusters por root cause + 3 macro-tensões | Step 5 |
| [fix-backlog.md](fix-backlog.md) | 20 fixes priorizados + validação cross-scenario + 6 decisões estratégicas | Step 6 |

---

## Resumo em uma frase

**SUT submetido a 30 cenários adversariais (0 passaram limpos) revelou ~80 gaps únicos clusterizados em 3 macro-tensões estruturais (M1 caminho-feliz-síncrono-single-tenant, M2 strict/rigid/invisible, M3 compliance-como-pendência) e 1 transversal (M4 scanner SMB), com 12 fixes P0 (~75 SP) bloqueando o MVP e 2 perfis (P3 fintech + P5 multi-org) fora do escopo atual sem stories dedicadas.**

---

## Como usar

1. **PG:** ler [stress-tests/primeiro-login/report.md](../stress-tests/primeiro-login/report.md) (relatório principal) → decidir as 6 perguntas estratégicas no final.
2. **PO/SM:** ler [fix-backlog.md](fix-backlog.md) → priorizar fixes pro próximo sprint baseado em P0/P1 + decisões do PG.
3. **Greg/UX:** ler [gaps-consolidated.md](gaps-consolidated.md) → ajustar wireframes pré-Figma com F1.1, F1.3, F4.1 (estados async, mobile block, big number).
4. **Tech:** ler walkthroughs específicos em `scenarios/` pra entender comportamento esperado em casos adversariais antes de codar.
5. **Comercial:** ler verdict por perfil → pausar pipeline P3/P5 até decisão estratégica.
