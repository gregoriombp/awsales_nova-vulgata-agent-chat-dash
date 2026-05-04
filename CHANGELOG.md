# Changelog

Decisões e mudanças relevantes pro design system, arquitetura e workflow desse repo. Não é release notes — é registro pra quem (humano ou IA) entrar no projeto entender por que as coisas estão como estão.

Formato livre: data (YYYY-MM-DD), categoria, o que mudou, **por quê** quando o motivo for não-óbvio.

---

## 2026-05-04

### Documentação
- Removido `IMPLEMENTATION_NOTES.md`. Descrevia só o login do beta inicial (fala em Roboto + Instrument Sans, dashboard como "placeholder", etc) e estava muito desatualizado em relação ao produto atual. Substituído por `README.md` curto apontando pra `/bombardier/styleguide`.
- Atualizada `description` do `package.json` (estava `"AwSales 2.0 - Login and Authentication System"`).
- Atualizado `metadata.title` e `metadata.description` em `app/layout.tsx` (também herdados do beta).
- Adicionados `CLAUDE.md` e `CHANGELOG.md` na raiz. **Por quê:** trabalhamos com agentes de IA via Cursor/terminal e eles não têm memória entre sessões; arquivos versionados no repo são a única forma de cada nova sessão começar com contexto correto.

### Tipografia
- Alinhadas todas as referências de fonte ao que de fato é carregado: `Mona Sans` → `Geist`, `JetBrains Mono` → `Geist Mono`.
- Arquivos alterados: `app/globals.css`, `app/layout.tsx`, `app/bombardier/styleguide/layout.tsx`, `app/bombardier/styleguide/page.tsx`, `app/bombardier/styleguide/components/pills/page.tsx`, `app/bombardier/styleguide/components/sheet/page.tsx`.
- **Por quê:** o `<link>` de fontes em `app/layout.tsx` sempre carregou Geist + Geist Mono, mas comentários e textos visíveis no styleguide ainda diziam Mona Sans / JetBrains Mono. Documentação interna divergente vira drift.

### Bombardier
- Skill `bombardier-flow` criada como draft em `~/Desktop/Projects/Working/Bombardier Skills/skills/bombardier-flow/`. Operacionaliza a convenção de FigJam pra desenhar user flows por feature.
- FigJam template criado pra integração WhatsApp: https://www.figma.com/board/uRmyx0cydpbOvVHjV50gnV — serve de referência pra duplicar nas outras integrações.
- Convenção fechada: **fluxo (navegação, branches, decisões) vai pra FigJam dedicado, código só executa.** Cada `page.tsx` que tem flow desenhado carrega `// Flow: <url>` como primeira linha não-import.

---

## Como adicionar uma entrada

Mudança que afete decisões futuras (não só "ajeitei um typo") merece linha aqui. Inclua:

1. **O que mudou.**
2. **Onde** (arquivo ou caminho).
3. **Por quê**, especialmente se o motivo não for óbvio pelo diff.

Categorias livres — Documentação, Tipografia, Tokens, Componentes, Arquitetura, Bombardier, Decisões, Drift corrigido, etc.
