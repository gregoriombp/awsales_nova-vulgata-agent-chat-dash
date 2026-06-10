# Ajustes do login a partir da revisao PG

Data: 2026-06-10  
Escopo: hi-fi e UX flow do login em `/awsales/login` e `/bombardier/styleguide/ux-flows/login-auth`

Este arquivo e uma lista operacional de onde mudar e o que mudar. O parecer argumentativo esta em `docs/revisao-login-pg-parecer.md`.

## Prioridade 1

### 1. Separar sucesso de reset do sucesso de login

Onde mudar:

- `components/auth/AuthFlow.tsx`
- `components/auth/screens/ResetScreen.tsx`
- `components/auth/screens/SuccessScreen.tsx`
- criar nova tela, por exemplo `components/auth/screens/ResetSuccessScreen.tsx`
- `components/auth/_types.ts`
- `components/auth/_copy.ts`
- `app/bombardier/styleguide/ux-flows/login-auth/page.tsx`

O que mudar:

- Criar um screen separado para fim de reset, por exemplo `resetSuccess`.
- Em `ResetScreen`, trocar `goTo("success")` por `goTo("resetSuccess")`.
- A tela `resetSuccess` deve dizer "Senha redefinida" e ter um unico CTA "Ir para o login".
- Nao redirecionar para `/inicio` depois do reset.
- Manter `SuccessScreen` apenas para login bem-sucedido, se o produto quiser auto-redirect no login normal.
- No flow, trocar o final da recuperacao para `Senha redefinida -> Ir para login`.
- Backend futuro: invalidar sessoes antigas ao salvar nova senha.

## Prioridade 2

### 2. Neutralizar recuperacao de senha contra enumeracao

Onde mudar:

- `components/auth/screens/ForgotScreen.tsx`
- `components/auth/_copy.ts`
- `components/auth/screens/VerifyScreen.tsx`
- `app/bombardier/styleguide/ux-flows/login-auth/page.tsx`

O que mudar:

- Apos enviar o formulario de recuperacao, nao mostrar mensagem afirmativa do tipo "Enviamos um codigo para pessoa@example.test" como resposta publica.
- Usar copy neutra: "Se existir uma conta com este e-mail, enviaremos as instrucoes."
- Se a decisao final for reset por link: criar tela de confirmacao de envio e nao reaproveitar `VerifyScreen`.
- Se a decisao final for reset por codigo: manter codigo, mas com resposta publica neutra, rate limit, expiracao curta e sem confirmar existencia de conta.
- Alinhar a copy: hoje `forgot.sub` e `forgot.cta` falam em link, mas o fluxo manda para codigo.

### 3. Tornar erro de credencial invalida alcancavel e generico

Onde mudar:

- `components/auth/screens/EmailLoginScreen.tsx`
- `lib/validations.ts`
- `components/auth/_copy.ts`
- `app/bombardier/styleguide/ux-flows/login-auth/page.tsx`

O que mudar:

- Simular ou representar um estado real de erro de credencial invalida no hi-fi.
- Trocar mensagem vazia em ingles (`Password is required`) por PT-BR.
- Usar erro generico: "E-mail ou senha incorretos." Evitar "senha incorreta" isolado, porque confirma que o e-mail existe.
- O botao de submit nao deve sempre seguir para `verify`; precisa existir caminho visual para erro.
- No flow, manter erro inline na tela de senha, nao tela separada.

### 4. Filtrar organizacoes por metodo de login

Onde mudar:

- `components/auth/screens/WorkspaceScreen.tsx`
- `components/auth/_copy.ts`
- `components/auth/_types.ts`
- `components/auth/AuthFlow.tsx`
- criar tela, por exemplo `components/auth/screens/NoAccessForMethodScreen.tsx`
- `app/bombardier/styleguide/ux-flows/login-auth/page.tsx`

O que mudar:

- Trocar `ORGS[locale]` fixo por lista derivada do metodo atual (`password`, `social`, `sso`) e das politicas da org.
- Se nenhuma organizacao for compativel, mostrar tela "Sem acesso por este metodo".
- A tela nao deve listar quais organizacoes existem; deve orientar a tentar o e-mail corporativo, SSO ou falar com admin.
- Evitar mostrar orgs que exigem metodo incompatível.
- Remover do seletor estados internos como "Nao configurada - Configurar" quando isso expuser contratacao/setup para quem so esta autenticando.

## Prioridade 3

### 5. Ajustar politica de senha no reset

Onde mudar:

- `lib/validations.ts`
- `lib/password-policy.ts`
- `components/auth/screens/ResetScreen.tsx`
- `components/auth/_copy.ts`
- `app/bombardier/styleguide/ux-flows/login-auth/page.tsx`

O que mudar:

- Adicionar estado visual para senha bloqueada por blocklist/senha vazada.
- Se a spec mantiver maximo 64, adicionar `.max(64, "...")` no schema e desenhar o erro.
- Manter sem regra de complexidade.
- Manter frases com espacos aceitas.
- Revisar a copy normativa: NIST recomenda permitir pelo menos 64 caracteres; nao escrever como se rejeitar 65+ fosse exigencia literal da norma.
- Definir se o minimo segue 10 por decisao Aswork ou se sera reavaliado conforme NIST SP 800-63B-4.

### 6. Ligar magic link de ponta a ponta

Onde mudar:

- `components/auth/screens/LoginScreen.tsx`
- `components/auth/screens/EmailLoginScreen.tsx`
- `components/auth/screens/MagicSentScreen.tsx`
- `components/auth/_copy.ts`
- `app/bombardier/styleguide/ux-flows/login-auth/page.tsx`

O que mudar:

- Adicionar uma entrada visivel para magic link.
- Decidir se ela fica na tela inicial abaixo do separador ou na tela de senha como alternativa.
- Ao clicar, navegar para `magicSent` com o e-mail real preservado.
- Se a acao puder ser disparada sem e-mail previo, criar tela de pedido de e-mail.
- Confirmacao deve usar resposta neutra: "Se o e-mail puder acessar, enviaremos um link."
- No flow, desenhar entrada, pedido/confirmacao e destino apos clicar no link.

## Prioridade 4

### 7. Corrigir microcopy de entrada

Onde mudar:

- `components/auth/_copy.ts`
- `components/auth/screens/LoginScreen.tsx`

O que mudar:

- Trocar "Entre com seu e-mail corporativo" por texto universal.
- Sugestao: "Entre com seu e-mail para continuar."
- Trocar placeholders `voce@empresa.com` por dominio de exemplo reservado, se a decisao de fixture for evitar dominios reais.

### 8. Corrigir destinos dos botoes de voltar/trocar e-mail

Onde mudar:

- `components/auth/screens/VerifyScreen.tsx`
- `components/auth/screens/MagicSentScreen.tsx`
- `components/auth/screens/ForgotScreen.tsx`
- `components/auth/_copy.ts`

O que mudar:

- Label deve bater com destino real.
- Se o botao volta para senha, chamar "Voltar para senha" ou "Voltar".
- Se chama "Voltar ao login", deve navegar para `login`.
- Em `VerifyScreen`, revisar `BackButton` e `Usar outro e-mail` para os modos `login` e `reset`.

### 9. Melhorar acessibilidade dos campos de codigo

Onde mudar:

- `components/auth/screens/VerifyScreen.tsx`
- `components/auth/screens/MfaVerifyScreen.tsx`
- `components/auth/screens/MfaSetupAppScreen.tsx`
- possivel extracao para um componente `components/auth/CodeInput.tsx`

O que mudar:

- Adicionar `aria-label` individual: "Digito 1 de 6", "Digito 2 de 6" etc.
- Manter paste inteligente.
- Garantir que leitor de tela entenda o grupo como codigo de verificacao.

### 10. Completar estado do botao mostrar senha

Onde mudar:

- `components/auth/_atoms.tsx`

O que mudar:

- Adicionar `aria-pressed={show}` no botao mostrar/ocultar senha.
- Manter `aria-label` alternando entre "Mostrar senha" e "Ocultar senha".

### 11. Completar tela de SSO

Onde mudar:

- `components/auth/screens/SsoConnectingScreen.tsx`
- `components/auth/_copy.ts`

O que mudar:

- Adicionar aviso "Nao feche esta janela".
- Adicionar acao secundaria "Cancelar" ou "Voltar".
- Se houver callback OAuth/SSO separado no flow, desenhar tambem um estado de retorno.

### 12. Ajustar 2FA/MFA

Onde mudar:

- `components/auth/screens/MfaVerifyScreen.tsx`
- `components/auth/screens/MfaSetupAppScreen.tsx`
- `components/auth/screens/MfaBackupCodesScreen.tsx`
- `components/auth/_copy.ts`
- `components/auth/AuthFlow.tsx`
- `app/bombardier/styleguide/ux-flows/login-auth/page.tsx`

O que mudar:

- Adicionar checkbox "Confiar neste dispositivo por 30 dias" no desafio 2FA, se a spec mantiver esse requisito.
- Adicionar acao "Gerar novo QR code" no setup de app autenticador.
- No SSO, nao pular MFA de forma global so por `authMethod === "sso"`. Pular apenas quando a organizacao delega MFA ao IdP e essa politica estiver configurada.
- No flow, explicitar a regra de delegacao.

### 13. Ajustar backup codes

Onde mudar:

- `components/auth/screens/MfaBackupCodesScreen.tsx`
- `components/auth/_copy.ts`
- `components/ui/AwBackupCodes.tsx` se a copy do warning vier do componente

O que mudar:

- Trocar fixtures para prefixo `DEMO-` ou outro marcador inequivoco.
- Banner deve dizer que os codigos so serao exibidos uma vez.
- Manter checkbox obrigatorio antes de concluir.
- Manter acoes copiar/baixar.

### 14. Ajustar card de organizacao

Onde mudar:

- `components/auth/screens/WorkspaceScreen.tsx`
- `components/auth/_copy.ts`
- `components/auth/_types.ts`

O que mudar:

- Mostrar funcao do usuario no card, por exemplo "12 membros - admin".
- Remover ou isolar estado "Nao configurada" do seletor de autenticacao, conforme decisao de produto.
- Se organizacao adicional continuar aparecendo, tratar como jornada pos-login, nao como org selecionavel comum.

## Atualizacao do UX flow

Onde mudar:

- `app/bombardier/styleguide/ux-flows/login-auth/page.tsx`
- se aplicavel, `app/bombardier/styleguide/ux-flows/poc-visao-global/page.tsx`

O que mudar:

- Remover ou ajustar verificacao por e-mail obrigatoria apos senha, conforme decisao final.
- Se mantiver codigo por e-mail, nao chamar de MFA forte.
- Adicionar reset por link ou corrigir explicitamente reset por codigo.
- Adicionar tela final de reset sem auto-login.
- Adicionar filtro por metodo e tela "sem acesso por este metodo".
- Adicionar regra de SSO: so pula 2FA quando a org delega MFA ao provedor.
- Adicionar magic link como caminho completo.

## Ordem sugerida de implementacao

1. `resetSuccess` sem auto-login.
2. Recuperacao neutra e erro generico de credencial.
3. Estado de erro de senha alcancavel.
4. Filtragem de organizacoes por metodo + tela sem acesso.
5. Politica de senha: blocklist visual + limite conforme spec.
6. Magic link completo.
7. A11y/microcopy/fixtures.
8. Sincronizar `login-auth` e `poc-visao-global`.
