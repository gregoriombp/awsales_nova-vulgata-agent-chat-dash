# Setup do ambiente — usuário "germano" (conta Claude compartilhada)

> Documento de handoff. Explica **por que o `localhost` dava Internal Server Error**,
> o que mudou no repo, e os **2 passos** que o usuário `germano` precisa fazer **uma vez**.

---

## Contexto (o que é esse setup)

Esse projeto roda numa **única pasta compartilhada** no Mac do Gregório:

```
/Users/gregoriopinheiro/Documents/awsales_nova-vulgata-agent-chat-dash
```

Dois usuários do macOS mexem nela:

- **`gregoriopinheiro`** — dono do repo. É o único com acesso ao **git** (repositório privado).
- **`germanofaccio`** — usuário operário, roda uma conta Claude da AwSales compartilhada.
  Tem permissão de **editar arquivos** na pasta (via folder sharing), mas **não tem git**.

Como é a **mesma pasta**, tudo que o germano edita já aparece direto na árvore de trabalho
do Gregório. **Não existe "sincronizar"**: o Gregório só revisa e commita pela conta dele.
Nada de branch, worktree ou merge entre os dois.

---

## O bug que apareceu (Internal Server Error no localhost)

Os dois usuários estavam rodando `npm run dev` na mesma pasta → os dois escreviam no
**mesmo cache de build (`.next/`)**. Como cada arquivo do `.next` fica com o **dono** de
quem o criou, o servidor de um não conseguia sobrescrever os arquivos do outro:

```
TurbopackInternalError: failed to write to ".next/dev/.../page_client-reference-manifest.js"
Caused by: Operation not permitted (os error 1)
```

Sem conseguir gerar os chunks/manifests, **toda rota responde Internal Server Error**.
Um único `.next` compartilhado entre dois usuários do macOS **nunca** funciona de forma estável.

---

## A correção (já aplicada no repo)

O cache de build agora é **por usuário**, controlado por uma variável de ambiente.
Mudanças já commitadas (lado do Gregório):

- **`next.config.ts`** → `distDir: process.env.NEXT_DIST_DIR || '.next'`
  Sem a variável, continua usando `.next` (Gregório). Com ela, usa o cache próprio.
- **`.gitignore`** → ignora `/.next-*/` (o cache do germano nunca vai pro git).

Resultado: cada usuário tem o **seu** `.next` e a **sua** porta. Os dois podem rodar o
dev server **ao mesmo tempo, pra sempre**, sem brigar.

---

## ✅ O que o germano precisa fazer (UMA vez)

Logado na conta `germanofaccio`, adicionar estas 2 linhas no fim do `~/.zshrc`:

```bash
export NEXT_DIST_DIR='.next-germano'
export PORT=3001
```

Depois recarregar o shell (fechar e abrir o terminal, ou `source ~/.zshrc`).

A partir daí, é só rodar normalmente:

```bash
npm run dev
```

Vai subir na **porta 3001** usando o cache **`.next-germano`** (criado e possuído pelo
germano), sem encostar no `.next` do Gregório. **Não precisa lembrar de prefixo nenhum** —
a variável vive no profile do usuário.

- Gregório → `http://localhost:3000` (cache `.next`)
- Germano  → `http://localhost:3001` (cache `.next-germano`)

---

## ⚠️ Regras do germano (importante)

1. **Nunca rodar `npm install`.** O `node_modules` é do Gregório. Se faltar dependência,
   é o Gregório que instala. O germano só **edita arquivos** e **roda o dev server**.
2. **Nunca mexer no git** (não tem acesso, e é de propósito). Commit é sempre do Gregório.
3. **Só editar código-fonte e rodar `npm run dev`.** Nada de build de produção nem scripts
   que mexam em estado compartilhado.

---

## 🔧 Se o Internal Server Error voltar (só no germano)

Significa que o cache `.next-germano` corrompeu. É seguro apagar **só o dele**:

```bash
# como germano
rm -rf .next-germano
npm run dev
```

Isso **não afeta** o Gregório (que usa `.next`).

---

## Resumo de quem compartilha o quê

| Recurso                         | Compartilhado? | Observação                                  |
|---------------------------------|:--------------:|---------------------------------------------|
| Código-fonte (`.tsx`, `.css`…)  | ✅ uma pasta só | edição do germano cai direto na árvore do Greg |
| **Git**                         | ❌ só Gregório  | privado; germano nunca toca                 |
| `.next` (cache de build)        | ❌ um por user  | Greg = `.next`, germano = `.next-germano`   |
| Porta do dev server             | ❌ 3000 vs 3001 | dois servers simultâneos                     |
| `node_modules`                  | ✅ (só leitura p/ germano) | Greg instala, germano consome     |
