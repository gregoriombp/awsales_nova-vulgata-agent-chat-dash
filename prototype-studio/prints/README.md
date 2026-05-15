# prints/

Capturas de tela dos protótipos do `prototype-studio/`. Organizadas por sessão de trabalho.

## Como tirar prints novos

Quando rodar testes Playwright via Claude Code (ou manualmente), o MCP do Playwright tende a salvar PNGs em `/Users/guilhermegraham/awsales/.playwright-mcp/` ou na raiz do repo. **Mover pra cá** ao terminar a sessão:

```bash
DST=/Users/guilhermegraham/awsales/prototype-studio/prints/sessao-AAAA-MM-DD
mkdir -p "$DST"
mv /Users/guilhermegraham/awsales/*.png "$DST/"
```

## Convenção de nome

`<prototipo>-<NN>-<descricao-curta>.png`

- `canais-01-inicial.png` — estado inicial da tela de canais
- `integracoes-modal-novo.png` — modal "Nova integração" aberto
- `financeiro-04-sem-pagenav-final.png` — fix pós-remoção da nav redundante

## Sessões

| Pasta | Data | Contexto |
|---|---|---|
| [`sessao-2026-05-12/`](sessao-2026-05-12/) | 2026-05-12 | Migração pro shell v2 · fix do `appendChild` (event listeners) · `inicio.html` + "Entrar agora" · remoção do `#pageNav` redundante no financeiro |
