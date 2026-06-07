# Memory Base — visão de produto

> Documento de **visão** (o "porquê" e o modelo mental). Para o plano de
> implementação e o que falta fazer, ver [`memory-base-rework.md`](./memory-base-rework.md).
> Escrito em 2026-06-07. Repo é **preview de UX/UI** — sem backend, tudo `localStorage`.

---

## Em uma frase

**Memory Base é onde o cliente da AwSales transforma seus materiais crus
(arquivos, sites, integrações) no conhecimento que os agentes de IA usam para
conversar.** Você joga a fonte; a IA digere; o agente responde com base nisso.

---

## As 3 camadas

O produto inteiro se organiza em 3 níveis. Acertar essa linguagem (nomes +
ícones) é o que mantém tudo coerente entre telas.

```
Memory Base  (o produto)
   └── Base de conhecimento  (o usuário cria quantas quiser)
          └── Fonte  (arquivo · URL · snippet · integração)
                 └── Knowledge Layers  (resultado da análise da IA)
```

| Camada | O que é | Ícone canônico |
|---|---|---|
| **Memory Base** | O **produto** dentro da AwSales. Container de todas as bases do cliente. | grade pontilhada (`AwMemoryBaseLogo` / `MemoryBaseIcon`) |
| **Base de conhecimento** | Cada base que o usuário cria. Reúne fontes em torno de um objetivo (ex.: "Catálogo de produtos"). | **biblioteca/instituição** (`account_balance`) |
| **Fonte** | Um material cru adicionado à base: arquivo, URL, snippet ou integração. Tem ciclo de análise (Analisando → Ativo / Erro / Inativo). | ícone por tipo, **em grayscale** |
| **Knowledge Layers** | O resultado da análise da IA **sobre uma fonte**. Ex.: um PDF vira 17 layers. São as "fontes de conhecimento prontas" que o agente consulta. | 3 camadas verticais (`layers`) |

**Regra de ouro da contagem:** os Knowledge Layers de uma base são **derivados** —
a soma dos layers de todas as suas fontes. Nunca um número editável à mão.

---

## O loop central

É o coração do produto. Toda a UX gira em torno de fechar este ciclo rápido:

```
 1. Criar base            → nomear (modal "Criar base de conhecimento")
 2. Adicionar fontes      → arquivos / URL / snippet / integrações
 3. IA analisa (background)→ cada fonte vira N Knowledge Layers  (Analisando → Ativo)
 4. Agente usa            → consulta os layers nas conversas
```

A tela de **detalhe da base** é onde os passos 2-3 vivem: o card "Adicione
Fontes" (4 entradas) + a lista de fontes com Status e contagem de layers por
linha. O header mostra os agregados da base (status, agentes que usam, nº de
fontes, total de Knowledge Layers).

---

## Modelo mental & telas

| Tela | Rota | Papel |
|---|---|---|
| **Index** | `/memory-base` | Todas as bases do cliente. Busca + filtros (Status, Objetivo) + Cards/Lista. Botão **Criar base** → modal de nome. |
| **Detalhe da base** | `/memory-base/[id]` | O loop fonte → layers. Header escuro (ícone biblioteca + nome + agregados) + Adicione Fontes + navegador de arquivos + drawer de detalhe da fonte. |
| **Busca semântica** | `/memory-base/[id]/semantic-search` | Explorar os Knowledge Layers da base por significado. |
| **Configurações** | `/memory-base/[id]/settings` | Ajustes da base. |

**Estados do index** (no protótipo são fixos; em produção vêm do backend):
`welcome` (1º acesso, cena do shader) · `empty` (sem bases) · `populated` (lista).

---

## Princípios de design

1. **Grayscale.** A UI da Memory Base é monocromática — tipo de arquivo se
   distingue pelo **glifo**, não pela cor. Sem slate/blue. (Verde só como
   semáforo de status.)
2. **Enxuto > completo.** Densidade de dashboard (11 colunas / 5 filtros) não é o
   alvo. Referência: OpenAI / ElevenLabs / Slite — 3-6 colunas, 2-3 filtros, muito
   respiro. Metadado de leitura rápida (Tipo de dados, Produtos) vive no detalhe,
   não na lista.
3. **Avatares reais.** "Usado por N agentes" mostra os orbs reais dos agentes
   (`getOrbForAgent`), não um ícone genérico.
4. **Criar é um passo explícito.** Nomear a base antes de entrar (cria-e-configura),
   nunca cair numa base vazia sem feedback.
5. **Ícones canônicos** das 3 camadas, sempre os mesmos (ver tabela acima).
6. **Desktop-only.** Sem mobile-first.

---

## Não-objetivos (por enquanto)

- Edição manual de Knowledge Layers (são derivados da análise da IA).
- Filtros de dashboard pesados no index (reintroduzir só quando o volume justificar).
- Backend real — este repo é preview; persistência é `localStorage`.
