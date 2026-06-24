# Iconografia — Material Symbols Rounded

Guia prático de **uso** (qual `size`/`weight`/`fill` para cada caso) e de
**descoberta** (achar o nome de um glyph offline, sem abrir o fonts.google.com).

A referência **visual** (anatomia, matriz de tamanhos, do/don't) vive na foundation:
[`app/bombardier/styleguide/foundation/iconography`](../../app/bombardier/styleguide/foundation/iconography/page.tsx).
As regras canônicas estão no [`AGENTS.md`](../../AGENTS.md) → *Icons*.

---

## TL;DR — não existe "baixar ícone"

O sistema é uma **fonte variável** (Material Symbols Rounded) carregada via CDN em
[`app/layout.tsx`](../../app/layout.tsx). **Todo glyph que existe já funciona hoje** —
basta o nome:

```tsx
import { Icon } from "@/components/ui/Icon"

<Icon name="search" />
```

Não há SVG para baixar, nem arquivo para versionar por ícone. O único asset offline
aqui é o **índice de nomes** (`material-symbols-rounded.codepoints`, ~80 KB), só pra
você descobrir o nome certo rápido. Clonar o repo do Google (`google/material-design-icons`,
**~4,6 GB**, quase tudo PNG e os Material *Icons* antigos) seria desperdício e bloat.

---

## Os 4 eixos (= as props do `Icon`)

Material Symbols **não tem "stroke" vs "fill"** como Lucide/Feather. O que parece "stroke"
é o eixo de **peso**; o "preenchido" é o eixo **FILL**. Os quatro eixos são props de
[`components/ui/Icon.tsx`](../../components/ui/Icon.tsx):

| Prop      | Eixo   | Valores                         | Default | Para quê |
|-----------|--------|---------------------------------|---------|----------|
| `size`    | visual | 12 · 16 · 20 · 24 · 28 · 32     | `20`    | Tamanho renderizado. **Sem intermediários.** |
| `opticalSize` | `opsz` | 20..48                     | `clamp(size, 20..48)` | Desenho ótico do glyph. Ícones de 12/16px ainda usam `opsz` 20 para não virarem fio. |
| `weight`  | `wght` | 200 · 300 · 400 · 500 · 600 · 700 | automático | Espessura do traço. O default sobe para 300/400 em tamanhos pequenos; 200 fica para ícones amplos. |
| `fill`    | `FILL` | `0` · `1`                       | `0`     | `0` outlined; `1` preenchido — **só** para estado ativo/selecionado. |
| `grade`   | `GRAD` | -25 · 0 · 200                   | automático | Ajuste ótico fino. O default usa `200` só em glyphs minúsculos. |

`Icon` herda **`currentColor`** — nunca hardcode cor (exceto o acento de IA, abaixo).

---

## Cheat-sheet por caso de uso

| Contexto | `size` | `weight` | `fill` | Exemplo |
|----------|--------|----------|--------|---------|
| Dentro de botão/input **sm** | `16` | automático (`300`) | `0` | `<Icon name="add" size={16} />` |
| Botão **md** / inline com corpo de texto | `20` | automático (`300`) | `0` | `<Icon name="search" />` |
| Item de nav (rail / list) | `20`–`24` | automático (`300`) | `0` | `<Icon name="dashboard" size={24} />` |
| Item de nav **ativo/selecionado** | `20`–`24` | automático (`300`) | `1` | `<Icon name="dashboard" fill={1} />` |
| Header / page hero / empty state | `28`–`32` | automático (`200`) ou `300` | `0` | `<Icon name="hub" size={32} />` |
| Estado on (favoritado, fixado, toggle) | igual ao contexto | — | `1` | `<Icon name="star" fill={1} />` |
| Ícone em **superfície escura** que precisa firmar | igual | `500`–`600` | — | `<Icon name="bolt" weight={600} />` |
| Acento de **IA** (gerar/executar/sincronizar) | `20`–`28` | automático | `0` | cor `var(--aw-blue-600)` (abaixo) |

**Regra de ouro:** comece sem `weight`; o default já corrige legibilidade por tamanho.
Quando ainda faltar presença, prefira subir `size` antes de subir `weight`. `fill={1}` é
semântico (ativo), não decorativo nem solução para ícone ilegível.

### Acento de IA

Três glyphs reservados pra momentos do agente, com cor brand:

```tsx
<Icon name="auto_awesome" size={24} style={{ color: "var(--aw-blue-600)" }} /> // gerar · sugerir
<Icon name="bolt"         size={24} style={{ color: "var(--aw-blue-600)" }} /> // executar · publicar
<Icon name="sync"         size={24} style={{ color: "var(--aw-blue-600)" }} /> // sincronizar
```

### Glyphs especiais (não são da fonte)

Renderizam pelo mesmo `<Icon>`, mas são marcas próprias:

- `name="agent"` (ou `"gesture"`) — o **gesto animado** que substitui o robô (`smart_toy`).
  Aceita `animated={false}` pra listas densas.
- `name="agent_studio"` — mark do Agent Studio (snap aos 6 tamanhos canônicos, cor baked-in).
- `name="memory_base"` — mark da Memory Base (herda `currentColor`).

---

## Achar o nome de um glyph (offline)

O índice completo (**4257 glyphs**) está em
[`material-symbols-rounded.codepoints`](./material-symbols-rounded.codepoints), formato
`nome codepoint` por linha. Tudo via `grep`, sem internet:

```bash
# Buscar por palavra (case-insensitive)
grep -i wallet docs/icons/material-symbols-rounded.codepoints
#   account_balance_wallet e850
#   wallet  f8ff
#   ...

# Só os nomes (lista limpa, sem o codepoint)
cut -d' ' -f1 docs/icons/material-symbols-rounded.codepoints

# Conferir se um nome exato existe antes de usar no Icon
grep -E '^search ' docs/icons/material-symbols-rounded.codepoints
#   search ef7a   ← existe

# Quantos existem
wc -l < docs/icons/material-symbols-rounded.codepoints
```

> O nome que você passa em `<Icon name="..." />` é exatamente a 1ª coluna deste arquivo.
> Pra ver o glyph desenhado, confira em [fonts.google.com/icons](https://fonts.google.com/icons)
> (estilo **Rounded**) ou na foundation de iconografia do styleguide.

### Atualizar o índice

Quando o Google adicionar glyphs novos, regenere **só este 1 arquivo** (não clone o repo):

```bash
curl -fsSL \
  'https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/MaterialSymbolsRounded%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints' \
  -o docs/icons/material-symbols-rounded.codepoints
```

A fonte servida via CDN já vem sempre na última versão — o índice é só pra busca/autocompletar.

---

## Não faça

- ❌ Clonar `google/material-design-icons` (~4,6 GB) ou commitar SVGs soltos.
- ❌ Hand-roll de `<svg>` ou glyph hardcoded onde cabe `Icon` (ver `AGENTS.md`). Raw `<svg>`
  é só pra ilustrações de marca / visuais de agente (`AwBrandIllustration`, `AwAgentCore`).
- ❌ Misturar outro icon set com Material Symbols.
- ❌ Hardcode de cor — herde `currentColor` (exceto o acento de IA).
- ❌ Tamanho intermediário (ex. 18, 22) — só 12/16/20/24/28/32.
- ❌ `react-icons`/`lucide` em código de produto — `react-icons` **só** pra marcas que o
  Material Symbols não tem (Visa/Mastercard/Amex/Slack/WhatsApp).
