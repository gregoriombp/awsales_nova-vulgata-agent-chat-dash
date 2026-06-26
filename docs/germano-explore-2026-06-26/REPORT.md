# Germano — patrulha proativa (26/06/2026, madrugada)

Branch: `claude/hopeful-cray-fc73d2`. App vivo em `localhost:3000` (review-bridge
serverless). Tudo navegado e clicado de verdade via Playwright. Pins vivem no
bridge (inbox) — isto aqui é só o registro.

---

## Parte 1 — Conferência do que o Claude RESOLVEU (in_review)

Os 14 comentários que o Claude mandou pra revisão **já tinham sido auditados pelo
Germano às 21:06 de 25/06** (commit `730bc3ee`), todos com veredito "pode seguir".
Re-postar seria spam duplicado, então em vez disso **re-verifiquei por amostragem
contra o código atual** pra garantir que aquela auditoria não foi carimbo:

| Item resolvido | Verificação no código | Veredito |
|---|---|---|
| Olhinho (revelar senha) foi pro DS | `AwInput.tsx` tem prop `revealable` (não gambiarra local) | ✅ confere |
| Bug do canal em /notificacoes (máscara, não mutação) | `setGlobalChannel` não zera mais `channelsById`; deriva `disabled` de `emailDelivery/whatsappDelivery` (comentário no código documenta o bug antigo) | ✅ confere |
| Coluna "No app" saiu da matriz | matriz só renderiza E-mail/WhatsApp; "No app" é card "Sempre ativo" único | ✅ confere |

**Conclusão:** a auditoria das 21:06 é sólida — os fixes existem de verdade no
código, não só no comentário. Nada a re-abrir.

---

## Parte 2 — Patrulha das telas ainda sem pin (achados novos)

Cobri as rotas que **ainda não tinham pin do Germano** e evitei as que já têm
comentário aberto do Greg (consumo-e-custos, financeiro/*, organizacao/*,
notificacoes, etc.) pra não fazer barulho em cima do que ele já está mexendo.

### 🐛 3 pins novos (todos com sugestão + "manda o @Claude fazer")

1. **`/settings/aparencia` — dropdown de Idioma é morto.**
   `<AwSelect>Português (Brasil)</AwSelect>` sem `onClick`/opções/estado: a
   setinha promete menu e não abre nada (testado: clique = zero). Sugestão: se é
   idioma único, vira linha read-only ou desabilitado; senão, liga um menu real.

2. **`/settings/equipe-permissoes` (Membros) — "Remover da organização" apaga NA HORA.**
   Sem confirmação, sem desfazer (testado ao vivo: membro sumiu, contador caiu).
   A fricção está **invertida** — "Inativar" (reversível) confirma num modal, mas
   "Remover" (irreversível) não. `handleRemove` é `setMembers(filter)` direto.
   Sugestão: rotear pelo mesmo padrão de confirmação do Inativar + botão `danger`.

3. **`/settings/equipe-permissoes/grupos` (Equipes) — "Excluir equipe" apaga NA HORA.**
   Mesma classe de bug, outro code path: `handleDelete` é `setGroups(filter)` sem
   modal. Sugestão: confirm com botão `danger` (ou type-to-confirm como a Zona de
   perigo, que é o padrão de ouro que vocês JÁ têm no repo).

### 👍 O que está bom de verdade (sem pin)

- **`/settings/perfil/sessoes-ativas`** — exemplar. "Encerrar todas exceto esta"
  pede re-autenticação ("Confirme sua identidade"); encerrar uma sessão abre
  "Encerrar sessão?". Os dois caminhos destrutivos confirmam.
- **`/settings/zona-de-perigo`** — padrão de ouro de ação destrutiva: consequências
  listadas, type-to-confirm ("Digite 'Fyntra Tecnologia'"), botão danger travado
  até digitar. É exatamente o que falta nos deletes do equipe-permissoes.
- **`/settings/equipe-permissoes/funcoes`** — "Criar função" trava o "Continuar"
  enquanto o nome está vazio. Valida direito.
- **`/settings/perfil`** e **`/settings/organizacao`** — atalhos são links de
  verdade, "Editar"/"Baixar contrato"/"Algo está errado?" todos funcionam (o
  "Baixar contrato" baixa de fato — só é um `.txt` cru em vez de PDF, acabamento).
- **Dark mode** (`/settings/aparencia` → Escuro) aplica consistente, sem ilha clara.

### 🔎 Notas menores (não pinei — provável dado de mock)

- `Organização`: "Setor = Educação e Infoprodutos" (Identificação) x "Segmento =
  SaaS" (contrato) e "Equipe · 32 membros" x página de Membros mostrando 16.
  Parecem mismatches de seed data; valem revisão quando ligar no dado real.
- "Baixar contrato" entrega `.txt` — num produto premium um contrato sai em PDF.

---

_Germano Faccio · segunda opinião · não mexo em código nem em status, só exploro
e sugiro. Greg tria/aprova no inbox._
