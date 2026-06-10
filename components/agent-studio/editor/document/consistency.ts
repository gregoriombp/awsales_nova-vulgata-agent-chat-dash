import {
  checkpointTexts,
  extractMentionIds,
  parseTokenSegments,
  stripVariableBraces,
} from "@/components/agent-studio/editor/checkpointTokens";
import type {
  AgentVariable,
  Checkpoint,
  HabilidadeConfigurada,
} from "@/lib/agentStudio";

/**
 * Verificação de consistência do documento de checkpoints — roda quando o
 * usuário clica em Salvar, antes da confirmação.
 *
 * No protótipo os checks são determinísticos (resolvem menções, variáveis,
 * regras e estrutura de verdade); a apresentação é o gesto de IA do produto.
 */

export type ConsistencyCheck = {
  id: string;
  status: "ok" | "warn";
  titulo: string;
  detalhe?: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function runConsistencyChecks({
  checkpoints,
  habilidades,
  variaveis,
}: {
  checkpoints: Checkpoint[];
  habilidades: HabilidadeConfigurada[];
  variaveis: AgentVariable[];
}): ConsistencyCheck[] {
  const checks: ConsistencyCheck[] = [];
  const allTexts = checkpoints.flatMap(checkpointTexts);

  /* 1 · Estrutura: título + objetivo + instruções em cada checkpoint. */
  const incompletos = checkpoints.filter(
    (cp) => !cp.titulo.trim() || !cp.objetivo.trim() || !cp.corpo.trim(),
  );
  checks.push(
    incompletos.length === 0
      ? {
          id: "estrutura",
          status: "ok",
          titulo: "Todos os checkpoints têm título, objetivo e instruções",
        }
      : {
          id: "estrutura",
          status: "warn",
          titulo: `${incompletos.length === 1 ? "Checkpoint incompleto" : "Checkpoints incompletos"}: ${incompletos
            .map((cp) => pad(cp.numero))
            .join(", ")}`,
          detalhe: "Título, objetivo e instruções orientam o agente em cada etapa.",
        },
  );

  /* 2 · Menções @ resolvem no catálogo conectado. */
  const ids = extractMentionIds(allTexts);
  const conhecidas = new Set(habilidades.map((h) => h.id));
  const desconhecidas = ids.filter((id) => !conhecidas.has(id));
  checks.push(
    desconhecidas.length === 0
      ? {
          id: "tools",
          status: "ok",
          titulo: `${ids.length} ${ids.length === 1 ? "tool mencionada está conectada" : "tools mencionadas estão conectadas"}`,
        }
      : {
          id: "tools",
          status: "warn",
          titulo: `${desconhecidas.length === 1 ? "Tool não conectada" : "Tools não conectadas"}: ${desconhecidas
            .map((id) => `@${id}`)
            .join(", ")}`,
          detalhe: "Conecte a integração ou remova a menção antes de publicar.",
        },
  );

  /* 3 · Variáveis usadas existem. */
  const usadas = new Set<string>();
  for (const text of allTexts) {
    for (const seg of parseTokenSegments(text)) {
      if (seg.type === "variable") usadas.add(seg.name);
    }
  }
  const definidas = new Set(
    variaveis.map((v) => stripVariableBraces(v.nome)),
  );
  const indefinidas = [...usadas].filter((nome) => !definidas.has(nome));
  checks.push(
    indefinidas.length === 0
      ? {
          id: "variaveis",
          status: "ok",
          titulo: "Todas as variáveis usadas estão definidas",
        }
      : {
          id: "variaveis",
          status: "warn",
          titulo: `${indefinidas.length === 1 ? "Variável indefinida" : "Variáveis indefinidas"}: ${indefinidas
            .map((v) => `{{${v}}}`)
            .join(", ")}`,
          detalhe: "Variáveis sem valor chegam vazias na conversa.",
        },
  );

  /* 4 · Regras completas (condição + ação). */
  const regrasIncompletas = checkpoints.flatMap((cp) =>
    (cp.regras ?? [])
      .filter((r) => !r.se.trim() || !r.entao.trim())
      .map(() => cp.numero),
  );
  checks.push(
    regrasIncompletas.length === 0
      ? {
          id: "regras",
          status: "ok",
          titulo: "Regras com condição e ação definidas",
        }
      : {
          id: "regras",
          status: "warn",
          titulo: `Regra incompleta no checkpoint ${[...new Set(regrasIncompletas)]
            .map(pad)
            .join(", ")}`,
          detalhe: "Toda regra precisa de uma condição e de uma ação.",
        },
  );

  /* 5 · Marcações com pelo menos duas opções. */
  const marcacoesRasas = checkpoints.filter(
    (cp) => cp.marque && cp.marque.opcoes.filter((o) => o.texto.trim()).length < 2,
  );
  checks.push(
    marcacoesRasas.length === 0
      ? {
          id: "marcacoes",
          status: "ok",
          titulo: "Marcações com opções suficientes para classificar",
        }
      : {
          id: "marcacoes",
          status: "warn",
          titulo: `Marcação com menos de 2 opções no checkpoint ${marcacoesRasas
            .map((cp) => pad(cp.numero))
            .join(", ")}`,
          detalhe: "Com uma opção só, a classificação não diferencia respostas.",
        },
  );

  /* 6 · O fluxo tem caminho de encerramento. */
  const temEncerramento = allTexts.some(
    (t) =>
      t.includes("agent.handoffToHuman") ||
      t.includes("flow.endConversation") ||
      /fechamento/i.test(t),
  );
  checks.push(
    temEncerramento
      ? {
          id: "encerramento",
          status: "ok",
          titulo: "O fluxo tem caminho de encerramento",
          detalhe:
            "Transferência, encerramento ou fechamento aparecem nas instruções.",
        }
      : {
          id: "encerramento",
          status: "warn",
          titulo: "Nenhum caminho de encerramento explícito",
          detalhe:
            "Considere transferir para humano ou encerrar a conversa em algum ponto.",
        },
  );

  return checks;
}
