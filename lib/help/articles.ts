/**
 * Catálogo da Ajuda rápida.
 *
 * Cada artigo é uma peça de documentação in-app que o AwHelpDrawer abre
 * empurrando o conteúdo pro lado (comportamento Cortex). A ideia é que
 * qualquer "saiba mais" / "entender" no produto aponte pra um artigo daqui,
 * em vez de mandar o usuário pra outra página ou pra um drawer solto.
 *
 * Blocos são deliberadamente simples (parágrafo, subtítulo, lista, callout)
 * pra manter o conteúdo declarativo e fácil de revisar — sem HTML solto.
 */

export type HelpBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "callout"; icon?: string; text: string };

export type HelpArticle = {
  id: string;
  /** Título grande no topo do artigo. */
  title: string;
  /** Uma linha — aparece na busca e como resumo. */
  summary: string;
  /** Termos extras pra busca casar (sinônimos, jargão). */
  keywords?: string[];
  blocks: HelpBlock[];
  /** Outros artigos relacionados — viram "Saiba mais" no rodapé. */
  related?: string[];
};

export const HELP_ARTICLES: Record<string, HelpArticle> = {
  "exclusao-de-dados-privacidade": {
    id: "exclusao-de-dados-privacidade",
    title: "Como funciona a exclusão de dados e privacidade",
    summary:
      "Por que a exclusão da conta não é feita direto por você e como pedir.",
    keywords: [
      "excluir conta",
      "apagar dados",
      "deletar",
      "privacidade",
      "lgpd",
      "exclusão",
      "remover conta",
    ],
    blocks: [
      {
        kind: "p",
        text: "A exclusão de uma conta é permanente e não pode ser desfeita. Por isso ela não acontece com um clique seu — passa por uma verificação antes de ser executada.",
      },
      {
        kind: "h",
        text: "Por que você não exclui sozinho",
      },
      {
        kind: "p",
        text: "Seus dados vivem dentro de uma organização. Conversas, agentes e histórico costumam envolver mais gente do que só você, e apagar tudo de forma automática poderia remover registros de que a equipe ainda depende.",
      },
      {
        kind: "ul",
        items: [
          "Parte do conteúdo pertence à organização, não só a você.",
          "Algumas informações precisam ser guardadas por um tempo por obrigação legal ou fiscal.",
          "A exclusão é irreversível — uma etapa de verificação evita perdas por engano.",
        ],
      },
      {
        kind: "h",
        text: "Como solicitar a exclusão",
      },
      {
        kind: "p",
        text: "Fale com o administrador da sua organização ou escreva para suporte@awsales.io. Confirmamos sua identidade, explicamos o que será apagado e o que precisa ser retido, e conduzimos o processo com você.",
      },
      {
        kind: "callout",
        icon: "schedule",
        text: "Depois de confirmada, a exclusão pode levar até 30 dias para se propagar por todos os sistemas.",
      },
      {
        kind: "h",
        text: "Prefere só levar seus dados?",
      },
      {
        kind: "p",
        text: "Se o que você quer é uma cópia — e não apagar tudo — use a exportação em “Baixar uma cópia” aqui mesmo nesta página. Ela reúne seus dados sem encerrar a conta.",
      },
    ],
    related: ["exportar-seus-dados", "quem-ve-seus-dados"],
  },

  "exportar-seus-dados": {
    id: "exportar-seus-dados",
    title: "Exportar uma cópia dos seus dados",
    summary: "O que entra na exportação, quanto tempo leva e quem recebe.",
    keywords: ["exportar", "baixar", "cópia", "download", "portabilidade"],
    blocks: [
      {
        kind: "p",
        text: "A exportação reúne uma cópia dos seus dados — perfil, interações, uso e analytics — em um arquivo só para você consultar.",
      },
      {
        kind: "ul",
        items: [
          "Você pede a exportação e avisamos por e-mail quando o arquivo fica pronto.",
          "Costuma levar até 24 horas, dependendo do volume.",
          "Só você recebe o link, e ele é separado das configurações da organização.",
        ],
      },
      {
        kind: "callout",
        icon: "info",
        text: "Enviar a cópia direto para outro serviço ainda não é possível — depende de regras que a ANPD precisa publicar.",
      },
    ],
    related: ["exclusao-de-dados-privacidade"],
  },

  "quem-ve-seus-dados": {
    id: "quem-ve-seus-dados",
    title: "Quem vê seus dados na organização",
    summary: "Como o acesso é dividido entre você, a equipe e os administradores.",
    keywords: ["acesso", "permissão", "privacidade", "administrador", "equipe"],
    blocks: [
      {
        kind: "p",
        text: "Seus dados pessoais de conta ficam separados das configurações da organização. Nem tudo que você faz é visível para todo mundo.",
      },
      {
        kind: "ul",
        items: [
          "Administradores da organização gerenciam acessos e podem ver registros de uso agregados.",
          "Colegas de equipe veem apenas o conteúdo que vocês compartilham em projetos comuns.",
          "Cadastro e preferências pessoais continuam sob seu controle.",
        ],
      },
    ],
    related: ["exclusao-de-dados-privacidade", "exportar-seus-dados"],
  },
};

export function getHelpArticle(id: string | null): HelpArticle | null {
  if (!id) return null;
  return HELP_ARTICLES[id] ?? null;
}

/** Busca simples por título, resumo e keywords. Vazio → catálogo inteiro. */
export function searchHelpArticles(query: string): HelpArticle[] {
  const all = Object.values(HELP_ARTICLES);
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((a) => {
    const haystack = [a.title, a.summary, ...(a.keywords ?? [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
