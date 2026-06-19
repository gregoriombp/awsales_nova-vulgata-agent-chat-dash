# Rework do flow Login & autenticação

Plano de migração do flow atual pra padrão HRD (Home Realm Discovery) com workspace selector e policy gate por org. Mantém D7 (plano novo sem org configurada) que é diferencial nosso e não tem equivalente no flow do PG.

Arquivo afetado:
[`app/bombardier/styleguide/ux-flows/login-auth/page.tsx`](../app/bombardier/styleguide/ux-flows/login-auth/page.tsx)

---

## Por que mudar

O flow atual tem 3 botões de método na entrada (Google / Microsoft / e-mail+senha) — o user escolhe antes do sistema saber quem ele é. Isso quebra três coisas:

1. **SSO empresarial vira escolha do user.** Quem é de empresa com SSO obrigatório não devia ver "OAuth Google pessoal" como opção. HRD resolve detectando pelo domínio do e-mail.
2. **Multi-tenant não tem onde escolher org.** O user é redirecionado direto pra `/inicio` — não modela quem pertence a mais de uma org, nem o caso de org incompatível com o método usado.
3. **MFA está como atributo do user, não da org.** A decisão `MFA ativo?` deveria ser `Org exige 2FA?` — em multi-tenant, policy é da organização escolhida.

Adicionalmente: os links `Abrir protótipo` são todos `href="#"`. A promessa de "clique pra abrir o protótipo" não cumpre.

---

## Mudanças no diagrama (NODES e EDGES)

### Renomear

| Antes | Depois | Motivo |
|---|---|---|
| `entrada` "Login" | `entrada` "Login universal" — input e-mail + HRD | Entrada agora resolve pelo domínio |
| `metodo` "Método de acesso" | `hrd` "Domínio tem SSO obrigatório?" | Decisão server-side, não do user |
| `mfaDec` "MFA ativo?" | `policyMfa` "Org exige 2FA?" | Policy é da org, não atributo do user |
| `oauthGoogle` "OAuth Google" | `socialGoogle` "Google pessoal" | Distinguir social de SSO empresarial |
| `oauthMs` "OAuth Microsoft" | `socialMs` "Microsoft pessoal" | Idem |

### Adicionar

| Nó | Tipo | Posição no flow | Propósito |
|---|---|---|---|
| `sso` | screen | depois de `hrd` (sim) | Redireciona pro IdP corporativo (fast lane — pula tudo até policy gate) |
| `magicLink` | screen | depois de `hrd` (link) | Tela "link enviado" + chain de redefinição leve |
| `workspaceDec` | decision | depois de auth, antes de `policyMfa` | "Mais de uma org compatível?" — filtra por dec-auth-compat |
| `workspace` | screen | depois de `workspaceDec` (sim) | Lista orgs compatíveis com o método. User escolhe |
| `semAcesso` | screen | depois de `workspaceDec` (vazio) | "Sem acesso por este método" — orienta voltar ao login |
| `totpSetup` | screen | depois de `policyMfa` (sim, sem TOTP) | Configurar app autenticador |
| `backupCodes` | screen | depois de `totpSetup` | Salvar códigos de recuperação |

### Manter como estão

- `credenciais` (Senha) — só atualiza nota pra refletir que e-mail vem pré-preenchido do HRD
- `valid` (Credenciais válidas?)
- `mfa` (Verificação MFA — agora 3 métodos: app / backup / e-mail)
- `erro` (Erro de login)
- `recEmail` → `recSent` → `novaSenha` → `senhaRedef` (chain B1–B4)
- `primeiroAcessoDec` (verifica primeiro acesso → onboarding)
- **`novaOrgDec` (D7) — manter integral**. É diferencial.
- `novaOrgConfig` (`/organizacao-adicional`)
- `platform` (`/inicio`)

### Remover

Nada. Os nós `oauthGoogle`/`oauthMs` são renomeados, não deletados.

---

## Estrutura final do flow (caminho feliz)

```
Login universal (input e-mail)
  → HRD: domínio tem SSO?
      ├─ Sim → IdP corporativo (fast lane) ────────┐
      └─ Não → Senha (e-mail pré-preenchido)       │
                  → Credenciais válidas?           │
                      ├─ Inválidas → Erro          │
                      └─ Corretas ─────────────────┤
                                                   │
  Secundárias na entrada:                          │
  Google pessoal / Microsoft pessoal / Magic link  │
                                                   │
                                                   ▼
                          Mais de uma org compatível?
                              ├─ Vazio → Sem acesso por este método
                              ├─ 1 org → pula picker
                              └─ N orgs → Workspace selector
                                              ▼
                                  Org exige 2FA?
                                      ├─ Não → primeiro acesso?
                                      └─ Sim → user tem TOTP?
                                                  ├─ Sim → Verificação MFA
                                                  └─ Não → Trava de 2FA → Configurar app → Códigos de backup
                                                                                              ▼
                                                                          primeiro acesso?
                                                                              ├─ Sim → onboarding (flow separado)
                                                                              └─ Não → D7: nova org pendente?
                                                                                          ├─ Sim → /organizacao-adicional
                                                                                          └─ Não → /inicio
```

---

## Mudanças na documentação textual da página

### Parágrafo de descrição (topo)

Substituir o texto atual por:

> A entrada é um input de e-mail único com HRD: se o domínio tem SSO empresarial, o user vai direto pro IdP (fast lane). Se não, abre a tela de senha com e-mail pré-preenchido. Métodos secundários (Google/Microsoft pessoal e magic link) ficam abaixo do separador. Pós-auth, um workspace selector mostra só as orgs compatíveis com o método usado. A policy de 2FA é da organização escolhida — quem entra em org sem MFA não vê verificação. D7 (plano novo sem org) mantém comportamento atual: configurar agora ou banner persistente no /inicio.

### Seção "Decisões de design"

Substituir/adicionar cards:

- **HRD como entrada universal** (novo) — Detectar SSO pelo domínio é o padrão moderno (Slack, Notion, Linear). Reduz fricção pra empresa com IdP e protege quem não tem.
- **Workspace selector com filtragem por método** (novo) — Mostra só orgs compatíveis com o método de auth usado. Anti-enumeration: orgs incompatíveis somem em vez de dizer "você não tem acesso a X via Y".
- **Policy é da org, não do user** (novo) — Migra a decisão de MFA de "atributo da conta" pra "regra da organização escolhida". Token mintado por org depois do workspace selector.
- **OAuth pessoal é caminho secundário** (novo) — Google/Microsoft pessoal ficam abaixo do separador. Empresa séria não loga com conta pessoal.
- **Configurar nova org pode ser adiado** (manter) — D7 continua igual.
- **Recuperação retorna ao login** (manter) — não muda.
- **MFA é verificação server-side** (atualizar) — Renomear pra "Policy MFA é server-side".

### Lead da seção "Fluxograma"

Trocar a frase atual ("Clique em qualquer tela pra abrir o protótipo...") por uma que cumpra a promessa — ver próxima seção.

### Histórico de updates

Adicionar entrada no array `updates`:

```ts
{
  date: "2026-05-26",
  summary:
    "Rework completo: entrada vira HRD (input e-mail decide SSO empresarial vs senha vs social/magic-link). Adicionado workspace selector pós-auth com filtragem por método. MFA migrado de 'atributo do user' pra 'policy da org'. D7 mantido.",
  tags: ["refactor-flow", "new-pages", "new-branch"],
}
```

---

## Cumprir a promessa "clique abre o protótipo"

Duas opções, em ordem de esforço:

### Opção A — Lean (recomendada pra v1)

Remover o texto "clique pra abrir o protótipo" e a coluna `Abrir protótipo →` da lista de telas. Substituir por **prosa por tela** com:

- Propósito (já tem)
- Decisões (já tem)
- **Cenários** (novo) — 3 a 5 por tela, formato `Dado / Quando / Então` curto
- **Critérios de aceite** (novo) — 5 a 10 por tela, checklist

Sem mockup visual. Só texto.

### Opção B — Side panel inline (replicar PG)

Implementar o pattern do PG: clicar no nó abre um painel lateral com mockup da tela + spec + cenários + critérios. Drive por query param (`?screen=login`).

Esforço: criar componente `FlowScreenPanel` no styleguide, montar mockups com componentes Aw* existentes, ajustar `FlowDiagram` pra emitir `onNodeClick`.

**v1**: começa só com `entrada` (Login universal) e `credenciais` (Senha) — as 2 telas que mais importam. Resto fica como texto até alguém pedir.

> Recomendação: começar pela **Opção A** (não bloqueia o rework do diagrama). Promover pra B só se virar dor — implementar side panel pra 13 telas é trabalho significativo e o spec textual já desbloqueia handoff.

---

## Ordem de implementação

1. **Renomear nós existentes** (`metodo` → `hrd`, `mfaDec` → `policyMfa`, `oauthGoogle` → `socialGoogle`, `oauthMs` → `socialMs`). Atualizar todos os edges que referenciam.
2. **Adicionar nós novos** (`sso`, `magicLink`, `workspaceDec`, `workspace`, `semAcesso`, `totpSetup`, `backupCodes`) com posições no grid.
3. **Reorganizar EDGES** pra refletir o caminho HRD → auth → workspace → policy → primeiro acesso → D7 → platform.
4. **Atualizar parágrafo descritivo** e seção "Decisões de design".
5. **Adicionar entrada no histórico** (`updates` array).
6. **Reescrever lista `screens`** (a seção "Cada tela") pra incluir cenários + critérios de aceite por tela. Remover coluna `Abrir protótipo →`.
7. **(opcional, futuro)** Side panel inline.

---

## Fora de escopo desta v1

- Implementar rota `/login` real
- Implementar rota `/workspace` real
- Migrar o flow `/bombardier/styleguide/ux-flows/primeiro-acesso` pra também usar HRD
- Adicionar páginas de protótipo HTML (Opção B do side panel)
- Documentar comportamento mobile (produto é desktop-only)

---

## Riscos / coisas pra confirmar antes

- **Multi-org existe ou não?** Se o produto hoje é estritamente single-org, o workspace selector vira nó "futuro/condicional" — vale documentar mesmo assim, mas com badge explicando que é a forma futura.
- **Magic link entra agora ou fica pra depois?** Tecnicamente simples mas custa uma cadeia inteira de telas. Pode entrar como `placeholder` no diagrama e marcado como "não implementado v1".
- **Social pessoal (Google/MS pessoal) vale a pena no B2B?** Se 100% dos users vêm via empresa, social pessoal vira ruído. Confirmar antes de modelar.
