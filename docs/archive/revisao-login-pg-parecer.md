# Parecer sobre a revisao PG do login

Data da verificacao: 2026-06-10  
Base verificada: `http://localhost:3000/awsales/login` e `http://localhost:3000/bombardier/styleguide/ux-flows/poc-visao-global`  
Fonte do pedido: `/Users/gregoriopinheiro/Downloads/revisao-login-greg.pdf`

## Veredito curto

PG esta certo no essencial: os 4 pontos nao-negociaveis apontam problemas reais do hi-fi atual, principalmente anti-enumeracao, reset de senha e fim do reset com auto-login. Eu acataria esses itens como backlog de produto/seguranca.

As ressalvas: alguns argumentos estao fortes demais. Link de reset nao e a unica forma defensavel de recuperacao; codigo por e-mail pode existir como mecanismo de recuperacao se for one-time, curto, rate-limited e neutro. E NIST nao diz "maximo obrigatorio de 64"; diz que o sistema deve permitir pelo menos 64 caracteres. Se a spec da Aswork escolheu maximo 64, tudo bem, mas isso deve ser descrito como decisao de produto, nao como exigencia literal da norma.

## Metodologia

- Extraindo texto do PDF com `pdftotext`.
- Navegando com Playwright MCP/CLI em browser real, com snapshots antes/depois, console e requests.
- Checando o codigo em `components/auth/*`, `lib/validations.ts`, `lib/password-policy.ts` e o flow `app/bombardier/styleguide/ux-flows/login-auth/page.tsx`.
- Referencias externas usadas:
  - [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
  - [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
  - [OWASP Testing for Account Enumeration](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account)
  - [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html)

Observacao de rota: `http://localhost:3000/awsales/` retorna 404. A rota real do login e `http://localhost:3000/awsales/login`.

## 1. Magic link

Status: acatar.

PG esta certo que o caminho nao esta ligado. No login inicial aparecem apenas e-mail, Google e Microsoft. Depois de informar e-mail, a tela de senha tambem nao renderiza a acao de magic link. Existe copy para `magicLink` em `components/auth/_copy.ts`, e existe tela `magicSent`, mas a acao nao aparece na UI navegada.

Ressalva: isso e mais lacuna de produto/fluxo do que vulnerabilidade direta. O risco de seguranca aparece se o dev achar que o caminho existe e implementar parcialmente, ou se a recuperacao acabar sendo usada como substituto improvisado para magic link.

Minha recomendacao: ligar explicitamente o caminho. Como a tela inicial ja pede e-mail, da para evitar uma segunda "tela de pedido" se a decisao de UX for reaproveitar o e-mail ja informado. Mas o grafo e o hi-fi precisam mostrar uma entrada real e uma confirmacao alcancavel.

## 2. Anti-enumeracao

Status: acatar, com uma nuance sobre seletor.

PG esta certo nas tres frentes principais:

- Recuperacao: ao enviar, a UI vai para verificacao e diz "Enviamos um codigo de 6 digitos para pessoa@example.test". Isso e afirmativo e especifico demais. A mensagem correta para recuperacao publica deve ser neutra: "Se existir uma conta com este e-mail, enviaremos as instrucoes".
- Credencial invalida: senha vazia mostra `Password is required`, em ingles. Senha preenchida sempre segue para verificacao por e-mail; nao ha estado navegavel de credencial invalida. No codigo, o `catch` que ligaria `serverError` praticamente nunca acontece no mock atual.
- Seletor: o mesmo array `ORGS` e exibido independentemente de login por senha, social ou SSO. Nao ha filtragem por metodo nem tela "sem acesso por este metodo".

A nuance: mostrar organizacoes depois de uma autenticacao bem-sucedida nao e a mesma coisa que enumeracao publica por e-mail. O problema especifico aqui e de compatibilidade de metodo/acesso: se uma org exige SSO/Okta, ela nao deveria aparecer para um login feito por metodo incompatível. Isso evita vazamento de relacao org-usuario e evita que o usuario escolha um caminho que nunca vai autorizar.

Minha recomendacao: acatar a regra de resposta uniforme para recuperacao e erro de login, e modelar o seletor como "organizacoes autorizadas para o metodo atual". Se nenhuma sobra, mostrar tela terminal generica de sem acesso, sem listar orgs.

## 3. Politica de senha no reset

Status: acatar o problema, ajustar a justificativa normativa.

PG esta certo sobre o estado atual:

- Senha curta e bloqueada.
- Frase com espacos e aceita.
- Nao ha regra de complexidade.
- `password123!` e aceita e leva ao sucesso, apesar da copy "Bloqueamos senhas que ja vazaram".
- 70 caracteres foram aceitos e levaram ao sucesso.
- `lib/validations.ts` so tem `.min(PASSWORD_MIN_LENGTH)`, sem `.max(64)` e sem blocklist.

A parte que precisa ajuste: NIST SP 800-63B-4 recomenda permitir comprimento maximo de pelo menos 64 caracteres; nao exige rejeitar 65+. Se a spec da Aswork definiu maximo de 64, o hi-fi deve mostrar erro em 65+ por consistencia com a spec, mas a frase "NIST manda maximo 64" nao e precisa.

Outra nuance: o proprio `lib/password-policy.ts` diz que HIBP/breach check esta representado na UI e que o backend e dono da verificacao real. Entao o teste no prototipo nao prova que producao deixaria senha vazada passar. Ainda assim, PG esta certo que o hi-fi precisa desenhar o estado de erro, porque a tela promete essa protecao.

Minha recomendacao: criar estados de erro para senha em blocklist e para limite da spec. Se a equipe quiser alinhar estritamente com NIST 800-63B-4, reavaliar tambem o minimo: Rev. 4 fala em 15 caracteres para senha como single-factor e minimo 8 quando usada dentro de MFA. O minimo 10 pode ser decisao de produto, mas nao deve ser vendido como a recomendacao literal atual da NIST.

## 4. Depois do reset, nao sair logado

Status: acatar forte.

PG esta certo. Depois de salvar nova senha, o fluxo vai para `success`, mostra "Tudo certo" e redireciona para `/inicio` em 3 segundos. Isso esta em `components/auth/screens/SuccessScreen.tsx`.

OWASP recomenda que, depois de redefinir senha, o usuario volte ao mecanismo normal de login e nao seja automaticamente logado. Tambem recomenda tratar invalidacao de sessoes antigas. Para a Aswork isso e ainda mais importante porque login normal pode passar por politica de org, SSO e 2FA.

Minha recomendacao: separar sucesso de login normal e sucesso de reset. Login normal pode ter auto-redirect. Reset deve terminar em "Senha redefinida" com CTA "Ir para o login", derrubando sessoes antigas no backend.

## 5. Pontos cosmeticos

Status: em grande parte acatar.

Confirmados por navegacao/codigo:

- Subtitulo inicial diz "e-mail corporativo", mas o fluxo aceita e-mails pessoais e usa HRD por dominio.
- "Voltar ao login" na verificacao volta para a tela de senha em alguns contextos.
- Validador de senha vazia esta em ingles.
- Campos de codigo aparecem como seis textboxes sem nome acessivel individual.
- Botao mostrar/ocultar senha tem `aria-label`, mas nao tem `aria-pressed`.
- Tela de SSO nao tem acao de cancelar/voltar nem texto "nao feche esta janela".
- Tela MFA verify nao tem checkbox "confiar neste dispositivo".
- Setup de 2FA nao tem "gerar novo QR code".
- Backup codes usa codigos com cara real, sem prefixo `DEMO-`.
- Banner dos backup codes fala que sem app/codigos o usuario perde acesso, mas nao diz que aqueles codigos so aparecem uma vez.
- Card de org mostra nome e membros/status, mas nao mostra funcao do usuario.
- Card "Aswork Labs - Nao configurada - Configurar" aparece no seletor, o que mistura estado de contratacao/setup dentro de autenticacao.

Reconhecimentos do PG que conferem:

- Erro inline e melhor do que tela separada, embora o estado ainda precise ser realmente alcancavel e generico.
- E-mail e preservado entre login e senha quando o caminho e navegacional, nao deep link.
- Barra de forca existe e e guiada por comprimento.
- Confirmacao de senha valida igualdade.
- Countdown de reenvio existe.
- Colar 6 digitos preenche o campo de codigo.
- Checkbox dos backup codes trava o botao.
- SSO nao deve receber duplo desafio automaticamente.

## 6. Onde eu ajustaria ou refutaria o PG

1. "Recuperacao por link, nao por codigo" e uma decisao valida de produto/provedor, mas nao uma verdade absoluta de seguranca. OWASP lista URL tokens e PINs como metodos possiveis. O problema real do desenho atual e: mensagem afirmativa, mistura de copy "link" com fluxo "codigo", e auto-login apos reset.

2. "Codigo por e-mail depois da senha nao conta como segundo fator" esta correto se alguem chamar isso de MFA/AAL2. Mas pedir codigo por e-mail depois da senha nao e automaticamente errado como step-up ou verificacao de risco. O ponto contra ele e friccao e falsa sensacao de 2FA, nao uma proibicao geral.

3. "Maximo 64 por NIST" precisa ser reescrito. NIST diz permitir pelo menos 64; rejeitar acima de 64 e politica local razoavel para evitar custo/abuso, mas nao exigencia literal da norma.

4. O teste de `password123!` no prototipo nao prova ausencia de protecao backend. Prova, sim, que o hi-fi nao especifica o estado prometido pela copy.

5. O reconhecimento "SSO sem desafio duplo" precisa da versao do Cap. 3: sem desafio duplo so quando a org delegou MFA ao IdP. O codigo atual pula MFA para qualquer `authMethod === "sso"`, o que e amplo demais para seguranca real.

## Prioridade sugerida

1. Separar final de reset do final de login normal: sem auto-login apos reset.
2. Neutralizar recuperacao e erro de credencial, com copy generica e em PT-BR.
3. Tornar erro de credencial invalida alcancavel no hi-fi.
4. Filtrar organizacoes por metodo e criar tela "sem acesso por este metodo".
5. Resolver politica de senha: blocklist/estado de senha vazada, limite conforme spec e copy normativa precisa.
6. Ligar magic link de ponta a ponta.
7. Passar pelos cosmeticos de a11y, microcopy e fixtures.

## Conclusao

Eu acataria o doc do PG como direcao de correcao, mas revisaria a linguagem de seguranca para nao transformar decisoes de produto em "a norma exige". O nucleo esta certo: o fluxo atual, como referencia para dev, ainda induz implementacao insegura em reset, resposta uniforme e compatibilidade de metodo por organizacao.
