# Stress Test Financeiro 2026-05-11 — Folder Index

> Stress test adversarial Red Team com **lente tripla** (🔧 Funcional · ⚖️ Compliance · 🎯 UX/Acessibilidade) da Story 3 (Financeiro).

**Relatório principal:** [../stress-tests/financeiro/report.md](../stress-tests/financeiro/report.md)

---

## Arquivos

| Arquivo | Conteúdo | Step |
|---|---|---|
| [sut-definition.md](sut-definition.md) | SUT + 8 claims funcionais + 12 claims compliance + 13 claims UX + 7 anti-claims | Step 1 |
| [matrix-and-seeds.md](matrix-and-seeds.md) | Matriz 6 perfis × 5 cenários com 30 seeds adversariais mapeados às 3 lentes | Step 2-3 |
| `scenarios/agent-f1-saas-medio.md` | Walkthroughs F1 (Fyntra) — **22 gaps, 6 P0** | Step 4 |
| `scenarios/agent-f2-past-due.md` | Walkthroughs F2 (Casa Bahia Filial) — **22 gaps, 9 P0** | Step 4 |
| `scenarios/agent-f3-fintech-bacen.md` | Walkthroughs F3 (NeoBank) — **27 gaps, 11 P0** | Step 4 |
| `scenarios/agent-f4-founder-solo.md` | Walkthroughs F4 (CodeRabbit Schools) — **30 gaps, 9 P0** | Step 4 |
| `scenarios/agent-f5-holding-multi-org.md` | Walkthroughs F5 (Vitru) — **22 gaps, 10 P0** | Step 4 |
| `scenarios/agent-f6-high-volume.md` | Walkthroughs F6 (TransExpress) — **31 gaps, 11 P0** | Step 4 |
| [gaps-consolidated.md](gaps-consolidated.md) | 15 clusters de root cause + 4 macro-tensões + verdict por perfil + top 15 gaps | Step 5 |
| [fix-backlog.md](fix-backlog.md) | 17 fixes priorizados em 3 ondas (Onda 1 hardening MVP · Onda 2 refino · Onda 3 Story 4) | Step 6 |

---

## TL;DR

**154 gaps brutos** (56 P0, 74 P1, 24 P2-P3) clusterizados em **15 root causes** e **4 macro-tensões**:
- **M1** Transparência CDC vs UX scanner SMB
- **M2** Compliance LGPD/BACEN subdesenvido (catálogos incompletos)
- **M3** Idempotência de pagamento Stripe ausente → duplo charge = CDC Art. 42 §único devolução em dobro
- **M4** Multi-tenant / Multi-org / Escala enterprise

**Verdict:**
- ✅ F1 SaaS médio, F4 founder solo, F6 high-volume → viáveis após **Onda 1 (31 SP)** + Onda 2 (25 SP)
- ⚠ F2 past_due → bloqueio legal P0, Onda 1 obrigatória antes de release
- ❌ F3 fintech BACEN, F5 holding multi-org → **Fora do MVP** (anti-claim + Story 4)

---

## Como usar

1. **PG**: ler [relatório principal](../stress-tests/financeiro/report.md) → decidir as 4 perguntas estratégicas
2. **PO/SM**: ler [fix-backlog.md](fix-backlog.md) → priorizar Onda 1 (P0 bloqueante)
3. **Greg/UX**: aguardar Onda 1 aplicada nos wireframes antes de Figma final
4. **Tech**: ler scenarios específicos pra entender comportamento esperado em estados adversariais
5. **Comercial**: pausar pipeline F3 fintech + F5 holding até Story 4 estar pronta
