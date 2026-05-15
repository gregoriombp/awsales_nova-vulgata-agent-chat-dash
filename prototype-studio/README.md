# prototype-studio

> **Área de trabalho permanente do PG** pra desenhar e iterar o produto **Studio** do AwSales. Substituiu as antigas `investigations/2026-04-*` em 2026-05-12 — agora é workspace de longa duração, não investigation pontual.

Abra [`index.html`](index.html) no browser pra navegar entre os protótipos. **Antes** de abrir, suba o servidor (paths relativos + `localStorage` + parse de `<script src>` só funcionam via HTTP, não `file://`):

```bash
cd /Users/guilhermegraham/awsales/prototype-studio
python3 -m http.server 8765
# então abre http://localhost:8765
```

`Ctrl+C` no terminal pra parar quando terminar.

---

## 🧭 Contexto pra próximas sessões (IA / dev novo)

### O que este projeto é

Workspace de **protótipos HTML interativos** do produto **Studio** da AwSales — plataforma SaaS B2B de orquestração de agentes de IA pra vendas/suporte. Cada protótipo é um arquivo `.html` único (sem build, sem framework) que abre direto no browser e simula uma área do produto.

Esses protótipos servem 3 propósitos:

1. **Alinhamento de design** — PG itera UI rapidamente com a IA, valida fluxo, pega feedback de Sally (BMAD UX Designer) ou de pessoas do time
2. **Spec viva** — pareado com `stories/*.md` (BDD/Gherkin); story descreve **o quê**, protótipo demonstra **como**
3. **Base pra stress test** — qualquer protótipo + story pode ser SUT pra `/pg-stress-test` adversarial

**NÃO é** o produto real. O produto real é o Next.js app que o **Greg** mantém em [`investigations/awsales_nova-vulgata-agent-chat-dash_handoff_preview/`](../investigations/awsales_nova-vulgata-agent-chat-dash_handoff_preview/) — esse é a **fonte da verdade** pro Studio. Os protótipos daqui replicam fielmente a estrutura/fluxos do app real do Greg, mas com estética sketch wireframe pra deixar óbvio que é rascunho.

### Padrão atual (atualizado 2026-05-12)

- **Prototype-first** — nada de wireframe ASCII intermediário. Direto pro HTML. Documentação canônica em [`../docs/product/ux-prototype-workflow.md`](../docs/product/ux-prototype-workflow.md).
- **Shell v2 compartilhado** em [`assets/shell.css`](assets/shell.css) + [`assets/shell.js`](assets/shell.js) — todos os protótipos usam o mesmo shell (banner + demo-nav + sidebar do Greg + topbar + área central). Cada protótipo vira só o **conteúdo**.
- **Estética sketch óbvia** — Caveat + Patrick Hand, paleta paper/ink (`--bg #f5f1e8` / `--paper #fdfaf3` / `--ink #1a1a1a`), bordas tracejadas, box-shadow offset, banner "✏️ PROTÓTIPO · não é produto real" sticky no topo. Impossível confundir com produto.

---

## 🗂 Estrutura

```
prototype-studio/
├── index.html                          # menu mestre — 6 cards coloridos
├── README.md                           # este arquivo
│
├── assets/                             # ⭐ shell compartilhado (todos os protótipos)
│   ├── shell.css                       # tokens · sidebar · topbar · primitivos (botão, modal, tabela, badge)
│   └── shell.js                        # renderiza o shell · sidebar collapsible · menu de perfil · logout
│
├── prototypes/                         # protótipos HTML interativos (canônicos)
│   ├── primeiro-login.html             # fluxo signup (Persona A/B/multi-org, layout='centered')
│   ├── team-funcoes-config.html        # Configurações: Team · Funções · Segurança · Geral
│   ├── financeiro.html                 # Visão Geral · Saldo de Créditos · Audit · Métodos pagamento
│   ├── canais.html                     # WhatsApp · Instagram · Messenger (Meta Cloud)
│   ├── integracoes.html                # Integration Hub — 33 provedores reais (8 categorias)
│   └── habilidades.html                # Tools agrupadas POR INSTÂNCIA de integração
│
├── stories/                            # BDD/spec viva (fonte canônica do "o quê")
│   ├── primeiro-login.md
│   ├── team-funcoes-config.md
│   ├── financeiro.md
│   └── integracoes.md
│
├── stress-tests/                       # Red Team adversarial por área
│   ├── primeiro-login/
│   │   ├── report.md                   # report executivo
│   │   └── scenarios-and-fixes/        # walkthroughs + gap register + fix backlog
│   ├── financeiro/  (idem)
│   ├── funcoes/     (idem)
│   └── integracoes/
│       ├── report-1.md
│       └── report-2.md
│
├── archive/                            # histórico, só consulta — NÃO canônico
│   ├── integracoes-v1-legacy.html      # 1ª versão de integrações antes de migrar pro shell v2
│   ├── transcricoes/                   # transcrições de reuniões originais (2026-04)
│   └── decisoes-antigas/               # log de decisões anteriores
│
└── prints/                             # screenshots por sessão
    ├── README.md                       # convenção de nome + como tirar
    └── sessao-AAAA-MM-DD/
```

---

## 🎯 Estado atual dos protótipos

### ✅ Prontos (clicáveis na sidebar, com shell v2)

| Área | Slug sidebar | Arquivo | Notas |
|---|---|---|---|
| 🗣 Canais | `canais` | [`canais.html`](prototypes/canais.html) | 3 canais Meta (WhatsApp/Instagram/Messenger) · Add → Connect → Conectado funcional |
| 🔌 Integrações | `integracoes` | [`integracoes.html`](prototypes/integracoes.html) | **33 provedores reais** do Greg (Hotmart, Stripe, HubSpot…) · 8 categorias · Connect por auth (OAuth/webhook/apiKey) |
| 🔧 Habilidades | `tools` | [`habilidades.html`](prototypes/habilidades.html) | Tools agrupadas **por instância** (insight crítico — 2 Hotmarts = 2 packs separados) · PickType → PickIntegration → New |
| ⚙ Configurações | `settings` | [`team-funcoes-config.html`](prototypes/team-funcoes-config.html) | Sub-tabs: Geral · Team · Funções · Financeiro · Segurança |
| 💰 Financeiro | (sub-tab de settings) | [`financeiro.html`](prototypes/financeiro.html) | Visão Geral · Saldo de Créditos · Audit · Métodos · timeline dispute |
| 🚀 Primeiro acesso | — (signup, layout `centered`) | [`primeiro-login.html`](prototypes/primeiro-login.html) | Persona A/B/multi-org · 24 telas · "Entrar agora" → `inicio.html` (auto 3s) |

### 🚧 Coming-soon (cinza na sidebar, badge "em breve", não-clicáveis)

| Item | Slug | Onde no app real do Greg |
|---|---|---|
| Dashboard | `dashboard` | `app/dashboard/` |
| Insights | `insights` | `app/insights/` |
| Agent studio | `agent-studio` | `app/agent-studio/` + `agent-studio-v2/` |
| Aprovações | `aprovacoes` | `app/approvals/` |
| Disparos | `disparos` | `app/triggers/` |
| Memory base | `memory-base` | `app/memory-base/` + `knowledge-os/` |
| AOPs | `aops` | `app/aops/` |
| Biblioteca | `library` | `app/library/` |
| Conversas | `conversations` | `app/conversations/` |
| Playground | `playground` | `app/playground/` |
| Histórico | `history` | `app/history/` (audit trail) |

Quando começar a fazer um desses, troque `comingSoon: true` por `href: 'xxx.html'` no `NAV` em [`assets/shell.js`](assets/shell.js) e crie `prototypes/xxx.html` usando o shell.

---

## 🧱 Como o shell funciona (gotchas conhecidos)

### Como usar num novo protótipo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <link rel="stylesheet" href="../assets/shell.css">
  <!-- estilos específicos da página depois -->
</head>
<body>
  <div id="proto-shell"
       data-active="integracoes"          <!-- slug da sidebar que fica active -->
       data-layout="full"                  <!-- "full" (default) ou "centered" pra signup -->
       data-org="Fyntra Tecnologia"
       data-org-logo="F"
       data-user="Guilherme Graham"
       data-user-initials="PG"
       data-user-role="Administrador"
       data-breadcrumb="Fontes / <strong>Integrações</strong>"></div>

  <main class="page-content">
    <!-- conteúdo do protótipo aqui — vai virar #pageContent dentro do shell -->
  </main>

  <div class="modal-mask" id="modalMask" role="dialog" aria-modal="true">
    <div class="modal lg" id="modalContent" tabindex="-1"></div>
  </div>

  <script src="../assets/shell.js"></script>
  <script>
    // scripts específicos da página
  </script>
</body>
</html>
```

### 🐞 Bug histórico crítico — preservação de event listeners (resolvido 2026-05-12)

**Sintoma:** botões com `onclick` colado via JS (`btn.onclick = fn`) não funcionavam. Modais não abriam ao clicar.

**Causa:** o shell movia o conteúdo do `<main class="page-content">` via **string `innerHTML`**, o que re-parseia o HTML e **descarta event listeners** que o `<script>` inline da página tinha colado.

**Fix:** [`assets/shell.js#takeExistingContentNode()`](assets/shell.js) — move conteúdo como `DocumentFragment` (nós reais via `appendChild`), preservando listeners.

**Implicação pra protótipos novos:** pode colar `onclick` via JS sem medo. Funciona.

### Slugs ativos da sidebar (todos os atuais)

```js
// em assets/shell.js NAV
dashboard · insights
agent-studio · aprovacoes · disparos
memory-base · aops · library · canais · integracoes · tools
conversations · playground · history
settings
```

### Menu da conta (rodapé da sidebar)

Click no card de usuário abre dropdown com:
- **👤 Meu perfil** (stub alert)
- **🔁 Trocar organização** (stub alert)
- **⚙ Configurações** → `team-funcoes-config.html`
- **🚪 Sair** → confirm + clear sessionStorage + redirect pra `primeiro-login.html#w1-a`

Spec completo: [`stories/team-funcoes-config.md` § 4.2 Cenários 4.1/4.2/4.3](stories/team-funcoes-config.md).

---

## 🎨 Padrão visual canônico

| Variável | Valor | Uso |
|---|---|---|
| `--bg` | `#f5f1e8` | Background da janela |
| `--paper` | `#fdfaf3` | Cards, blocks, modais |
| `--paper2` | `#f9f4ea` | Hover, fundos secundários |
| `--ink` | `#1a1a1a` | Texto, bordas sólidas |
| `--muted` | `#6b6b6b` | Texto secundário |
| `--green/red/yellow/blue/orange/purple` + `--*-bg` | — | Status badges |
| `--shadow-sm/md/lg` | offset `1px-3px` | Look de desenho à mão |

**Fontes sketch** (via fallback local/system, sem dependência remota):
- **Caveat** — títulos handwritten (h1/h2/h3), quando disponível
- **Patrick Hand** — corpo, quando disponível
- **Architects Daughter** — notas itálicas (`.note`), quando disponível

**Componentes do shell** (não redefina nos protótipos):
`.btn` `.btn.secondary` `.btn.ghost` `.btn.small` · `.btn-link` · `.input` `.select` · `.table` (com `.kebab`) · `.modal-mask` + `.modal` (com `.lg`) · `.banner` (warn/error/success/info) · `.badge` (com green/yellow/red/blue/orange/purple) · `.row` (com `.between` `.gap-sm`) · `.divider` · `.note` · `.sr-only`.

**Bordas tracejadas** em containers de navegação (sidebar, topbar, banners, badges) — sinal contínuo de "rascunho".

**Acessibilidade obrigatória** (WCAG 2.1 AA):
- `aria-label` em ícones com significado; `aria-hidden="true"` nos decorativos
- `<th scope="col">` + `<caption class="sr-only">` em tabelas
- `role="dialog" aria-modal="true"` em modais + focus trap + Esc fecha
- Skip-link no topo (`<a href="#pageContent" class="sr-only">`)
- Cor + ícone + label em todos os badges (não depender só de cor — WCAG 1.4.1)

---

## 🔁 Fluxos de trabalho

### Desenhando feature nova

1. **Não criar wireframe ASCII** — direto pro HTML. Brainstorm rápido fica no chat.
2. **Reaproveitar shell** — `<link rel="stylesheet" href="../assets/shell.css">` + `<div id="proto-shell" ...>` + `<script src="../assets/shell.js">`. Não duplicar CSS de botão/modal/tabela — já tá no shell.
3. **Antes da v1**, se UX tiver decisão aberta (fluxo, hierarquia, microcopy), convocar **Sally** (`/bmad-ux-designer` ou Skill `bmad-create-ux-design`).
4. **Validar JS** antes de declarar pronto (evita render em branco por backtick mal-escapado):
   ```bash
   node -e "const fs=require('fs');const h=fs.readFileSync('prototypes/X.html','utf8');const ms=[...h.matchAll(/<script[^>]*>([\\s\\S]*?)<\\/script>/g)].filter(m=>m[1].trim().length);ms.forEach((m,i)=>{try{new Function(m[1]);console.log('script',i+1,'OK');}catch(e){console.log('script',i+1,'ERR:',e.message);}});"
   ```
5. **Atualizar `stories/<area>.md`** em paralelo (BDD reflete o que o protótipo entrega).

### Iterando feature existente

1. Editar o `.html` direto.
2. Se a mudança veio de stress test → ler o fix backlog em `stress-tests/<area>/scenarios-and-fixes/fix-backlog.md`, aplicar Onda por Onda.
3. Atualizar story com changelog da iteração.
4. Re-validar JS.
5. Se a mudança for visualmente significativa, pedir review da Sally antes de fechar.

### Rodando stress test adversarial

1. `/pg-stress-test` no chat — passar como SUT a story + protótipo da área.
2. Skill `pg-stress-test` em `.claude/skills/pg-stress-test/`:
   - **Step 5** consolidate.md exige **auto-contenção do gap** (5 seções: Como está hoje · Cenário concreto · Por que quebra · Consequência · Fix sugerido)
   - **Anti-padrão jargão denso** — frases tipo "Manager curto, Admin overkill" são rejeitadas
3. Output em `stress-tests/<area>/report.md` + subpasta `scenarios-and-fixes/`.
4. Aplicar Onda 1 (P0) imediatamente; Onda 2 (P1) na próxima iteração.

### Tirando prints

Playwright MCP salva PNGs em `.playwright-mcp/` na raiz do repo ou na cwd. **Ao terminar a sessão, mover pra cá:**

```bash
DST=/Users/guilhermegraham/awsales/prototype-studio/prints/sessao-AAAA-MM-DD
mkdir -p "$DST"
mv /Users/guilhermegraham/awsales/*.png "$DST/"
```

Convenção: `<prototipo>-<NN>-<descricao>.png` (ver [`prints/README.md`](prints/README.md)).

---

## 📜 Convenções importantes (gotchas)

1. **Sem backticks dentro de template literals JS** — bug histórico em `financeiro.html` (modal LGPD com `` `hash_pseudo_<user_id>` `` quebrou parse e fez tela renderizar vazia). Use `&lt;` `&gt;` ou `<code>...</code>` HTML entities. Bug está documentado no fix-backlog do stress de funcoes.

2. **Persistência em localStorage** — cada protótipo tem chave própria pra não conflitar:
   - `prototype-studio.integrations.instances`
   - `prototype-studio.channels.accounts`
   - `prototype-studio.sidebar.collapsed` (do shell)
   - Adicionar `?reset=1` na URL pra zerar (alguns protótipos suportam)

3. **Hash routing simples** — `location.hash` → função `render()`. Sem React/Vue. Cada protótipo tem seu próprio router interno (não global).

4. **Sub-navegação dentro de protótipo** ≠ sidebar do shell. Ex: `team-funcoes-config.html` tem sub-tabs internas (Geral/Team/Funções/Financeiro/Segurança) que vivem **dentro** do `<main class="page-content">`, não no shell.

5. **Layout `centered`** (`data-layout="centered"`) — usado em `primeiro-login.html` (signup pré-produto). Sem sidebar nem topbar. Banner + demo-nav permanecem.

6. **Item da sidebar coming-soon** — `comingSoon: true` em [`assets/shell.js`](assets/shell.js) NAV → renderiza `<span>` em vez de `<a>`, com classe `.coming-soon` (cinza, italic, cursor not-allowed, badge "em breve").

7. **App real do Greg como fonte da verdade** — sempre que for criar/refazer um protótipo, **ler primeiro** o `.tsx` correspondente em [`../investigations/awsales_nova-vulgata-agent-chat-dash_handoff_preview/app/`](../investigations/awsales_nova-vulgata-agent-chat-dash_handoff_preview/app/) + componentes em `components/` + libs em `lib/`. Categorias, slugs, ações, permissions precisam bater.

---

## 🔗 Links rápidos

### Por área (story + protótipo + stress test)

| Área | Story | Protótipo | Stress test |
|---|---|---|---|
| Primeiro Acesso | [story](stories/primeiro-login.md) | [proto](prototypes/primeiro-login.html) | [report](stress-tests/primeiro-login/report.md) |
| Configurações da Org | [story](stories/team-funcoes-config.md) | [proto](prototypes/team-funcoes-config.html) | [funcoes report](stress-tests/funcoes/report.md) |
| Financeiro | [story](stories/financeiro.md) | [proto](prototypes/financeiro.html) | [report](stress-tests/financeiro/report.md) |
| Canais | — (segue real do Greg) | [proto](prototypes/canais.html) | — |
| Integrações | [story](stories/integracoes.md) | [proto](prototypes/integracoes.html) | [rep.1](stress-tests/integracoes/report-1.md) · [rep.2](stress-tests/integracoes/report-2.md) |
| Habilidades | — (segue real do Greg) | [proto](prototypes/habilidades.html) | — |

### Docs e ferramentas

- 📖 [`../docs/product/ux-prototype-workflow.md`](../docs/product/ux-prototype-workflow.md) — padrão prototype-first canônico
- 🔍 [`.claude/skills/pg-stress-test/`](../.claude/skills/pg-stress-test/) — skill do stress test adversarial
- 🎨 Sally (UX Designer BMAD) — [`_bmad/bmm/agents/ux-designer.md`](../_bmad/bmm/agents/ux-designer.md) · invocar com `/bmad-ux-designer`
- 🏛 App real do Greg — [`../investigations/awsales_nova-vulgata-agent-chat-dash_handoff_preview/`](../investigations/awsales_nova-vulgata-agent-chat-dash_handoff_preview/)

---

## 📅 Histórico / Changelog

### 2026-05-12 — Sessão de unificação + iterações
- **Unificação:** conteúdo migrado de `investigations/2026-04-30-new-scree-integrations/` (Integration Hub) + `investigations/2026-05-11-primeiro-login-convite-equipe/` (Primeiro Acesso + Configurações + Financeiro). Padrão **prototype-first** definido.
- **Shell v2** (`assets/shell.{css,js}`) — replica sidebar do Greg, mantém estética sketch, suporta layout `full`/`centered`, sidebar colapsável, menu de perfil com logout.
- **6 protótipos migrados** pro shell v2 + 2 stubs novos criados (canais, habilidades) — todos com JS validado.
- **Fix crítico:** shell movia conteúdo via `innerHTML` (string) e perdia event listeners. Trocado por `DocumentFragment.appendChild`.
- **Integrações + Habilidades + Canais reescritos** com fidelidade ao app real do Greg (33 provedores reais · agrupamento por instância · 3 canais Meta).
- **`inicio.html` criado, mas fora do menu por enquanto** — home pós-login com KPIs + atalhos + timeline. Botões "Entrar agora" do primeiro-login redirecionam aqui (com auto-redirect 3s).
- **Coming-soon na sidebar** — 11 itens não-prontos marcados com badge "em breve", cinza, não-clicável.
- **Menu da conta + logout** no rodapé da sidebar (cenários 4.1/4.2/4.3 da story team-funcoes-config v3.4).
- **Wireframes ASCII removidos** (pasta `archive/wireframes-ascii/`) — não-canônicos pós prototype-first.
- **Prints organizados** em `prints/sessao-2026-05-12/` (7+ PNGs) com README de convenção.
- **Skill `pg-stress-test` atualizada** — auto-contenção dos gaps obrigatória (anti-padrão "jargão denso" tipo "Manager curto, Admin overkill").

### 2026-05-11 e antes (investigations originais)
- Veja `archive/transcricoes/` + `archive/decisoes-antigas/` pra contexto histórico do design original.

---

## 🤖 Pra IA / dev que abrir este projeto pela primeira vez

**Lê este README primeiro, depois:**

1. **Sobe o servidor** (`python3 -m http.server 8765` na raiz desta pasta) e abre `http://localhost:8765` no browser pra ter sensação do estado atual.
2. **Não cria wireframe ASCII** standalone — direto pro HTML reaproveitando o shell.
3. **Antes de criar/refazer um protótipo**, lê o `.tsx` correspondente no app real do Greg pra usar fontes de verdade.
4. **Valida JS** sempre antes de declarar pronto. O bug de backtick em template literal já queimou tempo — não cair de novo.
5. **Stress test** com `/pg-stress-test` quando uma área estiver madura. Aplica Onda 1 imediatamente, Onda 2 depois.
6. **Sally** (BMAD UX) é sua aliada pra review de UX antes de fechar uma iteração — convoque via `/bmad-ux-designer`.
7. **Prints** vão pra `prints/sessao-AAAA-MM-DD/` com convenção `<protótipo>-<NN>-<desc>.png`. Move da raiz do repo ao terminar a sessão.
8. **Stories e protótipos andam juntos** — toda mudança visual significativa entra na story como cenário BDD + changelog na versão.
