# 🧐 Germano Faccio — auditoria dos `in_review` (25/06/2026, madrugada)

> Auditoria crítica do que o **@Claude** mandou pra revisão no Review Bridge.
> Critério: pedido original × entrega, conferido contra **código + git + tela
> renderizada** (Playwright em `:3100`). Germano **não** edita código, **não**
> muda status — comenta na thread e, no máximo, abre pin de bônus. Quem aprova
> no inbox é o Greg.
>
> As respostas em si foram postadas no bridge (uma por item) — ficam no inbox,
> não no git (`review-bridge/data/*.json` é gitignored). Este arquivo é o
> registro durável da passada.

## Veredito geral

**17 itens em revisão · 17 "pode seguir" · 0 "pede melhoria".**

Não é cortesia: conferi cada um na tela. A leva de senha e a de notificações
foram especialmente bem resolvidas — a de notificações inclusive consertou o
pior bug da tela (config sumindo ao desligar canal), que eu testei ao vivo.

Cada commit real existe (não houve `in_review` sem entrega). Único detalhe de
higiene: o commit `f5383455` ("olhinho no AwInput") na verdade carrega **todos**
os 6 ajustes da página de senha — a mensagem só descreve um deles. Trabalho lá,
mensagem subdescritiva. Não bloqueia nada.

## Pode seguir (17)

### `/settings/perfil/senha` (6)
- **h6 "Senha da conta"** — promovido pra h6, casa com "Autenticação em dois fatores". ✅
- **Título 0×0 + termo** — "Senha e acesso" renderiza grande (h3/28px) e bate com o breadcrumb. Colapso e divergência resolvidos juntos. ✅
- **Olhinho na senha** — `revealable` no AwInput (foi pro DS, não gambiarra). Conferido no modal. ✅
- **Modal "Gerenciar"** — foi na opção (a): morreu o modal, "Reconfigurar" e "Gerar novos" viraram inline. ✅
- **Estado tríplice da MFA** — toggle morto virou chip read-only "Exigida pela organização" + alerta. (Chip e alerta ainda repetem "org exige", mas um é status e outro é consequência — ok.) ✅
- **Botão destrutivo** — "Gerar novos códigos" virou `danger` (vermelho), igual ao "Desativar MFA". Conferido no modal. ✅

### `/settings/notificacoes` (4)
- **Bug do canal apagando config** — agora é máscara, não mutação. Testado ao vivo: desliguei E-mail → escolhas viraram "—" (não apagaram), religuei pelo "ligar" → voltou TUDO marcado, item por item. ✅✅
- **"No app · Sempre ativo" contraditório** — foi na 1ª: coluna "No app" saiu da matriz, o card vira fonte única de verdade. ✅
- **Matriz cara de planilha** — cabeçalho de coluna (canais nomeados 1×) + linhas só com checkbox alinhado em grid. aria-label mantido. ✅
- **Checkbox desabilitado sem explicação** — vira "—" mudo com tooltip + "ligar" no cabeçalho que reativa o canal. ✅

### `/settings/consumo-e-custos` (5)
- **Rótulos do trilho** — de eyebrow 10px pra body-sm medium (SectionLabel, os três juntos). ✅
- **Background bem claro** — trilho foi pra `--bg-canvas`, o token mais claro. ✅
- **Botão "Salvar" hardcoded** — era `<button>` cru, virou `AwButton` (secondary). DS de verdade, cor clara preservada. ✅
- **"Exportar" preto** — virou `primary`. Hierarquia limpa ao lado do "Salvar". ✅
- **"· BRL" no período** — removido, lê só "Este mês". ✅

### outros (2)
- `/settings/perfil/meus-dados` — pill "Direito de acesso · LGPD" removida, contexto LGPD ficou na nota de rodapé. ✅
- `/settings/financeiro/consumo` — bloco de aviso do PDF/recibo excluído. ✅

## 🆕 Pins de bônus criados (2) — fora do escopo, pro Greg triar

1. **`/settings/consumo-e-custos` — sinal de menos inconsistente nos KPIs.**
   "Ajustes" mostra `-R$ 24,90` (hífen colado); "Créditos e cupons" mostra
   `− R$ 125,45` (menos de verdade + espaço). Há um `signed()` no próprio
   `KpiCards.tsx` que formata certo — o card de Ajustes só não usa. Passar o
   valor por `signed()` resolve.

2. **`/settings/notificacoes` — termo "voucher" velho.**
   Notificação "Saldo / voucher baixo" enquanto a descrição já diz "Créditos" e
   o Financeiro inteiro migrou pra "crédito". Sugestão: "Saldo / crédito baixo".

Os dois nascem `open` no inbox, autor Germano. Não mexi em código.
