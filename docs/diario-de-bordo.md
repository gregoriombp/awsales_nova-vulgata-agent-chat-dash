# Diário de Bordo — Routines da Madrugada

Log único onde **toda routine do Claude** registra o que fez enquanto o Greg
dormia. Greg acorda, abre esse arquivo e lê de cima pra baixo: a noite mais
recente fica sempre no topo, e dentro de cada noite as routines aparecem na
ordem em que rodaram.

> **Pra que serve:** virar a primeira coisa que o Greg lê de manhã. Em vez de
> caçar branches, commits e comentários em review espalhados, ele tem aqui um
> resumo honesto — o que foi feito, o que subiu pra review, o que **não** deu
> tempo e o que precisa do olho dele.

---

## Como funciona

- **Um arquivo só, várias routines.** Cada routine que roda na madrugada
  adiciona a sua própria entrada aqui. Não importa quantas routines existam
  (a do review-bridge, a que roda depois dela, as próximas) — todas relatam
  no mesmo lugar, no mesmo formato.
- **Append, nunca reescreve.** Uma routine só **acrescenta** a sua entrada.
  Nunca apaga nem edita o relato de outra routine nem de outra noite.
- **Newest-first por noite, run-order dentro da noite.** A noite mais recente
  entra no topo do log. Dentro de uma noite, cada routine se anexa **abaixo**
  da anterior (ordem cronológica de execução), pra leitura virar uma história:
  routine 1 → routine 2 → ...
- **Viaja junto com o trabalho.** A entrada é escrita e commitada **na mesma
  branch** que a routine criou pro trabalho dela. Assim o diário chega no Greg
  junto com o código, no commit final.

---

## Protocolo de preenchimento (pro agente)

Quando uma routine terminar o trabalho dela, **antes do commit final**:

1. Abra este arquivo e localize o **log** (depois do primeiro `═══`).
2. **A noite de hoje já tem cabeçalho?**
   - **Não** (você é a primeira routine da noite) → crie um cabeçalho novo
     `## Noite de DD/MM/AAAA` **no topo do log** e escreva sua entrada
     abaixo dele.
   - **Sim** (outra routine já rodou hoje) → **não crie outro cabeçalho**.
     Anexe sua entrada **abaixo da última routine** daquela mesma noite.
3. Copie o **Template de entrada** abaixo e preencha **com sinceridade** —
   inclusive o que falhou, bloqueou ou ficou pra depois. Relato maquiado não
   ajuda ninguém.
4. **Sempre preencha a branch e se deu push.** O Greg quer acordar com a
   branch local **e** no remoto; esse campo é o que ele confere primeiro.
5. **Sem trabalho? Relate mesmo assim.** Se a routine rodou e não achou nada
   pra fazer (fila vazia, nenhum comentário aberto), registre uma entrada
   curta com status `Sem trabalho` explicando o porquê. Silêncio parece bug.
6. Commit a atualização do diário **junto com o resto do trabalho da routine**,
   na mesma branch.

> **Snippet pra colar no final do prompt de qualquer routine:**
>
> *"Ao finalizar, registre o que você fez no diário de bordo em
> `docs/diario-de-bordo.md`: leia o **Protocolo de preenchimento** no topo do
> arquivo, copie o **Template de entrada**, preencha com os dados desta run
> (routine, branch + se deu push, status, plano em tiers, o que foi feito,
> comentários que subiram pra review, commits, pendências e notas pra mim) e
> adicione a entrada no topo do log sob o cabeçalho da noite de hoje — criando
> o cabeçalho da noite se ele ainda não existir, ou anexando abaixo da última
> routine se já existir. Commite essa atualização junto com o resto do
> trabalho, na mesma branch."*

---

## Legenda de status

| Status | Quando usar |
| --- | --- |
| **Concluída** | Atacou tudo que se propôs, commitou e pushou. |
| **Parcial** | Fez parte; sobrou coisa na fila ou ficou pra próxima. |
| **Bloqueada** | Travou em algo externo (PG, credencial, decisão do Greg). |
| **Falhou** | Quebrou no meio; explique onde e por quê. |
| **Sem trabalho** | Rodou, não havia o que fazer. Explique o porquê. |

---

## Template de entrada

Copie o bloco abaixo (sem as crases) e preencha:

```markdown
### <Nome da Routine> — rodou ~HH:MM

- **Status:** Concluída
- **Branch:** `nome-da-branch` — push: sim (ou não, e por quê)
- **Escopo:** o que essa routine foi incumbida de fazer, em uma linha.

**TL;DR**
> 2–3 linhas do que mudou no produto — o que o Greg vai encontrar ao acordar.

**Plano em tiers (a ordem que escolhi pra atacar):**
1. **Tier 1** — ...
2. **Tier 2** — ...
3. **Tier 3** — ...

_Por que nessa ordem / conflitos que resolvi:_ ex.: "o comentário X mandava
apagar um botão e o Y mandava apagar a tela inteira; segui o Y e ignorei o X."

**O que foi feito:**
- [comentário #ID · /rota] — o que fiz — commit `abc1234`
- [comentário #ID · /rota] — o que fiz — commit `def5678`

**Subiu pra review:**
- #ID — descrição curta — `in_review`
- #ID — descrição curta — `in_review`

**Pendências / não deu tempo / bloqueios:**
- #ID — por que ficou pra depois
- (ou: "nada pendente")

**Notas pro Greg:**
- decisões que tomei sozinho, dúvidas, coisas pra ele olhar com carinho.
```

---

═══════════════════════════════════════════════════════════════════════════════

# Log

<!-- As routines escrevem ABAIXO desta linha. Noite mais recente no topo. -->
<!-- A entrada de exemplo abaixo é só um modelo de formato — apague quando -->
<!-- o primeiro relato real entrar.                                        -->

## Noite de DD/MM/AAAA  _(exemplo — apagar)_

### Review-Bridge Solve — rodou ~02:30

- **Status:** Parcial
- **Branch:** `madrugada/review-solve-2026-06-26` — push: sim
- **Escopo:** ler os comentários abertos do review-bridge, planejar em tiers e atacar.

**TL;DR**
> Limpei os comentários rápidos do /settings (labels, espaçamentos, um botão
> morto). Os dois pedidos grandes de reestruturação ficaram pra próxima porque
> conflitavam entre si — deixei nota explicando.

**Plano em tiers (a ordem que escolhi pra atacar):**
1. **Tier 1 — quick wins isolados** — ajustes de texto/espaçamento que não
   dependem de nada e não conflitam com ninguém.
2. **Tier 2 — remoções pontuais** — botões/blocos que algum comentário pediu
   pra tirar, conferindo antes que nenhum comentário "maior" mande refazer a
   tela toda.
3. **Tier 3 — reestruturações** — mudanças de hierarquia (deixadas pro fim por
   serem as mais arriscadas e conflitantes).

_Por que nessa ordem / conflitos que resolvi:_ o comentário #42 mandava ajustar
um card que o #51 mandava deletar junto com a seção inteira — fiz o #51 e pulei
o #42 pra não trabalhar à toa.

**O que foi feito:**
- [#38 · /settings/perfil] — encurtei o label da tabela LGPD — commit `a1b2c3d`
- [#51 · /settings/financeiro] — removi a seção de aviso do recibo — commit `e4f5g6h`

**Subiu pra review:**
- #38 — label da tabela LGPD — `in_review`
- #51 — remoção do aviso do recibo — `in_review`

**Pendências / não deu tempo / bloqueios:**
- #67 — reestruturação do /consumo-e-custos: depende de decisão sua sobre o Stripe.
- #42 — ignorado de propósito (coberto pelo #51).

**Notas pro Greg:**
- Os dois pedidos de reestrutura grande (#67 e #70) conflitam na hierarquia da
  sidebar; preferi não chutar e deixei pra você decidir qual direção seguir.
