# Camadas do design system — taxonomia canônica

> Fonte de verdade para a **classificação** de cada componente do Bombardier DS.
> Irmão do [`styleguide-page-structure.md`](./styleguide-page-structure.md) (que
> define a *estrutura* de cada página). Aqui definimos em que **camada** cada peça
> vive na sidebar do styleguide (`app/bombardier/styleguide/navigation.ts`).

Esta é a versão 2026-05.

## Por que existe

A documentação por componente já é forte. O que faltava era **taxonomia**: um dev
batendo o olho na sidebar não distinguia um tijolo reutilizável (`Botões`) de uma
peça única de tela de negócio (`WhatsApp panel`) — ambos ficavam lado a lado numa
única seção "Componentes" com ~55 itens em ordem alfabética.

A sidebar agora reflete a **pirâmide de abstração** do design system. Lendo de cima
pra baixo, o dev aprende a hierarquia: do mais fundamental e reutilizável (base) ao
mais específico e amarrado ao produto (topo).

```
┌─────────────────────────────────────────────────────────────┐
│  Domínio        ← só faz sentido na AwSales (agente, billing) │  + específico
│  Padrões        ← fluxo/região inteira, ainda genérico        │
│  Componentes    ← compõe primitivos, agnóstico de negócio     │
│  Primitivos     ← tijolo de 1 propósito, sem domínio          │  + fundamental
│  Foundations    ← tokens: cor, tipografia, spacing, motion…   │  (base, não-componente)
└─────────────────────────────────────────────────────────────┘
```

**Regra de dependência:** cada camada só depende das camadas **abaixo** dela, nunca
das de cima. Um `Botões` (primitivo) jamais importa um `Agent tile` (domínio); um
`Agent tile` é livre pra usar `Botões`, `Avatar`, `Pills`. É isso que mantém a base
estável — mexer num primitivo propaga pra todo mundo; mexer numa peça de domínio o
estrago é local.

## As 4 camadas (a régua de classificação)

| Camada | Pergunta-chave | Sabe de negócio? | Exemplos |
|---|---|---|---|
| **Primitivos** | É um tijolo de propósito único, composto só de tokens + HTML/Radix? | Não | Botões, Inputs, Select, Checkbox, Avatar, Pills, Toast, Skeleton |
| **Componentes** | Combina primitivos num bloco genérico, reutilizável em qualquer produto? | Não | Cards, Modais, Sheet, Tabela, Nav rail, Page header, Stat card |
| **Padrões** | Orquestra um fluxo ou região inteira de tela, mas ainda genérico? | Pouco | Onboarding shell, Welcome modal, Connect modal, Password setup |
| **Domínio** | Está amarrado a um conceito de negócio da AwSales (agente, integração, billing, brand)? | Sim | Agent tile, Specialists pair, Integration card, WhatsApp panel |

### Regras de desempate

1. **Se deixaria de fazer sentido em outro produto que não a AwSales → é Domínio.**
   (vence sobre as outras camadas)
2. **Na dúvida entre duas camadas adjacentes → escolha a mais baixa** (mais
   fundamental / mais reutilizável) e registre o porquê aqui.
3. Pergunta-guia: *"compõe outros componentes do DS?"* Não → Primitivo. Sim e
   genérico → Componente. Sim e multi-passo/região → Padrão. Sim mas preso ao
   negócio → Domínio.

## Criei um componente novo — em que camada coloco?

```
Só faz sentido dentro da AwSales (agente, integração, billing, brand)?
   └─ sim → Domínio
   └─ não → É um fluxo/região inteira (multi-passo)?
              └─ sim → Padrões
              └─ não → Compõe outros componentes do DS?
                         └─ sim → Componentes
                         └─ não → Primitivos
```

Registre o componente em `navigation.ts` na seção da sua camada, em ordem
alfabética. **Nenhum `href` muda** ao mudar de camada — o agrupamento é só
governança de navegação.

## Mapeamento atual (auditoria)

Espelha `app/bombardier/styleguide/navigation.ts` — consulte a nav para o inventário vivo (a contagem muda; não fixamos número aqui).

**Primitivos (19)** — Alertas · Avatar · Botões · Breadcrumb · Checkbox ·
Controles · Dropdown menu · Empty · File icon · Inputs · Pills · Progress ·
Select · Skeleton · Slider · Status dot · Tabs · Toast · Transition

**Componentes (20)** — Card brand · Cards · Chat bubbles · Chrome · Data table ·
Dot tunnel · Group card · List group · Members table · Modais · Nav list ·
Nav rail · Option list · Page header · Payment method card · Sheet ·
Shortcut tile · Stat card · Stats display · Tabela

**Padrões (9)** — Backup codes · Connect modal · Integration catalog ·
Onboarding shell · Onboarding timeline · Password setup · QR placeholder ·
Template builder sheet · Welcome modal

**Domínio (7)** — Agent tile · Banner de plano adicional · Brand logo ·
Integration card · Specialists pair · Visual dos agentes · WhatsApp panel

### Fronteiras revisadas (2026-05)

Itens debatíveis, resolvidos aplicando o tie-break #1 — *"só faz sentido na
AwSales"*:

- **Dot tunnel** → *Componentes* (era Domínio). Visual decorativo sem lógica de
  negócio; faz sentido em qualquer produto, então não é Domínio.
- **Payment method card** + **Card brand** → *Componentes*, juntos (Payment method
  card era Domínio). Chip de bandeira e cartão salvo são UI de pagamento genérica —
  qualquer SaaS com billing usa; não são conceito exclusivo da AwSales.
- **Empty** / **Alertas** → *Primitivos*. Compõem sub-partes, mas têm propósito
  único de feedback; ficam na base por reutilização.

Resultado: **Domínio** fica só com o inequivocamente AwSales — agentes (Agent tile,
Specialists pair, Visual dos agentes), integrações (Integration card, Brand logo,
WhatsApp panel) e comercial (Banner de plano adicional).

## Escopo desta fase

A pasta física `components/ui/` permanece **plana de propósito** — a camada vive na
**navegação e na governança**, não no filesystem. Mover ~78 arquivos pra subpastas
quebraria centenas de imports por ganho marginal. Se um dia uma migração de pastas
for desejada, ela segue exatamente este mapeamento como roteiro.

Fora de escopo (decidido): mover arquivos, criar barrel exports, renomear
componentes.
