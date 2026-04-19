# AwSales - Project Context

> **Leia este arquivo no início de cada sessão para entender o projeto completo.**

---

## O que é AwSales

**AwSales é uma plataforma de agentes autônomos** — não é um chatbot e não é ferramenta de funil de vendas.

É uma infraestrutura que permite empresas criarem e gerenciarem agentes AI que **executam** partes do negócio (vendas, onboarding, suporte, retenção, ops internas) com previsibilidade e controle.

### Distinção crítica

- **Outros produtos**: focam em qualidade de conversa
- **AwSales**: foca em **qualidade de resultado** (outcome quality)

Um agente AwSales é bem-sucedido quando:
- Move um lead pra frente
- Resolve um ticket
- Dispara a próxima ação correta

**Não** quando "soa inteligente".

---

## Filosofia Central

### Agentes não apenas conversam — eles executam

- **Goal-driven**, não free-form
- **Context-scoped**, não knowledge-dumped
- **Operational**, não experimental

Devem parecer mais com "um operador júnior executando um playbook" do que com "assistente AI genérico".

### Knowledge as an Operating System

A inovação principal: **conhecimento não é só "docs upados"**, é um sistema operacional.

O fluxo:
1. **Knowledge OS** (antigo Memory Base) → workspace onde conhecimento vive
2. **Knowledge Base** → container de sources (docs, páginas, integrações)
3. **Layers** → fatias processadas e curadas de contexto
4. **Objective-Bound Knowledge Layers** → layers criadas especificamente pra um objetivo customizado, reduzindo ruído

---

## O problema que estamos resolvendo

A maioria das plataformas de agentes AI falha porque o knowledge layer é:
- **Genérico demais** → agentes alucinam ou respondem superficialmente
- **Amplo demais** → retrieval traz info irrelevante
- **Difícil de gerenciar** → usuários não entendem o que a AI "sabe"

**Nossa solução**: conhecimento usável, scoped e transparente
- Usuários entendem o que está incluído/excluído
- Agentes são consistentes e confiáveis
- Sistema suporta múltiplos contextos sem forçar uma única "categoria de objetivo"

---

## O que estamos construindo (produto atual)

Reconstruindo o produto em torno do conceito "Knowledge as OS":

1. **Organizar conhecimento** do jeito que humanos pensam (separação clara de contextos)
2. **Transformar sources em inteligência** utilizável (contexto confiável, scoped, acionável)
3. **Criar agentes** que performam tarefas goal-oriented usando a fatia certa de conhecimento

### Estrutura do Agent Studio

Um agente tem separação clara entre:
- **Identity/personality** (estático)
- **Operational flow/checkpoints** (guia de comportamento)
- **Tools/actions** (o que ele pode fazer)
- **Variables/data** (o que ele sabe ou coleta)

---

## Princípios de UX/Produto

### Otimizamos para:
- **Clareza** > cleverness
- **Controle** sem complexidade
- **Onboarding** que ensina o mental model
- **Criação rápida** de agentes
- **Separação limpa** entre identity, flow, tools, data

### O que NÃO fazer:
- ❌ Tratar como "só um chatbot com documentos"
- ❌ Forçar usuários a escolher um único objetivo fixo pro conhecimento todo
- ❌ Otimizar pra pureza técnica — otimize pro **mental model do usuário** e outcomes repetíveis

### Regra de ouro para decisões

Quando indeciso, escolha a opção que melhora o entendimento do usuário sobre:
1. **O que o agente sabe**
2. **Por que ele sabe isso**
3. **Como esse conhecimento vira ação**

---

## Stack Técnica

- **Framework**: Next.js (App Router)
- **Database**: Supabase
- **Features principais**:
  - Agent Studio (`/app/agent-studio`)
  - Knowledge OS / Knowledge Bases
  - Chat com agentes AI
  - Dashboard de vendas

---

## Quando trabalhar neste projeto

### Priorize sempre:
- **Execução clara** > liberdade conversacional
- **Confiabilidade** > criatividade
- **Redução de ambiguidade** sobre "o que o agente faz"

### Lembre-se:
- Isto é **infraestrutura**, não ferramenta de demo
- Deve escalar de 1 agente pra dezenas sem ficar confuso
- Qualquer coisa que aumenta ambiguidade é um problema

---

## Como usar este contexto

1. **Nova sessão?** Leia este arquivo primeiro
2. **Dúvida de produto?** Volte aos princípios acima
3. **Decisão de UX?** Pergunte: "isso ajuda o usuário a entender o que o agente sabe e como isso vira ação?"

---

**Última atualização**: 2026-02-04
